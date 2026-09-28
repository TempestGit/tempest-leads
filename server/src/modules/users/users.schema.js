import { z } from "zod";

export const USER_ROLES = [
  "SUPER_ADMIN",
  "OWNER",
];

export const USER_STATUSES = [
  "ACTIVE",
  "INACTIVE",
];

export const userIdSchema =
  z.object({
    userId:
      z.coerce
        .number()
        .int()
        .positive(),
  });

export const usersListQuerySchema =
  z.object({
    search:
      z.string()
        .trim()
        .max(190)
        .optional(),

    status:
      z.enum(
        USER_STATUSES
      )
        .optional(),

    branchId:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),
  });

export const createUserSchema =
  z.object({
    fullName:
      z.string()
        .trim()
        .min(
          2,
          "Full name is required."
        )
        .max(150),

    email:
      z.string()
        .trim()
        .email(
          "Enter a valid email."
        )
        .max(190),

    password:
      z.string()
        .min(
          8,
          "Password must contain at least 8 characters."
        )
        .max(128),

    role:
      z.enum(
        USER_ROLES
      )
        .default(
          "OWNER"
        ),

    department:
      z.string()
        .trim()
        .max(120)
        .nullable()
        .optional(),

    location:
      z.string()
        .trim()
        .max(120)
        .nullable()
        .optional(),

    branchId:
      z.coerce
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),
  });

export const updateUserSchema =
  z.object({
    fullName:
      z.string()
        .trim()
        .min(2)
        .max(150)
        .optional(),

    email:
      z.string()
        .trim()
        .email()
        .max(190)
        .optional(),

    password:
      z.string()
        .min(8)
        .max(128)
        .optional(),

    role:
      z.enum(
        USER_ROLES
      )
        .optional(),

    department:
      z.string()
        .trim()
        .max(120)
        .nullable()
        .optional(),

    location:
      z.string()
        .trim()
        .max(120)
        .nullable()
        .optional(),

    branchId:
      z.coerce
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),
  })
    .refine(
      (data) =>
        Object.keys(data)
          .length > 0,
      {
        message:
          "At least one field is required.",
      }
    );

export const updateUserStatusSchema =
  z.object({
    status:
      z.enum(
        USER_STATUSES
      ),
  });