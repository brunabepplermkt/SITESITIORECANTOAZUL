"use client";

import { useRef, useState } from "react";
import type { ImageAsset } from "@/lib/types";
import {
  addAccommodationImageAction,
  deleteAccommodationImageAction,
  reorderAccommodationImageAction,
} from "../../../actions";

export function ImageManager({ slug, images }: { slug: string; images: ImageAsset[] }) {
  const [dragOver, setDragOver] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const sorted = [...images].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {sorted.map((img, i) => (
          <div key={img.id} className="space-y-1">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-black/10 bg-stone/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
            </div>
            <div className="flex items-center justify-between gap-1 text-xs">
              <form action={reorderAccommodationImageAction}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="currentId" value={img.id} />
                <input type="hidden" name="currentOrder" value={img.order} />
                <input type="hidden" name="neighborId" value={sorted[i - 1]?.id} />
                <input type="hidden" name="neighborOrder" value={sorted[i - 1]?.order} />
                <button type="submit" disabled={i === 0} className="focus-ring px-1 text-bark/60 disabled:opacity-30">
                  ↑
                </button>
              </form>
              <form action={reorderAccommodationImageAction}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="currentId" value={img.id} />
                <input type="hidden" name="currentOrder" value={img.order} />
                <input type="hidden" name="neighborId" value={sorted[i + 1]?.id} />
                <input type="hidden" name="neighborOrder" value={sorted[i + 1]?.order} />
                <button
                  type="submit"
                  disabled={i === sorted.length - 1}
                  className="focus-ring px-1 text-bark/60 disabled:opacity-30"
                >
                  ↓
                </button>
              </form>
              <form action={deleteAccommodationImageAction}>
                <input type="hidden" name="id" value={img.id} />
                <input type="hidden" name="slug" value={slug} />
                <button type="submit" className="focus-ring px-1 text-red-700">
                  excluir
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <form
        ref={formRef}
        action={addAccommodationImageAction}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-sm border-2 border-dashed p-6 text-center text-sm transition-colors ${
          dragOver ? "border-clay bg-sand/30" : "border-black/15"
        }`}
      >
        <input type="hidden" name="slug" value={slug} />
        <p className="text-bark/70">Arraste uma foto aqui ou</p>
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
          placeholder="Texto alternativo (descrição da foto)"
          className="focus-ring mx-auto mt-3 block w-full max-w-xs rounded border border-black/10 px-3 py-1.5 text-sm"
        />
        <button type="submit" className="focus-ring mt-3 rounded-full bg-forest px-5 py-2 text-sm text-cream">
          Enviar foto
        </button>
      </form>
    </div>
  );
}
