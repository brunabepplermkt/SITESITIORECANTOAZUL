import type { MetadataRoute } from "next";
import { getAccommodations, getPublishedPageSlugs } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sitiorecantoazul.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [accommodations, pageSlugs] = await Promise.all([getAccommodations(), getPublishedPageSlugs()]);
  const staticRoutes = [
    "",
    "/acomodacoes",
    "/experiencias",
    "/sobre",
    "/localizacao",
    "/faq",
    "/contato",
    "/politicas",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const accommodationRoutes = accommodations.map((a) => ({
    url: `${siteUrl}/acomodacoes/${a.slug}`,
    lastModified: new Date(),
  }));

  const pageRoutes = pageSlugs.map((slug) => ({
    url: `${siteUrl}/${slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...accommodationRoutes, ...pageRoutes];
}
