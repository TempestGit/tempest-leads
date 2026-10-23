import pool from "../../config/db.js";

const USER_SELECT = `
  id, user_code, full_name, email, password_hash,
  role, department, location, status, last_login_at,
  password_changed_at, must_change_password,
  token_version, created_at, updated_at
`;

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT ${USER_SELECT}
     FROM users
     WHERE email = ? AND deleted_at IS NULL
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
};

export const findUserById = async (
  userId,
  connection = pool
) => {
  const [rows] = await connection.query(
    `SELECT ${USER_SELECT}
     FROM users
     WHERE id = ? AND deleted_at IS NULL
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
};

export const updateLastLogin = async (userId) => {
  await pool.query(
    `UPDATE users
     SET last_login_at = UTC_TIMESTAMP()
     WHERE id = ?`,
    [userId]
  );
};

export const updateUserProfile = async ({
  userId,
  fullName,
  department,
  location,
  connection = pool,
}) => {
  const fields = [];
  const values = [];

  if (fullName !== undefined) {
    fields.push("full_name = ?");
    values.push(fullName);
  }

  if (department !== undefined) {
    fields.push("department = ?");
    values.push(department);
  }

  if (location !== undefined) {
    fields.push("location = ?");
    values.push(location);
  }

  if (fields.length === 0) {
    return 0;
  }

  values.push(userId);

  const [result] = await connection.query(
    `UPDATE users
     SET ${fields.join(", ")},
         updated_at = UTC_TIMESTAMP()
     WHERE id = ?
       AND status = 'ACTIVE'
       AND deleted_at IS NULL`,
    values
  );

  return result.affectedRows;
};

/*
|--------------------------------------------------------------------------
| Persistent Sessions
|--------------------------------------------------------------------------
*/

export const createAuthSession = async ({
  userId,
  sessionKey,
  expiresAt,
  ipAddress,
  userAgent,
  connection = pool,
}) => {
  const [result] = await connection.query(
    `INSERT INTO auth_sessions
       (
         user_id,
         session_key,
         created_ip,
         user_agent,
         expires_at
       )
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId,
      sessionKey,
      ipAddress || null,
      userAgent || null,
      expiresAt,
    ]
  );

  return result.insertId;
};

export const findActiveAuthSession = async ({
  userId,
  sessionKey,
  connection = pool,
}) => {
  const [rows] = await connection.query(
    `SELECT id, user_id, session_key, expires_at
     FROM auth_sessions
     WHERE user_id = ?
       AND session_key = ?
       AND revoked_at IS NULL
       AND expires_at > UTC_TIMESTAMP()
     LIMIT 1`,
    [userId, sessionKey]
  );

  return rows[0] || null;
};

export const findAuthSessionForUpdate = async ({
  userId,
  sessionKey,
  connection,
}) => {
  const [rows] = await connection.query(
    `SELECT id, user_id, session_key, expires_at,
            revoked_at
     FROM auth_sessions
     WHERE user_id = ?
       AND session_key = ?
     LIMIT 1 FOR UPDATE`,
    [userId, sessionKey]
  );

  return rows[0] || null;
};

export const listUserAuthSessions = async (
  userId,
  connection = pool
) => {
  const [rows] = await connection.query(
    `SELECT
       id,
       session_key,
       created_ip,
       user_agent,
       created_at,
       last_activity_at,
       expires_at
     FROM auth_sessions
     WHERE user_id = ?
       AND revoked_at IS NULL
       AND expires_at > UTC_TIMESTAMP()
     ORDER BY last_activity_at DESC, id DESC`,
    [userId]
  );

  return rows;
};

export const touchAuthSession = async ({
  sessionId,
  expiresAt,
  connection = pool,
}) => {
  await connection.query(
    `UPDATE auth_sessions
     SET last_activity_at = UTC_TIMESTAMP(),
         expires_at = ?
     WHERE id = ?
       AND revoked_at IS NULL`,
    [expiresAt, sessionId]
  );
};

export const revokeAuthSession = async ({
  userId,
  sessionId,
  connection = pool,
}) => {
  const [result] = await connection.query(
    `UPDATE auth_sessions
     SET revoked_at = UTC_TIMESTAMP()
     WHERE id = ?
       AND user_id = ?
       AND revoked_at IS NULL`,
    [sessionId, userId]
  );

  return result.affectedRows;
};

export const revokeOtherAuthSessions = async ({
  userId,
  currentSessionId,
  connection = pool,
}) => {
  const [result] = await connection.query(
    `UPDATE auth_sessions
     SET revoked_at = UTC_TIMESTAMP()
     WHERE user_id = ?
       AND id <> ?
       AND revoked_at IS NULL`,
    [userId, currentSessionId]
  );

  return result.affectedRows;
};

export const revokeAllAuthSessions = async (
  userId,
  connection = pool
) => {
  const [result] = await connection.query(
    `UPDATE auth_sessions
     SET revoked_at = UTC_TIMESTAMP()
     WHERE user_id = ?
       AND revoked_at IS NULL`,
    [userId]
  );

  return result.affectedRows;
};

/*
|--------------------------------------------------------------------------
| Refresh Tokens
|--------------------------------------------------------------------------
*/

export const createRefreshToken = async ({
  userId,
  tokenHash,
  expiresAt,
  ipAddress,
  userAgent,
  sessionId,
  connection = pool,
}) => {
  const [result] = await connection.query(
    `INSERT INTO refresh_tokens
       (
         user_id,
         token_hash,
         expires_at,
         created_ip,
         user_agent,
         session_id
       )
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      tokenHash,
      expiresAt,
      ipAddress || null,
      userAgent || null,
      sessionId,
    ]
  );

  return result.insertId;
};

export const findRefreshTokenForUpdate = async (
  tokenHash,
  connection
) => {
  const [rows] = await connection.query(
    `SELECT
       id,
       user_id,
       token_hash,
       expires_at,
       revoked_at,
       replaced_by_token_id,
       session_id
     FROM refresh_tokens
     WHERE token_hash = ?
     LIMIT 1 FOR UPDATE`,
    [tokenHash]
  );

  return rows[0] || null;
};

export const revokeRefreshToken = async ({
  tokenId,
  replacedByTokenId = null,
  connection = pool,
}) => {
  await connection.query(
    `UPDATE refresh_tokens
     SET revoked_at = COALESCE(
           revoked_at,
           UTC_TIMESTAMP()
         ),
         replaced_by_token_id = ?
     WHERE id = ?`,
    [replacedByTokenId, tokenId]
  );
};

export const revokeRefreshTokenByHash = async (
  tokenHash,
  connection = pool
) => {
  await connection.query(
    `UPDATE refresh_tokens
     SET revoked_at = COALESCE(
           revoked_at,
           UTC_TIMESTAMP()
         )
     WHERE token_hash = ?`,
    [tokenHash]
  );
};

export const revokeSessionRefreshTokens = async ({
  sessionId,
  connection = pool,
}) => {
  await connection.query(
    `UPDATE refresh_tokens
     SET revoked_at = COALESCE(
           revoked_at,
           UTC_TIMESTAMP()
         )
     WHERE session_id = ?
       AND revoked_at IS NULL`,
    [sessionId]
  );
};

export const revokeOtherSessionRefreshTokens = async ({
  userId,
  currentSessionId,
  connection = pool,
}) => {
  await connection.query(
    `UPDATE refresh_tokens
     SET revoked_at = COALESCE(
           revoked_at,
           UTC_TIMESTAMP()
         )
     WHERE user_id = ?
       AND (session_id IS NULL OR session_id <> ?)
       AND revoked_at IS NULL`,
    [userId, currentSessionId]
  );
};

export const revokeAllUserTokens = async (
  userId,
  connection = pool
) => {
  await connection.query(
    `UPDATE refresh_tokens
     SET revoked_at = COALESCE(
           revoked_at,
           UTC_TIMESTAMP()
         )
     WHERE user_id = ?
       AND revoked_at IS NULL`,
    [userId]
  );
};

export const changeUserPassword = async ({
  userId,
  passwordHash,
  connection = pool,
}) => {
  const [result] = await connection.query(
    `UPDATE users
     SET password_hash = ?,
         must_change_password = 0,
         password_changed_at = UTC_TIMESTAMP(),
         token_version = token_version + 1
     WHERE id = ?
       AND status = 'ACTIVE'
       AND deleted_at IS NULL`,
    [passwordHash, userId]
  );

  return result.affectedRows;
};

/*
|--------------------------------------------------------------------------
| Password Reset Tokens
|--------------------------------------------------------------------------
*/

export const createPasswordResetToken = async ({
  userId,
  tokenHash,
  expiresAt,
  connection = pool,
}) => {
  const [result] = await connection.query(
    `INSERT INTO password_reset_tokens
       (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [userId, tokenHash, expiresAt]
  );

  return result.insertId;
};

export const findPasswordResetTokenForUpdate = async (
  tokenHash,
  connection
) => {
  const [rows] = await connection.query(
    `SELECT
       prt.id,
       prt.user_id,
       prt.expires_at,
       prt.used_at,
       u.password_hash,
       u.status
     FROM password_reset_tokens prt
     INNER JOIN users u ON u.id = prt.user_id
     WHERE prt.token_hash = ?
       AND u.deleted_at IS NULL
     LIMIT 1 FOR UPDATE`,
    [tokenHash]
  );

  return rows[0] || null;
};

export const invalidatePasswordResetTokens = async (
  userId,
  connection = pool
) => {
  await connection.query(
    `UPDATE password_reset_tokens
     SET used_at = UTC_TIMESTAMP()
     WHERE user_id = ?
       AND used_at IS NULL`,
    [userId]
  );
};