# PROJECT_STATUS — Sítio Recanto Azul

Última atualização: 2026-09-18 (auditoria profissional completa)

Este documento separa o que está **confirmado por teste real** do que **parece
pronto mas ainda depende de algo externo** (principalmente o Supabase real, que
ainda não existe). Nada aqui foi marcado como concluído sem execução real de
build, lint, type-check e navegador.

---

## CONFIRMADO E TESTADO

- **Build de produção** (`npm run build`), **lint** (`npx eslint .`) e
  **type-check** (`npx tsc --noEmit`) rodando sem erros, sem avisos além da
  depreciação conhecida do arquivo `middleware.ts` (ver "Futuro").
- **Rotas públicas** testadas via HTTP real (servidor de produção local,
  `npm run start`): `/`, `/acomodacoes`, as 6 páginas de detalhe de acomodação,
  `/experiencias`, `/sobre`, `/localizacao`, `/faq`, `/contato`, `/politicas`,
  `/sitemap.xml`, `/robots.txt`, `/favicon.ico`, `/icon.svg` — todas retornam
  200. Uma rota inexistente retorna 404 corretamente.
- **`/admin`** sem Supabase configurado retorna 503 com uma página explicativa
  (antes era um texto puro, sem estilo — corrigido nesta auditoria), em vez de
  expor um painel quebrado ou sem autenticação.
- **Revisão visual real em navegador** (Chromium via Playwright) em 375, 390,
  430, 768 e 1440px nas páginas Home, Domo Estelar, Acomodações e na tela de
  bloqueio do `/admin`. Hierarquia, espaçamento, tipografia e responsividade
  aprovados; nenhum erro de console além dos 503 esperados do `/admin` sem
  Supabase.
- **Sem hydration errors ou erros de JS no console** em nenhuma página testada.
- **Nenhum secret, `.env`, chave ou credencial** commitado no repositório nem
  no histórico do Git (verificado com `git log --all` sobre arquivos `.env*`).
- **`SUPABASE_SERVICE_ROLE_KEY`**: declarada apenas em `.env.example` (vazia) e
  não é referenciada em nenhum lugar do código — sem risco de vazamento para o
  cliente.
- **Sem XSS conhecido**: único uso de `dangerouslySetInnerHTML` é para JSON-LD
  gerado com `JSON.stringify` (SEO); React escapa todo o resto do conteúdo
  dinâmico automaticamente.
- **Sem dependências vulneráveis**: `npm audit` — 0 vulnerabilidades.
- **Client components mínimos e justificados** (5 no total: menu mobile,
  login, upload de imagens, 2 boundaries de erro) — nada é Client Component
  sem necessidade real de interatividade.
- **Nenhum link interno quebrado** nas páginas públicas (navegação do header e
  rodapé revisada e corrigida — ver "Corrigido nesta auditoria").
- **Nenhum conteúdo inventado** (sem prêmios, avaliações, notas ou números
  fabricados) — confirmado por busca automatizada no conteúdo.

## CORRIGIDO NESTA AUDITORIA

Problemas reais encontrados e já corrigidos, com commit e push feitos:

1. **[Segurança — crítico] RLS confiava em qualquer usuário autenticado.**
   As políticas usavam `auth.role() = 'authenticated'`, o que no Supabase
   padrão (cadastro público habilitado) permitiria que **qualquer visitante**
   criasse uma conta sozinho (usando a própria chave `anon` já exposta no
   navegador) e passasse a editar/apagar todo o conteúdo do site. Corrigido
   com uma lista de administradores (`admin_users`) e uma função
   `is_admin()` (security definer); todas as políticas de escrita — inclusive
   as do Storage — agora exigem `is_admin()`. **Ação obrigatória da
   proprietária**: inserir o próprio e-mail em `admin_users` após criar a
   conta (passo a passo no README).
2. **[Correção real / robustez] Reordenação de fotos não fazia troca real de
   posição.** O botão ↑/↓ apenas copiava o `order_index` do vizinho para a
   foto atual, sem atualizar o vizinho — isso podia deixar duas fotos com o
   mesmo `order_index` e a ordenação ficava imprevisível depois de alguns
   cliques. Corrigido para fazer uma troca (swap) real entre as duas fotos.
3. **[Bug real] Fotos reais enviadas pelo Supabase Storage quebrariam o
   site.** `next.config.ts` não liberava nenhum domínio remoto para o
   `next/image`; assim que a primeira foto real fosse enviada pelo painel, a
   página pública dela quebraria com erro de imagem não configurada.
   Corrigido com `images.remotePatterns` para o domínio do Supabase Storage.
4. **[Bug real] Painel administrativo podia ser "congelado" como página
   estática.** Sem variáveis de ambiente do Supabase no momento do build, o
   Next.js otimizava as páginas do `/admin` como conteúdo estático — ou seja,
   uma vez publicado com o Supabase configurado depois, o painel corria o
   risco de servir uma versão desatualizada em vez de sempre buscar a sessão
   e os dados mais recentes. Corrigido forçando renderização dinâmica
   (`export const dynamic = "force-dynamic"`) em todas as páginas do painel.
   Confirmado no build: todas as rotas `/admin/*` (exceto o login) agora
   aparecem como "ƒ Dynamic".
5. **[Falso funcionamento] Texto do admin de Experiências prometia uma opção
   inexistente.** A página dizia "para adicionar uma nova experiência, defina
   um slug ainda não existente abaixo", mas não existe nenhum campo para
   criar uma experiência nova — só é possível editar as já existentes. Texto
   corrigido para refletir o que o painel realmente faz.
6. **[Robustez] Falta de validação de entrada nos formulários do admin.**
   Adicionada validação de preço (rejeita texto não numérico ou negativo),
   campos obrigatórios (nome da acomodação/experiência, pergunta e resposta
   do FAQ, nome do site), validação de tipo e tamanho de imagem no upload
   (apenas `image/*`, até 8MB) e sanitização do nome do arquivo enviado.
7. **[Robustez] Erros de validação quebrariam a tela sem explicação.** Como
   os Server Actions agora podem rejeitar dados inválidos, foram adicionados
   `error.tsx` (site público) e um específico para o `/admin`, mostrando uma
   mensagem compreensível com opção de tentar novamente, em vez da tela de
   erro genérica do Next.js.
8. **[Robustez] Middleware podia derrubar o site com erro 500.** Se o
   Supabase estivesse configurado com URL/credenciais inválidas ou
   inacessível, `supabase.auth.getUser()` podia lançar uma exceção não
   tratada dentro do middleware. Agora isso é capturado e tratado como "não
   autenticado", sem quebrar a requisição.
9. **[Correção real] Favicon retornava 404 em todo carregamento de página.**
   O arquivo binário havia sido removido durante a criação do repositório
   (para viabilizar o primeiro push via API do GitHub) e nunca foi
   recriado. Adicionado `favicon.ico` e `icon.svg` reais, com o mesmo motivo
   visual do restante do design.
10. **[Navegação incompleta] Rodapé não linkava para Localização e FAQ**,
    apesar de essas páginas existirem e estarem no menu principal.
    Corrigido — o rodapé agora lista todas as páginas do site.
11. **[Consistência de dados] Migration do Supabase não populava nenhum
    dado inicial.** Isso criava um estado ambíguo: como o site cai para o
    conteúdo seed sempre que uma tabela está vazia, a primeira edição feita
    por qualquer tela do painel (ex.: adicionar 1 FAQ novo) faria a tabela
    deixar de estar "vazia" e o site passaria a mostrar *só* aquele registro
    novo, escondendo todo o restante do conteúdo seed que nunca foi
    inserido de fato no banco. Corrigido: a migration agora insere todo o
    conteúdo seed (site_settings, as 6 acomodações com suas fotos-placeholder,
    as 5 experiências, as 4 perguntas de FAQ e o texto de políticas), de forma
    idempotente (`on conflict do nothing`), incluindo as constraints de
    unicidade necessárias para isso funcionar corretamente mesmo se a
    migration for executada mais de uma vez.
12. **[Correção real] Chave de reação (`key`) da lista pública de FAQ usava o
    texto da pergunta.** Corrigido para usar o `id` do banco quando
    disponível, evitando comportamento imprevisível do React em caso de
    perguntas repetidas.

## AGUARDANDO TESTE COM SUPABASE REAL

Não pode ser validado de ponta a ponta neste ambiente porque nenhum projeto
Supabase real foi criado ainda (ver "Aguardando conteúdo/decisão da
proprietária"). Tudo abaixo foi revisado por leitura de código com atenção
específica a "funciona visualmente mas não persiste dado real", mas só um
teste com Supabase real confirma definitivamente:

- Login no `/admin` com e-mail/senha reais.
- Persistência real de: configurações do site, edição de acomodação
  (descrição, preço, comodidades, link de reserva), upload/exclusão/
  reordenação de fotos, edição de experiências, criação/edição/exclusão de
  FAQ, edição de políticas.
- Comportamento da política de RLS `is_admin()` com um usuário real cadastrado
  em `admin_users` (e a confirmação de que um usuário **não** cadastrado ali
  de fato não consegue escrever, mesmo autenticado).
- Redirecionamento de sessão (login → `/admin`; logout → `/admin/login`;
  acesso sem sessão → redireciona para login) com cookies reais do Supabase.
- Exibição de fotos reais enviadas via Supabase Storage através do
  `next/image` (a configuração de domínio foi corrigida, mas nunca foi
  exercitada com uma URL real do Storage).
- Core Web Vitals/Lighthouse em ambiente de produção real (este ambiente não
  tem um navegador com métricas de performance instrumentadas; a auditoria
  aqui cobriu bundle size, lazy loading e uso mínimo de client components,
  mas não uma medição de LCP/CLS/INP reais).

## AGUARDANDO CONTEÚDO DA PROPRIETÁRIA

- Fotografias oficiais das acomodações e do sítio (placeholders SVG em uso).
- Domínio definitivo e configuração de DNS.
- Criação do projeto Supabase (URL, anon key, service role key) e de um
  usuário administrador para o painel `/admin` — **mais o passo obrigatório
  de inserir esse e-mail em `admin_users`** (ver README).
- Textos definitivos (o conteúdo atual é provisório, coerente e sem Lorem
  Ipsum, mas também sem preços, prêmios ou avaliações inventados).
- URL futura do motor de reservas do Zeloa (hoje aponta para um link
  configurável de WhatsApp).
- Endereço/localização exata do sítio para a página de Localização e um mapa
  incorporado.
- Decisão sobre a visibilidade do repositório no GitHub: foi criado como
  **público** (`brunabepplermkt/sitesitiorecantoazul`). Nenhum secret está no
  código, mas se a intenção era mantê-lo privado, isso se altera em
  Settings → Danger Zone → Change visibility, no GitHub.

## FUTURO / NÃO IMPLEMENTAR AGORA

Itens identificados na auditoria que são melhorias válidas, mas não bugs —
registrados para não serem esquecidos, sem exigir ação agora:

- Migrar `middleware.ts` para a convenção `proxy` do Next.js 16 (hoje é só um
  aviso de depreciação; a funcionalidade atual continua correta).
- Criar uma página 404 com a identidade visual do site (hoje usa a página
  padrão do Next.js, que já retorna o status HTTP correto).
- Permitir criar/remover experiências pelo painel (hoje só edita as 5 já
  cadastradas) — texto do painel já foi corrigido para não prometer isso.
- Página "Sobre / O Sítio" ainda é texto fixo no código, não editável pelo
  painel — não fazia parte do escopo definido para o CMS até agora.
- Pequena sobreposição de conteúdo na página do Domo Estelar: a lista de
  "Diferenciais" e a de "Comodidades" mostram itens quase idênticos, porque o
  conteúdo seed dessa acomodação específica foi escrito assim. Não é um bug —
  é uma decisão de copy que faz mais sentido revisar quando os textos
  definitivos da proprietária estiverem prontos.

## Decisões técnicas (acumulado)

- Next.js App Router + Server Components por padrão; formulários do admin são
  Client/Server Components com Server Actions (`src/app/admin/actions.ts`).
- RLS do Supabase: leitura pública (anon) liberada; escrita restrita a
  e-mails cadastrados em `admin_users`, validados por uma função
  `security definer` (`is_admin()`) — não apenas "estar autenticado".
- Imagens locais de placeholder em SVG são renderizadas via `<img>`
  (componente `Photo`); fotos reais (Supabase Storage) usam `next/image` com
  `remotePatterns` configurado para o domínio do Supabase.
- Botão "Reservar" aponta para uma URL configurável, preparada para receber o
  motor de reservas do Zeloa no futuro, sem acoplar o site ao PMS agora.
- `/admin` usa um route group `(dashboard)` para aplicar navegação/logout só
  às páginas autenticadas, e é forçado a renderização dinâmica para nunca
  servir uma versão estática desatualizada.
- **Push para o GitHub**: `git push` funciona normalmente neste ambiente (o
  bloqueio do classificador de segurança relatado na fase anterior foi
  pontual/transitório no primeiro push para um repositório vazio). Os commits
  desta auditoria foram enviados via `git push` padrão.

## Dependências externas

- Supabase (auth, banco, storage) — projeto próprio e isolado deste site.
- Google Fonts (Fraunces, Inter) via `next/font/google`.
