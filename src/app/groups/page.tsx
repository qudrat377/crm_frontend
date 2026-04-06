"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useGroups, useBranches, useCourses, useTeachers, useMutationWithToast } from "@/hooks/use-query";
import { groupsApi } from "@/lib/api";
import { useForm } from "react-hook-form";
import { Plus, Search, BookOpen, Clock, Users } from "lucide-react";
import type { Group } from "@/types";
import { RouteGuard } from "@/components/layout/route-guard";

export default function GroupsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [branchId, setBranchId] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useGroups({
    page, limit: 15,
    search: search || undefined,
    status: status || undefined,
    branchId: branchId || undefined,
  });
  const { data: branches } = useBranches();
  const { data: courses } = useCourses(branchId || undefined);
  const { data: teachers } = useTeachers({ limit: 100, isActive: true });

  const createMutation = useMutationWithToast(
    (data: Partial<Group>) => groupsApi.create(data).then((r) => r.data.data),
    { successMessage: "Guruh muvaffaqiyatli yaratildi", invalidateKeys: ["groups"] },
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Group>>();

  const onSubmit = async (data: Partial<Group>) => {
  await createMutation.mutateAsync({
    ...data,
    startedAt: data.startedAt || new Date().toISOString().split("T")[0],
    maxStudents: data.maxStudents ? Number(data.maxStudents) : 20,
  });
  setShowModal(false);
  reset();
};

  // const onSubmit = async (data: Partial<Group>) => {
  //   await createMutation.mutateAsync(data);
  //   setShowModal(false);
  //   reset();
  // };

  const DAYS = [
    { value: "Mon,Wed,Fri", label: "Du, Chor, Ju (MWF)" },
    { value: "Tue,Thu,Sat", label: "Se, Pay, Sha (TTS)" },
    { value: "Mon,Tue,Wed,Thu,Fri", label: "Har kuni (M-F)" },
    { value: "Sat,Sun", label: "Shanba, Yakshanba" },
  ];

  const columns = [
    {
      key: "name",
      title: "Guruh nomi",
      render: (_: unknown, row: Group) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
            <BookOpen className="w-4.5 h-4.5 text-brand-600 w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="font-medium text-surface-900 dark:text-surface-50">{row.name}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">{row.course?.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "teacher",
      title: "O'qituvchi",
      render: (_: unknown, row: Group) => (
        <span className="text-sm text-surface-700 dark:text-surface-200">{row.teacher?.fullName ?? "—"}</span>
      ),
    },
    {
      key: "scheduleDays",
      title: "Jadval",
      render: (_: unknown, row: Group) => (
        <div className="flex items-center gap-1.5 text-sm text-surface-600 dark:text-surface-400">
          <Clock className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500" />
          {row.startTime}–{row.endTime}
        </div>
      ),
    },
    {
      key: "studentCount",
      title: "O'quvchilar",
      render: (_: unknown, row: Group) => (
        <div className="flex items-center gap-1.5 text-sm text-surface-700 dark:text-surface-200">
          <Users className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500" />
          {(row as any).studentCount ?? 0} / {row.maxStudents}
        </div>
      ),
    },
    {
      key: "branch",
      title: "Filial",
      render: (_: unknown, row: Group) => (
        <span className="text-sm text-surface-600 dark:text-surface-400">{row.branch?.name ?? "—"}</span>
      ),
    },
    {
      key: "status",
      title: "Holat",
      render: (v: unknown) => <Badge status={v as string} />,
    },
  ];

  return (
    <RouteGuard allowedRoles={["admin","manager"]}>
      <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Guruhlar</h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Jami: {data?.total ?? 0} ta guruh</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
            Yangi guruh
          </Button>
        </div>

        <Card padding="sm">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Guruh nomi bo'yicha qidirish..."
                icon={<Search className="w-4 h-4" />}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="w-40">
              <Select
                options={[
                  { value: "", label: "Barcha holatlar" },
                  { value: "upcoming", label: "Kutilmoqda" },
                  { value: "active", label: "Faol" },
                  { value: "completed", label: "Yakunlangan" },
                  { value: "cancelled", label: "Bekor qilingan" },
                ]}
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              />
            </div>
            <div className="w-44">
              <SearchableSelect
                name="branchId_filter"
                options={[
                  { value: "", label: "Barcha filiallar" },
                  ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
                ]}
                value={branchId}
                onChange={(e) => { setBranchId(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </Card>

        <Card padding="none">
          {data?.data?.length === 0 && !isLoading ? (
            <EmptyState
              icon={BookOpen}
              title="Guruhlar topilmadi"
              action={{ label: "Yangi guruh", onClick: () => setShowModal(true) }}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col.key}>{col.title}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        Yuklanmoqda...
                      </TableCell>
                    </TableRow>
                  ) : (
                    (data?.data ?? []).map((row: any) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/groups/${row.id}`)}
                      >
                        {columns.map((col) => (
                          <TableCell key={col.key}>
                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {data && (
                <Pagination
                  page={data.page} totalPages={data.totalPages}
                  total={data.total} limit={data.limit} onPageChange={setPage}
                />
              )}
            </>
          )}
        </Card>
      </div>

      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); reset(); }}
        title="Yangi guruh yaratish"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => { setShowModal(false); reset(); }}>Bekor qilish</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={createMutation.isPending}>Saqlash</Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Guruh nomi"
              placeholder="IELTS Ertalabki A"
              required
              error={errors.name?.message}
              {...register("name", { required: "Nom majburiy" })}
            />
            <SearchableSelect
              label="Filial"
              required
              options={[
                { value: "", label: "Tanlang..." },
                ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
              ]}
              {...register("branchId", { required: true })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect
              label="Kurs"
              required
              options={[
                { value: "", label: "Tanlang..." },
                ...(courses?.map((c) => ({ value: c.id, label: c.name })) ?? []),
              ]}
              {...register("courseId", { required: true })}
            />
            <SearchableSelect
              label="O'qituvchi"
              required
              options={[
                { value: "", label: "Tanlang..." },
                ...(teachers?.data?.map((t: any) => ({ value: t.id, label: t.fullName })) ?? []),
              ]}
              {...register("teacherId", { required: true })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Kunlar"
              options={DAYS}
              {...register("scheduleDays")}
            />
            <Input label="Boshlanish vaqti" type="time" defaultValue="09:00" {...register("startTime")} />
            <Input label="Tugash vaqti" type="time" defaultValue="11:00" {...register("endTime")} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Max o'quvchi" type="number" defaultValue={20} {...register("maxStudents")} />
            <Select
              label="Holat"
              options={[
                { value: "upcoming", label: "Kutilmoqda" },
                { value: "active", label: "Faol" },
              ]}
              {...register("status")}
            />
            <Input label="Boshlanish sanasi" type="date" {...register("startedAt")} />
          </div>
        </form>
      </Modal>
    </DashboardLayout>
    </RouteGuard>
  );
}
