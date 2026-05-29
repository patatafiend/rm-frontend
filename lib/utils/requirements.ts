import { EmployeeRequirement } from "../types";

/**
 
 */
export const UNIVERSAL_REQUIRED_REQS = [
  "Authority to Deduct", // Mandatory for salary deductions (SSS, Pagibig, PhilHealth)
  "CDI Affidavit", // Common Philippines requirement for employment
  "Certificate, Birth", // Identity verification (mandatory)
  "Certificate, Employment", // Employment history reference
  "Certificate, Training", // Onboarding or induction training
  "Clearance, Barangay", // Standard Philippines government clearance
  "Diploma, College", // Education credential (if applicable)
  "Diploma, High School", // Minimum education requirement
  "Job Description", // Role definition (mandatory)
  "Medical, CBC", // Complete blood count - basic medical screening
  "Medical, Urinalysis", // Standard medical test
  "Policy Acknowledgement Form", // Mandatory onboarding document
  "TIN Number", // Tax identification (mandatory in Philippines)
  "Transcript of Records", // Educational background verification
];

/**
 * Template for company-specific requirements.
 * Map company name to array of additional required documents.
 * Extend this as you identify company-specific requirements.
 */
export const COMPANY_SPECIFIC_REQS: Record<string, string[]> = {
  "E-MOBILE MATRIX LOGISTICS CORPORATION": [
    "Endorsement Letter (for Emobile Drivers)",
  ],
  // Add more companies and their specific requirements here
  // "COMPANY_NAME": ["Requirement 1", "Requirement 2"],
};

/**
 * Result type for minor requirement status computation.
 * Tracks which requirements have been provided, are missing, or are unknown.
 */
export interface MinorReqStatus {
  /** Requirements the employee has submitted/provided */
  provided: string[];
  /** Universal requirements not yet submitted */
  missing: string[];
  /** Submitted requirements not in our known universal list (future-proofing) */
  unknown: string[];
  /** True only if all universal requirements are present */
  complete: boolean;
}

/**
 * ProcessedEmployee extends EmployeeRequirement with a typed array of minor requirements.
 * This is the deduplicated employee type with parsed minor requirements.
 */
export interface ProcessedEmployee extends EmployeeRequirement {
  /** Parsed array of minor requirements (deduplicated from API semicolon-delimited string) */
  minor_reqs_list: string[];
}

/**
 * Compute the status of an employee's minor requirements.
 * Identifies which universal requirements are provided, missing, or unknown.
 *
 * @param employee - The processed employee with minor_reqs_list array
 * @returns Object with provided, missing, unknown, and complete status
 */
export function computeMinorReqStatus(
  employee: ProcessedEmployee
): MinorReqStatus {
  const provided = employee.minor_reqs_list;
  const providedSet = new Set(provided);

  // Find missing universal requirements
  const missing = UNIVERSAL_REQUIRED_REQS.filter(
    (req) => !providedSet.has(req)
  );

  // Find unknown requirements (submitted but not in our universal list)
  const universalSet = new Set(UNIVERSAL_REQUIRED_REQS);
  const unknown = provided.filter((req) => !universalSet.has(req));

  // Complete only if all universal requirements are present
  const complete = missing.length === 0;

  return {
    provided,
    missing,
    unknown,
    complete,
  };
}

/**
 * Memoized cache for requirement status to avoid recomputation.
 * Maps employee ID (rm_tran_no) to cached status.
 */
export class MinorReqStatusCache {
  private cache = new Map<number, MinorReqStatus>();

  /**
   * Get or compute the requirement status for an employee.
   * Returns cached result if available, otherwise computes and caches it.
   */
  get(employee: ProcessedEmployee): MinorReqStatus {
    const cached = this.cache.get(employee.rm_tran_no);
    if (cached) {
      return cached;
    }

    const status = computeMinorReqStatus(employee);
    this.cache.set(employee.rm_tran_no, status);
    return status;
  }

  /**
   * Clear the cache (call when employee data is refreshed).
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate cache for a specific employee.
   */
  invalidate(employeeId: number): void {
    this.cache.delete(employeeId);
  }
}
