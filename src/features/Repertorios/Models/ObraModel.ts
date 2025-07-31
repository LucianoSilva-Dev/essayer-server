import { Schema } from 'mongoose';
import { RepertorioModel } from './RepertorioModel';
import type { Obra } from '../Types';

export const ObraModel = RepertorioModel.discriminator<Obra>(
  'Obra',
  new Schema({
    titulo: { type: String, required: true },
    sinopse: { type: String, required: true },
    tipoObra: { type: String, required: true },
  }),
);
