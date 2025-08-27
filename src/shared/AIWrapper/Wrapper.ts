import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '../Env';

export interface AIWrapper {
  generateText(
    userInstruction: string,
    systemInstruction?: string,
  ): Promise<string> | never;
  generateJSON<T>(
    userInstruction: string,
    systemInstruction?: string,
  ): Promise<T> | never;
}

class GeminiAIWrapper implements AIWrapper {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  generateText(
    userInstruction: string,
    systemInstruction?: string,
  ): Promise<string> | never {
    return new Promise((resolve) => {
      (async () => {
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: userInstruction,
          config: { systemInstruction },
        });

        if (!response.text) {
          throw new Error('O modelo não retornou uma resposta');
        }

        resolve(response.text)
      })();
    });
  }

  generateJSON<T>(
    userInstruction: string,
    systemInstruction?: string,
  ): Promise<T> | never {
    return new Promise((resolve) => {
        (async () => {
          const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: userInstruction,
            config: { systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    
                }
             },
          });
          


          if (!response.text) {
            throw new Error('O modelo não retornou uma resposta');
          }

          resolve(response.text)
        })();
      });
  }
}
