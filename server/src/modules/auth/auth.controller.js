
import { env } from "../../config/env.js";

import {
  login,
  logout,
  refreshSession,
  getCurrentUser,
  changePassword,
} from "./auth.service.js";

const REFRESH_COOKIE = "tempest_refresh_token";

const getCookieOptions = (expiresAt = null) => {
  const production = env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    secure: production,
    sameSite: production ? "none" : "lax",
    path: "/api/auth",
  };

  if (expiresAt) {
    options.expires = new Date(expiresAt);
  }

  return options;
};

const requestContext = (req) => ({
  ipAddress: req.ip,
  userAgent: req.get("user-agent") || null,
});

export const loginController = async (req, res) => {
  const result = await login({
    ...req.body,
    ...requestContext(req),
  });

  res.cookie(
    REFRESH_COOKIE,
    result.refreshToken,
    getCookieOptions(result.refreshTokenExpiresAt)
  );

  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
};

export const refreshController = async (req, res) => {
  const result = await refreshSession({
    refreshToken: req.cookies?.[REFRESH_COOKIE],
    ...requestContext(req),
  });

  res.cookie(
    REFRESH_COOKIE,
    result.refreshToken,
    getCookieOptions(result.refreshTokenExpiresAt)
  );

  res.status(200).json({
    success: true,
    message: "Session refreshed.",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
};

export const logoutController = async (req, res) => {
  await logout(req.cookies?.[REFRESH_COOKIE]);

  res.clearCookie(
    REFRESH_COOKIE,
    getCookieOptions()
  );

  res.status(200).json({
    success: true,
    message: "Logout successful.",
  });
};

export const meController = async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    data: { user },
  });
};

export const changePasswordController = async (req, res) => {
  const result = await changePassword({
    userId: req.user.id,
    currentPassword: req.validated.body.currentPassword,
    newPassword: req.validated.body.newPassword,
  });

  res.clearCookie(
    REFRESH_COOKIE,
    getCookieOptions()
  );

  res.status(200).json({
    success: true,
    message:
      "Password changed successfully. Please sign in with your new password.",
    data: result,
  });
};