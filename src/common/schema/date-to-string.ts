import z from 'zod';

export const dateToIsoString = z
  .date()
  .transform((date) => date.toISOString())
  .pipe(z.string())
  .meta({ format: 'date-time' });
