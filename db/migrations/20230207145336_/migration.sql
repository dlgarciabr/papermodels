/*
  Warnings:

  - Added the required column `setupId` to the `IntegrationItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IntegrationItem" ADD COLUMN     "setupId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "IntegrationItem" ADD CONSTRAINT "IntegrationItem_setupId_fkey" FOREIGN KEY ("setupId") REFERENCES "IntegrationSetup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
