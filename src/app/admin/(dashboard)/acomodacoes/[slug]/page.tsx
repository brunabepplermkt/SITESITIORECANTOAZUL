import { notFound } from "next/navigation";
import { getAccommodation } from "@/lib/data";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { deleteAccommodationAction, updateAccommodationAction } from "../../../actions";
import { ImageManager } from "./image-manager";

export default async function AdminAcomodacaoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const acc = await getAccommodation(slug, { includeUnpublished: true });
  if (!acc) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl text-bark">{acc.name}</h1>

      <form action={updateAccommodationAction} className="mt-6 space-y-4">
        <input type="hidden" name="slug" value={acc.slug} />

        <Field label="Nome" name="name" defaultValue={acc.name} />
        <Field label="Frase de efeito" name="tagline" defaultValue={acc.tagline} />

        <div>
          <label className="block text-sm text-bark/80">Descrição curta (usada em listagens)</label>
          <input
            name="shortDescription"
            defaultValue={acc.shortDescription}
            className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-bark/80">Descrição completa</label>
          <textarea
            name="description"
            defaultValue={acc.description}
            rows={4}
            className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
          />
        </div>

        <Field label="Capacidade (texto livre, ex.: até 2 hóspedes)" name="capacity" defaultValue={acc.capacity} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <NumberField label="Adultos" name="adults" defaultValue={acc.adults} />
          <NumberField label="Crianças" name="children" defaultValue={acc.children} />
          <NumberField label="Camas" name="beds" defaultValue={acc.beds} />
          <NumberField label="Quartos" name="rooms" defaultValue={acc.rooms} />
          <NumberField label="Banheiros" name="bathrooms" defaultValue={acc.bathrooms} />
        </div>

        <Field
          label="Preço a partir de (opcional, somente números)"
          name="priceFrom"
          defaultValue={acc.priceFrom?.toString() ?? ""}
        />

        <div>
          <label className="block text-sm text-bark/80">Diferenciais (um por linha)</label>
          <textarea
            name="highlights"
            defaultValue={acc.highlights.join("\n")}
            rows={4}
            className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-bark/80">Comodidades (uma por linha)</label>
          <textarea
            name="amenities"
            defaultValue={acc.amenities.join("\n")}
            rows={4}
            className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
          />
        </div>

        <Field
          label="Link de reserva específico desta acomodação (opcional — se em branco, usa o motor configurado em Reservas)"
          name="reserveUrl"
          defaultValue={acc.reserveUrl}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-bark/80">
            <input type="checkbox" name="published" defaultChecked={acc.published} />
            Publicada (visível no site)
          </label>
          <label className="flex items-center gap-2 text-sm text-bark/80">
            <input type="checkbox" name="featuredHome" defaultChecked={acc.featuredHome} />
            Mostrar na página inicial
          </label>
        </div>

        <NumberField
          label="Ordem na página inicial (menor aparece primeiro)"
          name="homeOrder"
          defaultValue={acc.homeOrder}
        />

        <details className="rounded-sm border border-black/10 p-4">
          <summary className="cursor-pointer text-sm text-bark/70">SEO (opcional)</summary>
          <div className="mt-3 space-y-3">
            <Field label="Título para buscadores" name="seoTitle" defaultValue={acc.seoTitle ?? ""} />
            <div>
              <label className="block text-sm text-bark/80">Descrição para buscadores</label>
              <textarea
                name="seoDescription"
                defaultValue={acc.seoDescription ?? ""}
                rows={2}
                className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
              />
            </div>
            <Field label="Imagem de compartilhamento (URL)" name="ogImageUrl" defaultValue={acc.ogImageUrl ?? ""} />
          </div>
        </details>

        <button type="submit" className="focus-ring rounded-full bg-forest px-6 py-2.5 text-sm text-cream">
          Salvar
        </button>
      </form>

      <div className="mt-10">
        <h2 className="font-serif text-xl text-bark">Fotos</h2>
        <div className="mt-4">
          <ImageManager slug={acc.slug} images={acc.images} />
        </div>
      </div>

      <div className="mt-14 border-t border-black/10 pt-6">
        <form action={deleteAccommodationAction}>
          <input type="hidden" name="slug" value={acc.slug} />
          <ConfirmSubmitButton
            confirmMessage={`Excluir "${acc.name}" definitivamente? Isso também remove suas fotos cadastradas. Esta ação não pode ser desfeita.`}
            className="focus-ring text-sm text-red-700 underline"
          >
            Excluir esta acomodação
          </ConfirmSubmitButton>
        </form>
      </div>
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

function NumberField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: number | null;
}) {
  return (
    <div>
      <label className="block text-sm text-bark/80" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        min={0}
        defaultValue={defaultValue ?? ""}
        className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
      />
    </div>
  );
}
