import crypto from "node:crypto";

import pool from "../../config/db.js";

/*
|--------------------------------------------------------------------------
| Contact Mapper
|--------------------------------------------------------------------------
*/

const mapContact = (
  row
) => {
  if (!row) {
    return null;
  }

  return {
    ...row,

    isDecisionMaker:
      Boolean(
        row.isDecisionMaker
      ),
  };
};

/*
|--------------------------------------------------------------------------
| Contact SELECT
|--------------------------------------------------------------------------
*/

const CONTACT_SELECT = `
  SELECT
    ct.id,

    ct.contact_code
      AS contactCode,

    ct.company_id
      AS companyId,

    c.company_code
      AS companyCode,

    c.name
      AS companyName,

    ct.full_name
      AS name,

    ct.designation,

    ct.phone,

    ct.email,

    ct.is_decision_maker
      AS isDecisionMaker,

    ct.status,

    ct.notes,

    ct.created_by
      AS createdBy,

    ct.updated_by
      AS updatedBy,

    ct.created_at
      AS createdAt,

    ct.updated_at
      AS updatedAt

  FROM contacts ct

  INNER JOIN companies c
    ON c.id = ct.company_id
    AND c.deleted_at IS NULL
`;

/*
|--------------------------------------------------------------------------
| Find Contact By ID
|--------------------------------------------------------------------------
*/

export const findContactById =
  async (
    contactId,
    connection = pool
  ) => {
    const [rows] =
      await connection.query(
        `
          ${CONTACT_SELECT}

          WHERE ct.id = ?
            AND ct.deleted_at IS NULL

          LIMIT 1
        `,
        [contactId]
      );

    return mapContact(
      rows[0] || null
    );
  };

/*
|--------------------------------------------------------------------------
| Find Matching Contact For Company
|--------------------------------------------------------------------------
|
| Reuse a contact when the same email or phone already exists under the same
| company. This prevents duplicate contacts when Add Lead is submitted twice.
|
*/

export const findMatchingContact =
  async (
    {
      companyId,
      email,
      phone,
    },
    connection = pool
  ) => {
    if (
      email
    ) {
      const [
        rows,
      ] =
        await connection.query(
          `
            ${CONTACT_SELECT}

            WHERE
              ct.company_id = ?

              AND LOWER(ct.email) =
                LOWER(?)

              AND ct.deleted_at
                IS NULL

            LIMIT 1
          `,
          [
            companyId,
            email,
          ]
        );

      if (
        rows[0]
      ) {
        return mapContact(
          rows[0]
        );
      }
    }

    if (
      phone
    ) {
      const [
        rows,
      ] =
        await connection.query(
          `
            ${CONTACT_SELECT}

            WHERE
              ct.company_id = ?

              AND ct.phone = ?

              AND ct.deleted_at
                IS NULL

            LIMIT 1
          `,
          [
            companyId,
            phone,
          ]
        );

      if (
        rows[0]
      ) {
        return mapContact(
          rows[0]
        );
      }
    }

    return null;
  };

/*
|--------------------------------------------------------------------------
| List Contacts
|--------------------------------------------------------------------------
*/

export const listContacts =
  async ({
    search = "",
    companyId,
    isDecisionMaker,
    status,
    page = 1,
    limit = 20,
    sort = "createdAt",
    direction = "asc",
    userId,
    role,
  }) => {
    const conditions = [
      "ct.deleted_at IS NULL",
      "c.deleted_at IS NULL",
    ];

    const values = [];

    /*
    |--------------------------------------------------------------------------
    | Owner Record Scope
    |--------------------------------------------------------------------------
    |
    | SUPER_ADMIN:
    | sees all contacts.
    |
    | OWNER:
    | sees contacts belonging to companies attached to their leads.
    |
    */

    if (
      role !==
      "SUPER_ADMIN"
    ) {
      conditions.push(`
        EXISTS (
          SELECT 1

          FROM leads l

          WHERE l.company_id = ct.company_id

            AND l.owner_id = ?

            AND l.deleted_at IS NULL
        )
      `);

      values.push(
        userId
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    if (search) {
      const term =
        `%${search}%`;

      conditions.push(`
        (
          ct.contact_code LIKE ?

          OR ct.full_name LIKE ?

          OR ct.designation LIKE ?

          OR ct.phone LIKE ?

          OR ct.email LIKE ?

          OR c.company_code LIKE ?

          OR c.name LIKE ?
        )
      `);

      values.push(
        term,
        term,
        term,
        term,
        term,
        term,
        term
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Company Filter
    |--------------------------------------------------------------------------
    */

    if (companyId) {
      conditions.push(
        "ct.company_id = ?"
      );

      values.push(
        companyId
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Decision Maker Filter
    |--------------------------------------------------------------------------
    */

    if (
      typeof isDecisionMaker ===
      "boolean"
    ) {
      conditions.push(
        "ct.is_decision_maker = ?"
      );

      values.push(
        isDecisionMaker
          ? 1
          : 0
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    if (status) {
      conditions.push(
        "ct.status = ?"
      );

      values.push(
        status
      );
    }

    const whereClause =
      conditions.join(
        " AND "
      );

    /*
    |--------------------------------------------------------------------------
    | Total Count
    |--------------------------------------------------------------------------
    */

    const [countRows] =
      await pool.query(
        `
          SELECT
            COUNT(*) AS total

          FROM contacts ct

          INNER JOIN companies c
            ON c.id = ct.company_id
            AND c.deleted_at IS NULL

          WHERE ${whereClause}
        `,
        values
      );

    const total =
      Number(
        countRows[0]
          ?.total || 0
      );

    /*
    |--------------------------------------------------------------------------
    | Sorting
    |--------------------------------------------------------------------------
    */

    const sortColumns = {
      name:
        "ct.full_name",

      companyName:
        "c.name",

      createdAt:
        "ct.created_at",

      updatedAt:
        "ct.updated_at",
    };

    const orderColumn =
      sortColumns[sort] ||
      "ct.created_at";

    const orderDirection =
      direction === "desc"
        ? "DESC"
        : "ASC";

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    const offset =
      (Number(page) - 1) *
      Number(limit);

    const [rows] =
      await pool.query(
        `
          ${CONTACT_SELECT}

          WHERE ${whereClause}

          ORDER BY
            ${orderColumn}
            ${orderDirection},
            ct.id ASC

          LIMIT ?
          OFFSET ?
        `,
        [
          ...values,
          Number(limit),
          Number(offset),
        ]
      );

    return {
      rows:
        rows.map(
          mapContact
        ),

      total,
    };
  };

/*
|--------------------------------------------------------------------------
| Create Contact
|--------------------------------------------------------------------------
|
| contact_code is generated after MySQL gives us the AUTO_INCREMENT id.
|
*/

export const createContact =
  async (
    {
      companyId,
      name,
      designation,
      phone,
      email,
      isDecisionMaker,
      userId,
    },
    connection = pool
  ) => {
    const temporaryCode =
    `TEMP-${crypto
      .randomBytes(12)
      .toString("hex")}`;

    const [result] =
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
            notes,
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
            NULL,
            ?,
            ?
          )
        `,
        [
          temporaryCode,
          companyId,
          name,
          designation,
          phone,
          email,
          isDecisionMaker
            ? 1
            : 0,
          userId,
          userId,
        ]
      );

    return result.insertId;
  };

/*
|--------------------------------------------------------------------------
| Update Contact Code
|--------------------------------------------------------------------------
*/

export const updateContactCode =
  async (
    contactId,
    contactCode,
    connection = pool
  ) => {
    const [result] =
      await connection.query(
        `
          UPDATE contacts

          SET contact_code = ?

          WHERE id = ?
            AND deleted_at IS NULL
        `,
        [
          contactCode,
          contactId,
        ]
      );

    return (
      result.affectedRows >
      0
    );
  };

/*
|--------------------------------------------------------------------------
| Update Contact
|--------------------------------------------------------------------------
*/

export const updateContact =
  async (
    contactId,
    data,
    userId,
    connection = pool
  ) => {
    const columnMap = {
      companyId:
        "company_id",

      name:
        "full_name",

      designation:
        "designation",

      phone:
        "phone",

      email:
        "email",

      isDecisionMaker:
        "is_decision_maker",

      status:
        "status",

      notes:
        "notes",
    };

    const assignments = [];
    const values = [];

    for (
      const [
        key,
        value,
      ] of Object.entries(
        data
      )
    ) {
      const column =
        columnMap[key];

      if (!column) {
        continue;
      }

      assignments.push(
        `${column} = ?`
      );

      if (
        key ===
        "isDecisionMaker"
      ) {
        values.push(
          value
            ? 1
            : 0
        );
      } else {
        values.push(
          value
        );
      }
    }

    assignments.push(
      "updated_by = ?"
    );

    values.push(
      userId
    );

    values.push(
      contactId
    );

    const [result] =
      await connection.query(
        `
          UPDATE contacts

          SET
            ${assignments.join(
              ", "
            )}

          WHERE id = ?
            AND deleted_at IS NULL
        `,
        values
      );

    return (
      result.affectedRows >
      0
    );
  };