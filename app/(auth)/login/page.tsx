"use client";

import { useLogin } from "@/hooks/auth/useLogin";
import { useAuthForm } from "@/hooks/form/useAuthForm";
import { FormInput, FormButton } from "@/components/form";
import type { LoginRequest } from "@/lib/types";
import Link from "next/link";

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();

  const form = useAuthForm<LoginRequest>({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: (data) => {
      login(data);
    },
  });

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field
          name="email"
          validators={{
            onBlur: ({ value }) => (!value ? "Email is required" : undefined),
          }}
        >
          {(field) => (
            <FormInput
              field={field}
              type="email"
              placeholder="you@example.com"
              label="Email"
            />
          )}
        </form.Field>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:underline"
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
              <FormInput field={field} type="password" placeholder="••••••••" />
            )}
          </form.Field>
        </div>

        {error && (
          <p className="text-xs text-destructive text-center">
            Invalid email or password
          </p>
        )}

        <FormButton isLoading={isPending} loadingText="Signing in...">
          Sign in
        </FormButton>
      </form>
    </div>
  );
}
