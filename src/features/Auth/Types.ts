import type z from 'zod';
import type { userLoginBodyValidation, userRegisterBodyValidation } from './Validations';

export type userLoginBody = z.infer<typeof userLoginBodyValidation>;
export type userRegisterBody = z.infer<typeof userRegisterBodyValidation>;
