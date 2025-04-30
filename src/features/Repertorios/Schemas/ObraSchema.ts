import type { EntitySchema } from '../../../shared/Types';

export const ObraSchema: EntitySchema = {
  create: {
    // placeholder para criação de obra
    schema: {
      summary: 'Cria nova obra',
    },
  },
  update: {
    // placeholder para atualização de obra (somente titulo, fonte, resumo, tipo e subtopicos)
    schema: {
      summary: 'Atualiza dados da obra',
    },
  },
};
