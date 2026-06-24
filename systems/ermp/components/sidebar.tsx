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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { SidebarUserFooter } from "@/components/sidebar-user-footer";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ChessQueenIcon,
  Users,
  ChevronDown,
  ChessKingIcon,
  User2,
  Home,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

type SideBarItem = {
  icon: React.ElementType;
  sideBarMenuButtonTitle: string;
  url?: string;
  sideBarMenuSubItems: { title: string; url: string }[];
};

const dashBoardSideBar: SideBarItem[] = [
  {
    icon: User2,
    sideBarMenuButtonTitle: "Employee",
    sideBarMenuSubItems: [{ title: "List", url: "/dashboard/employee-list" }],
  },
];

const adminSidebar: SideBarItem[] = [
  {
    icon: Users,
    sideBarMenuButtonTitle: "Users",
    sideBarMenuSubItems: [
      { title: "List", url: "/admin/user-list" },
      { title: "Roles", url: "/admin/user-roles" },
    ],
  },
];

export function ErmpSidebar() {
  const [workspace, setWorspace] = useState<"Dashboard" | "Admin">("Dashboard");
  const items = workspace === "Dashboard" ? dashBoardSideBar : adminSidebar;
  const { user } = useAuthStore();
  const isAdmin = user?.account_type?.includes("admin_account");

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <PageDropDown workspace={workspace} onSelect={setWorspace} isAdmin={isAdmin} />
          <SidebarMenuItem></SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pb-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <Separator className="my-2" />
        <SidebarGroup>
          <SidebarGroupLabel>{workspace}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) =>
                item.sideBarMenuSubItems.length > 0 ? (
                  <SidebarMenuItem key={item.sideBarMenuButtonTitle}>
                    <Collapsible className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon className="h-4 w-4" />
                          {item.sideBarMenuButtonTitle}
                          <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.sideBarMenuSubItems.map((sub) => (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={sub.url}>{sub.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                ) : (
                  <SidebarMenuItem key={item.sideBarMenuButtonTitle}>
                    <SidebarMenuButton>
                      <item.icon className="h-4 w-4" />
                      {item.sideBarMenuButtonTitle}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarUserFooter />
    </Sidebar>
  );
}

export function PageDropDown({
  workspace,
  onSelect,
  isAdmin,
}: {
  workspace: string;
  onSelect: (w: "Dashboard" | "Admin") => void;
  isAdmin?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={!isAdmin}>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-9"
          disabled={!isAdmin}
        >
          <span className="border border-muted-foreground/30 rounded p-1">
            {workspace === "Dashboard" ? (
              <ChessQueenIcon className="h-6 w-6" />
            ) : (
              <ChessKingIcon className="h-6 w-6" />
            )}
          </span>
          {workspace}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
        <DropdownMenuItem
          className="py-2"
          onClick={() => onSelect("Dashboard")}
        >
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="py-2" onClick={() => onSelect("Admin")}>
          <span>Admin</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
