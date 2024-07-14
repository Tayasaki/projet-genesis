import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const getSuggestions = () => prisma.suggestion.findMany();

export type Suggestion = Prisma.PromiseReturnType<
  typeof getSuggestions
>[number];
