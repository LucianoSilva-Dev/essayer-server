import { PrismaPg } from '@prisma/adapter-pg';
import z from 'zod';
import { auth } from '@core/auth/auth';
import { PrismaClient } from '@core/prisma/generated/client';
import { password } from './validations';

const validateAdmin = z.object({
  ADMIN_NAME: z.string(),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: password,
});

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function setupAdmin() {
  console.log('Admin setup initiated.');
  try {
    const {
      ADMIN_EMAIL: email,
      ADMIN_NAME: name,
      ADMIN_PASSWORD: password,
    } = validateAdmin.parse(process.env);

    const { user } = await auth.api.createUser({
      body: { email, name, password, role: 'admin' },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
    console.log(`Admin setup completed succesfully.`);
  } catch (e) {
    console.error(`Error in setup-admin.ts:\n\n${e}`);
    process.exit(1);
  }
}
