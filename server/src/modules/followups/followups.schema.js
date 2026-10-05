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
| Future Date Validation
|--------------------------------------------------------------------------
|
| Follow-up date/time must not be in the past.
|
| A small 60-second tolerance is allowed because:
|
| - Frontend time inputs normally work at minute precision.
| - Network requests take some time.
| - A user may select the current minute and submit several seconds later.
|
| Example:
|
| Selected: 11:58:00
| Submitted: 11:58:35
|
| This should still be accepted.
|
*/

const isCurrentOrFutureDate = (
  value
) => {
  if (
    !(value instanceof Date) ||
    Number.isNaN(
      value.getTime()
    )
  ) {
    return false;
  }

  const minimumAllowed =
    Date.now() -
    60 * 1000;

  return (
    value.getTime() >=
    minimumAllowed
  );
};

/*
|--------------------------------------------------------------------------
| Future Date Schema
|--------------------------------------------------------------------------
*/

const futureDateSchema =
  z.coerce
    .date({
      error:
        "Enter a valid date and time.",
    })
    .refine(
      isCurrentOrFutureDate,
      {
        message:
          "Date and time cannot be in the past.",
      }
    );

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
|
| dueAt:
| - Required
| - Must be a valid date
| - Cannot be in the past
|
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
      futureDateSchema,

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
|
| nextFollowUpAt:
| - Required
| - Must be valid
| - Cannot be in the past
|
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
      futureDateSchema,

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
|
| dueAt:
| - Required
| - Must be valid
| - Cannot be in the past
|
*/

export const rescheduleFollowupSchema =
  z.object({
    dueAt:
      futureDateSchema,

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