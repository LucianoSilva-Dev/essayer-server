import type { Types } from "mongoose";
import type { GeminiModels } from "../AI/Types";


/**
 * @_model Não setar este atributo manualmente, ele é usado para controle do retry dos jobs
 */
export type AppJobMap = {
  'redacao:corrigir': {
    redacaoLivreId: string
    usuario: string
    tema: string
    texto: string
    _model?: GeminiModels['PRO'] | GeminiModels['FLASH']
  };
};