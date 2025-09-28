import type { z } from "zod";
import type { createRedacaoLivreBodyValidation, getCorrecaoRedacaoResponse, updateRedacaoLivreBodyValidation } from "./Validations";

export enum CorrecaoRedacaoEvents {
    RedacaoCorrigida = "RedacaoCorrigida",
    RedacaoDevagaar = "RedacaoAtrasada",
    RedacaoRapida = "RedacaoRapida"
}

export type CreateRedacaoLivreBody = z.infer<typeof createRedacaoLivreBodyValidation>
export type UpdateRedacaoLivreBody = z.infer<typeof updateRedacaoLivreBodyValidation>

//IA
export type GetCorrecaoRedacaoResponse = z.infer<typeof getCorrecaoRedacaoResponse>