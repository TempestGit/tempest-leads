import express from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import validateMiddleware from "../../middleware/validate.middleware.js";

import asyncHandler from "../../utils/asyncHandler.js";

import {
  briefLeadIdSchema,
  saveBriefSchema,
  updateBriefRouteSchema,
  updateBriefStatusSchema,
} from "./briefs.schema.js";

import {
  getBriefController,
  saveBriefController,
  updateBriefRouteController,
  updateBriefStatusController,
} from "./briefs.controller.js";

const router =
  express.Router();

router.use(
  authMiddleware
);

/*
|--------------------------------------------------------------------------
| Get Brief
|--------------------------------------------------------------------------
*/

router.get(
  "/:leadId",

  validateMiddleware({
    params:
      briefLeadIdSchema,
  }),

  asyncHandler(
    getBriefController
  )
);

/*
|--------------------------------------------------------------------------
| Save Brief
|--------------------------------------------------------------------------
*/

router.put(
  "/:leadId",

  validateMiddleware({
    params:
      briefLeadIdSchema,

    body:
      saveBriefSchema,
  }),

  asyncHandler(
    saveBriefController
  )
);

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

router.patch(
  "/:leadId/status",

  validateMiddleware({
    params:
      briefLeadIdSchema,

    body:
      updateBriefStatusSchema,
  }),

  asyncHandler(
    updateBriefStatusController
  )
);

/*
|--------------------------------------------------------------------------
| Route
|--------------------------------------------------------------------------
*/

router.patch(
  "/:leadId/route",

  validateMiddleware({
    params:
      briefLeadIdSchema,

    body:
      updateBriefRouteSchema,
  }),

  asyncHandler(
    updateBriefRouteController
  )
);

export default router;