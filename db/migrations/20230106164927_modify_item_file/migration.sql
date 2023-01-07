/*
  Warnings:

  - The primary key for the `ItemFile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ItemFile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[storagePath]` on the table `ItemFile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storagePath` to the `ItemFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ItemFile" DROP CONSTRAINT "ItemFile_pkey",
ADD COLUMN     "storagePath" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ItemFile_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "ItemFile_storagePath_key" ON "ItemFile"("storagePath");
