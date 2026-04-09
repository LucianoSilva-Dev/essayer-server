/**
 * Seed script for integration setup
 *
 * Creates:
 * 1. A service user (anglo-service@incita.local) for the Anglo integration
 * 2. An API key for that service user
 * 3. An integration user mapping for a test student
 *
 * Usage:
 *   npx ts-node scripts/seed-integration.ts
 */

import 'dotenv/config';
import { apiKey } from '@better-auth/api-key';
import { PrismaPg } from '@prisma/adapter-pg';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin as adminPlugin, openAPI } from 'better-auth/plugins';
import { ac, admin, student, teacher } from '../src/core/auth/roles';
import { PrismaClient } from "../src/core/prisma/generated/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  basePath: '/auth',
  plugins: [
    openAPI({ path: '/auth/docs', disableDefaultReference: true }),
    adminPlugin({
      ac,
      roles: { admin, teacher, student },
      defaultRole: 'student',
    }),
    apiKey({
      enableSessionForAPIKeys: true,
      requireName: true,
      enableMetadata: true,
    }),
  ],
});

async function seedIntegration() {
  console.log('🌱 Starting integration seed...\n');

  try {
    // 1. Create or get the service user
    console.log('📝 Creating/checking service user...');
    let serviceUser = await prisma.user.findUnique({
      where: { email: 'anglo-service@incita.local' },
    });

    if (!serviceUser) {
      serviceUser = await prisma.user.create({
        data: {
          email: 'anglo-service@incita.local',
          name: 'Anglo Platform Service',
          emailVerified: true,
          role: 'admin',
        },
      });
      console.log(`✅ Service user created: ${serviceUser.email} (ID: ${serviceUser.id})\n`);
    } else {
      console.log(`✅ Service user already exists: ${serviceUser.email} (ID: ${serviceUser.id})\n`);
    }

    // 2. Create API key for the service user
    console.log('🔑 Creating API key...');
    try {
      const apiKeyResult = await auth.api.createApiKey({
        body: {
          name: 'anglo-platform-dev',
          userId: serviceUser.id,
          metadata: {
            integrationName: 'anglo-platform',
            createdAt: new Date().toISOString(),
          },
        },
      });

      if (apiKeyResult) {
        const key = apiKeyResult;
        console.log(`✅ API key created!`);
        console.log(`   Name: ${key.name}`);
        console.log(`   Key: ${key.key}`);
        console.log(`   Prefix: ${key.prefix}`);
        console.log(`   Expires: ${key.expiresAt || 'Never'}\n`);

        // Store the key for reference (in production, should be stored securely)
        console.log('📌 Save this key in your .env file as INCITA_API_KEY=<key>\n');
      }
    } catch (error) {
      console.error('⚠️  Error creating API key (may already exist):', error);
      console.log('   Continuing with seed...\n');
    }

    // 3. Create a test integration user mapping
    console.log('👤 Creating test integration user mapping...');

    // First, check if test user exists
    let testUser = await prisma.user.findUnique({
      where: { email: 'student-test@anglo.local' },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'student-test@anglo.local',
          name: 'Test Student from Anglo',
          emailVerified: true,
          role: 'student',
        },
      });
      console.log(`✅ Test user created: ${testUser.email} (ID: ${testUser.id})`);
    } else {
      console.log(`✅ Test user already exists: ${testUser.email} (ID: ${testUser.id})`);
    }

    // Check if integration mapping already exists
    const existingMapping = await prisma.integrationUser.findUnique({
      where: {
        integrationName_externalUserId: {
          integrationName: 'anglo-platform',
          externalUserId: 'student-001',
        },
      },
    });

    if (!existingMapping) {
      await prisma.integrationUser.create({
        data: {
          integrationName: 'anglo-platform',
          userId: testUser.id,
          externalUserId: 'student-001',
          externalRole: 'student',
        },
      });
      console.log(`✅ Integration mapping created`);
      console.log(`   Integration: anglo-platform`);
      console.log(`   External ID: student-001`);
      console.log(`   Mapped to: ${testUser.email}\n`);
    } else {
      console.log(`✅ Integration mapping already exists\n`);
    }

    // 4. Display test request example
    console.log('📋 Test request example:\n');
    console.log('```bash');
    console.log("curl -X GET http://localhost:3000/repertoire \\");
    console.log("  -H 'x-api-key: <your-api-key>' \\");
    console.log("  -H 'x-integration-name: anglo-platform' \\");
    console.log("  -H 'x-integration-user-id: student-001' \\");
    console.log("  -H 'x-integration-user-role: student'");
    console.log('```\n');

    console.log('✨ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedIntegration();
