import type { NextConfig } from "next";

function supabaseStorageHostname(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const supabaseHostname = supabaseStorageHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cobre qualquer projeto Supabase hospedado (*.supabase.co), já que o
      // hostname exato só é conhecido em runtime via NEXT_PUBLIC_SUPABASE_URL.
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      ...(supabaseHostname && !supabaseHostname.endsWith(".supabase.co")
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
