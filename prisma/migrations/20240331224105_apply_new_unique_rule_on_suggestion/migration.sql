/*
  Warnings:

  - The primary key for the `Suggestion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[type,name]` on the table `Suggestion` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Suggestion" DROP CONSTRAINT "Suggestion_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "Suggestion_type_name_key" ON "Suggestion"("type", "name");
