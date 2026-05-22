"use client";

import { useLogin } from "@/hooks/auth/useLogin";
import { useAuthForm } from "@/hooks/form/useAuthForm";
import { FormInput, FormButton } from "@/components/form";
import type { LoginRequest } from "@/lib/types";
import Link from "next/link";
import { AlertCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();

  const form = useAuthForm<LoginRequest>({
    defaultValues: { email: "", password: "" },
    onSubmit: (data) => login(data),
  });

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 relative overflow-hidden flex-col justify-between p-12">
        {/* Geometric accent shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-500/5 blur-2xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Logo / brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">
            ERMS
          </span>
        </div>

        {/* Center copy */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-0.5 bg-blue-500 rounded-full" />
            <h2 className="text-3xl font-bold text-white leading-snug">
              Employee Requirements
              <br />
              Monitoring System
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Track onboarding documents and monitor compliance
            </p>
          </div>
        </div>

        <p className="relative z-10 text-xs text-gray-600">
          © {new Date().getFullYear()} ERMS · Internal use only
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-gray-900 font-semibold text-sm">
              ERMS Admin
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-5"
          >
            <div className="space-y-4">
              <form.Field
                name="email"
                validators={{
                  onBlur: ({ value }) =>
                    !value ? "Email is required" : undefined,
                }}
              >
                {(field) => (
                  <FormInput
                    field={field}
                    type="email"
                    placeholder="you@example.com"
                    label="Email address"
                  />
                )}
              </form.Field>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <form.Field
                  name="password"
                  validators={{
                    onBlur: ({ value }) =>
                      !value ? "Password is required" : undefined,
                  }}
                >
                  {(field) => (
                    <FormInput
                      field={field}
                      type="password"
                      placeholder="••••••••"
                    />
                  )}
                </form.Field>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs text-red-600">
                  Invalid email or password. Please try again.
                </p>
              </div>
            )}

            <FormButton isLoading={isPending} loadingText="Signing in...">
              Sign in
            </FormButton>
          </form>

          <p className="text-center text-xs text-gray-400">
            Having trouble?{" "}
            <a
              href="mailto:trimidal42@gmail.com"
              className="text-gray-600 hover:underline"
            >
              Contact your administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
