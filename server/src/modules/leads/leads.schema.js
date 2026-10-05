import {
  z,
} from "zod";

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
| Current / Future Date Validation
|--------------------------------------------------------------------------
|
| Follow-up date/time must not be in the past.
|
| A 60-second tolerance is allowed because frontend time inputs normally
| work at minute precision.
|
| Example:
|
| User selects: 11:58
| Request reaches server: 11:58:35
|
| This should still be accepted.
|
*/

const isCurrentOrFutureDate = (
  value
) => {
  if (
    !(value instanceof Date) ||
    Number.isNaN(
      value.getTime()
    )
  ) {
    return false;
  }

  const minimumAllowed =
    Date.now() -
    60 * 1000;

  return (
    value.getTime() >=
    minimumAllowed
  );
};

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
| Owner Options Query
|--------------------------------------------------------------------------
*/

export const leadOwnersQuerySchema =
  z.object({
    branchId:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),
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
| Company Input
|--------------------------------------------------------------------------
*/

const leadCompanySchema =
  z.object({
    name:
      z
        .string()
        .trim()
        .min(
          2,
          "Company name is required."
        )
        .max(190),

    industry:
      z
        .string()
        .trim()
        .min(
          1,
          "Industry is required."
        )
        .max(150),

    city:
      z
        .string()
        .trim()
        .max(120)
        .nullable()
        .optional(),

    website:
      z
        .string()
        .trim()
        .max(500)
        .nullable()
        .optional(),

    agencyRelationship:
      z
        .string()
        .trim()
        .max(255)
        .nullable()
        .optional(),

    marketingActivity:
      z
        .string()
        .trim()
        .max(5000)
        .nullable()
        .optional(),
  });

/*
|--------------------------------------------------------------------------
| Contact Input
|--------------------------------------------------------------------------
*/

const leadContactSchema =
  z.object({
    name:
      z
        .string()
        .trim()
        .min(
          2,
          "Contact name is required."
        )
        .max(190),

    designation:
      z
        .string()
        .trim()
        .max(150)
        .nullable()
        .optional(),

    phone:
      z
        .string()
        .trim()
        .nullable()
        .optional()
        .refine(
          (value) => {
            if (
              value === null ||
              value === undefined ||
              value === ""
            ) {
              return true;
            }

            return /^[6-9]\d{9}$/.test(
              value
            );
          },
          {
            message:
              "Enter a valid 10-digit mobile number.",
          }
        ),

    email:
      z
        .string()
        .trim()
        .max(190)
        .nullable()
        .optional()
        .refine(
          (
            value
          ) => {
            if (
              !value
            ) {
              return true;
            }

            return z
              .string()
              .email()
              .safeParse(
                value
              )
              .success;
          },
          {
            message:
              "Enter a valid contact email.",
          }
        ),

    isDecisionMaker:
      z
        .boolean()
        .default(false),
  });

/*
|--------------------------------------------------------------------------
| Common Lead Fields
|--------------------------------------------------------------------------
*/

const ownerIdSchema =
  z.coerce
    .number()
    .int()
    .positive();

const branchIdSchema =
  z.coerce
    .number()
    .int()
    .positive();

const serviceRequiredSchema =
  z
    .string()
    .trim()
    .min(
      2,
      "Potential requirement is required."
    )
    .max(1000);

const sourceSchema =
  z
    .string()
    .trim()
    .min(
      1,
      "Lead source is required."
    )
    .max(150);

const estimatedValueSchema =
  z.coerce
    .number()
    .min(0)
    .default(0);

const prioritySchema =
  z
    .enum(
      LEAD_PRIORITIES
    )
    .default(
      "Medium"
    );

const descriptionSchema =
  z
    .string()
    .trim()
    .max(5000)
    .nullable()
    .optional();

const nextActionSchema =
  z
    .string()
    .trim()
    .min(
      2,
      "Next action is required."
    )
    .max(500);

/*
|--------------------------------------------------------------------------
| Follow-up Date / Time
|--------------------------------------------------------------------------
|
| Used by:
|
| - Create Lead
| - Update Lead
|
| When followUpAt is supplied, it must:
|
| - Be a valid date/time
| - Be the current time or future
| - Never be in the past
|
| A 60-second tolerance matches the frontend validation.
|
*/

const followUpAtSchema =
  z.coerce
    .date({
      error:
        "Enter a valid follow-up date and time.",
    })
    .refine(
      isCurrentOrFutureDate,
      {
        message:
          "Follow-up date and time cannot be in the past.",
      }
    );

const knownRelationshipSchema =
  z.coerce
    .boolean()
    .default(false);

/*
|--------------------------------------------------------------------------
| Create Lead
|--------------------------------------------------------------------------
|
| The Add Lead modal creates:
|
| Company
| → Contact
| → Lead
|
| in one backend transaction.
|
*/

export const createLeadSchema =
  z.object({
    company:
      leadCompanySchema,

    contact:
      leadContactSchema,

    branchId:
      branchIdSchema,

    ownerId:
      ownerIdSchema,

    serviceRequired:
      serviceRequiredSchema,

    source:
      sourceSchema,

    estimatedValueRupees:
      estimatedValueSchema,

    priority:
      prioritySchema,

    description:
      descriptionSchema,

    nextAction:
      nextActionSchema,

    followUpAt:
      followUpAtSchema,

    knownRelationship:
      knownRelationshipSchema,
  });

/*
|--------------------------------------------------------------------------
| Update Lead
|--------------------------------------------------------------------------
*/

export const updateLeadSchema =
  z.object({
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

    branchId:
      branchIdSchema
        .optional(),

    serviceRequired:
      serviceRequiredSchema
        .optional(),

    source:
      sourceSchema
        .optional(),

    estimatedValueRupees:
      estimatedValueSchema
        .optional(),

    priority:
      prioritySchema
        .optional(),

    description:
      descriptionSchema,

    nextAction:
      nextActionSchema
        .optional(),

    followUpAt:
      followUpAtSchema
        .optional(),

    knownRelationship:
      knownRelationshipSchema
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
      ownerIdSchema,

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