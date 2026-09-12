import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.AUTH_URL || "https://liferpg.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup"],
        disallow: ["/app/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
