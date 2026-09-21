import { z } from 'zod';

const MAX_UNSIGNED_BIGINT = 18446744073709551615n;

export const MEETING_TYPES = [
  'IN_PERSON',
  'VIDEO_CALL',
  'PHONE_CALL',
];

export const MEETING_STATUSES = [
  'SCHEDULED',
  'COMPLETED',
  'RESCHEDULED',
  'CANCELLED',
  'NO_SHOW',
];

export const MEETING_VIEWS = [
  'ALL',
  'TODAY',
  'UPCOMING',
  'PAST_DUE',
  'COMPLETED',
  'RESCHEDULED',
  'CANCELLED',
  'NO_SHOW',
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

export const meetingIdSchema = databaseId('Meeting ID');

function optionalId(label) {
  return z.preprocess(
    (value) =>
      value === '' || value === null
        ? undefined
        : value,
    databaseId(label).optional(),
  );
}

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

const versionSchema = z
  .number()
  .int('Record version must be an integer.')
  .min(1, 'Record version is invalid.')
  .max(4294967294, 'Record version is invalid.');

/*
 * Require a timezone-qualified ISO datetime.
 * UTC storage conversion happens in the repository.
 */
function dateTimeSchema(label) {
  return z.iso
    .datetime({ offset: true })
    .superRefine((value, ctx) => {
      const timestamp = Date.parse(value);

      if (!Number.isFinite(timestamp)) {
        ctx.addIssue({
          code: 'custom',
          message: `Enter a valid ${label.toLowerCase()}.`,
        });
        return;
      }

      const year = new Date(timestamp).getUTCFullYear();

      if (year < 1000 || year > 9999) {
        ctx.addIssue({
          code: 'custom',
          message: `${label} is outside the supported date range.`,
        });
      }
    });
}

function futureDateTimeSchema(label) {
  return dateTimeSchema(label).refine(
    (value) => Date.parse(value) > Date.now(),
    `${label} must be in the future.`,
  );
}

const meetingUrlSchema = optionalText(
  2000,
  'Meeting link',
).refine(
  (value) => {
    if (!value) {
      return true;
    }

    try {
      const url = new URL(value);

      return (
        url.protocol === 'https:' &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  },
  'Enter a valid HTTPS meeting link without embedded credentials.',
);

/*
 * Exactly one identity per participant.
 * Names and email snapshots are loaded by the server.
 */
const participantSchema = z
  .object({
    user_id: optionalId('Participant user ID'),
    contact_id: optionalId('Participant contact ID'),
  })
  .strict()
  .superRefine((value, ctx) => {
    const hasUser = Boolean(value.user_id);
    const hasContact = Boolean(value.contact_id);

    if (hasUser === hasContact) {
      ctx.addIssue({
        code: 'custom',
        path: ['user_id'],
        message:
          'Select either a user or a contact for each participant.',
      });
    }
  });

const participantsSchema = z
  .array(participantSchema)
  .max(100, 'A meeting can have at most 100 additional participants.')
  .optional()
  .default([])
  .superRefine((participants, ctx) => {
    const seen = new Set();

    participants.forEach((participant, index) => {
      const key = participant.user_id
        ? `user:${participant.user_id}`
        : participant.contact_id
          ? `contact:${participant.contact_id}`
          : null;

      if (!key) {
        return;
      }

      if (seen.has(key)) {
        ctx.addIssue({
          code: 'custom',
          path: [index],
          message: 'This participant has already been selected.',
        });
      }

      seen.add(key);
    });
  });

const meetingDetails = {
  title: requiredText(190, 'Meeting title'),

  contact_id: databaseId('Primary contact ID'),

  meeting_type: z.enum(MEETING_TYPES),

  location: optionalText(500, 'Location'),

  meeting_url: meetingUrlSchema,

  agenda: optionalText(10000, 'Agenda'),

  /*
   * Additional participants.
   * The repository will include the owner and primary contact,
   * deduplicating them against this list.
   */
  participants: participantsSchema,
};

function validateMeetingDetails(values, ctx) {
  if (
    values.meeting_type === 'IN_PERSON' &&
    !values.location
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['location'],
      message: 'Enter the location for an in-person meeting.',
    });
  }

  if (
    values.meeting_type === 'VIDEO_CALL' &&
    !values.meeting_url
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['meeting_url'],
      message: 'Enter the video meeting link.',
    });
  }
}

function validateTimeRange(values, ctx) {
  const start = Date.parse(values.starts_at);
  const end = Date.parse(values.ends_at);

  if (
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    end <= start
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['ends_at'],
      message: 'Meeting end time must be after its start time.',
    });
  }
}

/*
 * POST /api/meetings
 *
 * The server derives company, owner, and creator.
 * The meeting owner starts as the lead's current owner.
 */
export const createMeetingSchema = z
  .object({
    lead_id: databaseId('Lead ID'),

    ...meetingDetails,

    starts_at: futureDateTimeSchema('Meeting start time'),

    ends_at: futureDateTimeSchema('Meeting end time'),
  })
  .strict()
  .superRefine((values, ctx) => {
    validateMeetingDetails(values, ctx);
    validateTimeRange(values, ctx);
  });

/*
 * PUT /api/meetings/:id
 *
 * Full update of meeting details.
 * Changing the schedule uses the reschedule endpoint.
 */
export const updateMeetingSchema = z
  .object({
    version: versionSchema,

    ...meetingDetails,

    reason: requiredText(10000, 'Change reason'),
  })
  .strict()
  .superRefine(validateMeetingDetails);

/*
 * POST /api/meetings/:id/reschedule
 *
 * Preserve the old meeting as RESCHEDULED.
 * Copy its details and participants into the successor.
 */
export const rescheduleMeetingSchema = z
  .object({
    version: versionSchema,

    starts_at: futureDateTimeSchema('Meeting start time'),

    ends_at: futureDateTimeSchema('Meeting end time'),

    reason: requiredText(10000, 'Rescheduling reason'),
  })
  .strict()
  .superRefine(validateTimeRange);

/*
 * POST /api/meetings/:id/complete
 *
 * Server records completion actor/time, creates the activity,
 * and schedules the next follow-up.
 */
export const completeMeetingSchema = z
  .object({
    version: versionSchema,

    notes: requiredText(10000, 'Meeting notes'),

    outcome: requiredText(190, 'Meeting outcome'),

    next_action: requiredText(500, 'Next action'),

    next_follow_up_at: futureDateTimeSchema(
      'Next follow-up time',
    ),
  })
  .strict();

/*
 * POST /api/meetings/:id/cancel
 */
export const cancelMeetingSchema = z
  .object({
    version: versionSchema,

    reason: requiredText(10000, 'Cancellation reason'),
  })
  .strict();

/*
 * POST /api/meetings/:id/no-show
 *
 * The repository must check the scheduled start time has passed.
 */
export const noShowMeetingSchema = z
  .object({
    version: versionSchema,

    reason: requiredText(10000, 'No-show reason'),
  })
  .strict();

/*
 * GET /api/meetings
 *
 * TODAY / UPCOMING / PAST_DUE apply to SCHEDULED records.
 * The repository will calculate IST day boundaries.
 */
export const listMeetingsSchema = z
  .object({
    view: z.enum(MEETING_VIEWS).default('TODAY'),

    lead_id: optionalId('Lead ID'),

    owner_id: optionalId('Owner ID'),

    meeting_type: z.preprocess(
      (value) => value === '' ? undefined : value,
      z.enum(MEETING_TYPES).optional(),
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