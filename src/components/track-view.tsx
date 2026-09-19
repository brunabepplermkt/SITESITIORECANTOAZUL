"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

/**
 * Dispara um evento de analytics uma vez, ao montar. Sem UI própria — usado
 * em páginas de servidor que precisam registrar uma visualização (ex.:
 * `accommodation_view`) sem virar componentes cliente inteiros.
 */
export function TrackView({
  event,
  payload,
}: {
  event: AnalyticsEvent;
  payload?: Record<string, string | number | boolean>;
}) {
  useEffect(() => {
    trackEvent(event, payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return null;
}
