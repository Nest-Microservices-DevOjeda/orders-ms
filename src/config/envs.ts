import 'dotenv/config';
import * as z from 'zod';

const envsSchema = z.object({
  PORT: z
    .string()
    .nonempty('PORT is required')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !Number.isNaN(val), {
      message: 'PORT must be a valid number',
    })
    .refine((val) => val > 0 && val < 65536, {
      message: 'PORT must be between 1 and 65535',
    }),
  NATS_SERVERS: z
    .string()
    .nonempty('NATS_SERVERS is required')
    .transform((val) => val.split(',')),
  DATABASE_URL: z.string().nonempty('DATABASE_URL is required'),
});

export const envs = envsSchema.parse(process.env);
