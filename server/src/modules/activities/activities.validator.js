import { z } from 'zod';

const MAX_UNSIGNED_BIGINT = 18446744073709551615n;

export const ACTIVITY_TYPES = [
  'CALL',
  'EMAIL',
  'WHATSAPP',
  'LINKEDIN',
  'MEETING',
  'REFERRAL',
  'FOLLOW_UP',
  'NOTE',
  'PITCH',
  'COMMERCIAL_DISCUSSION',
  'CONTRACT',
  'ONBOARDING',
  'OTHER',
];

export const ACTIVITY_DIRECTIONS = [
  'INBOUND',
  'OUTBOUND',
];

function databaseId(label) {
  return z
    .string()
    .regex(/^[1-9]\d{0,19}$/, `${label} is invalid.`)
    .refine((value) => {
      try {
        return BigInt(value) <= MAX_UNSIGNED_BIGINT;
      } catch {
        return false;
      }
    }, `${label} is invalid.`);
}

export const activityIdSchema = databaseId('Activity ID');

function optionalText(maxLength, label) {
  return z
    .string()
    .trim()
    .max(
      maxLength,
      `${label} must not exceed ${maxLength} characters.`,
    )
    .optional()
    .default('');
}

/*
 * Empty, null, or omitted contact means a general lead activity.
 */
const optionalContactIdSchema = z.preprocess(
  (value) =>
    value === '' || value === null
      ? undefined
      : value,
  databaseId('Contact ID').optional(),
);

/*
 * Internal activities can omit direction.
 */
const optionalDirectionSchema = z.preprocess(
  (value) =>
    value === '' || value === null
      ? undefined
      : value,
  z.enum(ACTIVITY_DIRECTIONS).optional(),
);

/*
 * Require an explicit timezone:
 * 2026-09-21T10:30:00+05:30
 * or
 * 2026-09-21T05:00:00Z
 */
const occurredAtSchema = z.iso
  .datetime({ offset: true })
  .superRefine((value, ctx) => {
    const timestamp = Date.parse(value);

    if (!Number.isFinite(timestamp)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid activity date and time.',
      });
      return;
    }

    const year = new Date(timestamp).getUTCFullYear();

    if (year < 1000 || year > 9999) {
      ctx.addIssue({
        code: 'custom',
        message: 'Activity time is outside the supported date range.',
      });
    }

    if (timestamp > Date.now()) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Activity time cannot be in the future. Schedule a follow-up instead.',
      });
    }
  });

/*
 * POST /api/activities
 *
 * The server derives company and creator from the lead
 * and authenticated user. Unknown fields are rejected.
 */
export const createActivitySchema = z
  .object({
    lead_id: databaseId('Lead ID'),

    contact_id: optionalContactIdSchema,

    activity_type: z.enum(ACTIVITY_TYPES),

    direction: optionalDirectionSchema,

    subject: optionalText(190, 'Subject'),

    notes: optionalText(10000, 'Notes'),

    outcome: optionalText(50, 'Outcome'),

    occurred_at: occurredAtSchema,
  })
  .strict()
  .superRefine((values, ctx) => {
    if (!values.subject && !values.notes) {
      ctx.addIssue({
        code: 'custom',
        path: ['notes'],
        message: 'Enter an activity subject or notes.',
      });
    }

    if (
      values.activity_type === 'NOTE' &&
      values.direction !== undefined
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['direction'],
        message:
          'Internal notes must not have an inbound or outbound direction.',
      });
    }
  });

/*
 * GET /api/activities
 *
 * Empty optional filters are treated as not selected.
 * Ownership restrictions remain enforced in the repository.
 */
export const listActivitiesSchema = z
  .object({
    lead_id: z.preprocess(
      (value) => value === '' ? undefined : value,
      databaseId('Lead ID').optional(),
    ),

    activity_type: z.preprocess(
      (value) => value === '' ? undefined : value,
      z.enum(ACTIVITY_TYPES).optional(),
    ),

    search: optionalText(100, 'Search'),

    page: z.coerce
      .number()
      .int()
      .min(1)
      .max(100000)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10),
  })
  .strict();