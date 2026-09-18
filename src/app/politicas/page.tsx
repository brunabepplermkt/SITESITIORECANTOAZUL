import type { Metadata } from "next";
import { getPolicies } from "@/lib/data";

export const metadata: Metadata = {
  title: "Políticas",
  description: "Políticas de reserva, cancelamento e regras da casa do Sítio Recanto Azul.",
};

export default async function PoliticasPage() {
  const policiesContent = await getPolicies();
  const paragraphs = policiesContent
    .split("\n")
    .filter((line) => line.trim().length > 0 && !line.startsWith("#"));

  return (
    <div className="mx-auto max-w-2xl px-5 py-20 sm:px-8">
      <p className="mb-3 text-center text-sm uppercase tracking-[0.2em] text-clay">Informações</p>
      <h1 className="text-center font-serif text-4xl text-bark sm:text-5xl">Políticas</h1>

      <div className="mt-12 space-y-4 leading-relaxed text-bark/80">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
