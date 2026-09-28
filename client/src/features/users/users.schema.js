import {
  z,
} from "zod";

/*
|--------------------------------------------------------------------------
| Roles
|--------------------------------------------------------------------------
*/

export const USER_ROLES = [
  {
    value:
      "OWNER",

    label:
      "User / Owner",
  },

  {
    value:
      "SUPER_ADMIN",

    label:
      "Super Admin",
  },
];

/*
|--------------------------------------------------------------------------
| Statuses
|--------------------------------------------------------------------------
*/

export const USER_STATUSES = [
  {
    value:
      "ACTIVE",

    label:
      "Active",
  },

  {
    value:
      "INACTIVE",

    label:
      "Inactive",
  },
];

/*
|--------------------------------------------------------------------------
| Base Schema
|--------------------------------------------------------------------------
*/

const baseUserFormSchema =
  z.object({
    fullName:
      z
        .string()
        .trim()
        .min(
          2,
          "Full name is required."
        )
        .max(150),

    email:
      z
        .string()
        .trim()
        .email(
          "Enter a valid email."
        )
        .max(190),

    role:
      z.enum([
        "OWNER",
        "SUPER_ADMIN",
      ]),

    department:
      z
        .string()
        .trim()
        .max(120)
        .optional(),

    location:
      z
        .string()
        .trim()
        .max(120)
        .optional(),

    branchId:
      z
        .union([
          z.string(),
          z.number(),
        ])
        .optional(),
  });

/*
|--------------------------------------------------------------------------
| Branch Validation
|--------------------------------------------------------------------------
*/

const validateBranch =
  (
    data,
    context
  ) => {
    if (
      data.role ===
        "OWNER" &&
      !data.branchId
    ) {
      context.addIssue({
        code:
          z.ZodIssueCode
            .custom,

        path: [
          "branchId",
        ],

        message:
          "Branch is required for an Owner.",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export const createUserFormSchema =
  baseUserFormSchema
    .extend({
      password:
        z
          .string()
          .min(
            8,
            "Password must contain at least 8 characters."
          )
          .max(128),
    })
    .superRefine(
      validateBranch
    );

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export const updateUserFormSchema =
  baseUserFormSchema
    .extend({
      password:
        z
          .string()
          .max(128)
          .optional(),
    })
    .superRefine(
      (
        data,
        context
      ) => {
        validateBranch(
          data,
          context
        );

        if (
          data.password &&
          data.password.length <
            8
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode
                .custom,

            path: [
              "password",
            ],

            message:
              "Password must contain at least 8 characters.",
          });
        }
      }
    );