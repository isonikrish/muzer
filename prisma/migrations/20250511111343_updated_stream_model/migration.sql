/*
  Warnings:

  - You are about to drop the column `bigImg` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `smallImg` on the `Stream` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "bigImg",
DROP COLUMN "smallImg",
ADD COLUMN     "thumbnail" TEXT;
