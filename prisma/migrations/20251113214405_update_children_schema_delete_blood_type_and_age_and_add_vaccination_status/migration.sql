/*
  Warnings:

  - You are about to drop the column `age` on the `children` table. All the data in the column will be lost.
  - You are about to drop the column `class_group` on the `children` table. All the data in the column will be lost.
  - The `vaccination_status` column on the `children` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VaccinationStatus" AS ENUM ('COMPLETE', 'INCOMPLETE', 'UNKNOWN');

-- AlterTable
ALTER TABLE "children" DROP COLUMN "age",
DROP COLUMN "class_group",
DROP COLUMN "vaccination_status",
ADD COLUMN     "vaccination_status" "VaccinationStatus";
