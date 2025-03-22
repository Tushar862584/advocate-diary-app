/*
  Warnings:

  - You are about to drop the `Acquaintance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Acquaintance" DROP CONSTRAINT "Acquaintance_caseId_fkey";

-- DropForeignKey
ALTER TABLE "Acquaintance" DROP CONSTRAINT "Acquaintance_userId_fkey";

-- DropTable
DROP TABLE "Acquaintance";

-- DropEnum
DROP TYPE "AcquaintanceRole";
