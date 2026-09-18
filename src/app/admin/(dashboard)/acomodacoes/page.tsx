import Link from "next/link";
import { getAccommodations } from "@/lib/data";
import { createAccommodationAction } from "../../actions";

export default async function AdminAcomodacoesPage() {
  const accommodations = await getAccommodations();

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl text-bark">Acomodações</h1>
      <ul className="mt-6 divide-y divide-black/10 border-y border-black/10">
        {accommodations.map((acc) => (
          <li key={acc.slug}>
            <Link
              href={`/admin/acomodacoes/${acc.slug}`}
              className="focus-ring flex items-center justify-between px-1 py-4 hover:bg-sand/20"
            >
              <div>
                <p className="font-serif text-lg text-bark">{acc.name}</p>
                <p className="text-sm text-bark/60">{acc.tagline}</p>
              </div>
              <span className="text-sm text-bark/50">Editar →</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-sm border border-dashed border-black/20 p-5">
        <p className="font-serif text-lg text-bark">Nova acomodação</p>
        <p className="mt-1 text-sm text-bark/60">
          Depois de criar, você é levada para a página de edição completa (fotos,
          descrição, comodidades, preço, link de reserva).
        </p>
        <form action={createAccommodationAction} className="mt-3 flex flex-wrap gap-3">
          <input
            name="name"
            required
            placeholder="Nome da acomodação"
            className="focus-ring min-w-0 flex-1 rounded border border-black/10 px-3 py-2 text-sm"
          />
          <button type="submit" className="focus-ring shrink-0 rounded-full bg-forest px-5 py-2 text-sm text-cream">
            Criar
          </button>
        </form>
      </div>
    </div>
  );
}
