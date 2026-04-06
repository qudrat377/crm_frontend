"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, getRoleHomePath } from "@/store/auth.store";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/auth/login");
    } else {
      router.replace(getRoleHomePath(user.role as any));
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900/50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-surface-500 dark:text-surface-400">Yuklanmoqda...</p>
      </div>
    </div>
  );
}
