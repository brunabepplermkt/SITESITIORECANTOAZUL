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
- Build de produção (`npm run build`) e lint (`npx eslint .`) passando sem erros.
- Primeiro commit e push para `origin/main`.

## Em andamento / próximos passos

- Modelagem e migrations do Supabase (tabelas: `site_settings`, `accommodations`,
  `accommodation_images`, `experiences`, `faqs`, `policies`) com RLS.
- Painel `/admin` com autenticação Supabase (e-mail/senha) para edição de conteúdo.
- Upload de imagens via Supabase Storage com drag-and-drop e reordenação.
- Conectar páginas públicas ao Supabase (leitura em tempo de requisição, com fallback
  para o conteúdo seed quando as variáveis de ambiente não estiverem configuradas).
- Testes manuais de responsividade em 375/390/430/768/1440px.
- Revisão visual em navegador (Playwright/Chromium local).

## Decisões técnicas

- Next.js App Router + Server Components por padrão; formulários do admin serão
  Client Components com Server Actions.
- Imagens locais de placeholder em SVG são renderizadas via `<img>` (componente
  `Photo`), evitando a otimização de SVG do `next/image`; fotos reais (Supabase
  Storage/remotas) usam `next/image`.
- Botão "Reservar" aponta para uma URL configurável (`siteSettings.defaultReserveUrl`),
  preparada para futura substituição pelo motor de reservas do Zeloa — sem acoplar o
  site ao PMS agora.
- RLS do Supabase: leitura pública (anon) liberada; escrita restrita a usuários
  autenticados (proprietário via painel `/admin`).

## Pendências que dependem do proprietário

- Fotografias oficiais das acomodações e do sítio (placeholders SVG em uso).
- Domínio definitivo e configuração de DNS.
- Criação do projeto Supabase (URL, anon key, service role key) e de um usuário
  administrador para o painel `/admin`.
- Textos definitivos (a Home e as páginas usam conteúdo provisório coerente, sem
  Lorem Ipsum, mas sem inventar preços, prêmios ou avaliações).
- URL futura do motor de reservas do Zeloa (hoje aponta para um link configurável,
  ex.: WhatsApp).
- Endereço/localização exata do sítio para a página de Localização e mapa incorporado.

## Dependências externas

- Supabase (auth, banco, storage) — projeto próprio e isolado deste site.
- Google Fonts (Fraunces, Inter) via `next/font/google`.
