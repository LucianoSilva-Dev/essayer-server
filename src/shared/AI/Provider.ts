import {
  type GenerateContentParameters,
  type GenerateContentResponse,
  GoogleGenAI,
} from '@google/genai';
import { GEMINI_API_KEY } from '../Env';
import { redisClient } from '../Redis/Provider';

// ordenados de forma decrescente pela capacidade de requests
const models = ['gemini-2.5-flash', 'gemini-2.5-pro'];
const maxRequestsPerDayPerModel = [250, 100];
let currentModelIndex = 0;

const googleGenAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const AIProvider = {
  async generateContent(
    params: Omit<GenerateContentParameters, 'model'>,
  ): Promise<GenerateContentResponse | never> {
    const requestsOnCurrentModel = Number.parseInt(
      (await redisClient.get(`${models[currentModelIndex]}:requests`)) ?? '0',
    );

    if (
      requestsOnCurrentModel >= maxRequestsPerDayPerModel[currentModelIndex]
    ) {
      currentModelIndex = 1;
    }

    const response = await googleGenAI.models.generateContent({
      ...params,
      model: models[currentModelIndex],
    });

    await redisClient.incr(`${models[currentModelIndex]}:requests`)

    return response
  },
};
