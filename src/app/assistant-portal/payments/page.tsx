"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { usePayments, useStudents, useGroups, useMutationWithToast } from "@/hooks/use-query";
import { paymentsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency, formatDate, formatMonth, getStatusLabel } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Plus, CreditCard, Search } from "lucide-react";
import type { Payment } from "@/types";

function AssistantPaymentsContent() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const year = new Date().getFullYear();

  const { data, isLoading } = usePayments({ page, limit: 15 });
  const { data: students } = useStudents({ limit: 100, status: "active" });
  const { data: groups } = useGroups({ limit: 100, status: "active" });

  const createMutation = useMutationWithToast(
    (d: Partial<Payment>) => paymentsApi.create(d).then((r) => r.data.data),
    { successMessage: "To'lov qabul qilindi", invalidateKeys: ["payments"] },
  );
  const { register, handleSubmit, reset } = useForm<Partial<Payment>>();
  const onSubmit = async (d: Partial<Payment>) => { await createMutation.mutateAsync(d); setShowModal(false); reset(); };

  const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: formatMonth(i + 1, year) }));
  const payments = data?.data ?? [];
  const filtered = search ? payments.filter((p) => p.student?.fullName.toLowerCase().includes(search.toLowerCase())) : payments;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">To'lovlar</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">To'lov qabul qilish</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}
          className="bg-assistant-600 hover:bg-assistant-700 focus:ring-assistant-500 flex-shrink-0">
          To'lov qabul qilish
        </Button>
      </div>

      <Card padding="sm">
        <Input placeholder="O'quvchi ismi bo'yicha qidirish..." icon={<Search className="w-4 h-4" />}
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </Card>

      <Card padding="none">
        {filtered.length === 0 && !isLoading ? (
          <EmptyState icon={CreditCard} title="To'lovlar topilmadi" />
        ) : (
          <>
            <div className="divide-y divide-surface-50">
              {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex gap-3">
                  <div className="h-4 bg-surface-100 dark:bg-surface-800 rounded animate-pulse flex-1" />
                </div>
              )) : filtered.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 transition-colors">
                  <div className="w-9 h-9 bg-assistant-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4.5 h-4.5 text-assistant-600 w-[18px] h-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-50 truncate">{p.student?.fullName}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">{p.group?.name} · {formatMonth(p.paymentMonth, p.paymentYear)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-success-700">{formatCurrency(p.amount)}</p>
                    <div className="flex items-center gap-1.5 justify-end mt-0.5">
                      <Badge status={p.method} label={getStatusLabel(p.method)} size="sm" />
                      <span className="text-xs text-surface-400 dark:text-surface-500">{formatDate(p.paidAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onPageChange={setPage} />}
          </>
        )}
      </Card>

      <Modal open={showModal} onClose={() => { setShowModal(false); reset(); }} title="To'lov qabul qilish"
        footer={<><Button variant="outline" onClick={() => { setShowModal(false); reset(); }}>Bekor qilish</Button><Button onClick={handleSubmit(onSubmit)} loading={createMutation.isPending} className="bg-assistant-600 hover:bg-assistant-700">Saqlash</Button></>}>
        <form className="space-y-4">
          <SearchableSelect label="O'quvchi" required placeholder="Tanlang..." options={[{ value:"",label:"Tanlang..." }, ...(students?.data?.map((s: any) => ({ value: s.id, label: s.fullName })) ?? [])]} {...register("studentId",{required:true})} />
          <SearchableSelect label="Guruh" required placeholder="Tanlang..." options={[{ value:"",label:"Tanlang..." }, ...(groups?.data?.map((g: any) => ({ value: g.id, label: g.name })) ?? [])]} {...register("groupId",{required:true})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Miqdor (so'm)" type="number" placeholder="600000" required {...register("amount",{required:true})} />
            <Input label="Chegirma" type="number" placeholder="0" {...register("discount")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Oy" options={MONTHS} {...register("paymentMonth")} />
            <Input label="Yil" type="number" defaultValue={year} {...register("paymentYear")} />
          </div>
          <Select label="To'lov usuli" options={[{value:"cash",label:"Naqd"},{value:"card",label:"Karta"},{value:"bank_transfer",label:"Bank o'tkazma"},{value:"online",label:"Online"}]} {...register("method")} />
        </form>
      </Modal>
    </div>
  );
}

export default function AssistantPaymentsPage() {
  return (
    <RouteGuard allowedRoles={["asistend"]}>
      <DashboardLayout><AssistantPaymentsContent /></DashboardLayout>
    </RouteGuard>
  );
}
