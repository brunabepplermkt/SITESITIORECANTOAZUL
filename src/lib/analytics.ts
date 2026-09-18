/**
 * Camada mínima de eventos: por enquanto só empilha em window.dataLayer
 * (padrão que Google Analytics/GTM e a maioria dos pixels já sabe ler).
 * Nenhum ID de rastreamento é inserido aqui — isso é configurado pela
 * proprietária em Configurações → Integrações, quando ela tiver as contas
 * reais. Nunca deve quebrar a navegação do visitante.
 */
export type AnalyticsEvent =
  | "booking_search"
  | "booking_click"
  | "whatsapp_click"
  | "accommodation_view"
  | "review_interaction";

export function trackEvent(name: AnalyticsEvent, payload?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: name, ...payload });
  } catch {
    // analytics nunca deve derrubar a página
  }
}
