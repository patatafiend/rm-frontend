import { ButtonHTMLAttributes } from "react"

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
}

export function FormButton({
  children,
  isLoading,
  loadingText = "Loading...",
  disabled,
  className,
  ...props
}: FormButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={className || "w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"}
    >
      {isLoading ? loadingText : children}
    </button>
  )
}
