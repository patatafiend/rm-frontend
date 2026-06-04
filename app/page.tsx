import Link from "next/link";
import { ClipboardList, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
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
        <Button asChild size="lg" className="w-full gap-2 rounded-xl text-base">
          <Link href="/login">
            Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </main>
    </div>
  );
}
