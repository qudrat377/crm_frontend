"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { authApi } from "@/lib/api";
import type { User, UserRole } from "@/types";
import {
  ADMIN_ROLES, MANAGER_ROLES, STAFF_ROLES,
  STUDENT_ROLES, TEACHER_ROLES, ASSISTANT_ROLES,
} from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  login: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  isAdmin:     () => boolean;
  isManager:   () => boolean;
  isStaff:     () => boolean;
  isTeacher:   () => boolean;
  isAssistant: () => boolean;
  isStudent:   () => boolean;
  canAccess:   (roles: UserRole[]) => boolean;
}

export function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case "admin":
    case "manager":  return "/dashboard";
    case "teacher":  return "/teacher-portal/groups";
    case "asistend": return "/assistant-portal/attendance";
    case "user":     return "/portal/my-groups";
    default:         return "/dashboard";
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login(email, password);
          const { user, tokens } = res.data.data;
          Cookies.set("accessToken", tokens.accessToken, { expires: 1 });
          Cookies.set("refreshToken", tokens.refreshToken, { expires: 7 });
          set({ user: user as User, isAuthenticated: true, isLoading: false });
          return getRoleHomePath(user.role as UserRole);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try { await authApi.logout(); } catch { /* ignore */ }
        finally {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          set({ user: null, isAuthenticated: false });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      isAdmin:     () => ADMIN_ROLES.includes(get().user?.role as UserRole),
      isManager:   () => MANAGER_ROLES.includes(get().user?.role as UserRole),
      isStaff:     () => STAFF_ROLES.includes(get().user?.role as UserRole),
      isTeacher:   () => TEACHER_ROLES.includes(get().user?.role as UserRole),
      isAssistant: () => ASSISTANT_ROLES.includes(get().user?.role as UserRole),
      isStudent:   () => STUDENT_ROLES.includes(get().user?.role as UserRole),
      canAccess:   (roles) => roles.includes(get().user?.role as UserRole),
    }),
    {
      name: "auth-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);




// "use client";
// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import Cookies from "js-cookie";
// import { authApi } from "@/lib/api";
// import type { User, UserRole } from "@/types";
// import { ADMIN_ROLES, MANAGER_ROLES, STAFF_ROLES, STUDENT_ROLES, TEACHER_ROLES, ASSISTANT_ROLES } from "@/types";
 
// interface AuthState {
//   user: User | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   _hasHydrated: boolean;            // ← YANGI: hydration holati
//   setHasHydrated: (v: boolean) => void;
//   login: (email: string, password: string) => Promise<string>;
//   logout: () => Promise<void>;
//   setUser: (user: User | null) => void;
//   isAdmin:     () => boolean;
//   isManager:   () => boolean;
//   isStaff:     () => boolean;
//   isTeacher:   () => boolean;
//   isAssistant: () => boolean;
//   isStudent:   () => boolean;
//   canAccess:   (roles: UserRole[]) => boolean;
// }
 
// /** Returns the home route for a given role */
// export function getRoleHomePath(role: UserRole): string {
//   switch (role) {
//     case "admin":
//     case "manager":  return "/dashboard";
//     case "teacher":  return "/teacher-portal/groups";
//     case "asistend": return "/assistant-portal/attendance";
//     case "user":     return "/portal/my-groups";
//     default:         return "/dashboard";
//   }
// }
 
// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set, get) => ({
//       user: null,
//       isAuthenticated: false,
//       isLoading: false,
//       _hasHydrated: false,
 
//       // Hydration tugaganini belgilash
//       setHasHydrated: (v) => set({ _hasHydrated: v }),
 
//       login: async (email, password) => {
//         set({ isLoading: true });
//         try {
//           const res = await authApi.login(email, password);
//           const { user, tokens } = res.data.data;
//           Cookies.set("accessToken", tokens.accessToken, { expires: 1 });
//           Cookies.set("refreshToken", tokens.refreshToken, { expires: 7 });
//           set({ user: user as User, isAuthenticated: true, isLoading: false });
//           return getRoleHomePath(user.role as UserRole);
//         } catch (error) {
//           set({ isLoading: false });
//           throw error;
//         }
//       },
 
//       logout: async () => {
//         try { await authApi.logout(); } catch { /* ignore */ }
//         finally {
//           Cookies.remove("accessToken");
//           Cookies.remove("refreshToken");
//           set({ user: null, isAuthenticated: false });
//         }
//       },
 
//       setUser: (user) => set({ user, isAuthenticated: !!user }),
 
//       isAdmin:     () => ADMIN_ROLES.includes(get().user?.role as UserRole),
//       isManager:   () => MANAGER_ROLES.includes(get().user?.role as UserRole),
//       isStaff:     () => STAFF_ROLES.includes(get().user?.role as UserRole),
//       isTeacher:   () => TEACHER_ROLES.includes(get().user?.role as UserRole),
//       isAssistant: () => ASSISTANT_ROLES.includes(get().user?.role as UserRole),
//       isStudent:   () => STUDENT_ROLES.includes(get().user?.role as UserRole),
//       canAccess:   (roles) => roles.includes(get().user?.role as UserRole),
//     }),
//     {
//       name: "auth-v2",
//       storage: createJSONStorage(() => localStorage),
//       partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
//       // ─── Hydration callback ─────────────────────────────────────
//       // localStorage dan ma'lumot o'qilgandan SO'NG chaqiriladi
//       // Bu refresh da login ga o'tishni oldini oladi
//       onRehydrateStorage: () => (state) => {
//         state?.setHasHydrated(true);
//       },
//     },
//   ),
// );

// // "use client";
// // import { create } from "zustand";
// // import { persist } from "zustand/middleware";
// // import Cookies from "js-cookie";
// // import { authApi } from "@/lib/api";
// // import type { User, UserRole } from "@/types";
// // import { ADMIN_ROLES, MANAGER_ROLES, STAFF_ROLES, STUDENT_ROLES, TEACHER_ROLES, ASSISTANT_ROLES } from "@/types";

// // interface AuthState {
// //   user: User | null;
// //   isAuthenticated: boolean;
// //   isLoading: boolean;
// //   login: (email: string, password: string) => Promise<string>; // returns redirect path
// //   logout: () => Promise<void>;
// //   setUser: (user: User | null) => void;
// //   // Permission helpers
// //   isAdmin: () => boolean;
// //   isManager: () => boolean;
// //   isStaff: () => boolean;
// //   isTeacher: () => boolean;
// //   isAssistant: () => boolean;
// //   isStudent: () => boolean;
// //   canAccess: (roles: UserRole[]) => boolean;
// // }

// // /** Returns the home route for a given role */
// // export function getRoleHomePath(role: UserRole): string {
// //   switch (role) {
// //     case "admin":
// //     case "manager":   return "/dashboard";
// //     case "teacher":   return "/teacher-portal/groups";
// //     case "asistend":  return "/assistant-portal/attendance";
// //     case "user":      return "/portal/my-groups";
// //     default:          return "/dashboard";
// //   }
// // }

// // export const useAuthStore = create<AuthState>()(
// //   persist(
// //     (set, get) => ({
// //       user: null,
// //       isAuthenticated: false,
// //       isLoading: false,

// //       login: async (email, password) => {
// //         set({ isLoading: true });
// //         try {
// //           const res = await authApi.login(email, password);
// //           const { user, tokens } = res.data.data;
// //           Cookies.set("accessToken", tokens.accessToken, { expires: 1 });
// //           Cookies.set("refreshToken", tokens.refreshToken, { expires: 7 });
// //           set({ user: user as User, isAuthenticated: true, isLoading: false });
// //           return getRoleHomePath(user.role as UserRole);
// //         } catch (error) {
// //           set({ isLoading: false });
// //           throw error;
// //         }
// //       },

// //       logout: async () => {
// //         try { await authApi.logout(); } catch { /* ignore */ }
// //         finally {
// //           Cookies.remove("accessToken");
// //           Cookies.remove("refreshToken");
// //           set({ user: null, isAuthenticated: false });
// //         }
// //       },

// //       setUser: (user) => set({ user, isAuthenticated: !!user }),

// //       isAdmin:     () => ADMIN_ROLES.includes(get().user?.role as UserRole),
// //       isManager:   () => MANAGER_ROLES.includes(get().user?.role as UserRole),
// //       isStaff:     () => STAFF_ROLES.includes(get().user?.role as UserRole),
// //       isTeacher:   () => TEACHER_ROLES.includes(get().user?.role as UserRole),
// //       isAssistant: () => ASSISTANT_ROLES.includes(get().user?.role as UserRole),
// //       isStudent:   () => STUDENT_ROLES.includes(get().user?.role as UserRole),
// //       canAccess:   (roles) => roles.includes(get().user?.role as UserRole),
// //     }),
// //     {
// //       name: "auth-v2",
// //       partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
// //     },
// //   ),
// // );
