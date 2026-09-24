import express from "express";

import asyncHandler from "../../utils/asyncHandler.js";

import authMiddleware from "../../middleware/auth.middleware.js";

import allowRoles from "../../middleware/role.middleware.js";

import validateMiddleware from "../../middleware/validate.middleware.js";

import {
  changeLeadOwnerSchema,
  changeLeadStageSchema,
  createLeadSchema,
  leadIdSchema,
  leadListSchema,
  updateLeadSchema,
} from "./leads.schema.js";

import {
  changeLeadOwnerController,
  changeLeadStageController,
  createLeadController,
  getLeadController,
  getLeadOptionsController,
  listLeadsController,
  updateLeadController,
} from "./leads.controller.js";

const router =
  express.Router();

router.use(
  authMiddleware
);

/*
|--------------------------------------------------------------------------
| GET /api/leads/options
|--------------------------------------------------------------------------
|
| Must be before /:leadId.
|
*/

router.get(
  "/options",

  asyncHandler(
    getLeadOptionsController
  )
);

/*
|--------------------------------------------------------------------------
| GET /api/leads
|--------------------------------------------------------------------------
*/

router.get(
  "/",

  validateMiddleware({
    query:
      leadListSchema,
  }),

  asyncHandler(
    listLeadsController
  )
);

/*
|--------------------------------------------------------------------------
| POST /api/leads
|--------------------------------------------------------------------------
*/

router.post(
  "/",

  validateMiddleware({
    body:
      createLeadSchema,
  }),

  asyncHandler(
    createLeadController
  )
);

/*
|--------------------------------------------------------------------------
| GET /api/leads/:leadId
|--------------------------------------------------------------------------
*/

router.get(
  "/:leadId",

  validateMiddleware({
    params:
      leadIdSchema,
  }),

  asyncHandler(
    getLeadController
  )
);

/*
|--------------------------------------------------------------------------
| PATCH /api/leads/:leadId
|--------------------------------------------------------------------------
*/

router.patch(
  "/:leadId",

  validateMiddleware({
    params:
      leadIdSchema,

    body:
      updateLeadSchema,
  }),

  asyncHandler(
    updateLeadController
  )
);

/*
|--------------------------------------------------------------------------
| PATCH /api/leads/:leadId/stage
|--------------------------------------------------------------------------
*/

router.patch(
  "/:leadId/stage",

  validateMiddleware({
    params:
      leadIdSchema,

    body:
      changeLeadStageSchema,
  }),

  asyncHandler(
    changeLeadStageController
  )
);

/*
|--------------------------------------------------------------------------
| PATCH /api/leads/:leadId/owner
|--------------------------------------------------------------------------
*/

router.patch(
  "/:leadId/owner",

  allowRoles(
    "SUPER_ADMIN"
  ),

  validateMiddleware({
    params:
      leadIdSchema,

    body:
      changeLeadOwnerSchema,
  }),

  asyncHandler(
    changeLeadOwnerController
  )
);

export default router;