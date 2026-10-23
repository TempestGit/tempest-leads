import ApiError from "../utils/ApiError.js";

import {
  verifyAccessToken,
} from "../utils/token.js";

import {
  findUserById,
  findActiveAuthSession,
} from "../modules/auth/auth.repository.js";

const PASSWORD_CHANGE_ALLOWED_PATHS = new Set([
  "/api/auth/me",
  "/api/auth/change-password",
]);

const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.get("authorization");

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      throw new ApiError(
        401,
        "Authentication required.",
        [],
        "AUTHENTICATION_REQUIRED"
      );
    }

    const token = authorization.slice(7);

    let payload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new ApiError(
        401,
        "Access token is invalid or expired.",
        [],
        "INVALID_ACCESS_TOKEN"
      );
    }

    if (
      payload.type !== "access" ||
      !payload.sub ||
      typeof payload.sid !== "string" ||
      !payload.sid
    ) {
      throw new ApiError(
        401,
        "Your session is no longer valid. Please sign in again.",
        [],
        "SESSION_REVOKED"
      );
    }

    const user = await findUserById(payload.sub);

    if (!user) {
      throw new ApiError(
        401,
        "User no longer exists.",
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

    const currentTokenVersion = Number(
      user.token_version ?? 0
    );

    const presentedTokenVersion = Number(
      payload.tokenVersion
    );

    if (
      !Number.isSafeInteger(presentedTokenVersion) ||
      presentedTokenVersion !== currentTokenVersion
    ) {
      throw new ApiError(
        401,
        "Your session is no longer valid. Please sign in again.",
        [],
        "SESSION_REVOKED"
      );
    }

    const session = await findActiveAuthSession({
      userId: user.id,
      sessionKey: payload.sid,
    });

    if (!session) {
      throw new ApiError(
        401,
        "This login session has expired or been revoked.",
        [],
        "SESSION_REVOKED"
      );
    }

    req.user = {
      id: user.id,
      userCode: user.user_code,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      mustChangePassword: Boolean(
        user.must_change_password
      ),
    };

    req.authSession = {
      id: session.id,
      sessionKey: session.session_key,
    };

    const pathname = req.originalUrl.split("?")[0];

    if (
      req.user.mustChangePassword &&
      !PASSWORD_CHANGE_ALLOWED_PATHS.has(pathname)
    ) {
      throw new ApiError(
        403,
        "You must change your temporary password before accessing the CRM.",
        [],
        "PASSWORD_CHANGE_REQUIRED"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;