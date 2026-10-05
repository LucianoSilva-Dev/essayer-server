-- CreateTable
CREATE TABLE "access_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "access_log_userId_idx" ON "access_log"("userId");

-- CreateIndex
CREATE INDEX "access_log_createdAt_idx" ON "access_log"("createdAt");

-- CreateIndex
CREATE INDEX "access_log_expiresAt_idx" ON "access_log"("expiresAt");

-- AddForeignKey
ALTER TABLE "access_log" ADD CONSTRAINT "access_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
