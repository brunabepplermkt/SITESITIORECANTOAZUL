import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  accommodations as seedAccommodations,
  experiences as seedExperiences,
  faqs as seedFaqs,
  homeSections as seedHomeSections,
  policiesContent as seedPolicies,
  siteSettings as seedSiteSettings,
} from "@/lib/content";
import type {
  Accommodation,
  CmsPage,
  Experience,
  FaqItem,
  HomeSection,
  NavPage,
  PageBlock,
  Review,
  SiteSettings,
} from "@/lib/types";

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
      googleMapsUrl: data.google_maps_url ?? null,
      defaultReserveUrl: data.default_reserve_url || seedSiteSettings.defaultReserveUrl,
      seoTitle: data.seo_title ?? null,
      seoDescription: data.seo_description ?? null,
      ogImageUrl: data.og_image_url ?? null,
      bookingProvider: data.booking_provider ?? seedSiteSettings.bookingProvider,
      bookingBaseUrl: data.booking_base_url ?? null,
      bookingOpenMode: data.booking_open_mode ?? seedSiteSettings.bookingOpenMode,
      bookingCtaLabel: data.booking_cta_label || seedSiteSettings.bookingCtaLabel,
      bookingShowSearchHome: data.booking_show_search_home ?? false,
      bookingShowSearchAccommodation: data.booking_show_search_accommodation ?? false,
      bookingShowCalendar: data.booking_show_calendar ?? false,
      bookingWidgetEmbedUrl: data.booking_widget_embed_url ?? null,
      googleAnalyticsId: data.google_analytics_id ?? null,
      metaPixelId: data.meta_pixel_id ?? null,
    };
  } catch {
    return seedSiteSettings;
  }
}

type AccommodationOpts = { includeUnpublished?: boolean };

export async function getAccommodations(opts: AccommodationOpts = {}): Promise<Accommodation[]> {
  if (!isSupabaseConfigured()) {
    return opts.includeUnpublished ? seedAccommodations : seedAccommodations.filter((a) => a.published);
  }

  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("accommodations")
      .select("*, accommodation_images(*)")
      .order("home_order", { ascending: true })
      .order("order_index", { ascending: true });

    if (!opts.includeUnpublished) query = query.eq("published", true);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return opts.includeUnpublished ? seedAccommodations : seedAccommodations.filter((a) => a.published);
    }

    return data.map(
      (row): Accommodation => ({
        slug: row.slug,
        name: row.name,
        tagline: row.tagline,
        shortDescription: row.short_description || row.tagline,
        description: row.description,
        capacity: row.capacity,
        adults: row.adults,
        children: row.children,
        beds: row.beds,
        rooms: row.rooms,
        bathrooms: row.bathrooms,
        priceFrom: row.price_from,
        highlights: row.highlights ?? [],
        amenities: row.amenities ?? [],
        reserveUrl: row.reserve_url || seedSiteSettings.defaultReserveUrl,
        published: row.published,
        featuredHome: row.featured_home,
        homeOrder: row.home_order,
        seoTitle: row.seo_title,
        seoDescription: row.seo_description,
        ogImageUrl: row.og_image_url,
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
    return opts.includeUnpublished ? seedAccommodations : seedAccommodations.filter((a) => a.published);
  }
}

export async function getAccommodation(
  slug: string,
  opts: AccommodationOpts = {},
): Promise<Accommodation | undefined> {
  const list = await getAccommodations(opts);
  return list.find((a) => a.slug === slug);
}

type ExperienceOpts = { includeUnpublished?: boolean };

export async function getExperiences(opts: ExperienceOpts = {}): Promise<Experience[]> {
  if (!isSupabaseConfigured()) {
    return opts.includeUnpublished ? seedExperiences : seedExperiences.filter((e) => e.published);
  }

  try {
    const supabase = createPublicClient();
    let query = supabase.from("experiences").select("*").order("order_index", { ascending: true });
    if (!opts.includeUnpublished) query = query.eq("published", true);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return opts.includeUnpublished ? seedExperiences : seedExperiences.filter((e) => e.published);
    }

    return data.map(
      (row): Experience => ({
        slug: row.slug,
        name: row.name,
        description: row.description,
        image: { id: row.slug, url: row.image_url, alt: row.image_alt, order: row.order_index },
        published: row.published,
        ctaLabel: row.cta_label,
        ctaHref: row.cta_href,
      }),
    );
  } catch {
    return opts.includeUnpublished ? seedExperiences : seedExperiences.filter((e) => e.published);
  }
}

type FaqOpts = { includeUnpublished?: boolean };

export async function getFaqs(opts: FaqOpts = {}): Promise<FaqItem[]> {
  if (!isSupabaseConfigured()) {
    return opts.includeUnpublished ? seedFaqs : seedFaqs.filter((f) => f.published);
  }

  try {
    const supabase = createPublicClient();
    let query = supabase.from("faqs").select("*").order("order_index", { ascending: true });
    if (!opts.includeUnpublished) query = query.eq("published", true);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return opts.includeUnpublished ? seedFaqs : seedFaqs.filter((f) => f.published);
    }

    return data.map(
      (row): FaqItem => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
        published: row.published,
        order: row.order_index,
      }),
    );
  } catch {
    return opts.includeUnpublished ? seedFaqs : seedFaqs.filter((f) => f.published);
  }
}

/**
 * Avaliações não têm fallback seed: nunca inventamos depoimentos. Sem
 * Supabase configurado (ou sem nenhuma publicada), retorna lista vazia — a
 * seção pública correspondente simplesmente não é renderizada.
 */
export async function getPublishedReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("published", true)
      .order("order_index", { ascending: true });

    if (error || !data) return [];

    return data.map(
      (row): Review => ({
        id: row.id,
        guestName: row.guest_name,
        text: row.text,
        rating: row.rating,
        source: row.source,
        accommodationSlug: row.accommodation_slug,
        dateLabel: row.date_label,
        order: row.order_index,
        published: row.published,
      }),
    );
  } catch {
    return [];
  }
}

/**
 * Seções da Home: título/subtítulo/texto/imagem/visibilidade/ordem
 * editáveis pelo /admin. A lista de chaves de seção é fixa no código
 * (não é um page-builder livre) — só o conteúdo e a ordem entre elas
 * são administráveis.
 */
export async function getHomeSections(opts: { includeHidden?: boolean } = {}): Promise<HomeSection[]> {
  if (!isSupabaseConfigured()) {
    const sections = opts.includeHidden ? seedHomeSections : seedHomeSections.filter((s) => s.visible);
    return [...sections].sort((a, b) => a.order - b.order);
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("home_sections").select("*").order("order_index", { ascending: true });

    if (error || !data || data.length === 0) {
      const sections = opts.includeHidden ? seedHomeSections : seedHomeSections.filter((s) => s.visible);
      return [...sections].sort((a, b) => a.order - b.order);
    }

    const seedByKey = new Map(seedHomeSections.map((s) => [s.key, s]));

    const sections: HomeSection[] = data.map((row) => {
      const fallback = seedByKey.get(row.key);
      return {
        key: row.key,
        title: row.title ?? fallback?.title ?? null,
        subtitle: row.subtitle ?? fallback?.subtitle ?? null,
        body: row.body ?? fallback?.body ?? null,
        imageUrl: row.image_url ?? fallback?.imageUrl ?? null,
        imageAlt: row.image_alt ?? fallback?.imageAlt ?? null,
        buttonLabel: row.button_label ?? fallback?.buttonLabel ?? null,
        buttonHref: row.button_href ?? fallback?.buttonHref ?? null,
        visible: row.visible,
        order: row.order_index,
      };
    });

    return opts.includeHidden ? sections : sections.filter((s) => s.visible);
  } catch {
    const sections = opts.includeHidden ? seedHomeSections : seedHomeSections.filter((s) => s.visible);
    return [...sections].sort((a, b) => a.order - b.order);
  }
}

/**
 * Páginas customizadas: sem Supabase configurado, não existem (não fazem
 * parte do seed local — são um recurso exclusivo do CMS).
 */
export async function getNavPages(): Promise<NavPage[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("pages")
      .select("slug, title, nav_label")
      .eq("published", true)
      .eq("show_in_nav", true)
      .order("order_index", { ascending: true });

    if (error || !data) return [];

    return data.map((row) => ({ slug: row.slug, label: row.nav_label || row.title }));
  } catch {
    return [];
  }
}

export async function getPublishedPageSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("pages").select("slug").eq("published", true);
    if (error || !data) return [];
    return data.map((row) => row.slug);
  } catch {
    return [];
  }
}

export async function getPage(slug: string): Promise<CmsPage | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("pages")
      .select("*, page_blocks(*)")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error || !data) return null;

    const blocks: PageBlock[] = (data.page_blocks ?? [])
      .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
      .map(
        (b: {
          id: string;
          type: "text" | "image";
          content: string | null;
          image_url: string | null;
          image_alt: string | null;
          order_index: number;
        }): PageBlock =>
          b.type === "image"
            ? { id: b.id, type: "image", imageUrl: b.image_url ?? "", imageAlt: b.image_alt ?? "", order: b.order_index }
            : { id: b.id, type: "text", content: b.content ?? "", order: b.order_index },
      );

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      navLabel: data.nav_label,
      showInNav: data.show_in_nav,
      published: data.published,
      order: data.order_index,
      blocks,
    };
  } catch {
    return null;
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
