// ─── Roles ─────────────────────────────────────────────────────
export type UserRole = "admin" | "manager" | "teacher" | "user" | "asistend";

// Role groups for permission checks
export const ADMIN_ROLES: UserRole[]     = ["admin"];
export const MANAGER_ROLES: UserRole[]   = ["admin", "manager"];
export const STAFF_ROLES: UserRole[]     = ["admin", "manager", "teacher", "asistend"];
export const TEACHER_ROLES: UserRole[]   = ["teacher"];
export const ASSISTANT_ROLES: UserRole[] = ["asistend"];
export const STUDENT_ROLES: UserRole[]   = ["user"];

export function hasRole(userRole: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(userRole);
}

export function getRoleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    admin: "Administrator",
    manager: "Menejer",
    teacher: "O'qituvchi",
    user: "O'quvchi",
    asistend: "Assistent",
  };
  return map[role] ?? role;
}

export function getRoleColor(role: UserRole): string {
  const map: Record<UserRole, string> = {
    admin: "bg-brand-100 text-brand-700 border-brand-200",
    manager: "bg-success-100 text-success-700 border-success-200",
    teacher: "bg-teacher-100 text-teacher-700 border-teacher-200",
    user: "bg-student-100 text-student-700 border-student-200",
    asistend: "bg-assistant-100 text-assistant-700 border-assistant-200",
  };
  return map[role] ?? "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-700";
}

// ─── Auth ───────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: { id: string; email: string; role: string };
  tokens: AuthTokens;
}

// ─── Domain types ──────────────────────────────────────────────

export interface Branch {
  id: string; name: string; address?: string; phone?: string; createdAt: string;
}

export interface Course {
  id: string; branchId: string; name: string; description?: string;
  pricePerMonth: number; durationMonths: number; isActive: boolean; createdAt: string;
  branch?: Branch;
}

export type StudentStatus = "active" | "inactive" | "graduated" | "suspended";

export interface Student {
  id: string; branchId: string; fullName: string; phone?: string;
  parentName?: string; parentPhone?: string; birthDate?: string;
  address?: string; status: StudentStatus; createdAt: string;
  branch?: Branch; groupStudents?: GroupStudent[];
  paymentSummary?: { totalPaid: number; totalDebt: number };
  userId?: string;
}

export interface Teacher {
  id: string; userId: string; branchId: string; fullName: string;
  phone?: string; specialization?: string; monthlySalary: number;
  hiredAt: string; isActive: boolean;
  branch?: Branch; user?: { id: string; email: string };
  groups?: Group[];
  stats?: { activeGroups: number; totalSalaryPaid: number };
}

export type GroupStatus = "upcoming" | "active" | "completed" | "cancelled";

export interface Group {
  id: string; courseId: string; teacherId: string; branchId: string;
  name: string; scheduleDays: string; startTime: string; endTime: string;
  maxStudents: number; status: GroupStatus; startedAt: string; createdAt: string;
  course?: Course; teacher?: Teacher; branch?: Branch;
  groupStudents?: GroupStudent[]; studentCount?: number;
}

export interface GroupStudent {
  id: string; groupId: string; studentId: string;
  enrolledAt: string; leftAt?: string; isActive: boolean;
  group?: Group; student?: Student;
}

export type PaymentMethod = "cash" | "card" | "bank_transfer" | "online";
export type PaymentStatus = "paid" | "partial" | "refunded";

export interface Payment {
  id: string; studentId: string; groupId: string; recordedById: string;
  amount: number; discount: number; paymentMonth: number; paymentYear: number;
  method: PaymentMethod; status: PaymentStatus; note?: string; paidAt: string;
  student?: Student; group?: Group; recordedBy?: User;
}

export interface Debt {
  id: string; studentId: string; groupId: string; amount: number;
  debtMonth: number; debtYear: number; isResolved: boolean; resolvedAt?: string;
  createdAt: string; student?: Student; group?: Group;
}

export interface SalaryRecord {
  id: string; teacherId: string; processedById: string;
  baseAmount: number; bonus: number; deduction: number; netAmount: number;
  salaryMonth: number; salaryYear: number; status: "pending" | "paid";
  paidAt?: string; teacher?: Teacher;
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface Attendance {
  id: string; groupId: string; studentId: string; markedById: string;
  lessonDate: string; status: AttendanceStatus; note?: string;
  student?: Student; group?: Group; markedBy?: User;
}

export type LeadStatus = "new" | "contacted" | "trial" | "registered" | "paid" | "lost";
export type LeadSource = "instagram" | "telegram" | "referral" | "walk_in" | "website" | "phone_call" | "other";
export type ActivityType = "call" | "message" | "status_change" | "note" | "meeting";

export interface Lead {
  id: string; branchId: string; assignedToId?: string;
  fullName: string; phone: string; source: LeadSource;
  pipelineStatus: LeadStatus; convertedStudentId?: string; notes?: string;
  createdAt: string; updatedAt: string;
  branch?: Branch; assignedTo?: User; convertedStudent?: Student;
  activities?: LeadActivity[]; activityCount?: number;
}

export interface LeadActivity {
  id: string; leadId: string; createdById: string;
  activityType: ActivityType; description: string; createdAt: string;
  createdBy?: User;
}

// ─── API wrapper ───────────────────────────────────────────────
export interface ApiResponse<T> { success: boolean; data: T; timestamp: string; }
export interface PaginatedResult<T> { data: T[]; total: number; page: number; limit: number; totalPages: number; }
export interface MonthlyRevenue { month: number; year: number; revenue: number; paymentCount: number; }

// husanboy