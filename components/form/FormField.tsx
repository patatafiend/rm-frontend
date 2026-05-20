import { ReactNode } from "react"
import type { AnyFieldApi  } from "@tanstack/react-form"

interface FormFieldProps {
  field: AnyFieldApi 
  children: ReactNode
  label?: string
  error?: string
}

export function FormField({ field, children, label, error }: FormFieldProps) {
  const fieldError = field.state.meta.errors[0]
  
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      {children}
      {(fieldError || error) && (
        <p className="text-xs text-destructive">{fieldError || error}</p>
      )}
    </div>
  )
}
