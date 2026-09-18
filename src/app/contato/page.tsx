import type { Metadata } from "next";
import { ReserveButton } from "@/components/reserve-button";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com o Sítio Recanto Azul.",
};

export default async function ContatoPage() {
  const siteSettings = await getSiteSettings();
  return (
    <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8">
      <p className="mb-3 text-sm uppercase tracking-[0.2em] text-clay">Contato</p>
      <h1 className="font-serif text-4xl text-bark sm:text-5xl">Fale conosco</h1>
      <p className="mt-6 text-bark/75">
        Estamos à disposição para tirar dúvidas e ajudar a planejar sua estadia.
      </p>

      <dl className="mt-10 space-y-3 text-bark/80">
        <div>
          <dt className="sr-only">Telefone</dt>
          <dd>{siteSettings.phone}</dd>
        </div>
        <div>
          <dt className="sr-only">E-mail</dt>
          <dd>{siteSettings.email}</dd>
        </div>
        <div>
          <dt className="sr-only">Instagram</dt>
          <dd>
            <a
              className="focus-ring rounded underline underline-offset-4"
              href={siteSettings.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </dd>
        </div>
      </dl>

      <div className="mt-10 flex justify-center">
        <ReserveButton href={siteSettings.defaultReserveUrl}>Falar pelo WhatsApp</ReserveButton>
      </div>
    </div>
  );
}
