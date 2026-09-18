# PROJECT_STATUS — Sítio Recanto Azul

Última atualização: 2026-09-18 (rodada de refinamento mobile-first + avaliações)

Este documento separa o que está **confirmado por teste real** do que **parece
pronto mas ainda depende de algo externo**. Nada aqui foi marcado como
validado sem execução real de build, lint, type-check e navegador.

---

## CONFIRMADO E TESTADO

- **Build de produção, lint e type-check** rodando sem erros após todas as
  mudanças desta rodada (`npm run build`, `npx eslint .`, `npx tsc --noEmit`).
- **Todas as rotas públicas retornam 200** e uma rota inexistente retorna 404
  (testado via HTTP real contra `npm run start`, com as credenciais reais do
  Supabase presentes no ambiente).
- **`/admin` responde corretamente com o Supabase real conectado**: acesso
  sem sessão redireciona (307) para `/admin/login`, que carrega normalmente
  (200) — não aparece mais a tela de "não configurado".
- **Revisão visual real em navegador** (Chromium/Playwright) nas larguras
  390, 430, 375, 768 e 1440px, nessa ordem, em Home (página inteira), Domo
  Estelar (página inteira), Acomodações, Experiências, FAQ e Contato — zero
  erros de console/hydration em todas.
- **Header sticky**: `scroll-padding-top` global calibrado à altura real do
  header (`--header-h`), testado com `scroll-behavior: smooth`; nenhum título
  nasce escondido atrás do header.
- **Menu mobile**: testado abrir/fechar, tocar em link (fecha o menu e
  navega), botão Reservar dentro do menu, área de toque do hamburger
  aumentada para 44×44px.
- **CTA persistente mobile ("Reservar")**: testado que aparece só após
  rolar ~60% da altura da tela, some ao alcançar o rodapé (via
  `IntersectionObserver`), não é renderizado em `/admin`, e não fica focável
  quando invisível (só existe no DOM quando visível).
- **Seção de avaliações**: testado que, sem nenhuma avaliação publicada
  (estado atual), a seção não aparece em lugar nenhum da Home — nenhum
  placeholder do tipo "em breve" é mostrado.
- **Nenhum secret/`.env` commitado** (`.env.local` com as chaves reais do
  Supabase existe só localmente, confirmado fora do `git status`).
- **Nenhum conteúdo/avaliação inventada** — a tabela de avaliações só existe
  vazia; todo texto de depoimento virá de dados reais inseridos pela
  proprietária.

## CORRIGIDO NESTA RODADA

1. **Header sticky sobrepondo âncoras** — adicionado `scroll-padding-top`
   global (`html`), calibrado por `--header-h`, para qualquer link interno
   futuro com âncora nunca nascer atrás do header.
2. **Home mostrava só 3 das 4 acomodações românticas** — Domo Estelar
   adicionado; agora Ágata, Mirante, Doce Recanto e Domo Estelar aparecem
   juntas. Chalé para Grupos e Celeiro passaram a uma menção secundária de
   baixo peso visual, sem competir com as 4 principais.
3. **Cards de acomodação apertados no mobile** — trocado o grid fixo por
   scroll horizontal com snap (`snap-mandatory`) no mobile (cards grandes,
   ~78vw, foto proeminente) que vira grid normal a partir de `sm:`.
4. **Hierarquia de CTA inconsistente** — criado um sistema único
   (`ReserveButton` = ação primária; `SecondaryCta` = ação secundária, com
   variante `outline` para hero/fotos e `link` para o restante), aplicado em
   toda a Home substituindo estilos ad hoc.
5. **CTA de reserva não acompanhava a rolagem no mobile** — adicionado
   `MobileReserveBar`: barra fixa e discreta só no mobile, some perto do
   rodapé, respeita `env(safe-area-inset-bottom)`.
6. **Seção de "depoimentos" era um texto fixo de "em breve"** — substituída
   por uma seção real de avaliações (ver CMS abaixo) que só existe quando há
   conteúdo publicado.
7. **Rodapé com espaçamento apertado no mobile** — links do rodapé agora têm
   área de toque própria (`py-1.5`, `inline-block`) em vez de depender só do
   espaçamento entre linhas de texto.

## NOVO: CMS de Avaliações

- Migration `supabase/migrations/0002_reviews.sql`: tabela `reviews` com
  RLS — leitura pública só de avaliações `published = true`; escrita restrita
  a `is_admin()` (mesmo padrão de segurança já auditado, sem enfraquecer
  nada). **Aguardando ser aplicada no projeto Supabase real** (só a
  `0001_init.sql` foi confirmada como aplicada até agora).
- Painel `/admin/avaliacoes`: cadastrar, editar, excluir, reordenar
  (troca real de posição, mesmo padrão corrigido nas fotos) e
  publicar/despublicar avaliações. Campos: nome do hóspede, texto, nota
  opcional (1–5), origem (Airbnb/Booking/Google/Direto/Outro), acomodação
  relacionada opcional, data opcional.
- Seção pública na Home: só renderiza se houver avaliação publicada;
  composição editorial (aspas grandes, sem estrelas em excesso, origem
  mostrada como texto discreto, sem logos), scroll horizontal com snap no
  mobile. Posicionada depois de Experiências e antes do CTA final.

## Skill de design instalada

- `frontend-design` (Anthropic, `.claude/skills/frontend-design/`) —
  usada nesta rodada para as decisões de composição/hierarquia/ritmo.
  Registrada no `CLAUDE.md`, junto com o processo (sem plugin) usado para
  revisão mobile e acessibilidade, para evitar uma coleção grande de skills.

## AGUARDANDO TESTE COM SUPABASE REAL

- **Migration `0002_reviews.sql` ainda não foi rodada no projeto real** —
  até lá, `/admin/avaliacoes` carrega mas não terá a tabela; o código já
  trata isso sem quebrar (lista vazia), mas cadastrar uma avaliação vai
  falhar até a migration ser aplicada.
- Login real no `/admin` com e-mail/senha (a proprietária confirmou ter
  criado o usuário e rodado o `insert into admin_users`, mas o teste de
  login em si não pôde ser executado por mim: minha sandbox não tem acesso
  de rede ao Supabase nem à URL pública do site — ver abaixo).
- Publicar uma avaliação de teste e confirmar que a seção aparece sozinha na
  Home, sem precisar editar código.
- Upload de foto real via Supabase Storage e exibição via `next/image`.
- **Verificação do site publicado** (`https://sitesitio-ashen.vercel.app`):
  não consegui abrir essa URL nem com `curl` nem com a ferramenta de leitura
  de página — a política de rede desta sandbox bloqueia egress para domínios
  externos além de um allowlist restrito (registry do npm, APIs da
  Anthropic). Isso impede confirmar visualmente o resultado publicado; a
  revisão visual desta rodada foi feita 100% no servidor local
  (`npm run start`), com o mesmo código que está no `main`.
- Core Web Vitals/Lighthouse em produção real.

## AGUARDANDO CONTEÚDO/AÇÃO DA PROPRIETÁRIA

- Aplicar a migration `0002_reviews.sql` no SQL Editor do Supabase (mesmo
  processo já usado para a `0001_init.sql`).
- Copiar manualmente as primeiras avaliações reais (Airbnb/Booking/Google/
  direto) pelo painel `/admin/avaliacoes` — sem isso, a seção continua
  oculta no site (comportamento esperado, não é bug).
- Fotografias oficiais das acomodações, experiências e do sítio.
- Domínio definitivo (hoje: `sitesitio-ashen.vercel.app`).
- Textos definitivos (conteúdo atual é provisório e coerente, sem inventar
  preços, prêmios ou avaliações).
- URL futura do motor de reservas do Zeloa.
- Endereço/localização exata do sítio.

## FUTURO / NÃO IMPLEMENTAR AGORA

- Migrar `middleware.ts` para a convenção `proxy` do Next.js 16 (aviso de
  depreciação, sem impacto funcional).
- Permitir criar/remover experiências pelo painel (hoje só edita as 5 já
  cadastradas).
- Página "Sobre / O Sítio" ainda é texto fixo, não editável pelo painel.
- Página 404 com identidade visual própria (hoje usa a padrão do Next.js).

## Decisões técnicas (acumulado)

- Sistema de CTA único: `ReserveButton` (primário, sempre "Reservar") e
  `SecondaryCta` (secundário, variantes `outline`/`link`) — evita qualquer
  ação secundária competir visualmente com "Reservar".
- Avaliações nunca têm fallback seed: sem Supabase configurado ou sem
  publicadas, a função retorna lista vazia e a seção não renderiza — nunca
  inventamos depoimento nem mostramos placeholder de "em breve".
- `MobileReserveBar` só entra no DOM quando visível (evita link focável e
  invisível na ordem de tabulação) e não usa transição de entrada/saída para
  não depender de `prefers-reduced-motion` mais do que o necessário.
- RLS do Supabase: leitura pública liberada; escrita restrita a e-mails
  cadastrados em `admin_users` via função `security definer` `is_admin()` —
  princípio mantido e estendido para a nova tabela `reviews`.
- **Ambiente sem acesso a rede externa**: esta sandbox só alcança GitHub (via
  git) e o registro do npm; qualquer verificação em Supabase ou na URL
  pública do site (Vercel) precisa ser feita pela proprietária e reportada de
  volta.

## Dependências externas

- Supabase (auth, banco, storage) — projeto próprio: `ycaduuyjmsqvwxqsnrrd`.
- Vercel — deploy em `https://sitesitio-ashen.vercel.app`.
- Google Fonts (Fraunces, Inter) via `next/font/google`.
