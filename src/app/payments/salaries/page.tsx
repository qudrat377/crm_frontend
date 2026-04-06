"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { EmptyState } from "@/components/ui/empty-state";
import { useSalaries, useTeachers, useMutationWithToast } from "@/hooks/use-query";
import { paymentsApi } from "@/lib/api";
import { formatCurrency, formatMonth } from "@/lib/utils";
import { Loader2, DollarSign, Plus, CheckCircle2 } from "lucide-react";

export default function SalariesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    teacherId: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: "pending"
  });

  const { data: salariesData, isLoading: isLoadingSalaries, refetch } = useSalaries();
  const salaries = salariesData?.data || (Array.isArray(salariesData) ? salariesData : []);

  const { data: teachersData } = useTeachers({ limit: 100 });
  const teachers = teachersData?.data || [];

  const createMutation = useMutationWithToast(
    (data: any) => paymentsApi.createSalary(data),
    {
      successMessage: "Maosh yozuvi yaratildi",
      invalidateKeys: ["salaries"],
      onSuccess: () => {
        setShowAddModal(false);
        refetch();
      }
    }
  );

  const payMutation = useMutationWithToast(
    (id: string) => paymentsApi.markSalaryPaid(id),
    {
      successMessage: "Maosh to'landi",
      invalidateKeys: ["salaries"],
      onSuccess: () => refetch()
    }
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      amount: Number(formData.amount)
    });
  };

  if (isLoadingSalaries) {
    return (
      <RouteGuard allowedRoles={["admin", "manager"]}>
        <DashboardLayout>
          <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={["admin", "manager"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">O'qituvchilar maoshlari</h1>
              <p className="text-surface-500 dark:text-surface-400 mt-1">Oylik xisoblash va to'lash tizimi</p>
            </div>
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
              Maosh yozish
            </Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              {(salaries || []).length === 0 ? (
                <EmptyState icon={DollarSign} title="Maoshlar yo'q" description="Tizimda hozircha maosh yozuvlari mavjud emas." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>O'qituvchi</TableHead>
                      <TableHead>Davr</TableHead>
                      <TableHead>Qiymati</TableHead>
                      <TableHead>Holati</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(salaries || []).map((salary: any) => (
                      <TableRow key={salary.id}>
                        <TableCell>
                          <div className="font-medium text-surface-900 dark:text-surface-50">
                            {salary.teacher?.fullName || "Noma'lum o'qituvchi"}
                          </div>
                        </TableCell>
                        <TableCell className="text-surface-600 dark:text-surface-400">
                          {formatMonth(salary.month, salary.year)}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-surface-900 dark:text-surface-50">{formatCurrency(salary.amount)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            label={salary.status === "paid" ? "To'langan" : "Kutilmoqda"} 
                            status={salary.status === "paid" ? "success" : "warning"} 
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {salary.status !== "paid" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              icon={<CheckCircle2 className="w-4 h-4" />}
                              onClick={() => {
                                if(confirm("Haqiqatdan ham maoshni to'langan deb belgilaysizmi?")) {
                                  payMutation.mutate(salary.id);
                                }
                              }}
                              disabled={payMutation.isPending}
                            >
                              To'lash
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </div>

        {/* Modal */}
        <Modal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Yangi maosh tayinlash"
        >
          <form className="space-y-4" onSubmit={handleCreate}>
            <SearchableSelect
              label="O'qituvchi"
              required
              name="teacherId"
              value={formData.teacherId}
              onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
              options={[
                { value: "", label: "Tanlang..." },
                ...teachers.map((t: any) => ({ value: t.id, label: t.fullName }))
              ]}
            />
            <Input
              label="Summa"
              type="number"
              required
              min={0}
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Oy"
                required
                value={formData.month.toString()}
                onChange={(e) => setFormData({...formData, month: Number(e.target.value)})}
                options={[
                  { value: "1", label: "Yanvar" },
                  { value: "2", label: "Fevral" },
                  { value: "3", label: "Mart" },
                  { value: "4", label: "Aprel" },
                  { value: "5", label: "May" },
                  { value: "6", label: "Iyun" },
                  { value: "7", label: "Iyul" },
                  { value: "8", label: "Avgust" },
                  { value: "9", label: "Sentyabr" },
                  { value: "10", label: "Oktyabr" },
                  { value: "11", label: "Noyabr" },
                  { value: "12", label: "Dekabr" },
                ]}
              />
              <Input
                label="Yil"
                type="number"
                required
                min={2000}
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
              />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Bekor qilish</Button>
              <Button type="submit" loading={createMutation.isPending}>Saqlash</Button>
            </div>
          </form>
        </Modal>

      </DashboardLayout>
    </RouteGuard>
  );
}
