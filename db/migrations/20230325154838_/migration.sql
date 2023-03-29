-- AlterTable
ALTER TABLE "ItemIntegration" ADD COLUMN     "hasCategory" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasDescription" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasPreview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasScheme" BOOLEAN NOT NULL DEFAULT false;
