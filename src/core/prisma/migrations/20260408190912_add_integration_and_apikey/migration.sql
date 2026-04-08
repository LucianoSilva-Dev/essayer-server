-- CreateTable
CREATE TABLE "integration_user" (
    "id" TEXT NOT NULL,
    "integrationName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "externalUserId" TEXT NOT NULL,
    "externalRole" TEXT NOT NULL DEFAULT 'student',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integration_user_userId_idx" ON "integration_user"("userId");

-- CreateIndex
CREATE INDEX "integration_user_externalUserId_idx" ON "integration_user"("externalUserId");

-- CreateIndex
CREATE UNIQUE INDEX "integration_user_integrationName_externalUserId_key" ON "integration_user"("integrationName", "externalUserId");

-- AddForeignKey
ALTER TABLE "integration_user" ADD CONSTRAINT "integration_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
