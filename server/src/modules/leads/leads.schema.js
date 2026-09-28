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
| Industries
|--------------------------------------------------------------------------
*/

export const LEAD_INDUSTRIES = [
  "Real Estate",
  "Healthcare",
  "Agriculture",
  "Retail",
  "Education",
  "Automobile",
  "FMCG",
  "BFSI",
  "IT / SaaS",
  "Hospitality",
  "Pharma",
  "Manufacturing",
  "D2C / E-commerce",
  "Other",
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
| Helpers
|--------------------------------------------------------------------------
*/

const nullableText = (
  maxLength
) =>
  z.preprocess(
    (value) => {
      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        return null;
      }

      return value;
    },
    z
      .string()
      .trim()
      .max(maxLength)
      .nullable()
  );

const optionalNullableText = (
  maxLength
) =>
  z.preprocess(
    (value) => {
      if (
        value === ""
      ) {
        return null;
      }

      return value;
    },
    z
      .string()
      .trim()
      .max(maxLength)
      .nullable()
      .optional()
  );

const nullableEmail =
  z.preprocess(
    (value) => {
      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        return null;
      }

      return value;
    },
    z
      .string()
      .trim()
      .email(
        "Enter a valid email address."
      )
      .max(190)
      .nullable()
  );

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
        .max(120)
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
| Existing Record Fields
|--------------------------------------------------------------------------
|
| Used by PATCH /api/leads/:leadId.
|
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
      .max(
        255,
        "Potential requirement cannot exceed 255 characters."
      ),

  source:
    z
      .enum(
        LEAD_SOURCES,
        {
          message:
            "Please select a valid lead source.",
        }
      ),

  estimatedValueRupees:
    z.coerce
      .number()
      .finite()
      .min(
        0,
        "Opportunity value cannot be negative."
      )
      .default(0),

  priority:
    z
      .enum(
        LEAD_PRIORITIES
      )
      .default(
        "Medium"
      ),

  description:
    optionalNullableText(
      5000
    ),

  nextAction:
    z
      .string()
      .trim()
      .min(
        2,
        "Next action is required."
      )
      .max(
        500,
        "Next action cannot exceed 500 characters."
      ),

  followUpAt:
    z.coerce
      .date({
        error:
          "Enter a valid follow-up date and time.",
      }),

  knownRelationship:
    z
      .boolean()
      .default(false),
};

/*
|--------------------------------------------------------------------------
| Create Company Payload
|--------------------------------------------------------------------------
*/

const createLeadCompanySchema =
  z.object({
    name:
      z
        .string()
        .trim()
        .min(
          2,
          "Company name is required."
        )
        .max(
          190,
          "Company name cannot exceed 190 characters."
        ),

    industry:
      z.enum(
        LEAD_INDUSTRIES,
        {
          message:
            "Please select a valid industry.",
        }
      ),

    city:
      nullableText(
        120
      ),

    website:
      nullableText(
        500
      ),

    agencyRelationship:
      nullableText(
        255
      ),

    marketingActivity:
      nullableText(
        5000
      ),
  });

/*
|--------------------------------------------------------------------------
| Create Contact Payload
|--------------------------------------------------------------------------
*/

const createLeadContactSchema =
  z.object({
    name:
      z
        .string()
        .trim()
        .min(
          2,
          "Contact name is required."
        )
        .max(
          150,
          "Contact name cannot exceed 150 characters."
        ),

    designation:
      nullableText(
        150
      ),

    phone:
      nullableText(
        30
      ),

    email:
      nullableEmail,

    isDecisionMaker:
      z
        .boolean()
        .default(false),
  });

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
|
| Add Lead creates/reuses Company + Contact inside one transaction.
| Therefore POST /api/leads accepts nested company/contact objects rather than
| requiring companyId and primaryContactId from the browser.
|
*/

export const createLeadSchema =
  z.object({
    company:
      createLeadCompanySchema,

    contact:
      createLeadContactSchema,

    ownerId:
      leadFormFields
        .ownerId,

    serviceRequired:
      leadFormFields
        .serviceRequired,

    source:
      leadFormFields
        .source,

    estimatedValueRupees:
      leadFormFields
        .estimatedValueRupees,

    priority:
      leadFormFields
        .priority,

    description:
      optionalNullableText(
        5000
      ),

    nextAction:
      leadFormFields
        .nextAction,

    followUpAt:
      leadFormFields
        .followUpAt,

    knownRelationship:
      z
        .boolean()
        .default(false),
  });

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export const updateLeadSchema =
  z
    .object({
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

      description:
        optionalNullableText(
          5000
        ),

      nextAction:
        leadFormFields
          .nextAction
          .optional(),

      followUpAt:
        leadFormFields
          .followUpAt
          .optional(),

      knownRelationship:
        z
          .boolean()
          .optional(),
    })
    .refine(
      (data) =>
        Object.keys(
          data
        ).length > 0,
      {
        message:
          "At least one field must be provided.",
      }
    );

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
