import { Schema } from 'mongoose';

export const CorrecaoRedacaoIASchema = new Schema(
  {
    texto: String,
    notaC1: { type: Number, required: true },
    notaC2: { type: Number, required: true },
    notaC3: { type: Number, required: true },
    notaC4: { type: Number, required: true },
    notaC5: { type: Number, required: true },
    feedbackGeral: { type: Number, required: true },
    feedbackC1: Number,
    feedbackC2: Number,
    feedbackC3: Number,
    feedbackC4: Number,
    feedbackC5: Number,
  },
  { timestamps: true },
)
