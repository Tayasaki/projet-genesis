import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoginButton } from "@/features/layout/auth/LoginButton";
import { LogoutButton } from "@/features/layout/auth/LogoutButton";
import { getAuthSession } from "@/lib/auth";

export default async function Profile() {
  const session = await getAuthSession();
  return (
    <div>
      <Avatar>
        <AvatarImage
          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${session?.user.name}`}
          alt="Profile picture"
          className="bg-slate-200"
        />
        <AvatarFallback>{session?.user.name ?? ""}</AvatarFallback>
      </Avatar>
      <LogoutButton />
    </div>
  );
}
