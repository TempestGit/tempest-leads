
import pool from "../../config/db.js";

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT id, user_code, full_name, email, password_hash,
            role, department, location, status, last_login_at,
            password_changed_at, must_change_password,
            created_at, updated_at
     FROM users
     WHERE email = ? AND deleted_at IS NULL
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
};

export const findUserById = async (userId) => {
  const [rows] = await pool.query(
    `SELECT id, user_code, full_name, email, password_hash,
            role, department, location, status, last_login_at,
            password_changed_at, must_change_password,
            created_at, updated_at
     FROM users
     WHERE id = ? AND deleted_at IS NULL
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
};

export const updateLastLogin = async (userId) => {
  await pool.query(
    `UPDATE users SET last_login_at = UTC_TIMESTAMP()
     WHERE id = ?`,
    [userId]
  );
};

export const createRefreshToken = async ({
  userId,
  tokenHash,
  expiresAt,
  ipAddress,
  userAgent,
  connection = pool,
}) => {
  const [result] = await connection.query(
    `INSERT INTO refresh_tokens
       (user_id, token_hash, expires_at, created_ip, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId,
      tokenHash,
      expiresAt,
      ipAddress || null,
      userAgent || null,
    ]
  );

  return result.insertId;
};

export const findRefreshTokenForUpdate = async (
  tokenHash,
  connection
) => {
  const [rows] = await connection.query(
    `SELECT id, user_id, token_hash, expires_at,
            revoked_at, replaced_by_token_id
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
     SET revoked_at = COALESCE(revoked_at, UTC_TIMESTAMP()),
         replaced_by_token_id = ?
     WHERE id = ?`,
    [replacedByTokenId, tokenId]
  );
};

export const revokeRefreshTokenByHash = async (tokenHash) => {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = COALESCE(revoked_at, UTC_TIMESTAMP())
     WHERE token_hash = ?`,
    [tokenHash]
  );
};

export const revokeAllUserTokens = async (
  userId,
  connection = pool
) => {
  await connection.query(
    `UPDATE refresh_tokens
     SET revoked_at = COALESCE(revoked_at, UTC_TIMESTAMP())
     WHERE user_id = ? AND revoked_at IS NULL`,
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
         password_changed_at = UTC_TIMESTAMP()
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
     LIMIT 1
     FOR UPDATE`,
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