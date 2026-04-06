"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { getNavConfig, getRoleTheme } from "./nav-config";
import { getRoleLabel } from "@/types";
import { GraduationCap, LogOut, ChevronLeft, Menu, X } from "lucide-react";
import type { UserRole } from "@/types";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleCollapsed } = useUIStore();
  const { user, logout } = useAuthStore();

  const role = (user?.role ?? "user") as UserRole;
  const navSections = getNavConfig(role);
  const theme = getRoleTheme(role);

  return (
    <>
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-surface-900/50 dark:bg-surface-900/80 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-white dark:bg-surface-900 border-r border-surface-100 dark:border-surface-800 z-40 flex flex-col shadow-card-md",
          "hidden lg:flex",
          sidebarCollapsed ? "lg:w-[68px]" : "lg:w-64",
          // Mobile
          sidebarOpen && "!flex",
          sidebarOpen ? "w-72" : "w-0 overflow-hidden",
          // Transition faqat sidebar collapse uchun, sahifa o'tishida emas
          "transition-[width] duration-200",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-surface-100 dark:border-surface-800 px-3 flex-shrink-0",
            sidebarCollapsed && !sidebarOpen ? "justify-center" : "justify-between"
          )}
        >
          {(!sidebarCollapsed || sidebarOpen) && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", theme.icon)}>
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-surface-900 dark:text-surface-50 leading-none">EduCRM</p>
                <p className="text-[10px] text-surface-400 dark:text-surface-500 mt-0.5 capitalize truncate">{getRoleLabel(role)}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>

          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex w-8 h-8 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 items-center justify-center text-surface-500 dark:text-surface-400 flex-shrink-0"
          >
            {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role badge */}
        {(!sidebarCollapsed || sidebarOpen) && (
          <div className="px-3 py-2 flex-shrink-0">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold",
                role === "admin"    ? "bg-brand-50 text-brand-700" :
                role === "manager"  ? "bg-success-50 text-success-700" :
                role === "teacher"  ? "bg-purple-50 text-purple-700" :
                role === "asistend" ? "bg-orange-50 text-orange-700" :
                "bg-cyan-50 text-cyan-700"
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  role === "admin"    ? "bg-brand-500" :
                  role === "manager"  ? "bg-success-500" :
                  role === "teacher"  ? "bg-purple-500" :
                  role === "asistend" ? "bg-orange-500" :
                  "bg-cyan-500"
                )}
              />
              {getRoleLabel(role)}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
          {navSections.map((section, si) => (
            <div key={si}>
              {section.title && (!sidebarCollapsed || sidebarOpen) && (
                <p className="px-3 py-1 text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      prefetch                         // ← hover da oldindan yuklaydi
                      title={sidebarCollapsed && !sidebarOpen ? label : undefined}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium group",
                        "transition-colors duration-100",  // duration qisqartirildi
                        active
                          ? theme.active
                          : "text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 hover:text-surface-900 dark:text-surface-50",
                        sidebarCollapsed && !sidebarOpen && "justify-center px-2",
                      )}
                    >
                      <Icon
                        className={cn(
                          "flex-shrink-0 w-[18px] h-[18px]",
                          active ? theme.text : "text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:text-surface-400",
                        )}
                      />
                      {(!sidebarCollapsed || sidebarOpen) && (
                        <>
                          <span className="flex-1 truncate">{label}</span>
                          {active && (
                            <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", theme.dot)} />
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User + logout */}
        <div className="border-t border-surface-100 dark:border-surface-800 p-2 flex-shrink-0">
          {(!sidebarCollapsed || sidebarOpen) && user ? (
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 cursor-pointer group transition-colors duration-100"
              onClick={logout}
            >
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0", theme.icon)}>
                {user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-surface-800 dark:text-surface-100 truncate">{user.email}</p>
                <p className="text-[10px] text-surface-400 dark:text-surface-500">{getRoleLabel(role)}</p>
              </div>
              <LogOut className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500 group-hover:text-danger-500 transition-colors flex-shrink-0" />
            </div>
          ) : (
            <button
              onClick={logout}
              className={cn(
                "w-full flex justify-center py-2.5 rounded-xl hover:bg-danger-50 text-surface-400 dark:text-surface-500 hover:text-danger-500 transition-colors",
                sidebarCollapsed && !sidebarOpen ? "px-2" : "px-3"
              )}
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

// "use client";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { cn } from "@/lib/utils";
// import { useUIStore } from "@/store/ui.store";
// import { useAuthStore } from "@/store/auth.store";
// import { getNavConfig, getRoleTheme } from "./nav-config";
// import { getRoleLabel } from "@/types";
// import { GraduationCap, LogOut, ChevronLeft, Menu, X } from "lucide-react";
// import type { UserRole } from "@/types";

// export function Sidebar() {
//   const pathname = usePathname();
//   const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleCollapsed } = useUIStore();
//   const { user, logout } = useAuthStore();

//   const role = (user?.role ?? "user") as UserRole;
//   const navSections = getNavConfig(role);
//   const theme = getRoleTheme(role);

//   return (
//     <>
//       {/* Mobile backdrop */}
//       {sidebarOpen && (
//         <div
//           className="lg:hidden fixed inset-0 bg-surface-900/50 dark:bg-surface-900/80 backdrop-blur-sm z-30 animate-fade-in"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       <aside
//         className={cn(
//           "fixed top-0 left-0 h-full bg-white dark:bg-surface-900 border-r border-surface-100 dark:border-surface-800 z-40 flex flex-col transition-all duration-300 shadow-card-md",
//           // Desktop: collapsible
//           "hidden lg:flex",
//           sidebarCollapsed ? "lg:w-[68px]" : "lg:w-64",
//           // Mobile: slide-in overlay
//           sidebarOpen && "!flex",
//           sidebarOpen ? "w-72" : "w-0 overflow-hidden",
//         )}
//       >
//         {/* Logo + collapse button */}
//         <div className={cn(
//           "flex items-center h-16 border-b border-surface-100 dark:border-surface-800 px-3 flex-shrink-0",
//           sidebarCollapsed && !sidebarOpen ? "justify-center" : "justify-between"
//         )}>
//           {(!sidebarCollapsed || sidebarOpen) && (
//             <div className="flex items-center gap-2.5 min-w-0">
//               <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", theme.icon)}>
//                 <GraduationCap className="w-4 h-4 text-white" />
//               </div>
//               <div className="min-w-0">
//                 <p className="text-sm font-bold text-surface-900 dark:text-surface-50 leading-none">EduCRM</p>
//                 <p className="text-[10px] text-surface-400 dark:text-surface-500 mt-0.5 capitalize truncate">{getRoleLabel(role)}</p>
//               </div>
//             </div>
//           )}

//           {/* Mobile close */}
//           <button
//             onClick={() => { setSidebarOpen(false); }}
//             className="lg:hidden w-8 h-8 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400 transition-colors flex-shrink-0"
//           >
//             <X className="w-4 h-4" />
//           </button>

//           {/* Desktop collapse toggle */}
//           <button
//             onClick={toggleCollapsed}
//             className="hidden lg:flex w-8 h-8 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 items-center justify-center text-surface-500 dark:text-surface-400 transition-colors flex-shrink-0"
//           >
//             {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
//           </button>
//         </div>

//         {/* Role badge (mobile/expanded only) */}
//         {(!sidebarCollapsed || sidebarOpen) && (
//           <div className="px-3 py-2 flex-shrink-0">
//             <div className={cn(
//               "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold",
//               role === "admin"   ? "bg-brand-50 text-brand-700" :
//               role === "manager" ? "bg-success-50 text-success-700" :
//               role === "teacher" ? "bg-purple-50 text-purple-700" :
//               role === "asistend"? "bg-orange-50 text-orange-700" :
//               "bg-cyan-50 text-cyan-700"
//             )}>
//               <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
//                 role === "admin" ? "bg-brand-500" :
//                 role === "manager" ? "bg-success-500" :
//                 role === "teacher" ? "bg-purple-500" :
//                 role === "asistend" ? "bg-orange-500" : "bg-cyan-500"
//               )} />
//               {getRoleLabel(role)}
//             </div>
//           </div>
//         )}

//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
//           {navSections.map((section, si) => (
//             <div key={si}>
//               {section.title && (!sidebarCollapsed || sidebarOpen) && (
//                 <p className="px-3 py-1 text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider">
//                   {section.title}
//                 </p>
//               )}
//               <div className="space-y-0.5">
//                 {section.items.map(({ label, href, icon: Icon }) => {
//                   const active = pathname === href || pathname.startsWith(href + "/");
//                   return (
//                     <Link
//                       key={href}
//                       href={href}
//                       title={sidebarCollapsed && !sidebarOpen ? label : undefined}
//                       onClick={() => setSidebarOpen(false)}
//                       className={cn(
//                         "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
//                         active ? theme.active : "text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 hover:text-surface-900 dark:text-surface-50",
//                         (sidebarCollapsed && !sidebarOpen) && "justify-center px-2",
//                       )}
//                     >
//                       <Icon className={cn(
//                         "flex-shrink-0 transition-colors",
//                         "w-[18px] h-[18px]",
//                         active ? theme.text : "text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:text-surface-400",
//                       )} />
//                       {(!sidebarCollapsed || sidebarOpen) && (
//                         <>
//                           <span className="flex-1 truncate">{label}</span>
//                           {active && <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", theme.dot)} />}
//                         </>
//                       )}
//                     </Link>
//                   );
//                 })}
//               </div>
//             </div>
//           ))}
//         </nav>

//         {/* User info + logout */}
//         <div className="border-t border-surface-100 dark:border-surface-800 p-2 flex-shrink-0">
//           {(!sidebarCollapsed || sidebarOpen) && user ? (
//             <div
//               className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 cursor-pointer group transition-colors"
//               onClick={logout}
//             >
//               <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0", theme.icon)}>
//                 {user.email[0].toUpperCase()}
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-xs font-medium text-surface-800 dark:text-surface-100 truncate">{user.email}</p>
//                 <p className="text-[10px] text-surface-400 dark:text-surface-500 capitalize">{getRoleLabel(role)}</p>
//               </div>
//               <LogOut className="w-3.5 h-3.5 text-surface-400 dark:text-surface-500 group-hover:text-danger-500 transition-colors flex-shrink-0" />
//             </div>
//           ) : (
//             <button
//               onClick={logout}
//               className={cn(
//                 "w-full flex justify-center py-2.5 rounded-xl hover:bg-danger-50 text-surface-400 dark:text-surface-500 hover:text-danger-500 transition-colors",
//                 (sidebarCollapsed && !sidebarOpen) ? "px-2" : "px-3"
//               )}
//               title="Chiqish"
//             >
//               <LogOut className="w-[18px] h-[18px]" />
//             </button>
//           )}
//         </div>
//       </aside>
//     </>
//   );
// }
