import { create } from "zustand";
import type { AppraisalRecord } from "@/systems/pam/types/appraisal";

type ActiveTab = "third" | "fifth" | "extension" | "resolved";

interface AppraisalStore {
  selectedEmployee: AppraisalRecord | null;
  setSelectedEmployee: (record: AppraisalRecord | null) => void;

  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

export const useAppraisalStore = create<AppraisalStore>((set) => ({
  selectedEmployee: null,
  setSelectedEmployee: (record) =>
    set({ selectedEmployee: record, drawerOpen: record !== null }),

  activeTab: "third",
  setActiveTab: (tab) => set({ activeTab: tab }),

  drawerOpen: false,
  setDrawerOpen: (open) =>
    set((state) => ({
      drawerOpen: open,
      selectedEmployee: open ? state.selectedEmployee : null,
    })),
}));