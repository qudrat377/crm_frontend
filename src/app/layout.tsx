import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: { template: "%s | EduCRM", default: "EduCRM" },
  description: "O'quv markazi CRM tizimi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={geist.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


// import type { Metadata, Viewport } from "next";
// import { Geist } from "next/font/google";
// import "./globals.css";
// import { Providers } from "@/components/layout/providers";
 
// const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
 
// export const viewport: Viewport = {
//   width: "device-width",
//   initialScale: 1,
// };
 
// export const metadata: Metadata = {
//   title: { template: "%s | EduCRM", default: "EduCRM" },
//   description: "O'quv markazi CRM tizimi",
// };
 
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     // suppressHydrationWarning — next-themes dark/light mode uchun zarur
//     // class attribute server va client da farq qiladi, shu sababli warning chiqmasligi kerak
//     <html lang="uz" className={geist.variable} suppressHydrationWarning>
//       {/*
//         MUHIM: <body> ga suppressHydrationWarning yo'q — faqat <html> ga kerak.
//         next-themes "class" attributeni html elementiga qo'shadi.
//       */}
//       <body suppressHydrationWarning>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }











// import type { Metadata, Viewport } from "next";
// import { Geist } from "next/font/google";
// import "./globals.css";
// import { Providers } from "@/components/layout/providers";

// const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

// export const viewport: Viewport = {
//   width: "device-width",
//   initialScale: 1,
// };

// export const metadata: Metadata = {
//   title: { template: "%s | EduCRM", default: "EduCRM" },
//   description: "O'quv markazi CRM tizimi",
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="uz" className={geist.variable} suppressHydrationWarning>
//       <body>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }
