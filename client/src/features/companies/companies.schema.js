import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Company Industries
|--------------------------------------------------------------------------
*/

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
| Company Form Schema
|--------------------------------------------------------------------------
*/

export const companyFormSchema = z.object({
  name: z
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
    COMPANY_INDUSTRIES,
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

  agencyRelationship: z
    .string()
    .trim()
    .max(
      255,
      "Existing agency is too long."
    )
    .optional(),
});

/*
|--------------------------------------------------------------------------
| Default Values
|--------------------------------------------------------------------------
*/

export const defaultCompanyValues = {
  name: "",
  industry: "Other",
  city: "",
  website: "",
  agencyRelationship: "",
};