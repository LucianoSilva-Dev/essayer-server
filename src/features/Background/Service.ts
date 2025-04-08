import { BackgroundModel } from './Model';
import type { createBackgroundBody } from './Types';

export const BackgroundService = {
  get_all: async () => {
    const backgrounds = await BackgroundModel.find()
      .select('_id content author creator')
      .populate('creator', 'name');

    const formatedBackgrounds = backgrounds.map((background) => {
      const { _id, content, author, creator } = background;
      return { id: _id.toString(), content, author, creator };
    });

    return formatedBackgrounds;
  },

  get: async (backgroundId: string) => {
    const background = await BackgroundModel.findById(backgroundId)
      .select('_id content author creator')
      .populate('creator', 'name');

    if (!background) {
      return {
        success: false,
        statusCode: 404,
        error: 'Repertório não encontrado.',
      };
    }
    const { _id, content, author, creator } = background;
    return { success: true, background: { id: _id.toString(), content, author, creator } };
  },

  create: async (backgroundBody: createBackgroundBody) => {
    const background = new BackgroundModel(backgroundBody);
    await background.save();
    return { message: 'Repertório criado com sucesso.' };
  },
};
