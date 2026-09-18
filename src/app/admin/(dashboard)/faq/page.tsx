import { getFaqs } from "@/lib/data";
import { addFaqAction, deleteFaqAction, updateFaqAction } from "../../actions";

export default async function AdminFaqPage() {
  const faqs = await getFaqs();

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl text-bark">Perguntas frequentes</h1>

      <div className="mt-6 space-y-6">
        {faqs.map((faq) => (
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
              <div className="flex gap-3">
                <button type="submit" className="focus-ring rounded-full bg-forest px-5 py-2 text-sm text-cream">
                  Salvar
                </button>
              </div>
            </form>
            {faq.id && (
              <form action={deleteFaqAction} className="mt-2">
                <input type="hidden" name="id" value={faq.id} />
                <button type="submit" className="focus-ring text-sm text-red-700 underline">
                  Excluir
                </button>
              </form>
            )}
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
          <button type="submit" className="focus-ring rounded-full bg-forest px-5 py-2 text-sm text-cream">
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
}
