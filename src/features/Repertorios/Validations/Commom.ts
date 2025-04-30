import z from 'zod';

export const comentarioResponse = z.object({
  usuario: z.object({
    id: z.string(),
    nome: z.string(),
    fotoPerfil: z.string(),
  }),
  texto: z.string()
});

export const perfilUsuarioResponse = z.object({
  id: z.string(),
  nome: z.string(),
  fotoPerfil: z.string(),
});
