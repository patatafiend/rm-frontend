export type AppraisalStatus =
  | "PENDING"
  | "FOR_REGULARIZATION"
  | "REGULARIZED"
  | "NON_REGULARIZED"
  | "NEEDS_REVIEW"
  | "RESOLVED_MANUAL";

export type ThirdMonthDecision = "PROCEED_5TH" | "NON_REGULARIZATION";
export type FifthMonthDecision =
  | "REGULARIZATION"
  | "NON_REGULARIZATION"
  | "EXTENSION";
export type ExtensionDecision = "REGULARIZATION" | "NON_REGULARIZATION";

export type FailsafeReason =
  | "NO_3RD_MONTH_APPRAISAL"
  | "NO_5TH_MONTH_DECISION"
  | "EXTENSION_UNRESOLVED";

export type ActiveMilestone =
  | "THIRD_MONTH"
  | "FIFTH_MONTH"
  | "EXTENSION"
  | "RESOLVED";

export interface AppraisalRecord {
  rm_tran_no: number;
  erms_id: number;
  employee_name?: string;
  rm_lastname?: string;
  rm_first_name?: string;
  rm_middle_name?: string;
  hr_company?: string;
  hr_client?: string;
  bu_tagging: string;
  rm_pos_applied?: string;
  contract_sdate: string;

  third_month_due_date?: string | null;
  third_month_decision?: ThirdMonthDecision | null;
  third_month_appraisal_file_key?: string | null;
  third_month_decided_at?: string | null;
  third_month_notified_at?: string | null;

  fifth_month_due_date?: string | null;
  fifth_month_decision?: FifthMonthDecision | null;
  fifth_month_appraisal_file_key?: string | null;
  fifth_month_decided_at?: string | null;
  fifth_month_notified_at?: string | null;

  extension_until?: string | null;
  extension_final_decision?: ExtensionDecision | null;
  extension_decided_at?: string | null;

  appraisal_status: AppraisalStatus;
  failsafe_reason?: FailsafeReason | null;
  failsafe_triggered_at?: string | null;
  confirmed_at?: string | null;
}

export interface ThirdMonthPayload {
  decision: ThirdMonthDecision;
  appraisal_file_key: string;
}

export interface FifthMonthPayload {
  decision: FifthMonthDecision;
  appraisal_file_key: string;
  extension_until?: string;
}

export interface ExtensionPayload {
  decision: ExtensionDecision;
}

export interface AppraisalListResponse {
  status: "success";
  total: number;
  data: AppraisalRecord[];
}

export interface UploadUrlResponse {
  upload_url: string;
  file_key: string;
}

export interface DownloadUrlResponse {
  download_url: string;
}

// Derives which tab a record belongs to — used for client-side tab splitting
export function getMilestoneTab(
  record: AppraisalRecord,
): "third" | "fifth" | "extension" {
  if (record.fifth_month_decision === "EXTENSION") return "extension";
  if (record.third_month_decision === "PROCEED_5TH") return "fifth";
  return "third";
}

// Derives the currently active (pending) milestone for the action panel
export function getActiveMilestone(record: AppraisalRecord): ActiveMilestone {
  if (
    record.appraisal_status === "REGULARIZED" ||
    record.appraisal_status === "NON_REGULARIZED" ||
    record.appraisal_status === "RESOLVED_MANUAL"
  ) {
    return "RESOLVED";
  }
  if (record.fifth_month_decision === "EXTENSION") return "EXTENSION";
  if (record.third_month_decision === "PROCEED_5TH") return "FIFTH_MONTH";
  return "THIRD_MONTH";
}