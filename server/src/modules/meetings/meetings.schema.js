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
| Schedule Meeting
|--------------------------------------------------------------------------
*/

export const createMeetingSchema =
  z
    .object({
      leadId: z.coerce
        .number()
        .int()
        .positive(
          "Related lead is required."
        ),

      contactId: z.coerce
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),

      title: z
        .string()
        .trim()
        .min(
          2,
          "Meeting title is required."
        )
        .max(190),

      startsAt:
        z.coerce.date(),

      endsAt:
        z.coerce
          .date()
          .nullable()
          .optional(),

      meetingType:
        z.enum(
          MEETING_TYPES
        ),

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

      location: z
        .string()
        .trim()
        .max(500)
        .nullable()
        .optional(),

      meetingUrl: z
        .string()
        .trim()
        .max(500)
        .nullable()
        .optional(),

      agenda: z
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
      outcome: z
        .string()
        .trim()
        .min(
          2,
          "Meeting outcome is required."
        )
        .max(500),

      notes: z
        .string()
        .trim()
        .min(
          2,
          "Meeting notes are required."
        )
        .max(5000),

      nextAction: z
        .string()
        .trim()
        .max(500)
        .nullable()
        .optional(),

      followUpAt:
        z.coerce
          .date()
          .nullable()
          .optional(),
    })
    .superRefine(
      (
        data,
        ctx
      ) => {
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
      startsAt:
        z.coerce.date(),

      endsAt:
        z.coerce
          .date()
          .nullable()
          .optional(),

      reason: z
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
    reason: z
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
    reason: z
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
    leadId: z.coerce
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