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
