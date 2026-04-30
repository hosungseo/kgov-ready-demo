import type { MetadataRoute } from "next";
import { MINISTRIES } from "@/lib/ministries";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kgov-ready-demo.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const root: MetadataRoute.Sitemap = [
    { url: SITE_URL + "/", lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: SITE_URL + "/about", lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: SITE_URL + "/plaza", lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: SITE_URL + "/plaza/agents", lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: SITE_URL + "/plaza/tasks", lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: SITE_URL + "/plaza/trust", lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: SITE_URL + "/plaza/playground", lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: SITE_URL + "/plaza/passport", lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: SITE_URL + "/plaza/bottlenecks", lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: SITE_URL + "/llms.txt", lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];
  const ministryPages = MINISTRIES.map((m) => ({
    url: SITE_URL + "/" + m.slug,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  return [...root, ...ministryPages];
}
