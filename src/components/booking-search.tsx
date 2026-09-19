"use client";

import { useState } from "react";
import { getBookingHref, getBookingTarget, isBookingActive } from "@/lib/booking";
import { trackEvent } from "@/lib/analytics";
import type { SiteSettings } from "@/lib/types";

/**
 * Busca de reserva genérica: check-in, check-out, adultos e crianças, que só
 * monta a URL de destino usando `getBookingHref` (mesma camada usada por
 * todo botão "Reservar" do site). Não conhece nenhuma API de motor real —
 * os parâmetros são só query string na URL configurada em
 * `/admin/configuracoes/reservas`.
 */
export function BookingSearch({
  settings,
  accommodationSlug,
  accommodationOverrideUrl,
  className = "",
}: {
  settings: SiteSettings;
  accommodationSlug?: string;
  accommodationOverrideUrl?: string | null;
  className?: string;
}) {
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  if (!isBookingActive(settings, accommodationOverrideUrl)) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const href = getBookingHref(
      settings,
      { checkin: checkin || undefined, checkout: checkout || undefined, adults, children, accommodationSlug },
      accommodationOverrideUrl,
    );
    trackEvent("booking_search", {
      checkin,
      checkout,
      adults,
      children,
      ...(accommodationSlug ? { accommodationSlug } : {}),
    });
    window.open(href, getBookingTarget(settings), "noopener,noreferrer");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`mx-auto grid max-w-xl grid-cols-2 gap-3 rounded-sm border border-black/10 bg-white/80 p-4 text-left sm:grid-cols-4 sm:items-end sm:p-5 ${className}`}
    >
      <div>
        <label className="block text-xs uppercase tracking-wide text-bark/60" htmlFor="booking-checkin">
          Check-in
        </label>
        <input
          id="booking-checkin"
          type="date"
          value={checkin}
          onChange={(e) => setCheckin(e.target.value)}
          className="focus-ring mt-1 w-full rounded border border-black/10 px-2 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-bark/60" htmlFor="booking-checkout">
          Check-out
        </label>
        <input
          id="booking-checkout"
          type="date"
          value={checkout}
          onChange={(e) => setCheckout(e.target.value)}
          className="focus-ring mt-1 w-full rounded border border-black/10 px-2 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-bark/60" htmlFor="booking-adults">
          Adultos
        </label>
        <input
          id="booking-adults"
          type="number"
          min={1}
          value={adults}
          onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))}
          className="focus-ring mt-1 w-full rounded border border-black/10 px-2 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-bark/60" htmlFor="booking-children">
          Crianças
        </label>
        <input
          id="booking-children"
          type="number"
          min={0}
          value={children}
          onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))}
          className="focus-ring mt-1 w-full rounded border border-black/10 px-2 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        className="focus-ring col-span-2 mt-1 rounded-full bg-forest px-6 py-2.5 text-sm text-cream transition-opacity hover:opacity-90 sm:col-span-4"
      >
        Buscar disponibilidade
      </button>
    </form>
  );
}
