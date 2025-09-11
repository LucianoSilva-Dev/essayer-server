import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '../Env';

export const googleGenAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
