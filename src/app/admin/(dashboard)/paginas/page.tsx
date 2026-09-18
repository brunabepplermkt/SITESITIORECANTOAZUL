import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createPageAction } from "../../actions";

export default async function AdminPaginasPage() {
  const supabase = await createClient();
  const { data: pages } = await supabase.from("pages").select("*").order("order_index", { ascending: true });

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl text-bark">Páginas</h1>
      <p className="mt-1 text-sm text-bark/60">
        Crie páginas novas com blocos de texto e foto — como uma galeria, ou uma
        página sobre a proprietária.
      </p>

      <ul className="mt-6 divide-y divide-black/10 border-y border-black/10">
        {(pages ?? []).map((page) => (
          <li key={page.id}>
            <Link
              href={`/admin/paginas/${page.slug}`}
              className="focus-ring flex items-center justify-between px-1 py-4 hover:bg-sand/20"
            >
              <div>
                <p className="font-serif text-lg text-bark">{page.title}</p>
                <p className="text-sm text-bark/60">
                  /{page.slug} · {page.published ? "publicada" : "rascunho"}
                  {page.show_in_nav ? " · no menu" : ""}
                </p>
              </div>
              <span className="text-sm text-bark/50">Editar →</span>
            </Link>
          </li>
        ))}
        {(pages ?? []).length === 0 && (
          <li className="py-4 text-sm text-bark/60">Nenhuma página criada ainda.</li>
        )}
      </ul>

      <div className="mt-10 rounded-sm border border-dashed border-black/20 p-5">
        <p className="font-serif text-lg text-bark">Nova página</p>
        <p className="mt-1 text-sm text-bark/60">
          Depois de criar, adicione blocos de texto e foto e escolha se ela aparece
          no menu do site.
        </p>
        <form action={createPageAction} className="mt-3 flex flex-wrap gap-3">
          <input
            name="title"
            required
            placeholder="Título da página"
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
