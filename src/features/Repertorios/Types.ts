import type {
  createArtigoBodyValidation,
  getArtigoResponse,
  updateArtigoBodyValidation,
} from './Validations/ArtigoValidation';
import type {
  getCitacaoResponse,
  createCitacaoBodyValidation,
  updateCitacaoBodyValidation,
} from './Validations/CitacaoValidation';
import type { perfilUsuarioResponse } from './Validations/Commom';
import type z from 'zod';
import type { createObraBodyValidation, getObraResponse, updateObraBodyValidation } from './Validations/ObraValidation';

// Citacao
export type CitacaoResponse = z.infer<typeof getCitacaoResponse>;
export type CreateCitacaoBody = z.infer<typeof createCitacaoBodyValidation>;
export type UpdateCitacaoBody = z.infer<typeof updateCitacaoBodyValidation>;

// Artigo
export type ArtigoResponse = z.infer<typeof getArtigoResponse>;
export type CreateArtigoBody = z.infer<typeof createArtigoBodyValidation>;
export type UpdateArtigoBody = z.infer<typeof updateArtigoBodyValidation>;

// Obra
export type ObraResponse = z.infer<typeof getObraResponse>;
export type CreateObraBody = z.infer<typeof createObraBodyValidation>;
export type UpdateObraBody = z.infer<typeof updateObraBodyValidation>;

// Geral
export type PerfilUsuario = z.infer<typeof perfilUsuarioResponse>;
