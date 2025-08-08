import type { UserCargo } from './user-cargo';

export type RequestUserData = {
  id: string;
  cargo: UserCargo;
  nome: string;
  iat: number;
};
