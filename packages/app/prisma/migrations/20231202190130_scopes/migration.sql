-- AlterTable
ALTER TABLE "DeviceAuthorizationFlow" ADD COLUMN     "scopes" JSONB NOT NULL DEFAULT '[]';
