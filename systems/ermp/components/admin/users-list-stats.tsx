"use client";

import { Users, ShieldCheck, UserX } from "lucide-react";
import { useUsersStore } from "@/systems/ermp/store/users.store";

export function UsersListStats() {
  const { total, items } = useUsersStore();

  const blockedCount = items.filter((user) => user.is_blocked).length;
  const activeCount = items.length - blockedCount;

  const stats = [
    {
      label: "Total users",
      value: total,
      icon: Users,
      tone: "bg-slate-900 text-white",
    },
    {
      label: "Active (page)",
      value: activeCount,
      icon: ShieldCheck,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Blocked (page)",
      value: blockedCount,
      icon: UserX,
      tone: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400">{stat.label}</p>
              <p className="text-lg font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.tone}`}
            >
              <stat.icon className="h-4 w-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
