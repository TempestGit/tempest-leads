import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import pool from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";

import {
  generateAccessToken,
  generateRefreshToken,
  generateSessionKey,
  verifyRefreshToken,
  hashToken,
} from "../../utils/token.js";

import {
  findUserByEmail,
  findUserById,
  updateLastLogin,
  updateUserProfile,
  createAuthSession,
  findActiveAuthSession,
  findAuthSessionForUpdate,
  listUserAuthSessions,
  touchAuthSession,
  revokeAuthSession,
  revokeOtherAuthSessions,
  revokeAllAuthSessions,
  createRefreshToken,
  findRefreshTokenForUpdate,
  revokeRefreshToken,
  revokeRefreshTokenByHash,
  revokeSessionRefreshTokens,
  revokeOtherSessionRefreshTokens,
  revokeAllUserTokens,
  changeUserPassword,
} from "./auth.repository.js";

const sanitizeUser = (user) => ({
  id: user.id,
  userCode: user.user_code,
  fullName: user.full_name,
  email: user.email,
  role: user.role,
  department: user.department,
  location: user.location,
  status: user.status,
  lastLoginAt: user.last_login_at,
  mustChangePassword: Boolean(user.must_change_password),
});

const sessionError = () =>
  new ApiError(
    401,
    "Your session has expired or been revoked. Please sign in again.",
    [],
    "SESSION_REVOKED"
  );

const withTransaction = async (callback) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const result = await callback(connection);

    await connection.commit();

    return result;
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

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export const login = async ({
  email,
  password,
  ipAddress,
  userAgent,
}) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(
      401,
      "Invalid email or password.",
      [],
      "INVALID_CREDENTIALS"
    );
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(
      403,
      "Your account is inactive.",
      [],
      "ACCOUNT_INACTIVE"
    );
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    throw new ApiError(
      401,
      "Invalid email or password.",
      [],
      "INVALID_CREDENTIALS"
    );
  }

  const sessionKey = generateSessionKey();

  const refresh = generateRefreshToken(
    user,
    sessionKey
  );

  await withTransaction(async (connection) => {
    const currentUser = await findUserById(
      user.id,
      connection
    );

    if (
      !currentUser ||
      currentUser.status !== "ACTIVE" ||
      currentUser.password_hash !== user.password_hash
    ) {
      throw sessionError();
    }

    const sessionId = await createAuthSession({
      userId: user.id,
      sessionKey,
      expiresAt: refresh.expiresAt,
      ipAddress,
      userAgent,
      connection,
    });

    await createRefreshToken({
      userId: user.id,
      tokenHash: hashToken(refresh.token),
      expiresAt: refresh.expiresAt,
      ipAddress,
      userAgent,
      sessionId,
      connection,
    });
  });

  await updateLastLogin(user.id);

  const currentUser = await findUserById(user.id);

  return {
    user: sanitizeUser(currentUser),
    accessToken: generateAccessToken(
      currentUser,
      sessionKey
    ),
    refreshToken: refresh.token,
    refreshTokenExpiresAt: refresh.expiresAt,
  };
};

/*
|--------------------------------------------------------------------------
| Refresh Session
|--------------------------------------------------------------------------
*/

export const refreshSession = async ({
  refreshToken,
  ipAddress,
  userAgent,
}) => {
  if (!refreshToken) {
    throw new ApiError(
      401,
      "Refresh token is missing.",
      [],
      "REFRESH_TOKEN_MISSING"
    );
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(
        401,
        "Session has expired.",
        [],
        "REFRESH_TOKEN_EXPIRED"
      );
    }

    throw new ApiError(
      401,
      "Invalid refresh token.",
      [],
      "INVALID_REFRESH_TOKEN"
    );
  }

  if (
    payload.type !== "refresh" ||
    !payload.sub ||
    typeof payload.sid !== "string" ||
    !payload.sid
  ) {
    throw sessionError();
  }

  const tokenHash = hashToken(refreshToken);

  const outcome = await withTransaction(
    async (connection) => {
      const storedToken = await findRefreshTokenForUpdate(
        tokenHash,
        connection
      );

      if (!storedToken) {
        throw sessionError();
      }

      if (
        String(storedToken.user_id) !==
        String(payload.sub)
      ) {
        throw sessionError();
      }

      if (!storedToken.session_id) {
        throw sessionError();
      }

      const session = await findAuthSessionForUpdate({
        userId: storedToken.user_id,
        sessionKey: payload.sid,
        connection,
      });

      if (
        !session ||
        String(session.id) !==
          String(storedToken.session_id)
      ) {
        throw sessionError();
      }

      if (session.revoked_at) {
        throw sessionError();
      }

      // Detect a previously rotated refresh token.
      if (storedToken.revoked_at) {
        await revokeAuthSession({
          userId: storedToken.user_id,
          sessionId: session.id,
          connection,
        });

        await revokeSessionRefreshTokens({
          sessionId: session.id,
          connection,
        });

        return {
          rejected: true,
          code: "REFRESH_TOKEN_REUSED",
        };
      }

      const [expiryRows] = await connection.query(
        `SELECT
           (? <= UTC_TIMESTAMP()) AS token_expired,
           (? <= UTC_TIMESTAMP()) AS session_expired`,
        [
          storedToken.expires_at,
          session.expires_at,
        ]
      );

      if (
        Number(expiryRows[0].token_expired) === 1 ||
        Number(expiryRows[0].session_expired) === 1
      ) {
        await revokeAuthSession({
          userId: storedToken.user_id,
          sessionId: session.id,
          connection,
        });

        await revokeSessionRefreshTokens({
          sessionId: session.id,
          connection,
        });

        return {
          rejected: true,
          code: "REFRESH_TOKEN_EXPIRED",
        };
      }

      const user = await findUserById(
        storedToken.user_id,
        connection
      );

      if (!user || user.status !== "ACTIVE") {
        await revokeAuthSession({
          userId: storedToken.user_id,
          sessionId: session.id,
          connection,
        });

        await revokeSessionRefreshTokens({
          sessionId: session.id,
          connection,
        });

        return {
          rejected: true,
          code: "SESSION_REVOKED",
        };
      }

      const replacement = generateRefreshToken(
        user,
        session.session_key
      );

      const replacementId = await createRefreshToken({
        userId: user.id,
        tokenHash: hashToken(replacement.token),
        expiresAt: replacement.expiresAt,
        ipAddress,
        userAgent,
        sessionId: session.id,
        connection,
      });

      await revokeRefreshToken({
        tokenId: storedToken.id,
        replacedByTokenId: replacementId,
        connection,
      });

      await touchAuthSession({
        sessionId: session.id,
        expiresAt: replacement.expiresAt,
        connection,
      });

      return {
        user: sanitizeUser(user),
        accessToken: generateAccessToken(
          user,
          session.session_key
        ),
        refreshToken: replacement.token,
        refreshTokenExpiresAt: replacement.expiresAt,
      };
    }
  );

  if (outcome.rejected) {
    if (outcome.code === "REFRESH_TOKEN_REUSED") {
      throw new ApiError(
        401,
        "This session is no longer valid. Please sign in again.",
        [],
        "REFRESH_TOKEN_REUSED"
      );
    }

    throw sessionError();
  }

  return outcome;
};

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

export const logout = async (refreshToken) => {
  if (!refreshToken) return;

  const tokenHash = hashToken(refreshToken);

  await withTransaction(async (connection) => {
    const storedToken = await findRefreshTokenForUpdate(
      tokenHash,
      connection
    );

    if (!storedToken) return;

    if (storedToken.session_id) {
      await revokeAuthSession({
        userId: storedToken.user_id,
        sessionId: storedToken.session_id,
        connection,
      });

      await revokeSessionRefreshTokens({
        sessionId: storedToken.session_id,
        connection,
      });
    } else {
      await revokeRefreshTokenByHash(
        tokenHash,
        connection
      );
    }
  });
};

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(
      404,
      "User not found.",
      [],
      "USER_NOT_FOUND"
    );
  }

  return sanitizeUser(user);
};

/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/

export const updateMyProfile = async ({
  userId,
  fullName,
  department,
  location,
}) => {
  return withTransaction(async (connection) => {
    const [rows] = await connection.query(
      `SELECT id, status
       FROM users
       WHERE id = ?
         AND deleted_at IS NULL
       LIMIT 1 FOR UPDATE`,
      [userId]
    );

    const currentUser = rows[0];

    if (!currentUser) {
      throw new ApiError(
        404,
        "User not found.",
        [],
        "USER_NOT_FOUND"
      );
    }

    if (currentUser.status !== "ACTIVE") {
      throw new ApiError(
        403,
        "Your account is inactive.",
        [],
        "ACCOUNT_INACTIVE"
      );
    }

    await updateUserProfile({
      userId,
      fullName,
      department,
      location,
      connection,
    });

    const updatedUser = await findUserById(
      userId,
      connection
    );

    return sanitizeUser(updatedUser);
  });
};

/*
|--------------------------------------------------------------------------
| Change Password
|--------------------------------------------------------------------------
*/

export const changePassword = async ({
  userId,
  currentPassword,
  newPassword,
}) => {
  return withTransaction(async (connection) => {
    const [rows] = await connection.query(
      `SELECT id, password_hash, status
       FROM users
       WHERE id = ?
         AND deleted_at IS NULL
       LIMIT 1 FOR UPDATE`,
      [userId]
    );

    const user = rows[0];

    if (!user) {
      throw new ApiError(
        404,
        "User not found.",
        [],
        "USER_NOT_FOUND"
      );
    }

    if (user.status !== "ACTIVE") {
      throw new ApiError(
        403,
        "Your account is inactive.",
        [],
        "ACCOUNT_INACTIVE"
      );
    }

    const matches = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!matches) {
      throw new ApiError(
        422,
        "Current password is incorrect.",
        [],
        "CURRENT_PASSWORD_INCORRECT"
      );
    }

    const reused = await bcrypt.compare(
      newPassword,
      user.password_hash
    );

    if (reused) {
      throw new ApiError(
        422,
        "New password must be different from your current password.",
        [],
        "PASSWORD_REUSED"
      );
    }

    const passwordHash = await bcrypt.hash(
      newPassword,
      12
    );

    const updated = await changeUserPassword({
      userId,
      passwordHash,
      connection,
    });

    if (updated !== 1) {
      throw new ApiError(
        409,
        "Unable to update the password.",
        [],
        "PASSWORD_UPDATE_FAILED"
      );
    }

    await revokeAllUserTokens(userId, connection);

    await revokeAllAuthSessions(
      userId,
      connection
    );

    return {
      passwordChanged: true,
      requiresLogin: true,
    };
  });
};

/*
|--------------------------------------------------------------------------
| Session Management
|--------------------------------------------------------------------------
*/

export const getMySessions = async ({
  userId,
  currentSessionId,
}) => {
  const rows = await listUserAuthSessions(userId);

  return rows.map((session) => ({
    id: session.id,
    ipAddress: session.created_ip,
    userAgent: session.user_agent,
    createdAt: session.created_at,
    lastActivityAt: session.last_activity_at,
    expiresAt: session.expires_at,
    isCurrent:
      String(session.id) === String(currentSessionId),
  }));
};

export const revokeMySession = async ({
  userId,
  sessionId,
  currentSessionId,
}) => {
  const targetId = String(sessionId);

  if (!/^[1-9]\d*$/.test(targetId)) {
    throw new ApiError(
      422,
      "A valid session ID is required.",
      [],
      "INVALID_SESSION_ID"
    );
  }

  const isCurrent =
    targetId === String(currentSessionId);

  const result = await withTransaction(
    async (connection) => {
      const [rows] = await connection.query(
        `SELECT id
         FROM auth_sessions
         WHERE id = ?
           AND user_id = ?
           AND revoked_at IS NULL
         LIMIT 1 FOR UPDATE`,
        [targetId, userId]
      );

      if (!rows[0]) {
        throw new ApiError(
          404,
          "This session was not found or is already revoked.",
          [],
          "SESSION_NOT_FOUND"
        );
      }

      await revokeAuthSession({
        userId,
        sessionId: targetId,
        connection,
      });

      await revokeSessionRefreshTokens({
        sessionId: targetId,
        connection,
      });

      return { revoked: true };
    }
  );

  return {
    ...result,
    requiresLogin: isCurrent,
  };
};

export const revokeMyOtherSessions = async ({
  userId,
  currentSessionId,
}) => {
  return withTransaction(async (connection) => {
    const revokedCount = await revokeOtherAuthSessions({
      userId,
      currentSessionId,
      connection,
    });

    await revokeOtherSessionRefreshTokens({
      userId,
      currentSessionId,
      connection,
    });

    return {
      revokedCount,
      requiresLogin: false,
    };
  });
};

export const revokeMyAllSessions = async ({
  userId,
}) => {
  return withTransaction(async (connection) => {
    const revokedCount = await revokeAllAuthSessions(
      userId,
      connection
    );

    await revokeAllUserTokens(
      userId,
      connection
    );

    return {
      revokedCount,
      requiresLogin: true,
    };
  });
};