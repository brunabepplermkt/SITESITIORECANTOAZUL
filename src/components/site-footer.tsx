import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

export function SiteFooter({ siteSettings }: { siteSettings: SiteSettings }) {
  return (
    <footer className="border-t border-black/5 bg-bark text-cream/90">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <p className="font-serif text-xl">{siteSettings.siteName}</p>
          <p className="mt-3 max-w-xs text-sm text-cream/70">{siteSettings.tagline}</p>
        </div>

        <div className="text-sm">
          <p className="mb-3 uppercase tracking-wide text-cream/50">Navegue</p>
          <ul className="space-y-2">
            <li><Link className="focus-ring rounded hover:text-cream" href="/acomodacoes">Acomodações</Link></li>
            <li><Link className="focus-ring rounded hover:text-cream" href="/experiencias">Experiências</Link></li>
            <li><Link className="focus-ring rounded hover:text-cream" href="/sobre">O Sítio</Link></li>
            <li><Link className="focus-ring rounded hover:text-cream" href="/politicas">Políticas</Link></li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="mb-3 uppercase tracking-wide text-cream/50">Contato</p>
          <ul className="space-y-2 text-cream/80">
            <li>{siteSettings.phone}</li>
            <li>{siteSettings.email}</li>
            <li>
              <a
                className="focus-ring rounded hover:text-cream"
                href={siteSettings.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 px-5 py-5 text-center text-xs text-cream/50 sm:px-8">
        © {new Date().getFullYear()} {siteSettings.siteName}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
