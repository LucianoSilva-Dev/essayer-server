-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ACTIVITY_CLOSED';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "imageFileId" TEXT;

-- CreateTable
CREATE TABLE "ActivityNotification" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,

    CONSTRAINT "ActivityNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivityNotification_notificationId_key" ON "ActivityNotification"("notificationId");

-- AddForeignKey
ALTER TABLE "ActivityNotification" ADD CONSTRAINT "ActivityNotification_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityNotification" ADD CONSTRAINT "ActivityNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
