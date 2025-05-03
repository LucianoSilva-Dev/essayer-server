import { Schema, model } from 'mongoose';
import { RepertorioDBSchema } from './RepertorioModel';

const ArtigoSchema = RepertorioDBSchema.discriminator(
  'Artigo',
  new Schema({
    titulo: { type: String, required: true },
    resumo: { type: String, required: true },
  }),
);

export const ArtigoModel = model('Artigo', ArtigoSchema);
