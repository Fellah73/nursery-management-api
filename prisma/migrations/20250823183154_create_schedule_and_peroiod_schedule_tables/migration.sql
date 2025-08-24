/*
  Warnings:

  - You are about to drop the column `classroomId` on the `schedules` table. All the data in the column will be lost.
  - Added the required column `schedulePeriodId` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_classroomId_fkey";

-- DropIndex
DROP INDEX "schedules_classroomId_dayOfWeek_startTime_key";

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "classroomId",
ADD COLUMN     "schedulePeriodId" INTEGER NOT NULL,
ALTER COLUMN "location" DROP NOT NULL;

-- CreateTable
CREATE TABLE "schedule_periods" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "classroomId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_periods_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_schedulePeriodId_fkey" FOREIGN KEY ("schedulePeriodId") REFERENCES "schedule_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_periods" ADD CONSTRAINT "schedule_periods_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
