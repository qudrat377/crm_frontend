"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { getRoleLabel, getRoleColor } from "@/types";
import { LogOut, Shield, Bell } from "lucide-react";
import toast from "react-hot-toast";
import type { UserRole } from "@/types";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const role = (user?.role ?? "user") as UserRole;

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-xl">
        <div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Sozlamalar</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Profil va tizim sozlamalari</p>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader title="Profil" />
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 text-xl font-bold flex-shrink-0">
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-surface-900 dark:text-surface-50 truncate">{user?.email}</p>
                <span className={`inline-flex items-center font-medium rounded-full border px-2.5 py-1 text-xs mt-1 ${getRoleColor(role)}`}>
                  {getRoleLabel(role)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-brand-50 rounded-xl border border-brand-100">
              <Shield className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <p className="text-sm text-brand-700">
                Rol: <strong>{getRoleLabel(role)}</strong> — Sizga mos sahifalar ko'rsatilmoqda
              </p>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader title="Bildirishnomalar" />
          <div className="space-y-3">
            {["Yangi xabarlar", "Eslatmalar", "Tizim xabarlari"].map((label) => (
              <label key={label} className="flex items-center justify-between py-2 cursor-pointer select-none">
                <div className="flex items-center gap-2.5 text-sm text-surface-700 dark:text-surface-200">
                  <Bell className="w-4 h-4 text-surface-400 dark:text-surface-500" />
                  {label}
                </div>
                <div className="relative w-10 h-5">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-5 bg-surface-200 dark:bg-surface-700 rounded-full peer peer-checked:bg-brand-600 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white dark:bg-surface-900 rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Logout */}
        <Card className="border-danger-100">
          <CardHeader title="Xavfli zona" />
          <Button variant="danger" icon={<LogOut className="w-4 h-4" />} onClick={logout} size="sm">
            Tizimdan chiqish
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
