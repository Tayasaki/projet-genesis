import { AppHeader } from "@/components/features/layout/AppHeader";
import { Sidebar } from "@/components/features/layout/Sidebar";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();
  const scenarios = session?.user?.id
    ? await prisma.scenario.findMany({
        where: { userId: session.user.id },
        select: { id: true, name: true },
      })
    : [];
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <AppHeader scenarios={scenarios} />
        <div className="flex flex-1 flex-col">
          <div className="container mx-auto flex max-w-5xl flex-1 flex-col px-5 py-8 md:px-10 md:py-10">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
