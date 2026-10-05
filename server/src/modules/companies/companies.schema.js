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
| Website Validation
|--------------------------------------------------------------------------
|
| Website is optional.
|
| Accepted examples:
|
| tempestadvertising.com
| www.tempestadvertising.com
| https://tempestadvertising.com
| http://tempestadvertising.com
| https://www.tempestadvertising.com/about
| subdomain.example.co.in
|
| The value is NOT modified.
|
| If the user enters:
|
| tempestadvertising.com
|
| the same value is kept.
|
*/

const isValidWebsite = (
  value
) => {
  if (
    typeof value !==
    "string"
  ) {
    return false;
  }

  const website =
    value.trim();

  if (!website) {
    return false;
  }

  /*
   * Spaces are never valid
   * inside a website.
   */

  if (
    /\s/.test(
      website
    )
  ) {
    return false;
  }

  /*
   * Add a protocol temporarily
   * only for validation.
   *
   * This does NOT modify the
   * actual submitted value.
   */

  const valueToValidate =
    /^https?:\/\//i.test(
      website
    )
      ? website
      : `https://${website}`;

  try {
    const url =
      new URL(
        valueToValidate
      );

    /*
     * Only HTTP/HTTPS websites
     * are accepted.
     */

    if (
      url.protocol !==
        "http:" &&
      url.protocol !==
        "https:"
    ) {
      return false;
    }

    const hostname =
      url.hostname;

    /*
     * Hostname must exist.
     */

    if (!hostname) {
      return false;
    }

    /*
     * Basic domain validation.
     *
     * Must contain:
     *
     * example.com
     * example.co.in
     * sub.example.com
     */

    const domainPattern =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

    return domainPattern.test(
      hostname
    );
  } catch {
    return false;
  }
};

/*
|--------------------------------------------------------------------------
| Nullable Website
|--------------------------------------------------------------------------
|
| Used when creating a company.
|
*/

const nullableWebsite =
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
      .max(
        500,
        "Website cannot exceed 500 characters."
      )
      .refine(
        isValidWebsite,
        {
          message:
            "Enter a valid website, for example example.com.",
        }
      )
      .nullable()
  );

/*
|--------------------------------------------------------------------------
| Optional Nullable Website
|--------------------------------------------------------------------------
|
| Used when updating a company.
|
| undefined = do not change website
| null      = clear website
|
*/

const optionalNullableWebsite =
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
      .max(
        500,
        "Website cannot exceed 500 characters."
      )
      .refine(
        isValidWebsite,
        {
          message:
            "Enter a valid website, for example example.com.",
        }
      )
      .nullable()
      .optional()
  );

/*
|--------------------------------------------------------------------------
| Create Company
|--------------------------------------------------------------------------
|
| UI fields:
|
| - Company name *
| - Industry *
| - City
| - Website
| - Existing agency
|
*/

export const createCompanySchema =
  z.object({
    /*
    |--------------------------------------------------------------------------
    | Company Name
    |--------------------------------------------------------------------------
    */

    name:
      z
        .string()
        .trim()
        .min(
          2,
          "Company name must contain at least 2 characters."
        )
        .max(
          190,
          "Company name cannot exceed 190 characters."
        ),

    /*
    |--------------------------------------------------------------------------
    | Industry
    |--------------------------------------------------------------------------
    */

    industry:
      z.enum(
        COMPANY_INDUSTRIES,
        {
          message:
            "Please select a valid industry.",
        }
      ),

    /*
    |--------------------------------------------------------------------------
    | City
    |--------------------------------------------------------------------------
    */

    city:
      nullableText(
        120
      ),

    /*
    |--------------------------------------------------------------------------
    | Website
    |--------------------------------------------------------------------------
    */

    website:
      nullableWebsite,

    /*
    |--------------------------------------------------------------------------
    | Existing Agency
    |--------------------------------------------------------------------------
    */

    agencyRelationship:
      nullableText(
        255
      ),
  });

/*
|--------------------------------------------------------------------------
| Update Company
|--------------------------------------------------------------------------
*/

export const updateCompanySchema =
  z
    .object({
      /*
      |--------------------------------------------------------------------------
      | Company Name
      |--------------------------------------------------------------------------
      */

      name:
        z
          .string()
          .trim()
          .min(
            2,
            "Company name must contain at least 2 characters."
          )
          .max(190)
          .optional(),

      /*
      |--------------------------------------------------------------------------
      | Industry
      |--------------------------------------------------------------------------
      */

      industry:
        z
          .enum(
            COMPANY_INDUSTRIES
          )
          .optional(),

      /*
      |--------------------------------------------------------------------------
      | Location
      |--------------------------------------------------------------------------
      */

      city:
        optionalNullableText(
          120
        ),

      state:
        optionalNullableText(
          120
        ),

      country:
        optionalNullableText(
          120
        ),

      /*
      |--------------------------------------------------------------------------
      | Website
      |--------------------------------------------------------------------------
      */

      website:
        optionalNullableWebsite,

      /*
      |--------------------------------------------------------------------------
      | Agency Relationship
      |--------------------------------------------------------------------------
      */

      agencyRelationship:
        optionalNullableText(
          255
        ),

      /*
      |--------------------------------------------------------------------------
      | Source
      |--------------------------------------------------------------------------
      */

      source:
        optionalNullableText(
          120
        ),

      /*
      |--------------------------------------------------------------------------
      | Status
      |--------------------------------------------------------------------------
      */

      status:
        z
          .enum(
            COMPANY_STATUSES
          )
          .optional(),

      /*
      |--------------------------------------------------------------------------
      | Notes
      |--------------------------------------------------------------------------
      */

      notes:
        optionalNullableText(
          5000
        ),
    })
    .refine(
      (
        data
      ) =>
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
| Company ID Params
|--------------------------------------------------------------------------
*/

export const companyIdSchema =
  z.object({
    companyId:
      z.coerce
        .number()
        .int(
          "Company ID must be an integer."
        )
        .positive(
          "Company ID must be greater than zero."
        ),
  });

/*
|--------------------------------------------------------------------------
| Company List Query
|--------------------------------------------------------------------------
*/

export const companyListSchema =
  z.object({
    search:
      z
        .string()
        .trim()
        .max(190)
        .optional()
        .default(""),

    status:
      z
        .enum(
          COMPANY_STATUSES
        )
        .optional(),

    industry:
      z
        .string()
        .trim()
        .max(120)
        .optional(),

    city:
      z
        .string()
        .trim()
        .max(120)
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
        .default(20),

    sort:
      z
        .enum([
          "name",
          "createdAt",
          "updatedAt",
          "city",
          "industry",
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
          "asc"
        ),
  });