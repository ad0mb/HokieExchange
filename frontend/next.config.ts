import type { NextConfig } from "next";

// Backend origin (FastAPI). Set to the real server IP on Vercel; defaults to
// localhost for development. This is the server-side URL, never exposed to the
// browser — it's used only to proxy `/api/backend/*` requests below.
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // `/api/backend/services/...` → `${BACKEND_URL}/services/...`
        // Proxied server-side so the browser only ever talks HTTPS to Vercel.
        source: "/api/backend/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
