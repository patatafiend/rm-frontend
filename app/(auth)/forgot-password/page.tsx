"use client";

import { useState } from "react";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { useAuthForm } from "@/hooks/form/useAuthForm";
import { FormInput, FormButton } from "@/components/form";
import type { ForgotPasswordRequest } from "@/lib/types";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { mutate: forgotPassword, isPending, error } = useForgotPassword();
  const [submitted, setSubmitted] = useState(false);

  const form = useAuthForm<ForgotPasswordRequest>({
    defaultValues: {
      email: "",
    },
    onSubmit: (data) => {
      forgotPassword(data, {
        onSuccess: () => {
          setSubmitted(true);
        },
      });
    },
  });

  if (submitted) {
    return (
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a password reset link to your email address
          </p>
        </div>

        <div className="rounded-md bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            If you don&apos;t see the email, check your spam folder or try
            again.
          </p>
        </div>

        <Link
          href="/login"
          className="block text-center text-sm text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to receive a password reset link
        </p>
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

        {error && (
          <p className="text-xs text-destructive text-center">
            Failed to send reset link. Please try again.
          </p>
        )}

        <FormButton isLoading={isPending} loadingText="Sending...">
          Send reset link
        </FormButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
