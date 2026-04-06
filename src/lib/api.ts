import api from "./axios";
import type { Branch, Course, Student, Teacher, Group, GroupStudent, Payment, Debt, SalaryRecord, Attendance, Lead, LeadActivity, PaginatedResult, MonthlyRevenue, AuthResponse, ApiResponse, User } from "@/types";

export const authApi = {
  login: (email: string, password: string) => api.post<{ success: boolean; data: AuthResponse }>("/auth/login", { email, password }),
  register: (data: { email: string; password: string; role?: string }) => api.post<{ success: boolean; data: AuthResponse }>("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

export const branchesApi = {
  getAll: () => api.get<{ data: Branch[] }>("/branches"),
  getById: (id: string) => api.get<{ data: Branch }>(`/branches/${id}`),
  getStats: (id: string) => api.get(`/branches/${id}/stats`),
  create: (data: Partial<Branch>) => api.post<{ data: Branch }>("/branches", data),
  update: (id: string, data: Partial<Branch>) => api.patch<{ data: Branch }>(`/branches/${id}`, data),
  delete: (id: string) => api.delete(`/branches/${id}`),
};

export const coursesApi = {
  getAll: (branchId?: string) => api.get<{ data: Course[] }>("/courses", { params: { branchId } }),
  getById: (id: string) => api.get<{ data: Course }>(`/courses/${id}`),
  create: (data: Partial<Course>) => api.post<{ data: Course }>("/courses", data),
  update: (id: string, data: Partial<Course>) => api.patch<{ data: Course }>(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
};

export const studentsApi = {
  getAll: (params?: Record<string, unknown>) => api.get<{ data: PaginatedResult<Student> }>("/students", { params }),
  getById: (id: string) => api.get<{ data: Student }>(`/students/${id}`),
  create: (data: Partial<Student>) => api.post<{ data: Student }>("/students", data),
  update: (id: string, data: Partial<Student>) => api.patch<{ data: Student }>(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
  assignToGroup: (sid: string, gid: string) => api.post<{ data: GroupStudent }>(`/students/${sid}/groups/${gid}`),
  removeFromGroup: (sid: string, gid: string) => api.delete(`/students/${sid}/groups/${gid}`),
};

export const teachersApi = {
  getAll: (params?: Record<string, unknown>) => api.get<{ data: PaginatedResult<Teacher> }>("/teachers", { params }),
  getById: (id: string) => api.get<{ data: Teacher }>(`/teachers/${id}`),
  create: (data: Partial<Teacher>) => api.post<{ data: Teacher }>("/teachers", data),
  update: (id: string, data: Partial<Teacher>) => api.patch<{ data: Teacher }>(`/teachers/${id}`, data),
  delete: (id: string) => api.delete(`/teachers/${id}`),
};

export const groupsApi = {
  getAll: (params?: Record<string, unknown>) => api.get<{ data: PaginatedResult<Group> }>("/groups", { params }),
  getById: (id: string) => api.get<{ data: Group }>(`/groups/${id}`),
  create: (data: Partial<Group>) => api.post<{ data: Group }>("/groups", data),
  update: (id: string, data: Partial<Group>) => api.patch<{ data: Group }>(`/groups/${id}`, data),
  delete: (id: string) => api.delete(`/groups/${id}`),
};

export const paymentsApi = {
  getAll: (params?: Record<string, unknown>) => api.get<{ data: PaginatedResult<Payment> }>("/payments", { params }),
  getById: (id: string) => api.get<{ data: Payment }>(`/payments/${id}`),
  create: (data: Partial<Payment>) => api.post<{ data: Payment }>("/payments", data),
  getStudentHistory: (studentId: string) => api.get(`/payments/student/${studentId}/history`),
  getRevenue: (branchId: string, year?: number) => api.get<{ data: { months: MonthlyRevenue[]; yearTotal: number; outstandingDebt: { amount: number; count: number } } }>("/payments/revenue", { params: { branchId, year } }),
  getDebts: (params?: Record<string, unknown>) => api.get<{ data: Debt[] }>("/payments/debts/list", { params }),
  createDebt: (data: Partial<Debt>) => api.post<{ data: Debt }>("/payments/debts", data),
  resolveDebt: (id: string) => api.patch(`/payments/debts/${id}/resolve`),
  getSalaries: (params?: Record<string, unknown>) => api.get<{ data: PaginatedResult<SalaryRecord> }>("/payments/salaries/list", { params }),
  createSalary: (data: Partial<SalaryRecord>) => api.post<{ data: SalaryRecord }>("/payments/salaries", data),
  markSalaryPaid: (id: string) => api.patch(`/payments/salaries/${id}/pay`),
};

export const attendanceApi = {
  getAll: (params?: Record<string, unknown>) => api.get<{ data: PaginatedResult<Attendance> }>("/attendance", { params }),
  getByGroupAndDate: (groupId: string, date: string) => api.get<{ data: Attendance[] }>(`/attendance/group/${groupId}/date`, { params: { date } }),
  markOne: (data: Partial<Attendance>) => api.post<{ data: Attendance }>("/attendance", data),
  markBulk: (data: { groupId: string; lessonDate: string; entries: { studentId: string; status?: string; note?: string }[] }) => api.post("/attendance/bulk", data),
  getGroupStats: (groupId: string, dateFrom?: string, dateTo?: string) => api.get(`/attendance/group/${groupId}/stats`, { params: { dateFrom, dateTo } }),
  getStudentStats: (studentId: string, groupId?: string) => api.get(`/attendance/student/${studentId}/stats`, { params: { groupId } }),
};

export const leadsApi = {
  getAll: (params?: Record<string, unknown>) => api.get<{ data: PaginatedResult<Lead> }>("/leads", { params }),
  getById: (id: string) => api.get<{ data: Lead }>(`/leads/${id}`),
  create: (data: Partial<Lead>) => api.post<{ data: Lead }>("/leads", data),
  update: (id: string, data: Partial<Lead>) => api.patch<{ data: Lead }>(`/leads/${id}`, data),
  addActivity: (leadId: string, data: Partial<LeadActivity>) => api.post<{ data: LeadActivity }>(`/leads/${leadId}/activities`, data),
  getPipelineSummary: (branchId?: string) => api.get("/leads/pipeline-summary", { params: { branchId } }),
};

export const usersApi = {
  // Faqat o'quvchi roli bo'lgan foydalanuvchilarni olish
  getStudentUsers: () => 
    api.get<ApiResponse<PaginatedResult<User>>>("/users?role=student&limit=100")
       .then(res => res.data.data.data), // Paginated natijadan massivni ajratib olish

  getAll: (params?: Record<string, unknown>) => api.get("/users", { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: unknown) => api.patch(`/users/${id}`, data),
  deactivate: (id: string) => api.delete(`/users/${id}`),
};