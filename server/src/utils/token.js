
import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

/*
|--------------------------------------------------------------------------
| Access Token
|--------------------------------------------------------------------------
*/

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
      type: "access",
      tokenVersion: Number(user.token_version ?? 0),
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    }
  );
};

/*
|--------------------------------------------------------------------------
| Refresh Token
|--------------------------------------------------------------------------
*/

export const generateRefreshToken = (user) => {
  const token = jwt.sign(
    {
      sub: String(user.id),
      type: "refresh",
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    }
  );

  const decoded = jwt.decode(token);

  const expiresAt = new Date(decoded.exp * 1000);

  return {
    token,
    expiresAt,
  };
};

/*
|--------------------------------------------------------------------------
| Verification
|--------------------------------------------------------------------------
*/

export const verifyAccessToken = (token) => {
  return jwt.verify(
    token,
    env.JWT_ACCESS_SECRET
  );
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(
    token,
    env.JWT_REFRESH_SECRET
  );
};

/*
|--------------------------------------------------------------------------
| Token Hashing
|--------------------------------------------------------------------------
*/

export const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};
