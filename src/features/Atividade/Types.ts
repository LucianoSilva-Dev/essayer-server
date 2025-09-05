import type { z } from "zod";
import type { askAIBodyValidation } from "./Validation";

export type askAIBody = z.infer<typeof askAIBodyValidation>