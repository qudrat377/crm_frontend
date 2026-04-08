"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader } from "@/components/ui/card";
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
import { usePayments, useDebts, useRevenue, useBranches, useStudents, useGroups, useMutationWithToast } from "@/hooks/use-query";
import { paymentsApi } from "@/lib/api";
import { formatCurrency, formatDate, formatMonth, getStatusLabel } from "@/lib/utils";
import { useForm, Controller } from "react-hook-form"; // Controller qo'shildi
import { Plus, CreditCard, AlertCircle, TrendingUp, Check, Loader2 } from "lucide-react";
import type { Payment } from "@/types";
import { RouteGuard } from "@/components/layout/route-guard";
import RevenueChart from "@/components/charts/revenue-chart";

type Tab = "payments" | "debts" | "revenue";

export default function PaymentsPage() {
  const [tab, setTab] = useState<Tab>("payments");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [branchId, setBranchId] = useState("");
  const [year] = useState(new Date().getFullYear());

  // 1. Ma'lumotlarni yuklash
  const { data: payments, isLoading } = usePayments({ page, limit: 15 });
  const { data: debts, isLoading: debtsLoading } = useDebts({ isResolved: false, branchId: branchId || undefined });
  const { data: branches } = useBranches();
  const { data: students } = useStudents({ limit: 100, status: "active" });
  const { data: groups } = useGroups({ limit: 100, status: "active" });
  const { data: revenue } = useRevenue(branchId || branches?.[0]?.id || "", year);

  const createMutation = useMutationWithToast(
    (data: Partial<Payment>) => paymentsApi.create(data).then((r) => r.data.data),
    { successMessage: "To'lov muvaffaqiyatli qabul qilindi", invalidateKeys: ["payments", "debts"] },
  );

  const resolveDebtMutation = useMutationWithToast(
    (id: string) => paymentsApi.resolveDebt(id),
    { successMessage: "Qarz yopildi", invalidateKeys: ["debts"] },
  );

  // 2. Form sozlamalari
  const { register, handleSubmit, reset, control, watch } = useForm<Partial<Payment>>({
    defaultValues: {
      paymentMonth: new Date().getMonth() + 1,
      paymentYear: year,
      method: "cash",
      status: "paid",
      amount: 0,
      discount: 0
    }
  });

  const onSubmit = async (data: Partial<Payment>) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        amount: Number(data.amount),
        discount: Number(data.discount || 0),
        paymentMonth: Number(data.paymentMonth),
        paymentYear: Number(data.paymentYear),
      });
      setShowModal(false);
      reset();
    } catch (error) {}
  };

  const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: formatMonth(i + 1, year),
  }));

  // Jadval ustunlari (O'zgarishsiz qoldi)
  const paymentColumns = [
    {
      key: "student",
      title: "O'quvchi",
      render: (_: unknown, row: Payment) => (
        <div>
          <p className="font-medium text-surface-900 dark:text-surface-50 text-sm">{row.student?.fullName}</p>
          <p className="text-xs text-surface-500 dark:text-surface-400">{row.group?.name}</p>
        </div>
      ),
    },
    {
      key: "amount",
      title: "Miqdor",
      render: (v: unknown) => (
        <span className="font-semibold text-sm text-success-700">{formatCurrency(v as number)}</span>
      ),
    },
    {
      key: "paymentMonth",
      title: "Oy",
      render: (_: unknown, row: Payment) => (
        <span className="text-sm text-surface-700 dark:text-surface-200">{formatMonth(row.paymentMonth, row.paymentYear)}</span>
      ),
    },
    {
      key: "method",
      title: "Usul",
      render: (v: unknown) => <Badge status={v as string} label={getStatusLabel(v as string)} />,
    },
    {
      key: "status",
      title: "Holat",
      render: (v: unknown) => <Badge status={v as string} />,
    },
    {
      key: "paidAt",
      title: "Sana",
      render: (v: unknown) => (
        <span className="text-xs text-surface-500 dark:text-surface-400">{formatDate(v as string)}</span>
      ),
    },
  ];

  const debtColumns = [
    {
      key: "student",
      title: "O'quvchi",
      render: (_: unknown, row: any) => (
        <div>
          <p className="font-medium text-surface-900 dark:text-surface-50 text-sm">{row.student?.fullName}</p>
          <p className="text-xs text-surface-500 dark:text-surface-400">{row.group?.name}</p>
        </div>
      ),
    },
    {
      key: "amount",
      title: "Qarz miqdori",
      render: (v: unknown) => (
        <span className="font-semibold text-sm text-danger-600">{formatCurrency(v as number)}</span>
      ),
    },
    {
      key: "debtMonth",
      title: "Oy",
      render: (_: unknown, row: any) => (
        <span className="text-sm text-surface-700 dark:text-surface-200">{formatMonth(row.debtMonth, row.debtYear)}</span>
      ),
    },
    {
      key: "id",
      title: "Amal",
      render: (v: unknown) => (
        <Button
          size="sm"
          variant="outline"
          icon={<Check className="w-3.5 h-3.5" />}
          onClick={(e) => { e.stopPropagation(); resolveDebtMutation.mutate(v as string); }}
          loading={resolveDebtMutation.isPending}
        >
          Yopish
        </Button>
      ),
    },
  ];

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "payments", label: "To'lovlar", icon: CreditCard },
    { key: "debts", label: "Qarzlar", icon: AlertCircle },
    { key: "revenue", label: "Daromad", icon: TrendingUp },
  ];

  return (
    <RouteGuard allowedRoles={["admin","manager"]}>
      <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">To'lovlar</h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Moliyaviy boshqaruv</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
            To'lov qabul qilish
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-50 shadow-card"
                  : "text-surface-500 dark:text-surface-400 hover:text-surface-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Payments Tab */}
        {tab === "payments" && (
          <Card padding="none">
            {isLoading ? (
               <div className="p-12 text-center text-surface-500 flex flex-col items-center gap-2">
                 <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                 <span>To'lovlar yuklanmoqda...</span>
               </div>
            ) : payments?.data?.length === 0 ? (
              <EmptyState icon={CreditCard} title="To'lovlar topilmadi" />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {paymentColumns.map((col) => (
                        <TableHead key={col.key}>{col.title}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(payments?.data ?? []).map((row: any) => (
                      <TableRow key={row.id}>
                        {paymentColumns.map((col) => (
                          <TableCell key={col.key}>
                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination
                  page={payments?.page || 1} 
                  totalPages={payments?.totalPages || 1}
                  total={payments?.total || 0} 
                  limit={payments?.limit || 15} 
                  onPageChange={setPage}
                />
              </>
            )}
          </Card>
        )}

        {/* Debts Tab */}
        {tab === "debts" && (
          <div className="space-y-4">
            {debts && debts.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-danger-50 dark:bg-danger-900/10 rounded-2xl border border-danger-100 dark:border-danger-900/20">
                <AlertCircle className="w-6 h-6 text-danger-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-danger-700 dark:text-danger-400">
                    Jami qarz: {formatCurrency(debts.reduce((s, d) => s + Number(d.amount), 0))}
                  </p>
                  <p className="text-xs text-danger-500">{debts.length} ta yopilmagan qarz</p>
                </div>
              </div>
            )}
            <Card padding="none">
              {debtsLoading ? (
                <div className="p-12 text-center text-surface-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-600" /> Yuklanmoqda...</div>
              ) : debts?.length === 0 ? (
                <EmptyState icon={AlertCircle} title="Qarzlar yo'q!" description="Barcha to'lovlar amalga oshirilgan" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {debtColumns.map((col) => (
                        <TableHead key={col.key}>{col.title}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(debts ?? []).map((row: any) => (
                      <TableRow key={row.id}>
                        {debtColumns.map((col) => (
                          <TableCell key={col.key}>
                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        )}

        {/* Revenue Tab */}
        {tab === "revenue" && (
          <div className="space-y-5">
            <div className="w-64">
              <Select
                options={[
                  { value: "", label: "Barcha filiallar" },
                  ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
                ]}
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
              />
            </div>

            {revenue && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card padding="sm">
                    <p className="text-sm text-surface-500 dark:text-surface-400">Yillik daromad</p>
                    <p className="text-2xl font-bold text-surface-900 dark:text-surface-50 mt-1">
                      {formatCurrency(revenue.yearTotal)}
                    </p>
                  </Card>
                  <Card padding="sm">
                    <p className="text-sm text-surface-500 dark:text-surface-400">Jami qarz</p>
                    <p className="text-2xl font-bold text-danger-600 mt-1">
                      {formatCurrency(revenue.outstandingDebt.amount)}
                    </p>
                    <p className="text-xs text-surface-400 dark:text-surface-500">{revenue.outstandingDebt.count} ta yozuv</p>
                  </Card>
                </div>
                <Card>
                  <CardHeader title={`${year} yil oylik daromad`} />
                  <div className="h-[300px] mt-4">
                    <RevenueChart data={revenue.months} />
                  </div>
                </Card>
              </>
            )}
          </div>
        )}
      </div>

      {/* CREATE PAYMENT MODAL */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); reset(); }}
        title="To'lov qabul qilish"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setShowModal(false); reset(); }}>Bekor qilish</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={createMutation.isPending}>Saqlash</Button>
          </div>
        }
      >
        <form className="space-y-4 pt-2">
          {/* SEARCHABLE SELECTLAR CONTROLLER BILAN */}
          <Controller
            name="studentId"
            control={control}
            rules={{ required: "O'quvchini tanlang" }}
            render={({ field, fieldState }) => (
              <SearchableSelect
                label="O'quvchi"
                placeholder="O'quvchi ismini yozing..."
                options={students?.data?.map((s: any) => ({ value: s.id, label: s.fullName })) ?? []}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="groupId"
            control={control}
            rules={{ required: "Guruhni tanlang" }}
            render={({ field, fieldState }) => (
              <SearchableSelect
                label="Guruh"
                placeholder="Guruhni tanlang..."
                options={groups?.data?.map((g: any) => ({ value: g.id, label: g.name })) ?? []}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
                error={fieldState.error?.message}
              />
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Miqdor (so'm)"
              type="number"
              placeholder="600000"
              {...register("amount", { required: "Miqdorni kiriting" })}
            />
            <Input
              label="Chegirma (so'm)"
              type="number"
              placeholder="0"
              {...register("discount")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Oy" options={MONTHS} {...register("paymentMonth")} />
            <Input label="Yil" type="number" {...register("paymentYear")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="To'lov usuli"
              options={[
                { value: "cash", label: "Naqd" },
                { value: "card", label: "Karta" },
                { value: "bank_transfer", label: "Bank o'tkazma" },
                { value: "online", label: "Online" },
              ]}
              {...register("method")}
            />
            <Select
              label="Holat"
              options={[
                { value: "paid", label: "To'landi" },
                { value: "partial", label: "Qisman" },
              ]}
              {...register("status")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">Izoh</label>
            <textarea
              className="w-full rounded-xl border border-surface-200 dark:border-surface-700 px-3.5 py-2.5 text-sm text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none bg-transparent"
              rows={3}
              placeholder="Ixtiyoriy izoh..."
              {...register("note")}
            />
          </div>
        </form>
      </Modal>
    </DashboardLayout>
    </RouteGuard>
  );
}

// "use client";
// import { useState } from "react";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import { Card, CardHeader } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select } from "@/components/ui/select";
// import { SearchableSelect } from "@/components/ui/searchable-select";
// import { Badge } from "@/components/ui/badge";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Pagination } from "@/components/ui/pagination";
// import { Modal } from "@/components/ui/modal";
// import { EmptyState } from "@/components/ui/empty-state";
// // import { RevenueChart } from "@/components/charts/revenue-chart";
// import { usePayments, useDebts, useRevenue, useBranches, useStudents, useGroups, useMutationWithToast } from "@/hooks/use-query";
// import { paymentsApi } from "@/lib/api";
// import { formatCurrency, formatDate, formatMonth, getStatusLabel } from "@/lib/utils";
// import { useForm } from "react-hook-form";
// import { Plus, CreditCard, AlertCircle, TrendingUp, Check } from "lucide-react";
// import type { Payment } from "@/types";
// import { RouteGuard } from "@/components/layout/route-guard";
// import RevenueChart from "@/components/charts/revenue-chart";

// type Tab = "payments" | "debts" | "revenue";

// export default function PaymentsPage() {
//   const [tab, setTab] = useState<Tab>("payments");
//   const [page, setPage] = useState(1);
//   const [showModal, setShowModal] = useState(false);
//   const [branchId, setBranchId] = useState("");
//   const [year] = useState(new Date().getFullYear());

//   const { data: payments, isLoading } = usePayments({ page, limit: 15 });
//   const { data: debts, isLoading: debtsLoading } = useDebts({ isResolved: false, branchId: branchId || undefined });
//   const { data: branches } = useBranches();
//   const { data: students } = useStudents({ limit: 100, status: "active" });
//   const { data: groups } = useGroups({ limit: 100, status: "active" });
//   const { data: revenue } = useRevenue(branchId || branches?.[0]?.id || "", year);

//   const createMutation = useMutationWithToast(
//     (data: Partial<Payment>) => paymentsApi.create(data).then((r) => r.data.data),
//     { successMessage: "To'lov muvaffaqiyatli qabul qilindi", invalidateKeys: ["payments", "debts"] },
//   );

//   const resolveDebtMutation = useMutationWithToast(
//     (id: string) => paymentsApi.resolveDebt(id),
//     { successMessage: "Qarz yopildi", invalidateKeys: ["debts"] },
//   );

//   const { register, handleSubmit, reset } = useForm<Partial<Payment>>();

//   const onSubmit = async (data: Partial<Payment>) => {
//     await createMutation.mutateAsync(data);
//     setShowModal(false);
//     reset();
//   };

//   const MONTHS = Array.from({ length: 12 }, (_, i) => ({
//     value: String(i + 1),
//     label: formatMonth(i + 1, year),
//   }));

//   const paymentColumns = [
//     {
//       key: "student",
//       title: "O'quvchi",
//       render: (_: unknown, row: Payment) => (
//         <div>
//           <p className="font-medium text-surface-900 dark:text-surface-50 text-sm">{row.student?.fullName}</p>
//           <p className="text-xs text-surface-500 dark:text-surface-400">{row.group?.name}</p>
//         </div>
//       ),
//     },
//     {
//       key: "amount",
//       title: "Miqdor",
//       render: (v: unknown) => (
//         <span className="font-semibold text-sm text-success-700">{formatCurrency(v as number)}</span>
//       ),
//     },
//     {
//       key: "paymentMonth",
//       title: "Oy",
//       render: (_: unknown, row: Payment) => (
//         <span className="text-sm text-surface-700 dark:text-surface-200">{formatMonth(row.paymentMonth, row.paymentYear)}</span>
//       ),
//     },
//     {
//       key: "method",
//       title: "Usul",
//       render: (v: unknown) => <Badge status={v as string} label={getStatusLabel(v as string)} />,
//     },
//     {
//       key: "status",
//       title: "Holat",
//       render: (v: unknown) => <Badge status={v as string} />,
//     },
//     {
//       key: "paidAt",
//       title: "Sana",
//       render: (v: unknown) => (
//         <span className="text-xs text-surface-500 dark:text-surface-400">{formatDate(v as string)}</span>
//       ),
//     },
//   ];

//   const debtColumns = [
//     {
//       key: "student",
//       title: "O'quvchi",
//       render: (_: unknown, row: any) => (
//         <div>
//           <p className="font-medium text-surface-900 dark:text-surface-50 text-sm">{row.student?.fullName}</p>
//           <p className="text-xs text-surface-500 dark:text-surface-400">{row.group?.name}</p>
//         </div>
//       ),
//     },
//     {
//       key: "amount",
//       title: "Qarz miqdori",
//       render: (v: unknown) => (
//         <span className="font-semibold text-sm text-danger-600">{formatCurrency(v as number)}</span>
//       ),
//     },
//     {
//       key: "debtMonth",
//       title: "Oy",
//       render: (_: unknown, row: any) => (
//         <span className="text-sm text-surface-700 dark:text-surface-200">{formatMonth(row.debtMonth, row.debtYear)}</span>
//       ),
//     },
//     {
//       key: "id",
//       title: "Amal",
//       render: (v: unknown) => (
//         <Button
//           size="sm"
//           variant="outline"
//           icon={<Check className="w-3.5 h-3.5" />}
//           onClick={(e) => { e.stopPropagation(); resolveDebtMutation.mutate(v as string); }}
//           loading={resolveDebtMutation.isPending}
//         >
//           Yopish
//         </Button>
//       ),
//     },
//   ];

//   const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
//     { key: "payments", label: "To'lovlar", icon: CreditCard },
//     { key: "debts", label: "Qarzlar", icon: AlertCircle },
//     { key: "revenue", label: "Daromad", icon: TrendingUp },
//   ];

//   return (
//     <RouteGuard allowedRoles={["admin","manager"]}>
//       <DashboardLayout>
//       <div className="space-y-5">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">To'lovlar</h2>
//             <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Moliyaviy boshqaruv</p>
//           </div>
//           <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
//             To'lov qabul qilish
//           </Button>
//         </div>

//         {/* Tabs */}
//         <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit">
//           {tabs.map(({ key, label, icon: Icon }) => (
//             <button
//               key={key}
//               onClick={() => setTab(key)}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                 tab === key
//                   ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-50 shadow-card"
//                   : "text-surface-500 dark:text-surface-400 hover:text-surface-700"
//               }`}
//             >
//               <Icon className="w-4 h-4" />
//               {label}
//             </button>
//           ))}
//         </div>

//         {/* Payments Tab */}
//         {tab === "payments" && (
//           <Card padding="none">
//             {payments?.data?.length === 0 && !isLoading ? (
//               <EmptyState icon={CreditCard} title="To'lovlar topilmadi" />
//             ) : (
//               <>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       {paymentColumns.map((col) => (
//                         <TableHead key={col.key}>{col.title}</TableHead>
//                       ))}
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {isLoading ? (
//                       <TableRow>
//                         <TableCell colSpan={paymentColumns.length} className="h-24 text-center">
//                           Yuklanmoqda...
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       (payments?.data ?? []).map((row: any) => (
//                         <TableRow key={row.id}>
//                           {paymentColumns.map((col) => (
//                             <TableCell key={col.key}>
//                               {col.render ? col.render(row[col.key], row) : row[col.key]}
//                             </TableCell>
//                           ))}
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//                 {payments && (
//                   <Pagination
//                     page={payments.page} totalPages={payments.totalPages}
//                     total={payments.total} limit={payments.limit} onPageChange={setPage}
//                   />
//                 )}
//               </>
//             )}
//           </Card>
//         )}

//         {/* Debts Tab */}
//         {tab === "debts" && (
//           <>
//             {/* Debt summary */}
//             {debts && debts.length > 0 && (
//               <div className="flex items-center gap-3 p-4 bg-danger-50 rounded-2xl border border-danger-100">
//                 <AlertCircle className="w-6 h-6 text-danger-500 flex-shrink-0" />
//                 <div>
//                   <p className="text-sm font-semibold text-danger-700">
//                     Jami qarz: {formatCurrency(debts.reduce((s, d) => s + Number(d.amount), 0))}
//                   </p>
//                   <p className="text-xs text-danger-500">{debts.length} ta yopilmagan qarz</p>
//                 </div>
//               </div>
//             )}
//             <Card padding="none">
//               {debts?.length === 0 && !debtsLoading ? (
//                 <EmptyState icon={AlertCircle} title="Qarzlar yo'q!" description="Barcha to'lovlar amalga oshirilgan" />
//               ) : (
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       {debtColumns.map((col) => (
//                         <TableHead key={col.key}>{col.title}</TableHead>
//                       ))}
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {debtsLoading ? (
//                       <TableRow>
//                         <TableCell colSpan={debtColumns.length} className="h-24 text-center">
//                           Yuklanmoqda...
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       (debts ?? []).map((row: any) => (
//                         <TableRow key={row.id}>
//                           {debtColumns.map((col) => (
//                             <TableCell key={col.key}>
//                               {col.render ? col.render(row[col.key], row) : row[col.key]}
//                             </TableCell>
//                           ))}
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               )}
//             </Card>
//           </>
//         )}

//         {/* Revenue Tab */}
//         {tab === "revenue" && (
//           <div className="space-y-5">
//             <div className="flex items-center gap-3">
//               <Select
//                 options={[
//                   { value: "", label: "Filial tanlang..." },
//                   ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
//                 ]}
//                 value={branchId}
//                 onChange={(e) => setBranchId(e.target.value)}
//               />
//             </div>

//             {revenue && (
//               <>
//                 <div className="grid grid-cols-2 gap-4">
//                   <Card padding="sm">
//                     <p className="text-sm text-surface-500 dark:text-surface-400">Yillik daromad</p>
//                     <p className="text-2xl font-bold text-surface-900 dark:text-surface-50 mt-1">
//                       {formatCurrency(revenue.yearTotal)}
//                     </p>
//                   </Card>
//                   <Card padding="sm">
//                     <p className="text-sm text-surface-500 dark:text-surface-400">Jami qarz</p>
//                     <p className="text-2xl font-bold text-danger-600 mt-1">
//                       {formatCurrency(revenue.outstandingDebt.amount)}
//                     </p>
//                     <p className="text-xs text-surface-400 dark:text-surface-500">{revenue.outstandingDebt.count} ta yozuv</p>
//                   </Card>
//                 </div>
//                 <Card>
//                   <CardHeader title={`${year} yil oylik daromad`} />
//                   <RevenueChart data={revenue.months} />
//                 </Card>
//               </>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Create Payment Modal */}
//       <Modal
//         open={showModal}
//         onClose={() => { setShowModal(false); reset(); }}
//         title="To'lov qabul qilish"
//         size="md"
//         footer={
//           <>
//             <Button variant="outline" onClick={() => { setShowModal(false); reset(); }}>Bekor qilish</Button>
//             <Button onClick={handleSubmit(onSubmit)} loading={createMutation.isPending}>Saqlash</Button>
//           </>
//         }
//       >
//         <form className="space-y-4">
//           <SearchableSelect
//             label="O'quvchi"
//             required
//             options={[
//               { value: "", label: "Tanlang..." },
//               ...(students?.data?.map((s: any) => ({ value: s.id, label: s.fullName })) ?? []),
//             ]}
//             {...register("studentId", { required: true })}
//           />
//           <SearchableSelect
//             label="Guruh"
//             required
//             options={[
//               { value: "", label: "Tanlang..." },
//               ...(groups?.data?.map((g: any) => ({ value: g.id, label: g.name })) ?? []),
//             ]}
//             {...register("groupId", { required: true })}
//           />
//           <div className="grid grid-cols-2 gap-4">
//             <Input
//               label="Miqdor (so'm)"
//               type="number"
//               placeholder="600000"
//               required
//               {...register("amount", { required: true })}
//             />
//             <Input
//               label="Chegirma (so'm)"
//               type="number"
//               placeholder="0"
//               {...register("discount")}
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <Select label="Oy" options={MONTHS} {...register("paymentMonth")} />
//             <Input label="Yil" type="number" defaultValue={year} {...register("paymentYear")} />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <Select
//               label="To'lov usuli"
//               options={[
//                 { value: "cash", label: "Naqd" },
//                 { value: "card", label: "Karta" },
//                 { value: "bank_transfer", label: "Bank o'tkazma" },
//                 { value: "online", label: "Online" },
//               ]}
//               {...register("method")}
//             />
//             <Select
//               label="Holat"
//               options={[
//                 { value: "paid", label: "To'landi" },
//                 { value: "partial", label: "Qisman" },
//               ]}
//               {...register("status")}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">Izoh</label>
//             <textarea
//               className="w-full rounded-xl border border-surface-200 dark:border-surface-700 px-3.5 py-2.5 text-sm text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
//               rows={3}
//               placeholder="Ixtiyoriy izoh..."
//               {...register("note")}
//             />
//           </div>
//         </form>
//       </Modal>
//     </DashboardLayout>
//     </RouteGuard>
//   );
// }
