import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { useAuthStore } from "@/store/auth.store"

export function useLogout() {
  const router = useRouter()
  const { refreshToken, clear } = useAuthStore()

  return useMutation({
    mutationFn: () => authApi.logout(refreshToken!),
    onSettled: () => {
      clear()
      router.push("/login")
    },
  })
}