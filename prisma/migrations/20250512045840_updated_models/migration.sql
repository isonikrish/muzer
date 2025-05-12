-- AlterTable
ALTER TABLE "CurrentStream" ALTER COLUMN "userId" DROP DEFAULT;
DROP SEQUENCE "CurrentStream_userId_seq";
