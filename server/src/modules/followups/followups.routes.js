import express from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import validateMiddleware from "../../middleware/validate.middleware.js";

import asyncHandler from "../../utils/asyncHandler.js";

import {
  completeFollowupSchema,
  createFollowupSchema,
  followupIdSchema,
  followupListSchema,
  rescheduleFollowupSchema,
} from "./followups.schema.js";

import {
  completeFollowupController,
  createFollowupController,
  listFollowupsController,
  rescheduleFollowupController,
} from "./followups.controller.js";

const router =
  express.Router();

router.use(
  authMiddleware
);

/*
|--------------------------------------------------------------------------
| GET /api/followups
|--------------------------------------------------------------------------
*/

router.get(
  "/",

  validateMiddleware({
    query:
      followupListSchema,
  }),

  asyncHandler(
    listFollowupsController
  )
);

/*
|--------------------------------------------------------------------------
| POST /api/followups
|--------------------------------------------------------------------------
*/

router.post(
  "/",

  validateMiddleware({
    body:
      createFollowupSchema,
  }),

  asyncHandler(
    createFollowupController
  )
);

/*
|--------------------------------------------------------------------------
| Complete
|--------------------------------------------------------------------------
*/

router.patch(
  "/:followupId/complete",

  validateMiddleware({
    params:
      followupIdSchema,

    body:
      completeFollowupSchema,
  }),

  asyncHandler(
    completeFollowupController
  )
);

/*
|--------------------------------------------------------------------------
| Reschedule
|--------------------------------------------------------------------------
*/

router.patch(
  "/:followupId/reschedule",

  validateMiddleware({
    params:
      followupIdSchema,

    body:
      rescheduleFollowupSchema,
  }),

  asyncHandler(
    rescheduleFollowupController
  )
);

export default router;