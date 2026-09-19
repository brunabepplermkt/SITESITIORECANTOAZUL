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

  // Estar autenticado no Supabase não é suficiente: só quem está cadastrado
  // em `admin_users` pode usar o painel. RLS já bloqueia qualquer escrita de
  // um usuário autenticado não-admin, mas sem essa checagem aqui a pessoa
  // ainda entraria no /admin e veria (sem conseguir salvar) telas que não
  // deveriam nem abrir para ela. Verificado uma única vez por requisição via
  // RPC `is_admin()` (mesma função usada pelas policies).
  if (isAdminRoute && user) {
    let isAdmin = false;
    try {
      const { data } = await supabase.rpc("is_admin");
      isAdmin = data === true;
    } catch {
      isAdmin = false;
    }

    if (!isAdmin) {
      // Encerra a sessão desse usuário não autorizado antes de mandá-lo para
      // o login: a próxima requisição chega sem `user`, cai no primeiro
      // `if` acima e vai para /admin/login normalmente — nunca de volta para
      // esta checagem, então não há loop de redirect.
      await supabase.auth.signOut();
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("erro", "acesso-negado");
      return NextResponse.redirect(url);
    }

    if (isLoginRoute) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
