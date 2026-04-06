"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
        "text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
      )}
      title={isDark ? "Kunduzgi rejim" : "Tungi rejim"}
      aria-label={isDark ? "Kunduzgi rejim" : "Tungi rejim"}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}


// "use client";
 
// import { useTheme } from "next-themes";
// import { useEffect, useState } from "react";
// import { Sun, Moon } from "lucide-react";
// import { cn } from "@/lib/utils";
 
// export function ThemeToggle() {
//   const [mounted, setMounted] = useState(false);
//   const { theme, setTheme, resolvedTheme } = useTheme();
 
//   useEffect(() => {
//     setMounted(true);
//   }, []);
 
//   // ─── Hydration mismatch oldini olish ───────────────────────────
//   // Server va client renderida tema farq qilishi mumkin.
//   // "mounted" bo'lgunga qadar placeholder ko'rsatamiz (layout shift yo'q).
//   if (!mounted) {
//     return (
//       <div
//         className="w-9 h-9 rounded-xl flex items-center justify-center"
//         aria-hidden="true"
//       />
//     );
//   }
 
//   // resolvedTheme — "system" bo'lsa ham haqiqiy qiymatni qaytaradi
//   const isDark = resolvedTheme === "dark";
 
//   return (
//     <button
//       onClick={() => setTheme(isDark ? "light" : "dark")}
//       className={cn(
//         "w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
//         "text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
//       )}
//       title={isDark ? "Kunduzgi rejimga o'tish" : "Tungi rejimga o'tish"}
//       aria-label={isDark ? "Kunduzgi rejimga o'tish" : "Tungi rejimga o'tish"}
//     >
//       {isDark ? (
//         <Sun className="w-5 h-5" />
//       ) : (
//         <Moon className="w-5 h-5" />
//       )}
//     </button>
//   );
// }
 



// "use client";

// import { useTheme } from "next-themes";
// import { useEffect, useState } from "react";
// import { Sun, Moon } from "lucide-react";
// import { cn } from "@/lib/utils";

// export function ThemeToggle() {
//   const [mounted, setMounted] = useState(false);
//   const { theme, setTheme, systemTheme } = useTheme();

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) {
//     return <div className="w-9 h-9" />;
//   }

//   const currentTheme = theme === "system" ? systemTheme : theme;
//   const isDark = currentTheme === "dark";

//   return (
//     <button
//       onClick={() => setTheme(isDark ? "light" : "dark")}
//       className={cn(
//         "w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
//         "text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
//       )}
//       title="Mavzuni o'zgartirish"
//       aria-label="Mavzuni o'zgartirish"
//     >
//       {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
//     </button>
//   );
// }
