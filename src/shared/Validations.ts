import z from 'zod';
import mongoose from 'mongoose';

export const idValidation = z.object({
  id: z
    .string({ message: 'o campo id precisa ser uma string' })
    .refine((id) => mongoose.Types.ObjectId.isValid(id), 'id inválido'),
});
