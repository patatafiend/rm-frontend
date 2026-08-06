import { apiClient } from "@/systems/ap/lib/api/client";
import type {
  AppraisalListResponse,
  DownloadUrlResponse,
  ExtensionPayload,
  FifthMonthPayload,
  ThirdMonthPayload,
  UploadUrlResponse,
} from "@/systems/pam/types/appraisal";

export const appraisalsApi = {
  list(status?: string): Promise<AppraisalListResponse> {
    return apiClient
      .get("/appraisals", {
        params: status ? { status } : undefined,
      })
      .then(({ data }) => data);
  },

  detail(employeeId: number): Promise<AppraisalListResponse["data"][number]> {
    return apiClient.get(`/appraisals/${employeeId}`).then(({ data }) => data);
  },

  submitThirdMonth(employeeId: number, body: ThirdMonthPayload) {
    return apiClient
      .post(`/appraisals/${employeeId}/third-month`, body)
      .then(({ data }) => data);
  },

  submitFifthMonth(employeeId: number, body: FifthMonthPayload) {
    return apiClient
      .post(`/appraisals/${employeeId}/fifth-month`, body)
      .then(({ data }) => data);
  },

  submitExtension(employeeId: number, body: ExtensionPayload) {
    return apiClient
      .post(`/appraisals/${employeeId}/extension-decision`, body)
      .then(({ data }) => data);
  },

  getUploadUrl(
    employeeId: number,
    contentType: string,
  ): Promise<UploadUrlResponse> {
    return apiClient
      .post(
        `/appraisals/${employeeId}/upload-url`,
        {},
        {
          params: { contentType: contentType },
        },
      )
      .then(({ data }) => data);
  },

  getDownloadUrl(
    employeeId: number,
    fileKey: string,
  ): Promise<DownloadUrlResponse> {
    return apiClient
      .get(`/appraisals/${employeeId}/files/${fileKey}/download-url`)
      .then(({ data }) => data);
  },

  notifications(unread = true) {
    return apiClient
      .get("/notifications", { params: { unread } })
      .then(({ data }) => data);
  },
};
