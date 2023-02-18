/*
  Warnings:

  - The values [simulation] on the enum `FileIntegrationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [simulation] on the enum `ItemIntegrationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `FileIntegration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FileIntegrationStatus_new" AS ENUM ('pending', 'running', 'done', 'error', 'pendingSimulation', 'simulated');
ALTER TABLE "FileIntegration" ALTER COLUMN "status" TYPE "FileIntegrationStatus_new" USING ("status"::text::"FileIntegrationStatus_new");
ALTER TYPE "FileIntegrationStatus" RENAME TO "FileIntegrationStatus_old";
ALTER TYPE "FileIntegrationStatus_new" RENAME TO "FileIntegrationStatus";
DROP TYPE "FileIntegrationStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ItemIntegrationStatus_new" AS ENUM ('pending', 'pendingFiles', 'running', 'done', 'error', 'pendingSimulation', 'simulated');
ALTER TABLE "ItemIntegration" ALTER COLUMN "status" TYPE "ItemIntegrationStatus_new" USING ("status"::text::"ItemIntegrationStatus_new");
ALTER TYPE "ItemIntegrationStatus" RENAME TO "ItemIntegrationStatus_old";
ALTER TYPE "ItemIntegrationStatus_new" RENAME TO "ItemIntegrationStatus";
DROP TYPE "ItemIntegrationStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "FileIntegration" DROP COLUMN "status",
ADD COLUMN     "status" "FileIntegrationStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "status",
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'disable';
