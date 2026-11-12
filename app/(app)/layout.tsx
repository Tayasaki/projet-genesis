import { AppHeader } from "@/components/features/layout/AppHeader";
import { Sidebar } from "@/components/features/layout/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex flex-1 flex-col">
          <div className="container mx-auto flex max-w-5xl flex-1 flex-col px-5 py-8 md:px-10 md:py-10">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
