import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { useAuthStore } from "@/store/auth.store"

// Step 1 — get QR code
export function useMfaSetup() {
  return useMutation({ mutationFn: () => authApi.mfaSetup() })
}

// Step 2 — confirm setup with TOTP code
export function useMfaVerifySetup() {
  return useMutation({ mutationFn: (code: string) => authApi.mfaVerifySetup(code) })
}

// During login — verify TOTP after password step
export function useMfaVerify() {
  const router = useRouter()
  const { setTokens } = useAuthStore()

  return useMutation({
    mutationFn: () => {
      const mfa_token = sessionStorage.getItem("mfa_token") ?? ""
      return authApi.mfaVerify({ mfa_token, code: "" }) // code passed at call site
    },
    onSuccess: (res) => {
      sessionStorage.removeItem("mfa_token")
      setTokens(res.access_token, res.refresh_token)
      router.push("/dashboard")
    },
  })
}

// Disable MFA
export function useMfaDisable() {
  return useMutation({ mutationFn: (code: string) => authApi.mfaDisable(code) })
}