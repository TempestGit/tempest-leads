import express from "express";

import asyncHandler from "../../utils/asyncHandler.js";

import authMiddleware from "../../middleware/auth.middleware.js";

import validateMiddleware from "../../middleware/validate.middleware.js";

import {
  loginSchema,
} from "./auth.schema.js";

import {
  loginController,
  refreshController,
  logoutController,
  meController,
} from "./auth.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

router.post(
  "/login",

  validateMiddleware({
    body: loginSchema,
  }),

  asyncHandler(
    loginController
  )
);

router.post(
  "/refresh",

  asyncHandler(
    refreshController
  )
);

router.post(
  "/logout",

  asyncHandler(
    logoutController
  )
);

/*
|--------------------------------------------------------------------------
| Protected
|--------------------------------------------------------------------------
*/

router.get(
  "/me",

  authMiddleware,

  asyncHandler(
    meController
  )
);

export default router;