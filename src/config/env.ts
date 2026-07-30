import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  CRON_SCHEDULE: z.string().default('0 10 * * *'),
  HEADLESS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((val) => val === 'true'),
  API_NINJAS_KEY: z.string().optional(),
  NASA_API_KEY: z.string().default('DEMO_KEY'),
  OPENALEX_EMAIL: z.string().email().optional(),
});

/**
 * Validated central environment configuration.
 */
export const env = envSchema.parse(process.env);
