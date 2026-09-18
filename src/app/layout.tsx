import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { siteSettings } from "@/lib/content";

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
    default: `${siteSettings.siteName} — ${siteSettings.tagline}`,
    template: `%s — ${siteSettings.siteName}`,
  },
  description:
    "Hospedagem diferenciada em meio à natureza. Acomodações românticas e para grupos, experiências exclusivas e privacidade para desacelerar.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: siteSettings.siteName,
    title: siteSettings.siteName,
    description: siteSettings.tagline,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${editorial.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
