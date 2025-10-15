import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // webpack: (config, { isServer }) => {
  //   // Force all packages to use the same React instance and types
  //   // This fixes "Remember to wrap your app in CopilotKit" errors
  //   // caused by multiple React instances from file: dependencies
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     react: path.resolve(__dirname, "node_modules/react"),
  //     "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
  //     "@types/react": path.resolve(__dirname, "node_modules/@types/react"),
  //     "@types/react-dom": path.resolve(__dirname, "node_modules/@types/react-dom"),
  //   };

  //   return config;
  // },
};

export default nextConfig;
