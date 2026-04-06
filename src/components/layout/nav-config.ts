import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CreditCard,
  CalendarCheck, Target, Building2, BookMarked, Settings,
  ClipboardList, DollarSign, UserCheck, BarChart3,
} from "lucide-react";
import type { UserRole } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

/** Returns navigation sections for a given role */
export function getNavConfig(role: UserRole): NavSection[] {
  switch (role) {
    // ─── Admin: full access ─────────────────────────────────────
    case "admin":
      return [
        {
          items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          ],
        },
        {
          title: "Boshqaruv",
          items: [
            { label: "O'quvchilar", href: "/students", icon: GraduationCap },
            { label: "O'qituvchilar", href: "/teachers", icon: Users },
            { label: "Guruhlar", href: "/groups", icon: BookOpen },
          ],
        },
        {
          title: "Moliya",
          items: [
            { label: "To'lovlar", href: "/payments", icon: CreditCard },
            { label: "Qarzdorlik", href: "/payments/debts", icon: ClipboardList },
            { label: "Maoshlar", href: "/payments/salaries", icon: DollarSign },
          ],
        },
        {
          title: "Operatsiyalar",
          items: [
            { label: "Davomat", href: "/attendance", icon: CalendarCheck },
            { label: "Leadlar (CRM)", href: "/leads", icon: Target },
          ],
        },
        {
          title: "Tizim",
          items: [
            { label: "Filiallar", href: "/branches", icon: Building2 },
            { label: "Kurslar", href: "/courses", icon: BookMarked },
            { label: "Foydalanuvchilar", href: "/users", icon: UserCheck },
            { label: "Sozlamalar", href: "/settings", icon: Settings },
          ],
        },
      ];

    // ─── Manager: no users/system management ────────────────────
    case "manager":
      return [
        {
          items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          ],
        },
        {
          title: "Boshqaruv",
          items: [
            { label: "O'quvchilar", href: "/students", icon: GraduationCap },
            { label: "O'qituvchilar", href: "/teachers", icon: Users },
            { label: "Guruhlar", href: "/groups", icon: BookOpen },
          ],
        },
        {
          title: "Moliya",
          items: [
            { label: "To'lovlar", href: "/payments", icon: CreditCard },
            { label: "Qarzdorlik", href: "/payments/debts", icon: ClipboardList },
            { label: "Maoshlar", href: "/payments/salaries", icon: DollarSign },
          ],
        },
        {
          title: "Marketing",
          items: [
            { label: "Davomat", href: "/attendance", icon: CalendarCheck },
            { label: "Leadlar (CRM)", href: "/leads", icon: Target },
          ],
        },
        {
          title: "Ma'lumotlar",
          items: [
            { label: "Filiallar", href: "/branches", icon: Building2 },
            { label: "Kurslar", href: "/courses", icon: BookMarked },
            { label: "Sozlamalar", href: "/settings", icon: Settings },
          ],
        },
      ];

    // ─── Teacher: only their groups & attendance ─────────────────
    case "teacher":
      return [
        {
          items: [
            { label: "Mening guruhlarim", href: "/teacher-portal/groups", icon: BookOpen },
            { label: "Davomat belgilash", href: "/teacher-portal/attendance", icon: CalendarCheck },
            { label: "Maosh tarixi", href: "/teacher-portal/salary", icon: DollarSign },
            { label: "Sozlamalar", href: "/settings", icon: Settings },
          ],
        },
      ];

    // ─── Assistant: attendance + limited payments ────────────────
    case "asistend":
      return [
        {
          items: [
            { label: "Davomat", href: "/assistant-portal/attendance", icon: CalendarCheck },
            { label: "To'lovlar", href: "/assistant-portal/payments", icon: CreditCard },
            { label: "Sozlamalar", href: "/settings", icon: Settings },
          ],
        },
      ];

    // ─── Student (user): their own data only ────────────────────
    case "user":
      return [
        {
          items: [
            { label: "Mening guruhlarim", href: "/portal/my-groups", icon: BookOpen },
            { label: "To'lovlarim", href: "/portal/my-payments", icon: CreditCard },
            { label: "Davomatim", href: "/portal/my-attendance", icon: CalendarCheck },
            { label: "Sozlamalar", href: "/settings", icon: Settings },
          ],
        },
      ];

    default:
      return [];
  }
}

/** Role theme color for sidebar accent */
export function getRoleTheme(role: UserRole) {
  switch (role) {
    case "admin":    return { accent: "brand",     gradient: "from-brand-600 to-brand-800",    icon: "bg-brand-600",    text: "text-brand-600",    active: "bg-brand-50 text-brand-700",    dot: "bg-brand-500" };
    case "manager":  return { accent: "success",   gradient: "from-success-600 to-success-800", icon: "bg-success-600",  text: "text-success-600",  active: "bg-success-50 text-success-700", dot: "bg-success-500" };
    case "teacher":  return { accent: "teacher",   gradient: "from-teacher-600 to-teacher-800", icon: "bg-teacher-600",  text: "text-teacher-600",  active: "bg-teacher-50 text-teacher-700", dot: "bg-teacher-500" };
    case "asistend": return { accent: "assistant", gradient: "from-assistant-600 to-assistant-800", icon: "bg-assistant-600", text: "text-assistant-600", active: "bg-assistant-50 text-assistant-700", dot: "bg-assistant-500" };
    case "user":     return { accent: "student",   gradient: "from-student-600 to-student-800", icon: "bg-student-600",  text: "text-student-600",  active: "bg-student-50 text-student-700", dot: "bg-student-500" };
    default:         return { accent: "brand",     gradient: "from-brand-600 to-brand-800",    icon: "bg-brand-600",    text: "text-brand-600",    active: "bg-brand-50 text-brand-700",    dot: "bg-brand-500" };
  }
}
