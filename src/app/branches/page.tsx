"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useBranches, useMutationWithToast } from "@/hooks/use-query";
import { branchesApi } from "@/lib/api";
import { useForm } from "react-hook-form";
import { Plus, Building2, MapPin, Phone, Users, BookOpen, GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Branch } from "@/types";
import { RouteGuard } from "@/components/layout/route-guard";

export default function BranchesPage() {
  const [showModal, setShowModal] = useState(false);
  const { data: branches, isLoading } = useBranches();

  const createMutation = useMutationWithToast(
    (data: Partial<Branch>) => branchesApi.create(data).then((r) => r.data.data),
    { successMessage: "Filial muvaffaqiyatli yaratildi", invalidateKeys: ["branches"] },
  );

  const { register, handleSubmit, reset } = useForm<Partial<Branch>>();
  const onSubmit = async (data: Partial<Branch>) => {
    await createMutation.mutateAsync(data);
    setShowModal(false);
    reset();
  };

  return (
    <RouteGuard allowedRoles={["admin","manager"]}>
      <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Filiallar</h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{branches?.length ?? 0} ta filial</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
            Yangi filial
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : branches?.length === 0 ? (
          <Card>
            <EmptyState
              icon={Building2}
              title="Filiallar topilmadi"
              description="Yangi filial yarating"
              action={{ label: "Yangi filial", onClick: () => setShowModal(true) }}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {branches?.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); reset(); }}
        title="Yangi filial yaratish"
        footer={
          <>
            <Button variant="outline" onClick={() => { setShowModal(false); reset(); }}>Bekor qilish</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={createMutation.isPending}>Saqlash</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input label="Filial nomi" placeholder="Chilonzor filiali" required {...register("name", { required: true })} />
          <Input label="Manzil" placeholder="Toshkent, Chilonzor tumani" {...register("address")} />
          <Input label="Telefon" placeholder="+998712345678" {...register("phone")} />
        </form>
      </Modal>
    </DashboardLayout>
    </RouteGuard>
  );
}

function BranchCard({ branch }: { branch: Branch }) {
  const { data: stats } = useQuery({
    queryKey: ["branch-stats", branch.id],
    queryFn: async () => {
      const res = await branchesApi.getStats(branch.id);
      return (res.data as any).data;
    },
  });

  return (
    <Card className="hover:shadow-card-md transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center border border-brand-100">
          <Building2 className="w-5 h-5 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-surface-900 dark:text-surface-50">{branch.name}</h3>
          {branch.address && (
            <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {branch.address}
            </p>
          )}
          {branch.phone && (
            <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" /> {branch.phone}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-surface-50">
        {[
          { icon: GraduationCap, label: "O'quvchi", value: stats?.activeStudents ?? "—", color: "text-brand-600" },
          { icon: Users, label: "O'qituvchi", value: stats?.activeTeachers ?? "—", color: "text-purple-600" },
          { icon: BookOpen, label: "Guruh", value: stats?.activeGroups ?? "—", color: "text-success-600" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="text-center">
            <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
            <p className="text-lg font-bold text-surface-900 dark:text-surface-50">{value}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">{label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
