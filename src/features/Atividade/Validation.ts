import { z } from "zod";

export const askAIBodyValidation = z.object({
    text: z.string()
})