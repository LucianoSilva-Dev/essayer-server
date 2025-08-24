import type { Types } from "mongoose";
import type { Atividade } from "../Types";

export type RedacaoAtividade = Atividade & {
    tema: string;
    tempoLimiteEmMinutos?: number;
    repertoriosApoio: Types.ObjectId[];
  };