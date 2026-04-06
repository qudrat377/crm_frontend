"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/store/auth.store";
import { useTeachers, useGroups, useMutationWithToast } from "@/hooks/use-query";
import { attendanceApi, groupsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { CalendarCheck, Check, ChevronLeft, ChevronRight, Users } from "lucide-react";
import type { AttendanceStatus } from "@/types";

const STATUS_OPTIONS: AttendanceStatus[] = ["present", "absent", "late", "excused"];
const STATUS_LABELS: Record<AttendanceStatus, string> = { present:"Keldi", absent:"Kelmadi", late:"Kechikdi", excused:"Sababli" };
const STATUS_COLORS: Record<AttendanceStatus, string> = { present:"bg-success-500", absent:"bg-danger-500", late:"bg-warning-500", excused:"bg-blue-400" };

function TeacherAttendanceContent() {
  const { user } = useAuthStore();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});

  const { data: teachersData } = useTeachers({ limit: 100 });
  const teacher = teachersData?.data?.find((t) => t.user?.email === user?.email);

  const { data: groupsData } = useGroups(
    teacher ? { teacherId: teacher.id, status: "active", limit: 50 } : undefined,
  );
  const groups = groupsData?.data ?? [];

  const { data: groupDetail } = useQuery({
    queryKey: ["group-detail", selectedGroup],
    queryFn: async () => (await groupsApi.getById(selectedGroup)).data.data,
    enabled: !!selectedGroup,
  });

  useQuery({
    queryKey: ["attendance", selectedGroup, date],
    queryFn: async () => {
      const res = await attendanceApi.getByGroupAndDate(selectedGroup, date);
      return res.data.data;
    },
    enabled: !!selectedGroup && !!date,
    onSuccess: (data: any[]) => {
      const map: Record<string, AttendanceStatus> = {};
      data.forEach((a: any) => { map[a.studentId] = a.status; });
      setAttendance(map);
    },
  } as any);

  const bulkMutation = useMutationWithToast(
    (payload: { groupId: string; lessonDate: string; entries: any[] }) =>
      attendanceApi.markBulk(payload),
    { successMessage: "Davomat saqlandi", invalidateKeys: ["attendance"] },
  );

  const students = groupDetail?.groupStudents?.filter((gs: any) => gs.isActive)?.map((gs: any) => gs.student) ?? [];

  const goDate = (d: number) => {
    const nd = new Date(date);
    nd.setDate(nd.getDate() + d);
    setDate(nd.toISOString().split("T")[0]);
  };

  const markAll = (status: AttendanceStatus) => {
    const map: Record<string, AttendanceStatus> = {};
    students.forEach((s: any) => { map[s.id] = status; });
    setAttendance(map);
  };

  const handleSave = async () => {
    const entries = students.map((s: any) => ({
      studentId: s.id,
      status: attendance[s.id] ?? "present",
    }));
    await bulkMutation.mutateAsync({ groupId: selectedGroup, lessonDate: date, entries });
  };

  const stats = students.reduce((acc: any, s: any) => {
    const st = attendance[s.id] ?? "present";
    acc[st] = (acc[st] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Davomat belgilash</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">O'z guruhlaringiz uchun davomat</p>
      </div>

      {/* Controls */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <div className="flex-1 min-w-[180px]">
            <SearchableSelect
              label="Guruh"
              placeholder="Guruh tanlang..."
              options={[
                { value: "", label: "Guruh tanlang..." },
                ...groups.map((g) => ({ value: g.id, label: g.name })),
              ]}
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            />
          </div>

          <div className="flex items-end gap-2">
            <button onClick={() => goDate(-1)} className="w-9 h-9 rounded-xl border border-surface-200 dark:border-surface-700 flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 transition-colors">
              <ChevronLeft className="w-4 h-4 text-surface-600 dark:text-surface-400" />
            </button>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">Sana</label>
              <input
                type="date" value={date} max={today}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border border-surface-200 dark:border-surface-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teacher-500 focus:border-transparent h-[42px]"
              />
            </div>
            <button onClick={() => goDate(1)} disabled={date >= today} className="w-9 h-9 rounded-xl border border-surface-200 dark:border-surface-700 flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 transition-colors disabled:opacity-40">
              <ChevronRight className="w-4 h-4 text-surface-600 dark:text-surface-400" />
            </button>
          </div>
        </div>

        {selectedGroup && students.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-surface-100 dark:border-surface-800">
            <span className="text-xs text-surface-500 dark:text-surface-400">Barchani:</span>
            {STATUS_OPTIONS.map((s) => (
              <button key={s} onClick={() => markAll(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 ${STATUS_COLORS[s]}`}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </Card>

      {!selectedGroup ? (
        <Card><EmptyState icon={CalendarCheck} title="Guruh tanlang" description="Davomat belgilash uchun guruhni tanlang" /></Card>
      ) : students.length === 0 ? (
        <Card><EmptyState icon={Users} title="Bu guruhda o'quvchi yo'q" /></Card>
      ) : (
        <>
          {/* Status summary bar */}
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <div key={s} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-surface-900 rounded-xl border border-surface-100 dark:border-surface-800 text-xs text-surface-600 dark:text-surface-400">
                <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[s]}`} />
                {STATUS_LABELS[s]}: {stats[s] ?? 0}
              </div>
            ))}
          </div>

          <Card>
            <CardHeader
              title={`${groupDetail?.name} — ${formatDate(date, "dd MMMM yyyy")}`}
              subtitle={`${students.length} ta o'quvchi`}
              action={
                <Button size="sm" icon={<Check className="w-4 h-4" />} onClick={handleSave} loading={bulkMutation.isPending}
                  className="bg-teacher-600 hover:bg-teacher-700 focus:ring-teacher-500">
                  Saqlash
                </Button>
              }
            />
            <div className="space-y-2">
              {students.map((student: any, idx: number) => {
                const current = attendance[student.id] ?? "present";
                return (
                  <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 transition-colors">
                    <span className="text-xs text-surface-400 dark:text-surface-500 w-5 text-right flex-shrink-0">{idx + 1}</span>
                    <Avatar name={student.fullName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-surface-50 truncate">{student.fullName}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">{student.phone ?? "—"}</p>
                    </div>
                    {/* Mobile: select dropdown | Desktop: button group */}
                    <div className="sm:hidden">
                      <select
                        value={current}
                        onChange={(e) => setAttendance((prev) => ({ ...prev, [student.id]: e.target.value as AttendanceStatus }))}
                        className="rounded-lg border border-surface-200 dark:border-surface-700 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teacher-500"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      {STATUS_OPTIONS.map((s) => (
                        <button key={s} onClick={() => setAttendance((prev) => ({ ...prev, [student.id]: s }))}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            current === s ? `${STATUS_COLORS[s]} text-white border-transparent` : "border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50"
                          }`}>
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800 flex justify-end">
              <Button icon={<Check className="w-4 h-4" />} onClick={handleSave} loading={bulkMutation.isPending}
                className="bg-teacher-600 hover:bg-teacher-700 focus:ring-teacher-500">
                Davomatni saqlash
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export default function TeacherAttendancePage() {
  return (
    <RouteGuard allowedRoles={["teacher"]}>
      <DashboardLayout>
        <TeacherAttendanceContent />
      </DashboardLayout>
    </RouteGuard>
  );
}
