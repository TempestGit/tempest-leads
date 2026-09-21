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

export const contactIdSchema = databaseId('Contact ID');

const companyIdSchema = databaseId('Company ID');

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

function optionalPhone(label) {
  return optionalText(30, label).refine(
    (value) => {
      if (!value) {
        return true;
      }

      const allowedCharacters = /^[+\d\s().-]+$/;
      const digitCount = value.replace(/\D/g, '').length;

      return allowedCharacters.test(value) && digitCount >= 6;
    },
    `Enter a valid ${label.toLowerCase()}.`,
  );
}

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(190, 'Email must not exceed 190 characters.')
  .refine(
    (value) => value === '' || z.email().safeParse(value).success,
    'Enter a valid email address.',
  )
  .optional()
  .default('');

const optionalLinkedIn = optionalText(
  500,
  'LinkedIn URL',
).refine(
  (value) => {
    if (!value) {
      return true;
    }

    try {
      const url = new URL(value);
      const hostname = url.hostname.toLowerCase();

      const isLinkedIn =
        hostname === 'linkedin.com' ||
        hostname.endsWith('.linkedin.com');

      return (
        url.protocol === 'https:' &&
        isLinkedIn &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  },
  'Enter a valid HTTPS LinkedIn URL.',
);

/*
 * Fields shared by contact creation and editing.
 *
 * Ownership, company assignment, and communication status
 * are handled separately from ordinary profile edits.
 */
const contactFields = {
  name: z
    .string()
    .trim()
    .min(2, 'Contact name must contain at least 2 characters.')
    .max(150, 'Contact name must not exceed 150 characters.'),

  designation: optionalText(150, 'Designation'),

  department: optionalText(100, 'Department'),

  phone: optionalPhone('Phone number'),

  whatsapp: optionalPhone('WhatsApp number'),

  email: optionalEmail,

  linkedin: optionalLinkedIn,

  decision_maker: z.boolean().optional().default(false),

  notes: optionalText(5000, 'Notes'),
};

/*
 * POST /api/contacts
 */
export const createContactSchema = z
  .object({
    company_id: companyIdSchema,
    ...contactFields,
  })
  .strict();

/*
 * PUT /api/contacts/:id
 *
 * The client sends the version loaded with the contact.
 * The repository will compare it with the database version
 * inside the update transaction.
 *
 * This is a full profile update, not a partial PATCH.
 */
export const updateContactSchema = z
  .object({
    ...contactFields,

    version: z
      .number()
      .int('Contact version must be an integer.')
      .min(1, 'Contact version is invalid.')
      .max(4294967294, 'Contact version is invalid.'),
  })
  .strict();

/*
 * GET /api/contacts
 */
export const listContactsSchema = z
  .object({
    company_id: companyIdSchema.optional(),

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
      .optional()
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .default(10),
  })
  .strict();