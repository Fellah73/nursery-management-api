-- AlterEnum
ALTER TYPE "RoleType" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
