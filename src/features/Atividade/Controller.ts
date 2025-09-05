import { AIProvider } from '../../shared/AI/Provider';
import type { Controller } from '../../shared/Types';
import type { askAIBody } from './Types';

export const AtividadeController: Controller = {
  askAI: async (request, reply) => {
    const { text } = request.body as askAIBody;
    try {
        const response = await AIProvider.generateContent({ contents: text });
        reply.status(200).send(response.text)
    } catch (e) {
        reply.status(500).send('Internal Server Error')
        console.log(e)
    }
  },
};
