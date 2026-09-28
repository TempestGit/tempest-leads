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
| Create Contact
|--------------------------------------------------------------------------
*/

export const createContactSchema =
  z.object({
    companyId: z.coerce
      .number()
      .int(
        "Company ID must be an integer."
      )
      .positive(
        "Company is required."
      ),

    name: z
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

    designation:
      nullableText(150),

    phone:
      nullableText(30),

    email:
      nullableEmail,

    isDecisionMaker: z
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
      companyId: z.coerce
        .number()
        .int()
        .positive()
        .optional(),

      name: z
        .string()
        .trim()
        .min(
          2,
          "Contact name is required."
        )
        .max(150)
        .optional(),

      designation:
        optionalNullableText(
          150
        ),

      phone:
        optionalNullableText(
          30
        ),

      email:
        optionalNullableEmail,

      isDecisionMaker:
        z
          .boolean()
          .optional(),

      status: z
        .enum(
          CONTACT_STATUSES
        )
        .optional(),

      notes:
        optionalNullableText(
          5000
        ),
    })
    .refine(
      (data) =>
        Object.keys(data)
          .length > 0,
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
    contactId: z.coerce
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
    search: z
      .string()
      .trim()
      .max(190)
      .optional()
      .default(""),

    companyId: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    isDecisionMaker:
      queryBoolean,

    status: z
      .enum(
        CONTACT_STATUSES
      )
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
        "companyName",
        "createdAt",
        "updatedAt",
      ])
      .default(
        "createdAt"
      ),

    direction: z
      .enum([
        "asc",
        "desc",
      ])
      .default(
        "asc"
      ),
  });