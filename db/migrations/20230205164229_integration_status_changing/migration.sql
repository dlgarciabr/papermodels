/*
  Warnings:

  - The values [todo] on the enum `IntegrationItemStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IntegrationItemStatus_new" AS ENUM ('pending', 'running', 'done', 'error');
ALTER TABLE "IntegrationItem" ALTER COLUMN "status" TYPE "IntegrationItemStatus_new" USING ("status"::text::"IntegrationItemStatus_new");
ALTER TYPE "IntegrationItemStatus" RENAME TO "IntegrationItemStatus_old";
ALTER TYPE "IntegrationItemStatus_new" RENAME TO "IntegrationItemStatus";
DROP TYPE "IntegrationItemStatus_old";
COMMIT;
