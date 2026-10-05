import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Meeting Types
|--------------------------------------------------------------------------
*/

export const MEETING_TYPES = [
  "VIDEO_CALL",
  "IN_PERSON",
  "PHONE_CALL",
];

/*
|--------------------------------------------------------------------------
| Meeting Statuses
|--------------------------------------------------------------------------
*/

export const MEETING_STATUSES = [
  "SCHEDULED",
  "COMPLETED",
  "RESCHEDULED",
  "CANCELLED",
  "NO_SHOW",
];

/*
|--------------------------------------------------------------------------
| Current / Future Date Validation
|--------------------------------------------------------------------------
|
| Meetings and follow-ups must not be scheduled in the past.
|
| We allow a 60-second tolerance because frontend time inputs normally
| work at minute precision.
|
| Example:
|
| User selects: 11:58
| Request reaches server: 11:58:35
|
| The request should still be accepted.
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
|
| Important:
|
| Do not use something like:
|
| z.date().min(new Date())
|
| at module level because that Date would be created when the server module
| loads. A long-running server would then validate against an old timestamp.
|
| refine() evaluates Date.now() for every request.
|
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
| Optional Future Date Schema
|--------------------------------------------------------------------------
|
| Used for Complete Meeting.
|
| followUpAt is optional/nullable, but when supplied it must not be in
| the past.
|
*/

const optionalFutureDateSchema =
  z.coerce
    .date({
      error:
        "Enter a valid follow-up date and time.",
    })
    .nullable()
    .optional()
    .refine(
      (value) => {
        /*
         * null / undefined are allowed.
         */

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
          "Follow-up date and time cannot be in the past.",
      }
    );

/*
|--------------------------------------------------------------------------
| Schedule Meeting
|--------------------------------------------------------------------------
*/

export const createMeetingSchema =
  z
    .object({
      /*
      |--------------------------------------------------------------------------
      | Related Lead
      |--------------------------------------------------------------------------
      */

      leadId:
        z.coerce
          .number()
          .int()
          .positive(
            "Related lead is required."
          ),

      /*
      |--------------------------------------------------------------------------
      | Contact
      |--------------------------------------------------------------------------
      */

      contactId:
        z.coerce
          .number()
          .int()
          .positive()
          .nullable()
          .optional(),

      /*
      |--------------------------------------------------------------------------
      | Title
      |--------------------------------------------------------------------------
      */

      title:
        z
          .string()
          .trim()
          .min(
            2,
            "Meeting title is required."
          )
          .max(190),

      /*
      |--------------------------------------------------------------------------
      | Start
      |--------------------------------------------------------------------------
      |
      | Meeting cannot be scheduled in the past.
      |
      */

      startsAt:
        futureDateSchema,

      /*
      |--------------------------------------------------------------------------
      | End
      |--------------------------------------------------------------------------
      |
      | endsAt itself does not need to use futureDateSchema because
      | superRefine() ensures it must be after startsAt.
      |
      | Since startsAt cannot be past, an endsAt after startsAt cannot
      | be past either.
      |
      */

      endsAt:
        z.coerce
          .date()
          .nullable()
          .optional(),

      /*
      |--------------------------------------------------------------------------
      | Meeting Type
      |--------------------------------------------------------------------------
      */

      meetingType:
        z.enum(
          MEETING_TYPES
        ),

      /*
      |--------------------------------------------------------------------------
      | Participants
      |--------------------------------------------------------------------------
      */

      participants:
        z
          .array(
            z
              .string()
              .trim()
              .min(1)
              .max(190)
          )
          .max(50)
          .optional()
          .default([]),

      /*
      |--------------------------------------------------------------------------
      | Location
      |--------------------------------------------------------------------------
      */

      location:
        z
          .string()
          .trim()
          .max(500)
          .nullable()
          .optional(),

      /*
      |--------------------------------------------------------------------------
      | Meeting URL
      |--------------------------------------------------------------------------
      */

      meetingUrl:
        z
          .string()
          .trim()
          .max(500)
          .nullable()
          .optional(),

      /*
      |--------------------------------------------------------------------------
      | Agenda
      |--------------------------------------------------------------------------
      */

      agenda:
        z
          .string()
          .trim()
          .max(5000)
          .nullable()
          .optional(),
    })
    .superRefine(
      (
        data,
        ctx
      ) => {
        /*
        |--------------------------------------------------------------------------
        | End Must Be After Start
        |--------------------------------------------------------------------------
        */

        if (
          data.endsAt &&
          data.endsAt <=
            data.startsAt
        ) {
          ctx.addIssue({
            code:
              "custom",

            path: [
              "endsAt",
            ],

            message:
              "Meeting end time must be after the start time.",
          });
        }
      }
    );

/*
|--------------------------------------------------------------------------
| Complete Meeting
|--------------------------------------------------------------------------
*/

export const completeMeetingSchema =
  z
    .object({
      /*
      |--------------------------------------------------------------------------
      | Outcome
      |--------------------------------------------------------------------------
      */

      outcome:
        z
          .string()
          .trim()
          .min(
            2,
            "Meeting outcome is required."
          )
          .max(500),

      /*
      |--------------------------------------------------------------------------
      | Notes
      |--------------------------------------------------------------------------
      */

      notes:
        z
          .string()
          .trim()
          .min(
            2,
            "Meeting notes are required."
          )
          .max(5000),

      /*
      |--------------------------------------------------------------------------
      | Next Action
      |--------------------------------------------------------------------------
      */

      nextAction:
        z
          .string()
          .trim()
          .max(500)
          .nullable()
          .optional(),

      /*
      |--------------------------------------------------------------------------
      | Follow-up Date
      |--------------------------------------------------------------------------
      |
      | Optional.
      |
      | However, when supplied:
      |
      | - Must be a valid datetime
      | - Cannot be in the past
      |
      */

      followUpAt:
        optionalFutureDateSchema,
    })
    .superRefine(
      (
        data,
        ctx
      ) => {
        /*
        |--------------------------------------------------------------------------
        | Next Action + Follow-up Date
        |--------------------------------------------------------------------------
        |
        | They must be provided together.
        |
        */

        const hasAction =
          Boolean(
            data.nextAction
          );

        const hasDate =
          Boolean(
            data.followUpAt
          );

        if (
          hasAction !==
          hasDate
        ) {
          ctx.addIssue({
            code:
              "custom",

            path:
              hasAction
                ? [
                    "followUpAt",
                  ]
                : [
                    "nextAction",
                  ],

            message:
              "Next action and follow-up date must be provided together.",
          });
        }
      }
    );

/*
|--------------------------------------------------------------------------
| Reschedule Meeting
|--------------------------------------------------------------------------
*/

export const rescheduleMeetingSchema =
  z
    .object({
      /*
      |--------------------------------------------------------------------------
      | New Start
      |--------------------------------------------------------------------------
      |
      | Cannot reschedule a meeting into the past.
      |
      */

      startsAt:
        futureDateSchema,

      /*
      |--------------------------------------------------------------------------
      | New End
      |--------------------------------------------------------------------------
      */

      endsAt:
        z.coerce
          .date()
          .nullable()
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
          .min(
            2,
            "Reason is required."
          )
          .max(1000),
    })
    .superRefine(
      (
        data,
        ctx
      ) => {
        /*
        |--------------------------------------------------------------------------
        | End Must Be After Start
        |--------------------------------------------------------------------------
        */

        if (
          data.endsAt &&
          data.endsAt <=
            data.startsAt
        ) {
          ctx.addIssue({
            code:
              "custom",

            path: [
              "endsAt",
            ],

            message:
              "Meeting end time must be after the start time.",
          });
        }
      }
    );

/*
|--------------------------------------------------------------------------
| Cancel Meeting
|--------------------------------------------------------------------------
*/

export const cancelMeetingSchema =
  z.object({
    reason:
      z
        .string()
        .trim()
        .min(
          2,
          "Cancellation reason is required."
        )
        .max(1000),
  });

/*
|--------------------------------------------------------------------------
| No-show
|--------------------------------------------------------------------------
*/

export const noShowMeetingSchema =
  z.object({
    reason:
      z
        .string()
        .trim()
        .min(
          2,
          "No-show note is required."
        )
        .max(1000),
  });

/*
|--------------------------------------------------------------------------
| Meeting ID
|--------------------------------------------------------------------------
*/

export const meetingIdSchema =
  z.object({
    meetingId:
      z.coerce
        .number()
        .int()
        .positive(),
  });

/*
|--------------------------------------------------------------------------
| List Meetings
|--------------------------------------------------------------------------
*/

export const meetingListSchema =
  z.object({
    leadId:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    status:
      z
        .enum(
          MEETING_STATUSES
        )
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