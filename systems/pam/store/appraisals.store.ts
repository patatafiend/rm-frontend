import { create } from "zustand";
import type { AppraisalRecord } from "@/systems/pam/types/appraisal";

interface Notification {
  id: number;
  milestone: string;
  rm_tran_no: number;
  message: string;
  read_at: string | null;
  created_at: string;
}

interface AppraisalsState {
  appraisals: AppraisalRecord[];
  total: number;
  notifications: Notification[];
  selectedStatus: string | null;
  isLoading: boolean;
  isRefetching: boolean;
  error: string | null;
  setAppraisals: (data: AppraisalRecord[], total: number) => void;
  setNotifications: (data: Notification[]) => void;
  setSelectedStatus: (status: string | null) => void;
  setLoading: (value: boolean) => void;
  setRefetching: (value: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppraisalsStore = create<AppraisalsState>((set) => ({
  appraisals: [],
  total: 0,
  notifications: [],
  selectedStatus: null,
  isLoading: false,
  isRefetching: false,
  error: null,
  setAppraisals: (data, total) => set({ appraisals: data, total }),
  setNotifications: (data) => set({ notifications: data }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setLoading: (value) => set({ isLoading: value }),
  setRefetching: (value) => set({ isRefetching: value }),
  setError: (error) => set({ error }),
}));
