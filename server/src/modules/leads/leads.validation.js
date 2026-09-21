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

export const leadIdSchema = databaseId('Lead ID');

export const LEAD_PRIORITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
];

export const LEAD_STATUSES = [
  'OPEN',
  'LOST',
  'NURTURE',
  'ACTIVE_CLIENT',
];

export const LEAD_STAGES = [
  'NEW',
  'CONTACT_RESEARCH',
  'CONNECTED',
  'MEETING',
  'BRIEF',
  'PITCH',
  'COMMERCIALS',
  'CONTRACT_PO',
  'ONBOARDING',
  'ACTIVE_CLIENT',
  'LOST',
  'NURTURE',
];

export const LEAD_SOURCES = [
  'LinkedIn',
  'Google',
  'Competitor research',
  'Referral',
  'Employee referral',
  'Industry event',
  'Tender/RFP',
  'Funding/expansion news',
  'New launch/rebrand',
  'Newspaper',
  'Magazine',
  'Outdoor',
  'TV/radio',
  'Digital/social',
  'Trade publication',
  'Other',
];

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
 * DECIMAL(15, 2):
 * Up to 13 integer digits and 2 decimal places.
 *
 * Keep money as a string to avoid JavaScript floating-point rounding.
 * An empty value means the opportunity value is not known yet.
 */
const opportunityValueSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === '' ||
      /^(0|[1-9]\d{0,12})(\.\d{1,2})?$/.test(value),
    'Enter a non-negative amount with up to 13 integer digits and 2 decimal places.',
  )
  .optional()
  .default('');

/*
 * Require an explicit timezone:
 * 2026-10-01T10:30:00+05:30
 * or
 * 2026-10-01T05:00:00Z
 *
 * A timezone-free datetime-local value must be converted
 * by the frontend before submission.
 */
const followUpDateTimeSchema = z
  .iso
  .datetime({ offset: true })
  .refine(
    (value) => {
      const timestamp = Date.parse(value);

      return Number.isFinite(timestamp) && timestamp > Date.now();
    },
    'Choose a future follow-up date and time.',
  );

/*
 * POST /api/leads
 *
 * Company and contact must already exist.
 * The five-step wizard can create them using their existing APIs
 * before submitting the opportunity.
 */
export const createLeadSchema = z
  .object({
    company_id: databaseId('Company ID'),

    primary_contact_id: databaseId('Primary contact ID'),

    potential_requirement: z
      .string()
      .trim()
      .min(2, 'Describe the potential requirement.')
      .max(
        5000,
        'Potential requirement must not exceed 5000 characters.',
      ),

    opportunity_description: optionalText(
      10000,
      'Opportunity description',
    ),

    service_interest: z
      .string()
      .trim()
      .min(2, 'Enter the service interest.')
      .max(
        190,
        'Service interest must not exceed 190 characters.',
      ),

    lead_source: z.enum(LEAD_SOURCES),

    priority: z.enum(LEAD_PRIORITIES).default('MEDIUM'),

    /*
     * Omit to use the signed-in user.
     * The service must reject another owner for non-admin users.
     */
    owner_id: databaseId('Owner ID').optional(),

    opportunity_value: opportunityValueSchema,

    // Initial release supports INR only.
    currency: z.literal('INR').default('INR'),

    next_action: z
      .string()
      .trim()
      .min(2, 'Enter the next action.')
      .max(
        500,
        'Next action must not exceed 500 characters.',
      ),

    next_follow_up_at: followUpDateTimeSchema,
  })
  .strict();

/*
 * GET /api/leads
 *
 * Ownership filtering is an additional filter, not permission.
 * The repository must still apply the signed-in user's scope.
 */
export const listLeadsSchema = z
  .object({
    search: optionalText(100, 'Search'),

    company_id: databaseId('Company ID').optional(),

    owner_id: databaseId('Owner ID').optional(),

    priority: z.enum(LEAD_PRIORITIES).optional(),

    status: z.enum(LEAD_STATUSES).optional(),

    stage: z.enum(LEAD_STAGES).optional(),

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