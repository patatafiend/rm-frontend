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
import { Button } from "./ui/button";
import {
  ChessQueenIcon,
  LayoutDashboard,
  Users,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

type SideBarItem = {
  icon: React.ElementType;
  sideBarMenuButtonTitle: string;
  url?: string;
  sideBarMenuSubItems: { title: string; url: string }[];
};

const dashBoardSideBar: SideBarItem[] = [
  {
    icon: LayoutDashboard,
    sideBarMenuButtonTitle: "Employee",
    sideBarMenuSubItems: [
      { title: "List", url: "/client/dashboard/employee-list" },
    ],
  },
];

const adminSidebar: SideBarItem[] = [
  {
    icon: Users,
    sideBarMenuButtonTitle: "Users",
    sideBarMenuSubItems: [
      { title: "List", url: "/client/admin/user-list" },
      { title: "Roles", url: "/client/admin/user-roles" },
      { title: "Permissions", url: "/client/admin/user-permissions" },
    ],
  },
];

export function AppSidebar() {
  const [workspace, setWorspace] = useState<"Dashboard" | "Admin">("Dashboard");
  const items = workspace === "Dashboard" ? dashBoardSideBar : adminSidebar;

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <PageDropDown workspace={workspace} onSelect={setWorspace} />
          <SidebarMenuItem></SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
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
    </Sidebar>
  );
}

export function PageDropDown({
  workspace,
  onSelect,
}: {
  workspace: string;
  onSelect: (w: "Dashboard" | "Admin") => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="">
        <Button variant="outline" className="w-full justify-start gap-3 h-9">
          <span className="border border-muted-foreground/30 rounded p-1">
            <ChessQueenIcon className="h-6 w-6" />
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
