# Sítio Recanto Azul — Site Oficial

Site institucional e CMS do Sítio Recanto Azul. Projeto isolado, sem relação com
outros sistemas (CRM, Zeloa etc.) — ver regras em `CLAUDE.md`.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (auth, banco de dados, storage) — planejado para o painel `/admin`

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

| Variável | Descrição |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço — **uso exclusivo em servidor**, nunca no cliente |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site, usada em metadata/sitemap |

Nunca commitar `.env` ou `.env.local`.

## Configurando o Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com) exclusivo para este site
   (não reutilizar bancos de outros projetos).
2. Rode as migrations em `supabase/migrations/` (via SQL Editor do Supabase ou
   `supabase db push`, se usar a CLI).
3. O bucket de storage `accommodation-images` já é criado pela própria migration.
4. Crie um usuário (e-mail/senha) em *Authentication* para acessar o painel `/admin`.
5. **Obrigatório:** autorize esse e-mail a editar o site rodando no SQL Editor:
   ```sql
   insert into admin_users (email) values ('seu-email@dominio.com');
   ```
   Sem essa linha, o login funciona mas nenhuma edição é salva — as políticas de
   segurança (RLS) só liberam escrita para e-mails cadastrados em `admin_users`.
   Isso existe porque, por padrão, o Supabase permite que qualquer visitante crie
   uma conta sozinho; sem essa lista de permissão, um cadastro externo conseguiria
   editar o site só por estar "autenticado". O painel `/admin` também verifica
   isso: um usuário autenticado que não está em `admin_users` é redirecionado
   para o login com sua sessão encerrada, em vez de conseguir abrir as telas do
   painel (mesmo sem conseguir salvar nada).
6. Preencha as variáveis de ambiente com a URL e as chaves do projeto.
7. Recomendado (reforço extra de segurança): em *Authentication → Sign In / Providers →
   Email*, desative o cadastro público ("Allow new users to sign up"), já que este
   site tem um único administrador e novas contas nunca deveriam ser necessárias.

## Segurança (resumo)

- **Leitura pública é sempre filtrada por `published = true`** em
  `accommodations`, `experiences`, `faqs`, `reviews` e `pages` — tanto na policy
  de RLS (defesa no banco) quanto na camada de leitura do site
  (`src/lib/data.ts`). Conteúdo despublicado nunca aparece nem pela UI nem
  consultando a API REST do Supabase diretamente.
- **Escrita é sempre restrita a `admin_users`**, via a função `is_admin()`
  (`security definer`), usada pelas policies de RLS. As policies de
  administração valem só para o papel `authenticated` — o papel `anon` (visitante
  não logado) nunca precisa nem consegue executar `is_admin()`.
- **`service_role`** nunca é usado no navegador — só nas rotas de servidor que
  o exigirem explicitamente (nenhuma hoje).

## Painel administrativo

Acesse `/admin` para editar, sem mexer em código:

- **Página inicial** (`/admin/home`) — título/subtítulo/texto/imagem/botão de cada
  bloco da Home (Hero, Apresentação, Acomodações, O Sítio, Experiências, Avaliações,
  CTA final), visibilidade e ordem entre eles. A lista de blocos é fixa — não é um
  page-builder livre — para o design nunca quebrar. A Home renderiza os blocos
  visíveis na ordem salva. Exceção deliberada: o **Hero sempre abre a página**,
  qualquer que seja o valor salvo para ele — o Hero foi desenhado para ocupar o
  topo (altura de tela cheia, texto sobre foto) e permitir que apareça no meio do
  layout só quebraria a página sem ganho real; por isso as setas de reordenar dessa
  linha ficam desativadas no painel.
- **Acomodações** — nome, descrições, capacidade detalhada (adultos/crianças/
  camas/quartos/banheiros), diferenciais, comodidades, preço, fotos (upload,
  reordenar, definir capa, editar texto alternativo — excluir uma foto também
  remove o arquivo do Storage, não só o registro), publicar/despublicar, destaque
  e ordem na Home (a Home usa exatamente esses dois campos para decidir o que
  mostrar — sem nenhuma marcada como destaque, a seção de Acomodações some da
  Home), e SEO por acomodação (usado de verdade no `<head>` da página).
- **Experiências, Avaliações, FAQ, Páginas, Políticas** — criar, editar, reordenar,
  publicar/despublicar.
- **Configurações → Contato** — WhatsApp, telefone, e-mail, Instagram, endereço e
  link do Google Maps: fonte única usada pelo rodapé, Contato e Localização.
- **Configurações → Reservas** — motor de reservas (ver seção "Reservas" abaixo).
- **Configurações → Integrações** — IDs (não secretos) de Google Analytics e Meta
  Pixel, deixados em branco até você ter as contas reais.
- **Configurações → SEO** — título/descrição/imagem padrão para buscadores e redes
  sociais.

Requer login com um usuário Supabase cadastrado no passo anterior.

### Fotos e biblioteca de mídia

O upload/gerenciamento de fotos hoje é feito por entidade (cada acomodação e cada
página têm seu próprio gerenciador de imagens, com drag-and-drop, preview,
reordenar, definir capa, editar texto alternativo e excluir) usando o bucket público
`accommodation-images` do Supabase Storage. Optou-se por isso — em vez de uma
biblioteca central única — para não adicionar complexidade sem necessidade nesta
fase; é o mesmo armazenamento por baixo, então evoluir para uma biblioteca cruzada
no futuro não exige remodelar o banco.

### Modo de edição visual / rascunho e publicação

Duas simplificações intencionais desta fase, documentadas conforme pedido:

- **Sem editor visual inline no site público.** Toda edição de conteúdo acontece em
  `/admin`. Um modo "clique para editar" sobre o site ao vivo foi avaliado, mas
  adiado: o ganho de conveniência não compensa, agora, o risco de complexidade e de
  abrir superfícies de edição fora do painel controlado. O `/admin` já cobre 100%
  dos campos de conteúdo.
- **Sem rascunho/publicação separados por campo.** Todo conteúdo tem um único
  estado "publicado" (booleano) por item — não existe uma versão "rascunho" salva
  em paralelo à versão ao vivo. Antes de mudanças importantes, prepare o conteúdo
  com o item despublicado e revise a própria página de edição; publique quando
  estiver pronto. Uma pré-visualização completa fora do estado publicado ficou para
  uma fase futura, se necessário.

## Reservas e `BookingProvider`

Nenhum botão "Reservar" do site tem uma URL fixa no código. Todos (menu, botão fixo
no celular, Home, páginas de acomodação, Contato) usam `src/lib/booking.ts`, que lê
a configuração de `/admin/configuracoes/reservas` (tabela `site_settings`):

- **Motor** (`booking_provider`): `none` (esconde os botões), `link` (URL externa —
  WhatsApp, motor temporário como o "Mobile Calendar", etc.), `widget` (embutido) ou
  `zeloa` (reservado para quando a integração estiver pronta).
- **URL base** (`booking_base_url`): a URL para onde os botões apontam. Uma
  acomodação pode ter seu próprio link de reserva (`reserve_url`), que sobrepõe a
  URL base só para ela.
- **Modo de abertura, texto do botão e exibição de busca/calendário** também vêm
  dessa mesma configuração.

Trocar de motor é 100% uma mudança de configuração em `/admin` — nunca requer
alterar código ou fazer novo deploy.

Um provider só é considerado "ativo" (e mostra botões de reserva) quando existe
uma URL utilizável de verdade para o modo escolhido — nunca um botão apontando
para `href="#"`.

### Busca de reserva e widget embutido

- **`BookingSearch`** (`src/components/booking-search.tsx`): campos de check-in,
  check-out, adultos e crianças; ao buscar, monta a URL via `getBookingHref` e abre
  o motor configurado. Aparece na Home quando "Mostrar busca de datas na Home"
  está ligado, e na página de cada acomodação quando "Mostrar busca nas
  acomodações" está ligado (Configurações → Reservas).
- **`BookingWidget`** (`src/components/booking-widget.tsx`): um `<iframe>`
  controlado, renderizado só quando o motor é "Widget/calendário embutido" e a URL
  configurada é `https`. Nunca executa HTML/JS arbitrário — só carrega a URL
  configurada, com `sandbox` restrito.

### Parâmetros de busca (deep-link)

`getBookingHref()` sabe montar a URL com `checkin`, `checkout`, `adultos`,
`criancas` e `acomodacao` como parâmetros de busca. **Esses nomes são um
placeholder de arquitetura, não a API real de nenhum motor** — quando o Zeloa (ou
outro motor) definir o formato final, ajusta-se essa única função; nenhum
componente do site precisa mudar.

### Integração futura com o Zeloa

Fora de escopo nesta fase (arquitetura apenas, sem implementação):

- O site (`www.sitiorecantoazul.com.br`) continua sendo a vitrine de conteúdo.
- O Zeloa (`reservas.sitiorecantoazul.com.br`) será o motor de reservas —
  disponibilidade, tarifas, hóspedes, extras, reserva e pagamento vivem lá, nunca
  duplicados no site.
- Quando o Zeloa estiver pronto, ativa-se trocando `booking_provider` para
  `"zeloa"` em `/admin/configuracoes/reservas` e preenchendo a URL base — sem
  mudança estrutural no site.
- Uma fase futura pode consultar a API do Zeloa diretamente (disponibilidade/preço
  ao vivo). O `BookingProvider` já isola esse ponto de extensão; nenhuma
  disponibilidade é armazenada no banco do site hoje — nem falsa, nem real.

### Analytics

`src/lib/analytics.ts` expõe `trackEvent()`, que empilha eventos em
`window.dataLayer` (padrão já lido por Google Analytics/GTM e a maioria dos
pixels). Eventos disparados hoje: `booking_click` (todo botão "Reservar" do
site), `whatsapp_click` (botão de WhatsApp em Contato), `accommodation_view`
(ao abrir uma página de acomodação), `review_interaction` (clique em um card de
avaliação) e `booking_search` (busca no `BookingSearch`).

Quando os IDs de Google Analytics/Meta Pixel são preenchidos em Configurações →
Integrações, `src/components/analytics-scripts.tsx` carrega o `gtag.js`/Meta
Pixel automaticamente; com os campos em branco, nenhum script de rastreamento é
carregado.

## Estrutura do projeto

```
src/
  app/            rotas (App Router): páginas públicas + /admin
  components/     componentes de UI compartilhados
  lib/
    content.ts    conteúdo seed/fallback (espelha o schema do Supabase)
    types.ts      tipos do domínio (Accommodation, Experience, etc.)
    supabase/     clientes Supabase (browser/server)
supabase/
  migrations/     schema SQL do banco
```

## Como alterar conteúdo

- **Conteúdo editável (produção):** use o painel `/admin`.
- **Conteúdo seed/fallback (código):** edite `src/lib/content.ts` — usado apenas
  quando o Supabase ainda não está configurado.

## Publicando

O projeto está pronto para deploy em qualquer plataforma compatível com Next.js
(ex.: Vercel). Configure as variáveis de ambiente de produção na plataforma escolhida.
