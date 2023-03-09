/*
  Warnings:

  - The values [pendingReadingUrls,readingUrlsDone] on the enum `UrlIntegrationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `FileIntegration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `ItemIntegration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `UrlIntegration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UrlIntegrationStatus_new" AS ENUM ('pendingReading', 'readingDone', 'pendingSimulation', 'simulated', 'pending', 'done');
ALTER TABLE "UrlIntegration" ALTER COLUMN "status" TYPE "UrlIntegrationStatus_new" USING ("status"::text::"UrlIntegrationStatus_new");
ALTER TYPE "UrlIntegrationStatus" RENAME TO "UrlIntegrationStatus_old";
ALTER TYPE "UrlIntegrationStatus_new" RENAME TO "UrlIntegrationStatus";
DROP TYPE "UrlIntegrationStatus_old";
COMMIT;

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
