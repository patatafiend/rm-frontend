import { useForm as useTanstackForm } from "@tanstack/react-form"

interface UseAuthFormOptions<T extends Record<string, any>> {
  defaultValues: T
  onSubmit: (data: T) => void | Promise<void>
}

export function useAuthForm<T extends Record<string, any>>({
  defaultValues,
  onSubmit,
}: UseAuthFormOptions<T>) {
  return useTanstackForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })
}
