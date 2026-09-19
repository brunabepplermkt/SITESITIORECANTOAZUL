import type { SiteSettings } from "@/lib/types";

/**
 * Iframe controlado para um motor de reservas embutido. Nunca renderiza HTML/
 * JS arbitrário — só um `<iframe>` apontando para a URL configurada em
 * `/admin/configuracoes/reservas`, e só quando essa URL é https. `sandbox`
 * permite o mínimo necessário para um motor de reservas típico funcionar
 * (scripts, formulários, pop-ups de pagamento) sem dar ao conteúdo embutido
 * acesso à mesma origem do site.
 */
export function BookingWidget({ settings, className = "" }: { settings: SiteSettings; className?: string }) {
  const src = settings.bookingWidgetEmbedUrl;
  if (settings.bookingProvider !== "widget" || !src) return null;

  let isHttps = false;
  try {
    isHttps = new URL(src).protocol === "https:";
  } catch {
    isHttps = false;
  }
  if (!isHttps) return null;

  return (
    <div className={`mx-auto max-w-3xl ${className}`}>
      <iframe
        src={src}
        title="Motor de reservas"
        loading="lazy"
        className="h-[640px] w-full rounded-sm border border-black/10"
        sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
