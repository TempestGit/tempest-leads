import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";

import {
  createLead,
  getAssignableOwners,
  getLead,
  listLeads,
} from "./leads.service.js";

import {
  getLeadCreationRequestKey,
} from "./leadCreationIdempotency.js";

/*
|--------------------------------------------------------------------------
| Lead Error Mapper
|--------------------------------------------------------------------------
*/

function mapLeadError(error) {
  if (
    error instanceof ApiError
  ) {
    return error;
  }

  const code =
    error?.code;

  switch (code) {
    /*
    |--------------------------------------------------------------------------
    | Idempotency Errors
    |--------------------------------------------------------------------------
    */

    case "LEAD_IDEMPOTENCY_KEY_REQUIRED":
      return new ApiError(
        400,
        error.message ||
          "Idempotency-Key header is required.",
        [
          {
            code,
            field:
              "Idempotency-Key",
          },
        ],
      );

    case "LEAD_IDEMPOTENCY_KEY_INVALID":
      return new ApiError(
        400,
        error.message ||
          "Idempotency-Key must be a valid UUID.",
        [
          {
            code,
            field:
              "Idempotency-Key",
          },
        ],
      );

    case "LEAD_IDEMPOTENCY_CONFLICT":
      return new ApiError(
        409,
        error.message ||
          "This Idempotency-Key has already been used with different lead data.",
        [
          {
            code,
          },
        ],
      );

    case "LEAD_IDEMPOTENCY_INCOMPLETE":
      return new ApiError(
        409,
        error.message ||
          "This lead creation request has not completed.",
        [
          {
            code,
          },
        ],
      );

    /*
    |--------------------------------------------------------------------------
    | Actor Errors
    |--------------------------------------------------------------------------
    */

    case "LEAD_ACTOR_NOT_FOUND":
      return new ApiError(
        401,
        error.message ||
          "Authenticated user was not found.",
        [
          {
            code,
          },
        ],
      );

    case "LEAD_ACTOR_INACTIVE":
      return new ApiError(
        403,
        error.message ||
          "Inactive users cannot create leads.",
        [
          {
            code,
          },
        ],
      );

    case "LEAD_ACTOR_FORBIDDEN":
      return new ApiError(
        403,
        error.message ||
          "You do not have permission to create leads.",
        [
          {
            code,
          },
        ],
      );

    /*
    |--------------------------------------------------------------------------
    | Owner Errors
    |--------------------------------------------------------------------------
    */

    case "LEAD_OWNER_FORBIDDEN":
      return new ApiError(
        403,
        error.message ||
          "You cannot assign this lead to another owner.",
        [
          {
            code,
            field:
              "owner_id",
          },
        ],
      );

    case "LEAD_OWNER_NOT_FOUND":
      return new ApiError(
        404,
        error.message ||
          "Selected owner was not found.",
        [
          {
            code,
            field:
              "owner_id",
          },
        ],
      );

    case "LEAD_OWNER_INACTIVE":
      return new ApiError(
        400,
        error.message ||
          "Selected owner is not active.",
        [
          {
            code,
            field:
              "owner_id",
          },
        ],
      );

    case "LEAD_OWNER_INVALID_ROLE":
      return new ApiError(
        400,
        error.message ||
          "Selected user cannot own leads.",
        [
          {
            code,
            field:
              "owner_id",
          },
        ],
      );

    /*
    |--------------------------------------------------------------------------
    | Company Errors
    |--------------------------------------------------------------------------
    */

    case "LEAD_COMPANY_NOT_FOUND":
      return new ApiError(
        404,
        error.message ||
          "Company was not found or is not accessible.",
        [
          {
            code,
            field:
              "company_id",
          },
        ],
      );

    /*
    |--------------------------------------------------------------------------
    | Contact Errors
    |--------------------------------------------------------------------------
    */

    case "LEAD_CONTACT_NOT_FOUND":
      return new ApiError(
        404,
        error.message ||
          "Primary contact was not found for the selected company.",
        [
          {
            code,
            field:
              "primary_contact_id",
          },
        ],
      );

    /*
    |--------------------------------------------------------------------------
    | Follow-up Errors
    |--------------------------------------------------------------------------
    */

    case "LEAD_INVALID_FOLLOW_UP":
      return new ApiError(
        400,
        error.message ||
          "Next follow-up date is invalid.",
        [
          {
            code,
            field:
              "next_follow_up_at",
          },
        ],
      );

    /*
    |--------------------------------------------------------------------------
    | Internal Errors
    |--------------------------------------------------------------------------
    */

    case "LEAD_IDEMPOTENCY_UPDATE_FAILED":
    case "LEAD_IDEMPOTENCY_LEAD_NOT_FOUND":
    case "LEAD_INSERT_FAILED":
    case "LEAD_CREATED_BUT_NOT_FOUND":
      return new ApiError(
        500,
        "Unable to create the lead.",
        [
          {
            code,
          },
        ],
      );

    default:
      return error;
  }
}

/*
|--------------------------------------------------------------------------
| GET /api/leads
|--------------------------------------------------------------------------
*/

export const index =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const result =
        await listLeads(
          req.user,
          req.query,
        );

      return res
        .status(200)
        .json({
          data:
            result.data,

          pagination:
            result.pagination,
        });
    },
  );

/*
|--------------------------------------------------------------------------
| GET /api/leads/owners
|--------------------------------------------------------------------------
*/

export const owners =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const result =
        await getAssignableOwners(
          req.user,
        );

      return res
        .status(200)
        .json({
          data:
            result.data,
        });
    },
  );

/*
|--------------------------------------------------------------------------
| GET /api/leads/:id
|--------------------------------------------------------------------------
*/

export const show =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const lead =
        await getLead(
          req.user,
          req.params.id,
        );

      if (!lead) {
        throw new ApiError(
          404,
          "Lead not found.",
        );
      }

      return res
        .status(200)
        .json({
          data:
            lead,
        });
    },
  );

/*
|--------------------------------------------------------------------------
| POST /api/leads
|--------------------------------------------------------------------------
*/

export const create =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const requestKey =
        getLeadCreationRequestKey(
          req,
        );

      try {
        const lead =
          await createLead(
            req.user,
            req.body,
            {
              requestKey,
            },
          );

        return res
          .status(201)
          .json({
            message:
              "Lead created successfully.",

            data:
              lead,
          });
      } catch (error) {
        throw mapLeadError(
          error,
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

const leadsController = {
  index,
  owners,
  show,
  create,
};

export default leadsController;