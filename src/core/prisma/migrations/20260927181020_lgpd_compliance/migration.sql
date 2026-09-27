-- CreateEnum
CREATE TYPE "LegalDocumentType" AS ENUM ('TERMS_OF_USE');

-- CreateTable
CREATE TABLE "legal_document_acceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentType" "LegalDocumentType" NOT NULL,
    "version" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "legal_document_acceptance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "legal_document_acceptance_userId_idx" ON "legal_document_acceptance"("userId");

-- CreateIndex
CREATE INDEX "legal_document_acceptance_documentType_version_idx" ON "legal_document_acceptance"("documentType", "version");

-- CreateIndex
CREATE UNIQUE INDEX "legal_document_acceptance_userId_documentType_version_key" ON "legal_document_acceptance"("userId", "documentType", "version");

-- AddForeignKey
ALTER TABLE "legal_document_acceptance" ADD CONSTRAINT "legal_document_acceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
