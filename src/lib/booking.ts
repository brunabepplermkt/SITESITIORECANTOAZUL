import type { SiteSettings } from "./types";

/**
 * Camada única de reservas (BookingProvider). Todo botão "Reservar" do site
 * deve gerar seu link por aqui — nunca com uma URL hardcoded — para que
 * trocar de motor (link externo → widget → Zeloa) seja uma mudança de
 * configuração em `/admin/configuracoes/reservas`, não de código.
 *
 * Os nomes de parâmetro da URL (checkin/checkout/adultos/criancas/acomodacao)
 * são um placeholder de arquitetura, não a API real do Zeloa — quando o
 * Zeloa definir o formato final, ajusta-se só a função `getBookingHref`.
 */

export type BookingParams = {
  checkin?: string;
  checkout?: string;
  adults?: number;
  children?: number;
  accommodationSlug?: string;
};

export function isBookingActive(settings: SiteSettings): boolean {
  return settings.bookingProvider !== "none";
}

export function getBookingHref(
  settings: SiteSettings,
  params: BookingParams = {},
  accommodationOverrideUrl?: string | null,
): string {
  if (!isBookingActive(settings)) return "#";

  const base = accommodationOverrideUrl || settings.bookingBaseUrl || settings.defaultReserveUrl;
  if (!base) return "#";

  try {
    const url = new URL(base);
    if (params.checkin) url.searchParams.set("checkin", params.checkin);
    if (params.checkout) url.searchParams.set("checkout", params.checkout);
    if (params.adults !== undefined) url.searchParams.set("adultos", String(params.adults));
    if (params.children !== undefined) url.searchParams.set("criancas", String(params.children));
    if (params.accommodationSlug) url.searchParams.set("acomodacao", params.accommodationSlug);
    return url.toString();
  } catch {
    return base;
  }
}

export function getBookingTarget(settings: SiteSettings): "_self" | "_blank" {
  return settings.bookingOpenMode === "same_tab" ? "_self" : "_blank";
}
