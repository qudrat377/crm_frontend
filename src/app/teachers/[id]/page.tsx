"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useTeacher, useGroups, useSalaries } from "@/hooks/use-query";
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";
import {
  ArrowLeft, Phone, User as UserIcon, BookOpen,
  CreditCard, Award, Building, DollarSign
} from "lucide-react";

export default function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const { data: teacherData, isLoading } = useTeacher(id);
  const { data: groupsData } = useGroups({ teacherId: id, limit: 100 });
  const { data: salariesData } = useSalaries({ teacherId: id, limit: 10 });

  const teacher = teacherData as any;
  const groups = groupsData?.data || [];
  const salaries = salariesData?.data || [];

  if (isLoading) {
    return (
      <RouteGuard allowedRoles={["admin", "manager"]}>
        <DashboardLayout>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  if (!teacher) {
    return (
      <RouteGuard allowedRoles={["admin", "manager"]}>
        <DashboardLayout>
          <div className="text-center py-20">
            <p className="text-surface-500 dark:text-surface-400">O'qituvchi topilmadi</p>
            <Button variant="ghost" onClick={() => router.back()} className="mt-4">Orqaga</Button>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={["admin", "manager"]}>
      <DashboardLayout>
        <div className="space-y-5">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.back()}
          >
            Orqaga
          </Button>

          {/* Profile Header */}
          <Card>
            <div className="flex items-start gap-5">
              <Avatar name={teacher.fullName} size="lg" className="w-16 h-16 text-xl" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">{teacher.fullName}</h2>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{teacher.specialty || "Fan ko'rsatilmagan"}</p>
                  </div>
                  <Badge status={teacher.status} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                    <Phone className="w-4 h-4" /> {teacher.phone || "—"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                    <Building className="w-4 h-4" /> {teacher.branch?.name || "Filial yo'q"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                    <Award className="w-4 h-4" /> Qo'shilgan: {formatDate(teacher.createdAt, "dd.MM.yyyy")}
                  </div>
                  {teacher.user && (
                    <div className="flex items-center gap-2 text-sm text-brand-600 font-semibold truncate">
                      <UserIcon className="w-4 h-4" /> {teacher.user.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">Faol guruhlar</p>
                  <p className="text-sm font-bold text-surface-900 dark:text-surface-50">{groups.length}</p>
                </div>
              </div>
            </Card>
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">Maosh ulushi</p>
                  <p className="text-sm font-bold text-surface-900 dark:text-surface-50">{teacher.salaryPercentage}%</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Groups Card */}
            <Card>
              <CardHeader title="Guruhlar" subtitle="Faol guruhlar ro'yxati" />
              {groups.length === 0 ? (
                <EmptyState icon={BookOpen} title="Guruhlar yo'q" description="Tizimda ushbu o'qituvchiga biriktirilgan guruhlar topilmadi." />
              ) : (
                <div className="space-y-3">
                  {groups.map((g: any) => (
                    <div 
                      key={g.id} 
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-100 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700 transition-colors cursor-pointer"
                      onClick={() => router.push(`/groups/${g.id}`)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-surface-900 dark:text-surface-50 truncate">{g.name}</h4>
                          <Badge status={g.status} size="sm" />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-surface-500 dark:text-surface-400">
                          <span>{g.course?.name}</span>
                          <span className="w-1 h-1 rounded-full bg-surface-300" />
                          <span>{g.scheduleDays}</span>
                          <span className="w-1 h-1 rounded-full bg-surface-300" />
                          <span>{g.startTime}-{g.endTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Salaries Card */}
            <Card>
              <CardHeader title="Maosh tarixi" subtitle="So'nggi berilgan oyliklar" />
              {salaries.length > 0 ? (
                <div className="space-y-2">
                  {salaries.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-800 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-surface-900 dark:text-surface-50">{formatMonth(s.month, s.year)}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">Filial: {teacher.branch?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-success-600">{formatCurrency(s.amount)}</p>
                        <Badge status={s.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={CreditCard} title="Maoshlar yo'q" description="Maosh tarixi topilmadi" />
              )}
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
