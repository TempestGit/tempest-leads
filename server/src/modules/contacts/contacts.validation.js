import { z } from 'zod';
import { companyIdSchema } from '../companies/companies.validation.js';

const optionalText = (max) =>
  z.string().trim().max(max).optional().default('');

const phoneSchema = optionalText(30).refine(
  (value) =>
    value === '' ||
    (/^\+?[\d\s().-]+$/.test(value) &&
      value.replace(/\D/g, '').length >= 6),
  'Enter a valid phone number.',
);

const emailSchema = z
  .union([
    z.literal(''),
    z.string().trim().toLowerCase().email().max(190),
  ])
  .optional()
  .default('');

const linkedinSchema = optionalText(500).refine((value) => {
  if (!value) return true;

  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      (url.hostname === 'linkedin.com' ||
        url.hostname.endsWith('.linkedin.com'))
    );
  } catch {
    return false;
  }
}, 'Enter a valid HTTPS LinkedIn URL.');

export const createContactSchema = z
  .object({
    company_id: companyIdSchema,
    name: z.string().trim().min(2).max(150),
    designation: optionalText(150),
    department: optionalText(100),
    phone: phoneSchema,
    whatsapp: phoneSchema,
    email: emailSchema,
    linkedin: linkedinSchema,
    decision_maker: z.boolean().default(false),
    notes: optionalText(5000),
  })
  .strict();

export const listContactsSchema = z.object({
  company_id: companyIdSchema.optional(),
  search: z.string().trim().max(100).optional().default(''),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});