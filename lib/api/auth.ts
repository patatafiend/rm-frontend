import { apiClient } from "./client"
import type {
  LoginRequest, LoginResponse,
  RegisterRequest, RegisterResponse,
  MfaSetupResponse, MfaVerifyRequest,
  ForgotPasswordRequest, ResetPasswordRequest,
} from "@/lib/types"

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<RegisterResponse>("/auth/register", data).then((r) => r.data),

  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>("/auth/login", data).then((r) => r.data),

  logout: (refresh_token: string) =>
    apiClient.post("/auth/logout", { refresh_token }).then((r) => r.data),

  refreshToken: (refresh_token: string) =>
    apiClient.post<{ access_token: string }>("/auth/refresh-token", { refresh_token }).then((r) => r.data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post("/auth/forgot-password", data).then((r) => r.data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post("/auth/reset-password", data).then((r) => r.data),

  // MFA
  mfaSetup: () =>
    apiClient.post<MfaSetupResponse>("/auth/mfa/setup").then((r) => r.data),

  mfaVerifySetup: (code: string) =>
    apiClient.post("/auth/mfa/verify-setup", { code }).then((r) => r.data),

  mfaVerify: (data: MfaVerifyRequest) =>
    apiClient.post<LoginResponse>("/auth/mfa/verify", data).then((r) => r.data),

  mfaDisable: (code: string) =>
    apiClient.post("/auth/mfa/disable", { code }).then((r) => r.data),
}