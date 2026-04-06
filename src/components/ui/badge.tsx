import { cn, getStatusColor, getStatusLabel } from "@/lib/utils";
interface BadgeProps { status: string; label?: string; className?: string; size?: "sm"|"md"; }
export function Badge({ status, label, className, size="md" }: BadgeProps) {
  return <span className={cn("inline-flex items-center font-medium rounded-full border", size==="sm"?"px-2 py-0.5 text-xs":"px-2.5 py-1 text-xs", getStatusColor(status), className)}>{label ?? getStatusLabel(status)}</span>;
}
