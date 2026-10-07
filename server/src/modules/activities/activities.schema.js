import {
  z,
} from "zod";

/*
|--------------------------------------------------------------------------
| Manual Activity Types
|--------------------------------------------------------------------------
*/

export const ACTIVITY_TYPES = [
  "Activity",
  "Call",
  "Email",
  "WhatsApp",
  "LinkedIn",
  "Meeting",
  "Referral",
  "Follow-up",
  "Note",
  "Stage change",
  "Pitch",
  "Commercial discussion",
  "Contract",
  "Onboarding",
  "Other",
];

/*
|--------------------------------------------------------------------------
| Create Activity
|--------------------------------------------------------------------------
*/

export const createActivitySchema =
  z
    .object({
      leadId:
        z.coerce
          .number()
          .int()
          .positive(
            "Lead is required."
          ),

      activityType:
        z
          .enum(
            ACTIVITY_TYPES
          )
          .default(
            "Activity"
          ),

      outcome:
        z
          .string()
          .trim()
          .min(
            2,
            "Outcome is required."
          )
          .max(
            500
          ),

      notes:
        z
          .string()
          .trim()
          .max(
            5000
          )
          .nullable()
          .optional(),

      nextAction:
        z
          .string()
          .trim()
          .max(
            500
          )
          .nullable()
          .optional(),

      nextFollowUpAt:
        z.coerce
          .date()
          .nullable()
          .optional(),
    })

    /*
    |--------------------------------------------------------------------------
    | Cross-field Validation
    |--------------------------------------------------------------------------
    */

    .superRefine(
      (
        data,
        ctx
      ) => {
        const hasNextAction =
          Boolean(
            data.nextAction
          );

        const hasFollowUp =
          Boolean(
            data.nextFollowUpAt
          );

        /*
        |--------------------------------------------------------------------------
        | Next Action + Follow-up Must Exist Together
        |--------------------------------------------------------------------------
        */

        if (
          hasNextAction !==
          hasFollowUp
        ) {
          ctx.addIssue({
            code:
              "custom",

            path:
              hasNextAction
                ? [
                    "nextFollowUpAt",
                  ]
                : [
                    "nextAction",
                  ],

            message:
              "Next action and next follow-up must be provided together.",
          });
        }

        /*
        |--------------------------------------------------------------------------
        | Follow-up Must Be In The Future
        |--------------------------------------------------------------------------
        |
        | This is intentionally validated
        | on the server as well as the UI.
        |
        | A user/API client must not be
        | able to bypass the browser and
        | create an already-overdue
        | follow-up.
        |
        */

        if (
          data.nextFollowUpAt &&
          data.nextFollowUpAt.getTime() <=
            Date.now()
        ) {
          ctx.addIssue({
            code:
              "custom",

            path: [
              "nextFollowUpAt",
            ],

            message:
              "Next follow-up must be in the future.",
          });
        }
      }
    );

/*
|--------------------------------------------------------------------------
| Activity List Query
|--------------------------------------------------------------------------
*/

export const activityListSchema =
  z.object({
    leadId:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    page:
      z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit:
      z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(50),
  });