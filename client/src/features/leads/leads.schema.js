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
| Step 1 - Company
|--------------------------------------------------------------------------
*/

export const companyStepSchema =
  z.object({
    companyName: z
      .string()
      .trim()
      .min(
        2,
        "Company name is required."
      )
      .max(
        190,
        "Company name is too long."
      ),

    industry: z.enum(
      LEAD_INDUSTRIES,
      {
        message:
          "Industry is required.",
      }
    ),

    city: z
      .string()
      .trim()
      .max(
        120,
        "City is too long."
      )
      .optional(),

    website: z
      .string()
      .trim()
      .max(
        500,
        "Website is too long."
      )
      .optional(),

    agencyRelationship:
      z
        .string()
        .trim()
        .max(
          255,
          "Existing agency is too long."
        )
        .optional(),

    marketingActivity:
      z
        .string()
        .trim()
        .max(
          5000,
          "Marketing activity is too long."
        )
        .optional(),
  });

/*
|--------------------------------------------------------------------------
| Step 2 - Contact
|--------------------------------------------------------------------------
*/

export const contactStepSchema =
  z.object({
    contactName: z
      .string()
      .trim()
      .min(
        2,
        "Contact name is required."
      )
      .max(
        150,
        "Contact name is too long."
      ),

    designation: z
      .string()
      .trim()
      .max(
        150,
        "Designation is too long."
      )
      .optional(),

    phone: z
      .string()
      .trim()
      .max(
        30,
        "Phone number is too long."
      )
      .optional(),

    email: z
      .string()
      .trim()
      .refine(
        (value) => {
          if (!value) {
            return true;
          }

          return z
            .string()
            .email()
            .safeParse(
              value
            ).success;
        },
        {
          message:
            "Enter a valid email address.",
        }
      )
      .optional(),

    decisionMaker:
      z.enum([
        "Yes",
        "No",
      ]),
  });

/*
|--------------------------------------------------------------------------
| Step 3 - Opportunity
|--------------------------------------------------------------------------
*/

export const opportunityStepSchema =
  z.object({
    serviceRequired: z
      .string()
      .trim()
      .min(
        2,
        "Potential requirement is required."
      )
      .max(
        255,
        "Potential requirement is too long."
      ),

    source: z.enum(
      LEAD_SOURCES,
      {
        message:
          "Lead source is required.",
      }
    ),

    estimatedValueRupees:
      z
        .string()
        .refine(
          (value) => {
            if (
              value === ""
            ) {
              return true;
            }

            const number =
              Number(value);

            return (
              Number.isFinite(
                number
              ) &&
              number >= 0
            );
          },
          {
            message:
              "Enter a valid opportunity value.",
          }
        ),

    priority: z.enum(
      LEAD_PRIORITIES
    ),

    description: z
      .string()
      .trim()
      .max(
        5000,
        "Opportunity description is too long."
      )
      .optional(),
  });

/*
|--------------------------------------------------------------------------
| Step 4 - Ownership
|--------------------------------------------------------------------------
*/

export const ownershipStepSchema =
  z.object({
    ownerId: z
      .string()
      .trim()
      .min(
        1,
        "Owner is required."
      ),
  });

/*
|--------------------------------------------------------------------------
| Step 5 - Next Action
|--------------------------------------------------------------------------
*/

export const nextActionStepSchema =
  z.object({
    nextAction: z
      .string()
      .trim()
      .min(
        2,
        "Next action is required."
      )
      .max(
        500,
        "Next action is too long."
      ),

    followUpDate: z
      .string()
      .trim()
      .min(
        1,
        "Follow-up date is required."
      ),

    followUpTime: z
      .string()
      .trim()
      .optional(),

    knownRelationship:
      z.enum([
        "No / Unknown",
        "Yes / Existing",
      ]),
  });

/*
|--------------------------------------------------------------------------
| Local Date
|--------------------------------------------------------------------------
*/

const getLocalDate = () => {
  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
};

/*
|--------------------------------------------------------------------------
| Create Lead Defaults
|--------------------------------------------------------------------------
*/

export const createLeadDefaults =
  () => ({
    /*
    |--------------------------------------------------------------------------
    | Company
    |--------------------------------------------------------------------------
    */

    companyName: "",

    industry:
      "Real Estate",

    city: "",

    website: "",

    agencyRelationship:
      "",

    marketingActivity:
      "",

    /*
    |--------------------------------------------------------------------------
    | Contact
    |--------------------------------------------------------------------------
    */

    contactName: "",

    designation: "",

    phone: "",

    email: "",

    decisionMaker:
      "No",

    /*
    |--------------------------------------------------------------------------
    | Opportunity
    |--------------------------------------------------------------------------
    */

    serviceRequired:
      "",

    source:
      "LinkedIn",

    estimatedValueRupees:
      "",

    priority:
      "Medium",

    description:
      "",

    /*
    |--------------------------------------------------------------------------
    | Ownership
    |--------------------------------------------------------------------------
    */

    ownerId: "",

    /*
    |--------------------------------------------------------------------------
    | Next Action
    |--------------------------------------------------------------------------
    */

    nextAction: "",

    followUpDate:
      getLocalDate(),

    followUpTime:
      "10:00",

    knownRelationship:
      "No / Unknown",
  });