/*
  Warnings:

  - You are about to drop the column `node` on the `IntegrationItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url]` on the table `IntegrationItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `url` to the `IntegrationItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "IntegrationItem_name_key";

-- DropIndex
DROP INDEX "IntegrationItem_node_key";

-- AlterTable
ALTER TABLE "IntegrationItem" DROP COLUMN "node",
ADD COLUMN     "url" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationItem_url_key" ON "IntegrationItem"("url");
