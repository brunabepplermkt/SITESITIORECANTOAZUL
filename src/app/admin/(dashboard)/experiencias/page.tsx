import { getExperiences } from "@/lib/data";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { createExperienceAction, deleteExperienceAction, updateExperienceAction } from "../../actions";

export default async function AdminExperienciasPage() {
  const experiences = await getExperiences({ includeUnpublished: true });

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl text-bark">Experiências</h1>
      <p className="mt-1 text-sm text-bark/60">
        Edite o texto e a foto de cada experiência, crie novas ou exclua as que não
        fazem mais sentido.
      </p>

      <div className="mt-6 space-y-8">
        {experiences.map((exp, i) => (
          <div key={exp.slug} className="rounded-sm border border-black/10 p-5">
            <form action={updateExperienceAction} className="space-y-3">
              <input type="hidden" name="slug" value={exp.slug} />
              <input type="hidden" name="orderIndex" value={i} />
              <div>
                <label className="block text-sm text-bark/80">Nome</label>
                <input
                  name="name"
                  defaultValue={exp.name}
                  className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-bark/80">Descrição</label>
                <textarea
                  name="description"
                  defaultValue={exp.description}
                  rows={2}
                  className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-bark/80">URL da imagem</label>
                <input
                  name="imageUrl"
                  defaultValue={exp.image.url}
                  className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-bark/80">Texto alternativo da imagem</label>
                <input
                  name="imageAlt"
                  defaultValue={exp.image.alt}
                  className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-bark/80">Texto do botão (opcional)</label>
                  <input
                    name="ctaLabel"
                    defaultValue={exp.ctaLabel ?? ""}
                    className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-bark/80">Link do botão (opcional)</label>
                  <input
                    name="ctaHref"
                    defaultValue={exp.ctaHref ?? ""}
                    className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-bark/80">
                <input type="checkbox" name="published" defaultChecked={exp.published} />
                Publicada (visível no site)
              </label>
              <button type="submit" className="focus-ring rounded-full bg-forest px-5 py-2 text-sm text-cream">
                Salvar
              </button>
            </form>

            <form action={deleteExperienceAction} className="mt-3">
              <input type="hidden" name="slug" value={exp.slug} />
              <ConfirmSubmitButton
                confirmMessage={`Excluir a experiência "${exp.name}"? Esta ação não pode ser desfeita.`}
                className="focus-ring text-sm text-red-700 underline"
              >
                Excluir esta experiência
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-sm border border-dashed border-black/20 p-5">
        <p className="font-serif text-lg text-bark">Nova experiência</p>
        <p className="mt-1 text-sm text-bark/60">
          Depois de criar, edite a descrição e a foto na lista acima.
        </p>
        <form action={createExperienceAction} className="mt-3 flex flex-wrap gap-3">
          <input
            name="name"
            required
            placeholder="Nome da experiência"
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
