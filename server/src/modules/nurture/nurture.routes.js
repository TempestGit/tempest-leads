import express from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import validateMiddleware from "../../middleware/validate.middleware.js";

import asyncHandler from "../../utils/asyncHandler.js";

import {
  nurtureLeadIdSchema,
  nurtureListSchema,
  scheduleReconnectSchema,
  updateNurtureSchema,
} from "./nurture.schema.js";

import {
  getNurtureController,
  listNurtureController,
  reconnectNurtureController,
  updateNurtureController,
} from "./nurture.controller.js";

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
      nurtureListSchema,
  }),

  asyncHandler(
    listNurtureController
  )
);

/*
|--------------------------------------------------------------------------
| Get One
|--------------------------------------------------------------------------
*/

router.get(
  "/:leadId",

  validateMiddleware({
    params:
      nurtureLeadIdSchema,
  }),

  asyncHandler(
    getNurtureController
  )
);

/*
|--------------------------------------------------------------------------
| Update Nurture Profile
|--------------------------------------------------------------------------
*/

router.patch(
  "/:leadId",

  validateMiddleware({
    params:
      nurtureLeadIdSchema,

    body:
      updateNurtureSchema,
  }),

  asyncHandler(
    updateNurtureController
  )
);

/*
|--------------------------------------------------------------------------
| Schedule Reconnect
|--------------------------------------------------------------------------
*/

router.post(
  "/:leadId/reconnect",

  validateMiddleware({
    params:
      nurtureLeadIdSchema,

    body:
      scheduleReconnectSchema,
  }),

  asyncHandler(
    reconnectNurtureController
  )
);

export default router;