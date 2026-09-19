"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AccessDeniedNotice } from "./access-denied-notice";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("E-mail ou senha inválidos.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao Supabase. Verifique a configuração.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-20">
      <h1 className="font-serif text-2xl text-bark">Painel administrativo</h1>
      <p className="mt-2 text-sm text-bark/70">Entre com sua conta para editar o site.</p>

      <Suspense fallback={null}>
        <AccessDeniedNotice />
      </Suspense>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm text-bark/80" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus-ring mt-1 w-full rounded border border-black/10 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-bark/80" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-ring mt-1 w-full rounded border border-black/10 bg-white px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="focus-ring w-full rounded-full bg-forest px-5 py-2.5 text-sm text-cream disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
