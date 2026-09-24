import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Statuses
|--------------------------------------------------------------------------
*/

export const BRIEF_STATUSES = [
  "DRAFT",
  "AWAITING_CLARIFICATION",
  "READY",
  "APPROVED",
];

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

export const BRIEF_ROUTES = [
  "KNOWN_EXISTING",
  "NEW_UNKNOWN",
];

/*
|--------------------------------------------------------------------------
| Lead ID
|--------------------------------------------------------------------------
*/

export const briefLeadIdSchema =
  z.object({
    leadId:
      z.coerce
        .number()
        .int()
        .positive(),
  });

/*
|--------------------------------------------------------------------------
| Nullable Text
|--------------------------------------------------------------------------
*/

const optionalText = (
  max = 10000
) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional();

/*
|--------------------------------------------------------------------------
| Save Brief
|--------------------------------------------------------------------------
*/

export const saveBriefSchema =
  z.object({
    businessObjective:
      optionalText(),

    clientProblem:
      optionalText(),

    targetAudience:
      optionalText(),

    campaignRequirement:
      optionalText(),

    currentActivity:
      optionalText(),

    potentialScope:
      optionalText(),

    timeline:
      optionalText(500),

    budget:
      optionalText(500),

    decisionMaker:
      optionalText(500),

    approvalProcess:
      optionalText(),

    expectedDeliverables:
      optionalText(),

    clientExpectations:
      optionalText(),

    competitors:
      optionalText(),

    categoryInsights:
      optionalText(),

    mandatoryRequirements:
      optionalText(),

    status:
      z
        .enum(
          BRIEF_STATUSES
        )
        .optional(),

    routeType:
      z
        .enum(
          BRIEF_ROUTES
        )
        .nullable()
        .optional(),

    routeDecisionNote:
      optionalText(5000),
  });

/*
|--------------------------------------------------------------------------
| Status Update
|--------------------------------------------------------------------------
*/

export const updateBriefStatusSchema =
  z.object({
    status:
      z.enum(
        BRIEF_STATUSES
      ),

    note:
      optionalText(5000),
  });

/*
|--------------------------------------------------------------------------
| Route Decision
|--------------------------------------------------------------------------
*/

export const updateBriefRouteSchema =
  z.object({
    routeType:
      z.enum(
        BRIEF_ROUTES
      ),

    note:
      z
        .string()
        .trim()
        .min(
          2,
          "Route decision note is required."
        )
        .max(5000),
  });