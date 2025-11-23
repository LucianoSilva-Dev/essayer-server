import type { z } from "zod";
import type { corrigirRedacaoBodyValidation, createRedacaoLivreBodyValidation, getAllRedacaoLivreQueryBody, getCorrecaoRedacaoResponse, updateRedacaoLivreBodyValidation } from "./Validations";

export enum CorrecaoRedacaoEvents {
    RedacaoCorrigida = "RedacaoCorrigida",
    RedacaoDevagaar = "RedacaoAtrasada",
    RedacaoRapida = "RedacaoRapida"
}

export type CreateRedacaoLivreBody = z.infer<typeof createRedacaoLivreBodyValidation>
export type UpdateRedacaoLivreBody = z.infer<typeof updateRedacaoLivreBodyValidation>
export type GetAllRedacaoLivreQueryBody = z.infer<typeof getAllRedacaoLivreQueryBody>

//IA
export type CorrigirRedacaoBody = z.infer<typeof corrigirRedacaoBodyValidation>
export type GetCorrecaoRedacaoResponse = z.infer<typeof getCorrecaoRedacaoResponse>
