"use client";

import { useSearchParams } from "next/navigation";

export function AccessDeniedNotice() {
  const searchParams = useSearchParams();
  if (searchParams.get("erro") !== "acesso-negado") return null;

  return (
    <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      Esta conta não tem permissão para acessar o painel administrativo.
    </p>
  );
}
