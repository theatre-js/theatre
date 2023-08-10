/*
  Warnings:

  - You are about to drop the `PreAuthenticationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PreAuthenticationToken";

-- CreateTable
CREATE TABLE "LibAuthenticationFlow" (
    "preAuthenticationToken" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "clientFlowToken" TEXT NOT NULL,
    "lastCheckTime" TIMESTAMP(3) NOT NULL,
    "state" INTEGER NOT NULL DEFAULT 0,
    "tokens" TEXT NOT NULL,

    CONSTRAINT "LibAuthenticationFlow_pkey" PRIMARY KEY ("preAuthenticationToken")
);

-- CreateIndex
CREATE UNIQUE INDEX "LibAuthenticationFlow_userCode_key" ON "LibAuthenticationFlow"("userCode");
