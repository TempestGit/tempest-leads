import express from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import validateMiddleware from "../../middleware/validate.middleware.js";

import { loginSchema } from "./auth.schema.js";
import { changePasswordSchema } from "./changePassword.schema.js";
import { updateProfileSchema } from "./profile.schema.js";

import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./passwordReset.schema.js";

import {
  passwordResetRateLimit,
} from "./passwordReset.rateLimit.js";

import {
  loginController,
  refreshController,
  logoutController,
  meController,
  profileController,
  updateProfileController,
  changePasswordController,
  forgotPasswordController,
  resetPasswordController,
  listSessionsController,
  revokeSessionController,
  revokeOtherSessionsController,
  revokeAllSessionsController,
} from "./auth.controller.js";

const router = express.Router();

router.post(
  "/login",
  validateMiddleware({ body: loginSchema }),
  asyncHandler(loginController)
);

router.post(
  "/refresh",
  asyncHandler(refreshController)
);

router.post(
  "/logout",
  asyncHandler(logoutController)
);

router.post(
  "/forgot-password",
  passwordResetRateLimit,
  validateMiddleware({ body: forgotPasswordSchema }),
  asyncHandler(forgotPasswordController)
);

router.post(
  "/reset-password",
  passwordResetRateLimit,
  validateMiddleware({ body: resetPasswordSchema }),
  asyncHandler(resetPasswordController)
);

router.get(
  "/me",
  authMiddleware,
  asyncHandler(meController)
);

router.get(
  "/profile",
  authMiddleware,
  asyncHandler(profileController)
);

router.patch(
  "/profile",
  authMiddleware,
  validateMiddleware({ body: updateProfileSchema }),
  asyncHandler(updateProfileController)
);

router.post(
  "/change-password",
  authMiddleware,
  validateMiddleware({ body: changePasswordSchema }),
  asyncHandler(changePasswordController)
);

/*
|--------------------------------------------------------------------------
| Active Sessions Management
|--------------------------------------------------------------------------
*/

router.get(
  "/sessions",
  authMiddleware,
  asyncHandler(listSessionsController)
);

router.delete(
  "/sessions/others",
  authMiddleware,
  asyncHandler(revokeOtherSessionsController)
);

router.delete(
  "/sessions/all",
  authMiddleware,
  asyncHandler(revokeAllSessionsController)
);

router.delete(
  "/sessions/:sessionId",
  authMiddleware,
  asyncHandler(revokeSessionController)
);

export default router;