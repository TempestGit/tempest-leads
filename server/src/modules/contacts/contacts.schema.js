import { z } from "zod";
/*
|--------------------------------------------------------------------------
| Contact Status
|--------------------------------------------------------------------------
*/
export const CONTACT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
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
| Email Helpers
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
const optionalNullableEmail =
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
      .email(
        "Enter a valid email address."
      )
      .max(190)
      .nullable()
      .optional()
  );
/*
|--------------------------------------------------------------------------
| Phone Helpers
|--------------------------------------------------------------------------
|
| Phone number is optional.
|
| When provided:
|
| - Must contain exactly 10 digits
| - Must start with 6, 7, 8 or 9
|
| Valid:
|
| 9876543210
| 8123456789
| 7123456789
| 6123456789
|
| Invalid:
|
| 1234567890
| 987654321
| 98765432100
| +919876543210
| 98765abc10
|
*/
const nullablePhone =
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
      .refine(
        (value) =>
          /^[6-9]\d{9}$/.test(
            value
          ),
        {
          message:
            "Enter a valid 10-digit mobile number.",
        }
      )
      .nullable()
  );
const optionalNullablePhone =
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
      .refine(
        (value) =>
          /^[6-9]\d{9}$/.test(
            value
          ),
        {
          message:
            "Enter a valid 10-digit mobile number.",
        }
      )
      .nullable()
      .optional()
  );
/*
|--------------------------------------------------------------------------
| Create Contact
|--------------------------------------------------------------------------
*/
export const createContactSchema =
  z.object({
    /*
    |--------------------------------------------------------------------------
    | Company
    |--------------------------------------------------------------------------
    */
    companyId:
      z.coerce
        .number()
        .int(
          "Company ID must be an integer."
        )
        .positive(
          "Company is required."
        ),
    /*
    |--------------------------------------------------------------------------
    | Name
    |--------------------------------------------------------------------------
    */
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
          "Contact name is too long."
        ),
    /*
    |--------------------------------------------------------------------------
    | Designation
    |--------------------------------------------------------------------------
    */
    designation:
      nullableText(
        150
      ),
    /*
    |--------------------------------------------------------------------------
    | Phone
    |--------------------------------------------------------------------------
    */
    phone:
      nullablePhone,
    /*
    |--------------------------------------------------------------------------
    | Email
    |--------------------------------------------------------------------------
    */
    email:
      nullableEmail,
    /*
    |--------------------------------------------------------------------------
    | Decision Maker
    |--------------------------------------------------------------------------
    */
    isDecisionMaker:
      z
        .boolean()
        .default(false),
  });
/*
|--------------------------------------------------------------------------
| Update Contact
|--------------------------------------------------------------------------
*/
export const updateContactSchema =
  z
    .object({
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
      | Name
      |--------------------------------------------------------------------------
      */
      name:
        z
          .string()
          .trim()
          .min(
            2,
            "Contact name is required."
          )
          .max(150)
          .optional(),
      /*
      |--------------------------------------------------------------------------
      | Designation
      |--------------------------------------------------------------------------
      */
      designation:
        optionalNullableText(
          150
        ),
      /*
      |--------------------------------------------------------------------------
      | Phone
      |--------------------------------------------------------------------------
      */
      phone:
        optionalNullablePhone,
      /*
      |--------------------------------------------------------------------------
      | Email
      |--------------------------------------------------------------------------
      */
      email:
        optionalNullableEmail,
      /*
      |--------------------------------------------------------------------------
      | Decision Maker
      |--------------------------------------------------------------------------
      */
      isDecisionMaker:
        z
          .boolean()
          .optional(),
      /*
      |--------------------------------------------------------------------------
      | Status
      |--------------------------------------------------------------------------
      */
      status:
        z
          .enum(
            CONTACT_STATUSES
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
| Contact ID
|--------------------------------------------------------------------------
*/
export const contactIdSchema =
  z.object({
    contactId:
      z.coerce
        .number()
        .int(
          "Contact ID must be an integer."
        )
        .positive(
          "Contact ID must be positive."
        ),
  });
/*
|--------------------------------------------------------------------------
| Query Boolean
|--------------------------------------------------------------------------
*/
const queryBoolean =
  z
    .enum([
      "true",
      "false",
    ])
    .transform(
      (value) =>
        value === "true"
    )
    .optional();
/*
|--------------------------------------------------------------------------
| Contact List Query
|--------------------------------------------------------------------------
*/
export const contactListSchema =
  z.object({
    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */
    search:
      z
        .string()
        .trim()
        .max(190)
        .optional()
        .default(""),
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
    | Decision Maker
    |--------------------------------------------------------------------------
    */
    isDecisionMaker:
      queryBoolean,
    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */
    status:
      z
        .enum(
          CONTACT_STATUSES
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
          "name",
          "companyName",
          "createdAt",
          "updatedAt",
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