import crypto from "node:crypto";
import bcrypt from "bcryptjs";

import pool from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";

import {
  findUserByEmail,
  createPasswordResetToken,
  findPasswordResetTokenForUpdate,
  invalidatePasswordResetTokens,
  changeUserPassword,
  revokeAllUserTokens,
  revokeAllAuthSessions,
} from "./auth.repository.js";

import { sendPasswordResetEmail } from "./passwordReset.email.js";

const hashResetToken = (token) =>
  crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

const GENERIC_MESSAGE =
  "If an active account exists for this email, a password reset link will be sent.";

export const requestPasswordReset = async ({ email }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await findUserByEmail(normalizedEmail);

  if (!user || user.status !== "ACTIVE") {
    return { message: GENERIC_MESSAGE };
  }

  const [recent] = await pool.query(
    `SELECT id
     FROM password_reset_tokens
     WHERE user_id = ?
       AND created_at > DATE_SUB(
         UTC_TIMESTAMP(),
         INTERVAL 60 SECOND
       )
     LIMIT 1`,
    [user.id]
  );

  if (recent.length > 0) {
    return { message: GENERIC_MESSAGE };
  }

  const rawToken = crypto
    .randomBytes(32)
    .toString("hex");

  const tokenHash = hashResetToken(rawToken);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO password_reset_tokens
         (user_id, token_hash, expires_at)
       VALUES (
         ?,
         ?,
         DATE_ADD(
           UTC_TIMESTAMP(),
           INTERVAL 15 MINUTE
         )
       )`,
      [user.id, tokenHash]
    );

    await connection.commit();
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Ignore rollback failures.
    }

    throw error;
  } finally {
    connection.release();
  }

  try {
    await sendPasswordResetEmail({
      fullName: user.full_name,
      email: user.email,
      token: rawToken,
    });
  } catch (error) {
    console.error(
      "[Password reset] Email delivery request failed:",
      error.message
    );
  }

  return { message: GENERIC_MESSAGE };
};

export const resetPassword = async ({
  token,
  newPassword,
}) => {
  const tokenHash = hashResetToken(
    token.toLowerCase()
  );

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const resetRecord =
      await findPasswordResetTokenForUpdate(
        tokenHash,
        connection
      );

    if (!resetRecord || resetRecord.used_at) {
      throw new ApiError(
        400,
        "This password reset link is invalid or has already been used.",
        [],
        "INVALID_RESET_TOKEN"
      );
    }

    const [expiryRows] = await connection.query(
      `SELECT (? <= UTC_TIMESTAMP()) AS expired`,
      [resetRecord.expires_at]
    );

    if (Number(expiryRows[0].expired) === 1) {
      throw new ApiError(
        400,
        "This password reset link has expired. Request a new link.",
        [],
        "RESET_TOKEN_EXPIRED"
      );
    }

    if (resetRecord.status !== "ACTIVE") {
      throw new ApiError(
        403,
        "This account is inactive.",
        [],
        "ACCOUNT_INACTIVE"
      );
    }

    const reused = await bcrypt.compare(
      newPassword,
      resetRecord.password_hash
    );

    if (reused) {
      throw new ApiError(
        422,
        "Your new password must be different from your previous password.",
        [],
        "PASSWORD_REUSED"
      );
    }

    const passwordHash = await bcrypt.hash(
      newPassword,
      12
    );

    const changed = await changeUserPassword({
      userId: resetRecord.user_id,
      passwordHash,
      connection,
    });

    if (changed !== 1) {
      throw new ApiError(
        409,
        "Unable to update the account password.",
        [],
        "PASSWORD_UPDATE_FAILED"
      );
    }

    await invalidatePasswordResetTokens(
      resetRecord.user_id,
      connection
    );

    await revokeAllUserTokens(
      resetRecord.user_id,
      connection
    );

    await revokeAllAuthSessions(
      resetRecord.user_id,
      connection
    );

    await connection.commit();

    return {
      passwordReset: true,
      requiresLogin: true,
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Ignore rollback failures.
    }

    throw error;
  } finally {
    connection.release();
  }
};