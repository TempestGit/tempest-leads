
import { z } from "zod";

const strongPassword = z
  .string()
  .min(12, "Password must contain at least 12 characters.")
  .max(72, "Password must not exceed 72 characters.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[0-9]/, "Password must include a number.")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character.");

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(190, "Email address is too long."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().regex(
      /^[a-f0-9]{64}$/i,
      "The password reset link is invalid."
    ),
    newPassword: strongPassword,
    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    }
  );
