import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ApSidebar } from "@/systems/ap/components/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ApSidebar />
      <main className="flex-1 min-w-0 p-6">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
