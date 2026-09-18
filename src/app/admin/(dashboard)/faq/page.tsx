import { getFaqs } from "@/lib/data";
import { addFaqAction, deleteFaqAction, reorderFaqAction, updateFaqAction } from "../../actions";

export default async function AdminFaqPage() {
  const faqs = await getFaqs({ includeUnpublished: true });

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl text-bark">Perguntas frequentes</h1>
      <p className="mt-1 text-sm text-bark/60">
        Só perguntas marcadas como &ldquo;Publicada&rdquo; aparecem na página de FAQ do site.
      </p>

      <div className="mt-6 space-y-6">
        {faqs.map((faq, i) => (
          <div key={faq.id ?? faq.question} className="rounded-sm border border-black/10 p-5">
            <form action={updateFaqAction} className="space-y-3">
              {faq.id && <input type="hidden" name="id" value={faq.id} />}
              <div>
                <label className="block text-sm text-bark/80">Pergunta</label>
                <input
                  name="question"
                  defaultValue={faq.question}
                  className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-bark/80">Resposta</label>
                <textarea
                  name="answer"
                  defaultValue={faq.answer}
                  rows={2}
                  className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-bark/80">
                <input type="checkbox" name="published" defaultChecked={faq.published} />
                Publicada (visível no site)
              </label>
              <div className="flex gap-3">
                <button type="submit" className="focus-ring rounded-full bg-forest px-5 py-2 text-sm text-cream">
                  Salvar
                </button>
              </div>
            </form>

            <div className="mt-3 flex items-center gap-4 text-xs text-bark/60">
              {faq.id && (
                <>
                  <form action={reorderFaqAction}>
                    <input type="hidden" name="currentId" value={faq.id} />
                    <input type="hidden" name="currentOrder" value={faq.order} />
                    <input type="hidden" name="neighborId" value={faqs[i - 1]?.id} />
                    <input type="hidden" name="neighborOrder" value={faqs[i - 1]?.order} />
                    <button type="submit" disabled={i === 0} className="focus-ring disabled:opacity-30">
                      ↑ mover para cima
                    </button>
                  </form>
                  <form action={reorderFaqAction}>
                    <input type="hidden" name="currentId" value={faq.id} />
                    <input type="hidden" name="currentOrder" value={faq.order} />
                    <input type="hidden" name="neighborId" value={faqs[i + 1]?.id} />
                    <input type="hidden" name="neighborOrder" value={faqs[i + 1]?.order} />
                    <button type="submit" disabled={i === faqs.length - 1} className="focus-ring disabled:opacity-30">
                      ↓ mover para baixo
                    </button>
                  </form>
                  <form action={deleteFaqAction}>
                    <input type="hidden" name="id" value={faq.id} />
                    <button type="submit" className="focus-ring text-red-700">
                      excluir
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-sm border border-dashed border-black/20 p-5">
        <p className="font-serif text-lg text-bark">Nova pergunta</p>
        <form action={addFaqAction} className="mt-3 space-y-3">
          <input type="hidden" name="orderIndex" value={faqs.length} />
          <div>
            <label className="block text-sm text-bark/80">Pergunta</label>
            <input name="question" required className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-bark/80">Resposta</label>
            <textarea name="answer" required rows={2} className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm text-bark/80">
            <input type="checkbox" name="published" defaultChecked />
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
