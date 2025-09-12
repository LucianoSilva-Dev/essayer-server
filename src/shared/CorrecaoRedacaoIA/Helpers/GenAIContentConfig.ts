import { type GenerateContentParameters, Type } from '@google/genai';
import type { GeminiModels } from '../../AI/Types';
import { formatRedacaoPrompt } from './FormatRedacaoPrompt';
import { correcaoRedacaoSystemInstructions } from '../Prompts';

export function generateAIContentConfig(
  model: GeminiModels['FLASH'] | GeminiModels['PRO'],
  tema: string,
  redacao: string,
) {
  const config: GenerateContentParameters = {
    model: model.name,
    contents: formatRedacaoPrompt(tema, redacao),
    config: {
      systemInstruction: correcaoRedacaoSystemInstructions,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          notaC1: { type: Type.INTEGER },
          notaC2: { type: Type.INTEGER },
          notaC3: { type: Type.INTEGER },
          notaC4: { type: Type.INTEGER },
          notaC5: { type: Type.INTEGER },
          feedbackC1: { type: Type.STRING },
          feedbackC2: { type: Type.STRING },
          feedbackC3: { type: Type.STRING },
          feedbackC4: { type: Type.STRING },
          feedbackC5: { type: Type.STRING },
        },
        propertyOrdering: [
          'notaC1',
          'notaC2',
          'notaC3',
          'notaC4',
          'notaC5',
          'feedbackC1',
          'feedbackC2',
          'feedbackC3',
          'feedbackC4',
          'feedbackC5',
        ],
      },
    },
  };

  return config
}
