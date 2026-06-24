import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ErmpSidebar } from "@/systems/ermp/components/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ErmpSidebar />
      <main className="flex-1 min-w-0 p-6">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}