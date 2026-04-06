"use client";
import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, size = "md", footer }: ModalProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, handleKey]);

  if (!open) return null;

  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-surface-900/50 dark:bg-surface-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-100 dark:border-surface-800",
          sizes[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800">
            <h2 className="text-base font-semibold text-surface-900 dark:text-surface-50">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 dark:text-surface-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-surface-100 dark:border-surface-800 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}



// "use client";
// import { useEffect } from "react";
// import { cn } from "@/lib/utils";
// import { X } from "lucide-react";
// interface ModalProps { open: boolean; onClose: () => void; title?: string; children: React.ReactNode; size?: "sm"|"md"|"lg"|"xl"; footer?: React.ReactNode; }
// export function Modal({ open, onClose, title, children, size="md", footer }: ModalProps) {
//   useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
//   if (!open) return null;
//   const sizes = { sm:"max-w-md", md:"max-w-lg", lg:"max-w-2xl", xl:"max-w-4xl" };
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-surface-900/50 dark:bg-surface-900/80 backdrop-blur-sm animate-fade-in" onClick={onClose}/>
//       <div className={cn("relative w-full bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-100 dark:border-surface-800 animate-slide-up", sizes[size])}>
//         {title && <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800"><h2 className="text-base font-semibold text-surface-900 dark:text-surface-50">{title}</h2><button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 dark:text-surface-400 transition-colors"><X className="w-4 h-4"/></button></div>}
//         <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
//         {footer && <div className="px-6 py-4 border-t border-surface-100 dark:border-surface-800 flex justify-end gap-3">{footer}</div>}
//       </div>
//     </div>
//   );
// }
