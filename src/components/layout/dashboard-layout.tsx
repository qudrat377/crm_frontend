"use client";
import { useUIStore } from "@/store/ui.store";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/lib/utils";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900/50">
      <Sidebar />
      <Header />
      <main className={cn(
        "pt-16 min-h-screen transition-all duration-300",
        // Desktop offset
        sidebarCollapsed ? "lg:pl-[68px]" : "lg:pl-64",
        // Mobile: no offset (sidebar is overlay)
        "pl-0",
      )}>
        <div className="p-4 md:p-6 max-w-screen-2xl page-enter"> 
          {/* animate-fade-in */}
          {children}
        </div>
      </main>
    </div>
  );
}
