import { Schema } from 'mongoose';
import type { CorrecaoRedacaoIA } from './Types';

export const CorrecaoRedacaoIASchema = new Schema<CorrecaoRedacaoIA>(
  {
    texto: String,
    notaC1: { type: Number, required: true },
    notaC2: { type: Number, required: true },
    notaC3: { type: Number, required: true },
    notaC4: { type: Number, required: true },
    notaC5: { type: Number, required: true },
    feedbackC1: String,
    feedbackC2: String,
    feedbackC3: String,
    feedbackC4: String,
    feedbackC5: String,
  },
  { timestamps: true },
)
