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
});

export const envs = envsSchema.parse(process.env);
