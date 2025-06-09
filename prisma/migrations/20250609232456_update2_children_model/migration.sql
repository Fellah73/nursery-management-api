-- AlterTable
ALTER TABLE "children" ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "emergency_contact" VARCHAR,
ADD COLUMN     "entry_date" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "special_needs" TEXT,
ADD COLUMN     "vaccination_status" VARCHAR,
ALTER COLUMN "age" DROP DEFAULT;
