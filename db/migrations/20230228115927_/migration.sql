/*
  Warnings:

  - The `status` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[key]` on the table `SystemParameter` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `status` on the `FileIntegration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `ItemIntegration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `UrlIntegration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "FileIntegration" DROP COLUMN "status",
ADD COLUMN     "status" "FileIntegrationStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "status",
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'disable';

-- AlterTable
ALTER TABLE "ItemIntegration" DROP COLUMN "status",
ADD COLUMN     "status" "ItemIntegrationStatus" NOT NULL;

-- AlterTable
ALTER TABLE "UrlIntegration" DROP COLUMN "status",
ADD COLUMN     "status" "UrlIntegrationStatus" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SystemParameter_key_key" ON "SystemParameter"("key");
