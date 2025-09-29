import type { GeminiModels } from "../AI/Types";

export type AppJobMap = {
  'redacao:corrigir': {
    redacaoLivreId: string
    usuario: string
    tema: string
    texto: string
    _lastUsedModel?: GeminiModels['PRO'] | GeminiModels['FLASH']
  };
};

export type AppJobMapValues = AppJobMap[keyof AppJobMap]
export type AppJobMapKeys = keyof AppJobMap