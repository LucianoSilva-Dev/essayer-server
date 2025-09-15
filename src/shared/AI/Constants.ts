import { AIConfig } from "../../config/ai";

export const geminiModelsData = {
  PRO: {
    name: 'gemini-2.5-pro',
    RPD: AIConfig.geminiPRORPD,
    RPM: AIConfig.geminiPRORPM,
    unavailableTimeoutSeconds: AIConfig.geminiPROUnavailableTimeoutSecs
  },
  FLASH: {
    name: 'gemini-2.5-flash',
    RPD: AIConfig.geminiFLASHRPD,
    RPM: AIConfig.geminiFLASHRPM,
    unavailableTimeoutSeconds: AIConfig.geminiFLASHUnavailableTimeoutSecs
  },
} as const;
