/*
  Warnings:

  - The values [FRIDAY,SATURDAY] on the enum `DayOfWeek` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `description` on the `schedule_periods` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `maxAttendees` on the `schedules` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DayOfWeek_new" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY');
ALTER TABLE "schedules" ALTER COLUMN "dayOfWeek" TYPE "DayOfWeek_new" USING ("dayOfWeek"::text::"DayOfWeek_new");
ALTER TYPE "DayOfWeek" RENAME TO "DayOfWeek_old";
ALTER TYPE "DayOfWeek_new" RENAME TO "DayOfWeek";
DROP TYPE "DayOfWeek_old";
COMMIT;

-- AlterTable
ALTER TABLE "schedule_periods" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "description",
DROP COLUMN "maxAttendees";
