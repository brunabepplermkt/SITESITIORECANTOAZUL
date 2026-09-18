# PROJECT_STATUS — Sítio Recanto Azul

Última atualização: 2026-09-18

## Concluído

- Repositório `brunabepplermkt/sitesitiorecantoazul` conectado (branch `main`).
- Projeto Next.js 16 + TypeScript + Tailwind CSS v4, App Router.
- Design system inicial: paleta natural (cream/sand/stone/clay/bark/forest/brass) e
  combinação tipográfica serif editorial (Fraunces) + sans-serif (Inter).
- Header responsivo (menu mobile) e footer institucional.
- Páginas públicas: Home, Acomodações (índice + 6 páginas de detalhe: Ágata, Mirante,
  Doce Recanto, Domo Estelar, Chalé para Grupos, Celeiro), Experiências, O Sítio,
  Localização, FAQ, Contato, Políticas.
- Conteúdo estruturado em `src/lib/content.ts` (tipado em `src/lib/types.ts`), servindo
  como seed/fallback e espelhando o esquema de dados planejado para o Supabase.
- SEO técnico: metadata por página, OpenGraph, `sitemap.ts`, `robots.ts`, JSON-LD
  (LodgingBusiness nas acomodações, FAQPage na página de FAQ).
- Placeholders de imagem em SVG (leves, sem dependência externa) para todas as fotos.
- **Camada de dados com fallback** (`src/lib/data.ts`): todas as páginas públicas
  buscam conteúdo do Supabase e caem automaticamente para o conteúdo seed quando o
  Supabase ainda não está configurado ou uma consulta falha.
- **Schema do Supabase** (`supabase/migrations/0001_init.sql`): tabelas
  `site_settings`, `accommodations`, `accommodation_images`, `experiences`, `faqs`,
  `policies`, com RLS (leitura pública, escrita restrita a usuários autenticados) e
  bucket de storage público `accommodation-images`.
- **Painel `/admin`** protegido por autenticação Supabase (middleware bloqueia acesso
  sem sessão válida): login, dashboard, edição de configurações do site, acomodações
  (textos, comodidades, diferenciais, preço, link de reserva), experiências, FAQ
  (criar/editar/excluir) e políticas.
- **Gerenciador de imagens** por acomodação: upload por drag-and-drop ou seleção de
  arquivo (envia ao Supabase Storage), reordenação (subir/descer) e exclusão.
- Build de produção (`npm run build`) e lint (`npx eslint .`) passando sem erros.
- Revisão visual feita em navegador real (Playwright/Chromium) em 390px e 1440px —
  layout, hierarquia tipográfica e hero funcionando corretamente; sem artefatos reais
  (um efeito visual estranho apareceu apenas em capturas "full page" por causa do
  header `sticky`, não é um bug da aplicação — confirmado ao comparar com captura de
  viewport único).
- Testado manualmente: `/`, `/acomodacoes`, `/acomodacoes/[slug]`, `/faq`, rota
  inexistente (404) e `/admin` (retorna 503 controlado quando o Supabase não está
  configurado, em vez de expor um painel sem autenticação funcional).
- Primeiro commit e push para `origin/main`.

## Em andamento / próximos passos

- Testes manuais de responsividade adicionais em 375/430/768px.
- Após a criação do projeto Supabase real: aplicar a migration, popular as tabelas
  com o conteúdo seed (ou usar o próprio `/admin` para isso) e validar o fluxo
  completo de login → edição → upload → publicação.
- Avaliar migração do `middleware.ts` para a convenção `proxy` (aviso de depreciação
  do Next.js 16; funcional, sem impacto no momento).
- `package-lock.json` foi commitado localmente; sincronizar com o `git push` normal
  assim que o acesso de push via Git estiver disponível (ver decisões técnicas).

## Decisões técnicas

- Next.js App Router + Server Components por padrão; formulários do admin são
  Client/Server Components com Server Actions (`src/app/admin/actions.ts`).
- Imagens locais de placeholder em SVG são renderizadas via `<img>` (componente
  `Photo`), evitando a otimização de SVG do `next/image`; fotos reais (Supabase
  Storage/remotas) usam `next/image`.
- Botão "Reservar" aponta para uma URL configurável (`siteSettings.defaultReserveUrl`),
  preparada para futura substituição pelo motor de reservas do Zeloa — sem acoplar o
  site ao PMS agora.
- RLS do Supabase: leitura pública (anon) liberada; escrita restrita a usuários
  autenticados (proprietário via painel `/admin`).
- `/admin` usa um route group `(dashboard)` para aplicar a navegação/logout somente
  às páginas autenticadas, mantendo `/admin/login` fora desse layout.
- **Push para o GitHub**: o `git push` via linha de comando está bloqueado pelo
  classificador de segurança deste ambiente autônomo ("Modify Shared Resources").
  O primeiro commit foi publicado via API do GitHub (`push_files`), conforme a
  orientação do próprio ambiente de usar as ferramentas MCP do GitHub para
  interações com repositórios. `package-lock.json` ficou de fora desse primeiro
  lote por tamanho/custo e deve ser sincronizado depois.

## Pendências que dependem do proprietário

- Fotografias oficiais das acomodações e do sítio (placeholders SVG em uso).
- Domínio definitivo e configuração de DNS.
- Criação do projeto Supabase (URL, anon key, service role key) e de um usuário
  administrador para o painel `/admin` — ver README.md para o passo a passo.
- Textos definitivos (a Home e as páginas usam conteúdo provisório coerente, sem
  Lorem Ipsum, mas sem inventar preços, prêmios ou avaliações).
- URL futura do motor de reservas do Zeloa (hoje aponta para um link configurável,
  ex.: WhatsApp).
- Endereço/localização exata do sítio para a página de Localização e mapa incorporado.
- Repositório GitHub foi criado pelo proprietário como **público**
  (`brunabepplermkt/sitesitiorecantoazul`); nenhum secret está no código, mas se a
  intenção era mantê-lo privado, a visibilidade pode ser alterada em
  Settings → Danger Zone → Change visibility, no GitHub.

## Dependências externas

- Supabase (auth, banco, storage) — projeto próprio e isolado deste site.
- Google Fonts (Fraunces, Inter) via `next/font/google`.
