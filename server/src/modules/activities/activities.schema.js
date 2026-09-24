import { z } from "zod";

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

export const createActivitySchema = z
  .object({
    leadId: z.coerce
      .number()
      .int()
      .positive(
        "Lead is required."
      ),

    activityType: z
      .enum(
        ACTIVITY_TYPES
      )
      .default(
        "Activity"
      ),

    outcome: z
      .string()
      .trim()
      .min(
        2,
        "Outcome is required."
      )
      .max(500),

    notes: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .optional(),

    nextAction: z
      .string()
      .trim()
      .max(500)
      .nullable()
      .optional(),

    nextFollowUpAt: z
      .coerce
      .date()
      .nullable()
      .optional(),
  })
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

      if (
        hasNextAction !==
        hasFollowUp
      ) {
        ctx.addIssue({
          code:
            "custom",

          path: hasNextAction
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
    }
  );

/*
|--------------------------------------------------------------------------
| Activity List Query
|--------------------------------------------------------------------------
*/

export const activityListSchema =
  z.object({
    leadId: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(50),
  });