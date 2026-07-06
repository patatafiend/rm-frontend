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

  detail(rmTranNo: number): Promise<AppraisalListResponse["data"][number]> {
    return apiClient.get(`/appraisals/${rmTranNo}`).then(({ data }) => data);
  },

  submitThirdMonth(rmTranNo: number, body: ThirdMonthPayload) {
    return apiClient
      .post(`/appraisals/${rmTranNo}/third-month`, body)
      .then(({ data }) => data);
  },

  submitFifthMonth(rmTranNo: number, body: FifthMonthPayload) {
    return apiClient
      .post(`/appraisals/${rmTranNo}/fifth-month`, body)
      .then(({ data }) => data);
  },

  submitExtension(rmTranNo: number, body: ExtensionPayload) {
    return apiClient
      .post(`/appraisals/${rmTranNo}/extension-decision`, body)
      .then(({ data }) => data);
  },

  getUploadUrl(rmTranNo: number): Promise<UploadUrlResponse> {
    return apiClient
      .post(`/appraisals/${rmTranNo}/upload-url`, {})
      .then(({ data }) => data);
  },

  getDownloadUrl(
    rmTranNo: number,
    fileKey: string,
  ): Promise<DownloadUrlResponse> {
    return apiClient
      .get(`/appraisals/${rmTranNo}/files/${fileKey}/download-url`)
      .then(({ data }) => data);
  },

  notifications(unread = true) {
    return apiClient
      .get("/notifications", { params: { unread } })
      .then(({ data }) => data);
  },
};
