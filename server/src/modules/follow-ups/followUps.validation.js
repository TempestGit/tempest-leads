import { z } from 'zod';

const MAX_UNSIGNED_BIGINT = 18446744073709551615n;

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

export const followUpIdSchema = databaseId('Follow-up ID');

export const FOLLOW_UP_VIEWS = [
  'ALL',
  'TODAY',
  'UPCOMING',
  'OVERDUE',
  'COMPLETED',
  'RESCHEDULED',
  'CANCELLED',
];

function requiredText(maxLength, label) {
  return z
    .string()
    .trim()
    .min(2, `${label} must contain at least 2 characters.`)
    .max(
      maxLength,
      `${label} must not exceed ${maxLength} characters.`,
    );
}

function optionalId(label) {
  return z.preprocess(
    (value) => value === '' ? undefined : value,
    databaseId(label).optional(),
  );
}

const versionSchema = z
  .number()
  .int('Record version must be an integer.')
  .min(1, 'Record version is invalid.')
  .max(4294967294, 'Record version is invalid.');

/*
 * Require an explicit timezone.
 *
 * Accepted examples:
 * 2026-10-01T10:30:00+05:30
 * 2026-10-01T05:00:00Z
 *
 * The repository converts the value to UTC.
 */
const futureDateTimeSchema = z.iso
  .datetime({ offset: true })
  .superRefine((value, ctx) => {
    const timestamp = Date.parse(value);

    if (!Number.isFinite(timestamp)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid follow-up date and time.',
      });
      return;
    }

    const year = new Date(timestamp).getUTCFullYear();

    if (year < 1000 || year > 9999) {
      ctx.addIssue({
        code: 'custom',
        message: 'Follow-up time is outside the supported date range.',
      });
    }

    if (timestamp <= Date.now()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Choose a future follow-up date and time.',
      });
    }
  });

/*
 * GET /api/follow-ups
 *
 * TODAY, UPCOMING, and OVERDUE apply to pending records.
 * The repository will calculate day boundaries in IST.
 */
export const listFollowUpsSchema = z
  .object({
    view: z
      .enum(FOLLOW_UP_VIEWS)
      .default('TODAY'),

    lead_id: optionalId('Lead ID'),

    owner_id: optionalId('Owner ID'),

    search: z
      .string()
      .trim()
      .max(100, 'Search must not exceed 100 characters.')
      .optional()
      .default(''),

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

/*
 * POST /api/follow-ups/:id/complete
 *
 * Completing a follow-up preserves the original record
 * and creates its next pending follow-up.
 *
 * The server sets completed_at and completed_by.
 */
export const completeFollowUpSchema = z
  .object({
    version: versionSchema,

    outcome: requiredText(190, 'Outcome'),

    notes: requiredText(10000, 'Completion notes'),

    next_action: requiredText(500, 'Next action'),

    next_follow_up_at: futureDateTimeSchema,
  })
  .strict();

/*
 * POST /api/follow-ups/:id/reschedule
 *
 * Preserve the original record as RESCHEDULED.
 * Create a successor with the revised action and due time.
 *
 * The reason is stored on the original record.
 */
export const rescheduleFollowUpSchema = z
  .object({
    version: versionSchema,

    reason: requiredText(10000, 'Rescheduling reason'),

    next_action: requiredText(500, 'Next action'),

    next_follow_up_at: futureDateTimeSchema,
  })
  .strict();