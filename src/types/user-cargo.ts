import type { userCargo } from '@/shared/Validations';
import type { z } from 'zod';

export type UserCargo = z.infer<typeof userCargo>;
