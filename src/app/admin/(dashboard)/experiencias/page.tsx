import { getExperiences } from "@/lib/data";
import { updateExperienceAction } from "../../actions";

export default async function AdminExperienciasPage() {
  const experiences = await getExperiences();

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl text-bark">Experiências</h1>
      <p className="mt-1 text-sm text-bark/60">
        Para adicionar uma nova experiência, defina um slug ainda não existente abaixo.
      </p>

      <div className="mt-6 space-y-8">
        {experiences.map((exp, i) => (
          <form
            key={exp.slug}
            action={updateExperienceAction}
            className="space-y-3 rounded-sm border border-black/10 p-5"
          >
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
            <button type="submit" className="focus-ring rounded-full bg-forest px-5 py-2 text-sm text-cream">
              Salvar
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
