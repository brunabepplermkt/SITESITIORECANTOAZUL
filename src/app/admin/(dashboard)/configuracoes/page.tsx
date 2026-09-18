import Link from "next/link";
import { getSiteSettings } from "@/lib/data";
import { updateSiteSettingsAction } from "../../actions";

export default async function AdminConfiguracoesPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl text-bark">Configurações do site</h1>
      <p className="mt-1 text-sm text-bark/60">
        Identidade geral do site. Contato, reservas, SEO e integrações têm suas próprias páginas.
      </p>

      <form action={updateSiteSettingsAction} className="mt-6 space-y-4">
        <Field label="Nome do site" name="siteName" defaultValue={settings.siteName} />
        <Field label="Frase de efeito" name="tagline" defaultValue={settings.tagline} />

        <button type="submit" className="focus-ring rounded-full bg-forest px-6 py-2.5 text-sm text-cream">
          Salvar
        </button>
      </form>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        <SettingsCard
          href="/admin/configuracoes/contato"
          title="Contato"
          description="WhatsApp, telefone, e-mail, Instagram, endereço e link do Google Maps."
        />
        <SettingsCard
          href="/admin/configuracoes/reservas"
          title="Reservas"
          description="Motor de reservas (link, widget, Zeloa), URL base e comportamento dos botões."
        />
        <SettingsCard
          href="/admin/configuracoes/integracoes"
          title="Integrações"
          description="Google Analytics e Meta Pixel (opcional, para quando você tiver as contas)."
        />
        <SettingsCard
          href="/admin/configuracoes/seo"
          title="SEO padrão"
          description="Título, descrição e imagem usados quando o site é compartilhado ou encontrado no Google."
        />
      </div>
    </div>
  );
}

function SettingsCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="focus-ring block rounded-sm border border-black/10 p-5 transition-colors hover:border-black/30"
    >
      <p className="font-serif text-lg text-bark">{title}</p>
      <p className="mt-1 text-sm text-bark/60">{description}</p>
    </Link>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <div>
      <label className="block text-sm text-bark/80" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
      />
    </div>
  );
}
