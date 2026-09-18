import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const isTauriBuild = process.env.TAURI_BUILD === "1";

const nextConfig: NextConfig = {
  ...(isTauriBuild ? { output: "export" as const } : {}),
  experimental: {
    // Use Next's in-process TypeScript checker during builds. This avoids
    // subprocess output parsing failures with the local TypeScript CLI.
    useTypeScriptCli: false,
  },
};

export default withSerwist(nextConfig);
