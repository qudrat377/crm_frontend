"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { useGroups, useMutationWithToast } from "@/hooks/use-query";
import { attendanceApi, groupsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { CalendarCheck, Check, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import type { AttendanceStatus } from "@/types";

const STATUS_OPTIONS: AttendanceStatus[] = ["present", "absent", "late", "excused"];
const STATUS_LABELS: Record<AttendanceStatus, string> = { present:"Keldi", absent:"Kelmadi", late:"Kechikdi", excused:"Sababli" };
const STATUS_COLORS: Record<AttendanceStatus, string> = { present:"bg-success-500", absent:"bg-danger-500", late:"bg-warning-500", excused:"bg-blue-400" };

function AssistantAttendanceContent() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});

  const { data: groupsData } = useGroups({ status: "active", limit: 100 });
  const groups = groupsData?.data ?? [];

  const { data: groupDetail } = useQuery({
    queryKey: ["group-detail", selectedGroup],
    queryFn: async () => (await groupsApi.getById(selectedGroup)).data.data,
    enabled: !!selectedGroup,
  });

  useQuery({
    queryKey: ["attendance", selectedGroup, date],
    queryFn: async () => (await attendanceApi.getByGroupAndDate(selectedGroup, date)).data.data,
    enabled: !!selectedGroup && !!date,
    onSuccess: (data: any[]) => {
      const map: Record<string, AttendanceStatus> = {};
      data.forEach((a: any) => { map[a.studentId] = a.status; });
      setAttendance(map);
    },
  } as any);

  const bulkMutation = useMutationWithToast(
    (p: { groupId: string; lessonDate: string; entries: any[] }) => attendanceApi.markBulk(p),
    { successMessage: "Davomat saqlandi", invalidateKeys: ["attendance"] },
  );

  const students = groupDetail?.groupStudents?.filter((gs: any) => gs.isActive)?.map((gs: any) => gs.student) ?? [];

  return (
    <div className="space-y-5">
      {/* Assistent banner */}
      <div className="relative bg-gradient-to-r from-assistant-600 to-assistant-700 rounded-2xl p-5 text-white overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white dark:bg-surface-900/10 rounded-full" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white dark:bg-surface-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs">Assistent portali</p>
            <h2 className="font-bold text-lg">Davomat belgilash</h2>
          </div>
        </div>
      </div>

      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchableSelect
              label="Guruh"
              placeholder="Guruh tanlang..."
              options={[{ value: "", label: "Guruh tanlang..." }, ...groups.map((g) => ({ value: g.id, label: g.name }))]}
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={() => { const d=new Date(date); d.setDate(d.getDate()-1); setDate(d.toISOString().split("T")[0]); }}
              className="w-9 h-9 rounded-xl border border-surface-200 dark:border-surface-700 flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 transition-colors">
              <ChevronLeft className="w-4 h-4 text-surface-600 dark:text-surface-400" />
            </button>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">Sana</label>
              <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border border-surface-200 dark:border-surface-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-assistant-500 h-[42px]" />
            </div>
            <button onClick={() => { const d=new Date(date); d.setDate(d.getDate()+1); setDate(d.toISOString().split("T")[0]); }}
              disabled={date >= today}
              className="w-9 h-9 rounded-xl border border-surface-200 dark:border-surface-700 flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4 text-surface-600 dark:text-surface-400" />
            </button>
          </div>
        </div>
      </Card>

      {!selectedGroup ? (
        <Card><EmptyState icon={CalendarCheck} title="Guruh tanlang" /></Card>
      ) : students.length === 0 ? (
        <Card><EmptyState icon={CalendarCheck} title="Bu guruhda o'quvchi yo'q" /></Card>
      ) : (
        <Card>
          <CardHeader
            title={`${groupDetail?.name} — ${formatDate(date, "dd MMMM yyyy")}`}
            subtitle={`${students.length} ta o'quvchi`}
            action={
              <Button size="sm" icon={<Check className="w-4 h-4" />} onClick={async () => {
                await bulkMutation.mutateAsync({ groupId: selectedGroup, lessonDate: date,
                  entries: students.map((s: any) => ({ studentId: s.id, status: attendance[s.id] ?? "present" })) });
              }} loading={bulkMutation.isPending}
                className="bg-assistant-600 hover:bg-assistant-700 focus:ring-assistant-500">
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
                    <p className="text-sm font-medium truncate">{student.fullName}</p>
                  </div>
                  {/* Mobile dropdown */}
                  <div className="sm:hidden">
                    <select value={current} onChange={(e) => setAttendance((p) => ({ ...p, [student.id]: e.target.value as AttendanceStatus }))}
                      className="rounded-lg border border-surface-200 dark:border-surface-700 px-2 py-1 text-xs focus:outline-none">
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                  {/* Desktop buttons */}
                  <div className="hidden sm:flex items-center gap-1">
                    {STATUS_OPTIONS.map((s) => (
                      <button key={s} onClick={() => setAttendance((p) => ({ ...p, [student.id]: s }))}
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
            <Button icon={<Check className="w-4 h-4" />} onClick={async () => {
              await bulkMutation.mutateAsync({ groupId: selectedGroup, lessonDate: date,
                entries: students.map((s: any) => ({ studentId: s.id, status: attendance[s.id] ?? "present" })) });
            }} loading={bulkMutation.isPending}
              className="bg-assistant-600 hover:bg-assistant-700 focus:ring-assistant-500">
              Davomatni saqlash
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function AssistantAttendancePage() {
  return (
    <RouteGuard allowedRoles={["asistend"]}>
      <DashboardLayout><AssistantAttendanceContent /></DashboardLayout>
    </RouteGuard>
  );
}
