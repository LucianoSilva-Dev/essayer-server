import type z from 'zod';
import type { createBackgroundBodyValidation } from './Validations';
import type { getBackgroundResponse } from './Schemas';

export type createBackgroundBody = z.infer<typeof createBackgroundBodyValidation>;
export type getBackgroundResponseType = z.infer<typeof getBackgroundResponse>;