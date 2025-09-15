import { z } from "zod";

export const correcaoRedacaoResponse = z.object({
    notaC1: z.number().int(),
    notaC2: z.number().int(),
    notaC3: z.number().int(),
    notaC4: z.number().int(),
    notaC5: z.number().int(),
    feedbackC1: z.string().optional().default(''),
    feedbackC2: z.string().optional().default(''),
    feedbackC3: z.string().optional().default(''),
    feedbackC4: z.string().optional().default(''),
    feedbackC5: z.string().optional().default(''),
})