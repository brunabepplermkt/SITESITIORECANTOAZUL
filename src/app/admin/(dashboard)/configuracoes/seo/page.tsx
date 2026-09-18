import { getSiteSettings } from "@/lib/data";
import { updateSeoSettingsAction } from "../../../actions";

export default async function AdminSeoSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl text-bark">SEO padrão do site</h1>
      <p className="mt-1 text-sm text-bark/60">
        Usado quando o Google ou uma rede social mostra um resumo do site (quando a página específica não tiver o
        seu próprio título/descrição).
      </p>

      <form action={updateSeoSettingsAction} className="mt-6 space-y-4">
        <Field
          label="Título para buscadores"
          name="seoTitle"
          defaultValue={settings.seoTitle ?? ""}
          help="Aparece como o título azul nos resultados do Google."
        />
        <div>
          <label className="block text-sm text-bark/80">Descrição para buscadores</label>
          <textarea
            name="seoDescription"
            defaultValue={settings.seoDescription ?? ""}
            rows={3}
            className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-bark/50">O texto curto que aparece abaixo do título no Google.</p>
        </div>
        <Field
          label="Imagem de compartilhamento (URL)"
          name="ogImageUrl"
          defaultValue={settings.ogImageUrl ?? ""}
          help="A foto que aparece quando alguém compartilha o link do site no WhatsApp/Instagram/Facebook."
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
