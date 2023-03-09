/*
  Warnings:

  - The `status` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `IntegrationItem` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `artifactType` on the `ItemFile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ItemIntegrationStatus" AS ENUM ('pending', 'running', 'done', 'error');

-- CreateEnum
CREATE TYPE "FileIntegrationStatus" AS ENUM ('pending', 'running', 'done', 'error');

-- DropForeignKey
ALTER TABLE "IntegrationItem" DROP CONSTRAINT "IntegrationItem_setupId_fkey";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "status",
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'disable';

-- AlterTable
ALTER TABLE "ItemFile" DROP COLUMN "artifactType",
ADD COLUMN     "artifactType" "FileType" NOT NULL;

-- DropTable
DROP TABLE "IntegrationItem";

-- DropEnum
DROP TYPE "IntegrationItemStatus";

-- CreateTable
CREATE TABLE "ItemIntegration" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "ItemIntegrationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "setupId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "error" TEXT,

    CONSTRAINT "ItemIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileIntegration" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "selector" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "FileIntegrationStatus" NOT NULL,
    "integrationType" "FileType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "error" TEXT,

    CONSTRAINT "FileIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemIntegration_url_key" ON "ItemIntegration"("url");

-- CreateIndex
CREATE UNIQUE INDEX "FileIntegration_url_key" ON "FileIntegration"("url");

-- AddForeignKey
ALTER TABLE "ItemIntegration" ADD CONSTRAINT "ItemIntegration_setupId_fkey" FOREIGN KEY ("setupId") REFERENCES "IntegrationSetup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileIntegration" ADD CONSTRAINT "FileIntegration_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
