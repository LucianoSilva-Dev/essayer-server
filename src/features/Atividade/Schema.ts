import type { EntitySchema } from "../../shared/Types";
import { askAIBodyValidation } from "./Validation";

export const AtividadeSchema: EntitySchema = {
    askAI: {
        schema: {
            body: askAIBodyValidation
        }
    }
}