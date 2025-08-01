import z from 'zod';
import { isValidObjectId } from 'mongoose';

export const idValidation = z.object({
  id: z
    .string({
      required_error: 'O campo id é obrigatório.',
      invalid_type_error: 'O campo id deve ser um texto.',
    })
    .refine((id) => isValidObjectId(id), 'Id inválido.'),
});

export const genericSuccessResponse = z.object({
  message: z.string(),
});

export const userCargo = z.enum(['admin', 'aluno', 'professor']);
