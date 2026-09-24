import express from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import validateMiddleware from "../../middleware/validate.middleware.js";

import asyncHandler from "../../utils/asyncHandler.js";

import {
  changeLeadOwnerSchema,
  changeLeadStageSchema,
  createLeadSchema,
  leadIdSchema,
  leadListSchema,
  markLeadLostSchema,
  updateLeadSchema,
} from "./leads.schema.js";

import {
  changeLeadOwnerController,
  changeLeadStageController,
  createLeadController,
  getLeadController,
  getLeadOptionsController,
  listLeadsController,
  markLeadLostController,
  updateLeadController,
} from "./leads.controller.js";

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
      leadListSchema,
  }),

  asyncHandler(
    listLeadsController
  )
);

/*
|--------------------------------------------------------------------------
| Options
|--------------------------------------------------------------------------
*/

router.get(
  "/options",

  asyncHandler(
    getLeadOptionsController
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
      createLeadSchema,
  }),

  asyncHandler(
    createLeadController
  )
);

/*
|--------------------------------------------------------------------------
| Detail
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
| Update
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
| Change Stage
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
| Change Owner
|--------------------------------------------------------------------------
*/

router.patch(
  "/:leadId/owner",

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

/*
|--------------------------------------------------------------------------
| Mark Lost
|--------------------------------------------------------------------------
*/

router.patch(
  "/:leadId/lost",

  validateMiddleware({
    params:
      leadIdSchema,

    body:
      markLeadLostSchema,
  }),

  asyncHandler(
    markLeadLostController
  )
);

export default router;