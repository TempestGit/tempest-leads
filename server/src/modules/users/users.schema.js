
import { z } from "zod";

/*
|--------------------------------------------------------------------------
| User Roles
|--------------------------------------------------------------------------
*/

export const USER_ROLES = [
  "SUPER_ADMIN",
  "OWNER",
];

/*
|--------------------------------------------------------------------------
| User Statuses
|--------------------------------------------------------------------------
*/

export const USER_STATUSES = [
  "ACTIVE",
  "INACTIVE",
];

/*
|--------------------------------------------------------------------------
| User ID Validation
|--------------------------------------------------------------------------
*/

export const userIdSchema = z.object({
  userId: z.coerce
    .number()
    .int("User ID must be an integer.")
    .positive("User ID must be greater than zero."),
});

/*
|--------------------------------------------------------------------------
| List Users Query Validation
|--------------------------------------------------------------------------
*/

export const usersListQuerySchema = z.object({
  search: z.string()
    .trim()
    .max(190, "Search cannot exceed 190 characters.")
    .optional(),

  status: z.enum(USER_STATUSES)
    .optional(),

  branchId: z.coerce
    .number()
    .int("Branch ID must be an integer.")
    .positive("Select a valid branch.")
    .optional(),
});

/*
|--------------------------------------------------------------------------
| Create User Validation
|--------------------------------------------------------------------------
|
| Password is NOT accepted from the frontend.
|
| Backend automatically:
| 1. Generates a secure temporary password.
| 2. Hashes it using bcrypt.
| 3. Saves the hash in MySQL.
| 4. Sends temporary credentials using Resend.
|
|--------------------------------------------------------------------------
*/

export const createUserSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, "Full name must contain at least 2 characters.")
    .max(150, "Full name cannot exceed 150 characters."),

  email: z.string()
    .trim()
    .email("Enter a valid email address.")
    .max(190, "Email cannot exceed 190 characters."),

  role: z.enum(USER_ROLES)
    .default("OWNER"),

  department: z.string()
    .trim()
    .max(120, "Department cannot exceed 120 characters.")
    .nullable()
    .optional(),

  location: z.string()
    .trim()
    .max(120, "Location cannot exceed 120 characters.")
    .nullable()
    .optional(),

  branchId: z.coerce
    .number()
    .int("Branch ID must be an integer.")
    .positive("Select a valid branch.")
    .nullable()
    .optional(),
})
.superRefine((data, context) => {
  if (
    data.role === "OWNER" &&
    !data.branchId
  ) {
    context.addIssue({
      code: "custom",
      path: ["branchId"],
      message: "Branch is required for an Owner.",
    });
  }
})
.strict();

/*
|--------------------------------------------------------------------------
| Update User Validation
|--------------------------------------------------------------------------
|
| Super Admin can update:
| - Full name
| - Email
| - Role
| - Department
| - Location
| - Branch
|
| Password updates are not allowed here.
|
|--------------------------------------------------------------------------
*/

export const updateUserSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, "Full name must contain at least 2 characters.")
    .max(150, "Full name cannot exceed 150 characters.")
    .optional(),

  email: z.string()
    .trim()
    .email("Enter a valid email address.")
    .max(190, "Email cannot exceed 190 characters.")
    .optional(),

  role: z.enum(USER_ROLES)
    .optional(),

  department: z.string()
    .trim()
    .max(120, "Department cannot exceed 120 characters.")
    .nullable()
    .optional(),

  location: z.string()
    .trim()
    .max(120, "Location cannot exceed 120 characters.")
    .nullable()
    .optional(),

  branchId: z.coerce
    .number()
    .int("Branch ID must be an integer.")
    .positive("Select a valid branch.")
    .nullable()
    .optional(),
})
.strict()
.refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required to update a user.",
  }
);

/*
|--------------------------------------------------------------------------
| Update User Status Validation
|--------------------------------------------------------------------------
*/

export const updateUserStatusSchema = z.object({
  status: z.enum(USER_STATUSES, {
    error: "Select a valid user status.",
  }),
});
