import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileReserveBar } from "@/components/mobile-reserve-bar";
import { siteSettings as seedSiteSettings } from "@/lib/content";
import { getNavPages, getSiteSettings } from "@/lib/data";
import { getBookingHref, getBookingTarget, isBookingActive } from "@/lib/booking";

const editorial = Fraunces({
  variable: "--font-editorial",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sitiorecantoazul.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${seedSiteSettings.siteName} — ${seedSiteSettings.tagline}`,
    template: `%s — ${seedSiteSettings.siteName}`,
  },
  description:
    "Hospedagem diferenciada em meio à natureza. Acomodações românticas e para grupos, experiências exclusivas e privacidade para desacelerar.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: seedSiteSettings.siteName,
    title: seedSiteSettings.siteName,
    description: seedSiteSettings.tagline,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [siteSettings, navPages] = await Promise.all([getSiteSettings(), getNavPages()]);

  return (
    <html
      lang="pt-BR"
      className={`${editorial.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <SiteHeader siteSettings={siteSettings} navPages={navPages} />
        <main className="flex-1">{children}</main>
        <SiteFooter siteSettings={siteSettings} navPages={navPages} />
        <MobileReserveBar
          bookingActive={isBookingActive(siteSettings)}
          href={getBookingHref(siteSettings)}
          target={getBookingTarget(siteSettings)}
          label={siteSettings.bookingCtaLabel}
        />
      </body>
    </html>
  );
}
