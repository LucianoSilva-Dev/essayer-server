import { Schema, model, type Document } from 'mongoose';
import { RepertorioDBSchema } from './RepertorioModel';

const CitacaoSchema = RepertorioDBSchema.discriminator(
  'Citacao',
  new Schema({
    frase: { type: String, required: true },
    fonte: String,
  }),
);

export const CitacaoModel = model('Citacao', CitacaoSchema);
