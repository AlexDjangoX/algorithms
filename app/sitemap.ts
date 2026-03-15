import type { MetadataRoute } from "next";
import { ALGORITHMS } from "@/lib/data/algorithms";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...ALGORITHMS.filter((a) => a.status === "live").map((algo) => ({
      url: `${baseUrl}/algorithms/${algo.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  return routes;
}
