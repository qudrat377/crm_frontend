import { cn } from "@/lib/utils";
interface CardProps extends React.HTMLAttributes<HTMLDivElement> { padding?: "none"|"sm"|"md"|"lg"; }
export function Card({ children, className, padding="md", ...props }: CardProps) {
  const p = { none:"", sm:"p-4", md:"p-5", lg:"p-6" };
  return <div className={cn("bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 shadow-card", p[padding], className)} {...props}>{children}</div>;
}
export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode; }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div><h3 className="text-base font-semibold text-surface-900 dark:text-surface-50">{title}</h3>{subtitle && <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{subtitle}</p>}</div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
