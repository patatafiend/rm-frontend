"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { Role, RoleCreate, RoleUpdate } from "@/lib/types";
import { useAuthStore } from "@/store/auth.store";

const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  onSubmit: (data: RoleCreate | RoleUpdate) => Promise<void>;
  isLoading?: boolean;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  onSubmit,
  isLoading = false,
}: RoleFormDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditMode = !!role;
  const { user } = useAuthStore();

  const form = useForm({
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
    } as RoleFormData,
    onSubmit: async ({ value }) => {
      console.log(user?.company_id);
      setSubmitError(null);
      try {
        const payload = {
          name: value.name.trim(),
          description: value.description?.trim() || undefined,
          account_type: "company_account",
          company_id: user?.company_id,
        };
        await onSubmit(payload);
        form.reset();
        onOpenChange(false);
        toast.success(
          isEditMode
            ? "Role updated successfully"
            : "Role created successfully",
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        setSubmitError(message);
        toast.error(message);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Role" : "Create Role"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the role details"
              : "Create a new role for users"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="name">
            {(field) => (
              <Field>
                <FieldLabel>Role Name *</FieldLabel>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., Admin, Editor, Viewer"
                  disabled={isLoading}
                />
                {field.state.meta.errors && (
                  <FieldError>{field.state.meta.errors[0]}</FieldError>
                )}
              </Field>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Describe the purpose of this role"
                  rows={3}
                  disabled={isLoading}
                />
              </Field>
            )}
          </form.Field>

          {submitError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Role"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
