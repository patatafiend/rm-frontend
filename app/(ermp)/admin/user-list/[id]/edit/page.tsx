"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import * as z from "zod";
import { ArrowLeft, Edit, AlertCircle } from "lucide-react";
import { usersApi } from "@/systems/ermp/lib/api/users";
import { rolesApi } from "@/systems/ermp/lib/api/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsers } from "@/systems/ermp/hooks/admin/useUsers";
import type { AdminUserUpdate, Role, User } from "@/lib/types";

const ACCOUNT_TYPE_OPTIONS: Array<{
  value: User["account_type"];
  label: string;
}> = [
  { value: "admin_account", label: "Admin" },
  { value: "user_account", label: "User" },
  { value: "super_admin_account", label: "Super admin" },
  { value: "audit_account", label: "Audit" },
];

function getDefaultAccountType(
  accountType: string | null | undefined
): "admin_account" | "user_account" | "super_admin_account" | "audit_account" {
  if (
    accountType === "admin_account" ||
    accountType === "user_account" ||
    accountType === "super_admin_account" ||
    accountType === "audit_account"
  ) {
    return accountType;
  }
  return "user_account";
}

const editFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string(),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string(),
  phone_number: z
    .string()
    .refine((v) => !v || v.length >= 7, "Phone number seems too short"),
  account_type: z.enum([
    "admin_account",
    "user_account",
    "super_admin_account",
    "audit_account",
  ]),
  role_id: z.string(),
  client_id: z.string(),
  mfa_enabled: z.boolean(),
});

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pb-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {children}
      </p>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params?.id);
  const { updateUserMutation } = useUsers();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch user data
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => usersApi.get(userId),
    enabled: !!userId,
  });

  const rolesQuery = useQuery({
    queryKey: ["roles", "edit-user"],
    queryFn: () => rolesApi.list(),
    staleTime: 10 * 60 * 1000,
  });

  const roles = (rolesQuery.data ?? []) as Role[];

  const form = useForm({
    defaultValues: {
      first_name: user?.first_name ?? "",
      middle_name: user?.middle_name ?? "",
      last_name: user?.last_name ?? "",
      username: user?.username ?? "",
      phone_number: user?.phone_number ?? "",
      account_type: getDefaultAccountType(user?.account_type),
      role_id: user?.role_id ? String(user.role_id) : "none",
      client_id: user?.client_id ? String(user.client_id) : "none",
      mfa_enabled: user?.mfa_enabled ?? false,
    },
    validators: { onSubmit: editFormSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      const payload: AdminUserUpdate = {
        first_name: value.first_name.trim() || null,
        middle_name: value.middle_name?.trim() || null,
        last_name: value.last_name.trim() || null,
        username: value.username?.trim() || null,
        phone_number: value.phone_number?.trim() || null,
        account_type: getDefaultAccountType(value.account_type),
        role_id: value.role_id !== "none" ? Number(value.role_id) : null,
        mfa_enabled: value.mfa_enabled,
      };

      try {
        await updateUserMutation.mutateAsync({ userId, payload });
        toast.success("User updated successfully.");
        router.push(`/admin/user-list/${userId}`);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update user. Please try again.";
        toast.error(message);
        setSubmitError(message);
      }
    },
  });

  if (userLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">
              Failed to load user
            </p>
            <p className="mt-1 text-sm text-red-600">
              {userError instanceof Error ? userError.message : "Unknown error"}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const fullName = [user.first_name, user.middle_name, user.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <section className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white">
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Admin
              </p>
              <h1 className="text-xl font-semibold text-gray-900">Edit User</h1>
              <p className="text-sm text-gray-500">{fullName || user.email}</p>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        </div>
      </section>

      <form
        id="edit-user-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]"
      >
        {/* ── Personal details ── */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <FieldGroup>
            <SectionHeading>Personal information</SectionHeading>

            <div className="grid gap-4 md:grid-cols-2">
              <form.Field name="first_name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>First name</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="middle_name">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Middle name{" "}
                      <span className="font-normal text-gray-400">
                        (optional)
                      </span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="last_name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="username">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Username{" "}
                      <span className="font-normal text-gray-400">
                        (optional)
                      </span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Field>
                )}
              </form.Field>
            </div>

            <SectionHeading>Contact information</SectionHeading>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </Field>
              </div>

              <form.Field name="phone_number">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Phone number{" "}
                        <span className="font-normal text-gray-400">
                          (optional)
                        </span>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>
          </FieldGroup>
        </div>

        {/* ── Account settings ── */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <FieldGroup>
              <SectionHeading>Account settings</SectionHeading>

              <form.Field name="account_type">
                {(field) => (
                  <Field>
                    <FieldLabel>Account type</FieldLabel>
                    <Select
                      value={field.state.value || "user_account"}
                      onValueChange={(value) =>
                        field.handleChange(
                          value as "admin_account" | "user_account" | "super_admin_account" | "audit_account"
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value || "user_account"}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>

              <form.Field name="role_id">
                {(field) => (
                  <Field>
                    <FieldLabel>Role</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                      disabled={rolesQuery.isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            rolesQuery.isLoading
                              ? "Loading roles..."
                              : "Select a role"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No role</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </div>

          {/* ── Security Settings ── */}
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <form.Field name="mfa_enabled">
              {(field) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked === true)
                    }
                  />
                  <div>
                    <FieldLabel htmlFor={field.name}>Enable MFA</FieldLabel>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Require multi-factor authentication for this user.
                    </p>
                  </div>
                </Field>
              )}
            </form.Field>
          </div>

          {/* ── Account Status Info ── */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <FieldGroup>
              <SectionHeading>Account Status</SectionHeading>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Current Status
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {user.is_blocked ? "Blocked" : "Active"}
                  </p>
                </div>
              </div>
            </FieldGroup>
          </div>

          {/* ── Actions ── */}
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <Button
              type="submit"
              form="edit-user-form"
              className="w-full"
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending
                ? "Saving changes..."
                : "Save changes"}
            </Button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
            {submitError && (
              <p className="text-center text-xs text-red-600">{submitError}</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
