import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
      "@tanstack/react-query",
    ],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            // Umumiy vendor chunk
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 10,
            },
            // recharts — faqat dashboard da kerak, alohida chunk
            recharts: {
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              name: "recharts",
              chunks: "all",
              priority: 25,
            },
            // react-hook-form + zod — form sahifalar uchun
            forms: {
              test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
              name: "forms",
              chunks: "all",
              priority: 25,
            },
            // date-fns — alohida chunk
            dateFns: {
              test: /[\\/]node_modules[\\/]date-fns[\\/]/,
              name: "date-fns",
              chunks: "all",
              priority: 25,
            },
            // zustand
            zustand: {
              test: /[\\/]node_modules[\\/]zustand[\\/]/,
              name: "zustand",
              chunks: "all",
              priority: 20,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;



// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   reactStrictMode: true,
//   experimental: {
//     optimizePackageImports: [
//       "lucide-react",
//       "recharts",
//       "@tanstack/react-query",
//       "date-fns",
//       "zustand",
//     ],
//   },
// };

// export default nextConfig;

// // import type { NextConfig } from "next";
// // const nextConfig: NextConfig = { reactStrictMode: true };
// // export default nextConfig;
