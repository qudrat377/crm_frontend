"use client";
import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useBranches, useMutationWithToast } from "@/hooks/use-query";
import { coursesApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useForm, Controller } from "react-hook-form";
import {
  Plus, BookMarked, Clock, DollarSign, CheckCircle, XCircle,
} from "lucide-react";
import type { Course } from "@/types";
import { RouteGuard } from "@/components/layout/route-guard";
import { useQuery } from "@tanstack/react-query";

export default function CoursesPage() {
  const [branchId, setBranchId] = useState<string | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const { data: branches } = useBranches();

  // Barcha filiallar uchun parallel so'rovlar
  const allBranchQueries = useQueries({
    queries: (branches ?? []).map((branch) => ({
      queryKey: ["courses", branch.id],
      queryFn: () => coursesApi.getAll(branch.id).then((r) => r.data.data),
      enabled: !!branches && !branchId, // faqat "Barcha filiallar" tanlanganda
    })),
  });

  // Bitta filial tanlanganda
const singleQuery = useQuery({
  queryKey: ["courses", branchId],
  queryFn: () => coursesApi.getAll(branchId!).then((r) => r.data.data),
  enabled: !!branchId,
});

// Barcha filiallar — har birini alohida, lekin combine bilan
const allQueries = useQueries({
  queries: (branches ?? []).map((branch) => ({
    queryKey: ["courses", branch.id],
    queryFn: (): Promise<Course[]> =>
      coursesApi.getAll(branch.id).then((r) => r.data.data),
    enabled: !branchId && !!branches,
  })),
  combine: (results) => ({
    data: results.flatMap((r) => r.data ?? []),
    isLoading: results.some((r) => r.isLoading),
  }),
});

const isLoading = branchId ? singleQuery.isLoading : allQueries.isLoading;
const courses: Course[] = branchId ? (singleQuery.data ?? []) : allQueries.data;

  const createMutation = useMutationWithToast(
    (data: Partial<Course>) => coursesApi.create(data).then((r) => r.data.data),
    {
      successMessage: "Kurs muvaffaqiyatli yaratildi",
      invalidateKeys: ["courses"],
    },
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<Partial<Course>>();

  const onSubmit = async (data: Partial<Course>) => {
    try {
      await createMutation.mutateAsync(data);
      setShowModal(false);
      reset();
    } catch (error: any) {
      const responseData = error?.response?.data;
      if (responseData?.errors) {
        Object.entries(responseData.errors).forEach(([field, message]) => {
          setError(field as keyof Partial<Course>, {
            type: "server",
            message: message as string,
          });
        });
      } else if (responseData?.field) {
        setError(responseData.field as keyof Partial<Course>, {
          type: "server",
          message: responseData.message,
        });
      } else {
        const msg = responseData?.message || "Ma'lumotlarni tekshiring";
        setError("root", { type: "server", message: msg });
      }
    }
  };

  return (
    <RouteGuard allowedRoles={["admin", "manager"]}>
      <DashboardLayout>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">
                Kurslar
              </h2>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                {courses.length} ta kurs
              </p>
            </div>
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
              Yangi kurs
            </Button>
          </div>

          <div className="w-56">
            <SearchableSelect
              name="branchId_filter"
              options={[
                { value: "", label: "Barcha filiallar" },
                ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
              ]}
              value={branchId ?? ""}
              onChange={(e) =>
                setBranchId(e.target.value === "" ? undefined : e.target.value)
              }
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-36 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <Card>
              <EmptyState
                icon={BookMarked}
                title="Kurslar topilmadi"
                action={{ label: "Yangi kurs", onClick: () => setShowModal(true) }}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-card-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center border border-brand-100">
                        <BookMarked className="w-5 h-5 text-brand-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-surface-900 dark:text-surface-50 text-sm">
                          {course.name}
                        </h3>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          {course.branch?.name}
                        </p>
                      </div>
                    </div>
                    {course.isActive ? (
                      <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-surface-300 flex-shrink-0" />
                    )}
                  </div>
                  {course.description && (
                    <p className="text-xs text-surface-500 dark:text-surface-400 mb-3 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-surface-50">
                    <div className="flex items-center gap-1 text-sm font-semibold text-success-700">
                      <DollarSign className="w-3.5 h-3.5" />
                      {formatCurrency(course.pricePerMonth)}/oy
                    </div>
                    <div className="flex items-center gap-1 text-xs text-surface-500 dark:text-surface-400">
                      <Clock className="w-3.5 h-3.5" />
                      {course.durationMonths} oy
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Modal
          open={showModal}
          onClose={() => { setShowModal(false); reset(); }}
          title="Yangi kurs yaratish"
          footer={
            <>
              <Button variant="outline" onClick={() => { setShowModal(false); reset(); }}>
                Bekor qilish
              </Button>
              <Button onClick={handleSubmit(onSubmit)} loading={createMutation.isPending}>
                Saqlash
              </Button>
            </>
          }
        >
          <form className="space-y-4">
            <Input
              label="Kurs nomi"
              placeholder="IELTS tayyorlov kursi"
              required
              error={errors.name?.message}
              {...register("name", { required: "Kurs nomini kiriting" })}
            />

            <Controller
              name="branchId"
              control={control}
              rules={{ required: "Filialni tanlang" }}
              render={({ field, fieldState }) => (
                <SearchableSelect
                  label="Filial"
                  required
                  error={fieldState.error?.message}
                  options={[
                    { value: "", label: "Tanlang..." },
                    ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
                  ]}
                  name={field.name}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />

            <Input
              label="Oylik to'lov (so'm)"
              type="number"
              placeholder="600000"
              error={errors.pricePerMonth?.message}
              {...register("pricePerMonth", { required: "Oylik to'lovni kiriting" })}
            />

            <Input
              label="Davomiyligi (oy)"
              type="number"
              placeholder="6"
              error={errors.durationMonths?.message}
              {...register("durationMonths", { required: "Davomiyligini kiriting" })}
            />

            {errors.root && (
              <p className="text-sm text-red-500">{errors.root.message}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">
                Tavsif
              </label>
              <textarea
                className="w-full rounded-xl border border-surface-200 dark:border-surface-700 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                rows={3}
                placeholder="Kurs haqida qisqacha ma'lumot..."
                {...register("description")}
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
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { SearchableSelect } from "@/components/ui/searchable-select";
// import { Modal } from "@/components/ui/modal";
// import { EmptyState } from "@/components/ui/empty-state";
// import {
//   useCourses,
//   useBranches,
//   useMutationWithToast,
// } from "@/hooks/use-query";
// import { coursesApi } from "@/lib/api";
// import { formatCurrency } from "@/lib/utils";
// import { useForm, Controller } from "react-hook-form";
// import {
//   Plus,
//   BookMarked,
//   Clock,
//   DollarSign,
//   CheckCircle,
//   XCircle,
// } from "lucide-react";
// import type { Course } from "@/types";
// import { RouteGuard } from "@/components/layout/route-guard";

// export default function CoursesPage() {
//   // const [branchId, setBranchId] = useState("");
//   const [branchId, setBranchId] = useState<string | undefined>(undefined);

//   const [showModal, setShowModal] = useState(false);
//   const { data: courses, isLoading } = useCourses(branchId || undefined);
//   const { data: branches } = useBranches();
//   // const { data: courses, isLoading } = useCourses(branchId);

//   const createMutation = useMutationWithToast(
//     (data: Partial<Course>) => coursesApi.create(data).then((r) => r.data.data),
//     {
//       successMessage: "Kurs muvaffaqiyatli yaratildi",
//       invalidateKeys: ["courses"],
//     },
//   );

//   const {
//     register,
//     handleSubmit,
//     reset,
//     control,
//     setError,
//     formState: { errors },
//   } = useForm<Partial<Course>>();

//   const onSubmit = async (data: Partial<Course>) => {
//     try {
//       await createMutation.mutateAsync(data);
//       setShowModal(false);
//       reset();
//     } catch (error: any) {
//       const responseData = error?.response?.data;

//       // Backend { field: "pricePerMonth", message: "..." } yoki
//       // { errors: { pricePerMonth: "..." } } formatida qaytarsa
//       if (responseData?.errors) {
//         Object.entries(responseData.errors).forEach(([field, message]) => {
//           setError(field as keyof Partial<Course>, {
//             type: "server",
//             message: message as string,
//           });
//         });
//       } else if (responseData?.field) {
//         setError(responseData.field as keyof Partial<Course>, {
//           type: "server",
//           message: responseData.message,
//         });
//       }
//       // Agar backend aniq field ko'rsatmasa — umumiy xabar
//       else {
//         const msg = responseData?.message || "Ma'lumotlarni tekshiring";
//         setError("root", { type: "server", message: msg });
//       }
//     }
//   };

//   return (
//     <RouteGuard allowedRoles={["admin", "manager"]}>
//       <DashboardLayout>
//         <div className="space-y-5">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">
//                 Kurslar
//               </h2>
//               <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
//                 {courses?.length ?? 0} ta kurs
//               </p>
//             </div>
//             <Button
//               icon={<Plus className="w-4 h-4" />}
//               onClick={() => setShowModal(true)}
//             >
//               Yangi kurs
//             </Button>
//           </div>

//           <div className="w-56">
//   <SearchableSelect
//     name="branchId_filter"
//     options={[
//       { value: "", label: "Barcha filiallar" },
//       ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
//     ]}
//     value={branchId ?? ""}
//     onChange={(e) => setBranchId(e.target.value === "" ? undefined : e.target.value)}
//   />
// </div>

//           {/* <div className="w-56">
//             <SearchableSelect
//               name="branchId_filter"
//               options={[
//                 { value: "", label: "Barcha filiallar" },
//                 ...(branches?.map((b) => ({ value: b.id, label: b.name })) ??
//                   []),
//               ]}
//               value={branchId}
//               onChange={(e) => setBranchId(e.target.value)}
//             />
//           </div> */}

//           {isLoading ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//               {[...Array(6)].map((_, i) => (
//                 <div
//                   key={i}
//                   className="h-36 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse"
//                 />
//               ))}
//             </div>
//           ) : courses?.length === 0 ? (
//             <Card>
//               <EmptyState
//                 icon={BookMarked}
//                 title="Kurslar topilmadi"
//                 action={{
//                   label: "Yangi kurs",
//                   onClick: () => setShowModal(true),
//                 }}
//               />
//             </Card>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//               {courses?.map((course) => (
//                 <Card
//                   key={course.id}
//                   className="hover:shadow-card-md transition-shadow"
//                 >
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center border border-brand-100">
//                         <BookMarked className="w-5 h-5 text-brand-600" />
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-surface-900 dark:text-surface-50 text-sm">
//                           {course.name}
//                         </h3>
//                         <p className="text-xs text-surface-500 dark:text-surface-400">
//                           {course.branch?.name}
//                         </p>
//                       </div>
//                     </div>
//                     {course.isActive ? (
//                       <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
//                     ) : (
//                       <XCircle className="w-4 h-4 text-surface-300 flex-shrink-0" />
//                     )}
//                   </div>
//                   {course.description && (
//                     <p className="text-xs text-surface-500 dark:text-surface-400 mb-3 line-clamp-2">
//                       {course.description}
//                     </p>
//                   )}
//                   <div className="flex items-center justify-between pt-3 border-t border-surface-50">
//                     <div className="flex items-center gap-1 text-sm font-semibold text-success-700">
//                       <DollarSign className="w-3.5 h-3.5" />
//                       {formatCurrency(course.pricePerMonth)}/oy
//                     </div>
//                     <div className="flex items-center gap-1 text-xs text-surface-500 dark:text-surface-400">
//                       <Clock className="w-3.5 h-3.5" />
//                       {course.durationMonths} oy
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>

//         <Modal
//           open={showModal}
//           onClose={() => {
//             setShowModal(false);
//             reset();
//           }}
//           title="Yangi kurs yaratish"
//           footer={
//             <>
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setShowModal(false);
//                   reset();
//                 }}
//               >
//                 Bekor qilish
//               </Button>
//               <Button
//                 onClick={handleSubmit(onSubmit)}
//                 loading={createMutation.isPending}
//               >
//                 Saqlash
//               </Button>
//             </>
//           }
//         >
//           <form className="space-y-4">
//             <Input
//               label="Kurs nomi"
//               placeholder="IELTS tayyorlov kursi"
//               required
//               error={errors.name?.message}
//               {...register("name", { required: "Kurs nomini kiriting" })}
//             />

//             <Controller
//               name="branchId"
//               control={control}
//               rules={{ required: "Filialni tanlang" }}
//               render={({ field, fieldState }) => (
//                 <SearchableSelect
//                   label="Filial"
//                   required
//                   error={fieldState.error?.message}
//                   options={[
//                     { value: "", label: "Tanlang..." },
//                     ...(branches?.map((b) => ({
//                       value: b.id,
//                       label: b.name,
//                     })) ?? []),
//                   ]}
//                   name={field.name}
//                   value={field.value ?? ""}
//                   onChange={(e) => field.onChange(e.target.value)}
//                 />
//               )}
//             />

//             <Input
//               label="Oylik to'lov (so'm)"
//               type="number"
//               placeholder="600000"
//               error={errors.pricePerMonth?.message}
//               {...register("pricePerMonth", {
//                 required: "Oylik to'lovni kiriting",
//               })}
//             />

//             <Input
//               label="Davomiyligi (oy)"
//               type="number"
//               placeholder="6"
//               error={errors.durationMonths?.message}
//               {...register("durationMonths", {
//                 required: "Davomiyligini kiriting",
//               })}
//             />

//             {/* Umumiy xatolik (field aniqlanmagan holat) */}
//             {errors.root && (
//               <p className="text-sm text-red-500">{errors.root.message}</p>
//             )}

//             <div>
//               <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">
//                 Tavsif
//               </label>
//               <textarea
//                 className="w-full rounded-xl border border-surface-200 dark:border-surface-700 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
//                 rows={3}
//                 placeholder="Kurs haqida qisqacha ma'lumot..."
//                 {...register("description")}
//               />
//             </div>
//           </form>
//         </Modal>
//       </DashboardLayout>
//     </RouteGuard>
//   );
// }

// // "use client";
// // import { useState } from "react";
// // import { DashboardLayout } from "@/components/layout/dashboard-layout";
// // import { Card } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Select } from "@/components/ui/select";
// // import { SearchableSelect } from "@/components/ui/searchable-select";
// // import { Modal } from "@/components/ui/modal";
// // import { EmptyState } from "@/components/ui/empty-state";
// // import { useCourses, useBranches, useMutationWithToast } from "@/hooks/use-query";
// // import { coursesApi } from "@/lib/api";
// // import { formatCurrency } from "@/lib/utils";
// // import { useForm, Controller } from "react-hook-form";
// // import { Plus, BookMarked, Clock, DollarSign, CheckCircle, XCircle } from "lucide-react";
// // import type { Course } from "@/types";
// // import { RouteGuard } from "@/components/layout/route-guard";

// // export default function CoursesPage() {
// //   const [branchId, setBranchId] = useState("");
// //   const [showModal, setShowModal] = useState(false);
// //   const { data: courses, isLoading } = useCourses(branchId || undefined);
// //   const { data: branches } = useBranches();

// //   const createMutation = useMutationWithToast(
// //     (data: Partial<Course>) => coursesApi.create(data).then((r) => r.data.data),
// //     { successMessage: "Kurs muvaffaqiyatli yaratildi", invalidateKeys: ["courses"] },
// //   );

// //   const { register, handleSubmit, reset } = useForm<Partial<Course>>();
// //   const onSubmit = async (data: Partial<Course>) => {
// //     await createMutation.mutateAsync(data);
// //     setShowModal(false);
// //     reset();
// //   };

// //   return (
// //     <RouteGuard allowedRoles={["admin","manager"]}>
// //       <DashboardLayout>
// //       <div className="space-y-5">
// //         <div className="flex items-center justify-between">
// //           <div>
// //             <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Kurslar</h2>
// //             <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{courses?.length ?? 0} ta kurs</p>
// //           </div>
// //           <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
// //             Yangi kurs
// //           </Button>
// //         </div>

// //         <div className="w-56">
// //           <SearchableSelect
// //             name="branchId_filter"
// //             options={[
// //               { value: "", label: "Barcha filiallar" },
// //               ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
// //             ]}
// //             value={branchId}
// //             onChange={(e) => setBranchId(e.target.value)}
// //           />
// //         </div>

// //         {isLoading ? (
// //           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
// //             {[...Array(6)].map((_, i) => <div key={i} className="h-36 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />)}
// //           </div>
// //         ) : courses?.length === 0 ? (
// //           <Card>
// //             <EmptyState
// //               icon={BookMarked}
// //               title="Kurslar topilmadi"
// //               action={{ label: "Yangi kurs", onClick: () => setShowModal(true) }}
// //             />
// //           </Card>
// //         ) : (
// //           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
// //             {courses?.map((course) => (
// //               <Card key={course.id} className="hover:shadow-card-md transition-shadow">
// //                 <div className="flex items-start justify-between mb-3">
// //                   <div className="flex items-center gap-3">
// //                     <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center border border-brand-100">
// //                       <BookMarked className="w-5 h-5 text-brand-600" />
// //                     </div>
// //                     <div>
// //                       <h3 className="font-semibold text-surface-900 dark:text-surface-50 text-sm">{course.name}</h3>
// //                       <p className="text-xs text-surface-500 dark:text-surface-400">{course.branch?.name}</p>
// //                     </div>
// //                   </div>
// //                   {course.isActive ? (
// //                     <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
// //                   ) : (
// //                     <XCircle className="w-4 h-4 text-surface-300 flex-shrink-0" />
// //                   )}
// //                 </div>
// //                 {course.description && (
// //                   <p className="text-xs text-surface-500 dark:text-surface-400 mb-3 line-clamp-2">{course.description}</p>
// //                 )}
// //                 <div className="flex items-center justify-between pt-3 border-t border-surface-50">
// //                   <div className="flex items-center gap-1 text-sm font-semibold text-success-700">
// //                     <DollarSign className="w-3.5 h-3.5" />
// //                     {formatCurrency(course.pricePerMonth)}/oy
// //                   </div>
// //                   <div className="flex items-center gap-1 text-xs text-surface-500 dark:text-surface-400">
// //                     <Clock className="w-3.5 h-3.5" />
// //                     {course.durationMonths} oy
// //                   </div>
// //                 </div>
// //               </Card>
// //             ))}
// //           </div>
// //         )}
// //       </div>

// //       <Modal
// //         open={showModal}
// //         onClose={() => { setShowModal(false); reset(); }}
// //         title="Yangi kurs yaratish"
// //         footer={
// //           <>
// //             <Button variant="outline" onClick={() => { setShowModal(false); reset(); }}>Bekor qilish</Button>
// //             <Button onClick={handleSubmit(onSubmit)} loading={createMutation.isPending}>Saqlash</Button>
// //           </>
// //         }
// //       >

// //         <form className="space-y-4">
// //           <Input label="Kurs nomi" placeholder="IELTS tayyorlov kursi" required {...register("name", { required: true })} />
// //           <SearchableSelect
// //             label="Filial"
// //             required
// //             options={[
// //               { value: "", label: "Tanlang..." },
// //               ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
// //             ]}
// //             {...register("branchId", { required: true })}
// //           />
// //           <div className="grid grid-cols-2 gap-4">
// //             <Input label="Oylik to'lov (so'm)" type="number" placeholder="600000" {...register("pricePerMonth")} />
// //             <Input label="Davomiyligi (oy)" type="number" placeholder="6" {...register("durationMonths")} />
// //           </div>
// //           <div>
// //             <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">Tavsif</label>
// //             <textarea
// //               className="w-full rounded-xl border border-surface-200 dark:border-surface-700 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
// //               rows={3}
// //               placeholder="Kurs haqida qisqacha ma'lumot..."
// //               {...register("description")}
// //             />
// //           </div>
// //         </form>

// //       </Modal>
// //     </DashboardLayout>
// //     </RouteGuard>
// //   );
// // }

// // // <form className="space-y-4">
// // //   <Input
// // //     label="Kurs nomi"
// // //     placeholder="Masalan: Web Dasturlash"
// // //     {...register("name", { required: true })}
// // //   />

// // //   {/* Filial tanlash qismini Controller bilan o'rang */}
// // //   <Controller
// // //     name="branchId"
// // //     control={control} // useForm dan control ni olishni unutmang
// // //     rules={{ required: "Filialni tanlash majburiy" }}
// // //     render={({ field }) => (
// // //       <SearchableSelect
// // //         label="Filial"
// // //         placeholder="Filialni tanlang..."
// // //         options={branches?.map(b => ({ value: b.id, label: b.name })) || []}
// // //         value={field.value}
// // //         onChange={(e) => field.onChange(e.target.value)} // Qiymatni qo'lda uzatamiz
// // //         error={errors.branchId?.message}
// // //       />
// // //     )}
// // //   />

// // //   <div className="grid grid-cols-2 gap-4">
// // //     <Input label="Narxi" type="number" {...register("price")} />
// // //     <Input label="Davomiyligi (oy)" type="number" {...register("duration")} />
// // //   </div>
// // // </form>
