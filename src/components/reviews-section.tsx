import type { Review } from "@/lib/types";

const SOURCE_LABELS: Record<Review["source"], string> = {
  airbnb: "Airbnb",
  booking: "Booking",
  google: "Google",
  direto: "Reserva direta",
  outro: "Hóspede",
};

/**
 * Sem avaliações publicadas, a seção não existe — nunca mostramos um estado
 * vazio de "em breve". Assim que a primeira for publicada pelo /admin, a
 * seção aparece sozinha na próxima renderização.
 */
export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-clay">Quem já ficou</p>
        <h2 className="max-w-xl font-serif text-3xl text-bark sm:text-4xl">
          Histórias de quem viveu o Recanto Azul
        </h2>
      </div>

      <div className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="w-[85vw] shrink-0 snap-start rounded-sm border border-bark/10 bg-white/60 p-7 sm:w-[26rem]"
          >
            <p className="font-serif text-3xl leading-none text-clay/70" aria-hidden="true">
              &ldquo;
            </p>
            <p className="mt-2 text-[1.05rem] leading-relaxed text-bark/85">{review.text}</p>

            <footer className="mt-6 flex items-center justify-between border-t border-bark/10 pt-4 text-sm text-bark/60">
              <div>
                <p className="font-medium text-bark">{review.guestName}</p>
                <p className="mt-0.5 text-xs">
                  {SOURCE_LABELS[review.source]}
                  {review.dateLabel ? ` · ${review.dateLabel}` : ""}
                </p>
              </div>
              {review.rating && (
                <span className="shrink-0 text-xs text-clay" aria-label={`Nota ${review.rating} de 5`}>
                  {review.rating}/5
                </span>
              )}
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
