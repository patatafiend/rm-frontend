"use client";

import { use } from "react";
import PerformanceEvaluationForm from "@/systems/pam/components/papdf";

export default function AppraisalPdfPage({
  params,
}: {
  params: Promise<{ rm_tran_no: string }>;
}) {
  const { rm_tran_no } = use(params);

  // rm_tran_no is available here if the form needs to be pre-filled
  // from a record lookup later on.
  return <PerformanceEvaluationForm />;
}