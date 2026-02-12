-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "deleteAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Task_deleteAt_idx" ON "Task"("deleteAt");

-- CreateIndex
CREATE INDEX "Task_createdAt_idx" ON "Task"("createdAt");
