import Link from "next/link";
import type { ReactNode } from "react";
import { Photo } from "@/components/photo";
import { ReserveButton, SecondaryCta } from "@/components/reserve-button";
import { ReviewsSection } from "@/components/reviews-section";
import { BookingSearch } from "@/components/booking-search";
import { BookingWidget } from "@/components/booking-widget";
import { getBookingHref, getBookingTarget, isBookingActive } from "@/lib/booking";
import { getAccommodations, getExperiences, getHomeSections, getPublishedReviews, getSiteSettings } from "@/lib/data";
import type { Accommodation, HomeSection, SiteSettings } from "@/lib/types";

export default async function HomePage() {
  const [accommodations, experiences, siteSettings, reviews, homeSections] = await Promise.all([
    getAccommodations(),
    getExperiences(),
    getSiteSettings(),
    getPublishedReviews(),
    getHomeSections(),
  ]);

  const bookingActive = isBookingActive(siteSettings);
  const bookingHref = getBookingHref(siteSettings);
  const bookingTarget = getBookingTarget(siteSettings);

  // Destaque na Home é 100% definido pelo /admin (featured_home + home_order),
  // nunca por uma lista de slugs fixa no código. Se a proprietária não marcar
  // nenhuma acomodação como destaque, a seção de acomodações simplesmente não
  // aparece — igual ao padrão já usado para a seção de Avaliações — em vez de
  // inventar um fallback silencioso com acomodações antigas.
  const featured = accommodations
    .filter((a) => a.featuredHome)
    .sort((a, b) => a.homeOrder - b.homeOrder);
  const otherAccommodations = accommodations.filter((a) => !a.featuredHome);

  return (
    <>
      {homeSections.map((section) => (
        <HomeSectionBlock
          key={section.key}
          section={section}
          siteSettings={siteSettings}
          bookingActive={bookingActive}
          bookingHref={bookingHref}
          bookingTarget={bookingTarget}
          featured={featured}
          otherAccommodations={otherAccommodations}
          experiences={experiences}
          reviews={reviews}
        />
      ))}
    </>
  );
}

function HomeSectionBlock({
  section,
  siteSettings,
  bookingActive,
  bookingHref,
  bookingTarget,
  featured,
  otherAccommodations,
  experiences,
  reviews,
}: {
  section: HomeSection;
  siteSettings: SiteSettings;
  bookingActive: boolean;
  bookingHref: string;
  bookingTarget: "_self" | "_blank";
  featured: Accommodation[];
  otherAccommodations: Accommodation[];
  experiences: Awaited<ReturnType<typeof getExperiences>>;
  reviews: Awaited<ReturnType<typeof getPublishedReviews>>;
}): ReactNode {
  switch (section.key) {
    case "hero":
      return (
        <section className="relative flex h-[92vh] min-h-[560px] items-end overflow-hidden">
          <div className="absolute inset-0">
            <Photo
              src={section.imageUrl ?? "/images/placeholder/hero-home.svg"}
              alt={section.imageAlt ?? "Vista do Sítio Recanto Azul ao entardecer"}
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24">
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-cream/80">
              {section.subtitle ?? siteSettings.tagline}
            </p>
            <h1 className="max-w-2xl font-serif text-4xl leading-[1.05] text-cream sm:text-6xl">
              {section.title ?? "Um recanto para desacelerar"}
            </h1>
            <div className="mt-8 flex flex-wrap gap-4">
              {bookingActive && (
                <ReserveButton href={bookingHref} target={bookingTarget}>
                  {section.buttonLabel ?? "Reservar agora"}
                </ReserveButton>
              )}
              <SecondaryCta href={section.buttonHref ?? "/acomodacoes"} variant="outline" className="text-cream hover:bg-cream/10">
                Ver acomodações
              </SecondaryCta>
            </div>
          </div>
        </section>
      );

    case "intro":
      return (
        <section className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
          <h2 className="font-serif text-3xl text-bark sm:text-4xl">
            {section.title ?? "Natureza, privacidade e tempo para o que importa"}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-bark/75">
            {section.body ??
              "O Sítio Recanto Azul reúne acomodações pensadas para casais e grupos que buscam uma pausa real: hidromassagens com vista, lareiras, redes e um cenário natural que convida ao silêncio. Cada detalhe foi escolhido para transformar uma estadia em experiência."}
          </p>
          {siteSettings.bookingShowSearchHome && (
            <div className="mt-10">
              <BookingSearch settings={siteSettings} />
            </div>
          )}
          {siteSettings.bookingProvider === "widget" && <BookingWidget settings={siteSettings} className="mt-10" />}
        </section>
      );

    case "acomodacoes":
      if (featured.length === 0) return null;
      return (
        <section className="bg-sand py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-10 flex items-end justify-between gap-4 sm:mb-12">
              <h2 className="font-serif text-3xl text-bark sm:text-4xl">{section.title ?? "Acomodações"}</h2>
              <div className="hidden sm:block">
                <SecondaryCta href="/acomodacoes" className="text-bark/70">
                  Ver todas
                </SecondaryCta>
              </div>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
              {featured.map((acc) => (
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
      );

    case "sitio":
      return (
        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 md:grid-cols-2 md:items-center md:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-stone/30 md:order-2">
            <Photo
              src={section.imageUrl ?? "/images/placeholder/about-sitio.svg"}
              alt={section.imageAlt ?? "Ambiente natural do Sítio Recanto Azul"}
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div className="md:order-1">
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-clay">{section.subtitle ?? "O sítio"}</p>
            <h2 className="font-serif text-3xl text-bark sm:text-4xl">
              {section.title ?? "Um cenário construído para experiências, não apenas hospedagem"}
            </h2>
            <p className="mt-6 leading-relaxed text-bark/75">
              {section.body ??
                "Entre mirantes, decks e trilhas, o Recanto Azul foi pensado para que cada hóspede viva a natureza de perto — do nascer ao pôr do sol."}
            </p>
            <SecondaryCta href={section.buttonHref ?? "/sobre"} className="mt-6 text-bark">
              {section.buttonLabel ?? "Conheça o sítio"}
            </SecondaryCta>
          </div>
        </section>
      );

    case "experiencias":
      if (experiences.length === 0) return null;
      return (
        <section className="bg-forest py-24 text-cream">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <h2 className="font-serif text-3xl sm:text-4xl">{section.title ?? "Experiências"}</h2>
            <p className="mt-4 max-w-xl text-cream/75">
              {section.body ?? "Momentos preparados para tornar sua estadia inesquecível."}
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

            <SecondaryCta href={section.buttonHref ?? "/experiencias"} className="mt-8 text-cream/90">
              {section.buttonLabel ?? "Ver todas as experiências"}
            </SecondaryCta>
          </div>
        </section>
      );

    case "avaliacoes":
      if (reviews.length === 0) return null;
      return <ReviewsSection reviews={reviews} />;

    case "cta_final":
      return (
        <section className="bg-sand py-24 text-center">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <h2 className="font-serif text-3xl text-bark sm:text-4xl">{section.title ?? "Pronto para desacelerar?"}</h2>
            <p className="mt-4 text-bark/70">
              {section.body ?? "Escolha sua acomodação e reserve seu tempo de descanso."}
            </p>
            {bookingActive && (
              <div className="mt-8 flex justify-center">
                <ReserveButton href={bookingHref} target={bookingTarget}>
                  {section.buttonLabel ?? "Reservar"}
                </ReserveButton>
              </div>
            )}
          </div>
        </section>
      );

    default:
      return null;
  }
}
