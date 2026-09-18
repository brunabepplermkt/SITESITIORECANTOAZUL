import type { Metadata } from "next";
import { Photo } from "@/components/photo";
import { getExperiences } from "@/lib/data";

export const metadata: Metadata = {
  title: "Experiências",
  description: "Momentos preparados no Sítio Recanto Azul: mirantes, decks, balanços, piquenique e passeio a cavalo.",
};

export default async function ExperienciasPage() {
  const experiences = await getExperiences();
  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-clay">Experiências</p>
        <h1 className="font-serif text-4xl text-bark sm:text-5xl">Viva o Recanto Azul além da hospedagem</h1>
      </header>

      <div className="mt-16 space-y-20">
        {experiences.map((exp, i) => (
          <div
            key={exp.slug}
            className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-stone/30">
              <Photo src={exp.image.url} alt={exp.image.alt} className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-bark sm:text-3xl">{exp.name}</h2>
              <p className="mt-4 leading-relaxed text-bark/75">{exp.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
