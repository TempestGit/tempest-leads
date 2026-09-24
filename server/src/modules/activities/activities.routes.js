import express from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import validateMiddleware from "../../middleware/validate.middleware.js";

import asyncHandler from "../../utils/asyncHandler.js";

import {
  activityListSchema,
  createActivitySchema,
} from "./activities.schema.js";

import {
  createActivityController,
  listActivitiesController,
} from "./activities.controller.js";

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.use(
  authMiddleware
);

/*
|--------------------------------------------------------------------------
| GET /api/activities
|--------------------------------------------------------------------------
*/

router.get(
  "/",

  validateMiddleware({
    query:
      activityListSchema,
  }),

  asyncHandler(
    listActivitiesController
  )
);

/*
|--------------------------------------------------------------------------
| POST /api/activities
|--------------------------------------------------------------------------
*/

router.post(
  "/",

  validateMiddleware({
    body:
      createActivitySchema,
  }),

  asyncHandler(
    createActivityController
  )
);

export default router;