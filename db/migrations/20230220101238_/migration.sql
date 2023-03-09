/*
  Warnings:

  - The `status` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `FileIntegration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `ItemIntegration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UrlIntegrationStatus" AS ENUM ('pendingReadingUrls', 'readingUrlsDone', 'pendingSimulation', 'simulated', 'pending', 'done');

-- AlterTable
ALTER TABLE "FileIntegration" DROP COLUMN "status",
ADD COLUMN     "status" "FileIntegrationStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "status",
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'disable';

-- AlterTable
ALTER TABLE "ItemIntegration" DROP COLUMN "status",
ADD COLUMN     "status" "ItemIntegrationStatus" NOT NULL;

-- CreateTable
CREATE TABLE "UrlIntegration" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "status" "UrlIntegrationStatus" NOT NULL,
    "setupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UrlIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UrlIntegration_url_key" ON "UrlIntegration"("url");

-- AddForeignKey
ALTER TABLE "UrlIntegration" ADD CONSTRAINT "UrlIntegration_setupId_fkey" FOREIGN KEY ("setupId") REFERENCES "IntegrationSetup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
