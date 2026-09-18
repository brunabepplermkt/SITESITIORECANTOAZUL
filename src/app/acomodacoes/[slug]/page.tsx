import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Photo } from "@/components/photo";
import { ReserveButton } from "@/components/reserve-button";
import { accommodations } from "@/lib/content";

type Params = { slug: string };

function getAccommodation(slug: string) {
  return accommodations.find((a) => a.slug === slug);
}

export function generateStaticParams() {
  return accommodations.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const acc = getAccommodation(slug);
  if (!acc) return {};
  return {
    title: acc.name,
    description: acc.description,
    openGraph: {
      title: acc.name,
      description: acc.tagline,
      images: acc.images[0] ? [{ url: acc.images[0].url }] : undefined,
    },
  };
}

export default async function AcomodacaoPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const acc = getAccommodation(slug);
  if (!acc) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: acc.name,
    description: acc.description,
    amenityFeature: acc.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a })),
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-10 max-w-2xl">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-clay">{acc.capacity}</p>
        <h1 className="font-serif text-4xl text-bark sm:text-5xl">{acc.name}</h1>
        <p className="mt-3 text-lg text-bark/70">{acc.tagline}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {acc.images.map((image, i) => (
          <div
            key={image.id}
            className={`relative aspect-[4/3] overflow-hidden rounded-sm bg-stone/30 ${
              i === 0 && acc.images.length > 1 ? "sm:col-span-2 sm:aspect-[16/9]" : ""
            }`}
          >
            <Photo
              src={image.url}
              alt={image.alt}
              className="object-cover"
              sizes="(min-width: 640px) 50vw, 100vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-12 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="font-serif text-2xl text-bark">Sobre esta acomodação</h2>
          <p className="mt-4 leading-relaxed text-bark/75">{acc.description}</p>

          <h3 className="mt-10 font-serif text-xl text-bark">Diferenciais</h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {acc.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm text-bark/80">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-clay" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-sm border border-black/5 bg-sand/30 p-6">
          <p className="text-sm uppercase tracking-wide text-clay">Comodidades</p>
          <ul className="mt-3 space-y-2 text-sm text-bark/80">
            {acc.amenities.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          {acc.priceFrom !== null && (
            <p className="mt-6 text-sm text-bark/70">
              A partir de{" "}
              <span className="font-serif text-lg text-bark">
                {acc.priceFrom.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </p>
          )}
          <ReserveButton href={acc.reserveUrl} className="mt-6 w-full" />
        </aside>
      </div>
    </div>
  );
}
