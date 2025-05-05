import { Schema } from 'mongoose';
import { RepertorioModel } from './RepertorioModel';
import type { Citacao } from '../Types';

export const CitacaoModel = RepertorioModel.discriminator<Citacao>(
  'Citacao',
  new Schema({
    frase: { type: String, required: true },
    fonte: String,
  }),
);
