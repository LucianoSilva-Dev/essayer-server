import type { getCitacaoResponse, createCitacaoBodyValidation, updateCitacaoBodyValidation } from "./Validations/CitacaoValidation";
import type { perfilUsuarioResponse } from "./Validations/Commom";
import type z from "zod";

export type CitacaoResponse = z.infer<typeof getCitacaoResponse>;
export type CreateCitacaoBody = z.infer<typeof createCitacaoBodyValidation>;
export type UpdateCitacaoBody = z.infer<typeof updateCitacaoBodyValidation>;
export type PerfilUsuario = z.infer<typeof perfilUsuarioResponse>;