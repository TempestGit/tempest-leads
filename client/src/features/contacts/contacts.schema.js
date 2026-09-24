import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Contact Form Schema
|--------------------------------------------------------------------------
|
| Exact visible fields from prototype:
|
| Company *
| Name *
| Designation
| Phone
| Email
| Decision maker
|
*/

export const contactFormSchema =
  z.object({
    companyId: z
      .string()
      .min(
        1,
        "Company is required."
      )
      .transform(
        (value) =>
          Number(value)
      ),

    name: z
      .string()
      .trim()
      .min(
        2,
        "Contact name is required."
      )
      .max(
        190,
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
        (value) =>
          value === "" ||
          z
            .string()
            .email()
            .safeParse(
              value
            ).success,
        {
          message:
            "Enter a valid email address.",
        }
      )
      .optional(),

    isDecisionMaker: z
      .enum([
        "false",
        "true",
      ])
      .transform(
        (value) =>
          value === "true"
      ),
  });

/*
|--------------------------------------------------------------------------
| Default Values
|--------------------------------------------------------------------------
*/

export const defaultContactValues = {
  companyId: "",
  name: "",
  designation: "",
  phone: "",
  email: "",
  isDecisionMaker:
    "false",
};