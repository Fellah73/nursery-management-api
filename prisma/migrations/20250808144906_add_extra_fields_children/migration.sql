-- AlterTable
ALTER TABLE "children" ADD COLUMN     "address" VARCHAR,
ADD COLUMN     "blood_type" VARCHAR,
ADD COLUMN     "city" VARCHAR,
ADD COLUMN     "class_group" VARCHAR,
ADD COLUMN     "emergency_phone" VARCHAR,
ADD COLUMN     "secondary_emergency_contact" VARCHAR,
ADD COLUMN     "secondary_emergency_phone" VARCHAR,
ALTER COLUMN "entry_date" SET DATA TYPE VARCHAR;
