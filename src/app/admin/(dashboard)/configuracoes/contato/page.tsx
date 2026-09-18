import { getSiteSettings } from "@/lib/data";
import { updateContactSettingsAction } from "../../../actions";

export default async function AdminContatoSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl text-bark">Contato</h1>
      <p className="mt-1 text-sm text-bark/60">
        Esses dados alimentam automaticamente o rodapé, a página de Contato e a de Localização — edite aqui uma
        única vez.
      </p>

      <form action={updateContactSettingsAction} className="mt-6 space-y-4">
        <Field label="Telefone" name="phone" defaultValue={settings.phone} />
        <Field label="WhatsApp (somente números, com DDI, ex.: 5548999999999)" name="whatsapp" defaultValue={settings.whatsapp} />
        <Field label="E-mail" name="email" defaultValue={settings.email} />
        <Field label="Instagram (URL completa)" name="instagram" defaultValue={settings.instagram} />
        <Field label="Endereço público" name="address" defaultValue={settings.address} />
        <Field
          label="Link do Google Maps (opcional)"
          name="googleMapsUrl"
          defaultValue={settings.googleMapsUrl ?? ""}
          help="Cole aqui o link de compartilhamento do Google Maps do local."
        />

        <button type="submit" className="focus-ring rounded-full bg-forest px-6 py-2.5 text-sm text-cream">
          Salvar
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  help,
}: {
  label: string;
  name: string;
  defaultValue: string;
  help?: string;
}) {
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
      {help && <p className="mt-1 text-xs text-bark/50">{help}</p>}
    </div>
  );
}
