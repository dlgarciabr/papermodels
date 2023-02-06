/*
  Warnings:

  - You are about to drop the column `reference` on the `IntegrationItem` table. All the data in the column will be lost.
  - Added the required column `name` to the `IntegrationItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `node` to the `IntegrationItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IntegrationItem" DROP COLUMN "reference",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "node" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "IntegrationSetup" (
    "id" SERIAL NOT NULL,
    "domain" TEXT NOT NULL,
    "selector" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationSetup_pkey" PRIMARY KEY ("id")
);
