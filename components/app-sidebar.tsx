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
  SidebarFooter,
} from "@/components/ui/sidebar";

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
} from "./ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";
import {
  ChessQueenIcon,
  Users,
  ChevronDown,
  ChessKingIcon,
  User2,
  LogOut,
  Loader2,
  Home,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useLogout } from "@/hooks/auth/useLogout";
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

export function AppSidebar() {
  const [workspace, setWorspace] = useState<"Dashboard" | "Admin">("Dashboard");
  const items = workspace === "Dashboard" ? dashBoardSideBar : adminSidebar;
  const { user } = useAuthStore();
  const logout = useLogout();
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-semibold uppercase">
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                title="Sign out"
              >
                {logout.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
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