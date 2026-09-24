import { env } from "../../config/env.js";

import {
  login,
  logout,
  refreshSession,
  getCurrentUser,
} from "./auth.service.js";

const REFRESH_COOKIE =
  "tempest_refresh_token";

/*
|--------------------------------------------------------------------------
| Cookie options
|--------------------------------------------------------------------------
*/

const getCookieOptions = (
  expiresAt = null
) => {
  const production =
    env.NODE_ENV === "production";

  const options = {
    httpOnly: true,

    secure: production,

    sameSite: production
      ? "none"
      : "lax",

    path: "/api/auth",
  };

  if (expiresAt) {
    options.expires =
      new Date(expiresAt);
  }

  return options;
};

const requestContext = (req) => ({
  ipAddress: req.ip,

  userAgent:
    req.get("user-agent") || null,
});

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export const loginController =
  async (req, res) => {
    const result = await login({
      ...req.body,
      ...requestContext(req),
    });

    res.cookie(
      REFRESH_COOKIE,
      result.refreshToken,
      getCookieOptions(
        result.refreshTokenExpiresAt
      )
    );

    res.status(200).json({
      success: true,

      message:
        "Login successful.",

      data: {
        user: result.user,

        accessToken:
          result.accessToken,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| Refresh
|--------------------------------------------------------------------------
*/

export const refreshController =
  async (req, res) => {
    const refreshToken =
      req.cookies[
        REFRESH_COOKIE
      ];

    const result =
      await refreshSession({
        refreshToken,

        ...requestContext(req),
      });

    res.cookie(
      REFRESH_COOKIE,
      result.refreshToken,
      getCookieOptions(
        result.refreshTokenExpiresAt
      )
    );

    res.status(200).json({
      success: true,

      message:
        "Session refreshed.",

      data: {
        user: result.user,

        accessToken:
          result.accessToken,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

export const logoutController =
  async (req, res) => {
    const refreshToken =
      req.cookies[
        REFRESH_COOKIE
      ];

    await logout(refreshToken);

    res.clearCookie(
      REFRESH_COOKIE,
      getCookieOptions()
    );

    res.status(200).json({
      success: true,

      message:
        "Logout successful.",
    });
  };

/*
|--------------------------------------------------------------------------
| Me
|--------------------------------------------------------------------------
*/

export const meController =
  async (req, res) => {
    const user =
      await getCurrentUser(
        req.user.id
      );

    res.status(200).json({
      success: true,

      data: {
        user,
      },
    });
  };