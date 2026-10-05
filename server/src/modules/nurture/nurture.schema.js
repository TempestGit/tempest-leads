import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Categories
|--------------------------------------------------------------------------
*/

export const NURTURE_CATEGORIES = [
  "LATER",
  "NO_RESPONSE",
  "LOST_NOT_INTERESTED",
  "FUTURE_OPPORTUNITY",
];

/*
|--------------------------------------------------------------------------
| Communication Status
|--------------------------------------------------------------------------
*/

export const COMMUNICATION_STATUSES = [
  "NOT_CONTACTED",
  "CONTACTED",
  "ENGAGED",
  "NO_RESPONSE",
  "DO_NOT_CONTACT",
];

/*
|--------------------------------------------------------------------------
| Reconnect Priorities
|--------------------------------------------------------------------------
*/

export const NURTURE_PRIORITIES = [
  "High",
  "Medium",
  "Low",
];

/*
|--------------------------------------------------------------------------
| Current / Future Date Validation
|--------------------------------------------------------------------------
|
| Reconnect dates must not be in the past.
|
| A 60-second tolerance is allowed because frontend time inputs normally
| work at minute precision.
|
| Example:
|
| Selected: 11:58:00
| Request reaches server: 11:58:35
|
| This should remain valid.
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
| Required Future Date
|--------------------------------------------------------------------------
|
| Used when scheduling a reconnect.
|
*/

const futureDateSchema =
  z.coerce
    .date({
      error:
        "Enter a valid reconnect date and time.",
    })
    .refine(
      isCurrentOrFutureDate,
      {
        message:
          "Reconnect date and time cannot be in the past.",
      }
    );

/*
|--------------------------------------------------------------------------
| Optional Future Date
|--------------------------------------------------------------------------
|
| Used by the nurture profile.
|
| reconnectAt can be:
|
| - undefined
| - null
| - a valid current/future datetime
|
*/

const optionalFutureDateSchema =
  z.coerce
    .date({
      error:
        "Enter a valid reconnect date and time.",
    })
    .nullable()
    .optional()
    .refine(
      (
        value
      ) => {
        if (
          value === null ||
          value === undefined
        ) {
          return true;
        }

        return isCurrentOrFutureDate(
          value
        );
      },
      {
        message:
          "Reconnect date and time cannot be in the past.",
      }
    );

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export const nurtureListSchema =
  z.object({
    category:
      z
        .enum(
          NURTURE_CATEGORIES
        )
        .optional(),

    search:
      z
        .string()
        .trim()
        .max(200)
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

/*
|--------------------------------------------------------------------------
| Lead ID
|--------------------------------------------------------------------------
*/

export const nurtureLeadIdSchema =
  z.object({
    leadId:
      z.coerce
        .number()
        .int()
        .positive(),
  });

/*
|--------------------------------------------------------------------------
| Update Nurture Profile
|--------------------------------------------------------------------------
*/

export const updateNurtureSchema =
  z.object({
    /*
    |--------------------------------------------------------------------------
    | Category
    |--------------------------------------------------------------------------
    */

    category:
      z
        .enum(
          NURTURE_CATEGORIES
        )
        .optional(),

    /*
    |--------------------------------------------------------------------------
    | Reason
    |--------------------------------------------------------------------------
    */

    reason:
      z
        .string()
        .trim()
        .max(500)
        .nullable()
        .optional(),

    /*
    |--------------------------------------------------------------------------
    | Buying Stage
    |--------------------------------------------------------------------------
    */

    buyingStage:
      z
        .string()
        .trim()
        .max(150)
        .nullable()
        .optional(),

    /*
    |--------------------------------------------------------------------------
    | Communication Status
    |--------------------------------------------------------------------------
    */

    communicationStatus:
      z
        .enum(
          COMMUNICATION_STATUSES
        )
        .optional(),

    /*
    |--------------------------------------------------------------------------
    | Reconnect Date
    |--------------------------------------------------------------------------
    |
    | Optional.
    |
    | When provided, it cannot be in the past.
    |
    */

    reconnectAt:
      optionalFutureDateSchema,
  });

/*
|--------------------------------------------------------------------------
| Schedule Reconnect
|--------------------------------------------------------------------------
*/

export const scheduleReconnectSchema =
  z.object({
    /*
    |--------------------------------------------------------------------------
    | Action
    |--------------------------------------------------------------------------
    */

    action:
      z
        .string()
        .trim()
        .min(
          2,
          "Reconnect action is required."
        )
        .max(500)
        .default(
          "Reconnect"
        ),

    /*
    |--------------------------------------------------------------------------
    | Due Date
    |--------------------------------------------------------------------------
    |
    | Required.
    |
    | Must be a valid current/future datetime.
    |
    */

    dueAt:
      futureDateSchema,

    /*
    |--------------------------------------------------------------------------
    | Priority
    |--------------------------------------------------------------------------
    */

    priority:
      z
        .enum(
          NURTURE_PRIORITIES
        )
        .default(
          "Medium"
        ),

    /*
    |--------------------------------------------------------------------------
    | Notes
    |--------------------------------------------------------------------------
    */

    notes:
      z
        .string()
        .trim()
        .max(5000)
        .nullable()
        .optional(),
  });