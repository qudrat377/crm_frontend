import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary"|"secondary"|"ghost"|"danger"|"outline";
  size?: "sm"|"md"|"lg";
  loading?: boolean;
  icon?: React.ReactNode;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant="primary", size="md", loading, icon, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none";
    const variants = {
      primary:"bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-500 shadow-sm",
      secondary:"bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 dark:bg-surface-700 text-surface-800 dark:text-surface-100 focus:ring-surface-400",
      ghost:"hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-200 focus:ring-surface-400",
      danger:"bg-danger-600 hover:bg-danger-700 text-white focus:ring-danger-500 shadow-sm",
      outline:"border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 text-surface-700 dark:text-surface-200 focus:ring-brand-500",
    };
    const sizes = { sm:"text-xs px-3 py-1.5 h-8", md:"text-sm px-4 py-2 h-9", lg:"text-sm px-5 py-2.5 h-10" };
    return (
      <button ref={ref} disabled={disabled||loading} className={cn(base,variants[variant],sizes[size],className)} {...props}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : icon}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
