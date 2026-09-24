import express from "express";

import asyncHandler from "../../utils/asyncHandler.js";

import authMiddleware from "../../middleware/auth.middleware.js";

import validateMiddleware from "../../middleware/validate.middleware.js";

import {
  contactIdSchema,
  contactListSchema,
  createContactSchema,
  updateContactSchema,
} from "./contacts.schema.js";

import {
  createContactController,
  getContactController,
  listContactsController,
  updateContactController,
} from "./contacts.controller.js";

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
| GET /api/contacts
|--------------------------------------------------------------------------
*/

router.get(
  "/",

  validateMiddleware({
    query:
      contactListSchema,
  }),

  asyncHandler(
    listContactsController
  )
);

/*
|--------------------------------------------------------------------------
| GET /api/contacts/:contactId
|--------------------------------------------------------------------------
*/

router.get(
  "/:contactId",

  validateMiddleware({
    params:
      contactIdSchema,
  }),

  asyncHandler(
    getContactController
  )
);

/*
|--------------------------------------------------------------------------
| POST /api/contacts
|--------------------------------------------------------------------------
*/

router.post(
  "/",

  validateMiddleware({
    body:
      createContactSchema,
  }),

  asyncHandler(
    createContactController
  )
);

/*
|--------------------------------------------------------------------------
| PATCH /api/contacts/:contactId
|--------------------------------------------------------------------------
*/

router.patch(
  "/:contactId",

  validateMiddleware({
    params:
      contactIdSchema,

    body:
      updateContactSchema,
  }),

  asyncHandler(
    updateContactController
  )
);

export default router;