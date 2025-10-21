import type { z } from 'zod';
import { updateStatusBodyValidation } from './Validation';

export type UpdateStatusBody = z.infer<typeof updateStatusBodyValidation>;