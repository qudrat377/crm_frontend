"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import { ThemeProvider } from "next-themes";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:            5 * 60 * 1000,
        gcTime:              30 * 60 * 1000,
        retry:                1,
        refetchOnWindowFocus: false,
        refetchOnMount:       false,
        refetchOnReconnect:  "always",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => getQueryClient());

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={qc}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#0f172a",
              color: "#f8fafc",
              fontSize: "13px",
              fontWeight: 500,
              borderRadius: "12px",
              padding: "10px 14px",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.2)",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#0f172a" } },
            error:   { iconTheme: { primary: "#f43f5e", secondary: "#0f172a" } },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}


// "use client";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "react-hot-toast";
// import { useState } from "react";
// import { ThemeProvider } from "next-themes";
 
// export function Providers({ children }: { children: React.ReactNode }) {
//   const [qc] = useState(() =>
//     new QueryClient({
//       defaultOptions: {
//         queries: {
//           // ─── Tezlik optimizatsiyalari ───────────────────────────
//           staleTime: 5 * 60 * 1000,     // 5 daqiqa — qayta fetch kamayadi
//           gcTime:    10 * 60 * 1000,    // 10 daqiqa — cache xotirada saqlanadi
//           retry: 1,
//           refetchOnWindowFocus: false,  // Tab o'zgarganda qayta fetch yo'q
//           refetchOnMount: false,        // Sahifaga qaytganda qayta fetch yo'q (cache bor bo'lsa)
//           refetchOnReconnect: "always", // Internet qaytganda yangilash
//         },
//       },
//     })
//   );
 
//   return (
//     // ─── ThemeProvider sozlamalari ───────────────────────────────
//     // attribute="class"  — Tailwind dark mode uchun html classga "dark" qo'shadi
//     // defaultTheme="system" — Foydalanuvchi tizim rejasiga ko'ra
//     // enableSystem       — Tizim dark/light rejasini kuzatadi
//     // disableTransitionOnChange — Tema o'zgarganda flash bo'lmaydi
//     <ThemeProvider
//       attribute="class"
//       defaultTheme="system"
//       enableSystem
//       disableTransitionOnChange
//     >
//       <QueryClientProvider client={qc}>
//         {children}
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             duration: 3500,
//             style: {
//               background: "#0f172a",
//               color: "#f8fafc",
//               fontSize: "13px",
//               fontWeight: 500,
//               borderRadius: "12px",
//               padding: "10px 14px",
//               boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.2)",
//             },
//             success: { iconTheme: { primary: "#22c55e", secondary: "#0f172a" } },
//             error:   { iconTheme: { primary: "#f43f5e", secondary: "#0f172a" } },
//           }}
//         />
//       </QueryClientProvider>
//     </ThemeProvider>
//   );
// }




// "use client";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "react-hot-toast";
// import { useState } from "react";
// import { ThemeProvider } from "next-themes";

// export function Providers({ children }: { children: React.ReactNode }) {
//   const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 120_000, retry: 1 } } }));
//   return (
//     <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
//       <QueryClientProvider client={qc}>
//         {children}
//         <Toaster position="top-right" toastOptions={{
//           duration: 3500,
//           style: { background:"#0f172a", color:"#f8fafc", fontSize:"13px", fontWeight:500, borderRadius:"12px", padding:"10px 14px", boxShadow:"0 10px 15px -3px rgb(0 0 0 / 0.2)" },
//           success: { iconTheme: { primary:"#22c55e", secondary:"#0f172a" } },
//           error:   { iconTheme: { primary:"#f43f5e", secondary:"#0f172a" } },
//         }}/>
//       </QueryClientProvider>
//     </ThemeProvider>
//   );
// }
