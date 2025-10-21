import type { z } from 'zod';
import { createRequisicaoMudancaSenhaBodyValidation, validateRequisicaoMudancaSenhaBodyValidation } from './Validation';

export type ValidateRequisicaoMudancaSenhaBody = z.infer<
    typeof validateRequisicaoMudancaSenhaBodyValidation
>;

export type CreateRequisicaoMudancaSenhaBody = z.infer<typeof createRequisicaoMudancaSenhaBodyValidation>
