/*
  Warnings:

  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('INSTRUNCTION', 'SCHEME', 'PREVIEW');

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_itemId_fkey";

-- DropTable
DROP TABLE "File";

-- CreateTable
CREATE TABLE "ItemFile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "FileType" NOT NULL,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "ItemFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "ItemFile" ADD CONSTRAINT "ItemFile_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
