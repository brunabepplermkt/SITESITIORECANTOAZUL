import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Localização",
  description: "Como chegar ao Sítio Recanto Azul.",
};

export default async function LocalizacaoPage() {
  const siteSettings = await getSiteSettings();
  return (
    <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
      <p className="mb-3 text-center text-sm uppercase tracking-[0.2em] text-clay">Localização</p>
      <h1 className="text-center font-serif text-4xl text-bark sm:text-5xl">Como chegar</h1>

      <div className="mx-auto mt-12 max-w-xl text-center">
        <p className="leading-relaxed text-bark/80">{siteSettings.address}</p>
        <p className="mt-4 text-sm text-bark/60">
          O endereço completo e as instruções de acesso serão enviados após a confirmação da reserva.
        </p>
      </div>

      {siteSettings.googleMapsUrl ? (
        <a
          href={siteSettings.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-14 block aspect-[16/9] w-full rounded-sm bg-sand/50"
          aria-label="Abrir localização no Google Maps"
        />
      ) : (
        <div className="mt-14 aspect-[16/9] w-full rounded-sm bg-sand/50" aria-hidden="true" />
      )}
    </div>
  );
}
