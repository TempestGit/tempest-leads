import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Priorities
|--------------------------------------------------------------------------
*/

export const FOLLOWUP_PRIORITIES = [
  "High",
  "Medium",
  "Low",
];

/*
|--------------------------------------------------------------------------
| List Views
|--------------------------------------------------------------------------
*/

export const FOLLOWUP_VIEWS = [
  "ALL",
  "OPEN",
  "TODAY",
  "UPCOMING",
  "OVERDUE",
  "COMPLETED",
  "RESCHEDULED",
];

/*
|--------------------------------------------------------------------------
| Follow-up ID
|--------------------------------------------------------------------------
*/

export const followupIdSchema =
  z.object({
    followupId:
      z.coerce
        .number()
        .int()
        .positive(),
  });

/*
|--------------------------------------------------------------------------
| List Follow-ups
|--------------------------------------------------------------------------
*/

export const followupListSchema =
  z.object({
    leadId:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    view:
      z
        .enum(
          FOLLOWUP_VIEWS
        )
        .default(
          "ALL"
        ),

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

/*
|--------------------------------------------------------------------------
| Schedule Follow-up
|--------------------------------------------------------------------------
*/

export const createFollowupSchema =
  z.object({
    leadId:
      z.coerce
        .number()
        .int()
        .positive(
          "Related lead is required."
        ),

    action:
      z
        .string()
        .trim()
        .min(
          2,
          "Action is required."
        )
        .max(500),

    dueAt:
      z.coerce
        .date(),

    priority:
      z.enum(
        FOLLOWUP_PRIORITIES
      ),

    notes:
      z
        .string()
        .trim()
        .max(5000)
        .nullable()
        .optional(),
  });

/*
|--------------------------------------------------------------------------
| Complete Follow-up
|--------------------------------------------------------------------------
*/

export const completeFollowupSchema =
  z.object({
    outcome:
      z
        .string()
        .trim()
        .min(
          2,
          "Outcome is required."
        )
        .max(500),

    notes:
      z
        .string()
        .trim()
        .min(
          2,
          "Notes are required."
        )
        .max(5000),

    nextAction:
      z
        .string()
        .trim()
        .min(
          2,
          "Next action is required."
        )
        .max(500),

    nextFollowUpAt:
      z.coerce
        .date(),

    nextPriority:
      z
        .enum(
          FOLLOWUP_PRIORITIES
        )
        .optional(),
  });

/*
|--------------------------------------------------------------------------
| Reschedule Follow-up
|--------------------------------------------------------------------------
*/

export const rescheduleFollowupSchema =
  z.object({
    dueAt:
      z.coerce
        .date(),

    action:
      z
        .string()
        .trim()
        .max(500)
        .nullable()
        .optional(),

    priority:
      z
        .enum(
          FOLLOWUP_PRIORITIES
        )
        .optional(),

    reason:
      z
        .string()
        .trim()
        .min(
          2,
          "Reschedule reason is required."
        )
        .max(1000),
  });