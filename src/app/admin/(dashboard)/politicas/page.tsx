import { getPolicies } from "@/lib/data";
import { updatePoliciesAction } from "../../actions";

export default async function AdminPoliticasPage() {
  const content = await getPolicies();

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl text-bark">Políticas</h1>
      <p className="mt-1 text-sm text-bark/60">
        Texto exibido na página pública de Políticas. Use uma linha em branco para separar parágrafos.
      </p>

      <form action={updatePoliciesAction} className="mt-6 space-y-4">
        <textarea
          name="content"
          defaultValue={content}
          rows={16}
          className="focus-ring w-full rounded border border-black/10 px-3 py-2 text-sm"
        />
        <button type="submit" className="focus-ring rounded-full bg-forest px-6 py-2.5 text-sm text-cream">
          Salvar
        </button>
      </form>
    </div>
  );
}
