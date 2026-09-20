import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(190),

  password: z
    .string()
    .min(1)
    .refine(
      (value) => Array.from(value).length <= 128,
      'Password is too long.',
    ),

  rememberMe: z.boolean().optional().default(false),
});