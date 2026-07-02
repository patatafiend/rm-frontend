"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PamSidebar } from "@/systems/pam/components/sidebar";

export default function PamLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <PamSidebar />
      <main className="flex-1 min-w-0 p-6">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
