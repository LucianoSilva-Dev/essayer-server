import type { z } from 'zod';
import { createRequisicaoEmailBodyValidation, validateRequisicaoEmailBodyValidation } from './Validation';

export type CreateRequisicaoEmailBody = z.infer<typeof createRequisicaoEmailBodyValidation>
export type ValidateRequisicaoEmailBody = z.infer<typeof validateRequisicaoEmailBodyValidation>