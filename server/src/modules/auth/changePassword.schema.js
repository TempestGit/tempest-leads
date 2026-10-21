
import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({
        error: "Current password is required.",
      })
      .min(1, "Current password is required."),

    newPassword: z
      .string({
        error: "New password is required.",
      })
      .min(12, "New password must contain at least 12 characters.")
      .max(72, "New password must not exceed 72 characters.")
      .regex(/[a-z]/, "Include a lowercase letter.")
      .regex(/[A-Z]/, "Include an uppercase letter.")
      .regex(/[0-9]/, "Include a number.")
      .regex(/[^A-Za-z0-9]/, "Include a special character."),

    confirmPassword: z
      .string({
        error: "Confirm password is required.",
      })
      .min(1, "Please confirm your new password."),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }

    if (data.currentPassword === data.newPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "Choose a different password.",
      });
    }
  });
