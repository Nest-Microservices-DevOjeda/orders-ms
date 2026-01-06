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
  PRODUCTS_SERVICE_HOST: z
    .string()
    .nonempty('PRODUCTS_SERVICE_HOST is required'),
  PRODUCTS_SERVICE_PORT: z
    .string()
    .nonempty('PRODUCTS_SERVICE_PORT is required')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !Number.isNaN(val), {
      message: 'PRODUCTS_SERVICE_PORT must be a valid number',
    })
    .refine((val) => val > 0 && val < 65536, {
      message: 'PRODUCTS_SERVICE_PORT must be between 1 and 65535',
    }),
  DATABASE_URL: z.string().nonempty('DATABASE_URL is required'),
});

export const envs = envsSchema.parse(process.env);
