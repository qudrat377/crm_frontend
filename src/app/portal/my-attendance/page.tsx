"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/store/auth.store";
import { useStudents, useAttendance } from "@/hooks/use-query";
import { formatDate, formatMonth } from "@/lib/utils";
import { CalendarCheck, TrendingUp, XCircle, Clock, CheckCircle } from "lucide-react";

const STATUS_ICONS: Record<string, React.ElementType> = {
  present: CheckCircle,
  absent: XCircle,
  late: Clock,
  excused: CalendarCheck,
};
const STATUS_COLORS: Record<string, string> = {
  present: "text-success-600",
  absent: "text-danger-500",
  late: "text-warning-600",
  excused: "text-blue-500",
};

function MyAttendanceContent() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);

  const { data: studentsData } = useStudents({ search: user?.email, limit: 1 });
  const studentId = studentsData?.data?.[0]?.id;

  const { data: attendanceData, isLoading } = useAttendance(
    studentId ? { studentId, page, limit: 20 } : undefined,
  );

  const records = attendanceData?.data ?? [];

  // Stats
  const statusCounts = records.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
    {} as Record<string, number>,
  );
  const total = records.length;
  const rate = total > 0 ? Math.round(((statusCounts.present ?? 0) / total) * 100) : 0;

  const summaryCards = [
    { label: "Keldi", count: statusCounts.present ?? 0, icon: CheckCircle, color: "text-success-600", bg: "bg-success-50" },
    { label: "Kelmadi", count: statusCounts.absent ?? 0, icon: XCircle, color: "text-danger-500", bg: "bg-danger-50" },
    { label: "Kechikdi", count: statusCounts.late ?? 0, icon: Clock, color: "text-warning-600", bg: "bg-warning-50" },
    { label: "Sababli", count: statusCounts.excused ?? 0, icon: CalendarCheck, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Davomatim</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Darsga qatnashish tarixi</p>
      </div>

      {/* Attendance rate */}
      {total > 0 && (
        <Card padding="sm">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle
                  cx="32" cy="32" r="26"
                  fill="none"
                  stroke={rate >= 80 ? "#16a34a" : rate >= 60 ? "#d97706" : "#e11d48"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(rate / 100) * 163.4} 163.4`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-surface-900 dark:text-surface-50">{rate}%</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-surface-900 dark:text-surface-50">Davomat foizi</p>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                {total} ta darsdan {statusCounts.present ?? 0} tasida qatnashdi
              </p>
              <div className={`text-xs font-medium mt-1 ${rate >= 80 ? "text-success-600" : rate >= 60 ? "text-warning-600" : "text-danger-600"}`}>
                {rate >= 80 ? "A'lo" : rate >= 60 ? "Qoniqarli" : "Past"}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryCards.map(({ label, count, icon: Icon, color, bg }) => (
          <Card key={label} padding="sm">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-surface-900 dark:text-surface-50">{count}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Records list */}
      <Card>
        <CardHeader title="Davomat tarixi" subtitle={`${attendanceData?.total ?? 0} ta yozuv`} />
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-14 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="Davomat yozuvlari yo'q" />
        ) : (
          <div className="space-y-1">
            {records.map((r) => {
              const Icon = STATUS_ICONS[r.status] ?? CheckCircle;
              const color = STATUS_COLORS[r.status] ?? "text-surface-600 dark:text-surface-400";
              return (
                <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 transition-colors">
                  <Icon className={`w-4.5 h-4.5 ${color} flex-shrink-0 w-[18px] h-[18px]`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-50">{r.group?.name}</p>
                    {r.note && <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{r.note}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge status={r.status} size="sm" />
                    <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{formatDate(r.lessonDate)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function MyAttendancePage() {
  return (
    <RouteGuard allowedRoles={["user"]}>
      <DashboardLayout>
        <MyAttendanceContent />
      </DashboardLayout>
    </RouteGuard>
  );
}
