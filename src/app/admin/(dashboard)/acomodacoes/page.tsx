import Link from "next/link";
import { getAccommodations } from "@/lib/data";

export default async function AdminAcomodacoesPage() {
  const accommodations = await getAccommodations();

  return (
    <div>
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
    </div>
  );
}
