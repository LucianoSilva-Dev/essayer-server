import type { z } from 'zod';
import { validateRequisicaoUsuarioBodyValidation } from './Validation';

export type ValidateRequisicaoUsuarioBody = z.infer<typeof validateRequisicaoUsuarioBodyValidation>