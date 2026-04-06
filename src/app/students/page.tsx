"use client";
import { useState, useEffect } from "react";
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
import {
  useStudents,
  useBranches,
  useUsers,
  useMutationWithToast,
} from "@/hooks/use-query";
import { studentsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Plus, Search, GraduationCap, Phone, User as UserIcon, Loader2, X } from "lucide-react";
import type { Student } from "@/types";
import { RouteGuard } from "@/components/layout/route-guard";

export default function StudentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [branchId, setBranchId] = useState("");
  const [showModal, setShowModal] = useState(false);

  // --- QIDIRUV (REMOTE SEARCH) UCHUN STATE-LAR ---
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [debouncedUserSearch, setDebouncedUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Debounce mantiqi
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedUserSearch(userSearchTerm), 500);
    return () => clearTimeout(handler);
  }, [userSearchTerm]);

  // Ma'lumotlarni olish
  const { data, isLoading } = useStudents({
    page,
    limit: 15,
    search: search || undefined,
    status: status || undefined,
    branchId: branchId || undefined,
  });
  
  const { data: branches } = useBranches();
  
  // Faqat qidiruvga mos 5-10 ta userni olish
  const { data: usersData, isLoading: isUsersLoading } = useUsers({ 
    search: debouncedUserSearch, 
    limit: 10 
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Partial<Student & { userId: string }>>();

  const createMutation = useMutationWithToast(
    (formData: Partial<Student>) =>
      studentsApi.create(formData).then((r) => r.data.data),
    {
      successMessage: "O'quvchi muvaffaqiyatli qo'shildi",
      invalidateKeys: ["students"],
    }
  );

  const onSubmit = async (formData: any) => {
    const payload = { ...formData };
    // Tanlangan user bo'lsa, ID sini biriktiramiz
    if (selectedUser) {
      payload.userId = selectedUser.id;
    } else {
      delete payload.userId;
    }
    
    await createMutation.mutateAsync(payload);
    setShowModal(false);
    reset();
    setSelectedUser(null);
    setUserSearchTerm("");
  };

  const columns = [
    {
      key: "fullName",
      title: "O'quvchi",
      render: (_: unknown, row: Student) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.fullName} size="sm" />
          <div>
            <p className="font-medium text-surface-900 dark:text-surface-50">{row.fullName}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {row.phone ?? "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "branch",
      title: "Filial",
      render: (_: unknown, row: Student) => (
        <span className="text-sm text-surface-600 dark:text-surface-400">{row.branch?.name ?? "—"}</span>
      ),
    },
    {
      key: "status",
      title: "Holat",
      render: (v: unknown) => <Badge status={v as string} />,
    },
    {
      key: "createdAt",
      title: "Qo'shilgan",
      render: (v: unknown) => (
        <span className="text-sm text-surface-500 dark:text-surface-400">{formatDate(v as string)}</span>
      ),
    },
  ];

  return (
    <RouteGuard allowedRoles={["admin", "manager"]}>
      <DashboardLayout>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">O'quvchilar</h2>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Jami: {data?.total ?? 0} ta o'quvchi</p>
            </div>
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
              Yangi o'quvchi
            </Button>
          </div>

          {/* Filtrlar qismi (O'z holicha qoldi) */}
          <Card padding="sm">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Ism yoki telefon..."
                  icon={<Search className="w-4 h-4" />}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <div className="w-44">
                <Select
                  options={[
                    { value: "", label: "Barcha holatlar" },
                    { value: "active", label: "Faol" },
                    { value: "inactive", label: "Faol emas" },
                  ]}
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                />
              </div>
              <div className="w-44">
                <SearchableSelect
                  options={[
                    { value: "", label: "Barcha filiallar" },
                    ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
                  ]}
                  value={branchId}
                  name="branchId_filter"
                  onChange={(e) => { setBranchId(e.target.value); setPage(1); }}
                />
              </div>
            </div>
          </Card>

          {/* Jadval (O'z holicha qoldi) */}
          <Card padding="none">
            {data?.data?.length === 0 && !isLoading ? (
              <EmptyState icon={GraduationCap} title="O'quvchilar topilmadi" description="Yangi o'quvchi qo'shing" />
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
                      <TableRow><TableCell colSpan={columns.length} className="text-center h-24">Yuklanmoqda...</TableCell></TableRow>
                    ) : (
                      (data?.data ?? []).map((row: any) => (
                        <TableRow key={row.id} className="cursor-pointer" onClick={() => router.push(`/students/${row.id}`)}>
                          {columns.map((col) => (<TableCell key={col.key}>{col.render(row[col.key], row)}</TableCell>))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {data && (
                    <Pagination 
                      page={data.page} 
                      totalPages={data.totalPages} 
                      total={data.total}   // Jami o'quvchilar soni (backenddan keladi)
                      limit={data.limit}   // Bir sahifadagi limit (backenddan keladi)
                      onPageChange={setPage} 
                    />
                  )}
              </>
            )}
          </Card>
        </div>

        {/* --- MODAL (HAMMA POLYALAR VA QIDIRUV BILAN) --- */}
        <Modal
          open={showModal}
          onClose={() => { setShowModal(false); reset(); setSelectedUser(null); }}
          title="Yangi o'quvchi qo'shish"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowModal(false)}>Bekor qilish</Button>
              <Button onClick={handleSubmit(onSubmit)} loading={createMutation.isPending}>Saqlash</Button>
            </>
          }
        >
          <form className="space-y-4">
            {/* AQLLI USER QIDIRUV (10,000 ta user uchun) */}
            <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl space-y-3 relative">
              <div className="flex items-center gap-2 text-brand-700">
                <UserIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">Tizimga kirish ma'lumotlari (Ixtiyoriy)</span>
              </div>
              
              {selectedUser ? (
                <div className="flex items-center justify-between p-2 bg-white dark:bg-surface-900 border border-brand-200 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{selectedUser.email}</span>
                    <span className="text-[10px] text-surface-400 dark:text-surface-500 uppercase">{selectedUser.role}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                    <X className="w-4 h-4 text-danger-500" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Email orqali qidirish..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    icon={isUsersLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  />
                  {userSearchTerm.length > 1 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg shadow-xl max-h-48 overflow-auto">
                      {usersData?.data?.map((u: any) => (
                        <div
                          key={u.id}
                          className="p-3 hover:bg-brand-50 cursor-pointer border-b last:border-0 flex justify-between items-center"
                          onClick={() => { setSelectedUser(u); setUserSearchTerm(""); }}
                        >
                          <span className="text-sm">{u.email}</span>
                          <Badge label="Tanlash" status="default" size="sm" className="text-[10px]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Input
              label="To'liq ism"
              placeholder="Ali Karimov"
              required
              error={errors.fullName?.message}
              {...register("fullName", { required: "To'liq ism majburiy" })}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input label="Telefon" placeholder="+998..." {...register("phone")} />
              <SearchableSelect
                label="Filial"
                required
                error={errors.branchId?.message}
                options={[
                  { value: "", label: "Tanlang..." },
                  ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
                ]}
                {...register("branchId", { required: "Filial majburiy" })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Ota-ona ismi" placeholder="Karim Karimov" {...register("parentName")} />
              <Input label="Ota-ona telefoni" placeholder="+998..." {...register("parentPhone")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Tug'ilgan sana" type="date" {...register("birthDate")} />
              <Select
                label="Holat"
                options={[
                  { value: "active", label: "Faol" },
                  { value: "inactive", label: "Faol emas" },
                ]}
                {...register("status")}
              />
            </div>
            
            <Input label="Manzil" placeholder="Manzilni kiriting" {...register("address")} />
          </form>
        </Modal>
      </DashboardLayout>
    </RouteGuard>
  );
}

















// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { Avatar } from "@/components/ui/avatar";
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
// import {
//   useStudents,
//   useBranches,
//   useUsers,
//   useMutationWithToast,
// } from "@/hooks/use-query";
// import { studentsApi } from "@/lib/api";
// import { formatDate } from "@/lib/utils";
// import { useForm } from "react-hook-form";
// import { Plus, Search, GraduationCap, Phone, User as UserIcon } from "lucide-react";
// import type { Student } from "@/types";
// import { RouteGuard } from "@/components/layout/route-guard";

// export default function StudentsPage() {
//   const router = useRouter();
//   const [page, setPage] = useState(1);
//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("");
//   const [branchId, setBranchId] = useState("");
//   const [showModal, setShowModal] = useState(false);

//   // Ma'lumotlarni olish
//   const { data, isLoading } = useStudents({
//     page,
//     limit: 15,
//     search: search || undefined,
//     status: status || undefined,
//     branchId: branchId || undefined,
//   });
  
//   const { data: branches } = useBranches();
  
//   // Teachers sahifasidagi kabi chaqiramiz: filtrlarsiz, kengroq limit bilan
//   const { data: usersData, isLoading: isUsersLoading } = useUsers({ limit: 200 });

//   const createMutation = useMutationWithToast(
//     (formData: Partial<Student>) =>
//       studentsApi.create(formData).then((r) => r.data.data),
//     {
//       successMessage: "O'quvchi muvaffaqiyatli qo'shildi",
//       invalidateKeys: ["students"],
//     }
//   );

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<Partial<Student & { userId: string }>>();

//   const onSubmit = async (formData: any) => {
//     const payload = { ...formData };
//     // Agar userId tanlanmagan bo'lsa yoki bo'sh bo'lsa, uni o'chirib yuboramiz
//     if (!payload.userId || payload.userId === "") {
//       delete payload.userId;
//     }
    
//     await createMutation.mutateAsync(payload);
//     setShowModal(false);
//     reset();
//   };

//   const columns = [
//     {
//       key: "fullName",
//       title: "O'quvchi",
//       render: (_: unknown, row: Student) => (
//         <div className="flex items-center gap-3">
//           <Avatar name={row.fullName} size="sm" />
//           <div>
//             <p className="font-medium text-surface-900 dark:text-surface-50">{row.fullName}</p>
//             <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
//               <Phone className="w-3 h-3" /> {row.phone ?? "—"}
//             </p>
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: "branch",
//       title: "Filial",
//       render: (_: unknown, row: Student) => (
//         <span className="text-sm text-surface-600 dark:text-surface-400">
//           {row.branch?.name ?? "—"}
//         </span>
//       ),
//     },
//     {
//       key: "status",
//       title: "Holat",
//       render: (v: unknown) => <Badge status={v as string} />,
//     },
//     {
//       key: "createdAt",
//       title: "Qo'shilgan",
//       render: (v: unknown) => (
//         <span className="text-sm text-surface-500 dark:text-surface-400">
//           {formatDate(v as string)}
//         </span>
//       ),
//     },
//   ];

//   return (
//     <RouteGuard allowedRoles={["admin", "manager"]}>
//       <DashboardLayout>
//         <div className="space-y-5">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">O'quvchilar</h2>
//               <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
//                 Jami: {data?.total ?? 0} ta o'quvchi
//               </p>
//             </div>
//             <Button
//               icon={<Plus className="w-4 h-4" />}
//               onClick={() => setShowModal(true)}
//             >
//               Yangi o'quvchi
//             </Button>
//           </div>

//           {/* Qidiruv va Filtrlar */}
//           <Card padding="sm">
//             <div className="flex flex-wrap gap-3">
//               <div className="flex-1 min-w-[200px]">
//                 <Input
//                   placeholder="Ism yoki telefon..."
//                   icon={<Search className="w-4 h-4" />}
//                   value={search}
//                   onChange={(e) => {
//                     setSearch(e.target.value);
//                     setPage(1);
//                   }}
//                 />
//               </div>
//               <div className="w-44">
//                 <Select
//                   options={[
//                     { value: "", label: "Barcha holatlar" },
//                     { value: "active", label: "Faol" },
//                     { value: "inactive", label: "Faol emas" },
//                   ]}
//                   value={status}
//                   onChange={(e) => {
//                     setStatus(e.target.value);
//                     setPage(1);
//                   }}
//                 />
//               </div>
//               <div className="w-44">
//                 <Select
//                   options={[
//                     { value: "", label: "Barcha filiallar" },
//                     ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
//                   ]}
//                   value={branchId}
//                   onChange={(e) => {
//                     setBranchId(e.target.value);
//                     setPage(1);
//                   }}
//                 />
//               </div>
//             </div>
//           </Card>

//           {/* Jadval qismi */}
//           <Card padding="none">
//             {data?.data?.length === 0 && !isLoading ? (
//               <EmptyState
//                 icon={GraduationCap}
//                 title="O'quvchilar topilmadi"
//                 description="Yangi o'quvchi qo'shing"
//                 action={{
//                   label: "Yangi o'quvchi",
//                   onClick: () => setShowModal(true),
//                 }}
//               />
//             ) : (
//               <>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       {columns.map((col) => (
//                         <TableHead key={col.key}>{col.title}</TableHead>
//                       ))}
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {isLoading ? (
//                       <TableRow>
//                         <TableCell colSpan={columns.length} className="h-24 text-center">
//                           Yuklanmoqda...
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       (data?.data ?? []).map((row: any) => (
//                         <TableRow
//                           key={row.id}
//                           className="cursor-pointer"
//                           onClick={() => router.push(`/students/${row.id}`)}
//                         >
//                           {columns.map((col) => (
//                             <TableCell key={col.key}>
//                               {col.render(row[col.key], row)}
//                             </TableCell>
//                           ))}
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//                 {data && (
//                   <Pagination
//                     page={data.page}
//                     totalPages={data.totalPages}
//                     total={data.total}
//                     limit={data.limit}
//                     onPageChange={setPage}
//                   />
//                 )}
//               </>
//             )}
//           </Card>
//         </div>

//         {/* Modal qismi - TEACHERS bo'limidagi kabi tayyorlandi */}
//         <Modal
//           open={showModal}
//           onClose={() => {
//             setShowModal(false);
//             reset();
//           }}
//           title="Yangi o'quvchi qo'shish"
//           size="md"
//           footer={
//             <>
//               <Button variant="outline" onClick={() => setShowModal(false)}>Bekor qilish</Button>
//               <Button onClick={handleSubmit(onSubmit)} loading={createMutation.isPending}>Saqlash</Button>
//             </>
//           }
//         >
//           <form className="space-y-4">
//             <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl space-y-3">
//               <div className="flex items-center gap-2 text-brand-700">
//                 <UserIcon className="w-4 h-4" />
//                 <span className="text-sm font-semibold">Tizimga kirish ma'lumotlari (Ixtiyoriy)</span>
//               </div>
//               <Select
//                 label="User tanlash"
//                 disabled={isUsersLoading}
//                 options={[
//                   { value: "", label: isUsersLoading ? "Yuklanmoqda..." : "User biriktirmaslik" },
//                   ...(usersData?.data || []).map((u: any) => ({
//                     value: u.id,
//                     label: `${u.email} (${u.role})`
//                   }))
//                 ]}
//                 {...register("userId")}
//               />
//             </div>

//             <Input
//               label="To'liq ism"
//               placeholder="Ali Karimov"
//               required
//               error={errors.fullName?.message}
//               {...register("fullName", { required: "To'liq ism majburiy" })}
//             />
            
//             <div className="grid grid-cols-2 gap-4">
//               <Input
//                 label="Telefon"
//                 placeholder="+998901234567"
//                 {...register("phone")}
//               />
//               <Select
//                 label="Filial"
//                 required
//                 error={errors.branchId?.message}
//                 options={[
//                   { value: "", label: "Tanlang..." },
//                   ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
//                 ]}
//                 {...register("branchId", { required: "Filialni tanlash majburiy" })}
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <Input label="Ota-ona ismi" placeholder="Karim Karimov" {...register("parentName")} />
//               <Input label="Ota-ona telefoni" placeholder="+998901234568" {...register("parentPhone")} />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <Input label="Tug'ilgan sana" type="date" {...register("birthDate")} />
//               <Select
//                 label="Holat"
//                 options={[
//                   { value: "active", label: "Faol" },
//                   { value: "inactive", label: "Faol emas" },
//                 ]}
//                 {...register("status")}
//               />
//             </div>
            
//             <Input label="Manzil" placeholder="Toshkent, Chilonzor" {...register("address")} />
//           </form>
//         </Modal>
//       </DashboardLayout>
//     </RouteGuard>
//   );
// }









// // "use client";
// // import { useState } from "react";
// // import { useRouter } from "next/navigation";
// // import { DashboardLayout } from "@/components/layout/dashboard-layout";
// // import { Card } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Select } from "@/components/ui/select";
// // import { Badge } from "@/components/ui/badge";
// // import { Avatar } from "@/components/ui/avatar";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import { Pagination } from "@/components/ui/pagination";
// // import { Modal } from "@/components/ui/modal";
// // import { EmptyState } from "@/components/ui/empty-state";
// // import {
// //   useStudents,
// //   useBranches,
// //   useUsers,
// //   useMutationWithToast,
// // } from "@/hooks/use-query";
// // import { studentsApi } from "@/lib/api";
// // import { formatDate } from "@/lib/utils";
// // import { useForm } from "react-hook-form";
// // import { Plus, Search, GraduationCap, Phone, User as UserIcon } from "lucide-react";
// // import type { Student } from "@/types";
// // import { RouteGuard } from "@/components/layout/route-guard";

// // export default function StudentsPage() {
// //   const router = useRouter();
// //   const [page, setPage] = useState(1);
// //   const [search, setSearch] = useState("");
// //   const [status, setStatus] = useState("");
// //   const [branchId, setBranchId] = useState("");
// //   const [showModal, setShowModal] = useState(false);

// //   // Data fetching
// //   const { data, isLoading } = useStudents({
// //     page,
// //     limit: 15,
// //     search: search || undefined,
// //     status: status || undefined,
// //     branchId: branchId || undefined,
// //   });
// //   const { data: branches } = useBranches();
  
// //   // Faqat 'student' rolidagi va hali hech kimga biriktirilmagan userlarni olish uchun
// //   // (Eslatma: Backendda filtering bo'lsa yaxshi, bo'lmasa hammasini olib chiqamiz)
// //   const { data: usersData } = useUsers({ role: "student", limit: 100 });

// //   const createMutation = useMutationWithToast(
// //     (formData: Partial<Student>) =>
// //       studentsApi.create(formData).then((r) => r.data.data),
// //     {
// //       successMessage: "O'quvchi muvaffaqiyatli qo'shildi",
// //       invalidateKeys: ["students"],
// //     }
// //   );

// //   const {
// //     register,
// //     handleSubmit,
// //     reset,
// //     formState: { errors },
// //   } = useForm<Partial<Student & { userId: string }>>();

// //   const onSubmit = async (formData: any) => {
// //     // Agar userId tanlanmagan bo'lsa, uni yubormaymiz
// //     const payload = { ...formData };
// //     if (!payload.userId) delete payload.userId;
    
// //     await createMutation.mutateAsync(payload);
// //     setShowModal(false);
// //     reset();
// //   };

// //   const columns = [
// //     {
// //       key: "fullName",
// //       title: "O'quvchi",
// //       render: (_: unknown, row: Student) => (
// //         <div className="flex items-center gap-3">
// //           <Avatar name={row.fullName} size="sm" />
// //           <div>
// //             <p className="font-medium text-surface-900 dark:text-surface-50">{row.fullName}</p>
// //             <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
// //               <Phone className="w-3 h-3" /> {row.phone ?? "—"}
// //             </p>
// //           </div>
// //         </div>
// //       ),
// //     },
// //     {
// //       key: "branch",
// //       title: "Filial",
// //       render: (_: unknown, row: Student) => (
// //         <span className="text-sm text-surface-600 dark:text-surface-400">
// //           {row.branch?.name ?? "—"}
// //         </span>
// //       ),
// //     },
// //     {
// //       key: "status",
// //       title: "Holat",
// //       render: (v: unknown) => <Badge status={v as string} />,
// //     },
// //     {
// //       key: "createdAt",
// //       title: "Qo'shilgan",
// //       render: (v: unknown) => (
// //         <span className="text-sm text-surface-500 dark:text-surface-400">
// //           {formatDate(v as string)}
// //         </span>
// //       ),
// //     },
// //   ];

// //   return (
// //     <RouteGuard allowedRoles={["admin", "manager"]}>
// //       <DashboardLayout>
// //         <div className="space-y-5">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">O'quvchilar</h2>
// //               <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
// //                 Jami: {data?.total ?? 0} ta o'quvchi
// //               </p>
// //             </div>
// //             <Button
// //               icon={<Plus className="w-4 h-4" />}
// //               onClick={() => setShowModal(true)}
// //             >
// //               Yangi o'quvchi
// //             </Button>
// //           </div>

// //           {/* Filters */}
// //           <Card padding="sm">
// //             <div className="flex flex-wrap gap-3">
// //               <div className="flex-1 min-w-[200px]">
// //                 <Input
// //                   placeholder="Ism yoki telefon..."
// //                   icon={<Search className="w-4 h-4" />}
// //                   value={search}
// //                   onChange={(e) => {
// //                     setSearch(e.target.value);
// //                     setPage(1);
// //                   }}
// //                 />
// //               </div>
// //               <div className="w-44">
// //                 <Select
// //                   options={[
// //                     { value: "", label: "Barcha holatlar" },
// //                     { value: "active", label: "Faol" },
// //                     { value: "inactive", label: "Faol emas" },
// //                   ]}
// //                   value={status}
// //                   onChange={(e) => {
// //                     setStatus(e.target.value);
// //                     setPage(1);
// //                   }}
// //                 />
// //               </div>
// //               <div className="w-44">
// //                 <Select
// //                   options={[
// //                     { value: "", label: "Barcha filiallar" },
// //                     ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
// //                   ]}
// //                   value={branchId}
// //                   onChange={(e) => {
// //                     setBranchId(e.target.value);
// //                     setPage(1);
// //                   }}
// //                 />
// //               </div>
// //             </div>
// //           </Card>

// //           {/* Table */}
// //           <Card padding="none">
// //             {data?.data?.length === 0 && !isLoading ? (
// //               <EmptyState
// //                 icon={GraduationCap}
// //                 title="O'quvchilar topilmadi"
// //                 description="Yangi o'quvchi qo'shing"
// //                 action={{
// //                   label: "Yangi o'quvchi",
// //                   onClick: () => setShowModal(true),
// //                 }}
// //               />
// //             ) : (
// //               <>
// //                 <Table>
// //                   <TableHeader>
// //                     <TableRow>
// //                       {columns.map((col) => (
// //                         <TableHead key={col.key}>{col.title}</TableHead>
// //                       ))}
// //                     </TableRow>
// //                   </TableHeader>
// //                   <TableBody>
// //                     {isLoading ? (
// //                       <TableRow>
// //                         <TableCell colSpan={columns.length} className="h-24 text-center">
// //                           Yuklanmoqda...
// //                         </TableCell>
// //                       </TableRow>
// //                     ) : (
// //                       (data?.data ?? []).map((row: any) => (
// //                         <TableRow
// //                           key={row.id}
// //                           className="cursor-pointer"
// //                           onClick={() => router.push(`/students/${row.id}`)}
// //                         >
// //                           {columns.map((col) => (
// //                             <TableCell key={col.key}>
// //                               {col.render(row[col.key], row)}
// //                             </TableCell>
// //                           ))}
// //                         </TableRow>
// //                       ))
// //                     )}
// //                   </TableBody>
// //                 </Table>
// //                 {data && (
// //                   <Pagination
// //                     page={data.page}
// //                     totalPages={data.totalPages}
// //                     total={data.total}
// //                     limit={data.limit}
// //                     onPageChange={setPage}
// //                   />
// //                 )}
// //               </>
// //             )}
// //           </Card>
// //         </div>

// //         {/* Create Modal */}
// //         <Modal
// //           open={showModal}
// //           onClose={() => {
// //             setShowModal(false);
// //             reset();
// //           }}
// //           title="Yangi o'quvchi qo'shish"
// //           size="md"
// //           footer={
// //             <>
// //               <Button variant="outline" onClick={() => setShowModal(false)}>Bekor qilish</Button>
// //               <Button onClick={handleSubmit(onSubmit)} loading={createMutation.isPending}>Saqlash</Button>
// //             </>
// //           }
// //         >
// //           <form className="space-y-4">
// //             {/* User Account Selection - YANGI QO'SHILDI */}
// //             <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl space-y-3">
// //               <div className="flex items-center gap-2 text-brand-700">
// //                 <UserIcon className="w-4 h-4" />
// //                 <span className="text-sm font-semibold">Tizimga kirish ma'lumotlari (Ixtiyoriy)</span>
// //               </div>
// //               <Select
// //                 label="User tanlash"
// //                 options={[
// //                   { value: "", label: "User biriktirmaslik" },
// //                   ...(usersData?.data || []).map((u: any) => ({
// //                     value: u.id,
// //                     label: u.email
// //                   }))
// //                 ]}
// //                 {...register("userId")}
// //               />
// //               <p className="text-[11px] text-brand-600 italic">
// //                 * Agar o'quvchiga user biriktirsangiz, u ushbu email orqali tizimga kira oladi.
// //               </p>
// //             </div>

// //             <Input
// //               label="To'liq ism"
// //               placeholder="Ali Karimov"
// //               required
// //               error={errors.fullName?.message}
// //               {...register("fullName", { required: "To'liq ism majburiy" })}
// //             />
            
// //             <div className="grid grid-cols-2 gap-4">
// //               <Input
// //                 label="Telefon"
// //                 placeholder="+998901234567"
// //                 {...register("phone")}
// //               />
// //               <Select
// //                 label="Filial"
// //                 required
// //                 error={errors.branchId?.message}
// //                 options={[
// //                   { value: "", label: "Tanlang..." },
// //                   ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
// //                 ]}
// //                 {...register("branchId", { required: "Filialni tanlash majburiy" })}
// //               />
// //             </div>

// //             <div className="grid grid-cols-2 gap-4">
// //               <Input label="Ota-ona ismi" placeholder="Karim Karimov" {...register("parentName")} />
// //               <Input label="Ota-ona telefoni" placeholder="+998901234568" {...register("parentPhone")} />
// //             </div>

// //             <div className="grid grid-cols-2 gap-4">
// //               <Input label="Tug'ilgan sana" type="date" {...register("birthDate")} />
// //               <Select
// //                 label="Holat"
// //                 options={[
// //                   { value: "active", label: "Faol" },
// //                   { value: "inactive", label: "Faol emas" },
// //                 ]}
// //                 {...register("status")}
// //               />
// //             </div>
            
// //             <Input label="Manzil" placeholder="Toshkent, Chilonzor" {...register("address")} />
// //           </form>
// //         </Modal>
// //       </DashboardLayout>
// //     </RouteGuard>
// //   );
// // }












// // "use client";
// // import { useState } from "react";
// // import { useRouter } from "next/navigation";
// // import { DashboardLayout } from "@/components/layout/dashboard-layout";
// // import { Card } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Select } from "@/components/ui/select";
// // import { Badge } from "@/components/ui/badge";
// // import { Avatar } from "@/components/ui/avatar";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import { Pagination } from "@/components/ui/pagination";
// // import { Modal } from "@/components/ui/modal";
// // import { EmptyState } from "@/components/ui/empty-state";
// // import {
// //   useStudents,
// //   useBranches,
// //   useMutationWithToast,
// // } from "@/hooks/use-query";
// // import { studentsApi } from "@/lib/api";
// // import { formatDate } from "@/lib/utils";
// // import { useForm } from "react-hook-form";
// // import { Plus, Search, GraduationCap, Phone, Filter } from "lucide-react";
// // import toast from "react-hot-toast";
// // import type { Student } from "@/types";
// // import { RouteGuard } from "@/components/layout/route-guard";

// // export default function StudentsPage() {
// //   const router = useRouter();
// //   const [page, setPage] = useState(1);
// //   const [search, setSearch] = useState("");
// //   const [status, setStatus] = useState("");
// //   const [branchId, setBranchId] = useState("");
// //   const [showModal, setShowModal] = useState(false);

// //   const { data, isLoading } = useStudents({
// //     page,
// //     limit: 15,
// //     search: search || undefined,
// //     status: status || undefined,
// //     branchId: branchId || undefined,
// //   });
// //   const { data: branches } = useBranches();

// //   const createMutation = useMutationWithToast(
// //     (formData: Partial<Student>) =>
// //       studentsApi.create(formData).then((r) => r.data.data),
// //     {
// //       successMessage: "O'quvchi muvaffaqiyatli qo'shildi",
// //       invalidateKeys: ["students"],
// //     },
// //   );

// //   const {
// //     register,
// //     handleSubmit,
// //     reset,
// //     formState: { errors },
// //   } = useForm<Partial<Student>>();

// //   const onSubmit = async (data: Partial<Student>) => {
// //     await createMutation.mutateAsync(data);
// //     setShowModal(false);
// //     reset();
// //   };

// //   // const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Student>>();

// //   // const onSubmit = async (data: Partial<Student>) => {
// //   //   await createMutation.mutateAsync(data);
// //   //   setShowModal(false);
// //   //   reset();
// //   // };

// //   const columns = [
// //     {
// //       key: "fullName",
// //       title: "O'quvchi",
// //       render: (_: unknown, row: Student) => (
// //         <div className="flex items-center gap-3">
// //           <Avatar name={row.fullName} size="sm" />
// //           <div>
// //             <p className="font-medium text-surface-900 dark:text-surface-50">{row.fullName}</p>
// //             <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
// //               <Phone className="w-3 h-3" /> {row.phone ?? "—"}
// //             </p>
// //           </div>
// //         </div>
// //       ),
// //     },
// //     {
// //       key: "parentName",
// //       title: "Ota-onasi",
// //       render: (_: unknown, row: Student) => (
// //         <div>
// //           <p className="text-sm text-surface-700 dark:text-surface-200">{row.parentName ?? "—"}</p>
// //           <p className="text-xs text-surface-500 dark:text-surface-400">{row.parentPhone ?? ""}</p>
// //         </div>
// //       ),
// //     },
// //     {
// //       key: "branch",
// //       title: "Filial",
// //       render: (_: unknown, row: Student) => (
// //         <span className="text-sm text-surface-600 dark:text-surface-400">
// //           {row.branch?.name ?? "—"}
// //         </span>
// //       ),
// //     },
// //     {
// //       key: "status",
// //       title: "Holat",
// //       render: (v: unknown) => <Badge status={v as string} />,
// //     },
// //     {
// //       key: "createdAt",
// //       title: "Qo'shilgan",
// //       render: (v: unknown) => (
// //         <span className="text-sm text-surface-500 dark:text-surface-400">
// //           {formatDate(v as string)}
// //         </span>
// //       ),
// //     },
// //   ];

// //   return (
// //     <RouteGuard allowedRoles={["admin", "manager"]}>
// //       <DashboardLayout>
// //         <div className="space-y-5">
// //           {/* Page header */}
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">
// //                 O'quvchilar
// //               </h2>
// //               <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
// //                 Jami: {data?.total ?? 0} ta o'quvchi
// //               </p>
// //             </div>
// //             <Button
// //               icon={<Plus className="w-4 h-4" />}
// //               onClick={() => setShowModal(true)}
// //             >
// //               Yangi o'quvchi
// //             </Button>
// //           </div>

// //           {/* Filters */}
// //           <Card padding="sm">
// //             <div className="flex flex-wrap gap-3">
// //               <div className="flex-1 min-w-[200px]">
// //                 <Input
// //                   placeholder="Ism, telefon yoki ota-ona ismi..."
// //                   icon={<Search className="w-4 h-4" />}
// //                   value={search}
// //                   onChange={(e) => {
// //                     setSearch(e.target.value);
// //                     setPage(1);
// //                   }}
// //                 />
// //               </div>
// //               <div className="w-44">
// //                 <Select
// //                   options={[
// //                     { value: "", label: "Barcha holatlar" },
// //                     { value: "active", label: "Faol" },
// //                     { value: "inactive", label: "Faol emas" },
// //                     { value: "graduated", label: "Bitirgan" },
// //                     { value: "suspended", label: "To'xtatilgan" },
// //                   ]}
// //                   value={status}
// //                   onChange={(e) => {
// //                     setStatus(e.target.value);
// //                     setPage(1);
// //                   }}
// //                 />
// //               </div>
// //               <div className="w-44">
// //                 <Select
// //                   options={[
// //                     { value: "", label: "Barcha filiallar" },
// //                     ...(branches?.map((b) => ({
// //                       value: b.id,
// //                       label: b.name,
// //                     })) ?? []),
// //                   ]}
// //                   value={branchId}
// //                   onChange={(e) => {
// //                     setBranchId(e.target.value);
// //                     setPage(1);
// //                   }}
// //                 />
// //               </div>
// //             </div>
// //           </Card>

// //           {/* Table */}
// //           <Card padding="none">
// //             {data?.data?.length === 0 && !isLoading ? (
// //               <EmptyState
// //                 icon={GraduationCap}
// //                 title="O'quvchilar topilmadi"
// //                 description="Yangi o'quvchi qo'shing yoki qidiruv shartlarini o'zgartiring"
// //                 action={{
// //                   label: "Yangi o'quvchi",
// //                   onClick: () => setShowModal(true),
// //                 }}
// //               />
// //             ) : (
// //               <>
// //                 <Table>
// //                   <TableHeader>
// //                     <TableRow>
// //                       {columns.map((col) => (
// //                         <TableHead key={col.key}>{col.title}</TableHead>
// //                       ))}
// //                     </TableRow>
// //                   </TableHeader>
// //                   <TableBody>
// //                     {isLoading ? (
// //                       <TableRow>
// //                         <TableCell
// //                           colSpan={columns.length}
// //                           className="h-24 text-center"
// //                         >
// //                           Yuklanmoqda...
// //                         </TableCell>
// //                       </TableRow>
// //                     ) : (
// //                       (data?.data ?? []).map((row: any) => (
// //                         <TableRow
// //                           key={row.id}
// //                           className="cursor-pointer"
// //                           onClick={() => router.push(`/students/${row.id}`)}
// //                         >
// //                           {columns.map((col) => (
// //                             <TableCell key={col.key}>
// //                               {col.render(row[col.key], row)}
// //                             </TableCell>
// //                           ))}
// //                         </TableRow>
// //                       ))
// //                     )}
// //                   </TableBody>
// //                 </Table>
// //                 {data && (
// //                   <Pagination
// //                     page={data.page}
// //                     totalPages={data.totalPages}
// //                     total={data.total}
// //                     limit={data.limit}
// //                     onPageChange={setPage}
// //                   />
// //                 )}
// //               </>
// //             )}
// //           </Card>
// //         </div>

// //         {/* Create Modal */}
// //         <Modal
// //           open={showModal}
// //           onClose={() => {
// //             setShowModal(false);
// //             reset();
// //           }}
// //           title="Yangi o'quvchi qo'shish"
// //           size="md"
// //           footer={
// //             <>
// //               <Button
// //                 variant="outline"
// //                 onClick={() => {
// //                   setShowModal(false);
// //                   reset();
// //                 }}
// //               >
// //                 Bekor qilish
// //               </Button>
// //               <Button
// //                 onClick={handleSubmit(onSubmit)}
// //                 loading={createMutation.isPending}
// //               >
// //                 Saqlash
// //               </Button>
// //             </>
// //           }
// //         >
// //           <form className="space-y-4">
// //             <Input
// //               label="To'liq ism"
// //               placeholder="Ali Karimov"
// //               required
// //               error={errors.fullName?.message}
// //               {...register("fullName", {
// //                 required: "To'liq ism kiritish majburiy",
// //               })}
// //             />
// //             <div className="grid grid-cols-2 gap-4">
// //               <Input
// //                 label="Telefon"
// //                 placeholder="+998901234567"
// //                 error={errors.phone?.message}
// //                 {...register("phone", {
// //                   pattern: {
// //                     value: /^\+?[0-9]{9,13}$/,
// //                     message: "Telefon raqam noto'g'ri formatda",
// //                   },
// //                 })}
// //               />
// //               <Select
// //                 label="Filial"
// //                 required
// //                 error={errors.branchId?.message}
// //                 options={[
// //                   { value: "", label: "Tanlang..." },
// //                   ...(branches?.map((b) => ({ value: b.id, label: b.name })) ??
// //                     []),
// //                 ]}
// //                 {...register("branchId", {
// //                   required: "Filialni tanlash majburiy",
// //                 })}
// //               />
// //             </div>
// //             <div className="grid grid-cols-2 gap-4">
// //               <Input
// //                 label="Ota-ona ismi"
// //                 placeholder="Karim Karimov"
// //                 {...register("parentName")}
// //               />
// //               <Input
// //                 label="Ota-ona telefoni"
// //                 placeholder="+998901234568"
// //                 error={errors.parentPhone?.message}
// //                 {...register("parentPhone", {
// //                   pattern: {
// //                     value: /^\+?[0-9]{9,13}$/,
// //                     message: "Telefon raqam noto'g'ri",
// //                   },
// //                 })}
// //               />
// //             </div>
// //             <div className="grid grid-cols-2 gap-4">
// //               <Input
// //                 label="Tug'ilgan sana"
// //                 type="date"
// //                 error={errors.birthDate?.message}
// //                 {...register("birthDate", {
// //                   validate: (v) => {
// //                     if (!v) return true; // optional
// //                     const d = new Date(v);
// //                     if (isNaN(d.getTime())) return "Sana noto'g'ri";
// //                     if (d > new Date())
// //                       return "Tug'ilgan sana kelajakda bo'lishi mumkin emas";
// //                     return true;
// //                   },
// //                 })}
// //               />
// //               <Select
// //                 label="Holat"
// //                 options={[
// //                   { value: "active", label: "Faol" },
// //                   { value: "inactive", label: "Faol emas" },
// //                 ]}
// //                 {...register("status")}
// //               />
// //             </div>
// //             <Input
// //               label="Manzil"
// //               placeholder="Toshkent, Chilonzor"
// //               {...register("address")}
// //             />
// //           </form>
// //           {/* <form className="space-y-4">
// //           <Input
// //             label="To'liq ism"
// //             placeholder="Ali Karimov"
// //             required
// //             error={errors.fullName?.message}
// //             {...register("fullName", { required: "Ism majburiy" })}
// //           />
// //           <div className="grid grid-cols-2 gap-4">
// //             <Input label="Telefon" placeholder="+998901234567" {...register("phone")} />
// //             <Select
// //               label="Filial"
// //               required
// //               options={[
// //                 { value: "", label: "Tanlang..." },
// //                 ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
// //               ]}
// //               {...register("branchId", { required: true })}
// //             />
// //           </div>
// //           <div className="grid grid-cols-2 gap-4">
// //             <Input label="Ota-ona ismi" placeholder="Karim Karimov" {...register("parentName")} />
// //             <Input label="Ota-ona telefoni" placeholder="+998901234568" {...register("parentPhone")} />
// //           </div>
// //           <div className="grid grid-cols-2 gap-4">
// //             <Input label="Tug'ilgan sana" type="date" {...register("birthDate")} />
// //             <Select
// //               label="Holat"
// //               options={[
// //                 { value: "active", label: "Faol" },
// //                 { value: "inactive", label: "Faol emas" },
// //               ]}
// //               {...register("status")}
// //             />
// //           </div>
// //           <Input label="Manzil" placeholder="Toshkent, Chilonzor" {...register("address")} />
// //         </form> */}
// //         </Modal>
// //       </DashboardLayout>
// //     </RouteGuard>
// //   );
// // }
