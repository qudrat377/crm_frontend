"use client";
import {
  useQuery, useMutation, useQueryClient, keepPreviousData,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";
import {
  branchesApi, coursesApi, studentsApi, teachersApi,
  groupsApi, paymentsApi, attendanceApi, leadsApi, usersApi,
} from "@/lib/api";

const S2  = 2  * 60 * 1000;
const S5  = 5  * 60 * 1000;
const S10 = 10 * 60 * 1000;

// --- Branches ---
export const useBranches = () => useQuery({
  queryKey: ["branches"],
  queryFn: async () => (await branchesApi.getAll()).data.data,
  staleTime: S10,
});

export const useBranch = (id: string) => useQuery({
  queryKey: ["branches", id],
  queryFn: async () => (await branchesApi.getById(id)).data.data,
  enabled: !!id, staleTime: S10,
});

export const useBranchStats = (id: string) => useQuery({
  queryKey: ["branches", id, "stats"],
  queryFn: async () => (await branchesApi.getStats(id)).data,
  enabled: !!id, staleTime: S5,
});

// --- Courses ---
export const useCourses = (branchId?: string) => useQuery({
  queryKey: ["courses", branchId],
  queryFn: async () => (await coursesApi.getAll(branchId)).data.data,
  enabled: !!branchId, staleTime: S10,
});

// --- Students ---
export const useStudents = (params?: Record<string, any>) => useQuery({
  queryKey: ["students", params],
  queryFn: async () => (await studentsApi.getAll(params)).data.data,
  placeholderData: keepPreviousData,
  staleTime: S2,
});

export const useStudent = (id: string) => useQuery({
  queryKey: ["students", id],
  queryFn: async () => (await studentsApi.getById(id)).data.data,
  enabled: !!id, staleTime: S5,
});

// --- Teachers ---
export const useTeachers = (params?: Record<string, any>) => useQuery({
  queryKey: ["teachers", params],
  queryFn: async () => (await teachersApi.getAll(params)).data.data,
  placeholderData: keepPreviousData,
  staleTime: S5,
});

export const useTeacher = (id: string) => useQuery({
  queryKey: ["teachers", id],
  queryFn: async () => (await teachersApi.getById(id)).data.data,
  enabled: !!id, staleTime: S5,
});

// --- Groups ---
export const useGroups = (params?: Record<string, any>) => useQuery({
  queryKey: ["groups", params],
  queryFn: async () => (await groupsApi.getAll(params)).data.data,
  placeholderData: keepPreviousData,
  staleTime: S5,
});

export const useGroup = (id: string) => useQuery({
  queryKey: ["groups", id],
  queryFn: async () => (await groupsApi.getById(id)).data.data,
  enabled: !!id, staleTime: S5,
});

// --- Payments ---
export const usePayments = (params?: Record<string, any>) => useQuery({
  queryKey: ["payments", params],
  queryFn: async () => (await paymentsApi.getAll(params)).data.data,
  placeholderData: keepPreviousData,
  staleTime: S2,
});

export const useRevenue = (branchId: string, year?: number) => useQuery({
  queryKey: ["revenue", branchId, year],
  queryFn: async () => (await paymentsApi.getRevenue(branchId, year)).data.data,
  enabled: !!branchId, staleTime: S5,
});

export const useDebts = (params?: Record<string, any>) => useQuery({
  queryKey: ["debts", params],
  queryFn: async () => (await paymentsApi.getDebts(params)).data.data,
  staleTime: S2,
});

export const useSalaries = (params?: Record<string, unknown>) => useQuery({
  queryKey: ["salaries", params],
  queryFn: async () => (await paymentsApi.getSalaries(params)).data.data,
  staleTime: S5,
});

// --- Attendance ---
export const useAttendance = (params?: Record<string, any>) => useQuery({
  queryKey: ["attendance", params],
  queryFn: async () => (await attendanceApi.getAll(params)).data.data,
  staleTime: S2,
});

// --- Leads ---
export const useLeads = (params?: Record<string, any>) => useQuery({
  queryKey: ["leads", params],
  queryFn: async () => (await leadsApi.getAll(params)).data.data,
  placeholderData: keepPreviousData,
  staleTime: S2,
});

export const useLead = (id: string) => useQuery({
  queryKey: ["leads", id],
  queryFn: async () => (await leadsApi.getById(id)).data.data,
  enabled: !!id,
});

export const usePipelineSummary = (branchId?: string) => useQuery({
  queryKey: ["pipeline-summary", branchId],
  queryFn: async () => (await leadsApi.getPipelineSummary(branchId) as any).data.data,
  staleTime: S2,
});

// --- Users ---
export const useUsers = (
  params?: { search?: string; limit?: number; page?: number; role?: string }
) => useQuery({
  queryKey: ["users", params],
  queryFn: async () => (await usersApi.getAll(params)).data.data,
  placeholderData: keepPreviousData,
  staleTime: S2,
});

// --- Mutation wrapper ---
export function useMutationWithToast<TData, TVariables>(
  mutationFn: (vars: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    successMessage?: string;
    invalidateKeys?: string[];
  },
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      if (options?.successMessage) toast.success(options.successMessage);
      options?.invalidateKeys?.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      options?.onSuccess?.(data);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}




// "use client";
// import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
// import toast from "react-hot-toast";
// import { getErrorMessage } from "@/lib/utils";
// import {
//   branchesApi, coursesApi, studentsApi, teachersApi,
//   groupsApi, paymentsApi, attendanceApi, leadsApi, usersApi
// } from "@/lib/api";
 
// // ─── Global staleTime ───────────────────────────────────────────
// // Providers da ham 5 daqiqa, shu bilan mos
// const DEFAULT_STALE_TIME = 5 * 60 * 1000;
 
// // --- Branches ---
// export const useBranches = () => useQuery({
//   queryKey: ["branches"],
//   queryFn: async () => (await branchesApi.getAll()).data.data,
//   staleTime: DEFAULT_STALE_TIME,
// });
 
// export const useBranch = (id: string) => useQuery({
//   queryKey: ["branches", id],
//   queryFn: async () => (await branchesApi.getById(id)).data.data,
//   enabled: !!id,
//   staleTime: DEFAULT_STALE_TIME,
// });
 
// export const useBranchStats = (id: string) => useQuery({
//   queryKey: ["branches", id, "stats"],
//   queryFn: async () => (await branchesApi.getStats(id)).data,
//   enabled: !!id,
// });
 
// // --- Courses ---
// export const useCourses = (branchId?: string) => useQuery({
//   queryKey: ["courses", branchId],
//   queryFn: async () => (await coursesApi.getAll(branchId)).data.data,
//   enabled: !!branchId,
//   staleTime: DEFAULT_STALE_TIME,
// });
 
// // --- Students ---
// export const useStudents = (params?: Record<string, any>) => useQuery({
//   queryKey: ["students", params],
//   queryFn: async () => (await studentsApi.getAll(params)).data.data,
//   placeholderData: keepPreviousData,
//   staleTime: 1 * 60 * 1000,
// });
 
// export const useStudent = (id: string) => useQuery({
//   queryKey: ["students", id],
//   queryFn: async () => (await studentsApi.getById(id)).data.data,
//   enabled: !!id,
//   staleTime: DEFAULT_STALE_TIME,
// });
 
// // --- Teachers ---
// export const useTeachers = (params?: Record<string, any>) => useQuery({
//   queryKey: ["teachers", params],
//   queryFn: async () => (await teachersApi.getAll(params)).data.data,
//   placeholderData: keepPreviousData,
//   staleTime: DEFAULT_STALE_TIME,
// });
 
// export const useTeacher = (id: string) => useQuery({
//   queryKey: ["teachers", id],
//   queryFn: async () => (await teachersApi.getById(id)).data.data,
//   enabled: !!id,
//   staleTime: DEFAULT_STALE_TIME,
// });
 
// // --- Groups ---
// export const useGroups = (params?: Record<string, any>) => useQuery({
//   queryKey: ["groups", params],
//   queryFn: async () => (await groupsApi.getAll(params)).data.data,
//   placeholderData: keepPreviousData,
//   staleTime: DEFAULT_STALE_TIME,
// });
 
// export const useGroup = (id: string) => useQuery({
//   queryKey: ["groups", id],
//   queryFn: async () => (await groupsApi.getById(id)).data.data,
//   enabled: !!id,
//   staleTime: DEFAULT_STALE_TIME,
// });
 
// // --- Payments & Revenue ---
// export const usePayments = (params?: Record<string, any>) => useQuery({
//   queryKey: ["payments", params],
//   queryFn: async () => (await paymentsApi.getAll(params)).data.data,
//   placeholderData: keepPreviousData,
//   staleTime: 2 * 60 * 1000,
// });
 
// export const useRevenue = (branchId: string, year?: number) => useQuery({
//   queryKey: ["revenue", branchId, year],
//   queryFn: async () => (await paymentsApi.getRevenue(branchId, year)).data.data,
//   enabled: !!branchId,
//   staleTime: DEFAULT_STALE_TIME,
// });
 
// export const useDebts = (params?: Record<string, any>) => useQuery({
//   queryKey: ["debts", params],
//   queryFn: async () => (await paymentsApi.getDebts(params)).data.data,
//   staleTime: 2 * 60 * 1000,
// });
 
// export const useSalaries = (params?: Record<string, unknown>) => useQuery({
//   queryKey: ["salaries", params],
//   queryFn: async () => (await paymentsApi.getSalaries(params)).data.data,
//   staleTime: DEFAULT_STALE_TIME,
// });
 
// // --- Attendance ---
// export const useAttendance = (params?: Record<string, any>) => useQuery({
//   queryKey: ["attendance", params],
//   queryFn: async () => (await attendanceApi.getAll(params)).data.data,
// });
 
// // --- Leads ---
// export const useLeads = (params?: Record<string, any>) => useQuery({
//   queryKey: ["leads", params],
//   queryFn: async () => (await leadsApi.getAll(params)).data.data,
//   placeholderData: keepPreviousData,
//   staleTime: 2 * 60 * 1000,
// });
 
// export const useLead = (id: string) => useQuery({
//   queryKey: ["leads", id],
//   queryFn: async () => (await leadsApi.getById(id)).data.data,
//   enabled: !!id,
// });
 
// export const usePipelineSummary = (branchId?: string) => useQuery({
//   queryKey: ["pipeline-summary", branchId],
//   queryFn: async () => (await leadsApi.getPipelineSummary(branchId) as any).data.data,
//   staleTime: 2 * 60 * 1000,
// });
 
// // --- Users ---
// export const useUsers = (params?: { search?: string; limit?: number; page?: number; role?: string }) => useQuery({
//   queryKey: ["users", params],
//   queryFn: async () => (await usersApi.getAll(params)).data.data,
//   placeholderData: keepPreviousData,
//   staleTime: 2 * 60 * 1000,
// });
 
// // --- Mutation Wrapper ---
// export function useMutationWithToast<TData, TVariables>(
//   mutationFn: (vars: TVariables) => Promise<TData>,
//   options?: {
//     onSuccess?: (data: TData) => void;
//     successMessage?: string;
//     invalidateKeys?: string[];
//   },
// ) {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn,
//     onSuccess: (data) => {
//       if (options?.successMessage) toast.success(options.successMessage);
//       options?.invalidateKeys?.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
//       options?.onSuccess?.(data);
//     },
//     onError: (err) => toast.error(getErrorMessage(err)),
//   });
// }
 




// // "use client";
// // import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
// // import toast from "react-hot-toast";
// // import { getErrorMessage } from "@/lib/utils";
// // import { 
// //   branchesApi, coursesApi, studentsApi, teachersApi, 
// //   groupsApi, paymentsApi, attendanceApi, leadsApi, usersApi 
// // } from "@/lib/api";

// // const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 daqiqa

// // // --- Branches ---
// // export const useBranches = () => useQuery({ 
// //   queryKey: ["branches"], 
// //   queryFn: async () => (await branchesApi.getAll()).data.data,
// //   staleTime: DEFAULT_STALE_TIME 
// // });

// // export const useBranch = (id: string) => useQuery({ 
// //   queryKey: ["branches", id], 
// //   queryFn: async () => (await branchesApi.getById(id)).data.data, 
// //   enabled: !!id 
// // });

// // export const useBranchStats = (id: string) => useQuery({ 
// //   queryKey: ["branches", id, "stats"], 
// //   queryFn: async () => (await branchesApi.getStats(id)).data, 
// //   enabled: !!id 
// // });

// // // --- Courses ---
// // export const useCourses = (branchId?: string) => useQuery({ 
// //   queryKey: ["courses", branchId], 
// //   queryFn: async () => (await coursesApi.getAll(branchId)).data.data,
// //   enabled: !!branchId,
// //   staleTime: DEFAULT_STALE_TIME
// // });

// // // --- Students ---
// // export const useStudents = (params?: Record<string, any>) => useQuery({ 
// //   queryKey: ["students", params], 
// //   queryFn: async () => (await studentsApi.getAll(params)).data.data,
// //   placeholderData: keepPreviousData,
// //   staleTime: 1 * 60 * 1000 
// // });

// // export const useStudent = (id: string) => useQuery({ 
// //   queryKey: ["students", id], 
// //   queryFn: async () => (await studentsApi.getById(id)).data.data, 
// //   enabled: !!id,
// //   staleTime: DEFAULT_STALE_TIME
// // });

// // // --- Teachers ---
// // export const useTeachers = (params?: Record<string, any>) => useQuery({ 
// //   queryKey: ["teachers", params], 
// //   queryFn: async () => (await teachersApi.getAll(params)).data.data,
// //   placeholderData: keepPreviousData,
// //   staleTime: DEFAULT_STALE_TIME
// // });

// // export const useTeacher = (id: string) => useQuery({ 
// //   queryKey: ["teachers", id], 
// //   queryFn: async () => (await teachersApi.getById(id)).data.data, 
// //   enabled: !!id 
// // });

// // // --- Groups ---
// // export const useGroups = (params?: Record<string, any>) => useQuery({ 
// //   queryKey: ["groups", params], 
// //   queryFn: async () => (await groupsApi.getAll(params)).data.data,
// //   placeholderData: keepPreviousData,
// //   staleTime: DEFAULT_STALE_TIME
// // });

// // export const useGroup = (id: string) => useQuery({ 
// //   queryKey: ["groups", id], 
// //   queryFn: async () => (await groupsApi.getById(id)).data.data, 
// //   enabled: !!id,
// //   staleTime: DEFAULT_STALE_TIME
// // });

// // // --- Payments & Revenue ---
// // export const usePayments = (params?: Record<string, any>) => useQuery({ 
// //   queryKey: ["payments", params], 
// //   queryFn: async () => (await paymentsApi.getAll(params)).data.data,
// //   placeholderData: keepPreviousData
// // });

// // export const useRevenue = (branchId: string, year?: number) => useQuery({ 
// //   queryKey: ["revenue", branchId, year], 
// //   queryFn: async () => (await paymentsApi.getRevenue(branchId, year)).data.data, 
// //   enabled: !!branchId,
// //   staleTime: DEFAULT_STALE_TIME
// // });

// // export const useDebts = (params?: Record<string, any>) => useQuery({ 
// //   queryKey: ["debts", params], 
// //   queryFn: async () => (await paymentsApi.getDebts(params)).data.data 
// // });

// // export const useSalaries = (params?: Record<string, unknown>) => useQuery({ 
// //   queryKey: ["salaries", params], 
// //   queryFn: async () => (await paymentsApi.getSalaries(params)).data.data 
// // });

// // // --- Attendance ---
// // export const useAttendance = (params?: Record<string, any>) => useQuery({ 
// //   queryKey: ["attendance", params], 
// //   queryFn: async () => (await attendanceApi.getAll(params)).data.data 
// // });

// // // --- Leads ---
// // export const useLeads = (params?: Record<string, any>) => useQuery({ 
// //   queryKey: ["leads", params], 
// //   queryFn: async () => (await leadsApi.getAll(params)).data.data,
// //   placeholderData: keepPreviousData,
// //   staleTime: 2 * 60 * 1000
// // });

// // export const useLead = (id: string) => useQuery({ 
// //   queryKey: ["leads", id], 
// //   queryFn: async () => (await leadsApi.getById(id)).data.data, 
// //   enabled: !!id 
// // });

// // export const usePipelineSummary = (branchId?: string) => useQuery({ 
// //   queryKey: ["pipeline-summary", branchId], 
// //   queryFn: async () => (await leadsApi.getPipelineSummary(branchId) as any).data.data 
// // });

// // // --- Users ---
// // export const useUsers = (params?: { search?: string; limit?: number; page?: number; role?: string }) => useQuery({ 
// //   queryKey: ["users", params], 
// //   queryFn: async () => (await usersApi.getAll(params)).data.data,
// //   placeholderData: keepPreviousData,
// //   staleTime: 2 * 60 * 1000
// // });

// // // --- Mutation Wrapper ---
// // export function useMutationWithToast<TData, TVariables>(
// //   mutationFn: (vars: TVariables) => Promise<TData>,
// //   options?: { onSuccess?: (data: TData) => void; successMessage?: string; invalidateKeys?: string[] },
// // ) {
// //   const qc = useQueryClient();
// //   return useMutation({
// //     mutationFn,
// //     onSuccess: (data) => {
// //       if (options?.successMessage) toast.success(options.successMessage);
// //       options?.invalidateKeys?.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
// //       options?.onSuccess?.(data);
// //     },
// //     onError: (err) => toast.error(getErrorMessage(err)),
// //   });
// // }


























// // "use client";
// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// // import toast from "react-hot-toast";
// // import { getErrorMessage } from "@/lib/utils";
// // import { branchesApi, coursesApi, studentsApi, teachersApi, groupsApi, paymentsApi, attendanceApi, leadsApi, usersApi } from "@/lib/api";

// // export const useBranches = () => useQuery({ queryKey: ["branches"], queryFn: async () => (await branchesApi.getAll()).data.data });
// // export const useCourses = (branchId?: string) => useQuery({ queryKey: ["courses", branchId], queryFn: async () => (await coursesApi.getAll(branchId)).data.data });
// // // export const useStudents = (params?: Record<string, unknown>) => useQuery({ queryKey: ["students", params], queryFn: async () => (await studentsApi.getAll(params)).data.data });
// // export const useStudents = (params?: Record<string, unknown>) => useQuery({ queryKey: ["students", params], queryFn: async () => (await studentsApi.getAll(params)).data.data });

// // export const useStudent = (id: string) => useQuery({ queryKey: ["students", id], queryFn: async () => (await studentsApi.getById(id)).data.data, enabled: !!id });
// // export const useTeachers = (params?: Record<string, unknown>) => useQuery({ queryKey: ["teachers", params], queryFn: async () => (await teachersApi.getAll(params)).data.data });
// // export const useTeacher = (id: string) => useQuery({ queryKey: ["teachers", id], queryFn: async () => (await teachersApi.getById(id)).data.data, enabled: !!id });
// // export const useGroups = (params?: Record<string, unknown>) => useQuery({ queryKey: ["groups", params], queryFn: async () => (await groupsApi.getAll(params)).data.data });
// // export const useGroup = (id: string) => useQuery({ queryKey: ["groups", id], queryFn: async () => (await groupsApi.getById(id)).data.data, enabled: !!id });
// // export const usePayments = (params?: Record<string, unknown>) => useQuery({ queryKey: ["payments", params], queryFn: async () => (await paymentsApi.getAll(params)).data.data });
// // export const useRevenue = (branchId: string, year?: number) => useQuery({ queryKey: ["revenue", branchId, year], queryFn: async () => (await paymentsApi.getRevenue(branchId, year)).data.data, enabled: !!branchId });
// // export const useDebts = (params?: Record<string, unknown>) => useQuery({ queryKey: ["debts", params], queryFn: async () => (await paymentsApi.getDebts(params)).data.data });
// // export const useSalaries = (params?: Record<string, unknown>) => useQuery({ queryKey: ["salaries", params], queryFn: async () => (await paymentsApi.getSalaries(params)).data.data });
// // export const useAttendance = (params?: Record<string, unknown>) => useQuery({ queryKey: ["attendance", params], queryFn: async () => (await attendanceApi.getAll(params)).data.data });
// // export const useGroupAttendance = (groupId: string, date: string) => useQuery({ queryKey: ["attendance", groupId, date], queryFn: async () => (await attendanceApi.getByGroupAndDate(groupId, date)).data.data, enabled: !!groupId && !!date });
// // export const useLeads = (params?: Record<string, unknown>) => useQuery({ queryKey: ["leads", params], queryFn: async () => (await leadsApi.getAll(params)).data.data });
// // export const useLead = (id: string) => useQuery({ queryKey: ["leads", id], queryFn: async () => (await leadsApi.getById(id)).data.data, enabled: !!id });
// // export const usePipelineSummary = (branchId?: string) => useQuery({ queryKey: ["pipeline-summary", branchId], queryFn: async () => (await leadsApi.getPipelineSummary(branchId) as any).data.data });
// // // export const useUsers = (params?: Record<string, unknown>) => useQuery({ queryKey: ["users", params], queryFn: async () => (await usersApi.getAll(params)).data.data });
// // // src/hooks/use-query.ts
// // export const useUsers = (params?: { search?: string; limit?: number; page?: number; role?: string }) => 
// //   useQuery({ 
// //     queryKey: ["users", params], 
// //     queryFn: async () => (await usersApi.getAll(params)).data.data,
// //     // Qidiruv bo'layotganda eski ma'lumotni saqlab turish uchun
// //     placeholderData: (previousData) => previousData 
// //   });

// // export function useMutationWithToast<TData, TVariables>(
// //   mutationFn: (vars: TVariables) => Promise<TData>,
// //   options?: { onSuccess?: (data: TData) => void; successMessage?: string; invalidateKeys?: string[] },
// // ) {
// //   const qc = useQueryClient();
// //   return useMutation({
// //     mutationFn,
// //     onSuccess: (data) => {
// //       if (options?.successMessage) toast.success(options.successMessage);
// //       options?.invalidateKeys?.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
// //       options?.onSuccess?.(data);
// //     },
// //     onError: (err) => toast.error(getErrorMessage(err)),
// //   });
// // }
