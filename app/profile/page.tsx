import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButton } from "@/features/layout/auth/LogoutButton";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Profile() {
  const session = await getAuthSession();
  if (!session) redirect("/login");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session?.user.id },
  });
  return (
    <div>
      <h1>Profile</h1>
      <Avatar>
        <AvatarImage
          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
          alt="Profile picture"
          className="bg-slate-200"
        />
        <AvatarFallback>{user.name?.slice(0, 2) ?? ""}</AvatarFallback>
      </Avatar>
      <p>email: {user.email}</p>
      <p>email vérifié: {user.emailVerified ? "✅" : "❌"}</p>
      <LogoutButton />
    </div>
  );
}
