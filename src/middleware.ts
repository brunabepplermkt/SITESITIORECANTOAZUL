import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const env = getSupabaseEnv();
  if (!env) {
    // Supabase ainda não configurado: bloqueia o acesso ao /admin em vez de
    // expor um painel sem autenticação funcional.
    if (request.nextUrl.pathname.startsWith("/admin")) {
      const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8" />
<title>Painel administrativo</title>
<style>
  body { font-family: system-ui, sans-serif; background: #f8f4ec; color: #262220;
    display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0; }
  main { max-width: 28rem; padding: 2rem; text-align: center; }
  h1 { font-size: 1.25rem; margin-bottom: .75rem; }
  p { color: #4a4034b3; font-size: .9rem; line-height: 1.5; }
</style></head>
<body><main>
  <h1>Painel administrativo ainda não configurado</h1>
  <p>O Supabase deste site ainda não foi conectado. Configure as variáveis de
  ambiente do Supabase para habilitar o login e a edição de conteúdo.</p>
</main></body></html>`;
      return new NextResponse(html, {
        status: 503,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
    return response;
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const isLoginRoute = request.nextUrl.pathname === "/admin/login";
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // Supabase inacessível (URL/credenciais erradas, rede fora do ar etc.):
    // trata como não autenticado em vez de derrubar a requisição com 500.
    user = null;
  }

  if (isAdminRoute && !isLoginRoute && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
