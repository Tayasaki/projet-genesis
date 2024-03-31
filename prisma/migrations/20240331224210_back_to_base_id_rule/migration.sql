-- DropIndex
DROP INDEX "Suggestion_type_name_key";

-- AlterTable
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("name");
