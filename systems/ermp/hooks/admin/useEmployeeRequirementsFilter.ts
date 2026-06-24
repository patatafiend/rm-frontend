"use client";

import { useMemo, useCallback } from "react";
import { useEmployeeRequirementsStore } from "@/systems/ermp/store/employee-requirements.store";
import { MinorReqCompleteness } from "@/systems/ermp/store/employee-requirements.store";

export function useEmployeeRequirementsFilter() {
  const store = useEmployeeRequirementsStore();

  const reqStatus = useMemo(() => {
    const statusMap = new Map();
    store.filteredRequirements.forEach((emp) => {
      const status = store.reqStatusCache.get(emp);
      statusMap.set(emp.rm_tran_no, status);
    });
    return statusMap;
  }, [store.filteredRequirements, store.reqStatusCache]);

  const allMissingRequirements = useMemo(() => {
    const missingSet = new Set<string>();
    store.filteredRequirements.forEach((emp) => {
      const status = store.reqStatusCache.get(emp);
      status.missing.forEach((req) => missingSet.add(req));
    });
    return Array.from(missingSet).sort();
  }, [store.filteredRequirements, store.reqStatusCache]);

  const stats = useMemo(() => {
    const stats = {
      total: store.filteredRequirements.length,
      complete: 0,
      incomplete: 0,
    };

    store.filteredRequirements.forEach((emp) => {
      const status = store.reqStatusCache.get(emp);
      if (status.complete) {
        stats.complete++;
      } else {
        stats.incomplete++;
      }
    });

    return stats;
  }, [store.filteredRequirements, store.reqStatusCache]);

  const setReqCompleteness = useCallback(
    (filter: MinorReqCompleteness) => {
      store.setMinorReqCompletenessFilter(filter);
    },
    [store],
  );

  const setMissingRequirement = useCallback(
    (req: string | null) => {
      store.setMinorReqSpecificFilter(req);
    },
    [store],
  );

  const clearReqFilters = useCallback(() => {
    store.setMinorReqCompletenessFilter("all");
    store.setMinorReqSpecificFilter(null);
  }, [store]);

  const currentFilters = useMemo(
    () => ({
      completeness: store.filters.minorReqCompleteness,
      specific: store.filters.minorReqSpecific,
    }),
    [store.filters.minorReqCompleteness, store.filters.minorReqSpecific],
  );

  return {
    reqStatus,
    stats,
    currentFilters,
    allMissingRequirements,

    setReqCompleteness,
    setMissingRequirement,
    clearReqFilters,

    store,
  };
}
