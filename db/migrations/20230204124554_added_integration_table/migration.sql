-- CreateEnum
CREATE TYPE "IntegrationItemStatus" AS ENUM ('todo', 'running', 'done');

-- CreateTable
CREATE TABLE "IntegrationItem" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "IntegrationItemStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "error" TEXT,

    CONSTRAINT "IntegrationItem_pkey" PRIMARY KEY ("id")
);
