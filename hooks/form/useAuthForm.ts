import { useForm as useTanstackForm } from "@tanstack/react-form";
import { toast } from "sonner";

interface FastAPIError {
  detail: { loc: string[]; msg: string }[];
}

interface UseAuthFormOptions<T extends object> {
  defaultValues: T;
  onSubmit: (data: T) => void | Promise<void>;
}

export function useAuthForm<T extends object>({
  defaultValues,
  onSubmit,
}: UseAuthFormOptions<T>) {
  return useTanstackForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        await onSubmit(value);
      } catch (err) {
        if (err instanceof Response) {
          const body: FastAPIError = await err.json();

          if (Array.isArray(body.detail)) {
            body.detail.forEach(({ loc, msg }) => {
              const field = loc[loc.length - 1];
              toast.error(`${field}: ${msg}`);
            });
          } else {
            toast.error("Something went wrong");
          }
        } else {
          toast.error("Something went wrong");
        }
      }
    },
  });
}
