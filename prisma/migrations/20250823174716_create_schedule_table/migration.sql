-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "schedules" (
    "id" SERIAL NOT NULL,
    "classroomId" INTEGER NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" VARCHAR(5) NOT NULL,
    "endTime" VARCHAR(5) NOT NULL,
    "activity" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(100) NOT NULL,
    "maxAttendees" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schedules_classroomId_dayOfWeek_startTime_key" ON "schedules"("classroomId", "dayOfWeek", "startTime");

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
