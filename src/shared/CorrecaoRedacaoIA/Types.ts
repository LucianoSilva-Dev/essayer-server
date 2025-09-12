import type z from 'zod';
import type { correcaoRedacaoResponse } from "./Validations"

export type CorrecaoRedacaoIA = {
    texto: string
    notaC1: number
    notaC2: number
    notaC3: number
    notaC4: number
    notaC5: number
    feedbackC1: string
    feedbackC2: string
    feedbackC3: string
    feedbackC4: string
    feedbackC5: string
    createdAt: Date
    updatedAt: Date
}

export type CorrecaoRedacaoIAResponse = z.infer<typeof correcaoRedacaoResponse>
