import type { z } from 'zod'
import type { createUsuarioBodyValidation, professorCreateBodyValidation, updateSenhaBodyValidation, updateUsuarioBodyValidation } from './Validation';

export type CreateUsuarioBody = z.infer<typeof createUsuarioBodyValidation>;
export type UpdateUsuarioBody = z.infer<typeof updateUsuarioBodyValidation>;
export type ProfessorCreateBody = z.infer<typeof professorCreateBodyValidation>;
export type UpdateSenhaBody = z.infer<typeof updateSenhaBodyValidation>