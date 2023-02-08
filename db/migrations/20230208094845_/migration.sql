/*
  Warnings:

  - Changed the type of `status` on the `IntegrationItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `artifactType` on the `ItemFile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('integrating', 'enable', 'disable');

-- AlterTable
ALTER TABLE "IntegrationItem" DROP COLUMN "status",
ADD COLUMN     "status" "IntegrationItemStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'disable';

-- AlterTable
ALTER TABLE "ItemFile" DROP COLUMN "artifactType",
ADD COLUMN     "artifactType" "FileType" NOT NULL;
