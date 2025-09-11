import { AIConfig } from "../../config/ai";

export const geminiModelsData = {
  PRO: {
    name: 'gemini-2.5-pro',
    RPD: AIConfig.geminiPROReqLimit,
  },
  FLASH: {
    name: 'gemini-2.5-flash',
    RPD: AIConfig.geminiFLASHReqLimit,
  },
} as const;
