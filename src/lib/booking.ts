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

function isValidHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidHttpsUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Um provider só está "ativo" quando existe uma URL de destino de verdade —
 * nunca um botão que leva a `href="#"`. Cada modo tem sua própria condição:
 * - `none`: sempre inativo.
 * - `link`/`zeloa`: precisa de `bookingBaseUrl` (ou o link de reserva
 *   alternativo `defaultReserveUrl`) apontando para http(s).
 * - `widget`: precisa de `bookingWidgetEmbedUrl` em https (nunca embutimos
 *   um iframe apontando para http).
 */
export function isBookingActive(settings: SiteSettings, accommodationOverrideUrl?: string | null): boolean {
  if (settings.bookingProvider === "none") return false;

  if (accommodationOverrideUrl && isValidHttpUrl(accommodationOverrideUrl)) return true;

  if (settings.bookingProvider === "widget") {
    return isValidHttpsUrl(settings.bookingWidgetEmbedUrl);
  }

  // "link" e "zeloa" (Zeloa ainda não implementado — usa a mesma regra de um
  // link externo até a integração real existir).
  return isValidHttpUrl(settings.bookingBaseUrl) || isValidHttpUrl(settings.defaultReserveUrl);
}

export function getBookingHref(
  settings: SiteSettings,
  params: BookingParams = {},
  accommodationOverrideUrl?: string | null,
): string {
  if (!isBookingActive(settings, accommodationOverrideUrl)) return "#";

  const base =
    (accommodationOverrideUrl && isValidHttpUrl(accommodationOverrideUrl) ? accommodationOverrideUrl : null) ||
    (settings.bookingProvider === "widget" ? settings.bookingWidgetEmbedUrl : settings.bookingBaseUrl) ||
    settings.defaultReserveUrl;

  if (!base || !isValidHttpUrl(base)) return "#";

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
