export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  mfa_required: boolean
  mfa_token?: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  username?: string
  phone_number?: string
  account_type: string
}

export interface RegisterResponse {
  id: number
  email: string
  first_name: string
  last_name: string
  account_type: string
}

export interface MfaSetupResponse {
  secret: string
  qr_uri: string
}

export interface MfaVerifyRequest {
  mfa_token: string
  code: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

// --- User ---
export interface User {
  id: number
  email: string
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  username: string | null
  phone_number: string | null
  profile_url: string | null
  account_type: string | null
  is_blocked: boolean
  mfa_enabled: boolean
  role_id: number | null
  company_id: number | null
  client_id: number | null
  created_at: string
  updated_at: string
}

export interface UserSummary {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  account_type: string | null
  is_blocked: boolean
}

export interface PaginatedResponse<T> {
  total: number
  page: number
  page_size: number
  items: T[]
}

// --- Device ---
export interface Device {
  id: number
  device_type: string | null
  os_name: string | null
  os_version: string | null
  browser_name: string | null
  browser_version: string | null
  ip_address: string | null
  is_trusted: boolean
  created_at: string
}

// --- API Error ---
export interface ApiError {
  detail: string | { msg: string; type: string }[]
}