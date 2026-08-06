"use client";

import { use } from "react";
import PerformanceEvaluationForm from "@/systems/pam/components/papdf";

export default function AppraisalPdfPage({
  params,
}: {
  params: Promise<{ employee_id: string }>;
}) {
  const { employee_id } = use(params);

  // employee_id is available here if the form needs to be pre-filled
  // from a record lookup later on.
  return <PerformanceEvaluationForm />;
}