"use client";
import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/components/layout/route-guard";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
// import { RevenueChart } from "@/components/charts/revenue-chart";
import { useBranches, useStudents, useTeachers, useGroups, useRevenue, useLeads } from "@/hooks/use-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { GraduationCap, Users, BookOpen, CreditCard, Target, TrendingUp, AlertCircle } from "lucide-react";
import type { MonthlyRevenue } from "@/types";
import RevenueChart from "@/components/charts/revenue-chart";

// Har bir filial uchun revenue hook — enabled faqat id bo'lganda
function useBranchRevenue(branchId: string, year: number) {
  return useRevenue(branchId, year);
}

function DashboardContent() {
  const year = new Date().getFullYear();

  const { data: branches } = useBranches();
  const { data: allStudents } = useStudents({ limit: 1 });
  const { data: recentStudents } = useStudents({ limit: 5, status: "active" });
  const { data: teachers } = useTeachers({ limit: 1, isActive: true });
  const { data: groups } = useGroups({ limit: 1, status: "active" });
  const { data: leads } = useLeads({ limit: 5, status: "new" });

  // Har bir filial uchun alohida revenue (hooks rules: fixed count)
  // Maksimal 10 ta filial ko'taramiz
  const b0 = useBranchRevenue(branches?.[0]?.id ?? "", year);
  const b1 = useBranchRevenue(branches?.[1]?.id ?? "", year);
  const b2 = useBranchRevenue(branches?.[2]?.id ?? "", year);
  const b3 = useBranchRevenue(branches?.[3]?.id ?? "", year);
  const b4 = useBranchRevenue(branches?.[4]?.id ?? "", year);

  // Barcha filiallar revenue larini yig'amiz
  const combinedRevenue = useMemo(() => {
    const allRevenues = [b0.data, b1.data, b2.data, b3.data, b4.data].filter(Boolean);
    if (allRevenues.length === 0) return null;

    // 12 oylik bo'sh massiv
    const months: MonthlyRevenue[] = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      year,
      revenue: 0,
      paymentCount: 0,
    }));

    let yearTotal = 0;
    let debtAmount = 0;
    let debtCount = 0;

    allRevenues.forEach((rev) => {
      if (!rev) return;
      rev.months.forEach((m, i) => {
        months[i].revenue += Number(m.revenue);
        months[i].paymentCount += m.paymentCount;
      });
      yearTotal += Number(rev.yearTotal);
      debtAmount += Number(rev.outstandingDebt?.amount ?? 0);
      debtCount += Number(rev.outstandingDebt?.count ?? 0);
    });

    return {
      months,
      yearTotal,
      outstandingDebt: { amount: debtAmount, count: debtCount },
    };
  }, [b0.data, b1.data, b2.data, b3.data, b4.data, year]);

  const currentMonthRevenue = combinedRevenue?.months[new Date().getMonth()]?.revenue ?? 0;

  const stats = [
    { title: "Jami o'quvchilar",  value: allStudents?.total ?? 0,              icon: GraduationCap, color: "brand"   as const },
    { title: "O'qituvchilar",     value: teachers?.total ?? 0,                 icon: Users,         color: "teacher" as const },
    { title: "Faol guruhlar",     value: groups?.total ?? 0,                   icon: BookOpen,      color: "success" as const },
    { title: "Oylik daromad",     value: formatCurrency(currentMonthRevenue),  icon: CreditCard,    color: "warning" as const },
    { title: "Yillik daromad",    value: formatCurrency(combinedRevenue?.yearTotal ?? 0), icon: TrendingUp, color: "brand" as const },
    { title: "Yangi leadlar",     value: leads?.total ?? 0,                    icon: Target,        color: "danger"  as const },
  ];

  const isLoading = b0.isLoading || b1.isLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Xush kelibsiz 👋</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
          {new Date().toLocaleDateString("uz-UZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Oylik daromad"
            subtitle={`${year} yil — barcha filiallar`}
          />
          {isLoading ? (
            <div className="h-[220px] bg-surface-50 dark:bg-surface-800 rounded-xl animate-pulse" />
          ) : combinedRevenue?.months ? (
            <RevenueChart data={combinedRevenue.months} />
          ) : (
            <div className="h-56 flex items-center justify-center text-surface-400 dark:text-surface-500 text-sm">
              Ma'lumot yo'q
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Yangi leadlar" />
          <div className="space-y-3">
            {leads?.data?.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center gap-3">
                <Avatar name={lead.fullName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lead.fullName}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{lead.phone}</p>
                </div>
                <Badge status={lead.pipelineStatus} size="sm" />
              </div>
            )) ?? (
              <p className="text-sm text-surface-400 dark:text-surface-500 text-center py-6">
                Yangi lead yo'q
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2">
          <CardHeader title="So'nggi o'quvchilar" />
          <div className="space-y-2">
            {recentStudents?.data?.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                <Avatar name={s.fullName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{s.fullName}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{s.phone ?? "—"}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge status={s.status} size="sm" />
                  <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">{formatDate(s.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Qarz holati" />
          {combinedRevenue && combinedRevenue.outstandingDebt.amount > 0 ? (
            <div className="flex items-center gap-3 p-4 bg-danger-50 rounded-xl border border-danger-100">
              <AlertCircle className="w-8 h-8 text-danger-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-danger-700">
                  {formatCurrency(combinedRevenue.outstandingDebt.amount)}
                </p>
                <p className="text-xs text-danger-500">
                  {combinedRevenue.outstandingDebt.count} ta qarz yozuvi
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-success-600">
              <div className="w-12 h-12 bg-success-50 rounded-2xl flex items-center justify-center mb-3">
                <CreditCard className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">Qarz yo'q!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RouteGuard allowedRoles={["admin", "manager"]}>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </RouteGuard>
  );
}

// "use client";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import { RouteGuard } from "@/components/layout/route-guard";
// import { StatCard } from "@/components/ui/stat-card";
// import { Card, CardHeader } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar } from "@/components/ui/avatar";
// import { RevenueChart } from "@/components/charts/revenue-chart";
// import { useBranches, useStudents, useTeachers, useGroups, useRevenue, useLeads } from "@/hooks/use-query";
// import { formatCurrency, formatDate } from "@/lib/utils";
// import { GraduationCap, Users, BookOpen, CreditCard, Target, TrendingUp, AlertCircle } from "lucide-react";

// function DashboardContent() {
//   const { data: branches } = useBranches();
//   const firstBranch = branches?.[0];
//   const { data: allStudents } = useStudents({ limit: 1 });
//   const { data: recentStudents } = useStudents({ limit: 5, status: "active" });
//   const { data: teachers } = useTeachers({ limit: 1, isActive: true });
//   const { data: groups } = useGroups({ limit: 1, status: "active" });
//   const { data: leads } = useLeads({ limit: 5, status: "new" });
//   const { data: revenue } = useRevenue(firstBranch?.id ?? "", new Date().getFullYear());

//   const stats = [
//     { title: "Jami o'quvchilar", value: allStudents?.total ?? 0, icon: GraduationCap, color: "brand" as const },
//     { title: "O'qituvchilar", value: teachers?.total ?? 0, icon: Users, color: "teacher" as const },
//     { title: "Faol guruhlar", value: groups?.total ?? 0, icon: BookOpen, color: "success" as const },
//     { title: "Oylik daromad", value: revenue ? formatCurrency(revenue.months[new Date().getMonth()].revenue) : "—", icon: CreditCard, color: "warning" as const },
//     { title: "Yillik daromad", value: revenue ? formatCurrency(revenue.yearTotal) : "—", icon: TrendingUp, color: "brand" as const },
//     { title: "Yangi leadlar", value: leads?.total ?? 0, icon: Target, color: "danger" as const },
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Xush kelibsiz 👋</h2>
//         <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
//           {new Date().toLocaleDateString("uz-UZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
//         </p>
//       </div>

//       {/* Stats — responsive grid */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
//         {stats.map((s) => <StatCard key={s.title} {...s} />)}
//       </div>

//       {/* Charts + Recent */}
//       <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
//         <Card className="xl:col-span-2">
//           <CardHeader title="Oylik daromad" subtitle={`${new Date().getFullYear()} yil`} />
//           {revenue?.months ? <RevenueChart data={revenue.months} /> : (
//             <div className="h-56 flex items-center justify-center text-surface-400 dark:text-surface-500 text-sm">Filial tanlanmagan</div>
//           )}
//         </Card>

//         <Card>
//           <CardHeader title="Yangi leadlar" />
//           <div className="space-y-3">
//             {leads?.data?.slice(0, 5).map((lead) => (
//               <div key={lead.id} className="flex items-center gap-3">
//                 <Avatar name={lead.fullName} size="sm" />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium truncate">{lead.fullName}</p>
//                   <p className="text-xs text-surface-500 dark:text-surface-400">{lead.phone}</p>
//                 </div>
//                 <Badge status={lead.pipelineStatus} size="sm" />
//               </div>
//             )) ?? <p className="text-sm text-surface-400 dark:text-surface-500 text-center py-6">Yangi lead yo'q</p>}
//           </div>
//         </Card>
//       </div>

//       {/* Recent students + Debt */}
//       <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
//         <Card className="xl:col-span-2">
//           <CardHeader title="So'nggi o'quvchilar" />
//           <div className="space-y-2">
//             {recentStudents?.data?.map((s) => (
//               <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 transition-colors">
//                 <Avatar name={s.fullName} size="sm" />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium">{s.fullName}</p>
//                   <p className="text-xs text-surface-500 dark:text-surface-400">{s.phone ?? "—"}</p>
//                 </div>
//                 <div className="text-right flex-shrink-0">
//                   <Badge status={s.status} size="sm" />
//                   <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">{formatDate(s.createdAt)}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>

//         <Card>
//           <CardHeader title="Qarz holati" />
//           {revenue && revenue.outstandingDebt.amount > 0 ? (
//             <div className="flex items-center gap-3 p-4 bg-danger-50 rounded-xl border border-danger-100">
//               <AlertCircle className="w-8 h-8 text-danger-500 flex-shrink-0" />
//               <div>
//                 <p className="text-sm font-semibold text-danger-700">{formatCurrency(revenue.outstandingDebt.amount)}</p>
//                 <p className="text-xs text-danger-500">{revenue.outstandingDebt.count} ta qarz yozuvi</p>
//               </div>
//             </div>
//           ) : (
//             <div className="flex flex-col items-center py-8 text-success-600">
//               <div className="w-12 h-12 bg-success-50 rounded-2xl flex items-center justify-center mb-3">
//                 <CreditCard className="w-6 h-6" />
//               </div>
//               <p className="text-sm font-medium">Qarz yo'q!</p>
//             </div>
//           )}
//         </Card>
//       </div>
//     </div>
//   );
// }

// export default function DashboardPage() {
//   return (
//     <RouteGuard allowedRoles={["admin", "manager"]}>
//       <DashboardLayout>
//         <DashboardContent />
//       </DashboardLayout>
//     </RouteGuard>
//   );
// }
