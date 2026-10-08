import { z } from "zod";

export const contactFormSchema = z.object({
  companyId: z
    .string()
    .min(1, "Company is required.")
    .transform((value) => Number(value)),

  name: z
    .string()
    .trim()
    .min(2, "Contact name is required.")
    .max(190, "Contact name is too long."),

  designation: z
    .string()
    .trim()
    .max(150, "Designation is too long.")
    .optional(),

  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d{10}$/.test(value),
      {
        message: "Enter exactly 10 digits for the phone number.",
      }
    )
    .optional(),

  email: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        z.string().email().safeParse(value).success,
      {
        message: "Enter a valid email address.",
      }
    )
    .optional(),

  isDecisionMaker: z
    .enum(["false", "true"])
    .transform((value) => value === "true"),
});

export const defaultContactValues = {
  companyId: "",
  name: "",
  designation: "",
  phone: "",
  email: "",
  isDecisionMaker: "false",
};