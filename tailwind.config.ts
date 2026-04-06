import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81",950:"#1e1b4b" },
        surface: { 50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a",950:"#020617" },
        success: { 50:"#f0fdf4",100:"#dcfce7",500:"#22c55e",600:"#16a34a",700:"#15803d" },
        warning: { 50:"#fffbeb",100:"#fef3c7",500:"#f59e0b",600:"#d97706" },
        danger:  { 50:"#fff1f2",100:"#ffe4e6",500:"#f43f5e",600:"#e11d48",700:"#be123c" },
        // Role-specific accent colors
        student: { 50:"#ecfeff",100:"#cffafe",400:"#22d3ee",500:"#06b6d4",600:"#0891b2",700:"#0e7490" },
        teacher: { 50:"#fdf4ff",100:"#fae8ff",400:"#c084fc",500:"#a855f7",600:"#9333ea",700:"#7e22ce" },
        assistant:{ 50:"#fff7ed",100:"#ffedd5",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c" },
      },
      fontFamily: { sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"] },
      borderRadius: { "2xl":"1rem","3xl":"1.5rem" },
      boxShadow: {
        card:"0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-md":"0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        "card-lg":"0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
      },
      screens: { xs:"420px", sm:"640px", md:"768px", lg:"1024px", xl:"1280px", "2xl":"1536px" },
      animation: {
        "fade-in":"fadeIn 0.2s ease-in-out",
        "slide-up":"slideUp 0.3s ease-out",
        "slide-in":"slideIn 0.25s ease-out",
        shimmer:"shimmer 1.5s infinite",
        "bounce-sm":"bounceSm 0.4s ease-out",
      },
      keyframes: {
        fadeIn:   { "0%":{ opacity:"0" },              "100%":{ opacity:"1" } },
        slideUp:  { "0%":{ opacity:"0", transform:"translateY(10px)" }, "100%":{ opacity:"1", transform:"translateY(0)" } },
        slideIn:  { "0%":{ opacity:"0", transform:"translateX(-8px)" }, "100%":{ opacity:"1", transform:"translateX(0)" } },
        shimmer:  { "0%":{ backgroundPosition:"-200% 0" }, "100%":{ backgroundPosition:"200% 0" } },
        bounceSm: { "0%":{ transform:"scale(0.95)" }, "60%":{ transform:"scale(1.02)" }, "100%":{ transform:"scale(1)" } },
      },
    },
  },
  plugins: [],
};
export default config;
