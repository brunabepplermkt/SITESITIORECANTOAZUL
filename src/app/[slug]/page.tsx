import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Photo } from "@/components/photo";
import { getPage } from "@/lib/data";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return { title: page.title };
}

export default async function CmsPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <h1 className="text-center font-serif text-4xl text-bark sm:text-5xl">{page.title}</h1>

      <div className="mt-14 space-y-10">
        {page.blocks.map((block) =>
          block.type === "text" ? (
            <div key={block.id} className="space-y-4 leading-relaxed text-bark/80">
              {block.content.split(/\n{2,}/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <div key={block.id} className="relative aspect-[16/10] overflow-hidden rounded-sm bg-stone/30">
              <Photo src={block.imageUrl} alt={block.imageAlt} className="object-cover" sizes="(min-width: 768px) 768px, 100vw" />
            </div>
          ),
        )}
      </div>
    </div>
  );
}
