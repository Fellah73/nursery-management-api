/*
  Warnings:

  - You are about to drop the column `created_at` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `day` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `menus` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[menuPeriodId,dayOfWeek,mealType]` on the table `menus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dayOfWeek` to the `menus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mealType` to the `menus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `menuPeriodId` to the `menus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `menus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "menus" DROP COLUMN "created_at",
DROP COLUMN "date",
DROP COLUMN "day",
DROP COLUMN "type",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dayOfWeek" "DayOfWeek" NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mealType" "MenuType" NOT NULL,
ADD COLUMN     "menuPeriodId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "menu_periods" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" "Category" NOT NULL,

    CONSTRAINT "menu_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "menu_periods_id_category_key" ON "menu_periods"("id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "menus_menuPeriodId_dayOfWeek_mealType_key" ON "menus"("menuPeriodId", "dayOfWeek", "mealType");

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_menuPeriodId_fkey" FOREIGN KEY ("menuPeriodId") REFERENCES "menu_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
