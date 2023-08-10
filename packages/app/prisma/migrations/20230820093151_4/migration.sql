-- CreateTable
CREATE TABLE "LibSession" (
    "refreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "validUntil" TIMESTAMPTZ NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LibSession_pkey" PRIMARY KEY ("refreshToken")
);

-- AddForeignKey
ALTER TABLE "LibSession" ADD CONSTRAINT "LibSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
