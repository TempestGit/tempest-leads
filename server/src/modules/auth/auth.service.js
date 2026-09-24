import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import pool from "../../config/db.js";

import ApiError from "../../utils/ApiError.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../../utils/token.js";

import {
  findUserByEmail,
  findUserById,
  updateLastLogin,
  createRefreshToken,
  findRefreshTokenForUpdate,
  revokeRefreshToken,
  revokeRefreshTokenByHash,
  revokeAllUserTokens,
} from "./auth.repository.js";

/*
|--------------------------------------------------------------------------
| Safe User Object
|--------------------------------------------------------------------------
*/

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
});

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
  const user =
    await findUserByEmail(email);

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

  const passwordMatches =
    await bcrypt.compare(
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

  const accessToken =
    generateAccessToken(user);

  const refresh =
    generateRefreshToken(user);

  await createRefreshToken({
    userId: user.id,

    tokenHash:
      hashToken(refresh.token),

    expiresAt:
      refresh.expiresAt,

    ipAddress,
    userAgent,
  });

  await updateLastLogin(user.id);

  return {
    user: sanitizeUser(user),

    accessToken,

    refreshToken:
      refresh.token,

    refreshTokenExpiresAt:
      refresh.expiresAt,
  };
};

/*
|--------------------------------------------------------------------------
| Refresh Access Token
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
    payload =
      verifyRefreshToken(
        refreshToken
      );
  } catch (error) {
    if (
      error instanceof
      jwt.TokenExpiredError
    ) {
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

  if (payload.type !== "refresh") {
    throw new ApiError(
      401,
      "Invalid refresh token.",
      [],
      "INVALID_REFRESH_TOKEN"
    );
  }

  const tokenHash =
    hashToken(refreshToken);

  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    const storedToken =
      await findRefreshTokenForUpdate(
        tokenHash,
        connection
      );

    if (!storedToken) {
      throw new ApiError(
        401,
        "Invalid refresh token.",
        [],
        "INVALID_REFRESH_TOKEN"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Refresh Token Reuse Detection
    |--------------------------------------------------------------------------
    */

    if (storedToken.revoked_at) {
      await revokeAllUserTokens(
        storedToken.user_id,
        connection
      );

      await connection.commit();

      throw new ApiError(
        401,
        "Session is no longer valid.",
        [],
        "REFRESH_TOKEN_REUSED"
      );
    }

    if (
      new Date(
        storedToken.expires_at
      ).getTime() <= Date.now()
    ) {
      await revokeRefreshToken({
        tokenId:
          storedToken.id,

        connection,
      });

      await connection.commit();

      throw new ApiError(
        401,
        "Session has expired.",
        [],
        "REFRESH_TOKEN_EXPIRED"
      );
    }

    if (
      String(storedToken.user_id) !==
      String(payload.sub)
    ) {
      throw new ApiError(
        401,
        "Invalid refresh token.",
        [],
        "INVALID_REFRESH_TOKEN"
      );
    }

    const user =
      await findUserById(
        storedToken.user_id
      );

    if (!user) {
      throw new ApiError(
        401,
        "User no longer exists.",
        [],
        "USER_NOT_FOUND"
      );
    }

    if (user.status !== "ACTIVE") {
      await revokeAllUserTokens(
        user.id,
        connection
      );

      await connection.commit();

      throw new ApiError(
        403,
        "Your account is inactive.",
        [],
        "ACCOUNT_INACTIVE"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Create replacement refresh token
    |--------------------------------------------------------------------------
    */

    const replacement =
      generateRefreshToken(user);

    const replacementId =
      await createRefreshToken({
        userId: user.id,

        tokenHash:
          hashToken(
            replacement.token
          ),

        expiresAt:
          replacement.expiresAt,

        ipAddress,
        userAgent,

        connection,
      });

    await revokeRefreshToken({
      tokenId:
        storedToken.id,

      replacedByTokenId:
        replacementId,

      connection,
    });

    await connection.commit();

    return {
      user: sanitizeUser(user),

      accessToken:
        generateAccessToken(user),

      refreshToken:
        replacement.token,

      refreshTokenExpiresAt:
        replacement.expiresAt,
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Ignore rollback errors.
    }

    throw error;
  } finally {
    connection.release();
  }
};

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

export const logout = async (
  refreshToken
) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash =
    hashToken(refreshToken);

  await revokeRefreshTokenByHash(
    tokenHash
  );
};

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

export const getCurrentUser =
  async (userId) => {
    const user =
      await findUserById(userId);

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