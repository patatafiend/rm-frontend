"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useEmployeeRequirementsStore } from "@/store/employee-requirements.store";
import { User, Briefcase, CreditCard, ClipboardCheck } from "lucide-react";
import type { EmployeeRequirement } from "@/lib/types";

function getRequirementStatus(
  employee: EmployeeRequirement,
): "Incomplete" | "Completed" {
  const isIncomplete =
    !employee.rm_sss_no || !employee.rm_pagibig_no || !employee.rm_phhealth;
  return isIncomplete ? "Incomplete" : "Completed";
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-sm font-medium text-gray-900 ${mono ? "font-mono" : ""}`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <div className="p-1.5 rounded-md bg-gray-50 border border-gray-200">
          <Icon className="w-3.5 h-3.5 text-gray-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function EmployeeRequirementsDrawer() {
  const { selectedEmployee, setSelectedEmployee } =
    useEmployeeRequirementsStore();

  const open = !!selectedEmployee;

  if (!selectedEmployee) return null;

  const {
    rm_first_name,
    rm_middle_name,
    rm_lastname,
    rm_other_name,
    erms_id,
    hr_company,
    hr_client,
    rm_pos_applied,
    emp_status,
    bu_tagging,
    contract_sdate,
    rm_sss_no,
    rm_pagibig_no,
    rm_phhealth,
    minor_iss_date,
    rm_tran_no,
  } = selectedEmployee;

  const reqStatus = getRequirementStatus(selectedEmployee);

  return (
    <Drawer
      open={open}
      direction="right"
      onOpenChange={(isOpen) => {
        if (!isOpen) setSelectedEmployee(null);
      }}
    >
      <DrawerContent className="max-h-[92dvh]">
        {/* Handle */}
        <div className="mx-auto mt-2 mb-1 h-1.5 w-10 rounded-full bg-gray-200" />

        <div className="overflow-y-auto px-6 pb-8">
          {/* Header */}
          <DrawerHeader className="px-0 pt-4 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DrawerTitle className="text-base font-semibold text-gray-900">
                  {rm_first_name} {rm_lastname}
                </DrawerTitle>
                <DrawerDescription className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                    #{rm_tran_no}
                  </span>
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                    ERMS {erms_id}
                  </span>
                </DrawerDescription>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${
                  reqStatus === "Incomplete"
                    ? "bg-amber-50 text-amber-700 border-amber-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-100"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    reqStatus === "Incomplete"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />
                {reqStatus}
              </span>
            </div>
          </DrawerHeader>

          <div className="space-y-8">
            {/* Personal Information */}
            <Section icon={User} title="Personal Information">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="First Name" value={rm_first_name} />
                <Field label="Middle Name" value={rm_middle_name} />
                <Field label="Last Name" value={rm_lastname} />
                <Field label="Other Name" value={rm_other_name} />
              </div>
            </Section>

            {/* Employment Information */}
            <Section icon={Briefcase} title="Employment Information">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="Company" value={hr_company} />
                <Field label="Client" value={hr_client} />
                <Field label="Position Applied" value={rm_pos_applied} />
                <Field
                  label="Employment Status"
                  value={
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {emp_status}
                    </span>
                  }
                />
                <Field label="BU Tagging" value={bu_tagging} />
                <Field
                  label="Contract Start Date"
                  value={new Date(contract_sdate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                />
              </div>
            </Section>

            {/* Government IDs */}
            <Section icon={CreditCard} title="Government IDs">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="SSS No." value={rm_sss_no} mono />
                <Field label="Pag-IBIG No." value={rm_pagibig_no} mono />
                <Field label="PhilHealth No." value={rm_phhealth} mono />
              </div>
            </Section>

            {/* Requirements */}
            <Section icon={ClipboardCheck} title="Requirements Submitted">
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  {selectedEmployee.minor_reqs_list &&
                  selectedEmployee.minor_reqs_list.length > 0 ? (
                    <ul className="space-y-1.5">
                      {selectedEmployee.minor_reqs_list.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-sm text-gray-700 leading-relaxed">
                            {req}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No requirements submitted.
                    </p>
                  )}
                </div>

                {minor_iss_date && (
                  <Field
                    label="Issue Date"
                    value={new Date(minor_iss_date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  />
                )}
              </div>
            </Section>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
