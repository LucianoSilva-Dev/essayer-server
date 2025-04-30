import type { EntitySchema } from '../../../shared/Types';

export const ArtigoSchema: EntitySchema = {
  create: {
    // placeholder para criação de artigo
    schema: {
      summary: 'Cria novo artigo',
    },
  },
  update: {
    // placeholder para atualização de artigo (somente titulo, fonte, resumo e subtopicos)
    schema: {
      summary: 'Atualiza dados do artigo',
    },
  },
};
