
import express from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import validateMiddleware from "../../middleware/validate.middleware.js";

import { loginSchema } from "./auth.schema.js";
import { changePasswordSchema } from "./changePassword.schema.js";

import {
  loginController,
  refreshController,
  logoutController,
  meController,
  changePasswordController,
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

router.get(
  "/me",
  authMiddleware,
  asyncHandler(meController)
);

router.post(
  "/change-password",
  authMiddleware,
  validateMiddleware({ body: changePasswordSchema }),
  asyncHandler(changePasswordController)
);

export default router;