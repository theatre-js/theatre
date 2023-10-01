/*
  Warnings:

  - The `state` column on the `LibAuthenticationFlow` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LibAuthenticationFlowState" AS ENUM ('initialized', 'userAllowedAuth', 'userDeniedAuth', 'tokenAlreadyUsed');

-- AlterTable
ALTER TABLE "LibAuthenticationFlow" DROP COLUMN "state",
ADD COLUMN     "state" "LibAuthenticationFlowState" NOT NULL DEFAULT 'initialized';
