import type { Metadata } from "next";
import { getFaqs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Perguntas Frequentes",
  description: "Tire suas dúvidas sobre reservas e estadia no Sítio Recanto Azul.",
};

export default async function FaqPage() {
  const faqs = await getFaqs();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-20 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="mb-3 text-center text-sm uppercase tracking-[0.2em] text-clay">Dúvidas</p>
      <h1 className="text-center font-serif text-4xl text-bark sm:text-5xl">Perguntas frequentes</h1>

      <div className="mt-14 divide-y divide-black/10">
        {faqs.map((faq) => (
          <details key={faq.id ?? faq.question} className="group py-5">
            <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded font-serif text-lg text-bark">
              {faq.question}
              <span className="shrink-0 text-clay transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-relaxed text-bark/75">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
