import ApiError from "../utils/ApiError.js";

import {
  verifyAccessToken,
} from "../utils/token.js";

import {
  findUserById,
} from "../modules/auth/auth.repository.js";

const authMiddleware =
  async (req, res, next) => {
    try {
      const authorization =
        req.get("authorization");

      if (
        !authorization ||
        !authorization.startsWith(
          "Bearer "
        )
      ) {
        throw new ApiError(
          401,
          "Authentication required.",
          [],
          "AUTHENTICATION_REQUIRED"
        );
      }

      const token =
        authorization.slice(7);

      let payload;

      try {
        payload =
          verifyAccessToken(token);
      } catch {
        throw new ApiError(
          401,
          "Access token is invalid or expired.",
          [],
          "INVALID_ACCESS_TOKEN"
        );
      }

      if (
        payload.type !== "access"
      ) {
        throw new ApiError(
          401,
          "Invalid access token.",
          [],
          "INVALID_ACCESS_TOKEN"
        );
      }

      const user =
        await findUserById(
          payload.sub
        );

      if (!user) {
        throw new ApiError(
          401,
          "User no longer exists.",
          [],
          "USER_NOT_FOUND"
        );
      }

      if (
        user.status !== "ACTIVE"
      ) {
        throw new ApiError(
          403,
          "Your account is inactive.",
          [],
          "ACCOUNT_INACTIVE"
        );
      }

      req.user = {
        id: user.id,
        userCode:
          user.user_code,
        fullName:
          user.full_name,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };

export default authMiddleware;