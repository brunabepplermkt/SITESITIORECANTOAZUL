import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { deletePageAction, updatePageMetaAction } from "../../../actions";
import { BlockManager } from "./block-manager";

type BlockRow = {
  id: string;
  type: "text" | "image";
  content: string | null;
  image_url: string | null;
  image_alt: string | null;
  order_index: number;
};

export default async function AdminPaginaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase.from("pages").select("*").eq("slug", slug).maybeSingle();
  if (!page) notFound();

  const { data: blockRows } = await supabase
    .from("page_blocks")
    .select("*")
    .eq("page_id", page.id)
    .order("order_index", { ascending: true });

  const blocks = ((blockRows ?? []) as BlockRow[]).map((b) =>
    b.type === "image"
      ? { id: b.id, type: "image" as const, imageUrl: b.image_url ?? "", imageAlt: b.image_alt ?? "", order: b.order_index }
      : { id: b.id, type: "text" as const, content: b.content ?? "", order: b.order_index },
  );

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl text-bark">{page.title}</h1>
      <p className="mt-1 text-sm text-bark/60">Endereço público: /{page.slug}</p>

      <form action={updatePageMetaAction} className="mt-6 space-y-4">
        <input type="hidden" name="slug" value={page.slug} />

        <div>
          <label className="block text-sm text-bark/80">Título</label>
          <input
            name="title"
            defaultValue={page.title}
            required
            className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-bark/80">Nome no menu (opcional, usa o título se vazio)</label>
          <input
            name="navLabel"
            defaultValue={page.nav_label ?? ""}
            className="focus-ring mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-bark/80">
          <input type="checkbox" name="showInNav" defaultChecked={page.show_in_nav} />
          Mostrar no menu do site
        </label>

        <label className="flex items-center gap-2 text-sm text-bark/80">
          <input type="checkbox" name="published" defaultChecked={page.published} />
          Publicada (visível para visitantes)
        </label>

        <button type="submit" className="focus-ring rounded-full bg-forest px-6 py-2.5 text-sm text-cream">
          Salvar
        </button>
      </form>

      <div className="mt-10">
        <h2 className="font-serif text-xl text-bark">Conteúdo</h2>
        <p className="mt-1 text-sm text-bark/60">
          Adicione blocos de texto e foto na ordem que quiser que apareçam na página.
        </p>
        <div className="mt-4">
          <BlockManager pageId={page.id} slug={page.slug} blocks={blocks} />
        </div>
      </div>

      <div className="mt-14 border-t border-black/10 pt-6">
        <form action={deletePageAction}>
          <input type="hidden" name="slug" value={page.slug} />
          <ConfirmSubmitButton
            confirmMessage={`Excluir a página "${page.title}" definitivamente? Isso também remove todo o conteúdo dela. Esta ação não pode ser desfeita.`}
            className="focus-ring text-sm text-red-700 underline"
          >
            Excluir esta página
          </ConfirmSubmitButton>
        </form>
      </div>
    </div>
  );
}
