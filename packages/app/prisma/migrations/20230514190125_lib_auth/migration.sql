-- CreateTable
CREATE TABLE "PreAuthenticationToken" (
    "preAuthenticationToken" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "lastCheckTime" TIMESTAMP(3) NOT NULL,
    "state" INTEGER NOT NULL DEFAULT 0,
    "tokens" TEXT NOT NULL,

    CONSTRAINT "PreAuthenticationToken_pkey" PRIMARY KEY ("preAuthenticationToken")
);
