import ApiError from "../utils/ApiError.js";

const allowRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError(
          401,
          "Authentication required.",
          [],
          "AUTHENTICATION_REQUIRED"
        )
      );
    }

    if (
      !roles.includes(
        req.user.role
      )
    ) {
      return next(
        new ApiError(
          403,
          "You do not have permission to perform this action.",
          [],
          "FORBIDDEN"
        )
      );
    }

    next();
  };

export default allowRoles;