"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth.store";
import { useStudents } from "@/hooks/use-query";
import { formatDate, formatCurrency } from "@/lib/utils";
import { BookOpen, Clock, Calendar, User, GraduationCap, CreditCard, AlertCircle } from "lucide-react";

function StudentPortalContent() {
  const { user } = useAuthStore();

  // Find student record linked to this user's email
  const { data: studentsData, isLoading } = useStudents({ search: user?.email, limit: 5 });
  const student = studentsData?.data?.[0];

  const activeGroups = student?.groupStudents?.filter((gs) => gs.isActive) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative bg-gradient-to-r from-student-600 to-student-700 rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white dark:bg-surface-900/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute right-10 bottom-0 w-24 h-24 bg-white dark:bg-surface-900/5 rounded-full translate-y-1/3" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white dark:bg-surface-900/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm">O'quvchi portali</p>
              <h2 className="text-xl font-bold">{student?.fullName ?? user?.email}</h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-white/80">
              <BookOpen className="w-4 h-4" />
              <span>{activeGroups.length} ta faol guruh</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/80">
              <Badge status={student?.status ?? "active"} className="bg-white dark:bg-surface-900/20 text-white border-white/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      {student?.paymentSummary && (
        <div className="grid grid-cols-2 gap-4">
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-success-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-surface-500 dark:text-surface-400">Jami to'lagan</p>
                <p className="text-sm font-bold text-surface-900 dark:text-surface-50 truncate">
                  {formatCurrency(student.paymentSummary.totalPaid)}
                </p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-danger-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-danger-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-surface-500 dark:text-surface-400">Qarz</p>
                <p className="text-sm font-bold text-danger-600 truncate">
                  {formatCurrency(student.paymentSummary.totalDebt)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* My Groups */}
      <Card>
        <CardHeader title="Mening guruhlarim" subtitle={`${activeGroups.length} ta faol guruh`} />
        {activeGroups.length === 0 ? (
          <div className="text-center py-10 text-surface-400 dark:text-surface-500">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Hozircha guruhga qo'shilmagan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGroups.map((gs) => (
              <div key={gs.id} className="p-4 rounded-xl border border-surface-100 dark:border-surface-800 hover:border-student-200 hover:bg-student-50/30 transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-student-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-student-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-surface-900 dark:text-surface-50">{gs.group?.name}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">{gs.group?.course?.name}</p>
                    </div>
                  </div>
                  <Badge status="active" size="sm" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-surface-600 dark:text-surface-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500" />
                    {gs.group?.teacher?.fullName ?? "—"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500" />
                    {gs.group?.startTime}–{gs.group?.endTime}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500" />
                    {gs.group?.scheduleDays}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500" />
                    {gs.group?.course?.pricePerMonth
                      ? formatCurrency(Number(gs.group.course.pricePerMonth)) + "/oy"
                      : "—"}
                  </div>
                </div>
                <div className="mt-2 text-xs text-surface-400 dark:text-surface-500">
                  Qo'shilgan: {formatDate(gs.enrolledAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Contact info */}
      {student && (
        <Card>
          <CardHeader title="Shaxsiy ma'lumotlar" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: "Telefon", value: student.phone },
              { label: "Ota-ona", value: student.parentName },
              { label: "Ota-ona telefoni", value: student.parentPhone },
              { label: "Manzil", value: student.address },
            ].map(({ label, value }) =>
              value ? (
                <div key={label} className="flex flex-col gap-0.5">
                  <p className="text-xs text-surface-500 dark:text-surface-400">{label}</p>
                  <p className="font-medium text-surface-800 dark:text-surface-100">{value}</p>
                </div>
              ) : null,
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function StudentPortalPage() {
  return (
    <RouteGuard allowedRoles={["user"]}>
      <DashboardLayout>
        <StudentPortalContent />
      </DashboardLayout>
    </RouteGuard>
  );
}
