import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { useAuthStore } from "@/store/auth.store"
import type { LoginRequest } from "@/lib/types"

export function useLogin() {
  const router = useRouter()
  const { setTokens, setUser } = useAuthStore() // add setUser

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (res) => {
      if (res.mfa_required && res.mfa_token) {
        sessionStorage.setItem("mfa_token", res.mfa_token)
        router.push("/login/mfa")
        return
      }
      setTokens(res.access_token, res.refresh_token)
      setUser(res.user)
      router.push("/")
    },
  })
}