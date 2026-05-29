"use client";

import { useMemo, useCallback } from "react";
import { useEmployeeRequirementsStore } from "@/store/employee-requirements.store";
import { MinorReqCompleteness } from "@/store/employee-requirements.store";

/**
 * Custom hook for filtering employees by minor requirement completeness and specific requirements.
 * Provides convenient methods to set filters while handling store state updates.
 */
export function useEmployeeRequirementsFilter() {
  const store = useEmployeeRequirementsStore();

  // Get computed data for UI display
  const reqStatus = useMemo(() => {
    // Map of employee ID to their requirement status
    const statusMap = new Map();
    store.filteredRequirements.forEach((emp) => {
      const status = store.reqStatusCache.get(emp);
      statusMap.set(emp.rm_tran_no, status);
    });
    return statusMap;
  }, [store.filteredRequirements, store.reqStatusCache]);

  // Get all missing requirements across filtered employees (for filter dropdown)
  const allMissingRequirements = useMemo(() => {
    const missingSet = new Set<string>();
    store.filteredRequirements.forEach((emp) => {
      const status = store.reqStatusCache.get(emp);
      status.missing.forEach((req) => missingSet.add(req));
    });
    return Array.from(missingSet).sort();
  }, [store.filteredRequirements, store.reqStatusCache]);

  // Get summary statistics
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

  // Action: Set minor requirement completeness filter
  const setReqCompleteness = useCallback(
    (filter: MinorReqCompleteness) => {
      store.setMinorReqCompletenessFilter(filter);
    },
    [store],
  );

  // Action: Set specific missing requirement filter
  const setMissingRequirement = useCallback(
    (req: string | null) => {
      store.setMinorReqSpecificFilter(req);
    },
    [store],
  );

  // Action: Clear both requirement filters
  const clearReqFilters = useCallback(() => {
    store.setMinorReqCompletenessFilter("all");
    store.setMinorReqSpecificFilter(null);
  }, [store]);

  // Get current filter values
  const currentFilters = useMemo(
    () => ({
      completeness: store.filters.minorReqCompleteness,
      specific: store.filters.minorReqSpecific,
    }),
    [store.filters.minorReqCompleteness, store.filters.minorReqSpecific],
  );

  return {
    // State
    reqStatus,
    stats,
    currentFilters,
    allMissingRequirements,

    // Actions
    setReqCompleteness,
    setMissingRequirement,
    clearReqFilters,

    // Store reference (if direct access needed)
    store,
  };
}
