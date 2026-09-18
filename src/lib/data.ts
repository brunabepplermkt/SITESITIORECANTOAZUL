import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  accommodations as seedAccommodations,
  experiences as seedExperiences,
  faqs as seedFaqs,
  policiesContent as seedPolicies,
  siteSettings as seedSiteSettings,
} from "@/lib/content";
import type { Accommodation, Experience, FaqItem, SiteSettings } from "@/lib/types";

/**
 * Camada de leitura pública: tenta o Supabase e cai para o conteúdo seed
 * quando o Supabase não está configurado ou a consulta falha. Mantém as
 * páginas públicas funcionando mesmo antes do CMS estar em produção.
 */

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return seedSiteSettings;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "main")
      .maybeSingle();

    if (error || !data) return seedSiteSettings;

    return {
      siteName: data.site_name || seedSiteSettings.siteName,
      tagline: data.tagline || seedSiteSettings.tagline,
      phone: data.phone || seedSiteSettings.phone,
      whatsapp: data.whatsapp || seedSiteSettings.whatsapp,
      email: data.email || seedSiteSettings.email,
      instagram: data.instagram || seedSiteSettings.instagram,
      address: data.address || seedSiteSettings.address,
      defaultReserveUrl: data.default_reserve_url || seedSiteSettings.defaultReserveUrl,
    };
  } catch {
    return seedSiteSettings;
  }
}

export async function getAccommodations(): Promise<Accommodation[]> {
  if (!isSupabaseConfigured()) return seedAccommodations;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("accommodations")
      .select("*, accommodation_images(*)")
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) return seedAccommodations;

    return data.map(
      (row): Accommodation => ({
        slug: row.slug,
        name: row.name,
        tagline: row.tagline,
        description: row.description,
        capacity: row.capacity,
        priceFrom: row.price_from,
        highlights: row.highlights ?? [],
        amenities: row.amenities ?? [],
        reserveUrl: row.reserve_url || seedSiteSettings.defaultReserveUrl,
        images: (row.accommodation_images ?? [])
          .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
          .map((img: { id: string; url: string; alt: string; order_index: number }) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            order: img.order_index,
          })),
      }),
    );
  } catch {
    return seedAccommodations;
  }
}

export async function getAccommodation(slug: string): Promise<Accommodation | undefined> {
  const list = await getAccommodations();
  return list.find((a) => a.slug === slug);
}

export async function getExperiences(): Promise<Experience[]> {
  if (!isSupabaseConfigured()) return seedExperiences;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) return seedExperiences;

    return data.map(
      (row): Experience => ({
        slug: row.slug,
        name: row.name,
        description: row.description,
        image: { id: row.slug, url: row.image_url, alt: row.image_alt, order: row.order_index },
      }),
    );
  } catch {
    return seedExperiences;
  }
}

export async function getFaqs(): Promise<FaqItem[]> {
  if (!isSupabaseConfigured()) return seedFaqs;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) return seedFaqs;

    return data.map((row): FaqItem => ({ id: row.id, question: row.question, answer: row.answer }));
  } catch {
    return seedFaqs;
  }
}

export async function getPolicies(): Promise<string> {
  if (!isSupabaseConfigured()) return seedPolicies;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("policies")
      .select("*")
      .eq("id", "main")
      .maybeSingle();

    if (error || !data?.content) return seedPolicies;
    return data.content;
  } catch {
    return seedPolicies;
  }
}
