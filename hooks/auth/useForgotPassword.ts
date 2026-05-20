import { useMutation } from "@tanstack/react-query"
import { authApi } from "@/lib/api/auth"
import type { ForgotPasswordRequest, ResetPasswordRequest } from "@/lib/types"

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
  })
}