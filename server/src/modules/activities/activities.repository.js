import pool from "../../config/db.js";

/*
|--------------------------------------------------------------------------
| Map Activity
|--------------------------------------------------------------------------
*/

const mapActivity = (
  row
) => {
  if (!row) {
    return null;
  }

  return {
    ...row,

    id:
      Number(row.id),

    leadId:
      Number(
        row.leadId
      ),

    companyId:
      Number(
        row.companyId
      ),

    contactId:
      row.contactId
        ? Number(
            row.contactId
          )
        : null,

    createdBy:
      Number(
        row.createdBy
      ),
  };
};

/*
|--------------------------------------------------------------------------
| Base SELECT
|--------------------------------------------------------------------------
*/

const ACTIVITY_SELECT = `
  SELECT
    a.id,

    a.lead_id
      AS leadId,

    l.lead_code
      AS leadCode,

    l.stage
      AS leadStage,

    l.owner_id
      AS leadOwnerId,

    c.id
      AS companyId,

    c.company_code
      AS companyCode,

    c.name
      AS companyName,

    ct.id
      AS contactId,

    ct.contact_code
      AS contactCode,

    ct.full_name
      AS contactName,

    a.activity_type
      AS activityType,

    a.outcome,

    a.notes,

    a.occurred_at
      AS occurredAt,

    a.created_by
      AS createdBy,

    u.full_name
      AS createdByName

  FROM activities a

  INNER JOIN leads l
    ON l.id =
      a.lead_id
    AND l.deleted_at
      IS NULL

  INNER JOIN companies c
    ON c.id =
      l.company_id
    AND c.deleted_at
      IS NULL

  LEFT JOIN contacts ct
    ON ct.id =
      l.primary_contact_id
    AND ct.deleted_at
      IS NULL

  LEFT JOIN users u
    ON u.id =
      a.created_by
    AND u.deleted_at
      IS NULL
`;

/*
|--------------------------------------------------------------------------
| List Activities
|--------------------------------------------------------------------------
*/

export const listActivities =
  async ({
    leadId,
    page,
    limit,
    currentUser,
  }) => {
    const conditions = [];

    const values = [];

    /*
    |--------------------------------------------------------------------------
    | Role Scope
    |--------------------------------------------------------------------------
    */

    if (
      currentUser.role !==
      "SUPER_ADMIN"
    ) {
      conditions.push(
        "l.owner_id = ?"
      );

      values.push(
        currentUser.id
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Lead Filter
    |--------------------------------------------------------------------------
    */

    if (leadId) {
      conditions.push(
        "l.id = ?"
      );

      values.push(
        leadId
      );
    }

    const whereSql =
      conditions.length
        ? `WHERE ${conditions.join(
            " AND "
          )}`
        : "";

    /*
    |--------------------------------------------------------------------------
    | Count
    |--------------------------------------------------------------------------
    */

    const [countRows] =
      await pool.query(
        `
          SELECT
            COUNT(*) AS total

          FROM activities a

          INNER JOIN leads l
            ON l.id =
              a.lead_id
            AND l.deleted_at
              IS NULL

          ${whereSql}
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
    | Pagination
    |--------------------------------------------------------------------------
    */

    const offset =
      (Number(page) - 1) *
      Number(limit);

    const [rows] =
      await pool.query(
        `
          ${ACTIVITY_SELECT}

          ${whereSql}

          ORDER BY
            a.occurred_at DESC,
            a.id DESC

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
          mapActivity
        ),

      total,
    };
  };

/*
|--------------------------------------------------------------------------
| Create Activity
|--------------------------------------------------------------------------
*/

export const createActivity =
  async (
    {
      leadId,
      activityType,
      outcome,
      notes,
      userId,
    },

    connection = pool
  ) => {
    const [result] =
      await connection.query(
        `
          INSERT INTO activities (
            lead_id,
            activity_type,
            outcome,
            notes,
            occurred_at,
            created_by
          )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            UTC_TIMESTAMP(),
            ?
          )
        `,
        [
          leadId,
          activityType,
          outcome,
          notes || null,
          userId,
        ]
      );

    return Number(
      result.insertId
    );
  };

/*
|--------------------------------------------------------------------------
| Find Activity
|--------------------------------------------------------------------------
*/

export const findActivityById =
  async (
    activityId,
    currentUser,
    connection = pool
  ) => {
    const conditions = [
      "a.id = ?",
    ];

    const values = [
      activityId,
    ];

    if (
      currentUser.role !==
      "SUPER_ADMIN"
    ) {
      conditions.push(
        "l.owner_id = ?"
      );

      values.push(
        currentUser.id
      );
    }

    const [rows] =
      await connection.query(
        `
          ${ACTIVITY_SELECT}

          WHERE
            ${conditions.join(
              " AND "
            )}

          LIMIT 1
        `,
        values
      );

    return mapActivity(
      rows[0] ||
        null
    );
  };

/*
|--------------------------------------------------------------------------
| Update Lead Touch / Next Action
|--------------------------------------------------------------------------
*/

export const updateLeadFromActivity =
  async (
    {
      leadId,
      nextAction,
      nextFollowUpAt,
      userId,
    },

    connection = pool
  ) => {
    if (
      nextAction &&
      nextFollowUpAt
    ) {
      await connection.query(
        `
          UPDATE leads

          SET
            last_touch_at =
              UTC_TIMESTAMP(),

            next_action = ?,

            follow_up_at = ?,

            updated_by = ?

          WHERE id = ?
            AND deleted_at
              IS NULL
        `,
        [
          nextAction,
          nextFollowUpAt,
          userId,
          leadId,
        ]
      );

      return;
    }

    await connection.query(
      `
        UPDATE leads

        SET
          last_touch_at =
            UTC_TIMESTAMP(),

          updated_by = ?

        WHERE id = ?
          AND deleted_at
            IS NULL
      `,
      [
        userId,
        leadId,
      ]
    );
  };