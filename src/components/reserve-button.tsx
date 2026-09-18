import Link from "next/link";

export function ReserveButton({
  href,
  target = "_blank",
  className = "",
  children = "Reservar",
}: {
  href: string;
  target?: "_self" | "_blank";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={`focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-8 py-3.5 text-[0.95rem] font-medium tracking-wide text-cream transition-opacity hover:opacity-90 ${className}`}
    >
      {children}
    </Link>
  );
}

type SecondaryCtaProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  variant?: "outline" | "link";
  external?: boolean;
};

/**
 * Ação secundária: peso visual claramente abaixo do ReserveButton. "outline"
 * para contextos de alto contraste (sobre foto/hero); "link" para o uso
 * mais comum, um texto sublinhado dentro do fluxo do conteúdo.
 */
export function SecondaryCta({
  href,
  className = "",
  children,
  variant = "link",
  external = false,
}: SecondaryCtaProps) {
  if (variant === "outline") {
    return (
      <Link
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-current/40 px-7 py-3.5 text-[0.95rem] transition-colors ${className}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`focus-ring inline-flex min-h-11 items-center rounded text-sm underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current ${className}`}
    >
      {children}
    </Link>
  );
}
