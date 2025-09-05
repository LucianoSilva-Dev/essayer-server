import type { Types } from 'mongoose';
import type { z } from 'zod';
import type { Atividade } from '../Types';
import type { createRedacaoBodyValidation, enviarRedacaoBodyValidation, feedbackRedacaoBodyValidation, updateRedacaoBodyValidation } from './Validations';

export type RedacaoAtividade = Atividade & {
  tema: string;
  tempoLimiteEmMinutos?: number;
  repertoriosApoio: Types.ObjectId[];
};

export type CreateRedacaoBody = z.infer<typeof createRedacaoBodyValidation>;
export type UpdateRedacaoBody = z.infer<typeof updateRedacaoBodyValidation>
export type EnviarRedacaoBody = z.infer<typeof enviarRedacaoBodyValidation>
export type FeedbackRedacaoBody = z.infer<typeof feedbackRedacaoBodyValidation>