# PROJECT_STATUS — Sítio Recanto Azul

Última atualização: 2026-09-18 (CMS super editável + arquitetura de reservas
`BookingProvider` + preparação para o Zeloa)

Este documento separa o que está **implementado no código**, o que foi
**validado por teste real** (build/lint/type-check/navegador local) e o que
**depende de algo externo** que esta sandbox não alcança (Supabase real,
Zeloa, conteúdo da proprietária). Nada é marcado como validado sem execução
real — ver a seção "NÃO FINGIR TESTES" implícita: onde a verificação
dependeria do Supabase real conectado, ela está listada em AGUARDANDO
SUPABASE, não em VALIDADO.

---

## IMPLEMENTADO NESTA RODADA

- **Migration `supabase/migrations/0004_cms_expansion.sql`**: tabela nova
  `home_sections` (blocos fixos e configuráveis da Home); novos campos em
  `accommodations` (descrição curta, adultos/crianças/camas/quartos/
  banheiros, `published`, `featured_home`, `home_order`, SEO); novos campos
  em `experiences` (`published`, CTA, SEO); novo campo `published` em
  `faqs`; e em `site_settings`: `google_maps_url`, SEO padrão, e todo o
  grupo de reservas (`booking_provider`, `booking_base_url`,
  `booking_open_mode`, `booking_cta_label`, `booking_show_search_home`,
  `booking_show_search_accommodation`, `booking_show_calendar`,
  `booking_widget_embed_url`) e integrações (`google_analytics_id`,
  `meta_pixel_id`). Backfill automático preserva o comportamento atual das
  4 acomodações românticas na Home, sem exigir reconfiguração manual.
- **`src/lib/booking.ts`** (`BookingProvider`): camada única de onde vem o
  link/target de todo botão "Reservar" do site (menu desktop e mobile, CTA
  fixo no celular, Home, páginas de acomodação, Contato). Suporta os modos
  `none`/`link`/`widget`/`zeloa`; parâmetros de busca (`checkin`,
  `checkout`, `adultos`, `criancas`, `acomodacao`) documentados como
  placeholder de arquitetura, não a API final de nenhum motor.
- **`src/lib/analytics.ts`**: `trackEvent()` minimalista via
  `window.dataLayer`, pronto para Google Analytics/GTM/Meta Pixel; nenhum ID
  fictício inserido.
- **Home configurável em blocos** (`/admin/home`): título/subtítulo/texto/
  imagem/botão de cada seção fixa (Hero, Apresentação, Acomodações, O Sítio,
  Experiências, Avaliações, CTA final), visibilidade e ordem entre elas.
  Não é um page-builder livre — a lista de blocos é fixa no código.
- **Acomodações**: formulário de edição expandido com capacidade detalhada,
  publicar/despublicar, destaque e ordem na Home, SEO por acomodação
  (opcional, em `<details>`). Galeria de fotos ganhou "definir capa" e
  edição de texto alternativo, além do que já existia (upload, reordenar,
  excluir).
- **Experiências**: publicar/despublicar e CTA (texto + link) opcionais.
- **FAQ**: publicar/despublicar e reordenar (antes só tinha criar/editar/
  excluir).
- **Configurações divididas** em `/admin/configuracoes/{contato,reservas,
  integracoes,seo}`, cada uma com sua própria página e ações — em vez de um
  formulário único e cada vez mais longo.
- **CTAs de reserva refatorados**: `SiteHeader`, `MobileReserveBar`,
  `ReserveButton`/página de acomodação e o CTA final da Home não têm mais
  nenhuma URL de reserva fixa no código — todos leem de
  `getBookingHref`/`getBookingTarget`/`isBookingActive`.
- **Contato/Localização** passaram a usar `whatsapp` e `google_maps_url` de
  `site_settings` como fonte única, em vez de duplicar o link em cada
  página.

## VALIDADO (build/lint/type-check/navegador local)

- `npx tsc --noEmit`, `npx eslint .` e `npm run build` rodando sem erros
  após todas as mudanças desta rodada.
- Todas as rotas relevantes (`/`, `/faq`, `/acomodacoes`,
  `/admin/login`) retornam HTTP 200 contra `npm run start` local, **sem**
  Supabase configurado — confirma que o fallback seed cobre 100% dos novos
  campos (nenhuma página quebra quando o banco está ausente).
- Home renderizada localmente mostra todos os 7 blocos na ordem esperada
  (Hero → Apresentação → Acomodações → O Sítio → Experiências → Avaliações
  [oculta por não haver avaliação] → CTA final), com os textos de fallback
  idênticos ao que já existia antes desta rodada — nenhuma regressão visual
  de conteúdo.
- FAQ pública mostra as 4 perguntas seed, todas `published: true`.
- Todas as novas rotas do admin (`/admin/home`,
  `/admin/configuracoes/{contato,reservas,integracoes,seo}`) aparecem
  corretamente no manifesto de rotas do `next build` como dinâmicas
  (`force-dynamic`, mesmo padrão do restante do `/admin`).

## AGUARDANDO SUPABASE REAL

Nada abaixo foi testado contra um banco real — esta sandbox não tem acesso
de rede ao Supabase. Precisa ser verificado pela proprietária depois de
rodar a `0004_cms_expansion.sql`:

- Rodar a migration no SQL Editor do projeto Supabase real.
- Editar um bloco da Home em `/admin/home`, salvar, recarregar o site e
  confirmar que o texto/imagem/ordem mudou.
- Marcar uma acomodação como "Não publicada" e confirmar que ela some da
  Home e de `/acomodacoes` (mas continua editável em `/admin`).
- Trocar `booking_provider` entre `link`/`widget`/`none` em
  `/admin/configuracoes/reservas` e confirmar que **todos** os botões
  "Reservar" do site (menu, CTA fixo mobile, Home, acomodação, Contato)
  mudam juntos, sem editar código.
- Preencher `google_maps_url` e `whatsapp` em Contato e confirmar que
  Contato/Localização/rodapé refletem o mesmo valor.
- Definir uma foto como capa em uma acomodação e confirmar que ela aparece
  primeiro na Home e na página da acomodação.
- Despublicar uma pergunta do FAQ e confirmar que ela some de `/faq`.
- Testes de segurança reais: visitante (sem login) não consegue gravar em
  nenhuma tabela nova; usuário autenticado sem estar em `admin_users` também
  não consegue; só um e-mail cadastrado em `admin_users` consegue salvar.
- Upload real de foto (tamanho/tipo inválido deve ser rejeitado com
  mensagem clara) e exibição via `next/image`.

## AGUARDANDO ZELOA

- Ativar o motor `zeloa` em `/admin/configuracoes/reservas`: hoje a opção
  existe na interface, mas escolher "Zeloa" sem uma URL base configurada não
  tem efeito diferente de "Desativado" (nenhuma URL fixa foi inventada).
- Formato final dos parâmetros de busca (`checkin`/`checkout`/`adultos`/
  `criancas`/`acomodacao`) — os nomes atuais em `getBookingHref()` são um
  placeholder; ajustar essa função quando o Zeloa publicar sua API real.
- Disponibilidade/tarifas ao vivo por acomodação (calendário) — arquitetura
  deixada pronta para plugar (`booking_show_calendar` já existe na
  configuração), mas nenhum calendário falso foi construído nem nenhuma
  disponibilidade é armazenada no banco do site.
- Domínio `reservas.sitiorecantoazul.com.br` (fora deste repositório).

## AGUARDANDO CONTEÚDO/AÇÃO DA PROPRIETÁRIA

- Aplicar as migrations `0002`, `0003` e `0004` no projeto Supabase real
  (0002/0003 já eram pendências de rodadas anteriores).
- Preencher Contato (WhatsApp, endereço, link do Google Maps) em
  `/admin/configuracoes/contato` — hoje ainda com valores de exemplo.
- Escolher e configurar o motor de reservas temporário (ex.: link do
  WhatsApp ou "Mobile Calendar") em `/admin/configuracoes/reservas` até o
  Zeloa estar pronto.
- Revisar/editar os textos de cada bloco da Home em `/admin/home` — os
  textos atuais são os mesmos que já existiam fixos no código, só agora
  editáveis.
- Fotografias oficiais, textos definitivos, primeiras avaliações reais
  (mantido de rodadas anteriores).
- IDs de Google Analytics/Meta Pixel, quando existirem.

## FUTURO / NÃO IMPLEMENTAR AGORA

- Biblioteca de mídia cruzada única (hoje: um gerenciador de fotos por
  acomodação/página — ver README, seção "Fotos e biblioteca de mídia").
- Modo de edição visual inline sobre o site publicado (avaliado e adiado —
  ver README).
- Rascunho/publicação como dois estados separados por campo (hoje: um único
  booleano "publicado" por item — ver README).
- Consulta direta à API do Zeloa para disponibilidade/preço ao vivo.
- Calendário de disponibilidade real (depende do motor/PMS).
- Migrar `middleware.ts` para a convenção `proxy` do Next.js 16 (aviso de
  depreciação, sem impacto funcional).
- Página 404 com identidade visual própria (hoje usa a padrão do Next.js).

## Decisões técnicas (acumulado)

- Publicar/despublicar tratado como filtro na camada de leitura
  (`lib/data.ts`, `.eq("published", true)`), não como mudança nas políticas
  de `SELECT` do RLS — evita mexer em regras de segurança já auditadas.
- Seções da Home são um conjunto fixo de chaves (`HomeSectionKey`), nunca um
  page-builder livre — só conteúdo/visibilidade/ordem são editáveis.
- `BookingProvider`: uma função pura (`lib/booking.ts`) consumida por todo
  componente que precisa de um link de reserva — nunca uma URL literal
  espalhada pelo código.
- RLS do Supabase: leitura pública liberada; escrita restrita a e-mails
  cadastrados em `admin_users` via função `security definer` `is_admin()` —
  princípio mantido e estendido a `home_sections` e a todos os novos campos.
- Avaliações nunca têm fallback seed: sem Supabase configurado ou sem
  publicadas, a função retorna lista vazia e a seção não renderiza — nunca
  inventamos depoimento nem mostramos placeholder de "em breve".
- **Ambiente sem acesso a rede externa**: esta sandbox só alcança GitHub (via
  git) e o registro do npm; qualquer verificação em Supabase ou na URL
  pública do site (Vercel) precisa ser feita pela proprietária e reportada de
  volta.

## Dependências externas

- Supabase (auth, banco, storage) — projeto próprio: `ycaduuyjmsqvwxqsnrrd`.
- Vercel — deploy em `https://sitesitio-ashen.vercel.app`.
- Google Fonts (Fraunces, Inter) via `next/font/google`.
- Zeloa (motor de reservas) — integração futura, fora deste repositório.
