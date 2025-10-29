import type z from 'zod';
import type { userLoginBodyValidation, userLoginResponseValidation } from './Validations';

export type userLoginBody = z.infer<typeof userLoginBodyValidation>;
export type UserLoginResponse = z.infer<typeof userLoginResponseValidation>
