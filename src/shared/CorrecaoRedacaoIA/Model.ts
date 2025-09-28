import { Schema } from 'mongoose';
import { EnumCorrecaoRedacaoStatus, type CorrecaoRedacaoIA } from './Types';

export const CorrecaoRedacaoIASchema = new Schema<CorrecaoRedacaoIA>(
  {
    texto: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: EnumCorrecaoRedacaoStatus,
    },
    notaC1: Number,
    notaC2: Number,
    notaC3: Number,
    notaC4: Number,
    notaC5: Number,
    feedbackC1: String,
    feedbackC2: String,
    feedbackC3: String,
    feedbackC4: String,
    feedbackC5: String,
  },
  { timestamps: true },
);
