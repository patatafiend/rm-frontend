export type AppraisalStatus =
  | "PENDING"
  | "FOR_REGULARIZATION"
  | "REGULARIZED"
  | "NON_REGULARIZED"
  | "NEEDS_REVIEW"
  | "RESOLVED_MANUAL";

export type ThirdMonthDecision = "PROCEED_5TH" | "NON_REGULARIZATION" | "NO_APPRAISAL";
export type FifthMonthDecision =
  | "REGULARIZATION"
  | "NON_REGULARIZATION"
  | "EXTENSION"
  | "NO_APPRAISAL";

// "EXTENSION" here means "extend again" within an extension record
export type ExtensionDecision =
  | "REGULARIZATION"
  | "NON_REGULARIZATION"
  | "EXTENSION";

export type FailsafeReason =
  | "NO_3RD_MONTH_APPRAISAL"
  | "NO_5TH_MONTH_DECISION"
  | "EXTENSION_UNRESOLVED";

export type ActiveMilestone =
  | "THIRD_MONTH"
  | "FIFTH_MONTH"
  | "EXTENSION"
  | "RESOLVED";

export type ExtensionRecord = {
  id: number;
  sequence: number;
  extension_until: string | null;
  granted_at: string | null;
  decision: ExtensionDecision | null;
  appraisal_file_key: string | null;
  decided_at: string | null;
};

export type AppraisalRecord = {
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

  sixth_month_check_date?: string | null;

  // Replaces the old flat extension_until / extension_final_decision / extension_decided_at
  extension_records: ExtensionRecord[];

  appraisal_status: AppraisalStatus;
  failsafe_reason?: FailsafeReason | null;
  failsafe_triggered_at?: string | null;
  confirmed_at?: string | null;
};

export interface ThirdMonthPayload {
  decision: ThirdMonthDecision;
  appraisal_file_key: string;
}

export interface FifthMonthPayload {
  decision: FifthMonthDecision;
  appraisal_file_key: string | undefined;
  extension_until?: string;
}

export interface ExtensionPayload {
  decision: ExtensionDecision;
  appraisal_file_key?: string;
  extension_until?: string;
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

export type SortKey = "employee" | "company" | "bu" | "dueDate" | "daysOverdue";
export type SortDirection = "asc" | "desc";
export type SortConfig = {
  key: SortKey;
  direction: SortDirection;
}

export type StatusFilter = "all" | "pending" | "overdue" | "done";
export type ResolvedStatusFilter = "all" | "REGULARIZED" | "NON_REGULARIZED" | "RESOLVED_MANUAL";

export type DueDateField =
  | "third_month_due_date"
  | "fifth_month_due_date"
  | "extension_until";

export type AppraisalTableProps = {
  records: AppraisalRecord[];
  dueDateField: DueDateField;
  dueDateLabel: string;
  resolvedOnly?: boolean;
}