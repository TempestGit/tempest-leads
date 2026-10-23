import { env } from "../../config/env.js";

import {
  login,
  logout,
  refreshSession,
  getCurrentUser,
  updateMyProfile,
  changePassword,
  getMySessions,
  revokeMySession,
  revokeMyOtherSessions,
  revokeMyAllSessions,
} from "./auth.service.js";

import {
  requestPasswordReset,
  resetPassword,
} from "./passwordReset.service.js";

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

const clearRefreshCookie = (res) => {
  res.clearCookie(
    REFRESH_COOKIE,
    getCookieOptions()
  );
};

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

  clearRefreshCookie(res);

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

export const profileController = async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    data: { user },
  });
};

export const updateProfileController = async (req, res) => {
  const user = await updateMyProfile({
    userId: req.user.id,
    ...req.validated.body,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: { user },
  });
};

export const changePasswordController = async (req, res) => {
  const result = await changePassword({
    userId: req.user.id,
    currentPassword: req.validated.body.currentPassword,
    newPassword: req.validated.body.newPassword,
  });

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message:
      "Password changed successfully. Please sign in with your new password.",
    data: result,
  });
};

export const forgotPasswordController = async (req, res) => {
  const result = await requestPasswordReset({
    email: req.validated.body.email,
  });

  res.status(200).json({
    success: true,
    message: result.message,
  });
};

export const resetPasswordController = async (req, res) => {
  const result = await resetPassword({
    token: req.validated.body.token,
    newPassword: req.validated.body.newPassword,
  });

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message:
      "Your password has been reset successfully. Sign in with your new password.",
    data: result,
  });
};

/*
|--------------------------------------------------------------------------
| Active Sessions
|--------------------------------------------------------------------------
*/

export const listSessionsController = async (req, res) => {
  const sessions = await getMySessions({
    userId: req.user.id,
    currentSessionId: req.authSession.id,
  });

  res.status(200).json({
    success: true,
    data: { sessions },
  });
};

export const revokeSessionController = async (req, res) => {
  const result = await revokeMySession({
    userId: req.user.id,
    sessionId: req.params.sessionId,
    currentSessionId: req.authSession.id,
  });

  if (result.requiresLogin) {
    clearRefreshCookie(res);
  }

  res.status(200).json({
    success: true,
    message: "Session revoked successfully.",
    data: result,
  });
};

export const revokeOtherSessionsController = async (
  req,
  res
) => {
  const result = await revokeMyOtherSessions({
    userId: req.user.id,
    currentSessionId: req.authSession.id,
  });

  res.status(200).json({
    success: true,
    message: "Other sessions revoked successfully.",
    data: result,
  });
};

export const revokeAllSessionsController = async (
  req,
  res
) => {
  const result = await revokeMyAllSessions({
    userId: req.user.id,
  });

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message:
      "All sessions revoked. Please sign in again.",
    data: result,
  });
};