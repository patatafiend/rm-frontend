export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  mfa_required: boolean;
  mfa_token?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username?: string;
  phone_number?: string;
  account_type: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  account_type: string;
}

export interface MfaSetupResponse {
  secret: string;
  qr_uri: string;
}

export interface MfaVerifyRequest {
  mfa_token: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// --- User ---
export interface User {
  id: number;
  email: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  username: string | null;
  phone_number: string | null;
  profile_url: string | null;
  account_type: string | null;
  is_blocked: boolean;
  mfa_enabled: boolean;
  role_id: number | null;
  company_id: number | null;
  client_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserSummary {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  account_type: string | null;
  is_blocked: boolean;
  role_id?: number | null;
}

export interface AdminUserCreate {
  email: string;
  password: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  phone_number?: string | null;
  profile_url?: string | null;
  account_type:
    | "admin_account"
    | "user_account"
    | "super_admin_account"
    | "audit_account";
  role_id?: number | null;
  company_id?: number | null;
  client_id?: number | null;
  is_blocked?: boolean;
  allow_skip_mfa?: boolean;
}

export interface AdminUserUpdate {
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  phone_number?: string | null;
  profile_url?: string | null;
  role_id?: number | null;
  account_type?:
    | "admin_account"
    | "user_account"
    | "super_admin_account"
    | "audit_account";
  mfa_enabled?: boolean;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  account_type: string;
  company_id: number | null;
  client_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  resource: string;
  action: string;
  description: string | null;
}

export interface RoleCreate {
  name: string;
  description?: string;
}

export interface RoleUpdate {
  name?: string;
  description?: string;
}

export interface RolePermissionRead {
  id: number;
  role_id: number;
  permission_id: number;
  permission: Permission;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  items: T[];
}

export type UsersListResponse = PaginatedResponse<UserSummary>;
export type UserCreateResponse = User;

export interface ClientSummary {
  id: number;
  client_name: string;
  client_email: string;
  system_type: string;
  status: string;
  is_blocked: boolean;
  company_id: number;
}

export type PaginatedClients = PaginatedResponse<ClientSummary>;

// --- Device ---
export interface Device {
  id: number;
  device_type: string | null;
  os_name: string | null;
  os_version: string | null;
  browser_name: string | null;
  browser_version: string | null;
  ip_address: string | null;
  is_trusted: boolean;
  created_at: string;
}

// --- Employee Requirements ---
export interface EmployeeRequirement {
  rm_tran_no: number;
  erms_id: number;
  rm_lastname: string;
  rm_first_name: string;
  rm_middle_name: string;
  rm_other_name: string;
  hr_company: string;
  hr_client: string;
  rm_pos_applied: string;
  emp_status: string;
  bu_tagging: string;
  contract_sdate: string;
  rm_sss_no: string;
  rm_pagibig_no: string;
  rm_phhealth: string;
  minor_reqs: string;
  minor_iss_date: string;
}

export interface EmployeeRequirementsResponse {
  status: "success" | "error";
  total: number;
  data: EmployeeRequirement[];
}

// --- API Error ---
export interface ApiError {
  detail: string | { msg: string; type: string }[];
}
