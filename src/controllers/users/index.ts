import { getUserController } from './get-user.controller';
import { createUserController } from './create-user.controller';
import { professorCreateController } from './professor-create.controller';
import { updateUserController } from './update-user.controller';
import { updateSenhaController } from './update-senha.controller';
import { deleteUserController } from './delete-user.controller';
import { fotoGetController } from './foto-get.controller';
import { fotoCreateController } from './foto-create.controller';
import { fotoDeleteController } from './foto-delete.controller';
import { fotoUpdateController } from './foto-update.controller';

export default {
  createUserController,
  deleteUserController,
  fotoCreateController,
  fotoGetController,
  fotoDeleteController,
  fotoUpdateController,
  getUserController,
  professorCreateController,
  updateSenhaController,
  updateUserController,
} as const;
