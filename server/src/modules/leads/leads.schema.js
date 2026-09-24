import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Lead Stages
|--------------------------------------------------------------------------
*/

export const LEAD_STAGES = [
  "New",
  "Contact Research",
  "Connected",
  "Meeting",
  "Brief",
  "Pitch",
  "Commercials",
  "Contract / PO",
  "Onboarding",
  "Active Client",
  "Nurture",
  "Lost",
];

/*
|--------------------------------------------------------------------------
| Lead Statuses
|--------------------------------------------------------------------------
*/

export const LEAD_STATUSES = [
  "Open",
  "Not interested",
  "Active Client",
];

/*
|--------------------------------------------------------------------------
| Priorities
|--------------------------------------------------------------------------
*/

export const LEAD_PRIORITIES = [
  "High",
  "Medium",
  "Low",
];

/*
|--------------------------------------------------------------------------
| Sources
|--------------------------------------------------------------------------
*/

export const LEAD_SOURCES = [
  "LinkedIn",
  "Google",
  "Competitor research",
  "Referral",
  "Employee referral",
  "Industry event",
  "Tender/RFP",
  "Funding news",
  "New launch/rebrand",
  "Newspaper",
  "Magazine",
  "Outdoor",
  "TV/radio",
  "Digital/social",
  "Trade publication",
  "Other",
];

/*
|--------------------------------------------------------------------------
| Lost Reasons
|--------------------------------------------------------------------------
*/

export const LOST_REASONS = [
  "Budget",
  "Timing",
  "No requirement",
  "Creative / pitch",
  "Competitor",
  "Existing agency",
  "Internal decision",
  "No response",
  "Other",
];

/*
|--------------------------------------------------------------------------
| ID
|--------------------------------------------------------------------------
*/

export const leadIdSchema =
  z.object({
    leadId:
      z.coerce
        .number()
        .int()
        .positive(),
  });

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export const leadListSchema =
  z.object({
    search:
      z
        .string()
        .trim()
        .max(200)
        .optional(),

    ownerId:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    stage:
      z
        .enum(
          LEAD_STAGES
        )
        .optional(),

    status:
      z
        .enum(
          LEAD_STATUSES
        )
        .optional(),

    priority:
      z
        .enum(
          LEAD_PRIORITIES
        )
        .optional(),

    source:
      z
        .string()
        .trim()
        .max(150)
        .optional(),

    companyId:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    page:
      z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit:
      z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(25),

    sort:
      z
        .enum([
          "createdAt",
          "updatedAt",
          "followUpAt",
          "lastTouchAt",
          "companyName",
        ])
        .default(
          "createdAt"
        ),

    direction:
      z
        .enum([
          "asc",
          "desc",
        ])
        .default(
          "desc"
        ),
  });

/*
|--------------------------------------------------------------------------
| Base Lead Form
|--------------------------------------------------------------------------
*/

const leadFormFields = {
  companyId:
    z.coerce
      .number()
      .int()
      .positive(),

  primaryContactId:
    z.coerce
      .number()
      .int()
      .positive(),

  ownerId:
    z.coerce
      .number()
      .int()
      .positive(),

  serviceRequired:
    z
      .string()
      .trim()
      .min(
        2,
        "Potential requirement is required."
      )
      .max(1000),

  source:
    z
      .string()
      .trim()
      .min(
        1,
        "Lead source is required."
      )
      .max(150),

  estimatedValueRupees:
    z.coerce
      .number()
      .min(0)
      .default(0),

  priority:
    z
      .enum(
        LEAD_PRIORITIES
      )
      .default(
        "Medium"
      ),

  nextAction:
    z
      .string()
      .trim()
      .min(
        2,
        "Next action is required."
      )
      .max(500),

  followUpAt:
    z.coerce
      .date(),

  knownRelationship:
    z.coerce
      .boolean()
      .default(false),
};

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export const createLeadSchema =
  z.object(
    leadFormFields
  );

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export const updateLeadSchema =
  z.object({
    companyId:
      leadFormFields
        .companyId
        .optional(),

    primaryContactId:
      leadFormFields
        .primaryContactId
        .optional(),

    serviceRequired:
      leadFormFields
        .serviceRequired
        .optional(),

    source:
      leadFormFields
        .source
        .optional(),

    estimatedValueRupees:
      leadFormFields
        .estimatedValueRupees
        .optional(),

    priority:
      leadFormFields
        .priority
        .optional(),

    nextAction:
      leadFormFields
        .nextAction
        .optional(),

    followUpAt:
      leadFormFields
        .followUpAt
        .optional(),

    knownRelationship:
      leadFormFields
        .knownRelationship
        .optional(),
  });

/*
|--------------------------------------------------------------------------
| Change Stage
|--------------------------------------------------------------------------
*/

export const changeLeadStageSchema =
  z.object({
    stage:
      z.enum(
        LEAD_STAGES
      ),

    reason:
      z
        .string()
        .trim()
        .min(
          2,
          "Reason or comment is required."
        )
        .max(2000),
  });

/*
|--------------------------------------------------------------------------
| Change Owner
|--------------------------------------------------------------------------
*/

export const changeLeadOwnerSchema =
  z.object({
    ownerId:
      z.coerce
        .number()
        .int()
        .positive(),

    reason:
      z
        .string()
        .trim()
        .max(2000)
        .nullable()
        .optional(),
  });

/*
|--------------------------------------------------------------------------
| Mark Lost
|--------------------------------------------------------------------------
*/

export const markLeadLostSchema =
  z.object({
    reason:
      z.enum(
        LOST_REASONS
      ),

    comment:
      z
        .string()
        .trim()
        .min(
          2,
          "Close comment is required."
        )
        .max(5000),

    moveToNurture:
      z
        .boolean()
        .default(true),
  });