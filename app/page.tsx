"use client";

import Link from "next/link";
import { ClipboardList, BarChart3, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

const SYSTEMS = [
  {
    id: "ermp",
    name: "Requirements Monitoring",
    description: "Track and monitor employee onboarding requirements.",
    href: "/dashboard",
    icon: ClipboardList,
    color: "bg-blue-50 border-blue-100 text-blue-600",
    iconBg: "bg-blue-600",
  },
  {
    id: "ap",
    name: "Analytics Portal",
    description: "Visualize and explore your hiring pipeline data.",
    href: "/analytics",
    icon: BarChart3,
    color: "bg-violet-50 border-violet-100 text-violet-600",
    iconBg: "bg-violet-600",
  },
] as const;

export default function PortalPage() {
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
        <main className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-900 text-white shadow-md">
            <ClipboardList className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Requirements Monitor
            </h1>
            <p className="text-base text-gray-400">
              Track and monitor employee requirements.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
          >
            Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Select a system
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Choose the system you want to work with.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SYSTEMS.map((system) => {
            const Icon = system.icon;
            return (
              <Link
                key={system.id}
                href={system.href}
                className="group flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${system.iconBg} text-white`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {system.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    {system.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-blue-600 transition-colors mt-auto">
                  Open
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}