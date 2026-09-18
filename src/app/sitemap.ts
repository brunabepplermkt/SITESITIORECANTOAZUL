import type { MetadataRoute } from "next";
import { accommodations } from "@/lib/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sitiorecantoazul.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
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

  return [...staticRoutes, ...accommodationRoutes];
}
