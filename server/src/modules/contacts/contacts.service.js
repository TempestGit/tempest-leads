
import pool from "../../config/db.js";

import ApiError from "../../utils/ApiError.js";

import generateContactCode from "../../utils/contactCode.js";

import {
  createAuditLog,
} from "../../services/audit.service.js";

import {
  canUserAccessCompany,
  findCompanyById,
} from "../companies/companies.repository.js";

import {
  canUserAccessContact,
  createContact,
  deleteContact,
  findContactById,
  listContacts,
  updateContact,
  updateContactCode,
} from "./contacts.repository.js";

/*
|--------------------------------------------------------------------------
| List Contacts
|--------------------------------------------------------------------------
*/

export const getContactsService = async (
  filters,
  currentUser
) => {
  const { rows, total } = await listContacts({
    ...filters,
    userId: currentUser.id,
    role: currentUser.role,
  });

  const totalPages =
    total === 0
      ? 0
      : Math.ceil(total / filters.limit);

  return {
    contacts: rows,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages,
    },
  };
};

/*
|--------------------------------------------------------------------------
| Get Contact
|--------------------------------------------------------------------------
*/

export const getContactService = async (
  contactId,
  currentUser
) => {
  const contact = await findContactById(contactId);

  const allowed =
    contact &&
    (await canUserAccessContact({
      contactId,
      userId: currentUser?.id,
      role: currentUser?.role,
    }));

  if (!contact || !allowed) {
    throw new ApiError(
      404,
      "Contact not found.",
      [],
      "CONTACT_NOT_FOUND"
    );
  }

  return contact;
};

/*
|--------------------------------------------------------------------------
| Create Contact
|--------------------------------------------------------------------------
*/

export const createContactService = async ({
  data,
  userId,
  currentUser,
  ipAddress,
  userAgent,
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Verify Company
    |--------------------------------------------------------------------------
    */

    const company = await findCompanyById(
      data.companyId,
      connection
    );

    if (
      !company ||
      !(await canUserAccessCompany(
        {
          companyId: data.companyId,
          userId,
          role: currentUser?.role,
        },
        connection
      ))
    ) {
      throw new ApiError(
        404,
        "Selected company was not found.",
        [],
        "COMPANY_NOT_FOUND"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Create Contact
    |--------------------------------------------------------------------------
    */

    const contactId = await createContact(
      {
        ...data,
        userId,
      },
      connection
    );

    /*
    |--------------------------------------------------------------------------
    | Generate Contact Code
    |--------------------------------------------------------------------------
    */

    const contactCode =
      generateContactCode(contactId);

    const codeUpdated = await updateContactCode(
      contactId,
      contactCode,
      connection
    );

    if (!codeUpdated) {
      throw new ApiError(
        500,
        "Unable to generate contact code.",
        [],
        "CONTACT_CODE_GENERATION_FAILED"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Reload Contact
    |--------------------------------------------------------------------------
    */

    const contact = await findContactById(
      contactId,
      connection
    );

    if (!contact) {
      throw new ApiError(
        500,
        "Contact was created but could not be loaded.",
        [],
        "CONTACT_CREATED_BUT_NOT_LOADED"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Audit
    |--------------------------------------------------------------------------
    */

    await createAuditLog({
      actorUserId: userId,
      entityType: "CONTACT",
      entityId: contactId,
      action: "CONTACT_CREATED",
      previousValues: null,
      newValues: contact,
      metadata: {
        contactCode,
        companyId: data.companyId,
      },
      ipAddress,
      userAgent,
      connection,
    });

    await connection.commit();

    return contact;
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Ignore rollback error.
    }

    throw error;
  } finally {
    connection.release();
  }
};

/*
|--------------------------------------------------------------------------
| Update Contact
|--------------------------------------------------------------------------
*/

export const updateContactService = async ({
  contactId,
  data,
  userId,
  currentUser,
  ipAddress,
  userAgent,
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Existing Contact
    |--------------------------------------------------------------------------
    */

    const existing = await findContactById(
      contactId,
      connection
    );

    if (
      !existing ||
      !(await canUserAccessContact(
        {
          contactId,
          userId,
          role: currentUser?.role,
        },
        connection
      ))
    ) {
      throw new ApiError(
        404,
        "Contact not found.",
        [],
        "CONTACT_NOT_FOUND"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Company If Changed
    |--------------------------------------------------------------------------
    */

    if (data.companyId !== undefined) {
      const company = await findCompanyById(
        data.companyId,
        connection
      );

      if (
        !company ||
        !(await canUserAccessCompany(
          {
            companyId: data.companyId,
            userId,
            role: currentUser?.role,
          },
          connection
        ))
      ) {
        throw new ApiError(
          404,
          "Selected company was not found.",
          [],
          "COMPANY_NOT_FOUND"
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Update Contact
    |--------------------------------------------------------------------------
    */

    await updateContact(
      contactId,
      data,
      userId,
      connection
    );

    const updated = await findContactById(
      contactId,
      connection
    );

    if (!updated) {
      throw new ApiError(
        500,
        "Contact was updated but could not be loaded.",
        [],
        "CONTACT_UPDATED_BUT_NOT_LOADED"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Audit
    |--------------------------------------------------------------------------
    */

    await createAuditLog({
      actorUserId: userId,
      entityType: "CONTACT",
      entityId: contactId,
      action: "CONTACT_UPDATED",
      previousValues: existing,
      newValues: updated,
      metadata: {
        changedFields: Object.keys(data),
      },
      ipAddress,
      userAgent,
      connection,
    });

    await connection.commit();

    return updated;
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Ignore rollback error.
    }

    throw error;
  } finally {
    connection.release();
  }
};

/*
|--------------------------------------------------------------------------
| Delete Contact (Soft Delete)
|--------------------------------------------------------------------------
*/

export const deleteContactService = async ({
  contactId,
  userId,
  currentUser,
  ipAddress,
  userAgent,
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Existing Contact
    |--------------------------------------------------------------------------
    */

    const existing = await findContactById(
      contactId,
      connection
    );

    if (
      !existing ||
      !(await canUserAccessContact(
        {
          contactId,
          userId,
          role: currentUser?.role,
        },
        connection
      ))
    ) {
      throw new ApiError(
        404,
        "Contact not found.",
        [],
        "CONTACT_NOT_FOUND"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Soft Delete
    |--------------------------------------------------------------------------
    */

    const deleted = await deleteContact(
      contactId,
      userId,
      connection
    );

    if (!deleted) {
      throw new ApiError(
        404,
        "Contact not found.",
        [],
        "CONTACT_NOT_FOUND"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Audit
    |--------------------------------------------------------------------------
    */

    await createAuditLog({
      actorUserId: userId,
      entityType: "CONTACT",
      entityId: contactId,
      action: "CONTACT_DELETED",
      previousValues: existing,
      newValues: null,
      metadata: {
        companyId: existing.companyId,
        contactCode: existing.contactCode,
      },
      ipAddress,
      userAgent,
      connection,
    });

    await connection.commit();

    return {
      contactId,
      deleted: true,
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Ignore rollback error.
    }

    throw error;
  } finally {
    connection.release();
  }
};
