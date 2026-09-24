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
  "Lost",
  "Nurture",
];

/*
|--------------------------------------------------------------------------
| Lead Statuses
|--------------------------------------------------------------------------
*/

export const LEAD_STATUSES = [
  "Open",
  "Later",
  "Not interested",
  "No response",
];

/*
|--------------------------------------------------------------------------
| Lead Priorities
|--------------------------------------------------------------------------
*/

export const LEAD_PRIORITIES = [
  "High",
  "Medium",
  "Low",
];

/*
|--------------------------------------------------------------------------
| Lead Sources
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
  "Newspaper",
  "Magazine",
  "Digital/social",
  "Trade publication",
  "Other",
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

/*
|--------------------------------------------------------------------------
| Nullable Email
|--------------------------------------------------------------------------
*/

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
| Create Lead Schema
|--------------------------------------------------------------------------
|
| Exact 5-step Add Lead workflow:
|
| 1. Company
| 2. Contact
| 3. Opportunity
| 4. Ownership
| 5. Next action
|
*/

export const createLeadSchema =
  z.object({
    /*
    |--------------------------------------------------------------------------
    | STEP 1 — Company
    |--------------------------------------------------------------------------
    */

    company: z.object({
      name: z
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

      industry: z.enum(
        LEAD_INDUSTRIES,
        {
          message:
            "Industry is required.",
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
    }),

    /*
    |--------------------------------------------------------------------------
    | STEP 2 — Primary Contact
    |--------------------------------------------------------------------------
    */

    contact: z.object({
      name: z
        .string()
        .trim()
        .min(
          2,
          "Contact name is required."
        )
        .max(
          190,
          "Contact name cannot exceed 190 characters."
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
          .default(
            false
          ),
    }),

    /*
    |--------------------------------------------------------------------------
    | STEP 3 — Opportunity
    |--------------------------------------------------------------------------
    */

    serviceRequired: z
      .string()
      .trim()
      .min(
        2,
        "Potential requirement is required."
      )
      .max(
        500,
        "Potential requirement cannot exceed 500 characters."
      ),

    source: z.enum(
      LEAD_SOURCES,
      {
        message:
          "Lead source is required.",
      }
    ),

    estimatedValueRupees:
      z.coerce
        .number({
          message:
            "Opportunity value must be a number.",
        })
        .min(
          0,
          "Opportunity value cannot be negative."
        )
        .max(
          1000000000000,
          "Opportunity value is too large."
        )
        .default(0),

    priority: z
      .enum(
        LEAD_PRIORITIES
      )
      .default(
        "Medium"
      ),

    description:
      nullableText(
        5000
      ),

    /*
    |--------------------------------------------------------------------------
    | STEP 4 — Ownership
    |--------------------------------------------------------------------------
    */

    ownerId: z.coerce
      .number({
        message:
          "Owner is required.",
      })
      .int(
        "Owner ID must be an integer."
      )
      .positive(
        "Owner is required."
      ),

    /*
    |--------------------------------------------------------------------------
    | STEP 5 — Next Action
    |--------------------------------------------------------------------------
    */

    nextAction: z
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
      z.coerce.date({
        message:
          "A valid follow-up date and time is required.",
      }),

    knownRelationship:
      z
        .boolean()
        .default(
          false
        ),
  });

/*
|--------------------------------------------------------------------------
| Update Lead Schema
|--------------------------------------------------------------------------
|
| Important:
|
| Stage and owner are NOT updated through this schema.
|
| They have dedicated endpoints:
|
| PATCH /api/leads/:leadId/stage
| PATCH /api/leads/:leadId/owner
|
*/

export const updateLeadSchema =
  z
    .object({
      companyId:
        z.coerce
          .number()
          .int()
          .positive()
          .optional(),

      primaryContactId:
        z.coerce
          .number()
          .int()
          .positive()
          .optional(),

      serviceRequired:
        z
          .string()
          .trim()
          .min(
            2,
            "Potential requirement is required."
          )
          .max(500)
          .optional(),

      source:
        z
          .enum(
            LEAD_SOURCES
          )
          .optional(),

      estimatedValueRupees:
        z.coerce
          .number()
          .min(
            0,
            "Opportunity value cannot be negative."
          )
          .max(
            1000000000000
          )
          .optional(),

      priority:
        z
          .enum(
            LEAD_PRIORITIES
          )
          .optional(),

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
          .max(500)
          .optional(),

      followUpAt:
        z.coerce
          .date()
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
| Change Lead Stage Schema
|--------------------------------------------------------------------------
|
| Stage movement cannot happen silently.
| Reason/comment is required.
|
*/

export const changeLeadStageSchema =
  z.object({
    stage: z.enum(
      LEAD_STAGES,
      {
        message:
          "Select a valid lead stage.",
      }
    ),

    reason: z
      .string()
      .trim()
      .min(
        2,
        "A reason or comment is required."
      )
      .max(
        500,
        "Reason cannot exceed 500 characters."
      ),
  });

/*
|--------------------------------------------------------------------------
| Change Lead Owner Schema
|--------------------------------------------------------------------------
*/

export const changeLeadOwnerSchema =
  z.object({
    ownerId: z.coerce
      .number({
        message:
          "Owner is required.",
      })
      .int(
        "Owner ID must be an integer."
      )
      .positive(
        "Owner is required."
      ),

    reason:
      optionalNullableText(
        500
      ),
  });

/*
|--------------------------------------------------------------------------
| Lead ID Params Schema
|--------------------------------------------------------------------------
*/

export const leadIdSchema =
  z.object({
    leadId: z.coerce
      .number({
        message:
          "Lead ID must be a number.",
      })
      .int(
        "Lead ID must be an integer."
      )
      .positive(
        "Lead ID must be greater than zero."
      ),
  });

/*
|--------------------------------------------------------------------------
| Lead List Schema
|--------------------------------------------------------------------------
*/

export const leadListSchema =
  z.object({
    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    search: z
      .string()
      .trim()
      .max(
        190,
        "Search query is too long."
      )
      .optional()
      .default(""),

    /*
    |--------------------------------------------------------------------------
    | Owner
    |--------------------------------------------------------------------------
    */

    ownerId:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    /*
    |--------------------------------------------------------------------------
    | Company
    |--------------------------------------------------------------------------
    */

    companyId:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    /*
    |--------------------------------------------------------------------------
    | Contact
    |--------------------------------------------------------------------------
    */

    primaryContactId:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    /*
    |--------------------------------------------------------------------------
    | Stage
    |--------------------------------------------------------------------------
    */

    stage:
      z
        .enum(
          LEAD_STAGES
        )
        .optional(),

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    status:
      z
        .enum(
          LEAD_STATUSES
        )
        .optional(),

    /*
    |--------------------------------------------------------------------------
    | Industry
    |--------------------------------------------------------------------------
    */

    industry:
      z
        .string()
        .trim()
        .max(120)
        .optional(),

    /*
    |--------------------------------------------------------------------------
    | Source
    |--------------------------------------------------------------------------
    */

    source:
      z
        .enum(
          LEAD_SOURCES
        )
        .optional(),

    /*
    |--------------------------------------------------------------------------
    | Priority
    |--------------------------------------------------------------------------
    */

    priority:
      z
        .enum(
          LEAD_PRIORITIES
        )
        .optional(),

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

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
        .default(20),

    /*
    |--------------------------------------------------------------------------
    | Sorting
    |--------------------------------------------------------------------------
    */

    sort:
      z
        .enum([
          "createdAt",
          "updatedAt",
          "followUpAt",
          "lastTouchAt",
          "companyName",
          "stage",
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