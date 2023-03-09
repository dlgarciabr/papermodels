/*
  Warnings:

  - The `status` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `FileIntegration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "IntegrationLog" DROP CONSTRAINT "IntegrationLog_integrationId_fkey";

-- AlterTable
ALTER TABLE "FileIntegration" DROP COLUMN "status",
ADD COLUMN     "status" "FileIntegrationStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "status",
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'disable';

-- AddForeignKey
ALTER TABLE "IntegrationLog" ADD CONSTRAINT "IntegrationLog_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "ItemIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
