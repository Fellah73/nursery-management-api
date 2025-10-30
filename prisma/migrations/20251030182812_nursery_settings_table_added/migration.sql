-- CreateTable
CREATE TABLE "nursery_settings" (
    "id" SERIAL NOT NULL,
    "openingTime" VARCHAR(5) NOT NULL,
    "slotDuration" INTEGER NOT NULL DEFAULT 60,
    "slotInterval" INTEGER NOT NULL DEFAULT 15,
    "slotsPerDay" INTEGER NOT NULL DEFAULT 4,
    "breakfastTime" VARCHAR(5),
    "lunchTime" VARCHAR(5),
    "snackTime" VARCHAR(5),
    "breakfastDuration" INTEGER NOT NULL DEFAULT 30,
    "lunchDuration" INTEGER NOT NULL DEFAULT 60,
    "snackDuration" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nursery_settings_pkey" PRIMARY KEY ("id")
);
