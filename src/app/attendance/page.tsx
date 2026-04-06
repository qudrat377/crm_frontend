"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { useGroups, useMutationWithToast } from "@/hooks/use-query";
import { attendanceApi, groupsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { CalendarCheck, Check, Users, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import type { AttendanceStatus } from "@/types";
import { RouteGuard } from "@/components/layout/route-guard";

const STATUS_OPTIONS: AttendanceStatus[] = ["present", "absent", "late", "excused"];
const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: "bg-success-500",
  absent: "bg-danger-500",
  late: "bg-warning-500",
  excused: "bg-blue-400",
};
const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Keldi",
  absent: "Kelmadi",
  late: "Kechikdi",
  excused: "Sababli",
};

export default function AttendancePage() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedGroup, setSelectedGroup] = useState("");
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});

  const { data: groups } = useGroups({ limit: 100, status: "active" });

  // Load group students
  const { data: groupDetail } = useQuery({
    queryKey: ["group-detail", selectedGroup],
    queryFn: async () => {
      const res = await groupsApi.getById(selectedGroup);
      return res.data.data;
    },
    enabled: !!selectedGroup,
  });

  // Load existing attendance for this group+date
  const { data: existingAttendance } = useQuery({
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
    { successMessage: "Davomat muvaffaqiyatli belgilandi", invalidateKeys: ["attendance"] },
  );

  const students = groupDetail?.groupStudents
    ?.filter((gs: any) => gs.isActive)
    ?.map((gs: any) => gs.student) ?? [];

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const map: Record<string, AttendanceStatus> = {};
    students.forEach((s: any) => { map[s.id] = status; });
    setAttendance(map);
  };

  const handleSave = async () => {
    if (!selectedGroup) return toast.error("Guruhni tanlang");
    const entries = students.map((s: any) => ({
      studentId: s.id,
      status: attendance[s.id] ?? "present",
    }));
    await bulkMutation.mutateAsync({ groupId: selectedGroup, lessonDate: date, entries });
  };

  const goDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split("T")[0]);
  };

  const stats = students.reduce(
    (acc: any, s: any) => {
      const st = attendance[s.id] ?? "present";
      acc[st] = (acc[st] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <RouteGuard allowedRoles={["admin","manager"]}>
      <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Davomat belgilash</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Guruh va sanani tanlang</p>
        </div>

        {/* Controls */}
        <Card padding="sm">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <SearchableSelect
                label="Guruh"
                placeholder="Guruh tanlang..."
                options={[
                  { value: "", label: "Guruh tanlang..." },
                  ...(groups?.data?.map((g: any) => ({ value: g.id, label: g.name })) ?? []),
                ]}
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => goDate(-1)}
                className="w-9 h-9 rounded-xl border border-surface-200 dark:border-surface-700 flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 transition-colors mb-0"
              >
                <ChevronLeft className="w-4 h-4 text-surface-600 dark:text-surface-400" />
              </button>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">Sana</label>
                <input
                  type="date"
                  value={date}
                  max={today}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-xl border border-surface-200 dark:border-surface-700 px-3.5 py-2.5 text-sm text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent h-[42px]"
                />
              </div>
              <button
                onClick={() => goDate(1)}
                disabled={date >= today}
                className="w-9 h-9 rounded-xl border border-surface-200 dark:border-surface-700 flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 transition-colors disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4 text-surface-600 dark:text-surface-400" />
              </button>
            </div>
            {selectedGroup && students.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-surface-500 dark:text-surface-400">Barchani:</span>
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => markAll(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 ${STATUS_COLORS[s]}`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {!selectedGroup ? (
          <Card>
            <EmptyState icon={CalendarCheck} title="Guruh tanlang" description="Davomat belgilash uchun guruh va sanani tanlang" />
          </Card>
        ) : students.length === 0 ? (
          <Card>
            <EmptyState icon={Users} title="Bu guruhda o'quvchi yo'q" />
          </Card>
        ) : (
          <>
            {/* Stats bar */}
            <div className="flex items-center gap-3 flex-wrap">
              {STATUS_OPTIONS.map((s) => (
                <div key={s} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-surface-900 rounded-xl border border-surface-100 dark:border-surface-800">
                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[s]}`} />
                  <span className="text-xs text-surface-600 dark:text-surface-400">{STATUS_LABELS[s]}: {stats[s] ?? 0}</span>
                </div>
              ))}
            </div>

            {/* Students list */}
            <Card>
              <CardHeader
                title={`${groupDetail?.name} — ${formatDate(date, "dd MMMM yyyy")}`}
                subtitle={`${students.length} ta o'quvchi`}
                action={
                  <Button
                    size="sm"
                    icon={<Check className="w-4 h-4" />}
                    onClick={handleSave}
                    loading={bulkMutation.isPending}
                  >
                    Saqlash
                  </Button>
                }
              />
              <div className="space-y-2">
                {students.map((student: any, idx: number) => {
                  const currentStatus = attendance[student.id] ?? "present";
                  return (
                    <div
                      key={student.id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 transition-colors"
                    >
                      <span className="text-xs text-surface-400 dark:text-surface-500 w-5 text-right">{idx + 1}</span>
                      <Avatar name={student.fullName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 dark:text-surface-50">{student.fullName}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">{student.phone ?? "—"}</p>
                      </div>
                      {/* Status toggle buttons */}
                      <div className="flex items-center gap-1.5">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(student.id, s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              currentStatus === s
                                ? `${STATUS_COLORS[s]} text-white border-transparent`
                                : "border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 hover:border-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50"
                            }`}
                          >
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer save */}
              <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800 flex justify-end">
                <Button
                  icon={<Check className="w-4 h-4" />}
                  onClick={handleSave}
                  loading={bulkMutation.isPending}
                >
                  Davomatni saqlash
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
    </RouteGuard>
  );
}
