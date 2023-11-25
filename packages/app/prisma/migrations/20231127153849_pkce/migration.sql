-- AlterTable
ALTER TABLE "DeviceAuthorizationFlow" ADD COLUMN     "codeChallenge" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "codeChallengeMethod" TEXT NOT NULL DEFAULT 'S256';
