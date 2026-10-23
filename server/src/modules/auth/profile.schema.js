
import { z } from "zod";

const optionalProfileText = (label, maxLength) =>
  z
    .string()
    .trim()
    .max(
      maxLength,
      `${label} must not exceed ${maxLength} characters.`
    )
    .nullable()
    .optional()
    .transform((value) => value || null);

export const updateProfileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must contain at least 2 characters.")
      .max(190, "Full name must not exceed 190 characters.")
      .optional(),

    department: optionalProfileText("Department", 150),

    location: optionalProfileText("Location", 150),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "Provide at least one field to update.",
    }
  );
