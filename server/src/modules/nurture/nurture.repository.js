import pool from "../../config/db.js";

/*
|--------------------------------------------------------------------------
| Category Label
|--------------------------------------------------------------------------
*/

const categoryLabel = (
  category
) => {
  const labels = {
    LATER:
      "Later",

    NO_RESPONSE:
      "No Response",

    LOST_NOT_INTERESTED:
      "Lost / Not Interested",

    FUTURE_OPPORTUNITY:
      "Future Opportunity",
  };

  return (
    labels[
      category
    ] ||
    category
  );
};

/*
|--------------------------------------------------------------------------
| Default Category
|--------------------------------------------------------------------------
*/

const deriveCategory = (
  row
) => {
  if (
    row.nurtureCategory
  ) {
    return row.nurtureCategory;
  }

  if (
    row.leadStage ===
    "Lost"
  ) {
    return "LOST_NOT_INTERESTED";
  }

  const status =
    String(
      row.leadStatus ||
        ""
    ).toLowerCase();

  if (
    status.includes(
      "no response"
    )
  ) {
    return "NO_RESPONSE";
  }

  if (
    status.includes(
      "later"
    )
  ) {
    return "LATER";
  }

  return "FUTURE_OPPORTUNITY";
};

/*
|--------------------------------------------------------------------------
| Map
|--------------------------------------------------------------------------
*/

const mapNurture = (
  row
) => {
  if (!row) {
    return null;
  }

  const category =
    deriveCategory(
      row
    );

  return {
    ...row,

    leadId:
      Number(
        row.leadId
      ),

    ownerId:
      row.ownerId
        ? Number(
            row.ownerId
          )
        : null,

    category,

    categoryLabel:
      categoryLabel(
        category
      ),

    reconnectAt:
      row.reconnectAt ||
      row.leadFollowUpAt ||
      null,
  };
};

/*
|--------------------------------------------------------------------------
| SELECT
|--------------------------------------------------------------------------
*/

const NURTURE_SELECT = `
  SELECT
    l.id
      AS leadId,

    l.lead_code
      AS leadCode,

    l.stage
      AS leadStage,

    l.status
      AS leadStatus,

    l.service_required
      AS serviceInterest,

    l.last_touch_at
      AS lastTouchAt,

    l.follow_up_at
      AS leadFollowUpAt,

    l.owner_id
      AS ownerId,

    owner.full_name
      AS ownerName,

    c.id
      AS companyId,

    c.name
      AS companyName,

    c.industry,

    c.city,

    c.state,

    c.country,

    CONCAT_WS(
      ', ',
      NULLIF(c.city, ''),
      NULLIF(c.state, ''),
      NULLIF(c.country, '')
    )
      AS geography,

    ct.id
      AS contactId,

    ct.full_name
      AS contactName,

    ct.designation,

    ct.phone,

    ct.email,

    np.category
      AS nurtureCategory,

    np.reason,

    np.buying_stage
      AS buyingStage,

    np.communication_status
      AS communicationStatus,

    np.reconnect_at
      AS reconnectAt,

    np.entered_at
      AS enteredAt

  FROM leads l

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

  LEFT JOIN users owner
    ON owner.id =
      l.owner_id

  LEFT JOIN nurture_profiles np
    ON np.lead_id =
      l.id
`;

/*
|--------------------------------------------------------------------------
| Nurture Scope
|--------------------------------------------------------------------------
*/

const nurtureCondition = `
  l.deleted_at IS NULL

  AND l.stage IN (
    'Nurture',
    'Lost'
  )
`;

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export const listNurtureLeads =
  async ({
    category,
    search,
    page,
    limit,
    currentUser,
  }) => {
    const conditions = [
      nurtureCondition,
    ];

    const values = [];

    /*
    |--------------------------------------------------------------------------
    | RBAC
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
    | Category
    |--------------------------------------------------------------------------
    */

    if (category) {
      if (
        category ===
        "LOST_NOT_INTERESTED"
      ) {
        conditions.push(
          `
            (
              np.category = ?
              OR (
                np.category IS NULL
                AND l.stage = 'Lost'
              )
            )
          `
        );

        values.push(
          category
        );
      } else {
        conditions.push(
          "np.category = ?"
        );

        values.push(
          category
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    if (search) {
      const like =
        `%${search}%`;

      conditions.push(
        `
          (
            c.name LIKE ?
            OR l.lead_code LIKE ?
            OR ct.full_name LIKE ?
            OR ct.email LIKE ?
            OR ct.phone LIKE ?
          )
        `
      );

      values.push(
        like,
        like,
        like,
        like,
        like
      );
    }

    const whereSql =
      `WHERE ${conditions.join(
        " AND "
      )}`;

    /*
    |--------------------------------------------------------------------------
    | Count
    |--------------------------------------------------------------------------
    */

    const [
      countRows,
    ] =
      await pool.query(
        `
          SELECT
            COUNT(*) AS total

          FROM leads l

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

          LEFT JOIN nurture_profiles np
            ON np.lead_id =
              l.id

          ${whereSql}
        `,
        values
      );

    const total =
      Number(
        countRows[0]
          ?.total || 0
      );

    const offset =
      (
        Number(page) -
        1
      ) *
      Number(limit);

    /*
    |--------------------------------------------------------------------------
    | Rows
    |--------------------------------------------------------------------------
    */

    const [
      rows,
    ] =
      await pool.query(
        `
          ${NURTURE_SELECT}

          ${whereSql}

          ORDER BY
            COALESCE(
              np.reconnect_at,
              l.follow_up_at
            ) ASC,

            l.id DESC

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
          mapNurture
        ),

      total,
    };
  };

/*
|--------------------------------------------------------------------------
| Find Lead In Nurture
|--------------------------------------------------------------------------
*/

export const findNurtureLead =
  async (
    leadId,
    currentUser,
    connection = pool
  ) => {
    const conditions = [
      nurtureCondition,
      "l.id = ?",
    ];

    const values = [
      leadId,
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

    const [
      rows,
    ] =
      await connection.query(
        `
          ${NURTURE_SELECT}

          WHERE
            ${conditions.join(
              " AND "
            )}

          LIMIT 1
        `,
        values
      );

    return mapNurture(
      rows[0] ||
        null
    );
  };

/*
|--------------------------------------------------------------------------
| Upsert Nurture Profile
|--------------------------------------------------------------------------
*/

export const upsertNurtureProfile =
  async (
    {
      leadId,
      category,
      reason,
      buyingStage,
      communicationStatus,
      reconnectAt,
      userId,
    },

    connection = pool
  ) => {
    await connection.query(
      `
        INSERT INTO nurture_profiles (
          lead_id,
          category,
          reason,
          buying_stage,
          communication_status,
          reconnect_at,
          entered_at,
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
          UTC_TIMESTAMP(),
          ?,
          ?
        )

        ON DUPLICATE KEY UPDATE
          category =
            VALUES(category),

          reason =
            VALUES(reason),

          buying_stage =
            VALUES(buying_stage),

          communication_status =
            VALUES(
              communication_status
            ),

          reconnect_at =
            VALUES(reconnect_at),

          updated_by =
            VALUES(updated_by)
      `,
      [
        leadId,
        category,
        reason || null,
        buyingStage || null,

        communicationStatus ||
          "NOT_CONTACTED",

        reconnectAt || null,

        userId,
        userId,
      ]
    );
  };