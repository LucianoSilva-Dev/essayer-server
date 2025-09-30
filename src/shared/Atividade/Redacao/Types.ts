import type { Types } from 'mongoose';
import type { z } from 'zod';
import type { Atividade } from '../Types';
import type { createRedacaoBodyValidation, enviarRedacaoBodyValidation, feedbackRedacaoBodyValidation, getAllRespostasRedacaoQueryValidation, updateRedacaoBodyValidation } from './Validations';
import type { tiposAtividade } from '../Validations';

export type RedacaoAtividade = Atividade & {
  tema: string;
  tempoLimiteEmMinutos?: number;
  repertoriosApoio: Types.ObjectId[];
};

export type TiposAtividade = z.infer<typeof tiposAtividade>

export type CreateRedacaoBody = z.infer<typeof createRedacaoBodyValidation>;
export type UpdateRedacaoBody = z.infer<typeof updateRedacaoBodyValidation>
export type EnviarRedacaoBody = z.infer<typeof enviarRedacaoBodyValidation>
export type FeedbackRedacaoBody = z.infer<typeof feedbackRedacaoBodyValidation>
export type getAllRespostasRedacaoQueryBody = z.infer<typeof getAllRespostasRedacaoQueryValidation>




