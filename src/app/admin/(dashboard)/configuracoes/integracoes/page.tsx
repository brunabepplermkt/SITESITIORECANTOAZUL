import { getSiteSettings } from "@/lib/data";
import { updateIntegrationsSettingsAction } from "../../../actions";

export default async function AdminIntegracoesSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl text-bark">Integrações</h1>
      <p className="mt-1 text-sm text-bark/60">
        Preencha quando você tiver as contas do Google Analytics e/ou Meta Pixel. Enquanto estiver em branco,
        nenhum rastreamento é carregado no site.
      </p>

      <form action={updateIntegrationsSettingsAction} className="mt-6 space-y-4">
        <Field
          label="ID do Google Analytics (ex.: G-XXXXXXXXXX)"
          name="googleAnalyticsId"
          defaultValue={settings.googleAnalyticsId ?? ""}
        />
        <Field
          label="ID do Meta Pixel"
          name="metaPixelId"
          defaultValue={settings.metaPixelId ?? ""}
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
