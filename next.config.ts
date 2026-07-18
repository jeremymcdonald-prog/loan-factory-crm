import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory makes Turbopack infer the workspace
  // root as ~, which stalls dev-server requests scanning the whole (iCloud-
  // synced) home tree. Pin the root to this project.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
