"use client";

import { UploadCloud } from "lucide-react";

export function FileUploadZone() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
      <UploadCloud className="h-8 w-8 text-gray-300" />
      <p className="font-medium text-gray-700">
        Direct upload is not wired yet
      </p>
      <p className="max-w-sm text-xs text-gray-400">
        This will become the browser-to-S3 upload surface once the backend
        returns presigned upload URLs.
      </p>
    </div>
  );
}
