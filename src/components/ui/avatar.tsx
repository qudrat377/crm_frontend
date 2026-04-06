import { cn, getInitials } from "@/lib/utils";
const COLORS = ["bg-brand-100 text-brand-700","bg-success-50 text-success-700","bg-warning-50 text-warning-600","bg-purple-100 text-purple-700","bg-pink-100 text-pink-700","bg-blue-100 text-blue-700"];
function colorFromName(n: string) { let h=0; for(let i=0;i<n.length;i++) h=n.charCodeAt(i)+((h<<5)-h); return COLORS[Math.abs(h)%COLORS.length]; }
interface AvatarProps { name: string; size?: "xs"|"sm"|"md"|"lg"; className?: string; }
export function Avatar({ name, size="md", className }: AvatarProps) {
  const s = { xs:"w-6 h-6 text-[10px]", sm:"w-8 h-8 text-xs", md:"w-10 h-10 text-sm", lg:"w-12 h-12 text-base" };
  return <div className={cn("rounded-xl flex items-center justify-center font-semibold flex-shrink-0", s[size], colorFromName(name), className)}>{getInitials(name)}</div>;
}
