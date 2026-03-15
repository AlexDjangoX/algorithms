import type { MetadataRoute } from "next";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api"],
      },
      {
        userAgent: ["Googlebot", "Bingbot", "Slurp", "DuckDuckBot", "YandexBot", "Baiduspider"],
        allow: "/",
        disallow: ["/api"],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Claude-Web",
          "ClaudeBot",
          "Google-Extended",
          "PerplexityBot",
          "Anthropic-AI",
          "CCBot",
          "Bytespider",
          "Cohere-AI",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
