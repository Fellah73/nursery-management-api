/*
  Warnings:

  - You are about to drop the column `parent_id` on the `children` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "children" DROP CONSTRAINT "children_parent_id_fkey";

-- AlterTable
ALTER TABLE "children" DROP COLUMN "parent_id";
