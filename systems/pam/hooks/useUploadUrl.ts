"use client";

import { useState } from "react";
import { appraisalsApi } from "@/systems/pam/lib/api/appraisals";

interface UploadState {
  fileKey: string | null;
  fileName: string | null;
  uploading: boolean;
  error: string | null;
}

export function useUploadUrl(rmTranNo: number) {
  const [state, setState] = useState<UploadState>({
    fileKey: null,
    fileName: null,
    uploading: false,
    error: null,
  });

  async function upload(file: File): Promise<string | null> {
    setState((s) => ({ ...s, uploading: true, error: null }));
    try {
      const { upload_url, file_key } = await appraisalsApi.getUploadUrl(
        rmTranNo,
        file.type,
      );

      const res = await fetch(upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Upload failed (${res.status}): ${text || res.statusText}`,
        );
      }

      setState({
        fileKey: file_key,
        fileName: file.name,
        uploading: false,
        error: null,
      });
      return file_key;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setState((s) => ({ ...s, uploading: false, error: message }));
      return null;
    }
  }

  function reset() {
    setState({ fileKey: null, fileName: null, uploading: false, error: null });
  }

  return { ...state, upload, reset };
}
