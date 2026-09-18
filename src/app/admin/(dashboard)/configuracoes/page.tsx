import { getSiteSettings } from "@/lib/data";
import { updateSiteSettingsAction } from "../../actions";

export default async function AdminConfiguracoesPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl text-bark">Configurações do site</h1>

      <form action={updateSiteSettingsAction} className="mt-6 space-y-4">
        <Field label="Nome do site" name="siteName" defaultValue={settings.siteName} />
        <Field label="Frase de efeito" name="tagline" defaultValue={settings.tagline} />
        <Field label="Telefone" name="phone" defaultValue={settings.phone} />
        <Field label="WhatsApp (somente números, com DDI)" name="whatsapp" defaultValue={settings.whatsapp} />
        <Field label="E-mail" name="email" defaultValue={settings.email} />
        <Field label="Instagram (URL)" name="instagram" defaultValue={settings.instagram} />
        <Field label="Endereço" name="address" defaultValue={settings.address} />
        <Field
          label="Link padrão de reserva (WhatsApp/Zeloa)"
          name="defaultReserveUrl"
          defaultValue={settings.defaultReserveUrl}
        />

        <button type="submit" className="focus-ring rounded-full bg-forest px-6 py-2.5 text-sm text-cream">
          Salvar
        </button>
      </form>
    </div>
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
