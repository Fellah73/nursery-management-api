/*
  Warnings:

  - You are about to drop the column `breakfastTime` on the `nursery_settings` table. All the data in the column will be lost.
  - You are about to drop the column `lunchTime` on the `nursery_settings` table. All the data in the column will be lost.
  - You are about to drop the column `snackTime` on the `nursery_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "nursery_settings" DROP COLUMN "breakfastTime",
DROP COLUMN "lunchTime",
DROP COLUMN "snackTime";
