"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { useStudents, useMutationWithToast, useGroup } from "@/hooks/use-query";
import { studentsApi } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft, BookOpen, Clock, Users, User,
  Calendar, Building2, DollarSign, Plus,
  UserMinus, Check, GraduationCap, X, Search, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: group, isLoading, refetch } = useGroup(id);

  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(null);

  // All active students for dropdown
  const activeStudents = group?.groupStudents?.filter((gs: any) => gs.isActive) ?? [];
  const enrolledIds = new Set(activeStudents.map((gs: any) => gs.studentId));

  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [debouncedStudentSearch, setDebouncedStudentSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedStudentSearch(studentSearchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [studentSearchTerm]);

  const { data: allStudents, isLoading: studentsLoading } = useStudents({ 
    search: debouncedStudentSearch,
    status: "active", 
    limit: 10 
  });

  const availableStudents = (allStudents?.data ?? []).filter(
    (s: any) => !enrolledIds.has(s.id)
  );

  const selectedStudent = availableStudents.find((s: any) => s.id === selectedStudentId);




  const handleAddStudent = async () => {
    if (!selectedStudentId) {
      toast.error("O'quvchini tanlang");
      return;
    }
    setAddingStudent(true);
    try {
      await studentsApi.assignToGroup(selectedStudentId, id);
      toast.success("O'quvchi guruhga qo'shildi");
      setShowAddStudentModal(false);
      setSelectedStudentId("");
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Xatolik yuz berdi");
    } finally {
      setAddingStudent(false);
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`"${studentName}" guruhdan chiqarilsinmi?`)) return;
    setRemovingStudentId(studentId);
    try {
      await studentsApi.removeFromGroup(studentId, id);
      toast.success("O'quvchi guruhdan chiqarildi");
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Xatolik yuz berdi");
    } finally {
      setRemovingStudentId(null);
    }
  };

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

  if (!group) {
    return (
      <RouteGuard allowedRoles={["admin", "manager"]}>
        <DashboardLayout>
          <div className="text-center py-20">
            <p className="text-surface-500 dark:text-surface-400">Guruh topilmadi</p>
            <Button variant="ghost" onClick={() => router.back()} className="mt-4">
              Orqaga
            </Button>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  const fillRate = Math.min(
    100,
    Math.round((activeStudents.length / group.maxStudents) * 100)
  );

  return (
    <RouteGuard allowedRoles={["admin", "manager"]}>
      <DashboardLayout>
        <div className="space-y-5">
          {/* Back */}
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.back()}
          >
            Orqaga
          </Button>

          {/* Header */}
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center border border-brand-100">
                  <BookOpen className="w-7 h-7 text-brand-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">
                    {group.name}
                  </h2>
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    {group.course?.name}
                  </p>
                </div>
              </div>
              <Badge status={group.status} />
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-surface-100 dark:border-surface-800">
              {[
                { icon: User,      label: "O'qituvchi",   value: group.teacher?.fullName ?? "—" },
                { icon: Clock,     label: "Vaqt",          value: `${group.startTime}–${group.endTime}` },
                { icon: Calendar,  label: "Kunlar",        value: group.scheduleDays },
                { icon: Building2, label: "Filial",        value: group.branch?.name ?? "—" },
                {
                  icon: DollarSign,
                  label: "Oylik to'lov",
                  value: group.course
                    ? formatCurrency(Number(group.course.pricePerMonth))
                    : "—",
                },
                {
                  icon: Calendar,
                  label: "Boshlangan",
                  value: formatDate(group.startedAt),
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <Icon className="w-4 h-4 text-surface-400 dark:text-surface-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-surface-500 dark:text-surface-400">{label}</p>
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-100 mt-0.5">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Fill rate bar */}
            <div className="mt-5 pt-5 border-t border-surface-100 dark:border-surface-800">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-surface-600 dark:text-surface-400 font-medium">
                  O'quvchilar to'lishi
                </span>
                <span className="font-semibold text-surface-900 dark:text-surface-50">
                  {activeStudents.length} / {group.maxStudents}
                  <span className="text-surface-400 dark:text-surface-500 font-normal ml-1">
                    ({fillRate}%)
                  </span>
                </span>
              </div>
              <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    fillRate >= 100
                      ? "bg-danger-500"
                      : fillRate >= 80
                      ? "bg-warning-500"
                      : "bg-brand-500"
                  }`}
                  style={{ width: `${fillRate}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Students list */}
          <Card>
            <CardHeader
              title="O'quvchilar ro'yxati"
              subtitle={`${activeStudents.length} ta faol o'quvchi`}
              action={
                <Button
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowAddStudentModal(true)}
                  disabled={activeStudents.length >= group.maxStudents}
                >
                  O'quvchi qo'shish
                </Button>
              }
            />

            {activeStudents.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="Bu guruhda o'quvchi yo'q"
                description="O'quvchi qo'shing"
                action={{
                  label: "O'quvchi qo'shish",
                  onClick: () => setShowAddStudentModal(true),
                }}
              />
            ) : (
              <div className="divide-y divide-surface-50">
                {activeStudents.map((gs: any, idx: number) => (
                  <div
                    key={gs.id}
                    className="flex items-center gap-4 py-3 px-2 -mx-2 hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 rounded-xl transition-colors"
                  >
                    <span className="text-xs text-surface-400 dark:text-surface-500 w-5 flex-shrink-0 text-right">
                      {idx + 1}
                    </span>
                    <Avatar name={gs.student?.fullName ?? "?"} size="sm" />
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() =>
                        router.push(`/students/${gs.student?.id}`)
                      }
                    >
                      <p className="text-sm font-medium text-surface-900 dark:text-surface-50 hover:text-brand-600 transition-colors">
                        {gs.student?.fullName}
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        {gs.student?.phone ?? "—"} ·{" "}
                        Qo'shilgan: {formatDate(gs.enrolledAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge status={gs.student?.status ?? "active"} size="sm" />
                      <button
                        onClick={() =>
                          handleRemoveStudent(
                            gs.student?.id,
                            gs.student?.fullName ?? "O'quvchi"
                          )
                        }
                        disabled={removingStudentId === gs.student?.id}
                        className="w-8 h-8 rounded-xl border border-surface-200 dark:border-surface-700 flex items-center justify-center hover:bg-danger-50 hover:border-danger-200 transition-colors text-surface-400 dark:text-surface-500 hover:text-danger-500 disabled:opacity-40"
                        title="Guruhdan chiqarish"
                      >
                        {removingStudentId === gs.student?.id ? (
                          <span className="w-3 h-3 border-2 border-danger-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <UserMinus className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Add Student Modal */}
<Modal
  open={showAddStudentModal}
  onClose={() => {
    setShowAddStudentModal(false);
    setSelectedStudentId("");
  }}
  title="Guruhga o'quvchi qo'shish"
  size="sm"
  footer={
    <>
      <Button
        variant="outline"
        onClick={() => {
          setShowAddStudentModal(false);
          setSelectedStudentId("");
        }}
      >
        Bekor qilish
      </Button>
      <Button
        icon={<Check className="w-4 h-4" />}
        onClick={handleAddStudent}
        loading={addingStudent}
        disabled={!selectedStudentId}
      >
        Qo'shish
      </Button>
    </>
  }
>
  <div className="space-y-4">
    {/* Group info */}
    <div className="p-3 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-100 dark:border-surface-800">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-brand-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-surface-900 dark:text-surface-50">{group.name}</p>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            {activeStudents.length}/{group.maxStudents} o'quvchi ·{" "}
            {group.startTime}–{group.endTime}
          </p>
        </div>
      </div>
    </div>

    <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl space-y-3 relative">
      <div className="flex items-center gap-2 text-brand-700">
        <User className="w-4 h-4" />
        <span className="text-sm font-semibold">Qidiruv</span>
      </div>
      
      {selectedStudentId && selectedStudent ? (
        <div className="flex items-center justify-between p-2 bg-white dark:bg-surface-900 border border-brand-200 rounded-lg">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{selectedStudent.fullName}</span>
            <span className="text-[10px] text-surface-400 dark:text-surface-500 uppercase">{selectedStudent.phone || "Telefon yo'q"}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedStudentId("")}>
            <X className="w-4 h-4 text-danger-500" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            placeholder="O'quvchi ismini yozing..."
            value={studentSearchTerm}
            onChange={(e) => setStudentSearchTerm(e.target.value)}
            icon={studentsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          />
          {/* Qidiruv natijalari dropdowni */}
          {studentSearchTerm.length > 1 && allStudents?.data && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg shadow-xl max-h-48 overflow-auto">
              {availableStudents.length === 0 ? (
                <div className="p-3 text-sm text-surface-400 dark:text-surface-500 text-center">Natija topilmadi yoki guruhda mavjud</div>
              ) : (
                availableStudents.map((u: any) => (
                  <div
                    key={u.id}
                    className="p-3 hover:bg-brand-50 cursor-pointer border-b last:border-0 flex justify-between items-center"
                    onClick={() => { setSelectedStudentId(u.id); setStudentSearchTerm(""); }}
                  >
                    <span className="text-sm">{u.fullName} {u.phone && `(${u.phone})`}</span>
                    <Badge label="Tanlash" status="default" size="sm" className="text-[10px]" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>

  </div>
</Modal>
      </DashboardLayout>
    </RouteGuard>
  );
}


        // <Modal
        //   open={showAddStudentModal}
        //   onClose={() => {
        //     setShowAddStudentModal(false);
        //     setSelectedStudentId("");
        //   }}
        //   title="Guruhga o'quvchi qo'shish"
        //   size="sm"
        //   footer={
        //     <>
        //       <Button
        //         variant="outline"
        //         onClick={() => {
        //           setShowAddStudentModal(false);
        //           setSelectedStudentId("");
        //         }}
        //       >
        //         Bekor qilish
        //       </Button>
        //       <Button
        //         icon={<Check className="w-4 h-4" />}
        //         onClick={handleAddStudent}
        //         loading={addingStudent}
        //         disabled={!selectedStudentId}
        //       >
        //         Qo'shish
        //       </Button>
        //     </>
        //   }
        // >
        //   <div className="space-y-4">
        //     {/* Group info */}
        //     <div className="p-3 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-100 dark:border-surface-800">
        //       <div className="flex items-center gap-3">
        //         <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
        //           <BookOpen className="w-4 h-4 text-brand-600" />
        //         </div>
        //         <div>
        //           <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
        //             {group.name}
        //           </p>
        //           <p className="text-xs text-surface-500 dark:text-surface-400">
        //             {activeStudents.length}/{group.maxStudents} o'quvchi ·{" "}
        //             {group.startTime}–{group.endTime}
        //           </p>
        //         </div>
        //       </div>
        //     </div>

        //     {availableStudents.length === 0 ? (
        //       <div className="text-center py-6 text-surface-400 dark:text-surface-500">
        //         <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
        //         <p className="text-sm">Qo'shish uchun o'quvchi topilmadi</p>
        //       </div>
        //     ) : (
        //       <Select
        //         label="O'quvchini tanlang"
        //         required
        //         value={selectedStudentId}
        //         onChange={(e) => setSelectedStudentId(e.target.value)}
        //         options={[
        //           { value: "", label: "Tanlang..." },
        //           ...availableStudents.map((s) => ({
        //             value: s.id,
        //             label: `${s.fullName}${s.phone ? ` — ${s.phone}` : ""}`,
        //           })),
        //         ]}
        //       />
        //     )}

        //     {/* Selected student info */}
        //     {selectedStudentId && (() => {
        //       const s = availableStudents.find(
        //         (s) => s.id === selectedStudentId
        //       );
        //       if (!s) return null;
        //       return (
        //         <div className="p-3 bg-brand-50 rounded-xl border border-brand-100 space-y-1 text-xs text-brand-700">
        //           <p className="font-semibold">{s.fullName}</p>
        //           {s.phone && <p>📞 {s.phone}</p>}
        //           {s.parentName && <p>👤 Ota-ona: {s.parentName}</p>}
        //           <p>
        //             📚 Guruhlar:{" "}
        //             {s.groupStudents?.filter((gs) => gs.isActive).length ?? 0} ta
        //           </p>
        //         </div>
        //       );
        //     })()}
        //   </div>
        // </Modal>


// detail nomli popka ichida edi bu kodlar

// "use client";
// import { use } from "react";
// import { useRouter } from "next/navigation";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import { Card, CardHeader } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { useGroup } from "@/hooks/use-query";
// import { formatDate } from "@/lib/utils";
// import {
//   ArrowLeft, BookOpen, Clock, Users, User,
//   Calendar, Building2, DollarSign,
// } from "lucide-react";

// export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id } = use(params);
//   const router = useRouter();
//   const { data: group, isLoading } = useGroup(id);

//   if (isLoading) {
//     return (
//       <DashboardLayout>
//         <div className="space-y-4">
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="h-32 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
//           ))}
//         </div>
//       </DashboardLayout>
//     );
//   }

//   if (!group) {
//     return (
//       <DashboardLayout>
//         <div className="text-center py-20">
//           <p className="text-surface-500 dark:text-surface-400">Guruh topilmadi</p>
//           <Button variant="ghost" onClick={() => router.back()} className="mt-4">Orqaga</Button>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   const activeStudents = group.groupStudents?.filter((gs: any) => gs.isActive) ?? [];

//   return (
//     <DashboardLayout>
//       <div className="space-y-5">
//         <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.back()}>
//           Orqaga
//         </Button>

//         {/* Header */}
//         <Card>
//           <div className="flex items-start justify-between gap-4">
//             <div className="flex items-center gap-4">
//               <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center border border-brand-100">
//                 <BookOpen className="w-7 h-7 text-brand-600" />
//               </div>
//               <div>
//                 <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">{group.name}</h2>
//                 <p className="text-sm text-surface-500 dark:text-surface-400">{group.course?.name}</p>
//               </div>
//             </div>
//             <Badge status={group.status} />
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-surface-100 dark:border-surface-800">
//             {[
//               { icon: User, label: "O'qituvchi", value: group.teacher?.fullName ?? "—" },
//               { icon: Clock, label: "Vaqt", value: `${group.startTime}–${group.endTime}` },
//               { icon: Calendar, label: "Kunlar", value: group.scheduleDays },
//               { icon: Building2, label: "Filial", value: group.branch?.name ?? "—" },
//               { icon: Users, label: "O'quvchilar", value: `${activeStudents.length} / ${group.maxStudents}` },
//               { icon: DollarSign, label: "Oylik to'lov", value: group.course ? `${Number(group.course.pricePerMonth).toLocaleString()} so'm` : "—" },
//               { icon: Calendar, label: "Boshlangan", value: formatDate(group.startedAt) },
//             ].map(({ icon: Icon, label, value }) => (
//               <div key={label} className="flex items-start gap-2.5">
//                 <Icon className="w-4 h-4 text-surface-400 dark:text-surface-500 flex-shrink-0 mt-0.5" />
//                 <div>
//                   <p className="text-xs text-surface-500 dark:text-surface-400">{label}</p>
//                   <p className="text-sm font-medium text-surface-800 dark:text-surface-100 mt-0.5">{value}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>

//         {/* Students */}
//         <Card>
//           <CardHeader
//             title="O'quvchilar ro'yxati"
//             subtitle={`${activeStudents.length} ta faol o'quvchi`}
//           />
//           {activeStudents.length === 0 ? (
//             <div className="text-center py-10 text-surface-400 dark:text-surface-500">
//               <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
//               <p className="text-sm">Bu guruhda o'quvchi yo'q</p>
//             </div>
//           ) : (
//             <div className="divide-y divide-surface-50">
//               {activeStudents.map((gs: any, idx: number) => (
//                 <div key={gs.id} className="flex items-center gap-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 rounded-xl px-2 -mx-2 transition-colors cursor-pointer"
//                   onClick={() => router.push(`/students/${gs.student?.id}`)}>
//                   <span className="text-xs text-surface-400 dark:text-surface-500 w-5">{idx + 1}</span>
//                   <Avatar name={gs.student?.fullName ?? "?"} size="sm" />
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-surface-900 dark:text-surface-50">{gs.student?.fullName}</p>
//                     <p className="text-xs text-surface-500 dark:text-surface-400">{gs.student?.phone ?? "—"}</p>
//                   </div>
//                   <div className="text-right">
//                     <Badge status={gs.student?.status ?? "active"} size="sm" />
//                     <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">{formatDate(gs.enrolledAt)}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </Card>
//       </div>
//     </DashboardLayout>
//   );
// }
