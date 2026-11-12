import { MobileTopBar } from "@/components/features/layout/MobileTopBar";
import { Sidebar } from "@/components/features/layout/Sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <MobileTopBar />
        <main className="flex flex-1 flex-col">
          <div className="container mx-auto flex max-w-5xl flex-1 flex-col px-5 py-8 md:px-10 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
