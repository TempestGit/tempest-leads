import express from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import validateMiddleware from "../../middleware/validate.middleware.js";

import asyncHandler from "../../utils/asyncHandler.js";

import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  userIdSchema,
  usersListQuerySchema,
} from "./users.schema.js";

import {
  createUserController,
  getUserOptionsController,
  listUsersController,
  updateUserController,
  updateUserStatusController,
} from "./users.controller.js";

const router =
  express.Router();

router.use(
  authMiddleware
);

router.get(
  "/options",

  asyncHandler(
    getUserOptionsController
  )
);

router.get(
  "/",

  validateMiddleware({
    query:
      usersListQuerySchema,
  }),

  asyncHandler(
    listUsersController
  )
);

router.post(
  "/",

  validateMiddleware({
    body:
      createUserSchema,
  }),

  asyncHandler(
    createUserController
  )
);

router.patch(
  "/:userId",

  validateMiddleware({
    params:
      userIdSchema,

    body:
      updateUserSchema,
  }),

  asyncHandler(
    updateUserController
  )
);

router.patch(
  "/:userId/status",

  validateMiddleware({
    params:
      userIdSchema,

    body:
      updateUserStatusSchema,
  }),

  asyncHandler(
    updateUserStatusController
  )
);

export default router;