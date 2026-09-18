"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { NavPage, SiteSettings } from "@/lib/types";
import { getBookingHref, getBookingTarget, isBookingActive } from "@/lib/booking";

const NAV_LINKS = [
  { href: "/acomodacoes", label: "Acomodações" },
  { href: "/experiencias", label: "Experiências" },
  { href: "/sobre", label: "O Sítio" },
  { href: "/localizacao", label: "Localização" },
  { href: "/faq", label: "FAQ" },
];

const CONTACT_LINK = { href: "/contato", label: "Contato" };

export function SiteHeader({
  siteSettings,
  navPages = [],
}: {
  siteSettings: SiteSettings;
  navPages?: NavPage[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  const links = [
    ...NAV_LINKS,
    ...navPages.map((p) => ({ href: `/${p.slug}`, label: p.label })),
    CONTACT_LINK,
  ];

  const bookingActive = isBookingActive(siteSettings);
  const bookingHref = getBookingHref(siteSettings);
  const bookingTarget = getBookingTarget(siteSettings);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-cream/90 backdrop-blur">
      <div
        className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8"
        style={{ height: "var(--header-h)" }}
      >
        <Link
          href="/"
          className="focus-ring rounded font-serif text-lg tracking-tight text-bark sm:text-xl"
        >
          Recanto Azul
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring rounded text-sm text-bark/80 transition-colors hover:text-bark"
            >
              {link.label}
            </Link>
          ))}
          {bookingActive && (
            <Link
              href={bookingHref}
              target={bookingTarget}
              rel={bookingTarget === "_blank" ? "noopener noreferrer" : undefined}
              className="focus-ring rounded-full bg-forest px-5 py-2.5 text-sm text-cream transition-opacity hover:opacity-90"
            >
              {siteSettings.bookingCtaLabel}
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="focus-ring -mr-2 flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-px w-5 bg-bark transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`absolute left-0 top-[7px] h-px w-5 bg-bark transition-opacity ${open ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`absolute left-0 top-[14px] h-px w-5 bg-bark transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="flex flex-col gap-1 border-t border-black/5 bg-cream px-5 pb-6 pt-2 lg:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring rounded px-2 py-3 text-base text-bark"
            >
              {link.label}
            </Link>
          ))}
          {bookingActive && (
            <Link
              href={bookingHref}
              target={bookingTarget}
              rel={bookingTarget === "_blank" ? "noopener noreferrer" : undefined}
              className="focus-ring mt-2 rounded-full bg-forest px-5 py-3 text-center text-sm text-cream"
            >
              {siteSettings.bookingCtaLabel}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
