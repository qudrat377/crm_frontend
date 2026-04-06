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
import { Avatar } from "@/components/ui/avatar";
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
import { useTeachers, useBranches, useMutationWithToast, useUsers } from "@/hooks/use-query";
import { authApi, teachersApi, usersApi } from "@/lib/api";
import { formatCurrency, formatDate, getErrorMessage } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Plus, Search, Users, Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";
import type { Teacher } from "@/types";
import { RouteGuard } from "@/components/layout/route-guard";

export default function TeachersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"user" | "profile">("user");
  const [createdUserId, setCreatedUserId] = useState("");

  const { data, isLoading } = useTeachers({
    page, limit: 15,
    search: search || undefined,
    branchId: branchId || undefined,
  });

  const { data: branches } = useBranches();
  // const { data: usersData } = useUsers({ role: "teacher", limit: 100 });
  const { data: usersData } = useUsers({ limit: 100 });

  // const getUsersList = () => {
  //   if (!usersData) return [];
  //   if (Array.isArray(usersData)) return usersData;
  //   if (Array.isArray((usersData as any).data)) return (usersData as any).data;
  //   if (Array.isArray((usersData as any).data?.data)) return (usersData as any).data.data;
  //   return [];
  // };

const getUsersList = () => {
  // console.log("usersData RAW:", usersData);
  // console.log("usersData type:", typeof usersData);
  if (!usersData) return [];
  if (Array.isArray(usersData)) return usersData;
  if (Array.isArray((usersData as any).data)) return (usersData as any).data;
  return [];
};


  const [userMode, setUserMode] = useState<"new" | "existing">("new");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Step 1: create user account
  const {
    register: regUser,
    handleSubmit: handleUser,
    formState: { errors: errUser },
    reset: resetUser,
  } = useForm<{ email: string; password: string }>();

  // Step 2: create teacher profile
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: errProfile },
    reset: resetProfile,
  } = useForm<Partial<Teacher>>();

  const createProfileMutation = useMutationWithToast(
    (data: Partial<Teacher>) => teachersApi.create(data).then((r) => r.data.data),
    {
      successMessage: "O'qituvchi muvaffaqiyatli qo'shildi",
      invalidateKeys: ["teachers"],
    },
  );

  const handleUserSubmit = async (data: { email: string; password: string }) => {
    try {
      // Try to register user via axios instance
      const regRes = await authApi.register({ ...data, role: "teacher" });
      setCreatedUserId(regRes.data.data.user.id);
      setStep("profile");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleProfileSubmit = async (data: Partial<Teacher>) => {
    await createProfileMutation.mutateAsync({ ...data, userId: createdUserId });
    setShowModal(false);
    setStep("user");
    resetUser();
    resetProfile();
    setCreatedUserId("");
  };

  const closeModal = () => {
    setShowModal(false);
    setStep("user");
    resetUser();
    resetProfile();
    setCreatedUserId("");
    setUserMode("new");
    setSelectedUserId("");
  };

  const columns = [
    {
      key: "fullName",
      title: "O'qituvchi",
      render: (_: unknown, row: Teacher) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.fullName} size="sm" />
          <div>
            <p className="font-medium text-surface-900 dark:text-surface-50">{row.fullName}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
              <Mail className="w-3 h-3" /> {row.user?.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      title: "Telefon",
      render: (_: unknown, row: Teacher) => (
        <div className="flex items-center gap-1.5 text-sm text-surface-600 dark:text-surface-400">
          <Phone className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500" />
          {row.phone ?? "—"}
        </div>
      ),
    },
    {
      key: "specialization",
      title: "Ixtisoslik",
      render: (v: unknown) => (
        <span className="text-sm text-surface-600 dark:text-surface-400">{(v as string) ?? "—"}</span>
      ),
    },
    {
      key: "branch",
      title: "Filial",
      render: (_: unknown, row: Teacher) => (
        <span className="text-sm text-surface-600 dark:text-surface-400">{row.branch?.name ?? "—"}</span>
      ),
    },
    {
      key: "monthlySalary",
      title: "Maosh",
      render: (v: unknown) => (
        <span className="text-sm font-medium text-surface-800 dark:text-surface-100">
          {formatCurrency(v as number)}
        </span>
      ),
    },
    {
      key: "isActive",
      title: "Holat",
      render: (v: unknown) => (
        <Badge status={v ? "active" : "inactive"} label={v ? "Faol" : "Faol emas"} />
      ),
    },
  ];

  return (
    <RouteGuard allowedRoles={["admin", "manager"]}>
      <DashboardLayout>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">O'qituvchilar</h2>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                Jami: {data?.total ?? 0} ta o'qituvchi
              </p>
            </div>
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
              Yangi o'qituvchi
            </Button>
          </div>

          <Card padding="sm">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Ism yoki ixtisoslik bo'yicha qidirish..."
                  icon={<Search className="w-4 h-4" />}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
                icon={Users}
                title="O'qituvchilar topilmadi"
                action={{ label: "Yangi o'qituvchi", onClick: () => setShowModal(true) }}
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
                          onClick={() => router.push(`/teachers/${row.id}`)}
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
                    page={data.page}
                    totalPages={data.totalPages}
                    total={data.total}
                    limit={data.limit}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </Card>
        </div>

        <Modal
          open={showModal}
          onClose={closeModal}
          title={step === "user" ? "1-qadam: Foydalanuvchi hisobi" : "2-qadam: O'qituvchi profili"}
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={closeModal}>Bekor qilish</Button>
              <Button
                onClick={
                  step === "user"
                    ? (userMode === "new" ? handleUser(handleUserSubmit) : () => {
                      if (!selectedUserId) {
                        import("react-hot-toast").then(m => m.default.error("Foydalanuvchini tanlang!"));
                        return;
                      }
                      setCreatedUserId(selectedUserId);
                      setStep("profile");
                    })
                    : handleProfile(handleProfileSubmit)
                }
                loading={createProfileMutation.isPending}
              >
                {step === "user" ? "Davom etish" : "Saqlash"}
              </Button>
            </>
          }
        >
          {step === "user" ? (
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-surface-100 dark:bg-surface-800 rounded-lg">
                <button
                  type="button"
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${userMode === "new" ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-50 shadow-sm" : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:text-surface-200"}`}
                  onClick={() => setUserMode("new")}
                >
                  Yangi yaratish
                </button>
                <button
                  type="button"
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${userMode === "existing" ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-50 shadow-sm" : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:text-surface-200"}`}
                  onClick={() => setUserMode("existing")}
                >
                  Mavjudni tanlash
                </button>
              </div>

              {userMode === "new" ? (
                <form className="space-y-4">
                  <div className="p-3 bg-brand-50 rounded-xl text-sm text-brand-700 border border-brand-100">
                    O'qituvchi uchun avval tizim hisobi yaratiladi, keyin profil to'ldiriladi.
                  </div>
                  <Input
                    label="Email manzil"
                    type="email"
                    placeholder="teacher@educrm.uz"
                    required
                    error={errUser.email?.message}
                    {...regUser("email", { required: "Email majburiy" })}
                  />
                  <Input
                    label="Parol"
                    type="password"
                    placeholder="Kamida 8 ta belgi"
                    required
                    error={errUser.password?.message}
                    {...regUser("password", { required: "Parol majburiy", minLength: { value: 8, message: "Kamida 8 ta belgi" } })}
                  />
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-brand-50 rounded-xl text-sm text-brand-700 border border-brand-100">
                    Oldin ro'yxatdan o'tgan (lekin profili yo'q) tizim foydalanuvchisini tanlab, unga o'qituvchi profilini yarating.
                  </div>
                  <SearchableSelect
                    label="Foydalanuvchini tanlang"
                    name="selectedUserId"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    options={[
                      { value: "", label: "Tanlang..." },
                      ...getUsersList().map((u: any) => ({ value: u.id, label: u.email }))
                    ]}
                  />
                </div>
              )}
            </div>
          ) : (
            <form className="space-y-4">
              <Input
                label="To'liq ism"
                placeholder="Dilnoza Yusupova"
                required
                error={errProfile.fullName?.message}
                {...regProfile("fullName", { required: "Ism majburiy" })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Telefon" placeholder="+998901111111" {...regProfile("phone")} />
                <SearchableSelect
                  label="Filial"
                  required
                  options={[
                    { value: "", label: "Tanlang..." },
                    ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
                  ]}
                  {...regProfile("branchId", { required: true })}
                />
              </div>
              <Input
                label="Ixtisoslik"
                placeholder="Ingliz tili, IELTS"
                {...regProfile("specialization")}
              />
              <Input
                label="Oylik maosh (so'm)"
                type="number"
                placeholder="3000000"
                {...regProfile("monthlySalary")}
              />
            </form>
          )}
        </Modal>
      </DashboardLayout>
    </RouteGuard>
  );
}
