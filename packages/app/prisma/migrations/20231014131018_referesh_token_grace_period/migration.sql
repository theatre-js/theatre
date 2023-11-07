-- AlterTable
ALTER TABLE "LibSession" ADD COLUMN     "succeededByRefreshToken" TEXT,
ADD COLUMN     "successorLinkExpresAt" TIMESTAMPTZ;
