/*
  Warnings:

  - You are about to drop the column `selector` on the `IntegrationSetup` table. All the data in the column will be lost.
  - Added the required column `itemUrlSelector` to the `IntegrationSetup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previewImagesSelector` to the `IntegrationSetup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IntegrationSetup" DROP COLUMN "selector",
ADD COLUMN     "itemUrlSelector" TEXT NOT NULL,
ADD COLUMN     "previewImagesSelector" TEXT NOT NULL;
