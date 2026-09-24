import pool from "../../config/db.js";

/*
|--------------------------------------------------------------------------
| Date Key - Asia/Kolkata
|--------------------------------------------------------------------------
*/

const indiaDateKey = (
  value
) => {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          "Asia/Kolkata",

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",
      }
    ).formatToParts(
      date
    );

  const get =
    (
      type
    ) =>
      parts.find(
        (
          part
        ) =>
          part.type ===
          type
      )?.value;

  return [
    get("year"),
    get("month"),
    get("day"),
  ].join("-");
};

/*
|--------------------------------------------------------------------------
| Derived Display Status
|--------------------------------------------------------------------------
*/

const getDisplayStatus =
  (
    status,
    dueAt
  ) => {
    if (
      status ===
      "COMPLETED"
    ) {
      return "Completed";
    }

    if (
      status ===
      "RESCHEDULED"
    ) {
      return "Rescheduled";
    }

    const due =
      indiaDateKey(
        dueAt
      );

    const today =
      indiaDateKey(
        new Date()
      );

    if (
      !due ||
      !today
    ) {
      return "Upcoming";
    }

    if (
      due === today
    ) {
      return "Due today";
    }

    if (
      due < today
    ) {
      return "Overdue";
    }

    return "Upcoming";
  };

/*
|--------------------------------------------------------------------------
| Map
|--------------------------------------------------------------------------
*/

const mapFollowup = (
  row
) => {
  if (!row) {
    return null;
  }

  return {
    ...row,

    id:
      Number(
        row.id
      ),

    leadId:
      Number(
        row.leadId
      ),

    assignedTo:
      Number(
        row.assignedTo
      ),

    ownerId:
      Number(
        row.ownerId
      ),

    completedBy:
      row.completedBy
        ? Number(
            row.completedBy
          )
        : null,

    successorFollowupId:
      row.successorFollowupId
        ? Number(
            row.successorFollowupId
          )
        : null,

    displayStatus:
      getDisplayStatus(
        row.status,
        row.dueAt
      ),
  };
};

/*
|--------------------------------------------------------------------------
| Select
|--------------------------------------------------------------------------
*/

const FOLLOWUP_SELECT = `
  SELECT
    f.id,

    f.followup_code
      AS followupCode,

    f.lead_id
      AS leadId,

    l.lead_code
      AS leadCode,

    l.stage
      AS leadStage,

    l.status
      AS leadStatus,

    l.last_touch_at
      AS lastTouchAt,

    l.owner_id
      AS ownerId,

    owner.full_name
      AS ownerName,

    c.name
      AS companyName,

    ct.full_name
      AS contactName,

    ct.phone
      AS contactPhone,

    ct.email
      AS contactEmail,

    f.assigned_to
      AS assignedTo,

    assignee.full_name
      AS assignedToName,

    f.action,

    f.due_at
      AS dueAt,

    f.priority,

    f.status,

    f.notes,

    f.outcome,

    f.completed_at
      AS completedAt,

    f.completed_by
      AS completedBy,

    completer.full_name
      AS completedByName,

    f.successor_followup_id
      AS successorFollowupId,

    f.status_reason
      AS statusReason,

    f.created_at
      AS createdAt,

    f.updated_at
      AS updatedAt

  FROM followups f

  INNER JOIN leads l
    ON l.id =
      f.lead_id
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

  LEFT JOIN users owner
    ON owner.id =
      l.owner_id

  LEFT JOIN users assignee
    ON assignee.id =
      f.assigned_to

  LEFT JOIN users completer
    ON completer.id =
      f.completed_by
`;

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export const listFollowups =
  async ({
    leadId,
    view,
    page,
    limit,
    currentUser,
  }) => {
    const conditions =
      [];

    const values =
      [];

    /*
    |--------------------------------------------------------------------------
    | Owner Scope
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

    /*
    |--------------------------------------------------------------------------
    | View
    |--------------------------------------------------------------------------
    |
    | due_at is stored as a timestamp.
    | Display groups use India business date.
    |
    */

    if (
      view ===
      "OPEN"
    ) {
      conditions.push(
        "f.status = 'PENDING'"
      );
    }

    if (
      view ===
      "TODAY"
    ) {
      conditions.push(
        `
          f.status = 'PENDING'
          AND DATE(
            CONVERT_TZ(
              f.due_at,
              '+00:00',
              '+05:30'
            )
          ) =
          DATE(
            CONVERT_TZ(
              UTC_TIMESTAMP(),
              '+00:00',
              '+05:30'
            )
          )
        `
      );
    }

    if (
      view ===
      "UPCOMING"
    ) {
      conditions.push(
        `
          f.status = 'PENDING'
          AND DATE(
            CONVERT_TZ(
              f.due_at,
              '+00:00',
              '+05:30'
            )
          ) >
          DATE(
            CONVERT_TZ(
              UTC_TIMESTAMP(),
              '+00:00',
              '+05:30'
            )
          )
        `
      );
    }

    if (
      view ===
      "OVERDUE"
    ) {
      conditions.push(
        `
          f.status = 'PENDING'
          AND f.due_at <
            UTC_TIMESTAMP()
        `
      );
    }

    if (
      view ===
      "COMPLETED"
    ) {
      conditions.push(
        "f.status = 'COMPLETED'"
      );
    }

    if (
      view ===
      "RESCHEDULED"
    ) {
      conditions.push(
        "f.status = 'RESCHEDULED'"
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

    const [
      countRows,
    ] =
      await pool.query(
        `
          SELECT
            COUNT(*) AS total

          FROM followups f

          INNER JOIN leads l
            ON l.id =
              f.lead_id
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
          ${FOLLOWUP_SELECT}

          ${whereSql}

          ORDER BY
            CASE
              WHEN f.status = 'PENDING'
                THEN 0
              ELSE 1
            END,

            f.due_at ASC,
            f.id DESC

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
          mapFollowup
        ),

      total,
    };
  };

/*
|--------------------------------------------------------------------------
| Find
|--------------------------------------------------------------------------
*/

export const findFollowupById =
  async (
    followupId,
    currentUser,
    connection = pool
  ) => {
    const conditions = [
      "f.id = ?",
    ];

    const values = [
      followupId,
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
          ${FOLLOWUP_SELECT}

          WHERE
            ${conditions.join(
              " AND "
            )}

          LIMIT 1
        `,
        values
      );

    return mapFollowup(
      rows[0] ||
        null
    );
  };

/*
|--------------------------------------------------------------------------
| Insert
|--------------------------------------------------------------------------
*/

export const insertFollowup =
  async (
    {
      followupCode,
      leadId,
      assignedTo,
      action,
      dueAt,
      priority,
      notes,
      userId,
    },

    connection = pool
  ) => {
    const [
      result,
    ] =
      await connection.query(
        `
          INSERT INTO followups (
            followup_code,
            lead_id,
            assigned_to,
            action,
            due_at,
            priority,
            status,
            notes,
            completed_at,
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
            'PENDING',
            ?,
            NULL,
            ?,
            ?
          )
        `,
        [
          followupCode,
          leadId,
          assignedTo,
          action,
          dueAt,
          priority,
          notes || null,
          userId,
          userId,
        ]
      );

    return Number(
      result.insertId
    );
  };

/*
|--------------------------------------------------------------------------
| Complete
|--------------------------------------------------------------------------
*/

export const completeFollowup =
  async (
    {
      followupId,
      outcome,
      notes,
      userId,
    },

    connection = pool
  ) => {
    const [
      result,
    ] =
      await connection.query(
        `
          UPDATE followups

          SET
            status =
              'COMPLETED',

            outcome = ?,

            notes = ?,

            completed_at =
              UTC_TIMESTAMP(),

            completed_by = ?,

            updated_by = ?

          WHERE id = ?
            AND status =
              'PENDING'
        `,
        [
          outcome,
          notes,
          userId,
          userId,
          followupId,
        ]
      );

    return (
      result.affectedRows >
      0
    );
  };

/*
|--------------------------------------------------------------------------
| Mark Original As Rescheduled
|--------------------------------------------------------------------------
*/

export const markFollowupRescheduled =
  async (
    {
      followupId,
      reason,
      userId,
    },

    connection = pool
  ) => {
    const [
      result,
    ] =
      await connection.query(
        `
          UPDATE followups

          SET
            status =
              'RESCHEDULED',

            status_reason = ?,

            updated_by = ?

          WHERE id = ?
            AND status =
              'PENDING'
        `,
        [
          reason,
          userId,
          followupId,
        ]
      );

    return (
      result.affectedRows >
      0
    );
  };

/*
|--------------------------------------------------------------------------
| Link Successor
|--------------------------------------------------------------------------
*/

export const linkSuccessorFollowup =
  async (
    {
      followupId,
      successorFollowupId,
      userId,
    },

    connection = pool
  ) => {
    await connection.query(
      `
        UPDATE followups

        SET
          successor_followup_id = ?,
          updated_by = ?

        WHERE id = ?
      `,
      [
        successorFollowupId,
        userId,
        followupId,
      ]
    );
  };