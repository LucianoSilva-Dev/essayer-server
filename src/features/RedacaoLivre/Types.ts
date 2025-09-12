import type { z } from "zod";
import type { createRedacaoLivreBodyValidation, updateRedacaoLivreBodyValidation } from "./Validations";

export enum CorrecaoRedacaoEvents {
    RedacaoCorrigida = "RedacaoCorrigida",
    RedacaoDevagaar = "RedacaoAtrasada",
    RedacaoRapida = "RedacaoRapida"
}

export type CreateRedacaoLivreBody = z.infer<typeof createRedacaoLivreBodyValidation>
export type UpdateRedacaoLivreBody = z.infer<typeof updateRedacaoLivreBodyValidation>