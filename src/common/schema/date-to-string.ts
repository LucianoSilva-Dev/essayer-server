import z from 'zod';

export const dateToIsoString = z
  .union([z.date(), z.string()])
  .transform((date) => (typeof date === 'string' ? date : date.toISOString()))
  .pipe(z.string())
  .meta({ format: 'date-time' });
