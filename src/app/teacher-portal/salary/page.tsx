"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/store/auth.store";
import { useTeachers, useSalaries } from "@/hooks/use-query";
import { formatCurrency, formatMonth } from "@/lib/utils";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

function TeacherSalaryContent() {
  const { user } = useAuthStore();
  const { data: teachersData } = useTeachers({ limit: 100 });
  const teacher = teachersData?.data?.find((t) => t.user?.email === user?.email);
  const { data: salariesData, isLoading } = useSalaries(
    teacher ? { teacherId: teacher.id, limit: 24 } : undefined,
  );
  const salaries = salariesData?.data ?? [];
  const totalPaid = salaries.filter((s) => s.status === "paid").reduce((sum, s) => sum + Number(s.netAmount), 0);
  const pending = salaries.filter((s) => s.status === "pending");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Maosh tarixi</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
          Asosiy maosh: {teacher ? formatCurrency(Number(teacher.monthlySalary)) : "—"}/oy
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teacher-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-teacher-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-surface-500 dark:text-surface-400">Asosiy maosh</p>
              <p className="text-sm font-bold text-surface-900 dark:text-surface-50 truncate">
                {teacher ? formatCurrency(Number(teacher.monthlySalary)) : "—"}
              </p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-success-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-surface-500 dark:text-surface-400">Jami to'langan</p>
              <p className="text-sm font-bold text-success-700 truncate">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </Card>
        <Card padding="sm" className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-warning-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-surface-500 dark:text-surface-400">Kutilmoqda</p>
              <p className="text-sm font-bold text-warning-600">{pending.length} ta</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Maosh yozuvlari" subtitle={`${salaries.length} ta yozuv`} />
        {isLoading ? (
          <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />)}</div>
        ) : salaries.length === 0 ? (
          <EmptyState icon={DollarSign} title="Maosh yozuvlari yo'q" />
        ) : (
          <div className="space-y-2">
            {salaries.map((s) => (
              <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 transition-colors border border-surface-50">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.status === "paid" ? "bg-success-50" : "bg-warning-50"}`}>
                  {s.status === "paid"
                    ? <CheckCircle className="w-4.5 h-4.5 text-success-600 w-[18px] h-[18px]" />
                    : <Clock className="w-[18px] h-[18px] text-warning-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-50">{formatMonth(s.salaryMonth, s.salaryYear)}</p>
                  {(s.bonus > 0 || s.deduction > 0) && (
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      {s.bonus > 0 && `+${formatCurrency(s.bonus)} bonus`}
                      {s.bonus > 0 && s.deduction > 0 && " · "}
                      {s.deduction > 0 && `-${formatCurrency(s.deduction)} ushlab qolish`}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">{formatCurrency(Number(s.netAmount))}</p>
                  <Badge status={s.status} size="sm" className="mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function TeacherSalaryPage() {
  return (
    <RouteGuard allowedRoles={["teacher"]}>
      <DashboardLayout><TeacherSalaryContent /></DashboardLayout>
    </RouteGuard>
  );
}
