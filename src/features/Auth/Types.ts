import type z from 'zod';
import type { getTokenAuthBodyValidation, postRegisterAuthBodyValidation } from './Validations';

export type getTokenAuthBody = z.infer<typeof getTokenAuthBodyValidation>;
export type registerAuthBody = z.infer<typeof postRegisterAuthBodyValidation>;
