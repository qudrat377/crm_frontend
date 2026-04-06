"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useBranch, useBranchStats, useCourses } from "@/hooks/use-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft, Building2, MapPin, Users, GraduationCap, BookOpen, Wallet, Activity
} from "lucide-react";

export default function BranchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const { data: branch, isLoading: branchLoading } = useBranch(id);
  const { data: statsData, isLoading: statsLoading } = useBranchStats(id);
  const { data: courses, isLoading: coursesLoading } = useCourses(id);

  const stats = (statsData as any)?.data || statsData || {};
  const coursesList = courses || [];

  if (branchLoading || statsLoading) {
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

  if (!branch) {
    return (
      <RouteGuard allowedRoles={["admin", "manager"]}>
        <DashboardLayout>
          <div className="text-center py-20">
            <p className="text-surface-500 dark:text-surface-400">Filial topilmadi</p>
            <Button variant="ghost" onClick={() => router.back()} className="mt-4">Orqaga</Button>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={["admin", "manager"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.back()}
          >
            Orqaga
          </Button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center text-white flex-shrink-0">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">{(branch as any).name}</h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-surface-500 dark:text-surface-400">
                  <MapPin className="w-4 h-4" /> {(branch as any).address || "Manzil kiritilmagan"}
                </div>
              </div>
            </div>
            <Badge status={(branch as any).status} className="self-start sm:self-center text-sm px-3 py-1" />
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              icon={GraduationCap} 
              color="brand" 
              label="O'quvchilar sig'imi" 
              value={(branch as any).capacity || "Yopiq"} 
            />
            <StatsCard 
              icon={Users} 
              color="purple" 
              label="O'qituvchilar" 
              value={stats.teachersCount || 0} 
            />
            <StatsCard 
              icon={BookOpen} 
              color="orange" 
              label="Guruhlar" 
              value={stats.groupsCount || 0} 
            />
            <StatsCard 
              icon={Wallet} 
              color="success" 
              label="Kutilayotgan daromad" 
              value={formatCurrency(stats.expectedRevenue || 0)} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Extended Stats */}
            <Card className="lg:col-span-1">
              <CardHeader title="Asosiy Analitika" />
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-surface-100 dark:border-surface-800">
                  <span className="text-sm text-surface-600 dark:text-surface-400">Aktiv O'quvchilar</span>
                  <span className="font-bold text-surface-900 dark:text-surface-50">{stats.activeStudents || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-surface-100 dark:border-surface-800">
                  <span className="text-sm text-surface-600 dark:text-surface-400">Kurslar soni</span>
                  <span className="font-bold text-surface-900 dark:text-surface-50">{coursesList.length || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-surface-100 dark:border-surface-800">
                  <span className="text-sm text-surface-600 dark:text-surface-400">Yaratilgan sana</span>
                  <span className="font-bold text-surface-900 dark:text-surface-50">{formatDate((branch as any).createdAt, "dd.MM.yyyy")}</span>
                </div>
              </div>
            </Card>

            {/* Courses List */}
            <Card className="lg:col-span-2">
              <CardHeader title="Filial Kurslari" subtitle="Aktiv yo'nalishlar" />
              {coursesLoading ? (
                <div className="p-10 flex justify-center"><Activity className="w-6 h-6 animate-pulse text-brand-600" /></div>
              ) : coursesList.length === 0 ? (
                <EmptyState icon={BookOpen} title="Kurslar yo'q" description="Guruh ochish uchun kurslar yaratilmagan" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coursesList.map((course: any) => (
                    <div 
                      key={course.id} 
                      className="p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-100 dark:border-surface-800"
                    >
                      <h4 className="font-bold text-surface-900 dark:text-surface-50 mb-1">{course.name}</h4>
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <span className="text-surface-500 dark:text-surface-400">{course.duration} oy</span>
                        <span className="font-semibold text-brand-600">{formatCurrency(course.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}

function StatsCard({ icon: Icon, color, label, value }: { icon: any, color: string, label: string, value: string | number }) {
  const colorMap: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400",
    success: "bg-success-50 text-success-600 dark:bg-success-900/20 dark:text-success-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  };

  return (
    <Card padding="sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-surface-500 dark:text-surface-400">{label}</p>
          <p className="text-lg font-bold text-surface-900 dark:text-surface-50">{value}</p>
        </div>
      </div>
    </Card>
  );
}
