import { createClient } from "@/lib/supabase/server";
import { getAccommodations } from "@/lib/data";
import {
  addReviewAction,
  deleteReviewAction,
  reorderReviewAction,
  updateReviewAction,
} from "../../actions";

const SOURCE_LABELS: Record<string, string> = {
  airbnb: "Airbnb",
  booking: "Booking",
  google: "Google",
  direto: "Direto",
  outro: "Outro",
};

type ReviewRow = {
  id: string;
  guest_name: string;
  text: string;
  rating: number | null;
  source: string;
  accommodation_slug: string | null;
  date_label: string | null;
  order_index: number;
  published: boolean;
};

export default async function AdminAvaliacoesPage() {
  const supabase = await createClient();
  const [{ data: reviews }, accommodations] = await Promise.all([
    supabase.from("reviews").select("*").order("order_index", { ascending: true }),
    getAccommodations(),
  ]);

  const list = (reviews ?? []) as ReviewRow[];

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl text-bark">Avaliações</h1>
      <p className="mt-1 text-sm text-bark/60">
        Cole aqui avaliações reais recebidas no Airbnb, Booking, Google ou diretamente.
        Só avaliações marcadas como &ldquo;Publicada&rdquo; aparecem no site.
      </p>

      <div className="mt-6 space-y-6">
        {list.map((review, i) => (
          <div key={review.id} className="rounded-sm border border-black/10 p-5">
            <form action={updateReviewAction} className="space-y-3">
              <input type="hidden" name="id" value={review.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-bark/80">Nome do hóspede</label>
                  <input
                    name="guestName"
                    defaultValue={review.guest_name}
                    required
                    className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-bark/80">Nota (1-5, opcional)</label>
                  <input
                    name="rating"
                    type="number"
                    min={1}
                    max={5}
                    defaultValue={review.rating ?? ""}
                    className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-bark/80">Texto da avaliação</label>
                <textarea
                  name="text"
                  defaultValue={review.text}
                  required
                  rows={3}
                  className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-sm text-bark/80">Origem</label>
                  <select
                    name="source"
                    defaultValue={review.source}
                    className="focus-ring mt-1 w-full rounded border border-black/10 bg-white px-3 py-2 text-sm"
                  >
                    {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-bark/80">Acomodação (opcional)</label>
                  <select
                    name="accommodationSlug"
                    defaultValue={review.accommodation_slug ?? ""}
                    className="focus-ring mt-1 w-full rounded border border-black/10 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">—</option>
                    {accommodations.map((acc) => (
                      <option key={acc.slug} value={acc.slug}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-bark/80">Data (opcional)</label>
                  <input
                    name="dateLabel"
                    defaultValue={review.date_label ?? ""}
                    placeholder="ex.: Julho 2026"
                    className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-bark/80">
                <input type="checkbox" name="published" defaultChecked={review.published} />
                Publicada (visível no site)
              </label>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button type="submit" className="focus-ring rounded-full bg-forest px-5 py-2 text-sm text-cream">
                  Salvar
                </button>
              </div>
            </form>

            <div className="mt-3 flex items-center gap-4 text-xs text-bark/60">
              <form action={reorderReviewAction}>
                <input type="hidden" name="currentId" value={review.id} />
                <input type="hidden" name="currentOrder" value={review.order_index} />
                <input type="hidden" name="neighborId" value={list[i - 1]?.id} />
                <input type="hidden" name="neighborOrder" value={list[i - 1]?.order_index} />
                <button type="submit" disabled={i === 0} className="focus-ring disabled:opacity-30">
                  ↑ mover para cima
                </button>
              </form>
              <form action={reorderReviewAction}>
                <input type="hidden" name="currentId" value={review.id} />
                <input type="hidden" name="currentOrder" value={review.order_index} />
                <input type="hidden" name="neighborId" value={list[i + 1]?.id} />
                <input type="hidden" name="neighborOrder" value={list[i + 1]?.order_index} />
                <button type="submit" disabled={i === list.length - 1} className="focus-ring disabled:opacity-30">
                  ↓ mover para baixo
                </button>
              </form>
              <form action={deleteReviewAction}>
                <input type="hidden" name="id" value={review.id} />
                <button type="submit" className="focus-ring text-red-700">
                  excluir
                </button>
              </form>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <p className="text-sm text-bark/60">Nenhuma avaliação cadastrada ainda.</p>
        )}
      </div>

      <div className="mt-10 rounded-sm border border-dashed border-black/20 p-5">
        <p className="font-serif text-lg text-bark">Nova avaliação</p>
        <form action={addReviewAction} className="mt-3 space-y-3">
          <input type="hidden" name="orderIndex" value={list.length} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-bark/80">Nome do hóspede</label>
              <input name="guestName" required className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-bark/80">Nota (1-5, opcional)</label>
              <input name="rating" type="number" min={1} max={5} className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-bark/80">Texto da avaliação</label>
            <textarea name="text" required rows={3} className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-sm text-bark/80">Origem</label>
              <select name="source" defaultValue="direto" className="focus-ring mt-1 w-full rounded border border-black/10 bg-white px-3 py-2 text-sm">
                {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-bark/80">Acomodação (opcional)</label>
              <select name="accommodationSlug" defaultValue="" className="focus-ring mt-1 w-full rounded border border-black/10 bg-white px-3 py-2 text-sm">
                <option value="">—</option>
                {accommodations.map((acc) => (
                  <option key={acc.slug} value={acc.slug}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-bark/80">Data (opcional)</label>
              <input name="dateLabel" placeholder="ex.: Julho 2026" className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-bark/80">
            <input type="checkbox" name="published" />
            Publicar imediatamente
          </label>
          <button type="submit" className="focus-ring rounded-full bg-forest px-5 py-2 text-sm text-cream">
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
}
