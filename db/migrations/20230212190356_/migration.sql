/*
  Warnings:

  - The `status` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `itemIntegrationId` to the `FileIntegration` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `FileIntegration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "FileIntegration" ADD COLUMN     "itemIntegrationId" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "FileIntegrationStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "status",
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'disable';

-- AddForeignKey
ALTER TABLE "FileIntegration" ADD CONSTRAINT "FileIntegration_itemIntegrationId_fkey" FOREIGN KEY ("itemIntegrationId") REFERENCES "ItemIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
