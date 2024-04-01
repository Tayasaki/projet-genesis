import { SignUpForm } from "@/components/form/SignUpForm";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function SignUp() {
  const session = await getAuthSession();
  if (session) redirect("/");
  return <SignUpForm />;
}
