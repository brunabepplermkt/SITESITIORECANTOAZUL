import Link from "next/link";

export function ReserveButton({
  href,
  className = "",
  children = "Reservar",
}: {
  href: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`focus-ring inline-flex items-center justify-center rounded-full bg-forest px-7 py-3.5 text-sm text-cream transition-opacity hover:opacity-90 ${className}`}
    >
      {children}
    </Link>
  );
}
