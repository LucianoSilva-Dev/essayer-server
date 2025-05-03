import { Schema, model } from 'mongoose';
import { RepertorioDBSchema } from './RepertorioModel';

const ObraSchema = RepertorioDBSchema.discriminator(
  'Obra',
  new Schema({
    titulo: { type: String, required: true },
    sinopse: { type: String, required: true },
    tipoObra: { type: String, required: true },
  }),
);

export const ObraModel = model('Obra', ObraSchema);
