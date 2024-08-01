import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TOS() {
  const session = await getAuthSession();
  if (!session?.user.id) redirect("/login");
  return <div>Terms of services</div>;
}
