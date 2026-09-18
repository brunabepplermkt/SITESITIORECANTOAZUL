"use client";

import { useRef, useState } from "react";
import type { PageBlock } from "@/lib/types";
import {
  addImageBlockAction,
  addTextBlockAction,
  deleteBlockAction,
  reorderBlockAction,
  updateTextBlockAction,
} from "../../../actions";

export function BlockManager({
  pageId,
  slug,
  blocks,
}: {
  pageId: string;
  slug: string;
  blocks: PageBlock[];
}) {
  const [dragOver, setDragOver] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  function handleDrop(e: React.DragEvent<HTMLFormElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      formRef.current?.requestSubmit();
    }
  }

  return (
    <div className="space-y-6">
      {sorted.map((block, i) => (
        <div key={block.id} className="rounded-sm border border-black/10 p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-clay">
            {block.type === "text" ? "Bloco de texto" : "Bloco de foto"}
          </p>

          {block.type === "text" ? (
            <form action={updateTextBlockAction} className="space-y-2">
              <input type="hidden" name="id" value={block.id} />
              <input type="hidden" name="slug" value={slug} />
              <textarea
                name="content"
                defaultValue={block.content}
                rows={4}
                className="focus-ring w-full rounded border border-black/10 px-3 py-2 text-sm"
              />
              <button type="submit" className="focus-ring rounded-full bg-forest px-4 py-1.5 text-xs text-cream">
                Salvar texto
              </button>
            </form>
          ) : (
            <div className="space-y-1">
              <div className="relative aspect-[16/10] w-full max-w-xs overflow-hidden rounded-sm border border-black/10 bg-stone/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.imageUrl} alt={block.imageAlt} className="h-full w-full object-cover" />
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center gap-4 text-xs text-bark/60">
            <form action={reorderBlockAction}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="currentId" value={block.id} />
              <input type="hidden" name="currentOrder" value={block.order} />
              <input type="hidden" name="neighborId" value={sorted[i - 1]?.id} />
              <input type="hidden" name="neighborOrder" value={sorted[i - 1]?.order} />
              <button type="submit" disabled={i === 0} className="focus-ring disabled:opacity-30">
                ↑ mover para cima
              </button>
            </form>
            <form action={reorderBlockAction}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="currentId" value={block.id} />
              <input type="hidden" name="currentOrder" value={block.order} />
              <input type="hidden" name="neighborId" value={sorted[i + 1]?.id} />
              <input type="hidden" name="neighborOrder" value={sorted[i + 1]?.order} />
              <button type="submit" disabled={i === sorted.length - 1} className="focus-ring disabled:opacity-30">
                ↓ mover para baixo
              </button>
            </form>
            <form action={deleteBlockAction}>
              <input type="hidden" name="id" value={block.id} />
              <input type="hidden" name="slug" value={slug} />
              <button type="submit" className="focus-ring text-red-700">
                excluir bloco
              </button>
            </form>
          </div>
        </div>
      ))}

      {sorted.length === 0 && <p className="text-sm text-bark/60">Nenhum bloco ainda.</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <form action={addTextBlockAction} className="rounded-sm border border-dashed border-black/20 p-4">
          <input type="hidden" name="pageId" value={pageId} />
          <input type="hidden" name="slug" value={slug} />
          <p className="text-sm text-bark/70">Adicionar bloco de texto</p>
          <textarea
            name="content"
            required
            rows={3}
            placeholder="Escreva o texto deste bloco..."
            className="focus-ring mt-2 w-full rounded border border-black/10 px-3 py-2 text-sm"
          />
          <button type="submit" className="focus-ring mt-2 rounded-full bg-forest px-4 py-1.5 text-xs text-cream">
            Adicionar texto
          </button>
        </form>

        <form
          ref={formRef}
          action={addImageBlockAction}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`rounded-sm border-2 border-dashed p-4 text-center transition-colors ${
            dragOver ? "border-clay bg-sand/30" : "border-black/20"
          }`}
        >
          <input type="hidden" name="pageId" value={pageId} />
          <input type="hidden" name="slug" value={slug} />
          <p className="text-sm text-bark/70">Arraste uma foto aqui ou</p>
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            accept="image/*"
            required
            className="mx-auto mt-2 block text-sm"
          />
          <input
            type="text"
            name="alt"
            placeholder="Texto alternativo da foto"
            className="focus-ring mx-auto mt-2 block w-full rounded border border-black/10 px-3 py-1.5 text-sm"
          />
          <button type="submit" className="focus-ring mt-2 rounded-full bg-forest px-4 py-1.5 text-xs text-cream">
            Adicionar foto
          </button>
        </form>
      </div>
    </div>
  );
}
