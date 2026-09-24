import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(190)
    .transform((value) =>
      value.toLowerCase()
    ),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(128),
});