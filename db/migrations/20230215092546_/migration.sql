/*
  Warnings:

  - You are about to drop the column `itemId` on the `FileIntegration` table. All the data in the column will be lost.
  - The `status` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `FileIntegration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "FileIntegration" DROP CONSTRAINT "FileIntegration_itemId_fkey";

-- AlterTable
ALTER TABLE "FileIntegration" DROP COLUMN "itemId",
DROP COLUMN "status",
ADD COLUMN     "status" "FileIntegrationStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "status",
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'disable';

-- AlterTable
ALTER TABLE "ItemIntegration" ADD COLUMN     "itemId" INTEGER;

-- AddForeignKey
ALTER TABLE "ItemIntegration" ADD CONSTRAINT "ItemIntegration_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
