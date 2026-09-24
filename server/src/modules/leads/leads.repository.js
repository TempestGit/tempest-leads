import crypto from "node:crypto";

import pool from "../../config/db.js";

/*
|--------------------------------------------------------------------------
| Lead Mapper
|--------------------------------------------------------------------------
*/

const mapLead = (
  row
) => {
  if (!row) {
    return null;
  }

  const estimatedValuePaise =
    Number(
      row.estimatedValuePaise ||
        0
    );

  return {
    ...row,

    id:
      Number(row.id),

    companyId:
      Number(
        row.companyId
      ),

    primaryContactId:
      Number(
        row.primaryContactId
      ),

    ownerId:
      Number(
        row.ownerId
      ),

    estimatedValuePaise,

    estimatedValueRupees:
      estimatedValuePaise /
      100,

    knownRelationship:
      Boolean(
        row.knownRelationship
      ),

    stageAgeDays:
      Number(
        row.stageAgeDays ||
          0
      ),
  };
};

/*
|--------------------------------------------------------------------------
| Lead SELECT
|--------------------------------------------------------------------------
*/

const LEAD_SELECT = `
  SELECT
    l.id,

    l.lead_code
      AS leadCode,

    l.company_id
      AS companyId,

    c.company_code
      AS companyCode,

    c.name
      AS companyName,

    c.industry,

    c.city,

    c.website,

    l.primary_contact_id
      AS primaryContactId,

    ct.contact_code
      AS primaryContactCode,

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

    u.user_code
      AS ownerCode,

    u.full_name
      AS ownerName,

    u.role
      AS ownerRole,

    l.stage,

    l.status,

    l.priority,

    l.source,

    l.service_required
      AS serviceRequired,

    l.estimated_value_paise
      AS estimatedValuePaise,

    l.next_action
      AS nextAction,

    l.follow_up_at
      AS followUpAt,

    l.last_touch_at
      AS lastTouchAt,

    l.known_relationship
      AS knownRelationship,

    l.lifecycle_reason
      AS lifecycleReason,

    l.notes
      AS description,

    l.created_by
      AS createdBy,

    l.updated_by
      AS updatedBy,

    l.created_at
      AS createdAt,

    l.updated_at
      AS updatedAt,

    TIMESTAMPDIFF(
      DAY,

      COALESCE(
        (
          SELECT
            MAX(lsh.created_at)

          FROM lead_stage_history lsh

          WHERE lsh.lead_id = l.id
        ),

        l.created_at
      ),

      UTC_TIMESTAMP()
    ) AS stageAgeDays

  FROM leads l

  INNER JOIN companies c
    ON c.id = l.company_id
    AND c.deleted_at IS NULL

  LEFT JOIN contacts ct
    ON ct.id = l.primary_contact_id
    AND ct.deleted_at IS NULL

  LEFT JOIN users u
    ON u.id = l.owner_id
    AND u.deleted_at IS NULL
`;

/*
|--------------------------------------------------------------------------
| Find Lead
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
      rows[0] || null
    );
  };

/*
|--------------------------------------------------------------------------
| List Leads
|--------------------------------------------------------------------------
*/

export const listLeads =
  async ({
    search = "",
    ownerId,
    companyId,
    primaryContactId,
    stage,
    status,
    industry,
    source,
    priority,
    page = 1,
    limit = 20,
    sort = "createdAt",
    direction = "desc",

    currentUser,
  }) => {
    const conditions = [
      "l.deleted_at IS NULL",
      "c.deleted_at IS NULL",
    ];

    const values = [];

    /*
    |--------------------------------------------------------------------------
    | Access Scope
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
    } else if (ownerId) {
      conditions.push(
        "l.owner_id = ?"
      );

      values.push(
        ownerId
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
          l.lead_code LIKE ?

          OR c.company_code LIKE ?

          OR c.name LIKE ?

          OR c.website LIKE ?

          OR ct.contact_code LIKE ?

          OR ct.full_name LIKE ?

          OR ct.phone LIKE ?

          OR ct.email LIKE ?
        )
      `);

      values.push(
        term,
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
    | Filters
    |--------------------------------------------------------------------------
    */

    if (companyId) {
      conditions.push(
        "l.company_id = ?"
      );

      values.push(
        companyId
      );
    }

    if (primaryContactId) {
      conditions.push(
        "l.primary_contact_id = ?"
      );

      values.push(
        primaryContactId
      );
    }

    if (stage) {
      conditions.push(
        "l.stage = ?"
      );

      values.push(stage);
    }

    if (status) {
      conditions.push(
        "l.status = ?"
      );

      values.push(status);
    }

    if (industry) {
      conditions.push(
        "c.industry = ?"
      );

      values.push(industry);
    }

    if (source) {
      conditions.push(
        "l.source = ?"
      );

      values.push(source);
    }

    if (priority) {
      conditions.push(
        "l.priority = ?"
      );

      values.push(
        priority
      );
    }

    const whereClause =
      conditions.join(
        " AND "
      );

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

          FROM leads l

          INNER JOIN companies c
            ON c.id = l.company_id
            AND c.deleted_at IS NULL

          LEFT JOIN contacts ct
            ON ct.id = l.primary_contact_id
            AND ct.deleted_at IS NULL

          WHERE
            ${whereClause}
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
    | Sort
    |--------------------------------------------------------------------------
    */

    const sortColumns = {
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

      stage:
        "l.stage",
    };

    const orderColumn =
      sortColumns[sort] ||
      "l.created_at";

    const orderDirection =
      direction === "asc"
        ? "ASC"
        : "DESC";

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
          ${LEAD_SELECT}

          WHERE
            ${whereClause}

          ORDER BY
            ${orderColumn}
            ${orderDirection},
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
          mapLead
        ),

      total,
    };
  };

/*
|--------------------------------------------------------------------------
| Verify Contact Belongs To Company
|--------------------------------------------------------------------------
*/

export const findContactForCompany =
  async (
    contactId,
    companyId,
    connection = pool
  ) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            id,
            company_id AS companyId,
            contact_code AS contactCode,
            full_name AS name,
            status

          FROM contacts

          WHERE id = ?
            AND company_id = ?
            AND status = 'ACTIVE'
            AND deleted_at IS NULL

          LIMIT 1
        `,
        [
          contactId,
          companyId,
        ]
      );

    return rows[0] || null;
  };

/*
|--------------------------------------------------------------------------
| Find Active Owner
|--------------------------------------------------------------------------
*/

export const findActiveOwnerById =
  async (
    ownerId,
    connection = pool
  ) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            id,

            user_code
              AS userCode,

            full_name
              AS fullName,

            email,

            role,

            status

          FROM users

          WHERE id = ?
            AND status = 'ACTIVE'
            AND deleted_at IS NULL

          LIMIT 1
        `,
        [ownerId]
      );

    return rows[0] || null;
  };

/*
|--------------------------------------------------------------------------
| Insert Lead
|--------------------------------------------------------------------------
*/

export const createLead =
  async (
    {
      companyId,
      primaryContactId,
      ownerId,
      serviceRequired,
      source,
      estimatedValuePaise,
      priority,
      description,
      nextAction,
      followUpAt,
      knownRelationship,
      userId,
    },
    connection = pool
  ) => {
    const temporaryCode =
      `TEMP-${crypto.randomUUID()}`;

    const [result] =
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
            estimated_value_paise,
            next_action,
            follow_up_at,
            last_touch_at,
            known_relationship,
            lifecycle_reason,
            notes,
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
            ?,
            UTC_TIMESTAMP(),
            ?,
            NULL,
            ?,
            ?,
            ?
          )
        `,
        [
          temporaryCode,
          companyId,
          primaryContactId,
          ownerId,
          priority,
          source,
          serviceRequired,
          estimatedValuePaise,
          nextAction,
          followUpAt,
          knownRelationship
            ? 1
            : 0,
          description,
          userId,
          userId,
        ]
      );

    return result.insertId;
  };

/*
|--------------------------------------------------------------------------
| Update Lead Code
|--------------------------------------------------------------------------
*/

export const updateLeadCode =
  async (
    leadId,
    leadCode,
    connection = pool
  ) => {
    const [result] =
      await connection.query(
        `
          UPDATE leads

          SET
            lead_code = ?

          WHERE id = ?
            AND deleted_at IS NULL
        `,
        [
          leadCode,
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
| Update Lead Details
|--------------------------------------------------------------------------
*/

export const updateLeadDetails =
  async (
    leadId,
    data,
    userId,
    connection = pool
  ) => {
    const columnMap = {
      companyId:
        "company_id",

      primaryContactId:
        "primary_contact_id",

      serviceRequired:
        "service_required",

      source:
        "source",

      estimatedValuePaise:
        "estimated_value_paise",

      priority:
        "priority",

      description:
        "notes",

      nextAction:
        "next_action",

      followUpAt:
        "follow_up_at",

      knownRelationship:
        "known_relationship",
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
        "knownRelationship"
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
      "last_touch_at = UTC_TIMESTAMP()"
    );

    assignments.push(
      "updated_by = ?"
    );

    values.push(
      userId
    );

    values.push(
      leadId
    );

    const [result] =
      await connection.query(
        `
          UPDATE leads

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

/*
|--------------------------------------------------------------------------
| Change Stage
|--------------------------------------------------------------------------
*/

export const changeLeadStage =
  async (
    {
      leadId,
      stage,
      status,
      reason,
      userId,
    },
    connection = pool
  ) => {
    const [result] =
      await connection.query(
        `
          UPDATE leads

          SET
            stage = ?,
            status = ?,
            lifecycle_reason = ?,
            last_touch_at =
              UTC_TIMESTAMP(),
            updated_by = ?

          WHERE id = ?
            AND deleted_at IS NULL
        `,
        [
          stage,
          status,
          reason,
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

export const changeLeadOwner =
  async (
    leadId,
    ownerId,
    userId,
    connection = pool
  ) => {
    const [result] =
      await connection.query(
        `
          UPDATE leads

          SET
            owner_id = ?,
            last_touch_at =
              UTC_TIMESTAMP(),
            updated_by = ?

          WHERE id = ?
            AND deleted_at IS NULL
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
| Stage History
|--------------------------------------------------------------------------
*/

export const createLeadStageHistory =
  async (
    {
      leadId,
      fromStage,
      toStage,
      changedBy,
      reason,
      metadata = null,
    },
    connection = pool
  ) => {
    const [result] =
      await connection.query(
        `
          INSERT INTO lead_stage_history (
            lead_id,
            from_stage,
            to_stage,
            changed_by,
            reason,
            metadata
          )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
        `,
        [
          leadId,
          fromStage,
          toStage,
          changedBy,
          reason,
          metadata
            ? JSON.stringify(
                metadata
              )
            : null,
        ]
      );

    return result.insertId;
  };

/*
|--------------------------------------------------------------------------
| Activity
|--------------------------------------------------------------------------
*/

export const createLeadActivity =
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
          notes,
          userId,
        ]
      );

    return result.insertId;
  };

/*
|--------------------------------------------------------------------------
| Create Follow-up
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
    const [result] =
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
            NULL,
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
          priority.toUpperCase(),
          userId,
          userId,
        ]
      );

    return result.insertId;
  };

/*
|--------------------------------------------------------------------------
| Reassign Pending Follow-ups
|--------------------------------------------------------------------------
*/

export const reassignPendingFollowups =
  async (
    leadId,
    ownerId,
    userId,
    connection = pool
  ) => {
    const [result] =
      await connection.query(
        `
          UPDATE followups

          SET
            assigned_to = ?,
            updated_by = ?

          WHERE lead_id = ?
            AND status = 'PENDING'
        `,
        [
          ownerId,
          userId,
          leadId,
        ]
      );

    return result.affectedRows;
  };

  /*
|--------------------------------------------------------------------------
| List Active Lead Owners
|--------------------------------------------------------------------------
*/

export const listActiveLeadOwners = async (
  currentUser,
  connection = pool
) => {
  const values = [];

  let condition = `
    status = 'ACTIVE'
    AND deleted_at IS NULL
  `;

  if (
    currentUser.role !==
    "SUPER_ADMIN"
  ) {
    condition += `
      AND id = ?
    `;

    values.push(
      currentUser.id
    );
  }

  const [rows] =
    await connection.query(
      `
        SELECT
          id,
          user_code AS userCode,
          full_name AS name,
          email,
          role

        FROM users

        WHERE ${condition}

        ORDER BY full_name ASC
      `,
      values
    );

  return rows;
};