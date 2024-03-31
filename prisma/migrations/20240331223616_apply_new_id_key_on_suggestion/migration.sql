/*
  Warnings:

  - The primary key for the `Suggestion` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Suggestion" DROP CONSTRAINT "Suggestion_pkey",
ADD CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("type", "name");
