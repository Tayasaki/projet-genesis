-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'SUPERUSER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
