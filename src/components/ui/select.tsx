import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full rounded-xl border bg-white dark:bg-surface-900 px-3.5 py-2.5 text-sm text-surface-900 dark:text-surface-50 appearance-none pr-10 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-surface-50 dark:bg-surface-900/50 disabled:cursor-not-allowed",
            error
              ? "border-danger-300 focus:ring-danger-500"
              : "border-surface-200 dark:border-surface-700 hover:border-surface-300",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-surface-400 dark:text-surface-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";

// import { forwardRef, SelectHTMLAttributes } from "react";
// import { cn } from "@/lib/utils";
// import { ChevronDown } from "lucide-react";
// interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; error?: string; options: { value: string; label: string }[]; placeholder?: string; }
// export const Select = forwardRef<HTMLSelectElement, SelectProps>(
//   ({ className, label, error, options, placeholder, ...props }, ref) => (
//     <div className="w-full">
//       {label && <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{label}{props.required && <span className="text-danger-500 ml-1">*</span>}</label>}
//       <div className="relative">
//         <select ref={ref} className={cn("w-full rounded-xl border bg-white dark:bg-surface-900 px-3.5 py-2.5 text-sm text-surface-900 dark:text-surface-50 appearance-none pr-10 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-surface-50 dark:bg-surface-900/50 disabled:cursor-not-allowed", error?"border-danger-300":"border-surface-200 dark:border-surface-700 hover:border-surface-300", className)} {...props}>
//           {placeholder && <option value="">{placeholder}</option>}
//           {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
//         </select>
//         <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-surface-400 dark:text-surface-500"><ChevronDown className="w-4 h-4"/></div>
//       </div>
//       {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
//     </div>
//   )
// );
// Select.displayName = "Select";
