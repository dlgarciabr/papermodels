/*
  Warnings:

  - You are about to drop the column `type` on the `ItemFile` table. All the data in the column will be lost.
  - Added the required column `artifactType` to the `ItemFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ItemFile" DROP COLUMN "type",
ADD COLUMN     "artifactType" "FileType" NOT NULL;
