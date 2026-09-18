import Link from "next/link";
import { signOutAction } from "../actions";

// O painel é sempre renderizado por requisição: precisa refletir a sessão
// autenticada atual e os dados mais recentes do Supabase, nunca uma captura
// estática gerada em build time (quando as variáveis de ambiente do Supabase
// podem ainda não estar disponíveis).
export const dynamic = "force-dynamic";

const ADMIN_LINKS = [
  { href: "/admin", label: "Início" },
  { href: "/admin/configuracoes", label: "Configurações" },
  { href: "/admin/acomodacoes", label: "Acomodações" },
  { href: "/admin/experiencias", label: "Experiências" },
  { href: "/admin/avaliacoes", label: "Avaliações" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/paginas", label: "Páginas" },
  { href: "/admin/politicas", label: "Políticas" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-black/10 bg-ink text-cream">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <nav className="flex flex-wrap gap-4 text-sm">
            {ADMIN_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="focus-ring rounded hover:text-cream/80">
                {link.label}
              </Link>
            ))}
          </nav>
          <form action={signOutAction}>
            <button type="submit" className="focus-ring text-sm text-cream/70 hover:text-cream">
              Sair
            </button>
          </form>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 py-10">{children}</div>
    </div>
  );
}
