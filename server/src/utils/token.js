import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export const generateSessionKey = () => crypto.randomUUID();

export const generateAccessToken = (user, sessionKey) => {
  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
      type: "access",
      tokenVersion: Number(user.token_version ?? 0),
      sid: sessionKey,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      jwtid: crypto.randomUUID(),
    }
  );
};

export const generateRefreshToken = (user, sessionKey) => {
  const token = jwt.sign(
    {
      sub: String(user.id),
      type: "refresh",
      sid: sessionKey,
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      jwtid: crypto.randomUUID(),
    }
  );

  const decoded = jwt.decode(token);

  return {
    token,
    expiresAt: new Date(decoded.exp * 1000),
  };
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

export const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};