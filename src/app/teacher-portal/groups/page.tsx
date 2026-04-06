"use client";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/store/auth.store";
import { useTeachers, useGroups } from "@/hooks/use-query";
import { formatDate } from "@/lib/utils";
import {
  BookOpen, Clock, Users, Calendar, GraduationCap,
  Star, TrendingUp, BookMarked,
} from "lucide-react";

function TeacherPortalContent() {
  const { user } = useAuthStore();

  // Find teacher profile for this user
  const { data: teachersData } = useTeachers({ limit: 100 });
  const teacher = teachersData?.data?.find((t) => t.userId === user?.id || t.user?.email === user?.email);

  const { data: groupsData, isLoading } = useGroups(
    teacher ? { teacherId: teacher.id, limit: 50 } : undefined,
  );

  const groups = groupsData?.data ?? [];
  const activeGroups = groups.filter((g) => g.status === "active");
  const totalStudents = activeGroups.reduce((s, g) => s + (g.studentCount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Teacher welcome banner */}
      <div className="relative bg-gradient-to-r from-teacher-600 to-teacher-800 rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white dark:bg-surface-900/5 rounded-full" />
        <div className="absolute right-16 bottom-0 w-24 h-24 bg-white dark:bg-surface-900/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white dark:bg-surface-900/20 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm">O'qituvchi portali</p>
              <h2 className="text-xl font-bold">{teacher?.fullName ?? user?.email}</h2>
              {teacher?.specialization && (
                <p className="text-white/60 text-xs mt-0.5">{teacher.specialization}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Faol guruhlar", value: activeGroups.length, icon: BookOpen },
              { label: "Jami o'quvchilar", value: totalStudents, icon: GraduationCap },
              { label: "Jami guruhlar", value: groups.length, icon: BookMarked },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="w-5 h-5 text-white/70 mx-auto mb-1" />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-white/60 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Groups list */}
      <Card>
        <CardHeader
          title="Mening guruhlarim"
          subtitle={`${groups.length} ta guruh`}
        />
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Guruhlar topilmadi"
            description="Sizga hali guruh biriktirilmagan"
          />
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="p-4 rounded-xl border border-surface-100 dark:border-surface-800 hover:border-teacher-200 hover:bg-teacher-50/20 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teacher-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-teacher-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-surface-900 dark:text-surface-50">{group.name}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">{group.course?.name}</p>
                    </div>
                  </div>
                  <Badge status={group.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-surface-600 dark:text-surface-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500" />
                    {group.startTime}–{group.endTime}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500" />
                    {group.scheduleDays}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500" />
                    {group.studentCount ?? 0}/{group.maxStudents} o'quvchi
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500" />
                    {formatDate(group.startedAt)}
                  </div>
                </div>

                {/* Student count bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-surface-400 dark:text-surface-500 mb-1">
                    <span>O'quvchilar to'lishi</span>
                    <span>{group.studentCount ?? 0}/{group.maxStudents}</span>
                  </div>
                  <div className="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teacher-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((group.studentCount ?? 0) / group.maxStudents) * 100)}%` }}
                    />
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

export default function TeacherGroupsPage() {
  return (
    <RouteGuard allowedRoles={["teacher"]}>
      <DashboardLayout>
        <TeacherPortalContent />
      </DashboardLayout>
    </RouteGuard>
  );
}
