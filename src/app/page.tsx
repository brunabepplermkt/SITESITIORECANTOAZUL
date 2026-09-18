import Link from "next/link";
import { Photo } from "@/components/photo";
import { ReserveButton } from "@/components/reserve-button";
import { getAccommodations, getExperiences, getSiteSettings } from "@/lib/data";

export default async function HomePage() {
  const [accommodations, experiences, siteSettings] = await Promise.all([
    getAccommodations(),
    getExperiences(),
    getSiteSettings(),
  ]);
  const featured = accommodations.slice(0, 3);

  return (
    <>
      {/* Hero cinematográfico */}
      <section className="relative flex h-[92vh] min-h-[560px] items-end overflow-hidden">
        <div className="absolute inset-0">
          <Photo
            src="/images/placeholder/hero-home.svg"
            alt="Vista do Sítio Recanto Azul ao entardecer"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-cream/80">
            {siteSettings.tagline}
          </p>
          <h1 className="max-w-2xl font-serif text-4xl leading-[1.05] text-cream sm:text-6xl">
            Um recanto para desacelerar
          </h1>
          <div className="mt-8 flex flex-wrap gap-4">
            <ReserveButton href={siteSettings.defaultReserveUrl}>Reservar agora</ReserveButton>
            <Link
              href="/acomodacoes"
              className="focus-ring inline-flex items-center justify-center rounded-full border border-cream/40 px-7 py-3.5 text-sm text-cream transition-colors hover:bg-cream/10"
            >
              Ver acomodações
            </Link>
          </div>
        </div>
      </section>

      {/* Apresentação curta */}
      <section className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
        <h2 className="font-serif text-3xl text-bark sm:text-4xl">
          Natureza, privacidade e tempo para o que importa
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-bark/75">
          O Sítio Recanto Azul reúne acomodações pensadas para casais e grupos que buscam
          uma pausa real: hidromassagens com vista, lareiras, redes e um cenário natural
          que convida ao silêncio. Cada detalhe foi escolhido para transformar uma
          estadia em experiência.
        </p>
      </section>

      {/* Acomodações em destaque */}
      <section className="bg-sand/40 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12 flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl text-bark sm:text-4xl">Acomodações</h2>
            <Link href="/acomodacoes" className="focus-ring hidden rounded text-sm text-bark/70 underline underline-offset-4 hover:text-bark sm:block">
              Ver todas
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {featured.map((acc) => (
              <Link
                key={acc.slug}
                href={`/acomodacoes/${acc.slug}`}
                className="focus-ring group block overflow-hidden rounded-sm"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-stone/30">
                  <Photo
                    src={acc.images[0]?.url ?? "/images/placeholder/hero-home.svg"}
                    alt={acc.images[0]?.alt ?? acc.name}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                </div>
                <div className="pt-4">
                  <h3 className="font-serif text-xl text-bark">{acc.name}</h3>
                  <p className="mt-1 text-sm text-bark/70">{acc.tagline}</p>
                </div>
              </Link>
            ))}
          </div>

          <Link href="/acomodacoes" className="focus-ring mt-10 block text-center text-sm text-bark/70 underline underline-offset-4 sm:hidden">
            Ver todas as acomodações
          </Link>
        </div>
      </section>

      {/* Seção editorial */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 md:grid-cols-2 md:items-center md:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-stone/30 md:order-2">
          <Photo
            src="/images/placeholder/about-sitio.svg"
            alt="Ambiente natural do Sítio Recanto Azul"
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div className="md:order-1">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-clay">O sítio</p>
          <h2 className="font-serif text-3xl text-bark sm:text-4xl">
            Um cenário construído para experiências, não apenas hospedagem
          </h2>
          <p className="mt-6 leading-relaxed text-bark/75">
            Entre mirantes, decks e trilhas, o Recanto Azul foi pensado para que cada
            hóspede viva a natureza de perto — do nascer ao pôr do sol.
          </p>
          <Link
            href="/sobre"
            className="focus-ring mt-6 inline-block rounded text-sm text-bark underline underline-offset-4"
          >
            Conheça o sítio
          </Link>
        </div>
      </section>

      {/* Experiências */}
      <section className="bg-forest py-24 text-cream">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl">Experiências</h2>
          <p className="mt-4 max-w-xl text-cream/75">
            Momentos preparados para tornar sua estadia inesquecível.
          </p>

          <div className="mt-12 flex gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {experiences.map((exp) => (
              <div key={exp.slug} className="w-64 shrink-0">
                <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-cream/10">
                  <Photo src={exp.image.url} alt={exp.image.alt} className="object-cover" sizes="256px" />
                </div>
                <p className="mt-3 font-serif text-lg">{exp.name}</p>
              </div>
            ))}
          </div>

          <Link href="/experiencias" className="focus-ring mt-8 inline-block rounded text-sm text-cream/90 underline underline-offset-4">
            Ver todas as experiências
          </Link>
        </div>
      </section>

      {/* Depoimentos (preparado para conteúdo futuro) */}
      <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <h2 className="font-serif text-3xl text-bark sm:text-4xl">O que dizem nossos hóspedes</h2>
        <p className="mt-6 text-bark/60">
          Em breve, depoimentos reais de quem já viveu a experiência Recanto Azul.
        </p>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-4xl px-5 pb-24 text-center sm:px-8">
        <h2 className="font-serif text-3xl text-bark sm:text-4xl">Pronto para desacelerar?</h2>
        <p className="mt-4 text-bark/70">Escolha sua acomodação e reserve seu tempo de descanso.</p>
        <div className="mt-8 flex justify-center">
          <ReserveButton href={siteSettings.defaultReserveUrl} />
        </div>
      </section>
    </>
  );
}
