/*
  Warnings:

  - The `status` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `FileIntegration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `ItemIntegration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `UrlIntegration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "FileIntegration" DROP COLUMN "status",
ADD COLUMN     "status" "FileIntegrationStatus" NOT NULL;

-- AlterTable
ALTER TABLE "IntegrationSetup" ADD COLUMN     "author" TEXT,
ADD COLUMN     "authorLink" TEXT,
ADD COLUMN     "licenseType" TEXT,
ADD COLUMN     "licenseTypeLink" TEXT;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "status",
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'disable';

-- AlterTable
ALTER TABLE "ItemIntegration" DROP COLUMN "status",
ADD COLUMN     "status" "ItemIntegrationStatus" NOT NULL;

-- AlterTable
ALTER TABLE "UrlIntegration" DROP COLUMN "status",
ADD COLUMN     "status" "UrlIntegrationStatus" NOT NULL;

-- CreateTable
CREATE TABLE "ItemIntegrationLog" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "url" TEXT,
    "errorStack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemIntegrationLog_pkey" PRIMARY KEY ("id")
);
