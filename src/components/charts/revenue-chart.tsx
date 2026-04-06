"use client";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatMonth } from "@/lib/utils";
import type { MonthlyRevenue } from "@/types";

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-900 text-white rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="text-surface-300 mb-1">{label}</p>
      <p className="font-semibold">
        {new Intl.NumberFormat("uz-UZ").format(payload[0].value)} so'm
      </p>
    </div>
  );
};

export default function RevenueChartInner({ data }: { data: MonthlyRevenue[] }) {
  const formatted = data.map((d) => ({
    ...d,
    name: formatMonth(d.month, d.year).slice(0, 3),
    revenue: Number(d.revenue),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            v >= 1_000_000
              ? `${(v / 1_000_000).toFixed(1)}M`
              : `${(v / 1_000).toFixed(0)}K`
          }
        />
        <Tooltip content={<Tip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#4f46e5"
          strokeWidth={2.5}
          fill="url(#colorRev)"
          dot={false}
          activeDot={{ r: 4, fill: "#4f46e5", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// "use client";
// import dynamic from "next/dynamic";
// import type { MonthlyRevenue } from "@/types";

// const Chart = dynamic(
//   () =>
//     import("recharts").then((recharts) => {
//       const {
//         AreaChart,
//         Area,
//         XAxis,
//         YAxis,
//         CartesianGrid,
//         Tooltip,
//         ResponsiveContainer,
//       } = recharts;

//       const MONTHS = [
//         "Yan", "Fev", "Mar", "Apr", "May", "Iyn",
//         "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek",
//       ];

//       function Tip({ active, payload, label }: any) {
//         if (!active || !payload?.length) return null;
//         return (
//           <div
//             style={{
//               background: "#0f172a",
//               color: "#f8fafc",
//               borderRadius: 12,
//               padding: "8px 12px",
//               fontSize: 12,
//               boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3)",
//             }}
//           >
//             <p style={{ color: "#94a3b8", marginBottom: 4 }}>{label}</p>
//             <p style={{ fontWeight: 600 }}>
//               {new Intl.NumberFormat("uz-UZ").format(payload[0].value)} so'm
//             </p>
//           </div>
//         );
//       }

//       function RevenueChartInner({ data }: { data: MonthlyRevenue[] }) {
//         const formatted = data.map((d) => ({
//           name: MONTHS[d.month - 1],
//           revenue: Number(d.revenue),
//         }));

//         return (
//           <ResponsiveContainer width="100%" height={220}>
//             <AreaChart
//               data={formatted}
//               margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
//             >
//               <defs>
//                 <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.15} />
//                   <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid
//                 strokeDasharray="3 3"
//                 stroke="#f1f5f9"
//                 vertical={false}
//               />
//               <XAxis
//                 dataKey="name"
//                 tick={{ fontSize: 11, fill: "#94a3b8" }}
//                 axisLine={false}
//                 tickLine={false}
//               />
//               <YAxis
//                 tick={{ fontSize: 11, fill: "#94a3b8" }}
//                 axisLine={false}
//                 tickLine={false}
//                 tickFormatter={(v) =>
//                   v >= 1_000_000
//                     ? `${(v / 1_000_000).toFixed(1)}M`
//                     : `${(v / 1_000).toFixed(0)}K`
//                 }
//               />
//               <Tooltip content={<Tip />} />
//               <Area
//                 type="monotone"
//                 dataKey="revenue"
//                 stroke="#4f46e5"
//                 strokeWidth={2.5}
//                 fill="url(#colorRev)"
//                 dot={false}
//                 activeDot={{ r: 4, fill: "#4f46e5", strokeWidth: 0 }}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         );
//       }

//       return RevenueChartInner;
//     }),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="h-[220px] w-full bg-surface-50 dark:bg-surface-800 rounded-xl animate-pulse" />
//     ),
//   }
// );

// export function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
//   if (!data || data.length === 0) {
//     return (
//       <div className="h-[220px] flex items-center justify-center text-surface-400 dark:text-surface-500 text-sm">
//         Ma'lumot yo'q
//       </div>
//     );
//   }
//   return <Chart data={data} />;
// }










// "use client";
// import dynamic from "next/dynamic";
// import type { MonthlyRevenue } from "@/types";
// import { formatMonth } from "@/lib/utils";

// // Recharts faqat bu component yuklanganida import qilinadi (SSR yo'q)
// const RevenueChartInner = dynamic(
//   async () => {
//     const {
//       AreaChart, Area, XAxis, YAxis,
//       CartesianGrid, Tooltip, ResponsiveContainer,
//     } = await import("recharts");

//     const Tip = ({ active, payload, label }: any) => {
//       if (!active || !payload?.length) return null;
//       return (
//         <div style={{ background: "#0f172a", color: "#f8fafc", borderRadius: 12, padding: "8px 12px", fontSize: 12 }}>
//           <p style={{ color: "#94a3b8", marginBottom: 4 }}>{label}</p>
//           <p style={{ fontWeight: 600 }}>
//             {new Intl.NumberFormat("uz-UZ").format(payload[0].value)} so'm
//           </p>
//         </div>
//       );
//     };

//     function Chart({ data }: { data: MonthlyRevenue[] }) {
//       const formatted = data.map((d) => ({
//         ...d,
//         name: formatMonth(d.month, d.year).slice(0, 3),
//         revenue: Number(d.revenue),
//       }));

//       return (
//         <ResponsiveContainer width="100%" height={220}>
//           <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
//             <defs>
//               <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
//                 <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
//             <XAxis
//               dataKey="name"
//               tick={{ fontSize: 11, fill: "#94a3b8" }}
//               axisLine={false}
//               tickLine={false}
//             />
//             <YAxis
//               tick={{ fontSize: 11, fill: "#94a3b8" }}
//               axisLine={false}
//               tickLine={false}
//               tickFormatter={(v) =>
//                 v >= 1_000_000
//                   ? `${(v / 1_000_000).toFixed(1)}M`
//                   : `${(v / 1_000).toFixed(0)}K`
//               }
//             />
//             <Tooltip content={<Tip />} />
//             <Area
//               type="monotone"
//               dataKey="revenue"
//               stroke="#4f46e5"
//               strokeWidth={2.5}
//               fill="url(#colorRev)"
//               dot={false}
//               activeDot={{ r: 4, fill: "#4f46e5", strokeWidth: 0 }}
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       );
//     }

//     return Chart;
//   },
//   {
//     ssr: false,
//     loading: () => (
//       <div className="h-[220px] w-full bg-surface-50 dark:bg-surface-800 rounded-xl animate-pulse" />
//     ),
//   }
// );

// export function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
//   if (!data || data.length === 0) {
//     return (
//       <div className="h-[220px] flex items-center justify-center text-surface-400 dark:text-surface-500 text-sm">
//         Ma'lumot yo'q
//       </div>
//     );
//   }
//   return <RevenueChartInner data={data} />;
// }

// // "use client";
// // import dynamic from "next/dynamic";
// // import type { MonthlyRevenue } from "@/types";

// // // recharts (~700kB) faqat dashboard ochilganda yuklanadi
// // const ChartLazy = dynamic(() => import("./_revenue-chart-inner"), {
// //   ssr: false,
// //   loading: () => (
// //     <div className="h-[220px] w-full bg-surface-50 dark:bg-surface-900/50 rounded-xl animate-pulse" />
// //   ),
// // });

// // export function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
// //   return <ChartLazy data={data} />;
// // }


// // // "use client";
// // // import dynamic from "next/dynamic";
// // // import type { MonthlyRevenue } from "@/types";
// // // import {
// // //   AreaChart, Area, XAxis, YAxis,
// // //   CartesianGrid, Tooltip, ResponsiveContainer,
// // // } from "recharts";
// // // import { formatMonth } from "@/lib/utils";

// // // const Tip = ({ active, payload, label }: any) => {
// // //   if (!active || !payload?.length) return null;
// // //   return (
// // //     <div className="bg-surface-900 text-white rounded-xl px-3 py-2 text-xs shadow-lg">
// // //       <p className="text-surface-300 mb-1">{label}</p>
// // //       <p className="font-semibold">
// // //         {new Intl.NumberFormat("uz-UZ").format(payload[0].value)} so'm
// // //       </p>
// // //     </div>
// // //   );
// // // };

// // // function ChartInner({ data }: { data: MonthlyRevenue[] }) {
// // //   const formatted = data.map((d) => ({
// // //     ...d,
// // //     name: formatMonth(d.month, d.year).slice(0, 3),
// // //     revenue: Number(d.revenue),
// // //   }));

// // //   return (
// // //     <ResponsiveContainer width="100%" height={220}>
// // //       <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
// // //         <defs>
// // //           <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
// // //             <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
// // //             <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
// // //           </linearGradient>
// // //         </defs>
// // //         <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
// // //         <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
// // //         <YAxis
// // //           tick={{ fontSize: 11, fill: "#94a3b8" }}
// // //           axisLine={false}
// // //           tickLine={false}
// // //           tickFormatter={(v) =>
// // //             v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`
// // //           }
// // //         />
// // //         <Tooltip content={<Tip />} />
// // //         <Area
// // //           type="monotone"
// // //           dataKey="revenue"
// // //           stroke="#4f46e5"
// // //           strokeWidth={2.5}
// // //           fill="url(#colorRev)"
// // //           dot={false}
// // //           activeDot={{ r: 4, fill: "#4f46e5", strokeWidth: 0 }}
// // //         />
// // //       </AreaChart>
// // //     </ResponsiveContainer>
// // //   );
// // // }

// // // const ChartLazy = dynamic(
// // //   () => Promise.resolve(ChartInner),
// // //   {
// // //     ssr: false,
// // //     loading: () => (
// // //       <div className="h-[220px] w-full bg-surface-50 dark:bg-surface-900/50 rounded-xl animate-pulse" />
// // //     ),
// // //   }
// // // );

// // // export function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
// // //   return <ChartLazy data={data} />;
// // // }










// // // "use client";
// // // import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
// // // import { formatMonth } from "@/lib/utils";
// // // import type { MonthlyRevenue } from "@/types";
// // // const Tip = ({ active, payload, label }: any) => {
// // //   if (!active || !payload?.length) return null;
// // //   return <div className="bg-surface-900 text-white rounded-xl px-3 py-2 text-xs shadow-lg"><p className="text-surface-300 mb-1">{label}</p><p className="font-semibold">{new Intl.NumberFormat("uz-UZ").format(payload[0].value)} so'm</p></div>;
// // // };
// // // export function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
// // //   const formatted = data.map((d) => ({ ...d, name: formatMonth(d.month, d.year).slice(0, 3), revenue: Number(d.revenue) }));
// // //   return (
// // //     <ResponsiveContainer width="100%" height={220}>
// // //       <AreaChart data={formatted} margin={{ top:5, right:10, left:-10, bottom:0 }}>
// // //         <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient></defs>
// // //         <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
// // //         <XAxis dataKey="name" tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false}/>
// // //         <YAxis tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v)=>v>=1000000?`${(v/1000000).toFixed(1)}M`:`${(v/1000).toFixed(0)}K`}/>
// // //         <Tooltip content={<Tip/>}/>
// // //         <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fill="url(#colorRev)" dot={false} activeDot={{ r:4, fill:"#4f46e5", strokeWidth:0 }}/>
// // //       </AreaChart>
// // //     </ResponsiveContainer>
// // //   );
// // // }
