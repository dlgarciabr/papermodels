/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `IntegrationItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[node]` on the table `IntegrationItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "IntegrationItem_name_key" ON "IntegrationItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationItem_node_key" ON "IntegrationItem"("node");
