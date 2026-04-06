"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { useUsers, useMutationWithToast } from "@/hooks/use-query";
import { authApi, usersApi } from "@/lib/api";
import { formatDate, getErrorMessage, getStatusLabel } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Plus, Search, UserCheck, Mail, Shield, Edit2 } from "lucide-react";
import toast from "react-hot-toast";

const ROLE_OPTIONS = [
  { value: "admin",    label: "Administrator" },
  { value: "manager",  label: "Menejer" },
  { value: "teacher",  label: "O'qituvchi" },
  { value: "asistend", label: "Assistent" },
  { value: "user",     label: "O'quvchi" },
];

const ROLE_COLORS: Record<string, string> = {
  admin:    "bg-brand-50 text-brand-700 border-brand-200",
  manager:  "bg-success-50 text-success-700 border-success-200",
  teacher:  "bg-purple-50 text-purple-700 border-purple-200",
  asistend: "bg-orange-50 text-orange-700 border-orange-200",
  user:     "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: usersData, isLoading, refetch } = useUsers({ page, limit: 15 });

  // Parse users list
  const users: any[] = (() => {
    if (!usersData) return [];
    if (Array.isArray(usersData)) return usersData;
    if (Array.isArray((usersData as any).data)) return (usersData as any).data;
    return [];
  })();

  const total: number = (usersData as any)?.total ?? users.length;
  const totalPages: number = (usersData as any)?.totalPages ?? 1;

  const filtered = search
    ? users.filter((u) =>
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  // Create user form
  const {
    register: regCreate,
    handleSubmit: handleCreate,
    reset: resetCreate,
    formState: { errors: errCreate },
  } = useForm<{ email: string; password: string; role: string }>();

  // Edit role form
  const {
    register: regEdit,
    handleSubmit: handleEdit,
    reset: resetEdit,
    setValue: setEditValue,
  } = useForm<{ role: string }>();

  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const onCreateSubmit = async (data: {
    email: string;
    password: string;
    role: string;
  }) => {
    setCreateLoading(true);
    try {
      await authApi.register({ ...data });
      toast.success("Foydalanuvchi muvaffaqiyatli yaratildi");
      setShowCreateModal(false);
      resetCreate();
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreateLoading(false);
    }
  };

  const onEditSubmit = async (data: { role: string }) => {
    if (!selectedUser) return;
    setEditLoading(true);
    try {
      await usersApi.update(selectedUser.id, { role: data.role });
      toast.success("Rol muvaffaqiyatli yangilandi");
      setShowEditModal(false);
      setSelectedUser(null);
      resetEdit();
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setEditLoading(false);
    }
  };

  const openEdit = (user: any) => {
    setSelectedUser(user);
    setEditValue("role", user.role);
    setShowEditModal(true);
  };

  return (
    <RouteGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">
                Foydalanuvchilar
              </h2>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                Jami: {total} ta foydalanuvchi
              </p>
            </div>
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              Yangi foydalanuvchi
            </Button>
          </div>

          {/* Search */}
          <Card padding="sm">
            <Input
              placeholder="Email bo'yicha qidirish..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Card>

          {/* Users list */}
          <Card padding="none">
            {filtered.length === 0 && !isLoading ? (
              <EmptyState
                icon={UserCheck}
                title="Foydalanuvchilar topilmadi"
                action={{
                  label: "Yangi foydalanuvchi",
                  onClick: () => setShowCreateModal(true),
                }}
              />
            ) : (
              <>
                <div className="divide-y divide-surface-50">
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="px-5 py-4 flex gap-3">
                          <div className="w-8 h-8 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-surface-100 dark:bg-surface-800 rounded animate-pulse w-48" />
                            <div className="h-3 bg-surface-50 dark:bg-surface-900/50 rounded animate-pulse w-32" />
                          </div>
                        </div>
                      ))
                    : filtered.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 transition-colors"
                        >
                          {/* Avatar */}
                          <Avatar name={user.email} size="sm" />

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-surface-900 dark:text-surface-50 truncate">
                                {user.email}
                              </p>
                              {!user.isActive && (
                                <span className="text-xs text-danger-500 bg-danger-50 border border-danger-200 px-2 py-0.5 rounded-full">
                                  Faol emas
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Mail className="w-3 h-3 text-surface-400 dark:text-surface-500" />
                              <span className="text-xs text-surface-500 dark:text-surface-400">
                                {formatDate(user.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Role badge */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                              ROLE_COLORS[user.role] ??
                              "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-700"
                            }`}
                          >
                            <Shield className="w-3 h-3" />
                            {getStatusLabel(user.role)}
                          </span>

                          {/* Edit button */}
                          <button
                            onClick={() => openEdit(user)}
                            className="w-8 h-8 rounded-xl border border-surface-200 dark:border-surface-700 flex items-center justify-center hover:bg-surface-100 dark:hover:bg-surface-800 hover:border-brand-300 transition-colors text-surface-500 dark:text-surface-400 hover:text-brand-600 flex-shrink-0"
                            title="Rolni o'zgartirish"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    limit={15}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </Card>
        </div>

        {/* Create User Modal */}
        <Modal
          open={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetCreate();
          }}
          title="Yangi foydalanuvchi yaratish"
          size="sm"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreate();
                }}
              >
                Bekor qilish
              </Button>
              <Button
                onClick={handleCreate(onCreateSubmit)}
                loading={createLoading}
              >
                Yaratish
              </Button>
            </>
          }
        >
          <form className="space-y-4">
            <Input
              label="Email manzil"
              type="email"
              placeholder="user@educrm.uz"
              required
              error={errCreate.email?.message}
              {...regCreate("email", { required: "Email majburiy" })}
            />
            <Input
              label="Parol"
              type="password"
              placeholder="Kamida 6 ta belgi"
              required
              error={errCreate.password?.message}
              {...regCreate("password", {
                required: "Parol majburiy",
                minLength: { value: 6, message: "Kamida 6 ta belgi" },
              })}
            />
            <Select
              label="Rol"
              required
              options={ROLE_OPTIONS}
              {...regCreate("role", { required: true })}
            />
          </form>
        </Modal>

        {/* Edit Role Modal */}
        <Modal
          open={showEditModal && !!selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            resetEdit();
          }}
          title="Rolni o'zgartirish"
          size="sm"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  resetEdit();
                }}
              >
                Bekor qilish
              </Button>
              <Button
                onClick={handleEdit(onEditSubmit)}
                loading={editLoading}
              >
                Saqlash
              </Button>
            </>
          }
        >
          {selectedUser && (
            <div className="space-y-4">
              {/* User info */}
              <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-100 dark:border-surface-800">
                <Avatar name={selectedUser.email} size="sm" />
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
                    {selectedUser.email}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    Hozirgi rol:{" "}
                    <span className="font-medium">
                      {getStatusLabel(selectedUser.role)}
                    </span>
                  </p>
                </div>
              </div>

              <Select
                label="Yangi rol"
                required
                options={ROLE_OPTIONS}
                {...regEdit("role", { required: true })}
              />

              {/* Warning for admin role */}
              <div className="p-3 bg-warning-50 rounded-xl border border-warning-200">
                <p className="text-xs text-warning-700">
                  ⚠️ Rol o'zgartirilgandan so'ng foydalanuvchi qaytadan tizimga
                  kirishi kerak bo'ladi.
                </p>
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </RouteGuard>
  );
}