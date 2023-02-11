/*
  Warnings:

  - The `status` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `IntegrationItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `artifactType` on the `ItemFile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "IntegrationItem" DROP COLUMN "status",
ADD COLUMN     "status" "IntegrationItemStatus" NOT NULL;

-- AlterTable
ALTER TABLE "IntegrationSetup" ADD COLUMN     "ignoreExpressions" TEXT;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "status",
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'disable';

-- AlterTable
ALTER TABLE "ItemFile" DROP COLUMN "artifactType",
ADD COLUMN     "artifactType" "FileType" NOT NULL;
