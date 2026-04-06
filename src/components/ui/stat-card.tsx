import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
interface StatCardProps { title: string; value: string|number; subtitle?: string; icon: LucideIcon; color?: "brand"|"success"|"warning"|"danger"|"purple"|"student"|"teacher"|"assistant"; }
const colorMap = {
  brand:    { bg:"bg-brand-50",    icon:"text-brand-600",    border:"border-brand-100" },
  success:  { bg:"bg-success-50",  icon:"text-success-600",  border:"border-green-100" },
  warning:  { bg:"bg-warning-50",  icon:"text-warning-600",  border:"border-amber-100" },
  danger:   { bg:"bg-danger-50",   icon:"text-danger-600",   border:"border-rose-100" },
  purple:   { bg:"bg-purple-50",   icon:"text-purple-600",   border:"border-purple-100" },
  student:  { bg:"bg-student-50",  icon:"text-student-600",  border:"border-student-100" },
  teacher:  { bg:"bg-teacher-50",  icon:"text-teacher-600",  border:"border-teacher-100" },
  assistant:{ bg:"bg-assistant-50",icon:"text-assistant-600",border:"border-assistant-100" },
};
export function StatCard({ title, value, subtitle, icon: Icon, color="brand" }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 shadow-card p-5 hover:shadow-card-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-surface-50 mt-1.5 truncate">{value}</p>
          {subtitle && <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">{subtitle}</p>}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border", c.bg, c.border)}>
          <Icon className={cn("w-5 h-5", c.icon)}/>
        </div>
      </div>
    </div>
  );
}
