import { getHomeSections } from "@/lib/data";
import { reorderHomeSectionAction, updateHomeSectionAction } from "../../actions";
import type { HomeSectionKey } from "@/lib/types";

const SECTION_LABELS: Record<HomeSectionKey, string> = {
  hero: "Topo (Hero)",
  intro: "Apresentação curta",
  acomodacoes: "Acomodações em destaque",
  sitio: "O Sítio (seção editorial)",
  experiencias: "Experiências",
  avaliacoes: "Avaliações de hóspedes",
  cta_final: "Chamada final",
};

export default async function AdminHomePage() {
  const sections = await getHomeSections({ includeHidden: true });

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl text-bark">Página inicial</h1>
      <p className="mt-1 text-sm text-bark/60">
        A Home é dividida em blocos fixos. Você pode editar o texto/imagem de cada um, escondê-lo ou mudar a ordem
        entre eles — mas não é possível criar um bloco novo ou combiná-los livremente, para o design nunca quebrar.
      </p>

      <div className="mt-6 space-y-6">
        {sections.map((section, i) => (
          <div key={section.key} className="rounded-sm border border-black/10 p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-serif text-lg text-bark">{SECTION_LABELS[section.key]}</p>
              {!section.visible && <span className="text-xs uppercase tracking-wide text-clay">Oculta</span>}
            </div>

            <form action={updateHomeSectionAction} className="space-y-3">
              <input type="hidden" name="key" value={section.key} />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-bark/80">Título</label>
                  <input
                    name="title"
                    defaultValue={section.title ?? ""}
                    className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-bark/80">Subtítulo</label>
                  <input
                    name="subtitle"
                    defaultValue={section.subtitle ?? ""}
                    className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-bark/80">Texto</label>
                <textarea
                  name="body"
                  defaultValue={section.body ?? ""}
                  rows={3}
                  className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                />
              </div>

              {(section.key === "hero" || section.key === "sitio") && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm text-bark/80">URL da imagem</label>
                    <input
                      name="imageUrl"
                      defaultValue={section.imageUrl ?? ""}
                      className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-bark/80">Texto alternativo da imagem</label>
                    <input
                      name="imageAlt"
                      defaultValue={section.imageAlt ?? ""}
                      className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-bark/80">Texto do botão</label>
                  <input
                    name="buttonLabel"
                    defaultValue={section.buttonLabel ?? ""}
                    className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-bark/80">Link do botão</label>
                  <input
                    name="buttonHref"
                    defaultValue={section.buttonHref ?? ""}
                    className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-bark/80">
                <input type="checkbox" name="visible" defaultChecked={section.visible} />
                Mostrar esta seção na Home
              </label>

              <button type="submit" className="focus-ring rounded-full bg-forest px-5 py-2 text-sm text-cream">
                Salvar
              </button>
            </form>

            <div className="mt-3 flex items-center gap-4 text-xs text-bark/60">
              <form action={reorderHomeSectionAction}>
                <input type="hidden" name="currentKey" value={section.key} />
                <input type="hidden" name="currentOrder" value={section.order} />
                <input type="hidden" name="neighborKey" value={sections[i - 1]?.key} />
                <input type="hidden" name="neighborOrder" value={sections[i - 1]?.order} />
                <button type="submit" disabled={i === 0} className="focus-ring disabled:opacity-30">
                  ↑ mover para cima
                </button>
              </form>
              <form action={reorderHomeSectionAction}>
                <input type="hidden" name="currentKey" value={section.key} />
                <input type="hidden" name="currentOrder" value={section.order} />
                <input type="hidden" name="neighborKey" value={sections[i + 1]?.key} />
                <input type="hidden" name="neighborOrder" value={sections[i + 1]?.order} />
                <button type="submit" disabled={i === sections.length - 1} className="focus-ring disabled:opacity-30">
                  ↓ mover para baixo
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
