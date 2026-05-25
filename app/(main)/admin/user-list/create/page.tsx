"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import * as z from "zod";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldAlert,
  UserRoundPlus,
} from "lucide-react";
import { usersApi } from "@/lib/api/users";
import { rolesApi } from "@/lib/api/roles";
import { clientsApi } from "@/lib/api/clients";
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
import type { AdminUserCreate, ClientSummary, Role } from "@/lib/types";

const ACCOUNT_TYPE_OPTIONS: Array<{
  value: AdminUserCreate["account_type"];
  label: string;
}> = [
  { value: "admin_account", label: "Admin" },
  { value: "user_account", label: "User" },
  { value: "super_admin_account", label: "Super admin" },
  { value: "audit_account", label: "Audit" },
];

const formSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z.string().min(8, "Minimum 8 characters"),
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
    company_id: z.string(),
    is_blocked: z.boolean(),
    allow_skip_mfa: z.boolean(),
  })
  .refine(
    (data) => data.account_type !== "admin_account" || !!data.company_id.trim(),
    {
      message: "Company ID is required for admin accounts",
      path: ["company_id"],
    },
  );

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

export default function CreateUserPage() {
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const rolesQuery = useQuery({
    queryKey: ["roles", "create-user"],
    queryFn: () => rolesApi.list(),
    staleTime: 10 * 60 * 1000,
  });

  const clientsQuery = useQuery({
    queryKey: ["clients", "create-user"],
    queryFn: () => clientsApi.list({ page: 1, page_size: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: AdminUserCreate) => usersApi.create(payload),
  });

  const roles = (rolesQuery.data ?? []) as Role[];
  const clients = useMemo<ClientSummary[]>(
    () => clientsQuery.data?.items ?? [],
    [clientsQuery.data],
  );

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      username: "",
      phone_number: "",
      account_type: "user_account" as AdminUserCreate["account_type"],
      role_id: "none",
      client_id: "none",
      company_id: "",
      is_blocked: false,
      allow_skip_mfa: false,
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      const payload: AdminUserCreate = {
        email: value.email.trim(),
        password: value.password,
        first_name: value.first_name.trim() || null,
        middle_name: value.middle_name?.trim() || null,
        last_name: value.last_name.trim() || null,
        username: value.username?.trim() || null,
        phone_number: value.phone_number?.trim() || null,
        account_type: value.account_type,
        role_id: value.role_id !== "none" ? Number(value.role_id) : null,
        client_id: value.client_id !== "none" ? Number(value.client_id) : null,
        company_id:
          value.account_type === "admin_account" && value.company_id
            ? Number(value.company_id)
            : null,
        is_blocked: value.is_blocked,
        allow_skip_mfa: value.allow_skip_mfa,
      };

      try {
        await createUserMutation.mutateAsync(payload);
        toast.success("User created successfully.");
        setCreatedEmail(payload.email);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to create user. Please try again.";
        toast.error(message);
        setSubmitError(message);
      }
    },
  });

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <section className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white">
              <UserRoundPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Admin
              </p>
              <h1 className="text-xl font-semibold text-gray-900">
                Create User
              </h1>
              <p className="text-sm text-gray-500">
                Add a new user account with role and client access.
              </p>
            </div>
          </div>
          <Link
            href="/admin/user-list"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to users list
          </Link>
        </div>
      </section>

      {/* ── Success banner ── */}
      {createdEmail && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <p className="flex-1 text-sm text-emerald-700">
            User <span className="font-semibold">{createdEmail}</span> was
            created successfully.
          </p>
          <button
            type="button"
            onClick={() => {
              form.reset();
              setCreatedEmail(null);
            }}
            className="text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
          >
            Create another
          </button>
        </div>
      )}

      <form
        id="create-user-form"
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

            <SectionHeading>Contact & credentials</SectionHeading>

            <div className="grid gap-4 md:grid-cols-2">
              <form.Field name="email">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        type="email"
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

            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Temporary password
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id={field.name}
                        type={showPassword ? "text" : "password"}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
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
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(
                          value as AdminUserCreate["account_type"],
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
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

              <form.Field name="client_id">
                {(field) => (
                  <Field>
                    <FieldLabel>Client</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                      disabled={clientsQuery.isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            clientsQuery.isLoading
                              ? "Loading clients..."
                              : "Select a client"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No client</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={String(client.id)}>
                            {client.client_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>

              <form.Subscribe selector={(state) => state.values.account_type}>
                {(accountType) =>
                  accountType === "admin_account" && (
                    <form.Field name="company_id">
                      {(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Company ID
                            </FieldLabel>
                            <Input
                              id={field.name}
                              type="number"
                              min={1}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        );
                      }}
                    </form.Field>
                  )
                }
              </form.Subscribe>
            </FieldGroup>
          </div>

          {/* ── MFA controls ── */}
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <form.Field name="allow_skip_mfa">
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
                    <FieldLabel htmlFor={field.name}>Allow skip MFA</FieldLabel>
                    <p className="text-xs text-gray-500 mt-0.5">
                      User can bypass multi-factor authentication when enabled.
                    </p>
                  </div>
                </Field>
              )}
            </form.Field>
          </div>

          {/* ── Block user ── */}
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <form.Field name="is_blocked">
              {(field) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked === true)
                    }
                    className="border-amber-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <div>
                    <FieldLabel
                      htmlFor={field.name}
                      className="flex items-center gap-1.5"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                      Block user on creation
                    </FieldLabel>
                    <p className="text-xs text-amber-700 mt-0.5">
                      User will be unable to sign in until unblocked.
                    </p>
                  </div>
                </Field>
              )}
            </form.Field>
          </div>

          {/* ── Actions ── */}
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <Button
              type="submit"
              form="create-user-form"
              className="w-full"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending
                ? "Creating user..."
                : "Create user"}
            </Button>
            <button
              type="button"
              onClick={() => {
                form.reset();
                setCreatedEmail(null);
                setSubmitError(null);
              }}
              className="w-full py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              Reset form
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
