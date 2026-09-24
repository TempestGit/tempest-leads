import pool from "../../config/db.js";

import ApiError from "../../utils/ApiError.js";

import generateCompanyCode from "../../utils/companyCode.js";
import generateContactCode from "../../utils/contactCode.js";
import generateLeadCode from "../../utils/leadCode.js";
import generatePublicId from "../../utils/publicId.js";

import {
  createAuditLog,
} from "../../services/audit.service.js";

import {
  findCompanyById,
} from "../companies/companies.repository.js";

import {
  changeLeadOwner,
  changeLeadStage,
  createLead,
  createLeadActivity,
  createLeadFollowup,
  createLeadStageHistory,
  findActiveOwnerById,
  findContactForCompany,
  findLeadById,
  listActiveLeadOwners,
  listLeads,
  reassignPendingFollowups,
  updateLeadCode,
  updateLeadDetails,
} from "./leads.repository.js";

/*
|--------------------------------------------------------------------------
| Money Helper
|--------------------------------------------------------------------------
*/

const rupeesToPaise = (
  rupees
) => {
  const amount =
    Number(rupees || 0);

  const paise =
    Math.round(
      amount * 100
    );

  if (
    !Number.isSafeInteger(
      paise
    ) ||
    paise < 0
  ) {
    throw new ApiError(
      422,
      "Opportunity value is invalid.",
      [],
      "INVALID_OPPORTUNITY_VALUE"
    );
  }

  return paise;
};

/*
|--------------------------------------------------------------------------
| Lead Form Options
|--------------------------------------------------------------------------
*/

export const getLeadOptionsService = async (
  currentUser
) => {
  const owners =
    await listActiveLeadOwners(
      currentUser
    );

  return {
    owners,
  };
};

/*
|--------------------------------------------------------------------------
| List Leads
|--------------------------------------------------------------------------
*/

export const getLeadsService =
  async (
    filters,
    currentUser
  ) => {
    const {
      rows,
      total,
    } =
      await listLeads({
        ...filters,
        currentUser,
      });

    return {
      leads: rows,

      pagination: {
        page:
          filters.page,

        limit:
          filters.limit,

        total,

        totalPages:
          total === 0
            ? 0
            : Math.ceil(
                total /
                  filters.limit
              ),
      },
    };
  };

/*
|--------------------------------------------------------------------------
| Get Lead
|--------------------------------------------------------------------------
*/

export const getLeadService =
  async (
    leadId,
    currentUser
  ) => {
    const lead =
      await findLeadById(
        leadId,
        currentUser
      );

    if (!lead) {
      throw new ApiError(
        404,
        "Lead not found.",
        [],
        "LEAD_NOT_FOUND"
      );
    }

    return lead;
  };

/*
|--------------------------------------------------------------------------
| Validate Relationships
|--------------------------------------------------------------------------
*/

const validateLeadRelationships =
  async ({
    companyId,
    primaryContactId,
    ownerId,
    currentUser,
    connection,
  }) => {
    /*
    |--------------------------------------------------------------------------
    | Company
    |--------------------------------------------------------------------------
    */

    const company =
      await findCompanyById(
        companyId,
        connection
      );

    if (!company) {
      throw new ApiError(
        404,
        "Selected company was not found.",
        [],
        "COMPANY_NOT_FOUND"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Contact
    |--------------------------------------------------------------------------
    */

    const contact =
      await findContactForCompany(
        primaryContactId,
        companyId,
        connection
      );

    if (!contact) {
      throw new ApiError(
        422,
        "The selected contact does not belong to the selected company.",
        [],
        "CONTACT_COMPANY_MISMATCH"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Owner
    |--------------------------------------------------------------------------
    */

    const owner =
      await findActiveOwnerById(
        ownerId,
        connection
      );

    if (!owner) {
      throw new ApiError(
        422,
        "Selected owner is not active.",
        [],
        "OWNER_NOT_AVAILABLE"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | OWNER Users Can Assign Only To Themselves
    |--------------------------------------------------------------------------
    */

    if (
      currentUser.role !==
        "SUPER_ADMIN" &&
      Number(ownerId) !==
        Number(
          currentUser.id
        )
    ) {
      throw new ApiError(
        403,
        "You can only create leads assigned to yourself.",
        [],
        "LEAD_OWNER_FORBIDDEN"
      );
    }

    return {
      company,
      contact,
      owner,
    };
  };

/*
|--------------------------------------------------------------------------
| Create Lead
|--------------------------------------------------------------------------
*/

export const createLeadService = async ({
  data,
  currentUser,
  ipAddress,
  userAgent,
}) => {
  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Owner
    |--------------------------------------------------------------------------
    */

    const owner =
      await findActiveOwnerById(
        data.ownerId,
        connection
      );

    if (!owner) {
      throw new ApiError(
        422,
        "Selected owner is not active.",
        [],
        "OWNER_NOT_AVAILABLE"
      );
    }

    if (
      currentUser.role !==
        "SUPER_ADMIN" &&
      Number(data.ownerId) !==
        Number(currentUser.id)
    ) {
      throw new ApiError(
        403,
        "You can only assign a lead to yourself.",
        [],
        "LEAD_OWNER_FORBIDDEN"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find Existing Company By Name
    |--------------------------------------------------------------------------
    */

    const [companyRows] =
      await connection.query(
        `
          SELECT
            id,
            company_code AS companyCode,
            name

          FROM companies

          WHERE
            LOWER(TRIM(name)) =
              LOWER(TRIM(?))
            AND deleted_at IS NULL

          LIMIT 1
        `,
        [
          data.company.name,
        ]
      );

    let companyId;
    let companyCode;

    /*
    |--------------------------------------------------------------------------
    | Existing Company
    |--------------------------------------------------------------------------
    */

    if (companyRows.length) {
      companyId =
        Number(
          companyRows[0].id
        );

      companyCode =
        companyRows[0]
          .companyCode;
    } else {
      /*
      |--------------------------------------------------------------------------
      | Create Company
      |--------------------------------------------------------------------------
      */

      const temporaryCode =
        `TEMP-CMP-${Date.now()}`;

      const [
        companyResult,
      ] =
        await connection.query(
          `
            INSERT INTO companies (
              company_code,
              name,
              industry,
              city,
              country,
              website,
              agency_relationship,
              source,
              status,
              notes,
              created_by,
              updated_by
            )
            VALUES (
              ?,
              ?,
              ?,
              ?,
              'India',
              ?,
              ?,
              ?,
              'ACTIVE',
              ?,
              ?,
              ?
            )
          `,
          [
            temporaryCode,

            data.company.name,

            data.company
              .industry,

            data.company.city ||
              null,

            data.company.website ||
              null,

            data.company
              .agencyRelationship ||
              null,

            data.source,

            data.company
              .marketingActivity ||
              null,

            currentUser.id,
            currentUser.id,
          ]
        );

      companyId =
        Number(
          companyResult.insertId
        );

      companyCode =
        generateCompanyCode(
          companyId
        );

      await connection.query(
        `
          UPDATE companies

          SET company_code = ?

          WHERE id = ?
        `,
        [
          companyCode,
          companyId,
        ]
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Primary Contact
    |--------------------------------------------------------------------------
    */

    const temporaryContactCode =
      `TEMP-CON-${Date.now()}`;

    const [
      contactResult,
    ] =
      await connection.query(
        `
          INSERT INTO contacts (
            contact_code,
            company_id,
            full_name,
            designation,
            phone,
            email,
            is_decision_maker,
            status,
            created_by,
            updated_by
          )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            'ACTIVE',
            ?,
            ?
          )
        `,
        [
          temporaryContactCode,

          companyId,

          data.contact.name,

          data.contact
            .designation ||
            null,

          data.contact.phone ||
            null,

          data.contact.email ||
            null,

          data.contact
            .isDecisionMaker
            ? 1
            : 0,

          currentUser.id,
          currentUser.id,
        ]
      );

    const contactId =
      Number(
        contactResult.insertId
      );

    const contactCode =
      generateContactCode(
        contactId
      );

    await connection.query(
      `
        UPDATE contacts

        SET contact_code = ?

        WHERE id = ?
      `,
      [
        contactCode,
        contactId,
      ]
    );

    /*
    |--------------------------------------------------------------------------
    | Opportunity Value
    |--------------------------------------------------------------------------
    */

    const estimatedValuePaise =
      rupeesToPaise(
        data.estimatedValueRupees
      );

    /*
    |--------------------------------------------------------------------------
    | Lead
    |--------------------------------------------------------------------------
    */

    const leadId =
      await createLead(
        {
          companyId,

          primaryContactId:
            contactId,

          ownerId:
            data.ownerId,

          serviceRequired:
            data.serviceRequired,

          source:
            data.source,

          estimatedValuePaise,

          priority:
            data.priority,

          description:
            data.description ||
            null,

          nextAction:
            data.nextAction,

          followUpAt:
            data.followUpAt,

          knownRelationship:
            data.knownRelationship,

          userId:
            currentUser.id,
        },

        connection
      );

    /*
    |--------------------------------------------------------------------------
    | Lead Code
    |--------------------------------------------------------------------------
    */

    const leadCode =
      generateLeadCode(
        leadId
      );

    await updateLeadCode(
      leadId,
      leadCode,
      connection
    );

    /*
    |--------------------------------------------------------------------------
    | Stage History
    |--------------------------------------------------------------------------
    */

    await createLeadStageHistory(
      {
        leadId,

        fromStage: null,

        toStage: "New",

        changedBy:
          currentUser.id,

        reason:
          "Lead created.",

        metadata: {
          initialStage:
            true,
        },
      },

      connection
    );

    /*
    |--------------------------------------------------------------------------
    | Activity
    |--------------------------------------------------------------------------
    */

    await createLeadActivity(
      {
        leadId,

        activityType:
          "Lead created",

        outcome:
          "New lead created",

        notes:
          "Company and primary contact captured.",

        userId:
          currentUser.id,
      },

      connection
    );

    /*
    |--------------------------------------------------------------------------
    | First Follow-up
    |--------------------------------------------------------------------------
    */

    const followupCode =
      generatePublicId(
        "FUP"
      );

    await createLeadFollowup(
      {
        followupCode,

        leadId,

        assignedTo:
          data.ownerId,

        action:
          data.nextAction,

        dueAt:
          data.followUpAt,

        priority:
          data.priority,

        userId:
          currentUser.id,
      },

      connection
    );

    /*
    |--------------------------------------------------------------------------
    | Reload Lead
    |--------------------------------------------------------------------------
    */

    const lead =
      await findLeadById(
        leadId,
        currentUser,
        connection
      );

    if (!lead) {
      throw new ApiError(
        500,
        "Lead was created but could not be loaded.",
        [],
        "LEAD_CREATED_BUT_NOT_LOADED"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Audit
    |--------------------------------------------------------------------------
    */

    await createAuditLog({
      actorUserId:
        currentUser.id,

      entityType:
        "LEAD",

      entityId:
        leadId,

      action:
        "LEAD_CREATED",

      previousValues:
        null,

      newValues:
        lead,

      metadata: {
        leadCode,
        companyCode,
        contactCode,
        followupCode,
      },

      ipAddress,
      userAgent,
      connection,
    });

    await connection.commit();

    return lead;
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Ignore rollback failure.
    }

    throw error;
  } finally {
    connection.release();
  }
};

/*
|--------------------------------------------------------------------------
| Update Lead
|--------------------------------------------------------------------------
*/

export const updateLeadService =
  async ({
    leadId,
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      /*
      |--------------------------------------------------------------------------
      | Existing + Access
      |--------------------------------------------------------------------------
      */

      const existing =
        await findLeadById(
          leadId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Lead not found.",
          [],
          "LEAD_NOT_FOUND"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Resolve Company / Contact
      |--------------------------------------------------------------------------
      */

      const companyId =
        data.companyId ??
        existing.companyId;

      const primaryContactId =
        data.primaryContactId ??
        existing.primaryContactId;

      if (
        data.companyId !==
          undefined ||
        data.primaryContactId !==
          undefined
      ) {
        const company =
          await findCompanyById(
            companyId,
            connection
          );

        if (!company) {
          throw new ApiError(
            404,
            "Selected company was not found.",
            [],
            "COMPANY_NOT_FOUND"
          );
        }

        const contact =
          await findContactForCompany(
            primaryContactId,
            companyId,
            connection
          );

        if (!contact) {
          throw new ApiError(
            422,
            "The selected contact does not belong to the selected company.",
            [],
            "CONTACT_COMPANY_MISMATCH"
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Transform Data
      |--------------------------------------------------------------------------
      */

      const updateData = {
        ...data,
      };

      if (
        data.estimatedValueRupees !==
        undefined
      ) {
        updateData.estimatedValuePaise =
          rupeesToPaise(
            data.estimatedValueRupees
          );

        delete updateData
          .estimatedValueRupees;
      }

      /*
      |--------------------------------------------------------------------------
      | Update
      |--------------------------------------------------------------------------
      */

      await updateLeadDetails(
        leadId,
        updateData,
        currentUser.id,
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Activity
      |--------------------------------------------------------------------------
      */

      await createLeadActivity(
        {
          leadId,

          activityType:
            "Lead edited",

          outcome:
            "Lead details updated",

          notes:
            data.description ||
            "Lead information updated.",

          userId:
            currentUser.id,
        },

        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Reload
      |--------------------------------------------------------------------------
      */

      const updated =
        await findLeadById(
          leadId,
          currentUser,
          connection
        );

      if (!updated) {
        throw new ApiError(
          500,
          "Lead was updated but could not be loaded.",
          [],
          "LEAD_UPDATED_BUT_NOT_LOADED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Audit
      |--------------------------------------------------------------------------
      */

      await createAuditLog({
        actorUserId:
          currentUser.id,

        entityType:
          "LEAD",

        entityId:
          leadId,

        action:
          "LEAD_UPDATED",

        previousValues:
          existing,

        newValues:
          updated,

        metadata: {
          changedFields:
            Object.keys(
              data
            ),
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
| Change Stage
|--------------------------------------------------------------------------
*/

export const changeLeadStageService =
  async ({
    leadId,
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      const existing =
        await findLeadById(
          leadId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Lead not found.",
          [],
          "LEAD_NOT_FOUND"
        );
      }

      if (
        existing.stage ===
        data.stage
      ) {
        throw new ApiError(
          409,
          "Lead is already in this stage.",
          [],
          "LEAD_STAGE_UNCHANGED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Status
      |--------------------------------------------------------------------------
      */

      let newStatus =
        existing.status;

      if (
        data.stage ===
        "Nurture"
      ) {
        newStatus =
          "Later";
      } else if (
        data.stage ===
        "Lost"
      ) {
        newStatus =
          "Not interested";
      } else if (
        existing.stage ===
          "Nurture" ||
        existing.stage ===
          "Lost"
      ) {
        newStatus =
          "Open";
      }

      /*
      |--------------------------------------------------------------------------
      | Update
      |--------------------------------------------------------------------------
      */

      await changeLeadStage(
        {
          leadId,

          stage:
            data.stage,

          status:
            newStatus,

          reason:
            data.reason,

          userId:
            currentUser.id,
        },

        connection
      );

      /*
      |--------------------------------------------------------------------------
      | History
      |--------------------------------------------------------------------------
      */

      await createLeadStageHistory(
        {
          leadId,

          fromStage:
            existing.stage,

          toStage:
            data.stage,

          changedBy:
            currentUser.id,

          reason:
            data.reason,
        },

        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Activity
      |--------------------------------------------------------------------------
      */

      await createLeadActivity(
        {
          leadId,

          activityType:
            "Stage change",

          outcome:
            `Moved from ${existing.stage} to ${data.stage}`,

          notes:
            data.reason,

          userId:
            currentUser.id,
        },

        connection
      );

      const updated =
        await findLeadById(
          leadId,
          currentUser,
          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Audit
      |--------------------------------------------------------------------------
      */

      await createAuditLog({
        actorUserId:
          currentUser.id,

        entityType:
          "LEAD",

        entityId:
          leadId,

        action:
          "LEAD_STAGE_CHANGED",

        previousValues: {
          stage:
            existing.stage,

          status:
            existing.status,
        },

        newValues: {
          stage:
            updated.stage,

          status:
            updated.status,
        },

        metadata: {
          reason:
            data.reason,
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
        // Ignore rollback failure.
      }

      throw error;
    } finally {
      connection.release();
    }
  };

/*
|--------------------------------------------------------------------------
| Change Owner
|--------------------------------------------------------------------------
|
| Super Admin only route.
|
*/

export const changeLeadOwnerService =
  async ({
    leadId,
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      const existing =
        await findLeadById(
          leadId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Lead not found.",
          [],
          "LEAD_NOT_FOUND"
        );
      }

      const newOwner =
        await findActiveOwnerById(
          data.ownerId,
          connection
        );

      if (!newOwner) {
        throw new ApiError(
          422,
          "Selected owner is not active.",
          [],
          "OWNER_NOT_AVAILABLE"
        );
      }

      if (
        Number(
          existing.ownerId
        ) ===
        Number(
          data.ownerId
        )
      ) {
        throw new ApiError(
          409,
          "This user already owns the lead.",
          [],
          "LEAD_OWNER_UNCHANGED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Owner
      |--------------------------------------------------------------------------
      */

      await changeLeadOwner(
        leadId,
        data.ownerId,
        currentUser.id,
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Move Pending Follow-ups To New Owner
      |--------------------------------------------------------------------------
      */

      await reassignPendingFollowups(
        leadId,
        data.ownerId,
        currentUser.id,
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Activity
      |--------------------------------------------------------------------------
      */

      await createLeadActivity(
        {
          leadId,

          activityType:
            "Owner changed",

          outcome:
            `Assigned to ${newOwner.fullName}`,

          notes:
            data.reason ||
            "Lead reassigned.",

          userId:
            currentUser.id,
        },

        connection
      );

      const updated =
        await findLeadById(
          leadId,
          currentUser,
          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Audit
      |--------------------------------------------------------------------------
      */

      await createAuditLog({
        actorUserId:
          currentUser.id,

        entityType:
          "LEAD",

        entityId:
          leadId,

        action:
          "LEAD_OWNER_CHANGED",

        previousValues: {
          ownerId:
            existing.ownerId,

          ownerName:
            existing.ownerName,
        },

        newValues: {
          ownerId:
            updated.ownerId,

          ownerName:
            updated.ownerName,
        },

        metadata: {
          reason:
            data.reason ||
            null,
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