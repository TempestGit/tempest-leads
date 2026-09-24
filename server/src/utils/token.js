import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
      type: "access",
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    }
  );
};

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

  const expiresAt = new Date(
    decoded.exp * 1000
  );

  return {
    token,
    expiresAt,
  };
};

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

export const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};