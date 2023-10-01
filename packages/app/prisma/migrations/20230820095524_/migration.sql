/*
  Warnings:

  - A unique constraint covering the columns `[auth0Sid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auth0Data` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auth0Sid` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "auth0Data" JSONB NOT NULL,
ADD COLUMN     "auth0Sid" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_auth0Sid_key" ON "User"("auth0Sid");

-- CreateIndex
CREATE INDEX "email" ON "User"("email");
