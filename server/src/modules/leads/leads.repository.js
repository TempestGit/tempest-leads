import pool from "../../config/db.js";

/*
|--------------------------------------------------------------------------
| Map Lead
|--------------------------------------------------------------------------
*/

export const mapLead =
  (row) => {
    if (!row) {
      return null;
    }

    return {
      id:
        Number(
          row.id
        ),

      leadCode:
        row.leadCode,

      companyId:
        row.companyId
          ? Number(
              row.companyId
            )
          : null,

      companyName:
        row.companyName,

      industry:
        row.industry,

      city:
        row.city,

      website:
        row.website,

      primaryContactId:
        row.primaryContactId
          ? Number(
              row.primaryContactId
            )
          : null,

      primaryContactName:
        row.primaryContactName,

      primaryContactDesignation:
        row.primaryContactDesignation,

      primaryContactPhone:
        row.primaryContactPhone,

      primaryContactEmail:
        row.primaryContactEmail,

      ownerId:
        row.ownerId
          ? Number(
              row.ownerId
            )
          : null,

      ownerName:
        row.ownerName,

      stage:
        row.stage,

      status:
        row.status,

      priority:
        row.priority,

      source:
        row.source,

      serviceRequired:
        row.serviceRequired,

      estimatedValueRupees:
        Number(
          row.estimatedValueRupees ||
            0
        ),

      knownRelationship:
        Boolean(
          Number(
            row.knownRelationship ||
              0
          )
        ),

      lastTouchAt:
        row.lastTouchAt,

      nextAction:
        row.nextAction,

      followUpAt:
        row.followUpAt,

      stageAgeDays:
        Number(
          row.stageAgeDays ||
            0
        ),

      createdAt:
        row.createdAt,

      updatedAt:
        row.updatedAt,
    };
  };

/*
|--------------------------------------------------------------------------
| Common Lead Select
|--------------------------------------------------------------------------
*/

const LEAD_SELECT = `
  SELECT
    l.id,

    l.lead_code
      AS leadCode,

    l.company_id
      AS companyId,

    c.name
      AS companyName,

    c.industry,

    c.city,

    c.website,

    l.primary_contact_id
      AS primaryContactId,

    ct.full_name
      AS primaryContactName,

    ct.designation
      AS primaryContactDesignation,

    ct.phone
      AS primaryContactPhone,

    ct.email
      AS primaryContactEmail,

    l.owner_id
      AS ownerId,

    owner.full_name
      AS ownerName,

    l.stage,

    l.status,

    l.priority,

    l.source,

    l.service_required
      AS serviceRequired,

    l.estimated_value_rupees
      AS estimatedValueRupees,

    l.known_relationship
      AS knownRelationship,

    l.last_touch_at
      AS lastTouchAt,

    l.next_action
      AS nextAction,

    l.follow_up_at
      AS followUpAt,

    TIMESTAMPDIFF(
      DAY,

      COALESCE(
        (
          SELECT
            MAX(
              lsh.created_at
            )

          FROM lead_stage_history lsh

          WHERE
            lsh.lead_id =
              l.id
        ),

        l.created_at
      ),

      UTC_TIMESTAMP()
    )
      AS stageAgeDays,

    l.created_at
      AS createdAt,

    l.updated_at
      AS updatedAt

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
`;

/*
|--------------------------------------------------------------------------
| List Leads
|--------------------------------------------------------------------------
*/

export const listLeads =
  async ({
    search,
    ownerId,
    stage,
    status,
    priority,
    source,
    companyId,
    page,
    limit,
    sort,
    direction,
    currentUser,
  }) => {
    const conditions = [
      "l.deleted_at IS NULL",
    ];

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
    | Filters
    |--------------------------------------------------------------------------
    */

    if (ownerId) {
      conditions.push(
        "l.owner_id = ?"
      );

      values.push(
        ownerId
      );
    }

    if (stage) {
      conditions.push(
        "l.stage = ?"
      );

      values.push(
        stage
      );
    }

    if (status) {
      conditions.push(
        "l.status = ?"
      );

      values.push(
        status
      );
    }

    if (priority) {
      conditions.push(
        "l.priority = ?"
      );

      values.push(
        priority
      );
    }

    if (source) {
      conditions.push(
        "l.source = ?"
      );

      values.push(
        source
      );
    }

    if (companyId) {
      conditions.push(
        "l.company_id = ?"
      );

      values.push(
        companyId
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    if (search) {
      const like =
        `%${search}%`;

      conditions.push(`
        (
          l.lead_code LIKE ?

          OR c.name LIKE ?

          OR c.website LIKE ?

          OR ct.full_name LIKE ?

          OR ct.phone LIKE ?

          OR ct.email LIKE ?
        )
      `);

      values.push(
        like,
        like,
        like,
        like,
        like,
        like
      );
    }

    const whereSql =
      `
        WHERE
          ${conditions.join(
            " AND "
          )}
      `;

    /*
    |--------------------------------------------------------------------------
    | Sorting
    |--------------------------------------------------------------------------
    */

    const sortMap = {
      createdAt:
        "l.created_at",

      updatedAt:
        "l.updated_at",

      followUpAt:
        "l.follow_up_at",

      lastTouchAt:
        "l.last_touch_at",

      companyName:
        "c.name",
    };

    const sortColumn =
      sortMap[sort] ||
      "l.created_at";

    const sortDirection =
      String(
        direction
      ).toLowerCase() ===
      "asc"
        ? "ASC"
        : "DESC";

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

          ${whereSql}
        `,
        values
      );

    const total =
      Number(
        countRows[0]
          ?.total ||
          0
      );

    const offset =
      (
        Number(page) -
        1
      ) *
      Number(limit);

    /*
    |--------------------------------------------------------------------------
    | Records
    |--------------------------------------------------------------------------
    */

    const [
      rows,
    ] =
      await pool.query(
        `
          ${LEAD_SELECT}

          ${whereSql}

          ORDER BY
            ${sortColumn}
            ${sortDirection}

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
      leads:
        rows.map(
          mapLead
        ),

      total,
    };
  };

/*
|--------------------------------------------------------------------------
| Find Lead By ID
|--------------------------------------------------------------------------
*/

export const findLeadById =
  async (
    leadId,
    currentUser,
    connection = pool
  ) => {
    const conditions = [
      "l.id = ?",
      "l.deleted_at IS NULL",
    ];

    const values = [
      leadId,
    ];

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

    const [
      rows,
    ] =
      await connection.query(
        `
          ${LEAD_SELECT}

          WHERE
            ${conditions.join(
              " AND "
            )}

          LIMIT 1
        `,
        values
      );

    return mapLead(
      rows[0] ||
        null
    );
  };

/*
|--------------------------------------------------------------------------
| Lead Options
|--------------------------------------------------------------------------
*/

export const listLeadOptions =
  async (
    currentUser,
    connection = pool
  ) => {
    const conditions = [
      "l.deleted_at IS NULL",
    ];

    const values = [];

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
          SELECT
            l.id,

            l.lead_code
              AS leadCode,

            c.name
              AS companyName,

            l.owner_id
              AS ownerId,

            l.primary_contact_id
              AS primaryContactId,

            l.stage,

            l.status,

            l.priority,

            l.next_action
              AS nextAction,

            l.follow_up_at
              AS followUpAt

          FROM leads l

          INNER JOIN companies c
            ON c.id =
              l.company_id

            AND c.deleted_at
              IS NULL

          WHERE
            ${conditions.join(
              " AND "
            )}

          ORDER BY
            c.name ASC,
            l.id DESC
        `,
        values
      );

    return rows.map(
      (row) => ({
        id:
          Number(
            row.id
          ),

        leadCode:
          row.leadCode,

        companyName:
          row.companyName,

        ownerId:
          row.ownerId
            ? Number(
                row.ownerId
              )
            : null,

        primaryContactId:
          row.primaryContactId
            ? Number(
                row.primaryContactId
              )
            : null,

        stage:
          row.stage,

        status:
          row.status,

        priority:
          row.priority,

        nextAction:
          row.nextAction,

        followUpAt:
          row.followUpAt,
      })
    );
  };

/*
|--------------------------------------------------------------------------
| Company
|--------------------------------------------------------------------------
*/

export const findLeadCompany =
  async (
    companyId,
    connection = pool
  ) => {
    const [
      rows,
    ] =
      await connection.query(
        `
          SELECT
            id,
            name

          FROM companies

          WHERE
            id = ?

            AND deleted_at
              IS NULL

          LIMIT 1
        `,
        [
          companyId,
        ]
      );

    return (
      rows[0] ||
      null
    );
  };

/*
|--------------------------------------------------------------------------
| Contact
|--------------------------------------------------------------------------
*/

export const findContactForCompany =
  async (
    contactId,
    companyId,
    connection = pool
  ) => {
    const [
      rows,
    ] =
      await connection.query(
        `
          SELECT
            id,

            company_id
              AS companyId,

            full_name
              AS fullName

          FROM contacts

          WHERE
            id = ?

            AND company_id = ?

            AND deleted_at
              IS NULL

          LIMIT 1
        `,
        [
          contactId,
          companyId,
        ]
      );

    return (
      rows[0] ||
      null
    );
  };

/*
|--------------------------------------------------------------------------
| Owner
|--------------------------------------------------------------------------
*/

export const findLeadOwner =
  async (
    ownerId,
    connection = pool
  ) => {
    const [
      rows,
    ] =
      await connection.query(
        `
          SELECT
            id,

            full_name
              AS fullName,

            role

          FROM users

          WHERE
            id = ?

          LIMIT 1
        `,
        [
          ownerId,
        ]
      );

    return (
      rows[0] ||
      null
    );
  };

/*
|--------------------------------------------------------------------------
| Create Lead
|--------------------------------------------------------------------------
*/

export const insertLead =
  async (
    data,
    userId,
    connection = pool
  ) => {
    /*
    |--------------------------------------------------------------------------
    | Temporary Public ID
    |--------------------------------------------------------------------------
    */

    const temporaryCode =
      `LED-TEMP-${Date.now()}`;

    const [
      result,
    ] =
      await connection.query(
        `
          INSERT INTO leads (
            lead_code,

            company_id,

            primary_contact_id,

            owner_id,

            stage,

            status,

            priority,

            source,

            service_required,

            estimated_value_rupees,

            known_relationship,

            last_touch_at,

            next_action,

            follow_up_at,

            created_by,

            updated_by
          )

          VALUES (
            ?,
            ?,
            ?,
            ?,

            'New',

            'Open',

            ?,
            ?,
            ?,
            ?,
            ?,

            UTC_TIMESTAMP(),

            ?,
            ?,
            ?,
            ?
          )
        `,
        [
          temporaryCode,

          data.companyId,

          data.primaryContactId,

          data.ownerId,

          data.priority,

          data.source,

          data.serviceRequired,

          data.estimatedValueRupees ??
            0,

          data.knownRelationship
            ? 1
            : 0,

          data.nextAction,

          data.followUpAt,

          userId,

          userId,
        ]
      );

    const leadId =
      Number(
        result.insertId
      );

    /*
    |--------------------------------------------------------------------------
    | Public Lead Code
    |--------------------------------------------------------------------------
    */

    const leadCode =
      `LED-${3000 + leadId}`;

    await connection.query(
      `
        UPDATE leads

        SET
          lead_code = ?

        WHERE id = ?
      `,
      [
        leadCode,
        leadId,
      ]
    );

    return {
      leadId,
      leadCode,
    };
  };

/*
|--------------------------------------------------------------------------
| Update Lead
|--------------------------------------------------------------------------
*/

export const updateLead =
  async (
    leadId,
    data,
    userId,
    connection = pool
  ) => {
    const updates = [];

    const values = [];

    const add =
      (
        column,
        value
      ) => {
        updates.push(
          `${column} = ?`
        );

        values.push(
          value
        );
      };

    if (
      data.companyId !==
      undefined
    ) {
      add(
        "company_id",
        data.companyId
      );
    }

    if (
      data.primaryContactId !==
      undefined
    ) {
      add(
        "primary_contact_id",
        data.primaryContactId
      );
    }

    if (
      data.serviceRequired !==
      undefined
    ) {
      add(
        "service_required",
        data.serviceRequired
      );
    }

    if (
      data.source !==
      undefined
    ) {
      add(
        "source",
        data.source
      );
    }

    if (
      data.estimatedValueRupees !==
      undefined
    ) {
      add(
        "estimated_value_rupees",
        data.estimatedValueRupees
      );
    }

    if (
      data.priority !==
      undefined
    ) {
      add(
        "priority",
        data.priority
      );
    }

    if (
      data.nextAction !==
      undefined
    ) {
      add(
        "next_action",
        data.nextAction
      );
    }

    if (
      data.followUpAt !==
      undefined
    ) {
      add(
        "follow_up_at",
        data.followUpAt
      );
    }

    if (
      data.knownRelationship !==
      undefined
    ) {
      add(
        "known_relationship",
        data.knownRelationship
          ? 1
          : 0
      );
    }

    if (
      updates.length ===
      0
    ) {
      return false;
    }

    updates.push(
      "updated_by = ?"
    );

    values.push(
      userId
    );

    values.push(
      leadId
    );

    const [
      result,
    ] =
      await connection.query(
        `
          UPDATE leads

          SET
            ${updates.join(
              ", "
            )}

          WHERE
            id = ?

            AND deleted_at
              IS NULL
        `,
        values
      );

    return (
      result.affectedRows >
      0
    );
  };

/*
|--------------------------------------------------------------------------
| Change Stage
|--------------------------------------------------------------------------
*/

export const updateLeadStage =
  async (
    {
      leadId,
      stage,
      status = null,
      userId,
    },
    connection = pool
  ) => {
    const [
      result,
    ] =
      await connection.query(
        `
          UPDATE leads

          SET
            stage = ?,

            status =
              COALESCE(
                ?,
                status
              ),

            updated_by = ?

          WHERE
            id = ?

            AND deleted_at
              IS NULL
        `,
        [
          stage,

          status,

          userId,

          leadId,
        ]
      );

    return (
      result.affectedRows >
      0
    );
  };

/*
|--------------------------------------------------------------------------
| Change Owner
|--------------------------------------------------------------------------
*/

export const updateLeadOwner =
  async (
    {
      leadId,
      ownerId,
      userId,
    },
    connection = pool
  ) => {
    const [
      result,
    ] =
      await connection.query(
        `
          UPDATE leads

          SET
            owner_id = ?,

            updated_by = ?

          WHERE
            id = ?

            AND deleted_at
              IS NULL
        `,
        [
          ownerId,

          userId,

          leadId,
        ]
      );

    return (
      result.affectedRows >
      0
    );
  };

/*
|--------------------------------------------------------------------------
| Close Lead
|--------------------------------------------------------------------------
*/

export const closeLeadState =
  async (
    {
      leadId,
      stage,
      status,
      nextAction,
      followUpAt,
      userId,
    },
    connection = pool
  ) => {
    const [
      result,
    ] =
      await connection.query(
        `
          UPDATE leads

          SET
            stage = ?,

            status = ?,

            next_action = ?,

            follow_up_at = ?,

            updated_by = ?

          WHERE
            id = ?

            AND deleted_at
              IS NULL
        `,
        [
          stage,

          status,

          nextAction ??
            null,

          followUpAt ??
            null,

          userId,

          leadId,
        ]
      );

    return (
      result.affectedRows >
      0
    );
  };

/*
|--------------------------------------------------------------------------
| Lead Stage History
|--------------------------------------------------------------------------
|
| This is the important corrected section.
|
| Timestamp column:
|
| created_at
|
| NOT:
|
| changed_at
|
*/

export const createLeadStageHistory =
  async (
    {
      leadId,
      previousStage,
      newStage,
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
          INSERT INTO lead_stage_history (
            lead_id,

            previous_stage,

            new_stage,

            reason,

            changed_by,

            created_at
          )

          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            UTC_TIMESTAMP()
          )
        `,
        [
          leadId,

          previousStage ??
            null,

          newStage,

          reason ||
            null,

          userId,
        ]
      );

    return Number(
      result.insertId
    );
  };

/*
|--------------------------------------------------------------------------
| Create Lead Follow-up
|--------------------------------------------------------------------------
*/

export const createLeadFollowup =
  async (
    {
      followupCode,
      leadId,
      assignedTo,
      action,
      dueAt,
      priority,
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

          userId,

          userId,
        ]
      );

    return Number(
      result.insertId
    );
  };