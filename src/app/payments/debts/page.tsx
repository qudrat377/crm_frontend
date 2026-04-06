"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useDebts, useMutationWithToast } from "@/hooks/use-query";
import { paymentsApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function DebtsPage() {
  const { data: debts, isLoading, refetch } = useDebts();
  
  const resolveMutation = useMutationWithToast(
    (id: string) => paymentsApi.resolveDebt(id),
    {
      successMessage: "Qarz yopildi",
      invalidateKeys: ["debts", "payments"],
      onSuccess: () => refetch()
    }
  );

  if (isLoading) {
    return (
      <RouteGuard allowedRoles={["admin", "manager"]}>
        <DashboardLayout>
          <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  const debtsList = debts || [];

  return (
    <RouteGuard allowedRoles={["admin", "manager"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Qarzdorliklar</h1>
              <p className="text-surface-500 dark:text-surface-400 mt-1">O'quvchilar va boshqa qarzdorliklar tarixi</p>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              {debtsList.length === 0 ? (
                <EmptyState icon={AlertCircle} title="Qarzdorliklar yo'q" description="Tizimda hozircha to'lanmagan qarzlar mavjud emas." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>O'quvchi</TableHead>
                      <TableHead>Guruh</TableHead>
                      <TableHead>Qiymati</TableHead>
                      <TableHead>Holati</TableHead>
                      <TableHead>Sana</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debtsList.map((debt: any) => (
                      <TableRow key={debt.id}>
                        <TableCell>
                          <div className="font-medium text-surface-900 dark:text-surface-50">
                            {debt.student?.fullName || "Noma'lum o'quvchi"}
                          </div>
                        </TableCell>
                        <TableCell className="text-surface-600 dark:text-surface-400">
                          {debt.group?.name || "—"}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-danger-600">{formatCurrency(debt.amount)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            label={debt.status === "resolved" ? "Yopilgan" : "To'lanmagan"} 
                            status={debt.status === "resolved" ? "success" : "danger"} 
                          />
                        </TableCell>
                        <TableCell className="text-surface-500 dark:text-surface-400">
                          {formatDate(debt.createdAt, "dd.MM.yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          {debt.status !== "resolved" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              icon={<CheckCircle2 className="w-4 h-4" />}
                              onClick={() => {
                                if(confirm("Haqiqatdan ham qarzni yopmoqchimisiz?")) {
                                  resolveMutation.mutate(debt.id);
                                }
                              }}
                              disabled={resolveMutation.isPending}
                            >
                              Yopish
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
      </DashboardLayout>
    </RouteGuard>
  );
}
