"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Loader2 } from "lucide-react";

function ExternalAuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace("/login?error=missing_token");
      return;
    }

    // Store the token — no refresh token for external users
    setTokens(token, "");

    // Redirect to dashboard
    router.replace("/dashboard");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Signing you in...</p>
      </div>
    </div>
  );
}

export default function ExternalAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <ExternalAuthHandler />
    </Suspense>
  );
}