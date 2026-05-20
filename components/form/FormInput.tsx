import { InputHTMLAttributes } from "react"
import { FormField } from "./FormField"
import type { AnyFieldApi  } from "@tanstack/react-form"

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  field: AnyFieldApi 
  label?: string
  error?: string
}

export function FormInput({ field, label, error, ...inputProps }: FormInputProps) {
  return (
    <FormField field={field} label={label} error={error}>
      <input
        {...inputProps}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </FormField>
  )
}
