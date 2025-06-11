-- CreateEnum
CREATE TYPE "MenuType" AS ENUM ('Breakfast', 'Lunch', 'Gouter');

-- CreateTable
CREATE TABLE "menus" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "day" VARCHAR(20) NOT NULL,
    "type" "MenuType" NOT NULL,
    "starter" TEXT,
    "main_course" TEXT,
    "side_dish" TEXT,
    "dessert" TEXT,
    "drink" TEXT,
    "snack" TEXT,
    "special_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);
