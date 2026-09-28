import crypto from "node:crypto";

import pool from "../../config/db.js";

const mapUser = (row) => {
  if (!row) {
    return null;
  }

  return {
    id:
      Number(row.id),

    userCode:
      row.userCode,

    fullName:
      row.fullName,

    email:
      row.email,

    role:
      row.role,

    department:
      row.department,

    location:
      row.location,

    status:
      row.status,

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

    assignedLeads:
      Number(
        row.assignedLeads ||
          0
      ),

    lastLoginAt:
      row.lastLoginAt,

    createdAt:
      row.createdAt,

    updatedAt:
      row.updatedAt,
  };
};

const USER_SELECT = `
  SELECT
    u.id,

    u.user_code
      AS userCode,

    u.full_name
      AS fullName,

    u.email,

    u.role,

    u.department,

    u.location,

    u.status,

    u.branch_id
      AS branchId,

    b.name
      AS branchName,

    b.code
      AS branchCode,

    u.last_login_at
      AS lastLoginAt,

    u.created_at
      AS createdAt,

    u.updated_at
      AS updatedAt,

    (
      SELECT COUNT(*)

      FROM leads l

      WHERE
        l.owner_id = u.id

        AND l.deleted_at
          IS NULL
    ) AS assignedLeads

  FROM users u

  LEFT JOIN branches b
    ON b.id =
      u.branch_id
`;

export const listUsers =
  async (
    {
      search,
      status,
      branchId,
    } = {},
    connection = pool
  ) => {
    const conditions = [
      "u.deleted_at IS NULL",
    ];

    const values = [];

    if (search) {
      const term =
        `%${search}%`;

      conditions.push(`
        (
          u.full_name LIKE ?
          OR u.email LIKE ?
          OR u.user_code LIKE ?
          OR u.department LIKE ?
        )
      `);

      values.push(
        term,
        term,
        term,
        term
      );
    }

    if (status) {
      conditions.push(
        "u.status = ?"
      );

      values.push(
        status
      );
    }

    if (branchId) {
      conditions.push(
        "u.branch_id = ?"
      );

      values.push(
        branchId
      );
    }

    const [rows] =
      await connection.query(
        `
          ${USER_SELECT}

          WHERE
            ${conditions.join(
              " AND "
            )}

          ORDER BY
            CASE
              WHEN u.role =
                'SUPER_ADMIN'
              THEN 0
              ELSE 1
            END,

            u.full_name ASC
        `,
        values
      );

    return rows.map(
      mapUser
    );
  };

export const listActiveBranches =
  async (
    connection = pool
  ) => {
    const [rows] =
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
      (row) => ({
        id:
          Number(row.id),

        code:
          row.code,

        name:
          row.name,
      })
    );
  };

export const findBranchById =
  async (
    branchId,
    connection = pool
  ) => {
    const [rows] =
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

    return rows[0]
      ? {
          id:
            Number(
              rows[0].id
            ),

          code:
            rows[0].code,

          name:
            rows[0].name,
        }
      : null;
  };

export const findUserById =
  async (
    userId,
    connection = pool
  ) => {
    const [rows] =
      await connection.query(
        `
          ${USER_SELECT}

          WHERE
            u.id = ?

            AND u.deleted_at
              IS NULL

          LIMIT 1
        `,
        [
          userId,
        ]
      );

    return mapUser(
      rows[0]
    );
  };

export const findUserByEmail =
  async (
    email,
    connection = pool
  ) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            id,
            email

          FROM users

          WHERE
            LOWER(email) =
              LOWER(?)

            AND deleted_at
              IS NULL

          LIMIT 1
        `,
        [
          email,
        ]
      );

    return rows[0] || null;
  };

export const insertUser =
  async (
    {
      fullName,
      email,
      passwordHash,
      role,
      department,
      location,
      branchId,
    },
    connection = pool
  ) => {
    /*
     * Keep temporary code <= VARCHAR(32).
     */
    const temporaryCode =
      `USR-TEMP-${crypto
        .randomBytes(8)
        .toString("hex")}`;

    const [result] =
      await connection.query(
        `
          INSERT INTO users (
            user_code,
            full_name,
            email,
            password_hash,
            role,
            department,
            location,
            status,
            branch_id
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
            ?
          )
        `,
        [
          temporaryCode,
          fullName,
          email,
          passwordHash,
          role,
          department ||
            null,
          location ||
            null,
          branchId ||
            null,
        ]
      );

    return Number(
      result.insertId
    );
  };

export const updateUserCode =
  async (
    userId,
    userCode,
    connection = pool
  ) => {
    await connection.query(
      `
        UPDATE users

        SET
          user_code = ?

        WHERE id = ?
      `,
      [
        userCode,
        userId,
      ]
    );
  };

export const updateUserDetails =
  async (
    userId,
    {
      fullName,
      email,
      role,
      department,
      location,
      branchId,
    },
    connection = pool
  ) => {
    await connection.query(
      `
        UPDATE users

        SET
          full_name = ?,
          email = ?,
          role = ?,
          department = ?,
          location = ?,
          branch_id = ?,
          updated_at =
            UTC_TIMESTAMP()

        WHERE
          id = ?

          AND deleted_at
            IS NULL
      `,
      [
        fullName,
        email,
        role,
        department ||
          null,
        location ||
          null,
        branchId ||
          null,
        userId,
      ]
    );
  };

export const updateUserPassword =
  async (
    userId,
    passwordHash,
    connection = pool
  ) => {
    await connection.query(
      `
        UPDATE users

        SET
          password_hash = ?,
          password_changed_at =
            UTC_TIMESTAMP(),
          updated_at =
            UTC_TIMESTAMP()

        WHERE
          id = ?

          AND deleted_at
            IS NULL
      `,
      [
        passwordHash,
        userId,
      ]
    );
  };

export const setUserStatus =
  async (
    userId,
    status,
    connection = pool
  ) => {
    await connection.query(
      `
        UPDATE users

        SET
          status = ?,
          updated_at =
            UTC_TIMESTAMP()

        WHERE
          id = ?

          AND deleted_at
            IS NULL
      `,
      [
        status,
        userId,
      ]
    );
  };

export const findActiveSuperAdmin =
  async (
    excludeUserId = null,
    connection = pool
  ) => {
    const values = [];

    let excludeSql = "";

    if (excludeUserId) {
      excludeSql =
        "AND id <> ?";

      values.push(
        excludeUserId
      );
    }

    const [rows] =
      await connection.query(
        `
          SELECT
            id,
            full_name AS fullName

          FROM users

          WHERE
            role =
              'SUPER_ADMIN'

            AND status =
              'ACTIVE'

            AND deleted_at
              IS NULL

            ${excludeSql}

          ORDER BY id ASC

          LIMIT 1
        `,
        values
      );

    return rows[0]
      ? {
          id:
            Number(
              rows[0].id
            ),

          fullName:
            rows[0].fullName,
        }
      : null;
  };

export const reassignOwnedLeads =
  async (
    fromUserId,
    toUserId,
    connection = pool
  ) => {
    const [result] =
      await connection.query(
        `
          UPDATE leads

          SET
            owner_id = ?,
            updated_by = ?,
            updated_at =
              UTC_TIMESTAMP()

          WHERE
            owner_id = ?

            AND deleted_at
              IS NULL
        `,
        [
          toUserId,
          toUserId,
          fromUserId,
        ]
      );

    return Number(
      result.affectedRows ||
        0
    );
  };

export const countOwnedLeadsOutsideBranch =
  async (
    userId,
    branchId,
    connection = pool
  ) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            COUNT(*) AS total

          FROM leads

          WHERE
            owner_id = ?

            AND deleted_at
              IS NULL

            AND (
              branch_id IS NULL
              OR branch_id <> ?
            )
        `,
        [
          userId,
          branchId,
        ]
      );

    return Number(
      rows[0]?.total ||
        0
    );
  };