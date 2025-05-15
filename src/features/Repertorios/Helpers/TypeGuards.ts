import type { HydratedDocument } from "mongoose";
import type { Repertorio } from "../Types";

export function isRepertorioDocument<T extends Repertorio>(
  repertorio: any,
  tipo: 'Obra' | 'Artigo' | 'Citacao',
): repertorio is HydratedDocument<T> {
  return repertorio ? repertorio.tipoRepertorio === tipo : false;
}