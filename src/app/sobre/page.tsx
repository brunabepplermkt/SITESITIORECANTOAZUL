import type { Metadata } from "next";
import { Photo } from "@/components/photo";

export const metadata: Metadata = {
  title: "O Sítio",
  description: "Conheça a história e o cenário natural do Sítio Recanto Azul.",
};

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
      <p className="mb-3 text-center text-sm uppercase tracking-[0.2em] text-clay">O sítio</p>
      <h1 className="text-center font-serif text-4xl text-bark sm:text-5xl">
        Recanto Azul
      </h1>

      <div className="relative mt-12 aspect-[16/9] overflow-hidden rounded-sm bg-stone/30">
        <Photo src="/images/placeholder/about-sitio.svg" alt="Paisagem do Sítio Recanto Azul" className="object-cover" sizes="100vw" priority />
      </div>

      <div className="mx-auto mt-12 max-w-2xl space-y-6 leading-relaxed text-bark/80">
        <p>
          O Sítio Recanto Azul nasceu do desejo de oferecer um refúgio genuíno em meio à
          natureza — um lugar onde o tempo desacelera e cada detalhe convida ao descanso.
        </p>
        <p>
          Cada acomodação foi pensada de forma única, unindo conforto, privacidade e
          vistas que valorizam a paisagem ao redor. Do mirante ao domo com teto
          transparente, o sítio propõe diferentes formas de se conectar com o ambiente
          natural.
        </p>
        <p>
          Mais do que hospedagem, o Recanto Azul é um convite à experiência: pôr do sol,
          nascer do sol, trilhas e momentos simples que fazem toda a diferença.
        </p>
      </div>
    </div>
  );
}
