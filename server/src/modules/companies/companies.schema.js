import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

export const COMPANY_STATUSES = [
  "ACTIVE",
  "NURTURE",
  "LOST",
  "INACTIVE",
];

export const COMPANY_INDUSTRIES = [
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

const nullableText = (maxLength) =>
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

const optionalNullableText = (maxLength) =>
  z.preprocess(
    (value) => {
      if (value === "") {
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
| Create Company
|--------------------------------------------------------------------------
|
| UI fields match the prototype:
|
| - Company name *
| - Industry *
| - City
| - Website
| - Existing agency
|
| Other database fields receive backend defaults.
|
*/

export const createCompanySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Company name must contain at least 2 characters.")
    .max(190, "Company name cannot exceed 190 characters."),

  industry: z.enum(COMPANY_INDUSTRIES, {
    message: "Please select a valid industry.",
  }),

  city: nullableText(120),

  website: nullableText(500),

  agencyRelationship: nullableText(255),
});

/*
|--------------------------------------------------------------------------
| Update Company
|--------------------------------------------------------------------------
|
| Keep update API available for future record-detail functionality.
|
*/

export const updateCompanySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Company name must contain at least 2 characters.")
      .max(190)
      .optional(),

    industry: z
      .enum(COMPANY_INDUSTRIES)
      .optional(),

    city: optionalNullableText(120),

    state: optionalNullableText(120),

    country: optionalNullableText(120),

    website: optionalNullableText(500),

    agencyRelationship:
      optionalNullableText(255),

    source: optionalNullableText(120),

    status: z
      .enum(COMPANY_STATUSES)
      .optional(),

    notes: optionalNullableText(5000),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message:
        "At least one field must be provided.",
    }
  );

/*
|--------------------------------------------------------------------------
| Company ID Params
|--------------------------------------------------------------------------
*/

export const companyIdSchema = z.object({
  companyId: z.coerce
    .number()
    .int("Company ID must be an integer.")
    .positive(
      "Company ID must be greater than zero."
    ),
});

/*
|--------------------------------------------------------------------------
| Company List Query
|--------------------------------------------------------------------------
*/

export const companyListSchema = z.object({
  search: z
    .string()
    .trim()
    .max(190)
    .optional()
    .default(""),

  status: z
    .enum(COMPANY_STATUSES)
    .optional(),

  industry: z
    .string()
    .trim()
    .max(120)
    .optional(),

  city: z
    .string()
    .trim()
    .max(120)
    .optional(),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),

  sort: z
    .enum([
      "name",
      "createdAt",
      "updatedAt",
      "city",
      "industry",
    ])
    .default("createdAt"),

  direction: z
    .enum(["asc", "desc"])
    .default("asc"),
});