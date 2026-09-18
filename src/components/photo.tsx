import Image from "next/image";

type PhotoProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Wrapper de imagem: usa next/image para fotos reais e um <img> simples
 * para os placeholders SVG locais (evita a otimização de SVG do Next,
 * desnecessária para arte vetorial estática).
 */
export function Photo({ src, alt, className, sizes, priority }: PhotoProps) {
  if (src.endsWith(".svg")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} loading={priority ? "eager" : "lazy"} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? "100vw"}
      className={className}
      priority={priority}
    />
  );
}
