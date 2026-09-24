import pool from "../../config/db.js";

/*
|--------------------------------------------------------------------------
| Map Assignment
|--------------------------------------------------------------------------
*/

const mapAssignment =
  (
    row
  ) => {
    if (!row) {
      return null;
    }

    return {
      id:
        Number(
          row.id
        ),

      leadId:
        Number(
          row.leadId
        ),

      leadCode:
        row.leadCode,

      companyName:
        row.companyName,

      userId:
        Number(
          row.userId
        ),

      userName:
        row.userName,

      userRole:
        row.userRole,

      memberBranchId:
        row.memberBranchId
          ? Number(
              row.memberBranchId
            )
          : null,

      memberBranchName:
        row.memberBranchName,

      memberBranchCode:
        row.memberBranchCode,

      isCrossBranch:
        Boolean(
          Number(
            row.isCrossBranch ||
              0
          )
        ),

      responsibility:
        row.responsibility,

      assignedBy:
        Number(
          row.assignedBy
        ),

      assignedByName:
        row.assignedByName,

      assignedAt:
        row.assignedAt,

      dueAt:
        row.dueAt,

      status:
        row.status,

      createdAt:
        row.createdAt,

      updatedAt:
        row.updatedAt,
    };
  };

/*
|--------------------------------------------------------------------------
| Common SELECT
|--------------------------------------------------------------------------
*/

const ASSIGNMENT_SELECT = `
  SELECT
    ta.id,

    ta.lead_id
      AS leadId,

    l.lead_code
      AS leadCode,

    c.name
      AS companyName,

    ta.user_id
      AS userId,

    assigned_user.full_name
      AS userName,

    assigned_user.role
      AS userRole,

    ta.member_branch_id
      AS memberBranchId,

    member_branch.name
      AS memberBranchName,

    member_branch.code
      AS memberBranchCode,

    ta.is_cross_branch
      AS isCrossBranch,

    ta.responsibility,

    ta.assigned_by
      AS assignedBy,

    assigned_by_user.full_name
      AS assignedByName,

    ta.assigned_at
      AS assignedAt,

    ta.due_at
      AS dueAt,

    ta.status,

    ta.created_at
      AS createdAt,

    ta.updated_at
      AS updatedAt

  FROM team_assignments ta

  INNER JOIN leads l
    ON l.id =
      ta.lead_id

    AND l.deleted_at
      IS NULL

  INNER JOIN companies c
    ON c.id =
      l.company_id

    AND c.deleted_at
      IS NULL

  INNER JOIN users assigned_user
    ON assigned_user.id =
      ta.user_id

  INNER JOIN users assigned_by_user
    ON assigned_by_user.id =
      ta.assigned_by

  LEFT JOIN branches member_branch
    ON member_branch.id =
      ta.member_branch_id
`;

/*
|--------------------------------------------------------------------------
| Branches
|--------------------------------------------------------------------------
*/

export const listBranches =
  async (
    connection = pool
  ) => {
    const [
      rows,
    ] =
      await connection.query(
        `
          SELECT
            id,
            code,
            name

          FROM branches

          WHERE
            is_active = 1

          ORDER BY
            FIELD(
              code,
              'HYDERABAD',
              'PUNE',
              'BANGALORE',
              'MUMBAI'
            ),
            name ASC
        `
      );

    return rows.map(
      (
        row
      ) => ({
        id:
          Number(
            row.id
          ),

        code:
          row.code,

        name:
          row.name,
      })
    );
  };

/*
|--------------------------------------------------------------------------
| Branch
|--------------------------------------------------------------------------
*/

export const findBranchById =
  async (
    branchId,
    connection = pool
  ) => {
    const [
      rows,
    ] =
      await connection.query(
        `
          SELECT
            id,
            code,
            name

          FROM branches

          WHERE
            id = ?

            AND is_active = 1

          LIMIT 1
        `,
        [
          branchId,
        ]
      );

    if (
      !rows.length
    ) {
      return null;
    }

    return {
      id:
        Number(
          rows[0].id
        ),

      code:
        rows[0].code,

      name:
        rows[0].name,
    };
  };

/*
|--------------------------------------------------------------------------
| Lead
|--------------------------------------------------------------------------
*/

export const findTeamLead =
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
      conditions.push(`
        (
          l.owner_id = ?

          OR EXISTS (
            SELECT 1

            FROM team_assignments ta_access

            WHERE
              ta_access.lead_id =
                l.id

              AND ta_access.user_id = ?
          )
        )
      `);

      values.push(
        currentUser.id,
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

            l.company_id
              AS companyId,

            l.owner_id
              AS ownerId,

            l.branch_id
              AS branchId,

            branch.name
              AS branchName,

            branch.code
              AS branchCode,

            l.stage,

            l.status

          FROM leads l

          LEFT JOIN branches branch
            ON branch.id =
              l.branch_id

          WHERE
            ${conditions.join(
              " AND "
            )}

          LIMIT 1
        `,
        values
      );

    const row =
      rows[0];

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
        Number(
          row.companyId
        ),

      ownerId:
        row.ownerId
          ? Number(
              row.ownerId
            )
          : null,

      branchId:
        row.branchId
          ? Number(
              row.branchId
            )
          : null,

      branchName:
        row.branchName,

      branchCode:
        row.branchCode,

      stage:
        row.stage,

      status:
        row.status,
    };
  };

/*
|--------------------------------------------------------------------------
| Assignable Users
|--------------------------------------------------------------------------
*/

export const listAssignableUsers =
  async (
    branchId,
    connection = pool
  ) => {
    if (
      !branchId
    ) {
      return [];
    }

    const [
      rows,
    ] =
      await connection.query(
        `
          SELECT
            u.id,

            u.full_name
              AS fullName,

            u.role,

            u.branch_id
              AS branchId,

            b.name
              AS branchName,

            b.code
              AS branchCode

          FROM users u

          INNER JOIN branches b
            ON b.id =
              u.branch_id

            AND b.is_active = 1

          WHERE
            u.branch_id = ?

          ORDER BY
            u.full_name ASC
        `,
        [
          branchId,
        ]
      );

    return rows.map(
      (
        row
      ) => ({
        id:
          Number(
            row.id
          ),

        fullName:
          row.fullName,

        role:
          row.role,

        branchId:
          Number(
            row.branchId
          ),

        branchName:
          row.branchName,

        branchCode:
          row.branchCode,
      })
    );
  };

/*
|--------------------------------------------------------------------------
| User
|--------------------------------------------------------------------------
*/

export const findAssignableUser =
  async (
    userId,
    connection = pool
  ) => {
    const [
      rows,
    ] =
      await connection.query(
        `
          SELECT
            u.id,

            u.full_name
              AS fullName,

            u.role,

            u.branch_id
              AS branchId,

            b.name
              AS branchName,

            b.code
              AS branchCode

          FROM users u

          LEFT JOIN branches b
            ON b.id =
              u.branch_id

          WHERE
            u.id = ?

          LIMIT 1
        `,
        [
          userId,
        ]
      );

    if (
      !rows.length
    ) {
      return null;
    }

    const row =
      rows[0];

    return {
      id:
        Number(
          row.id
        ),

      fullName:
        row.fullName,

      role:
        row.role,

      branchId:
        row.branchId
          ? Number(
              row.branchId
            )
          : null,

      branchName:
        row.branchName,

      branchCode:
        row.branchCode,
    };
  };

/*
|--------------------------------------------------------------------------
| List Assignments
|--------------------------------------------------------------------------
*/

export const listTeamAssignmentsByLead =
  async (
    leadId,
    connection = pool
  ) => {
    const [
      rows,
    ] =
      await connection.query(
        `
          ${ASSIGNMENT_SELECT}

          WHERE
            ta.lead_id = ?

          ORDER BY
            FIELD(
              ta.responsibility,
              'ACCOUNT_SERVICING',
              'STRATEGY',
              'CREATIVE',
              'DESIGN',
              'COPY',
              'MEDIA_DIGITAL',
              'PRODUCTION',
              'PRESENTATION_OWNER'
            ),

            ta.id ASC
        `,
        [
          leadId,
        ]
      );

    return rows.map(
      mapAssignment
    );
  };

/*
|--------------------------------------------------------------------------
| Find Responsibility
|--------------------------------------------------------------------------
*/

export const findTeamAssignmentByResponsibility =
  async (
    leadId,
    responsibility,
    connection = pool
  ) => {
    const [
      rows,
    ] =
      await connection.query(
        `
          ${ASSIGNMENT_SELECT}

          WHERE
            ta.lead_id = ?

            AND ta.responsibility = ?

          LIMIT 1
        `,
        [
          leadId,
          responsibility,
        ]
      );

    return mapAssignment(
      rows[0] ||
        null
    );
  };

/*
|--------------------------------------------------------------------------
| Find ID
|--------------------------------------------------------------------------
*/

export const findTeamAssignmentById =
  async (
    assignmentId,
    connection = pool
  ) => {
    const [
      rows,
    ] =
      await connection.query(
        `
          ${ASSIGNMENT_SELECT}

          WHERE
            ta.id = ?

          LIMIT 1
        `,
        [
          assignmentId,
        ]
      );

    return mapAssignment(
      rows[0] ||
        null
    );
  };

/*
|--------------------------------------------------------------------------
| Upsert
|--------------------------------------------------------------------------
*/

export const upsertTeamAssignment =
  async (
    {
      leadId,
      userId,
      memberBranchId,
      isCrossBranch,
      responsibility,
      dueAt,
      status,
      assignedBy,
    },
    connection = pool
  ) => {
    const [
      result,
    ] =
      await connection.query(
        `
          INSERT INTO team_assignments (
            lead_id,
            user_id,
            member_branch_id,
            is_cross_branch,
            responsibility,
            assigned_by,
            assigned_at,
            due_at,
            status
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

            id =
              LAST_INSERT_ID(
                id
              ),

            user_id =
              VALUES(
                user_id
              ),

            member_branch_id =
              VALUES(
                member_branch_id
              ),

            is_cross_branch =
              VALUES(
                is_cross_branch
              ),

            assigned_by =
              VALUES(
                assigned_by
              ),

            assigned_at =
              UTC_TIMESTAMP(),

            due_at =
              VALUES(
                due_at
              ),

            status =
              VALUES(
                status
              ),

            updated_at =
              UTC_TIMESTAMP()
        `,
        [
          leadId,

          userId,

          memberBranchId,

          isCrossBranch
            ? 1
            : 0,

          responsibility,

          assignedBy,

          dueAt ||
            null,

          status,
        ]
      );

    return Number(
      result.insertId
    );
  };

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

export const updateTeamAssignmentStatus =
  async (
    {
      assignmentId,
      status,
    },
    connection = pool
  ) => {
    const [
      result,
    ] =
      await connection.query(
        `
          UPDATE team_assignments

          SET
            status = ?,

            updated_at =
              UTC_TIMESTAMP()

          WHERE
            id = ?
        `,
        [
          status,
          assignmentId,
        ]
      );

    return (
      result.affectedRows >
      0
    );
  };

/*
|--------------------------------------------------------------------------
| Delete
|--------------------------------------------------------------------------
*/

export const deleteTeamAssignment =
  async (
    assignmentId,
    connection = pool
  ) => {
    const [
      result,
    ] =
      await connection.query(
        `
          DELETE FROM team_assignments

          WHERE id = ?
        `,
        [
          assignmentId,
        ]
      );

    return (
      result.affectedRows >
      0
    );
  };