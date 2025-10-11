-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('STAFF', 'CHILD');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING', 'PRESENT', 'ABSENT', 'LATE');

-- CreateTable
CREATE TABLE "attendance_dates" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" SERIAL NOT NULL,
    "attendanceDateId" INTEGER NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "userId" INTEGER,
    "childId" INTEGER,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PENDING',
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendance_dates_date_key" ON "attendance_dates"("date");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_attendanceDateId_userId_entityType_key" ON "attendances"("attendanceDateId", "userId", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_attendanceDateId_childId_entityType_key" ON "attendances"("attendanceDateId", "childId", "entityType");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_attendanceDateId_fkey" FOREIGN KEY ("attendanceDateId") REFERENCES "attendance_dates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
