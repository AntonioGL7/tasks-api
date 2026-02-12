/*
  Warnings:

  - You are about to drop the column `deleteAt` on the `Task` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Task_deleteAt_idx";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "deleteAt",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Task_deletedAt_idx" ON "Task"("deletedAt");
