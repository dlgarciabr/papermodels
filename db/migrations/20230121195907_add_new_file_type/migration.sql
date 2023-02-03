-- AlterEnum
ALTER TYPE "FileType" ADD VALUE 'thumbnail';

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "assemblyTime" SET DATA TYPE DECIMAL(65,30);
