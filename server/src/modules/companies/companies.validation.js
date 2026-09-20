import { z } from 'zod';

const optionalText = (max) =>
  z.string().trim().max(max).optional().default('');

const websiteSchema = optionalText(500).refine((value) => {
  if (!value) return true;

  try {
    const url = new URL(value);

    return (
      ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}, 'Enter a full website URL, such as https://example.com.');

export const createCompanySchema = z
  .object({
    name: z.string().trim().min(2).max(190),
    industry: z.string().trim().min(2).max(100),
    sub_industry: optionalText(100),
    city: optionalText(100),
    geography: optionalText(150),
    website: websiteSchema,
    existing_agency: optionalText(190),
    marketing_activity: optionalText(5000),
    potential_requirement: optionalText(5000),
    lead_source: optionalText(100),
    reconnect_date: z
      .union([z.literal(''), z.iso.date()])
      .optional()
      .default(''),
  })
  .strict();

export const listCompaniesSchema = z.object({
  search: z.string().trim().max(100).optional().default(''),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const companyIdSchema = z
  .string()
  .regex(/^[1-9]\d{0,19}$/, 'Invalid company ID.')
  .refine(
    (value) => BigInt(value) <= 18446744073709551615n,
    'Invalid company ID.',
  );

export const updateCompanySchema = createCompanySchema.extend({
  version: z.number().int().min(1).max(4294967294),
});