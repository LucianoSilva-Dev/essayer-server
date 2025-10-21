import type z from 'zod';
import type { userLoginBodyValidation } from './Validations';

export type userLoginBody = z.infer<typeof userLoginBodyValidation>;
