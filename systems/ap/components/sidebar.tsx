"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { SidebarUserFooter } from "@/components/sidebar-user-footer";
import { BarChart3, Home } from "lucide-react";
import Link from "next/link";

export function ApSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-semibold text-foreground">Analytics Portal</span>
                <span className="text-[10px] text-muted-foreground">Hiring pipeline</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    Portal Home
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/analytics">
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarUserFooter />
    </Sidebar>
  );
}
