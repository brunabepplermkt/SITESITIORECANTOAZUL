import { getSiteSettings } from "@/lib/data";
import { updateBookingSettingsAction } from "../../../actions";

export default async function AdminReservasSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl text-bark">Reservas</h1>
      <p className="mt-1 text-sm text-bark/60">
        Controla para onde os botões &quot;Reservar&quot; do site inteiro (menu, botão fixo no celular, páginas de
        acomodação e Home) enviam a hóspede. Trocar aqui muda o site todo — nenhum botão tem link fixo no código.
      </p>

      <form action={updateBookingSettingsAction} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm text-bark/80" htmlFor="bookingProvider">
            Motor de reservas
          </label>
          <select
            id="bookingProvider"
            name="bookingProvider"
            defaultValue={settings.bookingProvider}
            className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
          >
            <option value="none">Desativado (esconde os botões de reserva)</option>
            <option value="link">Link externo (WhatsApp, motor temporário, etc.)</option>
            <option value="widget">Widget/calendário embutido</option>
            <option value="zeloa">Zeloa</option>
          </select>
          <p className="mt-1 text-xs text-bark/50">
            &quot;Zeloa&quot; fica pronto para quando a integração estiver disponível — até lá, use &quot;Link
            externo&quot; com o WhatsApp ou um motor temporário.
          </p>
        </div>

        <Field
          label="URL base do motor de reservas"
          name="bookingBaseUrl"
          defaultValue={settings.bookingBaseUrl ?? ""}
          help="Ex.: link do WhatsApp, do motor temporário (Mobile Calendar) ou, futuramente, do Zeloa."
        />

        <Field
          label="Link de reserva alternativo (usado se a URL base ficar em branco)"
          name="defaultReserveUrl"
          defaultValue={settings.defaultReserveUrl}
        />

        <div>
          <label className="block text-sm text-bark/80" htmlFor="bookingOpenMode">
            Como abrir o link de reserva
          </label>
          <select
            id="bookingOpenMode"
            name="bookingOpenMode"
            defaultValue={settings.bookingOpenMode}
            className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
          >
            <option value="new_tab">Em uma nova aba</option>
            <option value="same_tab">Na mesma aba</option>
          </select>
        </div>

        <Field label="Texto do botão de reserva" name="bookingCtaLabel" defaultValue={settings.bookingCtaLabel} />

        <label className="flex items-center gap-2 text-sm text-bark/80">
          <input type="checkbox" name="bookingShowSearchHome" defaultChecked={settings.bookingShowSearchHome} />
          Mostrar busca de datas na Home
        </label>
        <label className="flex items-center gap-2 text-sm text-bark/80">
          <input
            type="checkbox"
            name="bookingShowSearchAccommodation"
            defaultChecked={settings.bookingShowSearchAccommodation}
          />
          Mostrar busca de datas nas páginas de acomodação
        </label>
        <label className="flex items-center gap-2 text-sm text-bark/80">
          <input type="checkbox" name="bookingShowCalendar" defaultChecked={settings.bookingShowCalendar} />
          Mostrar calendário de disponibilidade (quando o motor oferecer essa opção)
        </label>

        <Field
          label="URL do widget embutido (opcional)"
          name="bookingWidgetEmbedUrl"
          defaultValue={settings.bookingWidgetEmbedUrl ?? ""}
          help="Só usada quando o motor for 'Widget/calendário embutido'. Precisa ser um link seguro (https)."
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
