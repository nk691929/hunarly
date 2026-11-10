import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";

/** Only indexable pages belong here. Placeholder pages are noindex and excluded. */
export const indexablePaths = ["/", "/pricing", "/privacy", "/terms"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return indexablePaths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
