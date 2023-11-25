/*
  Warnings:

  - You are about to drop the `LibAuthenticationFlow` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DeviceAuthorizationFlowState" AS ENUM ('initialized', 'userAllowedAuth', 'userDeniedAuth', 'tokenAlreadyUsed');

-- DropTable
DROP TABLE "LibAuthenticationFlow";

-- DropEnum
DROP TYPE "LibAuthenticationFlowState";

-- CreateTable
CREATE TABLE "DeviceAuthorizationFlow" (
    "deviceCode" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "lastCheckTime" TIMESTAMPTZ NOT NULL,
    "nounce" TEXT NOT NULL,
    "state" "DeviceAuthorizationFlowState" NOT NULL DEFAULT 'initialized',
    "tokens" TEXT NOT NULL,

    CONSTRAINT "DeviceAuthorizationFlow_pkey" PRIMARY KEY ("deviceCode")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceAuthorizationFlow_userCode_key" ON "DeviceAuthorizationFlow"("userCode");
