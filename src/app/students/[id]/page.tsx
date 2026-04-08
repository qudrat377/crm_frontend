"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useStudent, useGroups, useUsers } from "@/hooks/use-query";
import { studentsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { 
  ArrowLeft, Phone, Calendar, MapPin, BookOpen, 
  Plus, UserMinus, Link as LinkIcon, Search, Loader2 
} from "lucide-react";
import toast from "react-hot-toast";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const { data: studentData, isLoading, refetch } = useStudent(id);
  const { data: allGroups } = useGroups({ status: "active", limit: 100 });
  
  const student = studentData as any;

  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showLinkUserModal, setShowLinkUserModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [debouncedUserSearch, setDebouncedUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedUserSearch(userSearchTerm), 500);
    return () => clearTimeout(handler);
  }, [userSearchTerm]);

  const { data: usersData, isLoading: isUsersLoading } = useUsers({ 
    search: debouncedUserSearch, 
    limit: 10 
  });

  if (isLoading) return <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!student) return <div className="p-8 text-center text-surface-500">O'quvchi topilmadi</div>;

  const activeGroups = student.groupStudents?.filter((gs: any) => gs.isActive) ?? [];
  const availableGroups = allGroups?.data?.filter(
    (g: any) => !activeGroups.some((ag: any) => ag.groupId === g.id)
  ) ?? [];

  // 1. Guruhga qo'shish (assignToGroup deb o'zgartirildi)
  const handleAddGroup = async () => {
    if (!selectedGroupId) return;
    setProcessing(true);
    try {
      await studentsApi.assignToGroup(id, selectedGroupId); // <--- SHU YER TUZATILDI
      toast.success("O'quvchi guruhga qo'shildi");
      setShowAddGroupModal(false);
      setSelectedGroupId("");
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Xatolik yuz berdi");
    } finally {
      setProcessing(false);
    }
  };

  // 2. User biriktirish
  const handleLinkUser = async () => {
    if (!selectedUser?.id) return;
    setProcessing(true);
    try {
      await studentsApi.update(id, { userId: selectedUser.id }); 
      toast.success("Foydalanuvchi hisobi biriktirildi");
      setShowLinkUserModal(false);
      refetch();
    } catch (err: any) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <RouteGuard allowedRoles={["admin", "manager"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Orqaga
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <Card>
                <div className="flex flex-col items-center text-center p-4">
                  <Avatar name={student.fullName} size="lg" className="w-20 h-20 text-2xl" />
                  <h2 className="mt-4 text-xl font-bold">{student.fullName}</h2>
                  <Badge 
                    status={student.status || "default"} 
                    className="mt-2" 
                  />
                  
                  <div className="w-full mt-6 space-y-3 text-left">
                    <div className="flex items-center gap-3 text-sm text-surface-600">
                      <Phone className="w-4 h-4" /> {student.phone || "Noma'lum"}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-surface-600">
                      <MapPin className="w-4 h-4" /> {student.address || "Manzil yo'q"}
                    </div>
                  </div>

                  {!student.userId && (
                    <Button 
                      variant="outline" 
                      className="mt-6 w-full" // <--- fullWidth O'RNIGA w-full QO'YILDI
                      size="sm"
                      onClick={() => setShowLinkUserModal(true)}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" /> Login biriktirish
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader 
                  title="Guruhlar" 
                  action={
                    <Button size="sm" onClick={() => setShowAddGroupModal(true)}>
                      <Plus className="w-4 h-4 mr-1" /> Qo'shish
                    </Button>
                  }
                />
                <div className="divide-y">
                  {activeGroups.length === 0 ? (
                    <div className="p-8 text-center text-surface-400">Guruhlar mavjud emas</div>
                  ) : (
                    activeGroups.map((gs: any) => (
                      <div key={gs.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-brand-600" />
                          <div>
                            <p className="font-medium">{gs.group?.name}</p>
                            <p className="text-xs text-surface-500">{gs.group?.scheduleDays}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-danger-500">
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* User Link Modal */}
        <Modal open={showLinkUserModal} onClose={() => setShowLinkUserModal(false)} title="Login biriktirish">
          <div className="space-y-4 pt-2">
            <Input 
              placeholder="Email orqali qidirish..." 
              value={userSearchTerm} 
              onChange={(e) => setUserSearchTerm(e.target.value)}
              // prefix={<Search className="w-4 h-4" />}
            />
            <div className="max-h-60 overflow-y-auto border rounded-xl">
              {isUsersLoading ? <div className="p-4 text-center"><Loader2 className="animate-spin inline" /></div> : 
                usersData?.data?.map((u: any) => (
                  <div 
                    key={u.id} 
                    onClick={() => setSelectedUser(u)}
                    className={`p-3 cursor-pointer flex justify-between ${selectedUser?.id === u.id ? "bg-brand-50" : "hover:bg-surface-50"}`}
                  >
                    <span className="text-sm">{u.email}</span>
                    <Badge status={selectedUser?.id === u.id ? "success" : "default"} />
                  </div>
                ))
              }
            </div>
            <Button className="w-full" disabled={!selectedUser} loading={processing} onClick={handleLinkUser}>
              Saqlash
            </Button>
          </div>
        </Modal>

        {/* Add Group Modal */}
        <Modal open={showAddGroupModal} onClose={() => setShowAddGroupModal(false)} title="Guruhga qo'shish">
          <div className="space-y-4 pt-4">
            <Select
              label="Guruhni tanlang"
              options={[
                { value: "", label: "Tanlang..." },
                ...(availableGroups.map((g: any) => ({ value: g.id, label: g.name })) || [])
              ]}
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            />
            <Button className="w-full" loading={processing} onClick={handleAddGroup}>Qo'shish</Button>
          </div>
        </Modal>
      </DashboardLayout>
    </RouteGuard>
  );
}

// "use client";
// import { use, useState, useEffect } from "react"; // useEffect qo'shildi
// import { useRouter } from "next/navigation";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import { RouteGuard } from "@/components/layout/route-guard";
// import { Card, CardHeader } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Select } from "@/components/ui/select";
// import { Modal } from "@/components/ui/modal";
// import { EmptyState } from "@/components/ui/empty-state";
// import { useStudent, useGroups, useUsers } from "@/hooks/use-query";
// import { studentsApi } from "@/lib/api";
// import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";
// import {
//   ArrowLeft, Phone, User as UserIcon, Calendar, MapPin, BookOpen,
//   CreditCard, Clock, TrendingUp, AlertCircle, Plus,
//   UserMinus, Check, Link as LinkIcon,
//   X,
//   Loader2,
//   Search
// } from "lucide-react";
// import toast from "react-hot-toast";
// import { Input } from "@/components/ui/input";

// export default function StudentDetailPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const resolvedParams = use(params);
//   const id = resolvedParams.id;
//   const router = useRouter();

//   const { data: studentData, isLoading, refetch } = useStudent(id);
//   const { data: allGroups } = useGroups({ status: "active", limit: 100 });

//   const student = studentData as any;

//   const [showAddGroupModal, setShowAddGroupModal] = useState(false);
//   const [showLinkUserModal, setShowLinkUserModal] = useState(false);

//   const [selectedGroupId, setSelectedGroupId] = useState("");
//   const [processing, setProcessing] = useState(false);
//   const [removingGroupId, setRemovingGroupId] = useState<string | null>(null);

//   // --- QIDIRUV STATE-LARI ---
//   const [selectedUser, setSelectedUser] = useState<any>(null);
//   const [userSearchTerm, setUserSearchTerm] = useState("");
//   const [debouncedUserSearch, setDebouncedUserSearch] = useState("");

//   // Debounce mantiqi (500ms kutib keyin so'rov yuboradi)
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedUserSearch(userSearchTerm);
//     }, 500);
//     return () => clearTimeout(handler);
//   }, [userSearchTerm]);

//   const { data: usersData, isLoading: isUsersLoading } = useUsers({
//     search: debouncedUserSearch,
//     limit: 10
//   });

//   if (isLoading) {
//     return (
//       <RouteGuard allowedRoles={["admin", "manager"]}>
//         <DashboardLayout>
//           <div className="space-y-4">
//             {[...Array(3)].map((_, i) => (
//               <div key={i} className="h-32 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
//             ))}
//           </div>
//         </DashboardLayout>
//       </RouteGuard>
//     );
//   }

//   if (!student) {
//     return (
//       <RouteGuard allowedRoles={["admin", "manager"]}>
//         <DashboardLayout>
//           <div className="text-center py-20">
//             <p className="text-surface-500 dark:text-surface-400">O'quvchi topilmadi</p>
//             <Button variant="ghost" onClick={() => router.back()} className="mt-4">Orqaga</Button>
//           </div>
//         </DashboardLayout>
//       </RouteGuard>
//     );
//   }

//   const activeGroups = student.groupStudents?.filter((gs: any) => gs.isActive) ?? [];
//   const payments = student.payments ?? [];
//   const availableGroups = (allGroups?.data ?? []).filter(
//     (g: any) => !activeGroups.some((ag: any) => ag.groupId === g.id)
//   );

//   // --- HANDLERS ---

//   const handleLinkUser = async () => {
//     // selectedUser.id borligini tekshiramiz
//     if (!selectedUser?.id) return toast.error("Userni tanlang");
//     setProcessing(true);
//     try {
//       await studentsApi.update(id, { userId: selectedUser.id } as any);
//       toast.success("Login ma'lumotlari biriktirildi");
//       setShowLinkUserModal(false);
//       setSelectedUser(null);
//       setUserSearchTerm("");
//       refetch();
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message ?? "Xatolik yuz berdi");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleAddToGroup = async () => {
//     if (!selectedGroupId) return toast.error("Guruhni tanlang");
//     setProcessing(true);
//     try {
//       await studentsApi.assignToGroup(id, selectedGroupId);
//       toast.success("O'quvchi guruhga qo'shildi");
//       setShowAddGroupModal(false);
//       setSelectedGroupId("");
//       refetch();
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message ?? "Xatolik yuz berdi");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleRemoveFromGroup = async (groupId: string, groupName: string) => {
//     if (!confirm(`"${groupName}" guruhidan chiqarilsinmi?`)) return;
//     setRemovingGroupId(groupId);
//     try {
//       await studentsApi.removeFromGroup(id, groupId);
//       toast.success("O'quvchi guruhdan chiqarildi");
//       refetch();
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message ?? "Xatolik yuz berdi");
//     } finally {
//       setRemovingGroupId(null);
//     }
//   };

//   return (
//     <RouteGuard allowedRoles={["admin", "manager"]}>
//       <DashboardLayout>
//         <div className="space-y-5">
//           <Button
//             variant="ghost"
//             size="sm"
//             icon={<ArrowLeft className="w-4 h-4" />}
//             onClick={() => router.back()}
//           >
//             Orqaga
//           </Button>

//           {/* Alert */}
//           {!student.userId && (
//             <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
//               <div className="flex items-center gap-3 text-amber-700">
//                 <AlertCircle className="w-5 h-5" />
//                 <p className="text-sm font-medium">Bu o'quvchi CRMga kira olishi uchun User biriktirish shart.</p>
//               </div>
//               <Button 
//                 size="sm" 
//                 variant="outline" 
//                 onClick={() => setShowLinkUserModal(true)}
//               >
//                 User biriktirish
//               </Button>
//             </div>
//           )}

//           <Card>
//             <div className="flex items-start gap-5">
//               <Avatar name={student.fullName} size="lg" className="w-16 h-16 text-xl" />
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-start justify-between gap-4">
//                   <div>
//                     <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">{student.fullName}</h2>
//                     <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{student.branch?.name}</p>
//                   </div>
//                   <Badge status={student.status} />
//                 </div>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
//                   <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
//                     <Phone className="w-4 h-4" /> {student.phone || "—"}
//                   </div>
//                   {student.user && (
//                     <div className="flex items-center gap-2 text-sm text-brand-600 font-semibold truncate">
//                       <LinkIcon className="w-4 h-4" /> {student.user.email}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </Card>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//              {/* Guruhlar va To'lovlar qismi (O'zgarishsiz qoldi) */}
//              {/* ... */}
//           </div>
//         </div>

//         {/* Modal: User Biriktirish (To'g'irlangan qismi) */}
//         <Modal
//           open={showLinkUserModal}
//           onClose={() => { setShowLinkUserModal(false); setSelectedUser(null); setUserSearchTerm(""); }}
//           title="Foydalanuvchini Biriktirish"
//           size="sm"
//           footer={
//             <>
//               <Button variant="outline" onClick={() => setShowLinkUserModal(false)}>Bekor qilish</Button>
//               <Button onClick={handleLinkUser} loading={processing} disabled={!selectedUser}>Biriktirish</Button>
//             </>
//           }
//         >
//           <div className="space-y-4">
//             <p className="text-sm text-surface-500 dark:text-surface-400">Tizimdagi mavjud foydalanuvchini (email orqali) qidirib biriktiring:</p>
            
//             <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl space-y-3 relative">
//               <div className="flex items-center gap-2 text-brand-700">
//                 <UserIcon className="w-4 h-4" />
//                 <span className="text-sm font-semibold">Qidiruv</span>
//               </div>
              
//               {selectedUser ? (
//                 <div className="flex items-center justify-between p-2 bg-white dark:bg-surface-900 border border-brand-200 rounded-lg">
//                   <div className="flex flex-col">
//                     <span className="text-sm font-medium">{selectedUser.email}</span>
//                     <span className="text-[10px] text-surface-400 dark:text-surface-500 uppercase">{selectedUser.role}</span>
//                   </div>
//                   <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
//                     <X className="w-4 h-4 text-danger-500" />
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="relative">
//                   <Input
//                     placeholder="Email orqali qidirish..."
//                     value={userSearchTerm}
//                     onChange={(e) => setUserSearchTerm(e.target.value)}
//                     icon={isUsersLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
//                   />
//                   {/* Qidiruv natijalari dropdowni */}
//                   {userSearchTerm.length > 1 && usersData?.data && (
//                     <div className="absolute z-50 w-full mt-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg shadow-xl max-h-48 overflow-auto">
//                       {usersData.data.length === 0 ? (
//                         <div className="p-3 text-sm text-surface-400 dark:text-surface-500 text-center">Natija topilmadi</div>
//                       ) : (
//                         usersData.data.map((u: any) => (
//                           <div
//                             key={u.id}
//                             className="p-3 hover:bg-brand-50 cursor-pointer border-b last:border-0 flex justify-between items-center"
//                             onClick={() => { setSelectedUser(u); setUserSearchTerm(""); }}
//                           >
//                             <span className="text-sm">{u.email}</span>
//                             <Badge label="Tanlash" status="default" size="sm" className="text-[10px]" />
//                           </div>
//                         ))
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </Modal>

//         {/* Modal: Guruhga Qo'shish */}
//         <Modal
//           open={showAddGroupModal}
//           onClose={() => setShowAddGroupModal(false)}
//           title="Guruhga qo'shish"
//           size="sm"
//           footer={
//             <>
//               <Button variant="outline" onClick={() => setShowAddGroupModal(false)}>Bekor qilish</Button>
//               <Button onClick={handleAddToGroup} loading={processing} disabled={!selectedGroupId}>Qo'shish</Button>
//             </>
//           }
//         >
//           <div className="space-y-4">
//             <Select
//               label="Guruhni tanlang"
//               value={selectedGroupId}
//               onChange={(e) => setSelectedGroupId(e.target.value)}
//               options={[
//                 { value: "", label: "Guruhni tanlang..." },
//                 ...availableGroups.map((g: any) => ({ value: g.id, label: `${g.name} (${g.scheduleDays})` }))
//               ]}
//             />
//           </div>
//         </Modal>

//       </DashboardLayout>
//     </RouteGuard>
//   );
// }



















// "use client";
// import { use, useState } from "react";
// import { useRouter } from "next/navigation";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import { RouteGuard } from "@/components/layout/route-guard";
// import { Card, CardHeader } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Select } from "@/components/ui/select";
// import { Modal } from "@/components/ui/modal";
// import { EmptyState } from "@/components/ui/empty-state";
// import { useStudent, useGroups, useUsers } from "@/hooks/use-query";
// import { studentsApi } from "@/lib/api";
// import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";
// import {
//   ArrowLeft, Phone, User as UserIcon, Calendar, MapPin, BookOpen,
//   CreditCard, Clock, TrendingUp, AlertCircle, Plus,
//   UserMinus, Check, Link as LinkIcon
// } from "lucide-react";
// import toast from "react-hot-toast";

// // --- Types (Xatoliklarni oldini olish uchun) ---
// interface User {
//   id: string;
//   email: string;
//   role: string;
//   isActive: boolean;
// }

// interface Student {
//   id: string;
//   fullName: string;
//   phone?: string;
//   address?: string;
//   birthDate?: string;
//   status: string;
//   userId?: string; // Bog'langan user IDsi
//   user?: User;     // Bog'langan user obyekti
//   branch?: { name: string };
//   paymentSummary?: {
//     totalPaid: number;
//     totalDebt: number;
//   };
//   groupStudents?: Array<{
//     id: string;
//     groupId: string;
//     isActive: boolean;
//     enrolledAt: string;
//     group?: {
//       name: string;
//       startTime: string;
//       endTime: string;
//       scheduleDays: string;
//     };
//   }>;
//   createdAt: string;
// }

// export default function StudentDetailPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const resolvedParams = use(params);
//   const id = resolvedParams.id;
//   const router = useRouter();
  
//   // Data Fetching
//   const { data: studentData, isLoading, refetch } = useStudent(id);
//   const student = studentData as unknown as Student; // Type casting xatoliklarni yopish uchun

//   const { data: allGroups } = useGroups({ status: "active", limit: 100 });
//   const { data: usersData } = useUsers({ role: "student", limit: 100 });

//   // Modals State
//   const [showAddGroupModal, setShowAddGroupModal] = useState(false);
//   const [showLinkUserModal, setShowLinkUserModal] = useState(false);
  
//   // Form States
//   const [selectedGroupId, setSelectedGroupId] = useState("");
//   const [selectedUserId, setSelectedUserId] = useState("");
//   const [processing, setProcessing] = useState(false);
//   const [removingGroupId, setRemovingGroupId] = useState<string | null>(null);

//   if (isLoading) {
//     return (
//       <RouteGuard allowedRoles={["admin", "manager"]}>
//         <DashboardLayout>
//           <div className="space-y-4">
//             {[...Array(3)].map((_, i) => (
//               <div key={i} className="h-32 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
//             ))}
//           </div>
//         </DashboardLayout>
//       </RouteGuard>
//     );
//   }

//   if (!student) {
//     return (
//       <RouteGuard allowedRoles={["admin", "manager"]}>
//         <DashboardLayout>
//           <div className="text-center py-20">
//             <p className="text-surface-500 dark:text-surface-400">O'quvchi topilmadi</p>
//             <Button variant="ghost" onClick={() => router.back()} className="mt-4">Orqaga</Button>
//           </div>
//         </DashboardLayout>
//       </RouteGuard>
//     );
//   }

//   const activeGroups = student.groupStudents?.filter((gs) => gs.isActive) ?? [];
//   const payments = (student as any)?.payments ?? [];
//   const availableGroups = (allGroups?.data ?? []).filter(
//     (g) => !activeGroups.some((ag) => ag.groupId === g.id)
//   );

//   // --- Handlers ---

//   const handleLinkUser = async () => {
//     if (!selectedUserId) return toast.error("Userni tanlang");
//     setProcessing(true);
//     try {
//       // Backendga userIdni yuboramiz. Partial<Student> xatoligi endi chiqmaydi.
//       await studentsApi.update(id, { userId: selectedUserId } as any);
//       toast.success("Foydalanuvchi muvaffaqiyatli biriktirildi");
//       setShowLinkUserModal(false);
//       refetch();
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message ?? "Xatolik yuz berdi");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleAddToGroup = async () => {
//     if (!selectedGroupId) return toast.error("Guruhni tanlang");
//     setProcessing(true);
//     try {
//       await studentsApi.assignToGroup(id, selectedGroupId);
//       toast.success("O'quvchi guruhga qo'shildi");
//       setShowAddGroupModal(false);
//       setSelectedGroupId("");
//       refetch();
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message ?? "Xatolik yuz berdi");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleRemoveFromGroup = async (groupId: string, groupName: string) => {
//     if (!confirm(`"${groupName}" guruhidan chiqarilsinmi?`)) return;
//     setRemovingGroupId(groupId);
//     try {
//       await studentsApi.removeFromGroup(id, groupId);
//       toast.success("O'quvchi guruhdan chiqarildi");
//       refetch();
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message ?? "Xatolik yuz berdi");
//     } finally {
//       setRemovingGroupId(null);
//     }
//   };

//   return (
//     <RouteGuard allowedRoles={["admin", "manager"]}>
//       <DashboardLayout>
//         <div className="space-y-5">
//           <Button
//             variant="ghost"
//             size="sm"
//             icon={<ArrowLeft className="w-4 h-4" />}
//             onClick={() => router.back()}
//           >
//             Orqaga
//           </Button>

//           {/* User Account Alert */}
//           {!student.userId && (
//             <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
//               <div className="flex items-center gap-3 text-amber-700">
//                 <AlertCircle className="w-5 h-5" />
//                 <p className="text-sm font-medium">Bu o'quvchiga tizimga kirish uchun User biriktirilmagan.</p>
//               </div>
//               <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100" onClick={() => setShowLinkUserModal(true)}>
//                 User biriktirish
//               </Button>
//             </div>
//           )}

//           {/* Profile Header */}
//           <Card>
//             <div className="flex items-start gap-5">
//               <Avatar name={student.fullName} size="lg" className="w-16 h-16 text-xl" />
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-start justify-between gap-4">
//                   <div>
//                     <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">{student.fullName}</h2>
//                     <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{student.branch?.name}</p>
//                   </div>
//                   <Badge status={student.status} />
//                 </div>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
//                   <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
//                     <Phone className="w-4 h-4 text-surface-400 dark:text-surface-500" /> {student.phone || "Noma'lum"}
//                   </div>
//                   {student.user && (
//                     <div className="flex items-center gap-2 text-sm text-brand-600 font-semibold">
//                       <LinkIcon className="w-4 h-4" /> {student.user.email}
//                     </div>
//                   )}
//                   {student.birthDate && (
//                     <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
//                       <Calendar className="w-4 h-4 text-surface-400 dark:text-surface-500" /> {formatDate(student.birthDate, "dd.MM.yyyy")}
//                     </div>
//                   )}
//                   {student.address && (
//                     <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
//                       <MapPin className="w-4 h-4 text-surface-400 dark:text-surface-500" /> {student.address}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </Card>

//           {/* Stats Section */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <Card padding="sm">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center">
//                   <TrendingUp className="w-5 h-5 text-success-600" />
//                 </div>
//                 <div>
//                   <p className="text-xs text-surface-500 dark:text-surface-400">Jami to'lagan</p>
//                   <p className="text-sm font-bold text-surface-900 dark:text-surface-50">{formatCurrency(student.paymentSummary?.totalPaid || 0)}</p>
//                 </div>
//               </div>
//             </Card>
//             <Card padding="sm">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-danger-50 rounded-xl flex items-center justify-center">
//                   <AlertCircle className="w-5 h-5 text-danger-500" />
//                 </div>
//                 <div>
//                   <p className="text-xs text-surface-500 dark:text-surface-400">Qarz</p>
//                   <p className="text-sm font-bold text-surface-900 dark:text-surface-50">{formatCurrency(student.paymentSummary?.totalDebt || 0)}</p>
//                 </div>
//               </div>
//             </Card>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//             {/* Groups Card */}
//             <Card>
//               <CardHeader 
//                 title="Guruhlar" 
//                 subtitle="Faol guruhlari"
//                 action={<Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddGroupModal(true)}>Qo'shish</Button>}
//               />
//               {activeGroups.length === 0 ? (
//                 <EmptyState icon={BookOpen} title="Guruhlar yo'q" description="Hali birorta guruhga qo'shilmagan" />
//               ) : (
//                 <div className="space-y-3">
//                   {activeGroups.map((gs) => (
//                     <div key={gs.id} className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-100 dark:border-surface-800">
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium text-surface-900 dark:text-surface-50">{gs.group?.name}</p>
//                         <p className="text-xs text-surface-500 dark:text-surface-400">{gs.group?.scheduleDays} | {gs.group?.startTime}-{gs.group?.endTime}</p>
//                       </div>
//                       <button 
//                         onClick={() => handleRemoveFromGroup(gs.groupId, gs.group?.name || "")}
//                         disabled={removingGroupId === gs.groupId}
//                         className="p-2 text-surface-400 dark:text-surface-500 hover:text-danger-500 transition-colors disabled:opacity-30"
//                       >
//                         <UserMinus className="w-4 h-4" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </Card>

//             {/* Payments Card */}
//             <Card>
//               <CardHeader title="So'nggi to'lovlar" subtitle="Oxirgi 5 ta" />
//               {payments.length > 0 ? (
//                 <div className="space-y-2">
//                   {payments.slice(0, 5).map((p: any) => (
//                     <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
//                       <div>
//                         <p className="text-sm font-medium">{formatMonth(p.paymentMonth, p.paymentYear)}</p>
//                         <p className="text-xs text-surface-500 dark:text-surface-400">{p.group?.name}</p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm font-bold text-success-600">{formatCurrency(p.amount)}</p>
//                         <Badge status={p.status} size="sm" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <EmptyState icon={CreditCard} title="To'lovlar yo'q" />
//               )}
//             </Card>
//           </div>
//         </div>

//         {/* Modal: Link User */}
//         <Modal
//           open={showLinkUserModal}
//           onClose={() => setShowLinkUserModal(false)}
//           title="User biriktirish"
//           size="sm"
//           footer={
//             <>
//               <Button variant="outline" onClick={() => setShowLinkUserModal(false)}>Bekor qilish</Button>
//               <Button onClick={handleLinkUser} loading={processing} disabled={!selectedUserId}>Saqlash</Button>
//             </>
//           }
//         >
//           <div className="space-y-4">
//             <p className="text-sm text-surface-500 dark:text-surface-400">Student shaxsiy kabinetga kira olishi uchun unga "student" rolidagi userni biriktiring:</p>
//             <Select
//               label="Userni tanlang"
//               value={selectedUserId}
//               onChange={(e) => setSelectedUserId(e.target.value)}
//               options={[
//                 { value: "", label: "Tanlang..." },
//                 ...(usersData?.data || []).map((u: User) => ({ value: u.id, label: u.email }))
//               ]}
//             />
//           </div>
//         </Modal>

//         {/* Modal: Add to Group */}
//         <Modal
//           open={showAddGroupModal}
//           onClose={() => setShowAddGroupModal(false)}
//           title="Guruhga qo'shish"
//           size="sm"
//           footer={
//             <>
//               <Button variant="outline" onClick={() => setShowAddGroupModal(false)}>Bekor qilish</Button>
//               <Button onClick={handleAddToGroup} loading={processing} disabled={!selectedGroupId}>Qo'shish</Button>
//             </>
//           }
//         >
//           <Select
//             label="Guruhni tanlang"
//             value={selectedGroupId}
//             onChange={(e) => setSelectedGroupId(e.target.value)}
//             options={[
//               { value: "", label: "Tanlang..." },
//               ...availableGroups.map(g => ({ value: g.id, label: `${g.name} (${g.scheduleDays})` }))
//             ]}
//           />
//         </Modal>

//       </DashboardLayout>
//     </RouteGuard>
//   );
// }




















// "use client";
// import { use, useState } from "react";
// import { useRouter } from "next/navigation";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import { RouteGuard } from "@/components/layout/route-guard";
// import { Card, CardHeader } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Select } from "@/components/ui/select";
// import { Modal } from "@/components/ui/modal";
// import { EmptyState } from "@/components/ui/empty-state";
// import { useStudent, useGroups, useMutationWithToast } from "@/hooks/use-query";
// import { studentsApi } from "@/lib/api";
// import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";
// import {
//   ArrowLeft, Phone, User, Calendar, MapPin, BookOpen,
//   CreditCard, Clock, TrendingUp, AlertCircle, Plus,
//   UserMinus, Check,
// } from "lucide-react";
// import toast from "react-hot-toast";

// export default function StudentDetailPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = use(params);
//   const router = useRouter();
//   const { data: student, isLoading, refetch } = useStudent(id);
//   const [showAddGroupModal, setShowAddGroupModal] = useState(false);
//   const [selectedGroupId, setSelectedGroupId] = useState("");
//   const [addingGroup, setAddingGroup] = useState(false);
//   const [removingGroupId, setRemovingGroupId] = useState<string | null>(null);

//   // Active groups to show in dropdown
//   const { data: allGroups } = useGroups({ status: "active", limit: 100 });

//   const activeGroups =
//     student?.groupStudents?.filter((gs) => gs.isActive) ?? [];
//   const payments = (student as any)?.payments ?? [];
//   const debts = (student as any)?.debts ?? [];

//   // Already enrolled group ids
//   const enrolledGroupIds = new Set(
//     activeGroups.map((gs) => gs.groupId)
//   );

//   // Filter out already enrolled groups
//   const availableGroups = (allGroups?.data ?? []).filter(
//     (g) => !enrolledGroupIds.has(g.id)
//   );

//   const handleAddToGroup = async () => {
//     if (!selectedGroupId) {
//       toast.error("Guruhni tanlang");
//       return;
//     }
//     setAddingGroup(true);
//     try {
//       await studentsApi.assignToGroup(id, selectedGroupId);
//       toast.success("O'quvchi guruhga qo'shildi");
//       setShowAddGroupModal(false);
//       setSelectedGroupId("");
//       refetch();
//     } catch (err: any) {
//       toast.error(
//         err?.response?.data?.message ?? "Xatolik yuz berdi"
//       );
//     } finally {
//       setAddingGroup(false);
//     }
//   };

//   const handleRemoveFromGroup = async (groupId: string, groupName: string) => {
//     if (!confirm(`"${groupName}" guruhidan chiqarilsinmi?`)) return;
//     setRemovingGroupId(groupId);
//     try {
//       await studentsApi.removeFromGroup(id, groupId);
//       toast.success("O'quvchi guruhdan chiqarildi");
//       refetch();
//     } catch (err: any) {
//       toast.error(
//         err?.response?.data?.message ?? "Xatolik yuz berdi"
//       );
//     } finally {
//       setRemovingGroupId(null);
//     }
//   };

//   if (isLoading) {
//     return (
//       <RouteGuard allowedRoles={["admin", "manager"]}>
//         <DashboardLayout>
//           <div className="space-y-4">
//             {[...Array(3)].map((_, i) => (
//               <div
//                 key={i}
//                 className="h-32 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse"
//               />
//             ))}
//           </div>
//         </DashboardLayout>
//       </RouteGuard>
//     );
//   }

//   if (!student) {
//     return (
//       <RouteGuard allowedRoles={["admin", "manager"]}>
//         <DashboardLayout>
//           <div className="text-center py-20">
//             <p className="text-surface-500 dark:text-surface-400">O'quvchi topilmadi</p>
//             <Button
//               variant="ghost"
//               onClick={() => router.back()}
//               className="mt-4"
//             >
//               Orqaga
//             </Button>
//           </div>
//         </DashboardLayout>
//       </RouteGuard>
//     );
//   }

//   return (
//     <RouteGuard allowedRoles={["admin", "manager"]}>
//       <DashboardLayout>
//         <div className="space-y-5">
//           {/* Back */}
//           <Button
//             variant="ghost"
//             size="sm"
//             icon={<ArrowLeft className="w-4 h-4" />}
//             onClick={() => router.back()}
//           >
//             Orqaga
//           </Button>

//           {/* Profile Header */}
//           <Card>
//             <div className="flex items-start gap-5">
//               <Avatar
//                 name={student.fullName}
//                 size="lg"
//                 className="w-16 h-16 text-xl"
//               />
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-start justify-between gap-4">
//                   <div>
//                     <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">
//                       {student.fullName}
//                     </h2>
//                     <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
//                       {student.branch?.name}
//                     </p>
//                   </div>
//                   <Badge status={student.status} />
//                 </div>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
//                   {student.phone && (
//                     <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
//                       <Phone className="w-4 h-4 text-surface-400 dark:text-surface-500" />
//                       {student.phone}
//                     </div>
//                   )}
//                   {student.parentName && (
//                     <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
//                       <User className="w-4 h-4 text-surface-400 dark:text-surface-500" />
//                       {student.parentName}
//                     </div>
//                   )}
//                   {student.birthDate && (
//                     <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
//                       <Calendar className="w-4 h-4 text-surface-400 dark:text-surface-500" />
//                       {formatDate(student.birthDate, "dd.MM.yyyy")}
//                     </div>
//                   )}
//                   {student.address && (
//                     <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
//                       <MapPin className="w-4 h-4 text-surface-400 dark:text-surface-500" />
//                       {student.address}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </Card>

//           {/* Stats */}
//           {student.paymentSummary && (
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <Card padding="sm">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center">
//                     <TrendingUp className="w-5 h-5 text-success-600" />
//                   </div>
//                   <div>
//                     <p className="text-xs text-surface-500 dark:text-surface-400">Jami to'lagan</p>
//                     <p className="text-sm font-bold text-surface-900 dark:text-surface-50">
//                       {formatCurrency(student.paymentSummary.totalPaid)}
//                     </p>
//                   </div>
//                 </div>
//               </Card>
//               <Card padding="sm">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-danger-50 rounded-xl flex items-center justify-center">
//                     <AlertCircle className="w-5 h-5 text-danger-500" />
//                   </div>
//                   <div>
//                     <p className="text-xs text-surface-500 dark:text-surface-400">Qarz</p>
//                     <p className="text-sm font-bold text-surface-900 dark:text-surface-50">
//                       {formatCurrency(student.paymentSummary.totalDebt)}
//                     </p>
//                   </div>
//                 </div>
//               </Card>
//               <Card padding="sm">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
//                     <BookOpen className="w-5 h-5 text-brand-600" />
//                   </div>
//                   <div>
//                     <p className="text-xs text-surface-500 dark:text-surface-400">Faol guruhlar</p>
//                     <p className="text-sm font-bold text-surface-900 dark:text-surface-50">
//                       {activeGroups.length} ta
//                     </p>
//                   </div>
//                 </div>
//               </Card>
//               <Card padding="sm">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
//                     <Clock className="w-5 h-5 text-purple-600" />
//                   </div>
//                   <div>
//                     <p className="text-xs text-surface-500 dark:text-surface-400">Ro'yxatga olingan</p>
//                     <p className="text-sm font-bold text-surface-900 dark:text-surface-50">
//                       {formatDate(student.createdAt)}
//                     </p>
//                   </div>
//                 </div>
//               </Card>
//             </div>
//           )}

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//             {/* Groups */}
//             <Card>
//               <CardHeader
//                 title="Guruhlar"
//                 subtitle={`${activeGroups.length} ta faol guruh`}
//                 action={
//                   <Button
//                     size="sm"
//                     icon={<Plus className="w-4 h-4" />}
//                     onClick={() => setShowAddGroupModal(true)}
//                   >
//                     Guruhga qo'shish
//                   </Button>
//                 }
//               />

//               {activeGroups.length === 0 ? (
//                 <EmptyState
//                   icon={BookOpen}
//                   title="Hech qanday guruhga qo'shilmagan"
//                   description="O'quvchini guruhga qo'shing"
//                   action={{
//                     label: "Guruhga qo'shish",
//                     onClick: () => setShowAddGroupModal(true),
//                   }}
//                 />
//               ) : (
//                 <div className="space-y-3">
//                   {activeGroups.map((gs) => (
//                     <div
//                       key={gs.id}
//                       className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-100 dark:border-surface-800 hover:border-brand-200 transition-colors"
//                     >
//                       <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
//                         <BookOpen className="w-4 h-4 text-brand-600" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium text-surface-900 dark:text-surface-50 truncate">
//                           {gs.group?.name}
//                         </p>
//                         <div className="flex items-center gap-3 mt-0.5 text-xs text-surface-500 dark:text-surface-400">
//                           <span className="flex items-center gap-1">
//                             <Clock className="w-3 h-3" />
//                             {gs.group?.startTime}–{gs.group?.endTime}
//                           </span>
//                           <span>{gs.group?.scheduleDays}</span>
//                         </div>
//                         <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
//                           Qo'shilgan: {formatDate(gs.enrolledAt)}
//                         </p>
//                       </div>
//                       <button
//                         onClick={() =>
//                           handleRemoveFromGroup(
//                             gs.groupId,
//                             gs.group?.name ?? "guruh"
//                           )
//                         }
//                         disabled={removingGroupId === gs.groupId}
//                         className="w-8 h-8 rounded-xl border border-surface-200 dark:border-surface-700 flex items-center justify-center hover:bg-danger-50 hover:border-danger-200 transition-colors text-surface-400 dark:text-surface-500 hover:text-danger-500 flex-shrink-0 disabled:opacity-40"
//                         title="Guruhdan chiqarish"
//                       >
//                         {removingGroupId === gs.groupId ? (
//                           <span className="w-3 h-3 border-2 border-danger-400 border-t-transparent rounded-full animate-spin" />
//                         ) : (
//                           <UserMinus className="w-3.5 h-3.5" />
//                         )}
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </Card>

//             {/* Recent Payments */}
//             <Card>
//               <CardHeader
//                 title="So'nggi to'lovlar"
//                 subtitle="Oxirgi 5 ta"
//               />
//               {payments.length > 0 ? (
//                 <div className="space-y-2">
//                   {payments.slice(0, 5).map((p: any) => (
//                     <div
//                       key={p.id}
//                       className="flex items-center justify-between py-2 border-b border-surface-50 last:border-0"
//                     >
//                       <div>
//                         <p className="text-sm font-medium text-surface-800 dark:text-surface-100">
//                           {formatMonth(p.paymentMonth, p.paymentYear)}
//                         </p>
//                         <p className="text-xs text-surface-500 dark:text-surface-400">
//                           {p.group?.name}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm font-semibold text-success-700">
//                           {formatCurrency(p.amount)}
//                         </p>
//                         <Badge status={p.status} size="sm" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <EmptyState
//                   icon={CreditCard}
//                   title="To'lovlar yo'q"
//                 />
//               )}
//             </Card>
//           </div>
//         </div>

//         {/* Add to Group Modal */}
//         <Modal
//           open={showAddGroupModal}
//           onClose={() => {
//             setShowAddGroupModal(false);
//             setSelectedGroupId("");
//           }}
//           title="Guruhga qo'shish"
//           size="sm"
//           footer={
//             <>
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setShowAddGroupModal(false);
//                   setSelectedGroupId("");
//                 }}
//               >
//                 Bekor qilish
//               </Button>
//               <Button
//                 icon={<Check className="w-4 h-4" />}
//                 onClick={handleAddToGroup}
//                 loading={addingGroup}
//                 disabled={!selectedGroupId}
//               >
//                 Qo'shish
//               </Button>
//             </>
//           }
//         >
//           <div className="space-y-4">
//             {/* Student info */}
//             <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-100 dark:border-surface-800">
//               <Avatar name={student.fullName} size="sm" />
//               <div>
//                 <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
//                   {student.fullName}
//                 </p>
//                 <p className="text-xs text-surface-500 dark:text-surface-400">
//                   Hozir {activeGroups.length} ta guruhda
//                 </p>
//               </div>
//             </div>

//             {availableGroups.length === 0 ? (
//               <div className="text-center py-6 text-surface-400 dark:text-surface-500">
//                 <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
//                 <p className="text-sm">
//                   Barcha faol guruhlarga allaqachon qo'shilgan
//                 </p>
//               </div>
//             ) : (
//               <Select
//                 label="Guruhni tanlang"
//                 required
//                 value={selectedGroupId}
//                 onChange={(e) => setSelectedGroupId(e.target.value)}
//                 options={[
//                   { value: "", label: "Tanlang..." },
//                   ...availableGroups.map((g) => ({
//                     value: g.id,
//                     label: `${g.name} (${g.startTime}–${g.endTime}, ${g.scheduleDays}) — ${g.studentCount ?? 0}/${g.maxStudents}`,
//                   })),
//                 ]}
//               />
//             )}

//             {selectedGroupId && (
//               (() => {
//                 const g = availableGroups.find(
//                   (g) => g.id === selectedGroupId
//                 );
//                 if (!g) return null;
//                 return (
//                   <div className="p-3 bg-brand-50 rounded-xl border border-brand-100 space-y-1.5 text-xs text-brand-700">
//                     <p className="font-semibold">{g.name}</p>
//                     <p>📚 Kurs: {g.course?.name ?? "—"}</p>
//                     <p>👨‍🏫 O'qituvchi: {g.teacher?.fullName ?? "—"}</p>
//                     <p>🕐 Vaqt: {g.startTime}–{g.endTime}</p>
//                     <p>📅 Kunlar: {g.scheduleDays}</p>
//                     <p>
//                       👥 O'quvchilar: {g.studentCount ?? 0}/{g.maxStudents}
//                       {(g.studentCount ?? 0) >= g.maxStudents && (
//                         <span className="ml-2 text-danger-600 font-medium">
//                           ⚠️ Guruh to'lgan!
//                         </span>
//                       )}
//                     </p>
//                   </div>
//                 );
//               })()
//             )}
//           </div>
//         </Modal>
//       </DashboardLayout>
//     </RouteGuard>
//   );
// }
