-- CreateTable
CREATE TABLE "nursery_profile" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slogan" VARCHAR(200),
    "logo" TEXT,
    "address" VARCHAR(255),
    "phone" VARCHAR(20),
    "phone2" VARCHAR(20),
    "email" VARCHAR(100),
    "facebook" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "youtube" TEXT,
    "tiktok" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nursery_profile_pkey" PRIMARY KEY ("id")
);
