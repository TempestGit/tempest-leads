import express from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import validateMiddleware from "../../middleware/validate.middleware.js";

import asyncHandler from "../../utils/asyncHandler.js";

import {
  cancelMeetingSchema,
  completeMeetingSchema,
  createMeetingSchema,
  meetingIdSchema,
  meetingListSchema,
  noShowMeetingSchema,
  rescheduleMeetingSchema,
} from "./meetings.schema.js";

import {
  cancelMeetingController,
  completeMeetingController,
  createMeetingController,
  listMeetingsController,
  noShowMeetingController,
  rescheduleMeetingController,
} from "./meetings.controller.js";

const router =
  express.Router();

router.use(
  authMiddleware
);

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

router.get(
  "/",

  validateMiddleware({
    query:
      meetingListSchema,
  }),

  asyncHandler(
    listMeetingsController
  )
);

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

router.post(
  "/",

  validateMiddleware({
    body:
      createMeetingSchema,
  }),

  asyncHandler(
    createMeetingController
  )
);

/*
|--------------------------------------------------------------------------
| Complete
|--------------------------------------------------------------------------
*/

router.patch(
  "/:meetingId/complete",

  validateMiddleware({
    params:
      meetingIdSchema,

    body:
      completeMeetingSchema,
  }),

  asyncHandler(
    completeMeetingController
  )
);

/*
|--------------------------------------------------------------------------
| Reschedule
|--------------------------------------------------------------------------
*/

router.patch(
  "/:meetingId/reschedule",

  validateMiddleware({
    params:
      meetingIdSchema,

    body:
      rescheduleMeetingSchema,
  }),

  asyncHandler(
    rescheduleMeetingController
  )
);

/*
|--------------------------------------------------------------------------
| Cancel
|--------------------------------------------------------------------------
*/

router.patch(
  "/:meetingId/cancel",

  validateMiddleware({
    params:
      meetingIdSchema,

    body:
      cancelMeetingSchema,
  }),

  asyncHandler(
    cancelMeetingController
  )
);

/*
|--------------------------------------------------------------------------
| No-show
|--------------------------------------------------------------------------
*/

router.patch(
  "/:meetingId/no-show",

  validateMiddleware({
    params:
      meetingIdSchema,

    body:
      noShowMeetingSchema,
  }),

  asyncHandler(
    noShowMeetingController
  )
);

export default router;