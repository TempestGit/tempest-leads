import express from "express";

import asyncHandler from "../../utils/asyncHandler.js";

import authMiddleware from "../../middleware/auth.middleware.js";

import allowRoles from "../../middleware/role.middleware.js";

import validateMiddleware from "../../middleware/validate.middleware.js";

import {
  companyIdSchema,
  companyListSchema,
  createCompanySchema,
  updateCompanySchema,
} from "./companies.schema.js";

import {
  listCompaniesController,
  getCompanyController,
  createCompanyController,
  updateCompanyController,
  deleteCompanyController,
} from "./companies.controller.js";

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
|
| Every Companies API requires an authenticated user.
|
*/

router.use(
  authMiddleware
);

/*
|--------------------------------------------------------------------------
| GET /api/companies
|--------------------------------------------------------------------------
*/

router.get(
  "/",

  validateMiddleware({
    query:
      companyListSchema,
  }),

  asyncHandler(
    listCompaniesController
  )
);

/*
|--------------------------------------------------------------------------
| GET /api/companies/:companyId
|--------------------------------------------------------------------------
*/

router.get(
  "/:companyId",

  validateMiddleware({
    params:
      companyIdSchema,
  }),

  asyncHandler(
    getCompanyController
  )
);

/*
|--------------------------------------------------------------------------
| POST /api/companies
|--------------------------------------------------------------------------
*/

router.post(
  "/",

  validateMiddleware({
    body:
      createCompanySchema,
  }),

  asyncHandler(
    createCompanyController
  )
);

/*
|--------------------------------------------------------------------------
| PATCH /api/companies/:companyId
|--------------------------------------------------------------------------
*/

router.patch(
  "/:companyId",

  validateMiddleware({
    params:
      companyIdSchema,

    body:
      updateCompanySchema,
  }),

  asyncHandler(
    updateCompanyController
  )
);

/*
|--------------------------------------------------------------------------
| DELETE /api/companies/:companyId
|--------------------------------------------------------------------------
|
| Only SUPER_ADMIN can soft-delete a company.
|
*/

router.delete(
  "/:companyId",

  allowRoles(
    "SUPER_ADMIN"
  ),

  validateMiddleware({
    params:
      companyIdSchema,
  }),

  asyncHandler(
    deleteCompanyController
  )
);

export default router;