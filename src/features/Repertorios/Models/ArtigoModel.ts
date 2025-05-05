import { Schema, model } from 'mongoose';
import { RepertorioModel } from './RepertorioModel';
import type { Artigo } from '../Types';

export const ArtigoModel = RepertorioModel.discriminator<Artigo>(
  'Artigo',
  new Schema({
    titulo: { type: String, required: true },
    resumo: { type: String, required: true },
    fonte: { type: String, required: true },
  }),
);
