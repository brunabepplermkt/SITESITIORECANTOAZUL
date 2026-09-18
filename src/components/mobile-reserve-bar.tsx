"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ReserveButton } from "./reserve-button";

/**
 * CTA persistente de reserva, só no mobile (a nav de desktop já mostra
 * "Reservar" fixa no header). Aparece depois que a pessoa rola para além do
 * hero e some de novo ao alcançar o rodapé, para nunca cobrir conteúdo. Só é
 * inserida no DOM quando visível, para nunca deixar um link focável e
 * invisível na ordem de tabulação.
 */
export function MobileReserveBar({
  bookingActive,
  href,
  target,
  label,
}: {
  bookingActive: boolean;
  href: string;
  target: "_self" | "_blank";
  label: string;
}) {
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);
  const [overFooter, setOverFooter] = useState(false);

  useEffect(() => {
    function onScroll() {
      setPastHero(window.scrollY > window.innerHeight * 0.6);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const footer = document.getElementById("site-footer");
    const observer = footer
      ? new IntersectionObserver(([entry]) => setOverFooter(entry.isIntersecting), {
          rootMargin: "0px 0px -20% 0px",
        })
      : null;
    if (footer && observer) observer.observe(footer);

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, []);

  if (!bookingActive || pathname.startsWith("/admin") || !pastHero || overFooter) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden">
      <div className="mx-auto max-w-sm">
        <ReserveButton
          href={href}
          target={target}
          className="w-full shadow-[0_8px_24px_rgba(38,34,32,0.35)]"
        >
          {label}
        </ReserveButton>
      </div>
    </div>
  );
}
