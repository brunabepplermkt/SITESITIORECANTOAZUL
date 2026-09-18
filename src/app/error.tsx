"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 text-center">
      <h1 className="font-serif text-2xl text-bark">Algo não saiu como esperado</h1>
      <p className="mt-3 text-sm text-bark/70">
        Tente novamente em instantes. Se o problema continuar, entre em contato conosco.
      </p>
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
