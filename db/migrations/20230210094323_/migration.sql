/*
  Warnings:

  - The values [thumbnail] on the enum `FileType` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `index` on the `ItemFile` table. All the data in the column will be lost.
  - Changed the type of `status` on the `IntegrationItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `artifactType` on the `ItemFile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FileType_new" AS ENUM ('instruction', 'preview', 'scheme');
ALTER TABLE "ItemFile" ALTER COLUMN "artifactType" TYPE "FileType_new" USING ("artifactType"::text::"FileType_new");
ALTER TYPE "FileType" RENAME TO "FileType_old";
ALTER TYPE "FileType_new" RENAME TO "FileType";
DROP TYPE "FileType_old";
COMMIT;

-- AlterTable
ALTER TABLE "IntegrationItem" DROP COLUMN "status",
ADD COLUMN     "status" "IntegrationItemStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "status",
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'disable';

-- AlterTable
ALTER TABLE "ItemFile" DROP COLUMN "index",
DROP COLUMN "artifactType",
ADD COLUMN     "artifactType" "FileType" NOT NULL;
