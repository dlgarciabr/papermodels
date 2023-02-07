/*
  Warnings:

  - Added the required column `categoryId` to the `IntegrationItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryBinding` to the `IntegrationSetup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categorySelector` to the `IntegrationSetup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IntegrationItem" ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "IntegrationSetup" ADD COLUMN     "categoryBinding" TEXT NOT NULL,
ADD COLUMN     "categorySelector" TEXT NOT NULL;
