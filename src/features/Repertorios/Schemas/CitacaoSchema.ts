import type { EntitySchema } from '../../../shared/Types';

export const CitacaoSchema: EntitySchema = {
  create: {
    // placeholder para criação de citação
    schema: {
      summary: 'Cria nova citação',
    },
  },
  update: {
    // placeholder para atualização de citação (somente fonte, frase e subtopicos)
    schema: {
      summary: 'Atualiza citação existente',
    },
  },
};
