import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/photo";
import { getAccommodations } from "@/lib/data";

export const metadata: Metadata = {
  title: "Acomodações",
  description:
    "Conheça as acomodações do Sítio Recanto Azul: Ágata, Mirante, Doce Recanto, Domo Estelar, Chalé para Grupos e Celeiro.",
};

export default async function AcomodacoesPage() {
  const accommodations = await getAccommodations();
  return (
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-clay">Acomodações</p>
        <h1 className="font-serif text-4xl text-bark sm:text-5xl">
          Cada espaço, uma forma diferente de desacelerar
        </h1>
      </header>

      <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {accommodations.map((acc) => (
          <Link
            key={acc.slug}
            href={`/acomodacoes/${acc.slug}`}
            className="focus-ring group block"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-stone/30">
              <Photo
                src={acc.images[0]?.url ?? ""}
                alt={acc.images[0]?.alt ?? acc.name}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <h2 className="mt-4 font-serif text-2xl text-bark">{acc.name}</h2>
            <p className="mt-1 text-sm text-bark/70">{acc.tagline}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-clay">{acc.capacity}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
