import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; icon?: React.ReactNode; hint?: string; }
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, hint, type="text", ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{label}{props.required && <span className="text-danger-500 ml-1">*</span>}</label>}
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400 dark:text-surface-500">{icon}</div>}
        <input ref={ref} type={type} className={cn("w-full rounded-xl border bg-white dark:bg-surface-900 px-3.5 py-2.5 text-sm text-surface-900 dark:text-surface-50 placeholder:text-surface-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-surface-50 dark:bg-surface-900/50 disabled:cursor-not-allowed", icon?"pl-10":"", error?"border-danger-300 focus:ring-danger-500":"border-surface-200 dark:border-surface-700 hover:border-surface-300", className)} {...props}/>
      </div>
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">{hint}</p>}
    </div>
  )
);

Input.displayName = "Input";
