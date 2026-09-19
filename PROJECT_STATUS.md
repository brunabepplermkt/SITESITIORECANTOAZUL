# PROJECT_STATUS — Sítio Recanto Azul

Última atualização: 2026-09-19 (rodada técnica de correção e estabilização —
fazer o CMS controlar de verdade o site público)

Este documento separa **CORRIGIDO** (bug real encontrado e resolvido, com
código + teste local), **VALIDADO LOCAL** (build/lint/tsc/navegador local),
**VALIDADO SUPABASE REAL** e **VALIDADO VERCEL** (nenhum item nessas duas
seções nesta rodada — ver por quê logo abaixo), **PENDENTE**, **AGUARDANDO
ZELOA** e **AÇÃO DA PROPRIETÁRIA**. Corrigido = implementado + testado; onde
só foi possível implementar (sem testar contra o Supabase real ou a Vercel),
o item fica em PENDENTE, nunca em CORRIGIDO ou VALIDADO.

**Por que nada está em "VALIDADO SUPABASE REAL"/"VALIDADO VERCEL" nesta
rodada:** esta sandbox não tem acesso de rede a domínios externos (Supabase,
Vercel) — só GitHub (via git) e o registro do npm. Toda a auditoria desta
rodada foi feita lendo o código e as migrations, e toda a validação foi
feita localmente (`npm run start` sem Supabase real conectado, o que testa
o fallback seed, mas não RLS/dados reais). Isso é uma limitação conhecida e
recorrente deste ambiente, já registrada em rodadas anteriores.

---

## 1) Achados confirmados (auditoria antes de corrigir)

1. **Home ignorava `home_sections.order_index`.** `/admin/home` deixava
   reordenar, mas `src/app/page.tsx` renderizava os 7 blocos em uma
   sequência de JSX fixa — a reordenação salvava no banco mas não tinha
   nenhum efeito visual. Isso também significa que uma afirmação do
   `PROJECT_STATUS.md` de uma rodada anterior ("Home renderizada... na
   ordem esperada") estava tecnicamente certa só porque a ordem salva
   coincidia com a ordem fixa do código — nunca foi testado reordenar de
   fato, e por isso a rodada anterior não deveria ter implicado que a
   funcionalidade estava pronta.
2. **Acomodações em destaque na Home usavam uma lista fixa de slugs**
   (`ROMANTIC_SLUGS = ["agata", "mirante", "doce-recanto", "domo-estelar"]`)
   em vez de `featured_home`/`home_order`, apesar de o admin já salvar esses
   campos desde a migration 0004. Marcar/desmarcar destaque pelo painel não
   tinha nenhum efeito no site público.
3. **SEO editável não alimentava o `<head>` real.** `site_settings.seo_*` e
   `accommodations.seo_*`/`og_image_url` eram salvos, mas `RootLayout` usava
   um `export const metadata` estático (não podia ler o banco) e
   `generateMetadata` da acomodação ignorava os campos de SEO da própria
   acomodação.
4. **Fallback confundia "zero resultados" com "erro".** `getAccommodations`,
   `getExperiences`, `getFaqs` e `getHomeSections` caíam para o conteúdo
   seed sempre que `data.length === 0` — ou seja, despublicar todo o
   conteúdo de um tipo fazia os dados antigos (seed) reaparecerem em vez de
   a seção ficar vazia.
5. **RLS de leitura pública sem filtro de `published`.** `accommodations`,
   `experiences` e `faqs` tinham `create policy ... for select using (true)`
   desde a migration 0001 — a coluna `published` chegou só na 0004, e a
   policy nunca foi atualizada. Um visitante conseguia ler qualquer
   registro despublicado diretamente via REST público
   (`/rest/v1/accommodations?select=*`), mesmo que a UI escondesse.
6. **`/admin` só verificava autenticação, não `admin_users`.** Um usuário
   Supabase autenticado mas não cadastrado em `admin_users` conseguia abrir
   todas as telas do painel (sem conseguir salvar nada, porque o RLS já
   bloqueava a escrita) — mas via telas que não deveriam nem abrir para ele.
7. **`is_admin()` exigia EXECUTE de `anon` sem necessidade real.** Como as
   policies de escrita ("admin write ...") valiam para todos os papéis por
   padrão, até uma leitura pública de visitante avaliava `is_admin()`,
   então o papel `anon` precisava de EXECUTE nessa função só para não
   quebrar leituras — superfície maior do que o necessário.
8. **`isBookingActive()` não verificava se havia uma URL utilizável.**
   Bastava `booking_provider !== "none"` para o provider ser considerado
   "ativo", então botões podiam renderizar `href="#"` se `bookingBaseUrl` e
   `defaultReserveUrl` estivessem vazios, ou se o modo fosse `widget` sem
   `bookingWidgetEmbedUrl`.
9. **Opções de busca/widget no admin não faziam nada no site público.**
   `booking_show_search_home`, `booking_show_search_accommodation` e o modo
   `widget` existiam como configuração, mas não havia nenhum componente
   de busca nem iframe de widget implementado.
10. **Exclusão de foto deixava o arquivo órfão no Storage.** O registro em
    `accommodation_images`/`page_blocks` era apagado, mas o arquivo
    correspondente no bucket `accommodation-images` nunca era removido.
11. **Reordenação fazia dois `UPDATE`s independentes** (fotos de
    acomodação, FAQ, seções da Home, avaliações, blocos de página) — se o
    segundo falhasse, duas linhas podiam ficar com o mesmo `order_index`.
12. **`trackEvent()` existia mas nunca era chamado** em nenhum componente.
13. **`google_analytics_id`/`meta_pixel_id` eram salvos mas não carregavam
    nada** — nenhum script de GA/Meta Pixel era injetado.
14. **`npx tsc --noEmit` falhava em clone limpo** (`Cannot find name
    'LayoutProps'`) porque `src/app/layout.tsx` usava um tipo gerado pelo
    Next só depois de `next build`. Confirmado reproduzindo com `.next`
    removido antes de rodar o typecheck.
15. **`lightningcss.darwin-arm64.node` ausente localmente (macOS ARM)**:
    investigado — o `package-lock.json` já lista corretamente
    `lightningcss-darwin-arm64` como `optionalDependency`; não há defeito
    no lockfile/`package.json`. É consistente com um problema de ambiente
    local (cache do npm, `node_modules` instalado/copiado de outra
    plataforma, ou uma flag tipo `omit=optional` no `.npmrc` da máquina) —
    não mexemos em nada aqui para não arriscar o build Linux da Vercel.

## 2) Corrigido nesta rodada (implementado + testado localmente)

- **Home respeita `order_index` de verdade.** `src/app/page.tsx` agora
  itera a lista já ordenada retornada por `getHomeSections()` e renderiza
  cada bloco por uma função de acordo com sua `key` — a lista de chaves
  continua fixa (não virou um page-builder), só a ordem entre elas passou a
  ser dinâmica de fato. **Regra de segurança para o Hero:** o Hero sempre
  abre a Home, independente do `order_index` salvo — `orderHomeSections()`
  em `lib/data.ts` força essa seção para o início sempre que estiver
  visível, e `/admin/home` trava as setas de mover para essa linha (a
  reordenação nunca finge funcionar quando na prática seria ignorada).
  Testado localmente: build renderiza os 7 blocos na ordem correta com o
  Hero sempre primeiro.
- **Destaque na Home usa `published`+`featured_home`+`home_order`.**
  Substituída a lista `ROMANTIC_SLUGS`; sem nenhuma acomodação marcada como
  destaque, a seção de Acomodações inteira desaparece da Home (mesmo padrão
  já usado pela seção de Avaliações) em vez de reaparecer um fallback
  silencioso com as 4 antigas. Testado localmente com o seed (que já marca
  as 4 românticas como destaque) — resultado idêntico ao comportamento
  anterior, confirmando que não houve regressão visual.
- **SEO real.** `RootLayout` agora usa `generateMetadata()` (assíncrono,
  lê `site_settings`) com fallback para o texto que já existia;
  `generateMetadata` da acomodação usa `seo_title`/`seo_description`/
  `og_image_url` com fallback para nome/descrição curta/foto de capa.
  `metadataBase`, `sitemap.xml` e `robots.txt` não foram tocados.
- **Fallback corrigido em `getAccommodations`, `getExperiences`, `getFaqs`
  e `getHomeSections`.** Só cai para o seed em erro real (`error` da
  consulta) — uma consulta bem-sucedida com zero linhas agora retorna lista
  vazia de verdade. Testado localmente: com o seed simulando "zero
  publicados" (filtro `published`), a função retorna `[]`.
- **RLS: leitura pública de `accommodations`/`experiences`/`faqs`
  restrita a `published = true`** (migration `0005`, replicando o padrão
  já usado em `reviews`/`pages` desde o início). Quem tem `is_admin()`
  continua lendo tudo via a policy "admin write ...".
- **`/admin` verifica `admin_users`, não só autenticação.**
  `src/middleware.ts` agora chama a RPC `is_admin()` para todo usuário
  autenticado tentando acessar `/admin/*`; se não for admin, encerra a
  sessão (`signOut`) e redireciona para `/admin/login?erro=acesso-negado`
  (mensagem exibida na tela de login). Sem loop: a próxima requisição já
  chega sem usuário e cai no fluxo normal de "não autenticado → login".
- **Superfície de `is_admin()` reduzida.** Todas as policies de
  administração (`admin write ...`/`admin manage ...`, 11 no total,
  incluindo o bucket de Storage) passam a valer só para o papel
  `authenticated` (`alter policy ... to authenticated`); o papel `anon`
  nunca mais avalia nem precisa de `EXECUTE` em `is_admin()` — revogado
  explicitamente. Login/administração continuam iguais (o papel
  `authenticated` mantém `EXECUTE`).
- **`isBookingActive()` exige uma URL utilizável de verdade** por modo
  (`link`/`zeloa`: `bookingBaseUrl` ou `defaultReserveUrl` válidos;
  `widget`: `bookingWidgetEmbedUrl` em https). Todos os botões "Reservar"
  do site (Home, header, footer, barra mobile, acomodação) já checavam
  `isBookingActive` antes de renderizar — nenhum ficou apontando para `#`.
- **`BookingSearch` implementado** (`src/components/booking-search.tsx`):
  check-in/check-out/adultos/crianças, usa só `getBookingHref`/
  `getBookingTarget` (nenhuma API de motor inventada). Aparece na Home
  quando `booking_show_search_home = true` e na página de acomodação
  quando `booking_show_search_accommodation = true`.
- **`BookingWidget` implementado** (`src/components/booking-widget.tsx`):
  `<iframe>` controlado, só quando `booking_provider = "widget"` e
  `booking_widget_embed_url` é https — `sandbox` restrito
  (`allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox`),
  sem HTML/JS arbitrário, responsivo. Renderizado na Home quando o motor é
  "widget".
- **Exclusão de foto remove o arquivo do Storage.** Novo helper
  `accommodationImageStoragePath()` em `actions.ts` só apaga do bucket
  quando a URL realmente pertence a `accommodation-images` deste projeto
  (placeholders locais e URLs externas nunca são tocados). Ordem: apaga o
  registro do banco primeiro (o que importa para o site) e só depois tenta
  o Storage — uma falha na remoção do arquivo vira um órfão inofensivo
  (logado), nunca um link quebrado no site.
- **Reordenação atômica.** Nova função `reorder_swap()` no banco (migration
  `0005`, `security invoker`, lista fixa de tabelas permitidas) faz os dois
  `UPDATE`s em uma única chamada — se a segunda parte falhar, a primeira é
  desfeita. Usada por fotos de acomodação, FAQ, seções da Home, avaliações
  e blocos de página (as 5 rotinas de reordenação do projeto).
- **Analytics instrumentado**: `booking_click` (todo `ReserveButton`,
  incluindo header/footer/barra mobile/Home/acomodação), `whatsapp_click`
  (botão de WhatsApp em Contato), `accommodation_view` (ao abrir uma página
  de acomodação), `review_interaction` (clique em um card de avaliação) e
  `booking_search` (envio do `BookingSearch`). Nenhum ID fictício.
- **Google Analytics/Meta Pixel carregam condicionalmente.** Novo
  `src/components/analytics-scripts.tsx`: só injeta o `gtag.js`/pixel do
  Meta quando o respectivo ID está preenchido em Configurações →
  Integrações; sem nenhum dos dois campos, nenhum script extra é carregado.
- **`npx tsc --noEmit` reproduzível em clone limpo.** `RootLayout` agora
  tipa `children` como `ReactNode` em vez de `LayoutProps<"/">`. Confirmado
  removendo `.next/` antes de rodar o typecheck.

## 3) Migrations criadas

- **`supabase/migrations/0005_security_and_cms_fixes.sql`** (nova nesta
  rodada): corrige a leitura pública de `accommodations`/`experiences`/
  `faqs` para `published = true`; restringe as 11 policies de administração
  a `to authenticated`; revoga `EXECUTE` de `is_admin()` do papel `anon`;
  cria a função `reorder_swap()`; adiciona índice em
  `reviews.accommodation_slug`. Revisada linha a linha para ser idempotente
  (`drop policy if exists` + `create policy`, `create or replace function`,
  `create index if not exists`, `alter policy` sem efeito colateral se
  repetida) e não-destrutiva (nenhum `drop table`, nenhum dado apagado,
  RLS nunca desativado).
- **`0001_init.sql`, `0002_reviews.sql`, `0003_pages.sql`,
  `0004_cms_expansion.sql`** (revisadas, não alteradas): confirmadas
  idempotentes (`create table/policy/index if not exists`,
  `on conflict do nothing`, `add column if not exists`) e não-destrutivas.
  Nenhuma foi editada — mudanças de banco desta rodada foram todas para a
  `0005` nova, conforme a regra do projeto de nunca reescrever histórico de
  migration já aplicada.

## 4) Validado no Supabase real

**Nenhum item.** Esta sandbox não tem acesso de rede ao Supabase — não foi
possível rodar as migrations, testar RLS contra o banco real, testar login
real, nem confirmar upload real. Tudo isso está listado em PENDENTE abaixo,
explicitamente como aguardando ação da proprietária com acesso ao Supabase
real.

## 5) Validado na Vercel

**Nenhum item.** Mesma limitação de rede — não foi possível abrir a URL
pública do site nem verificar o deploy publicado.

## 6) Resultado local

- `npx tsc --noEmit`: **sem erros** (incluindo com `.next/` removido antes,
  simulando um clone limpo).
- `npx eslint .`: **sem erros/avisos**.
- `npm run build`: **sucesso**, todas as rotas geradas (públicas estáticas,
  admin dinâmicas, `/acomodacoes/[slug]` com SSG para as acomodações do
  seed).
- Testes manuais via `npm run start` local (sem Supabase real conectado —
  testa o fallback seed, não o Supabase): `/`, `/faq`, `/acomodacoes`,
  `/acomodacoes/agata`, `/contato`, `/experiencias` e
  `/admin/login?erro=acesso-negado` retornam HTTP 200; Home renderiza os 7
  blocos com o Hero primeiro e as 4 acomodações destacadas + "Também
  disponíveis" com Chalé/Celeiro, igual ao comportamento anterior; FAQ
  mostra as 4 perguntas seed.
- Não existem testes automatizados (Jest/Playwright) configurados no
  projeto — não há suíte para rodar além do que já está listado acima.

## 7) Security/Performance Advisor

**Não executado.** Requer acesso ao painel do projeto Supabase real (fora
do alcance de rede desta sandbox). A migration `0005` já endereça
preventivamente os dois achados de Advisor mais prováveis, dado o que a
auditoria manual encontrou: `is_admin()` como `SECURITY DEFINER` exposta a
mais papéis do que o necessário, e a foreign key
`reviews.accommodation_slug` sem índice. Rodar o Advisor depois de aplicar
a `0005` para confirmar (e para decidir sobre qualquer outro achado, sem a
meta de "zerar todos os avisos a qualquer custo").

## 8) Pendente (implementado em código, aguardando Supabase real para validar)

- Rodar `0005_security_and_cms_fixes.sql` no SQL Editor do Supabase real
  (depois de confirmar que `0002`/`0003`/`0004` já foram aplicadas).
- Reordenar duas seções da Home em `/admin/home`, recarregar a Home e
  confirmar a nova ordem (com o Hero permanecendo primeiro).
- Marcar/desmarcar `featured_home` em uma acomodação e confirmar o efeito
  na Home.
- Despublicar uma FAQ e confirmar que ela some de `/faq`; despublicar todas
  e confirmar que as perguntas seed **não** reaparecem.
- Preencher SEO de uma acomodação e de `site_settings`, e conferir o HTML
  gerado (`<title>`, `<meta name="description">`, `og:image`).
- Testar um usuário Supabase autenticado mas **não** cadastrado em
  `admin_users`: deve ser redirecionado de `/admin` para
  `/admin/login?erro=acesso-negado` com a sessão encerrada.
- Confirmar via REST público (`curl` na Supabase URL, papel `anon`) que uma
  acomodação/experiência/FAQ despublicada não aparece mais na resposta.
- Confirmar que `anon` recebe erro de permissão ao chamar
  `/rest/v1/rpc/is_admin` diretamente.
- Excluir uma foto real de uma acomodação e confirmar a remoção tanto do
  banco quanto do bucket `accommodation-images` no Storage.
- Testar `BookingSearch` (Home e acomodação) com `booking_show_search_*`
  ativado, e `BookingWidget` com `booking_provider = "widget"` e uma URL
  https real.
- Rodar o Security Advisor e o Performance Advisor do Supabase depois de
  aplicar a `0005`.
- Abrir o site publicado na Vercel e repetir a checagem visual básica
  (Home, acomodação, admin) — não foi possível nesta sandbox.

## 9) Aguardando Zeloa

- Ativar `booking_provider = "zeloa"`: hoje tratado exatamente como `link`
  (precisa de `bookingBaseUrl` válido) até a integração real existir —
  nenhuma URL do Zeloa foi inventada.
- Formato final dos parâmetros de busca (`checkin`/`checkout`/`adultos`/
  `criancas`/`acomodacao`) — placeholder de arquitetura em
  `getBookingHref()`, a ajustar quando o Zeloa publicar sua API real.
- Disponibilidade/tarifas ao vivo (calendário real) — nenhuma
  disponibilidade é armazenada no banco do site, nem falsa nem real.
- Domínio `reservas.sitiorecantoazul.com.br` (fora deste repositório).

## 10) Ação da proprietária

- Aplicar a migration `0005` no Supabase real (SQL Editor), depois de
  confirmar que as anteriores já foram aplicadas.
- Repetir os testes de segurança reais listados em "Pendente" acima
  (anon/autenticado não-admin/admin) — sem isso, a correção das policies
  RLS não pode ser considerada validada, só implementada.
- Configurar o motor de reservas real (link do WhatsApp, "Mobile Calendar"
  ou widget) em `/admin/configuracoes/reservas`.
- Preencher os campos de SEO (`site_settings` e por acomodação) para os
  novos metadados terem efeito real nos buscadores.
- Preencher IDs de Google Analytics/Meta Pixel, se/quando existirem.

## 11) Futuro / não implementar agora

- Migrar `src/middleware.ts` para a convenção `proxy` do Next.js 16.
  Avaliado nesta rodada e **adiado por segurança**: o arquivo acabou de
  ganhar a lógica nova de verificação de `admin_users` (achado #7); migrar
  a convenção ao mesmo tempo aumentaria o risco de uma regressão sutil no
  fluxo de autenticação sem necessidade. Repetir o comportamento atual
  (refresh de sessão, proteção de `/admin`, redirect de login, bloqueio sem
  Supabase configurado) é o critério de aceite quando essa migração for
  feita em uma rodada dedicada.
- Biblioteca de mídia cruzada única (hoje: um gerenciador de fotos por
  acomodação/página).
- Modo de edição visual inline sobre o site publicado.
- Rascunho/publicação como dois estados separados por campo.
- Consulta direta à API do Zeloa para disponibilidade/preço ao vivo.
- Calendário de disponibilidade real (depende do motor/PMS).
- Limpeza de arquivos órfãos no Storage ao excluir uma acomodação inteira
  (a exclusão de uma foto individual já limpa o Storage; excluir a
  acomodação inteira ainda só apaga as linhas do banco — a cascata de FK já
  limpa `accommodation_images`, mas não os arquivos no bucket). Não pedido
  explicitamente nesta rodada; registrado para não ficar escondido.
- Página 404 com identidade visual própria (hoje usa a padrão do Next.js).

## Decisões técnicas (acumulado, corrigindo o que mudou nesta rodada)

- **Correção de uma decisão anterior:** uma rodada passada registrou
  "publicar/despublicar tratado como filtro na camada de leitura, não como
  mudança nas policies de SELECT do RLS". Essa decisão ficou incompleta —
  ela cobria a leitura da aplicação, mas deixava a leitura pública via REST
  direto sem filtro (achado #5 desta rodada). Agora ambas as camadas
  filtram por `published`: a policy de RLS (defesa real, no banco) e o
  filtro em `lib/data.ts` (evita uma query desnecessária quando já se sabe
  que só published importa).
- Seções da Home são um conjunto fixo de chaves (`HomeSectionKey`), nunca um
  page-builder livre — só conteúdo/visibilidade/ordem são editáveis, e o
  Hero tem posição fixa por regra de design (ver achado #1/correção).
- `BookingProvider`: funções puras (`lib/booking.ts`) consumidas por todo
  componente que precisa de um link/estado de reserva — nunca uma URL
  literal espalhada pelo código, e nunca "ativo" sem uma URL utilizável.
- RLS do Supabase: leitura pública restrita a conteúdo publicado; escrita
  restrita a e-mails cadastrados em `admin_users` via `is_admin()`,
  agora avaliada só pelo papel `authenticated`.
- Avaliações nunca têm fallback seed: sem Supabase configurado ou sem
  publicadas, a função retorna lista vazia e a seção não renderiza — nunca
  inventamos depoimento nem mostramos placeholder de "em breve".
- **Ambiente sem acesso a rede externa**: esta sandbox só alcança GitHub (via
  git) e o registro do npm; qualquer verificação em Supabase ou na URL
  pública do site (Vercel) precisa ser feita pela proprietária e reportada
  de volta.

## Dependências externas

- Supabase (auth, banco, storage) — projeto próprio: `ycaduuyjmsqvwxqsnrrd`.
- Vercel — deploy em `https://sitesitio-ashen.vercel.app`.
- Google Fonts (Fraunces, Inter) via `next/font/google`.
- Zeloa (motor de reservas) — integração futura, fora deste repositório.
