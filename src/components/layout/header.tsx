"use client";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { getRoleTheme } from "./nav-config";
import { getRoleLabel } from "@/types";
import { Menu, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { ThemeToggle } from "@/components/theme-toggle";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/students": "O'quvchilar",
  "/teachers": "O'qituvchilar",
  "/groups": "Guruhlar",
  "/payments": "To'lovlar",
  "/attendance": "Davomat",
  "/leads": "Leadlar (CRM)",
  "/branches": "Filiallar",
  "/courses": "Kurslar",
  "/users": "Foydalanuvchilar",
  "/settings": "Sozlamalar",
  "/teacher-portal/groups": "Mening guruhlarim",
  "/teacher-portal/attendance": "Davomat belgilash",
  "/teacher-portal/salary": "Maosh tarixi",
  "/assistant-portal/attendance": "Davomat",
  "/assistant-portal/payments": "To'lovlar",
  "/portal/my-groups": "Mening guruhlarim",
  "/portal/my-payments": "To'lovlarim",
  "/portal/my-attendance": "Davomatim",
};

export function Header() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarOpen } = useUIStore();
  const { user } = useAuthStore();

  const role = (user?.role ?? "user") as UserRole;
  const theme = getRoleTheme(role);

  const base = Object.keys(PAGE_TITLES).find(
    (k) => pathname === k || pathname.startsWith(k + "/")
  ) ?? "";
  const title = PAGE_TITLES[base] ?? "EduCRM";

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 bg-white/95 dark:bg-surface-900/95 backdrop-blur border-b border-surface-100 dark:border-surface-800 z-20 flex items-center px-4 md:px-6 gap-3 transition-all duration-300",
        sidebarCollapsed ? "lg:left-[68px]" : "lg:left-64",
        "left-0", // mobile: full width
      )}
    >
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden w-9 h-9 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 flex items-center justify-center text-surface-600 dark:text-surface-400 transition-colors flex-shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-base font-semibold text-surface-900 dark:text-surface-50 truncate">{title}</h1>
      </div>

      <div className="flex-1" />

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Notifications */}
      <button className="relative w-9 h-9 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 flex items-center justify-center text-surface-600 dark:text-surface-400 transition-colors flex-shrink-0">
        <Bell className="w-[18px] h-[18px]" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full border-2 border-white dark:border-surface-950" />
      </button>

      {/* User chip */}
      {user && (
        <div className="flex items-center gap-2 ml-1">
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0",
            theme.icon,
          )}>
            {user.email[0].toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-surface-800 dark:text-surface-100 leading-none max-w-[120px] truncate">{user.email}</p>
            <p className="text-[10px] text-surface-400 dark:text-surface-400 mt-0.5">{getRoleLabel(role)}</p>
          </div>
        </div>
      )}
    </header>
  );
}
