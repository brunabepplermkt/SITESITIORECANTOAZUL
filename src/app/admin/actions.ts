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

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateSiteSettingsAction(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({
    id: "main",
    site_name: String(formData.get("siteName") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    email: String(formData.get("email") ?? ""),
    instagram: String(formData.get("instagram") ?? ""),
    address: String(formData.get("address") ?? ""),
    default_reserve_url: String(formData.get("defaultReserveUrl") ?? ""),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracoes");
}

export async function updateAccommodationAction(formData: FormData) {
  const supabase = await createClient();
  const slug = String(formData.get("slug"));
  const priceFromRaw = String(formData.get("priceFrom") ?? "").trim();

  const { error } = await supabase.from("accommodations").upsert({
    slug,
    name: String(formData.get("name") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    description: String(formData.get("description") ?? ""),
    capacity: String(formData.get("capacity") ?? ""),
    price_from: priceFromRaw ? Number(priceFromRaw) : null,
    highlights: parseList(formData.get("highlights")),
    amenities: parseList(formData.get("amenities")),
    reserve_url: String(formData.get("reserveUrl") ?? ""),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/acomodacoes");
  revalidatePath(`/acomodacoes/${slug}`);
  revalidatePath(`/admin/acomodacoes/${slug}`);
}

export async function addAccommodationImageAction(formData: FormData) {
  const supabase = await createClient();
  const slug = String(formData.get("slug"));
  const file = formData.get("file") as File | null;
  const alt = String(formData.get("alt") ?? "");

  if (!file || file.size === 0) throw new Error("Selecione um arquivo de imagem.");

  const path = `${slug}/${Date.now()}-${file.name}`;
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
  const id = String(formData.get("id"));
  const slug = String(formData.get("slug"));
  const orderIndex = Number(formData.get("orderIndex"));

  const { error } = await supabase
    .from("accommodation_images")
    .update({ order_index: orderIndex })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/acomodacoes/${slug}`);
  revalidatePath(`/admin/acomodacoes/${slug}`);
}

export async function updateExperienceAction(formData: FormData) {
  const supabase = await createClient();
  const slug = String(formData.get("slug"));

  const { error } = await supabase.from("experiences").upsert({
    slug,
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    image_url: String(formData.get("imageUrl") ?? ""),
    image_alt: String(formData.get("imageAlt") ?? ""),
    order_index: Number(formData.get("orderIndex") ?? 0),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/experiencias");
  revalidatePath("/admin/experiencias");
}

export async function addFaqAction(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").insert({
    question: String(formData.get("question") ?? ""),
    answer: String(formData.get("answer") ?? ""),
    order_index: Number(formData.get("orderIndex") ?? 0),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/faq");
  revalidatePath("/admin/faq");
}

export async function updateFaqAction(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase
    .from("faqs")
    .update({
      question: String(formData.get("question") ?? ""),
      answer: String(formData.get("answer") ?? ""),
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
