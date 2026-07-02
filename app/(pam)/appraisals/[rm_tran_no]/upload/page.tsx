"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function UploadPage({
  params,
}: {
  params: Promise<{ rm_tran_no: string }>;
}) {
  const { rm_tran_no } = use(params);
  const router = useRouter();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          Upload appraisal file
        </h1>
        <p className="mt-0.5 text-sm text-gray-400">
          The direct upload flow is waiting on the backend presigned URL
          endpoint.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm">
        Upload is not available yet for RM {rm_tran_no}. Once the backend
        exposes the upload URL endpoint, this page will accept a file and return
        the generated file key to the detail view.
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => router.push(`/appraisals/${rm_tran_no}`)}
        >
          Back to detail
        </Button>
      </div>
    </div>
  );
}
