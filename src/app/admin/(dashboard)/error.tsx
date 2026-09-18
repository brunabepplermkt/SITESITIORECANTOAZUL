"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="font-serif text-2xl text-bark">Não foi possível salvar</h1>
      <p className="mt-3 text-sm text-bark/70">{error.message || "Ocorreu um erro inesperado."}</p>
      <button
        type="button"
        onClick={reset}
        className="focus-ring mt-6 rounded-full bg-forest px-6 py-2.5 text-sm text-cream"
      >
        Tentar novamente
      </button>
    </div>
  );
}
