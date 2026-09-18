import Link from "next/link";
import { Photo } from "@/components/photo";
import { ReserveButton, SecondaryCta } from "@/components/reserve-button";
import { ReviewsSection } from "@/components/reviews-section";
import { getBookingHref, getBookingTarget } from "@/lib/booking";
import { getAccommodations, getExperiences, getHomeSections, getPublishedReviews, getSiteSettings } from "@/lib/data";
import type { HomeSection, HomeSectionKey } from "@/lib/types";

const ROMANTIC_SLUGS = ["agata", "mirante", "doce-recanto", "domo-estelar"];

export default async function HomePage() {
  const [accommodations, experiences, siteSettings, reviews, homeSections] = await Promise.all([
    getAccommodations(),
    getExperiences(),
    getSiteSettings(),
    getPublishedReviews(),
    getHomeSections(),
  ]);

  const bookingHref = getBookingHref(siteSettings);
  const bookingTarget = getBookingTarget(siteSettings);

  const romantic = ROMANTIC_SLUGS.map((slug) => accommodations.find((a) => a.slug === slug)).filter(
    (a): a is NonNullable<typeof a> => Boolean(a),
  );
  const otherAccommodations = accommodations.filter((a) => !ROMANTIC_SLUGS.includes(a.slug));

  const sectionByKey = new Map(homeSections.map((s) => [s.key, s]));

  function section<K extends HomeSectionKey>(key: K): HomeSection | undefined {
    return sectionByKey.get(key);
  }

  const hero = section("hero");
  const intro = section("intro");
  const acomodacoesSection = section("acomodacoes");
  const sitio = section("sitio");
  const experienciasSection = section("experiencias");
  const avaliacoes = section("avaliacoes");
  const ctaFinal = section("cta_final");

  return (
    <>
      {/* Hero cinematográfico */}
      {hero && (
        <section className="relative flex h-[92vh] min-h-[560px] items-end overflow-hidden">
          <div className="absolute inset-0">
            <Photo
              src={hero.imageUrl ?? "/images/placeholder/hero-home.svg"}
              alt={hero.imageAlt ?? "Vista do Sítio Recanto Azul ao entardecer"}
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24">
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-cream/80">
              {hero.subtitle ?? siteSettings.tagline}
            </p>
            <h1 className="max-w-2xl font-serif text-4xl leading-[1.05] text-cream sm:text-6xl">
              {hero.title ?? "Um recanto para desacelerar"}
            </h1>
            <div className="mt-8 flex flex-wrap gap-4">
              <ReserveButton href={bookingHref} target={bookingTarget}>
                {hero.buttonLabel ?? "Reservar agora"}
              </ReserveButton>
              <SecondaryCta href={hero.buttonHref ?? "/acomodacoes"} variant="outline" className="text-cream hover:bg-cream/10">
                Ver acomodações
              </SecondaryCta>
            </div>
          </div>
        </section>
      )}

      {/* Apresentação curta */}
      {intro && (
        <section className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
          <h2 className="font-serif text-3xl text-bark sm:text-4xl">
            {intro.title ?? "Natureza, privacidade e tempo para o que importa"}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-bark/75">
            {intro.body ??
              "O Sítio Recanto Azul reúne acomodações pensadas para casais e grupos que buscam uma pausa real: hidromassagens com vista, lareiras, redes e um cenário natural que convida ao silêncio. Cada detalhe foi escolhido para transformar uma estadia em experiência."}
          </p>
        </section>
      )}

      {/* Acomodações românticas em destaque */}
      {acomodacoesSection && (
        <section className="bg-sand py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-10 flex items-end justify-between gap-4 sm:mb-12">
              <h2 className="font-serif text-3xl text-bark sm:text-4xl">{acomodacoesSection.title ?? "Acomodações"}</h2>
              <div className="hidden sm:block">
                <SecondaryCta href="/acomodacoes" className="text-bark/70">
                  Ver todas
                </SecondaryCta>
              </div>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
              {romantic.map((acc) => (
                <Link
                  key={acc.slug}
                  href={`/acomodacoes/${acc.slug}`}
                  className="focus-ring group block w-[78vw] shrink-0 snap-start sm:w-auto sm:shrink"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-stone/30">
                    <Photo
                      src={acc.images[0]?.url ?? "/images/placeholder/hero-home.svg"}
                      alt={acc.images[0]?.alt ?? acc.name}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 78vw"
                    />
                  </div>
                  <div className="pt-4">
                    <h3 className="font-serif text-xl text-bark">{acc.name}</h3>
                    <p className="mt-1 text-sm text-bark/70">{acc.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <SecondaryCta href="/acomodacoes" className="text-bark/70">
                Ver todas as acomodações
              </SecondaryCta>
            </div>

            {otherAccommodations.length > 0 && (
              <p className="mt-10 text-center text-sm text-bark/60 sm:mt-14">
                Também disponíveis:{" "}
                <Link
                  href="/acomodacoes"
                  className="focus-ring rounded text-bark/70 underline decoration-bark/30 underline-offset-4 hover:decoration-bark"
                >
                  {otherAccommodations.map((a) => a.name).join(", ")}
                </Link>
                .
              </p>
            )}
          </div>
        </section>
      )}

      {/* Seção editorial */}
      {sitio && (
        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 md:grid-cols-2 md:items-center md:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-stone/30 md:order-2">
            <Photo
              src={sitio.imageUrl ?? "/images/placeholder/about-sitio.svg"}
              alt={sitio.imageAlt ?? "Ambiente natural do Sítio Recanto Azul"}
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div className="md:order-1">
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-clay">{sitio.subtitle ?? "O sítio"}</p>
            <h2 className="font-serif text-3xl text-bark sm:text-4xl">
              {sitio.title ?? "Um cenário construído para experiências, não apenas hospedagem"}
            </h2>
            <p className="mt-6 leading-relaxed text-bark/75">
              {sitio.body ??
                "Entre mirantes, decks e trilhas, o Recanto Azul foi pensado para que cada hóspede viva a natureza de perto — do nascer ao pôr do sol."}
            </p>
            <SecondaryCta href={sitio.buttonHref ?? "/sobre"} className="mt-6 text-bark">
              {sitio.buttonLabel ?? "Conheça o sítio"}
            </SecondaryCta>
          </div>
        </section>
      )}

      {/* Experiências */}
      {experienciasSection && (
        <section className="bg-forest py-24 text-cream">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <h2 className="font-serif text-3xl sm:text-4xl">{experienciasSection.title ?? "Experiências"}</h2>
            <p className="mt-4 max-w-xl text-cream/75">
              {experienciasSection.body ?? "Momentos preparados para tornar sua estadia inesquecível."}
            </p>

            <div className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {experiences.map((exp) => (
                <div key={exp.slug} className="w-[70vw] shrink-0 snap-start sm:w-72">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-cream/10">
                    <Photo src={exp.image.url} alt={exp.image.alt} className="object-cover" sizes="(min-width: 640px) 288px, 70vw" />
                  </div>
                  <p className="mt-3 font-serif text-lg">{exp.name}</p>
                </div>
              ))}
            </div>

            <SecondaryCta href={experienciasSection.buttonHref ?? "/experiencias"} className="mt-8 text-cream/90">
              {experienciasSection.buttonLabel ?? "Ver todas as experiências"}
            </SecondaryCta>
          </div>
        </section>
      )}

      {avaliacoes && <ReviewsSection reviews={reviews} />}

      {/* CTA final */}
      {ctaFinal && (
        <section className="bg-sand py-24 text-center">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <h2 className="font-serif text-3xl text-bark sm:text-4xl">{ctaFinal.title ?? "Pronto para desacelerar?"}</h2>
            <p className="mt-4 text-bark/70">
              {ctaFinal.body ?? "Escolha sua acomodação e reserve seu tempo de descanso."}
            </p>
            <div className="mt-8 flex justify-center">
              <ReserveButton href={bookingHref} target={bookingTarget}>
                {ctaFinal.buttonLabel ?? "Reservar"}
              </ReserveButton>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
