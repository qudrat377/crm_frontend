"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, getRoleHomePath } from "@/store/auth.store";
import type { UserRole } from "@/types";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || !user) {
      router.replace("/auth/login");
      return;
    }
    if (!allowedRoles.includes(user.role as UserRole)) {
      router.replace(getRoleHomePath(user.role as UserRole));
    }
  }, [_hasHydrated, isAuthenticated, user, allowedRoles, router]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-900/30 animate-pulse" />
          <div className="h-2 w-24 bg-surface-200 dark:bg-surface-700 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;
  if (!allowedRoles.includes(user.role as UserRole)) return null;

  return <>{children}</>;
}


// "use client";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore, getRoleHomePath } from "@/store/auth.store";
// import type { UserRole } from "@/types";
 
// interface RouteGuardProps {
//   children: React.ReactNode;
//   allowedRoles: UserRole[];
// }
 
// export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
//   const router = useRouter();
//   const { user, isAuthenticated, _hasHydrated } = useAuthStore();
 
//   useEffect(() => {
//     // ─── MUHIM: Hydration tugamaguncha redirect qilmaymiz ──────────
//     // Refresh bosilganda localStorage hali o'qilmagan bo'lishi mumkin.
//     // _hasHydrated = true bo'lgunga qadar kutamiz.
//     if (!_hasHydrated) return;
 
//     if (!isAuthenticated || !user) {
//       router.replace("/auth/login");
//       return;
//     }
//     if (!allowedRoles.includes(user.role as UserRole)) {
//       router.replace(getRoleHomePath(user.role as UserRole));
//     }
//   }, [_hasHydrated, isAuthenticated, user, allowedRoles, router]);
 
//   // ─── Hydration kutish holati ────────────────────────────────────
//   // Sahifani bo'sh qoldirmaslik uchun yengil skeleton ko'rsatish
//   if (!_hasHydrated) {
//     return (
//       <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-900/30 animate-pulse" />
//           <div className="h-2 w-24 bg-surface-200 dark:bg-surface-700 rounded-full animate-pulse" />
//         </div>
//       </div>
//     );
//   }
 
//   if (!isAuthenticated || !user) return null;
//   if (!allowedRoles.includes(user.role as UserRole)) return null;
 
//   return <>{children}</>;
// }
 
// "use client";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore, getRoleHomePath } from "@/store/auth.store";
// import type { UserRole } from "@/types";

// interface RouteGuardProps {
//   children: React.ReactNode;
//   allowedRoles: UserRole[];
// }

// export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
//   const router = useRouter();
//   const { user, isAuthenticated } = useAuthStore();

//   useEffect(() => {
//     if (!isAuthenticated || !user) {
//       router.replace("/auth/login");
//       return;
//     }
//     if (!allowedRoles.includes(user.role as UserRole)) {
//       // Redirect to their own home
//       router.replace(getRoleHomePath(user.role as UserRole));
//     }
//   }, [isAuthenticated, user, allowedRoles, router]);

//   if (!isAuthenticated || !user) return null;
//   if (!allowedRoles.includes(user.role as UserRole)) return null;

//   return <>{children}</>;
// }
