-- AlterTable
ALTER TABLE "children" ADD COLUMN     "age" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "profile_picture" VARCHAR,
ALTER COLUMN "birth_date" SET DATA TYPE VARCHAR;
