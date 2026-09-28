import express from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import validateMiddleware from "../../middleware/validate.middleware.js";

import asyncHandler from "../../utils/asyncHandler.js";

import {
  saveTeamAssignmentSchema,
  teamAssignmentIdSchema,
  teamAssignmentOptionsQuerySchema,
  teamLeadIdSchema,
  updateTeamAssignmentStatusSchema,
} from "./teamAssignments.schema.js";

import {
  getTeamAssignmentOptionsController,
  getTeamAssignmentsController,
  removeTeamAssignmentController,
  saveTeamAssignmentController,
  updateTeamAssignmentStatusController,
} from "./teamAssignments.controller.js";

const router =
  express.Router();

router.use(
  authMiddleware
);

/*
|--------------------------------------------------------------------------
| Options
|--------------------------------------------------------------------------
*/

router.get(
  "/options",

  validateMiddleware({
    query:
      teamAssignmentOptionsQuerySchema,
  }),

  asyncHandler(
    getTeamAssignmentOptionsController
  )
);

/*
|--------------------------------------------------------------------------
| Lead Assignments
|--------------------------------------------------------------------------
*/

router.get(
  "/lead/:leadId",

  validateMiddleware({
    params:
      teamLeadIdSchema,
  }),

  asyncHandler(
    getTeamAssignmentsController
  )
);

/*
|--------------------------------------------------------------------------
| Assign
|--------------------------------------------------------------------------
*/

router.post(
  "/lead/:leadId",

  validateMiddleware({
    params:
      teamLeadIdSchema,

    body:
      saveTeamAssignmentSchema,
  }),

  asyncHandler(
    saveTeamAssignmentController
  )
);

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

router.patch(
  "/:assignmentId/status",

  validateMiddleware({
    params:
      teamAssignmentIdSchema,

    body:
      updateTeamAssignmentStatusSchema,
  }),

  asyncHandler(
    updateTeamAssignmentStatusController
  )
);

/*
|--------------------------------------------------------------------------
| Remove
|--------------------------------------------------------------------------
*/

router.delete(
  "/:assignmentId",

  validateMiddleware({
    params:
      teamAssignmentIdSchema,
  }),

  asyncHandler(
    removeTeamAssignmentController
  )
);

export default router;