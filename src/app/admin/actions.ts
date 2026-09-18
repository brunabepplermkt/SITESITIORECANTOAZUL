"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function parseList(value: FormDataEntryValue | null): string[] {
  if (!value) return [];
  return String(value)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parsePrice(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const normalized = raw.replace(",", ".");
  const num = Number(normalized);
  if (!Number.isFinite(num) || num < 0) {
    throw new Error("Preço inválido: informe apenas números (ex.: 350 ou 350.00).");
  }
  return num;
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function sanitizeFileName(name: string): string {
  const base = name.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  return base.replace(/[^a-zA-Z0-9.\-_]/g, "-").replace(/-+/g, "-").slice(-100);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateSiteSettingsAction(formData: FormData) {
  const siteName = String(formData.get("siteName") ?? "").trim();
  if (!siteName) throw new Error("O nome do site é obrigatório.");

  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({
    id: "main",
    site_name: siteName,
    tagline: String(formData.get("tagline") ?? ""),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracoes");
}

export async function updateContactSettingsAction(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({
    id: "main",
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    email: String(formData.get("email") ?? ""),
    instagram: String(formData.get("instagram") ?? ""),
    address: String(formData.get("address") ?? ""),
    google_maps_url: String(formData.get("googleMapsUrl") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracoes/contato");
}

const BOOKING_PROVIDERS = ["none", "link", "widget", "zeloa"];
const BOOKING_OPEN_MODES = ["same_tab", "new_tab"];

export async function updateBookingSettingsAction(formData: FormData) {
  const bookingProvider = String(formData.get("bookingProvider") ?? "link");
  const bookingOpenMode = String(formData.get("bookingOpenMode") ?? "new_tab");
  if (!BOOKING_PROVIDERS.includes(bookingProvider)) throw new Error("Motor de reservas inválido.");
  if (!BOOKING_OPEN_MODES.includes(bookingOpenMode)) throw new Error("Modo de abertura inválido.");

  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({
    id: "main",
    booking_provider: bookingProvider,
    booking_base_url: String(formData.get("bookingBaseUrl") ?? "").trim() || null,
    booking_open_mode: bookingOpenMode,
    booking_cta_label: String(formData.get("bookingCtaLabel") ?? "").trim() || "Reservar",
    booking_show_search_home: formData.get("bookingShowSearchHome") === "on",
    booking_show_search_accommodation: formData.get("bookingShowSearchAccommodation") === "on",
    booking_show_calendar: formData.get("bookingShowCalendar") === "on",
    booking_widget_embed_url: String(formData.get("bookingWidgetEmbedUrl") ?? "").trim() || null,
    default_reserve_url: String(formData.get("defaultReserveUrl") ?? ""),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracoes/reservas");
}

export async function updateIntegrationsSettingsAction(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({
    id: "main",
    google_analytics_id: String(formData.get("googleAnalyticsId") ?? "").trim() || null,
    meta_pixel_id: String(formData.get("metaPixelId") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracoes/integracoes");
}

export async function updateSeoSettingsAction(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({
    id: "main",
    seo_title: String(formData.get("seoTitle") ?? "").trim() || null,
    seo_description: String(formData.get("seoDescription") ?? "").trim() || null,
    og_image_url: String(formData.get("ogImageUrl") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracoes/seo");
}

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const num = Number(raw);
  if (!Number.isInteger(num) || num < 0) {
    throw new Error("Use apenas números inteiros (0 ou mais), ou deixe em branco.");
  }
  return num;
}

export async function updateAccommodationAction(formData: FormData) {
  const supabase = await createClient();
  const slug = String(formData.get("slug"));
  const name = String(formData.get("name") ?? "").trim();
  if (!slug || !name) throw new Error("Nome da acomodação é obrigatório.");
  const priceFrom = parsePrice(formData.get("priceFrom"));

  const { error } = await supabase.from("accommodations").upsert({
    slug,
    name,
    tagline: String(formData.get("tagline") ?? ""),
    short_description: String(formData.get("shortDescription") ?? "").trim() || null,
    description: String(formData.get("description") ?? ""),
    capacity: String(formData.get("capacity") ?? ""),
    adults: parseOptionalInt(formData.get("adults")),
    children: parseOptionalInt(formData.get("children")),
    beds: parseOptionalInt(formData.get("beds")),
    rooms: parseOptionalInt(formData.get("rooms")),
    bathrooms: parseOptionalInt(formData.get("bathrooms")),
    price_from: priceFrom,
    highlights: parseList(formData.get("highlights")),
    amenities: parseList(formData.get("amenities")),
    reserve_url: String(formData.get("reserveUrl") ?? ""),
    published: formData.get("published") === "on",
    featured_home: formData.get("featuredHome") === "on",
    home_order: parseOptionalInt(formData.get("homeOrder")) ?? 0,
    seo_title: String(formData.get("seoTitle") ?? "").trim() || null,
    seo_description: String(formData.get("seoDescription") ?? "").trim() || null,
    og_image_url: String(formData.get("ogImageUrl") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/acomodacoes");
  revalidatePath(`/acomodacoes/${slug}`);
  revalidatePath(`/admin/acomodacoes/${slug}`);
}

export async function createAccommodationAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Nome da acomodação é obrigatório.");

  const slug = slugify(name);
  if (!slug) throw new Error("Não foi possível gerar um identificador a partir desse nome.");

  const supabase = await createClient();

  const { count } = await supabase
    .from("accommodations")
    .select("slug", { count: "exact", head: true });

  const { error } = await supabase.from("accommodations").insert({
    slug,
    name,
    order_index: count ?? 0,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Já existe uma acomodação com identificador "${slug}". Escolha um nome diferente.`);
    }
    throw new Error(error.message);
  }

  revalidatePath("/acomodacoes");
  revalidatePath("/admin/acomodacoes");
  redirect(`/admin/acomodacoes/${slug}`);
}

export async function deleteAccommodationAction(formData: FormData) {
  const slug = String(formData.get("slug"));

  const supabase = await createClient();
  const { error } = await supabase.from("accommodations").delete().eq("slug", slug);
  if (error) throw new Error(error.message);

  revalidatePath("/acomodacoes");
  revalidatePath("/admin/acomodacoes");
  redirect("/admin/acomodacoes");
}

export async function addAccommodationImageAction(formData: FormData) {
  const supabase = await createClient();
  const slug = String(formData.get("slug"));
  const file = formData.get("file") as File | null;
  const alt = String(formData.get("alt") ?? "");

  if (!file || file.size === 0) throw new Error("Selecione um arquivo de imagem.");
  if (!file.type.startsWith("image/")) {
    throw new Error("Arquivo inválido: envie apenas imagens (JPG, PNG, WebP...).");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Imagem muito grande: o limite é 8MB.");
  }

  const path = `${slug}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from("accommodation-images")
    .upload(path, file, { upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabase.storage
    .from("accommodation-images")
    .getPublicUrl(path);

  const { count } = await supabase
    .from("accommodation_images")
    .select("id", { count: "exact", head: true })
    .eq("accommodation_slug", slug);

  const { error: insertError } = await supabase.from("accommodation_images").insert({
    accommodation_slug: slug,
    url: publicUrlData.publicUrl,
    alt,
    order_index: count ?? 0,
  });
  if (insertError) throw new Error(insertError.message);

  revalidatePath(`/acomodacoes/${slug}`);
  revalidatePath(`/admin/acomodacoes/${slug}`);
}

export async function deleteAccommodationImageAction(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const slug = String(formData.get("slug"));

  const { error } = await supabase.from("accommodation_images").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/acomodacoes/${slug}`);
  revalidatePath(`/admin/acomodacoes/${slug}`);
}

export async function reorderAccommodationImageAction(formData: FormData) {
  const supabase = await createClient();
  const slug = String(formData.get("slug"));
  const currentId = String(formData.get("currentId"));
  const currentOrder = Number(formData.get("currentOrder"));
  const neighborId = String(formData.get("neighborId") ?? "");
  const neighborOrder = Number(formData.get("neighborOrder"));

  if (!neighborId || neighborId === "undefined" || !Number.isFinite(neighborOrder)) {
    // Já está na primeira/última posição; nada a fazer.
    return;
  }

  // Troca real das posições (não apenas copia o valor do vizinho), para
  // nunca deixar duas imagens com o mesmo order_index.
  const { error: error1 } = await supabase
    .from("accommodation_images")
    .update({ order_index: neighborOrder })
    .eq("id", currentId);
  if (error1) throw new Error(error1.message);

  const { error: error2 } = await supabase
    .from("accommodation_images")
    .update({ order_index: currentOrder })
    .eq("id", neighborId);
  if (error2) throw new Error(error2.message);

  revalidatePath(`/acomodacoes/${slug}`);
  revalidatePath(`/admin/acomodacoes/${slug}`);
}

export async function setAccommodationCoverImageAction(formData: FormData) {
  const supabase = await createClient();
  const slug = String(formData.get("slug"));
  const id = String(formData.get("id"));

  const { data: images, error: fetchError } = await supabase
    .from("accommodation_images")
    .select("id")
    .eq("accommodation_slug", slug)
    .order("order_index", { ascending: true });
  if (fetchError) throw new Error(fetchError.message);
  if (!images) return;

  const orderedIds = [id, ...images.map((img) => img.id).filter((imgId) => imgId !== id)];
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("accommodation_images")
      .update({ order_index: i })
      .eq("id", orderedIds[i]);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/acomodacoes");
  revalidatePath(`/acomodacoes/${slug}`);
  revalidatePath(`/admin/acomodacoes/${slug}`);
}

export async function updateAccommodationImageAltAction(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const slug = String(formData.get("slug"));
  const alt = String(formData.get("alt") ?? "").trim();

  const { error } = await supabase.from("accommodation_images").update({ alt }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/acomodacoes/${slug}`);
  revalidatePath(`/admin/acomodacoes/${slug}`);
}

export async function updateExperienceAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const name = String(formData.get("name") ?? "").trim();
  if (!slug || !name) throw new Error("Nome da experiência é obrigatório.");

  const supabase = await createClient();
  const { error } = await supabase.from("experiences").upsert({
    slug,
    name,
    description: String(formData.get("description") ?? ""),
    image_url: String(formData.get("imageUrl") ?? ""),
    image_alt: String(formData.get("imageAlt") ?? ""),
    order_index: Number(formData.get("orderIndex") ?? 0),
    published: formData.get("published") === "on",
    cta_label: String(formData.get("ctaLabel") ?? "").trim() || null,
    cta_href: String(formData.get("ctaHref") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/experiencias");
  revalidatePath("/admin/experiencias");
}

export async function createExperienceAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Nome da experiência é obrigatório.");

  const slug = slugify(name);
  if (!slug) throw new Error("Não foi possível gerar um identificador a partir desse nome.");

  const supabase = await createClient();

  const { count } = await supabase
    .from("experiences")
    .select("slug", { count: "exact", head: true });

  const { error } = await supabase.from("experiences").insert({
    slug,
    name,
    order_index: count ?? 0,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Já existe uma experiência com identificador "${slug}". Escolha um nome diferente.`);
    }
    throw new Error(error.message);
  }

  revalidatePath("/experiencias");
  revalidatePath("/admin/experiencias");
}

export async function deleteExperienceAction(formData: FormData) {
  const slug = String(formData.get("slug"));

  const supabase = await createClient();
  const { error } = await supabase.from("experiences").delete().eq("slug", slug);
  if (error) throw new Error(error.message);

  revalidatePath("/experiencias");
  revalidatePath("/admin/experiencias");
}

export async function addFaqAction(formData: FormData) {
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) throw new Error("Pergunta e resposta são obrigatórias.");

  const supabase = await createClient();
  const { error } = await supabase.from("faqs").insert({
    question,
    answer,
    order_index: Number(formData.get("orderIndex") ?? 0),
    published: formData.get("published") === "on",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/faq");
  revalidatePath("/admin/faq");
}

export async function updateFaqAction(formData: FormData) {
  const id = String(formData.get("id"));
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) throw new Error("Pergunta e resposta são obrigatórias.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("faqs")
    .update({
      question,
      answer,
      published: formData.get("published") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/faq");
  revalidatePath("/admin/faq");
}

export async function deleteFaqAction(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/faq");
  revalidatePath("/admin/faq");
}

export async function reorderFaqAction(formData: FormData) {
  const currentId = String(formData.get("currentId"));
  const currentOrder = Number(formData.get("currentOrder"));
  const neighborId = String(formData.get("neighborId") ?? "");
  const neighborOrder = Number(formData.get("neighborOrder"));

  if (!neighborId || neighborId === "undefined" || !Number.isFinite(neighborOrder)) {
    return;
  }

  const supabase = await createClient();
  const { error: error1 } = await supabase.from("faqs").update({ order_index: neighborOrder }).eq("id", currentId);
  if (error1) throw new Error(error1.message);

  const { error: error2 } = await supabase.from("faqs").update({ order_index: currentOrder }).eq("id", neighborId);
  if (error2) throw new Error(error2.message);

  revalidatePath("/faq");
  revalidatePath("/admin/faq");
}

const REVIEW_SOURCES = ["airbnb", "booking", "google", "direto", "outro"];

function parseRating(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const num = Number(raw);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    throw new Error("Nota inválida: use um número inteiro de 1 a 5, ou deixe em branco.");
  }
  return num;
}

export async function addReviewAction(formData: FormData) {
  const guestName = String(formData.get("guestName") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  const source = String(formData.get("source") ?? "direto");
  if (!guestName || !text) throw new Error("Nome do hóspede e texto da avaliação são obrigatórios.");
  if (!REVIEW_SOURCES.includes(source)) throw new Error("Origem inválida.");

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    guest_name: guestName,
    text,
    rating: parseRating(formData.get("rating")),
    source,
    accommodation_slug: String(formData.get("accommodationSlug") ?? "") || null,
    date_label: String(formData.get("dateLabel") ?? "").trim() || null,
    order_index: Number(formData.get("orderIndex") ?? 0),
    published: formData.get("published") === "on",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/avaliacoes");
}

export async function updateReviewAction(formData: FormData) {
  const id = String(formData.get("id"));
  const guestName = String(formData.get("guestName") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  const source = String(formData.get("source") ?? "direto");
  if (!guestName || !text) throw new Error("Nome do hóspede e texto da avaliação são obrigatórios.");
  if (!REVIEW_SOURCES.includes(source)) throw new Error("Origem inválida.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({
      guest_name: guestName,
      text,
      rating: parseRating(formData.get("rating")),
      source,
      accommodation_slug: String(formData.get("accommodationSlug") ?? "") || null,
      date_label: String(formData.get("dateLabel") ?? "").trim() || null,
      published: formData.get("published") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/avaliacoes");
}

export async function deleteReviewAction(formData: FormData) {
  const id = String(formData.get("id"));

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/avaliacoes");
}

export async function reorderReviewAction(formData: FormData) {
  const currentId = String(formData.get("currentId"));
  const currentOrder = Number(formData.get("currentOrder"));
  const neighborId = String(formData.get("neighborId") ?? "");
  const neighborOrder = Number(formData.get("neighborOrder"));

  if (!neighborId || neighborId === "undefined" || !Number.isFinite(neighborOrder)) {
    return;
  }

  const supabase = await createClient();
  const { error: error1 } = await supabase
    .from("reviews")
    .update({ order_index: neighborOrder })
    .eq("id", currentId);
  if (error1) throw new Error(error1.message);

  const { error: error2 } = await supabase
    .from("reviews")
    .update({ order_index: currentOrder })
    .eq("id", neighborId);
  if (error2) throw new Error(error2.message);

  revalidatePath("/");
  revalidatePath("/admin/avaliacoes");
}

const RESERVED_PAGE_SLUGS = new Set([
  "admin",
  "acomodacoes",
  "experiencias",
  "sobre",
  "localizacao",
  "faq",
  "contato",
  "politicas",
  "api",
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
  "icon.svg",
]);

export async function createPageAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Título da página é obrigatório.");

  const slug = slugify(title);
  if (!slug) throw new Error("Não foi possível gerar um identificador a partir desse título.");
  if (RESERVED_PAGE_SLUGS.has(slug)) {
    throw new Error(`"${slug}" é um endereço reservado do site. Escolha um título diferente.`);
  }

  const supabase = await createClient();

  const { count } = await supabase.from("pages").select("id", { count: "exact", head: true });

  const { error } = await supabase.from("pages").insert({
    slug,
    title,
    order_index: count ?? 0,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Já existe uma página com identificador "${slug}". Escolha um título diferente.`);
    }
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/paginas");
  redirect(`/admin/paginas/${slug}`);
}

export async function updatePageMetaAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const title = String(formData.get("title") ?? "").trim();
  if (!slug || !title) throw new Error("Título da página é obrigatório.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("pages")
    .update({
      title,
      nav_label: String(formData.get("navLabel") ?? "").trim() || null,
      show_in_nav: formData.get("showInNav") === "on",
      published: formData.get("published") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath(`/${slug}`);
  revalidatePath(`/admin/paginas/${slug}`);
}

export async function deletePageAction(formData: FormData) {
  const slug = String(formData.get("slug"));

  const supabase = await createClient();
  const { error } = await supabase.from("pages").delete().eq("slug", slug);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/paginas");
  redirect("/admin/paginas");
}

export async function addTextBlockAction(formData: FormData) {
  const pageId = String(formData.get("pageId"));
  const slug = String(formData.get("slug"));
  const content = String(formData.get("content") ?? "").trim();
  if (!content) throw new Error("Escreva algum texto para o bloco.");

  const supabase = await createClient();
  const { count } = await supabase
    .from("page_blocks")
    .select("id", { count: "exact", head: true })
    .eq("page_id", pageId);

  const { error } = await supabase.from("page_blocks").insert({
    page_id: pageId,
    type: "text",
    content,
    order_index: count ?? 0,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/${slug}`);
  revalidatePath(`/admin/paginas/${slug}`);
}

export async function updateTextBlockAction(formData: FormData) {
  const id = String(formData.get("id"));
  const slug = String(formData.get("slug"));
  const content = String(formData.get("content") ?? "").trim();
  if (!content) throw new Error("Escreva algum texto para o bloco.");

  const supabase = await createClient();
  const { error } = await supabase.from("page_blocks").update({ content }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/${slug}`);
  revalidatePath(`/admin/paginas/${slug}`);
}

export async function addImageBlockAction(formData: FormData) {
  const pageId = String(formData.get("pageId"));
  const slug = String(formData.get("slug"));
  const file = formData.get("file") as File | null;
  const alt = String(formData.get("alt") ?? "");

  if (!file || file.size === 0) throw new Error("Selecione um arquivo de imagem.");
  if (!file.type.startsWith("image/")) {
    throw new Error("Arquivo inválido: envie apenas imagens (JPG, PNG, WebP...).");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Imagem muito grande: o limite é 8MB.");
  }

  const supabase = await createClient();
  const path = `pages/${slug}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from("accommodation-images")
    .upload(path, file, { upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabase.storage.from("accommodation-images").getPublicUrl(path);

  const { count } = await supabase
    .from("page_blocks")
    .select("id", { count: "exact", head: true })
    .eq("page_id", pageId);

  const { error: insertError } = await supabase.from("page_blocks").insert({
    page_id: pageId,
    type: "image",
    image_url: publicUrlData.publicUrl,
    image_alt: alt,
    order_index: count ?? 0,
  });
  if (insertError) throw new Error(insertError.message);

  revalidatePath(`/${slug}`);
  revalidatePath(`/admin/paginas/${slug}`);
}

export async function deleteBlockAction(formData: FormData) {
  const id = String(formData.get("id"));
  const slug = String(formData.get("slug"));

  const supabase = await createClient();
  const { error } = await supabase.from("page_blocks").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/${slug}`);
  revalidatePath(`/admin/paginas/${slug}`);
}

export async function reorderBlockAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const currentId = String(formData.get("currentId"));
  const currentOrder = Number(formData.get("currentOrder"));
  const neighborId = String(formData.get("neighborId") ?? "");
  const neighborOrder = Number(formData.get("neighborOrder"));

  if (!neighborId || neighborId === "undefined" || !Number.isFinite(neighborOrder)) {
    return;
  }

  const supabase = await createClient();
  const { error: error1 } = await supabase
    .from("page_blocks")
    .update({ order_index: neighborOrder })
    .eq("id", currentId);
  if (error1) throw new Error(error1.message);

  const { error: error2 } = await supabase
    .from("page_blocks")
    .update({ order_index: currentOrder })
    .eq("id", neighborId);
  if (error2) throw new Error(error2.message);

  revalidatePath(`/${slug}`);
  revalidatePath(`/admin/paginas/${slug}`);
}

export async function updatePoliciesAction(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("policies").upsert({
    id: "main",
    content: String(formData.get("content") ?? ""),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/politicas");
  revalidatePath("/admin/politicas");
}

/**
 * Seções da Home: a lista de chaves é fixa (definida em lib/types.ts) — este
 * action só atualiza conteúdo/visibilidade de uma seção já existente, nunca
 * cria/remove seções (não é um page-builder livre).
 */
export async function updateHomeSectionAction(formData: FormData) {
  const key = String(formData.get("key"));
  if (!key) throw new Error("Seção inválida.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("home_sections")
    .update({
      title: String(formData.get("title") ?? "").trim() || null,
      subtitle: String(formData.get("subtitle") ?? "").trim() || null,
      body: String(formData.get("body") ?? "").trim() || null,
      image_url: String(formData.get("imageUrl") ?? "").trim() || null,
      image_alt: String(formData.get("imageAlt") ?? "").trim() || null,
      button_label: String(formData.get("buttonLabel") ?? "").trim() || null,
      button_href: String(formData.get("buttonHref") ?? "").trim() || null,
      visible: formData.get("visible") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("key", key);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/home");
}

export async function reorderHomeSectionAction(formData: FormData) {
  const currentKey = String(formData.get("currentKey"));
  const currentOrder = Number(formData.get("currentOrder"));
  const neighborKey = String(formData.get("neighborKey") ?? "");
  const neighborOrder = Number(formData.get("neighborOrder"));

  if (!neighborKey || neighborKey === "undefined" || !Number.isFinite(neighborOrder)) {
    return;
  }

  const supabase = await createClient();
  const { error: error1 } = await supabase
    .from("home_sections")
    .update({ order_index: neighborOrder })
    .eq("key", currentKey);
  if (error1) throw new Error(error1.message);

  const { error: error2 } = await supabase
    .from("home_sections")
    .update({ order_index: currentOrder })
    .eq("key", neighborKey);
  if (error2) throw new Error(error2.message);

  revalidatePath("/");
  revalidatePath("/admin/home");
}
