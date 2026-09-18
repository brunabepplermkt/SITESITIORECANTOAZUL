import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/**
 * Cliente para leitura pública (site institucional): usa apenas a chave
 * anônima, sem tocar em cookies()/sessão. Mantém as páginas públicas
 * estáticas/ISR (revalidadas sob demanda pelas Server Actions do admin) em
 * vez de forçar renderização dinâmica em toda requisição só por ler dados
 * que qualquer visitante já pode ver (RLS de leitura é pública).
 *
 * Nunca usar este cliente para escrita ou para nada que dependa da sessão
 * do usuário — para isso, use `@/lib/supabase/server` (aware de cookies).
 */
export function createPublicClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase não está configurado. Preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return createSupabaseClient(env.url, env.anonKey, {
    auth: { persistSession: false },
  });
}
