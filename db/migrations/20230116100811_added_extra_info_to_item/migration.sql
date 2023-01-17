/*
  Warnings:

  - Added the required column `assemblyTime` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dificulty` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "assemblyTime" DECIMAL(2,1) NOT NULL,
ADD COLUMN     "author" TEXT,
ADD COLUMN     "authorLink" TEXT,
ADD COLUMN     "dificulty" INTEGER NOT NULL,
ADD COLUMN     "licenseType" TEXT,
ADD COLUMN     "licenseTypeLink" TEXT;
