"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/store/auth.store";
import { useStudents, usePayments, useDebts } from "@/hooks/use-query";
import { formatCurrency, formatDate, formatMonth, getStatusLabel } from "@/lib/utils";
import { CreditCard, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";

function MyPaymentsContent() {
  const { user } = useAuthStore();
  const { data: studentsData } = useStudents({ search: user?.email, limit: 1 });
  const studentId = studentsData?.data?.[0]?.id;

  const { data: paymentsData, isLoading } = usePayments(
    studentId ? { studentId, limit: 50 } : undefined,
  );
  const { data: debts } = useDebts(studentId ? { studentId, isResolved: false } : undefined);

  const payments = paymentsData?.data ?? [];
  const unresolvedDebts = (debts as any[]) ?? [];

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
  const totalDebt = unresolvedDebts.reduce((s: number, d: any) => s + Number(d.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">To'lovlarim</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">To'lov tarixi va qarzlar</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-danger-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-surface-500 dark:text-surface-400">Qarzdorlik</p>
              <p className={`text-sm font-bold truncate ${totalDebt > 0 ? "text-danger-600" : "text-success-600"}`}>
                {totalDebt > 0 ? formatCurrency(totalDebt) : "Qarz yo'q ✓"}
              </p>
            </div>
          </div>
        </Card>
        <Card padding="sm" className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-student-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-student-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-surface-500 dark:text-surface-400">To'lovlar soni</p>
              <p className="text-sm font-bold text-surface-900 dark:text-surface-50">{payments.length} ta</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Unpaid debts alert */}
      {unresolvedDebts.length > 0 && (
        <div className="p-4 bg-danger-50 rounded-2xl border border-danger-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-danger-700">
                {unresolvedDebts.length} ta to'lanmagan to'lov mavjud
              </p>
              <div className="mt-2 space-y-1">
                {unresolvedDebts.map((d: any) => (
                  <p key={d.id} className="text-xs text-danger-600">
                    • {d.group?.name} — {formatMonth(d.debtMonth, d.debtYear)}: {formatCurrency(d.amount)}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment history */}
      <Card>
        <CardHeader title="To'lov tarixi" subtitle={`${payments.length} ta yozuv`} />
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <EmptyState icon={CreditCard} title="To'lovlar yo'q" description="Hali birorta to'lov amalga oshirilmagan" />
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 transition-colors border border-surface-50"
              >
                <div className="w-9 h-9 bg-success-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4.5 h-4.5 text-success-600 w-[18px] h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
                    {formatMonth(p.paymentMonth, p.paymentYear)}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{p.group?.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-success-700">{formatCurrency(p.amount)}</p>
                  <div className="flex items-center gap-1.5 justify-end mt-0.5">
                    <Badge status={p.method} label={getStatusLabel(p.method)} size="sm" />
                    <span className="text-xs text-surface-400 dark:text-surface-500">{formatDate(p.paidAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function MyPaymentsPage() {
  return (
    <RouteGuard allowedRoles={["user"]}>
      <DashboardLayout>
        <MyPaymentsContent />
      </DashboardLayout>
    </RouteGuard>
  );
}
