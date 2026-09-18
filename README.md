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
   editar o site só por estar "autenticado".
6. Preencha as variáveis de ambiente com a URL e as chaves do projeto.
7. Recomendado (reforço extra de segurança): em *Authentication → Sign In / Providers →
   Email*, desative o cadastro público ("Allow new users to sign up"), já que este
   site tem um único administrador e novas contas nunca deveriam ser necessárias.

## Painel administrativo

Acesse `/admin` para editar textos, acomodações, experiências, FAQ e políticas sem
precisar mexer em código. Requer login com um usuário Supabase cadastrado no passo
anterior.

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

## Reservas

O botão "Reservar" aponta hoje para uma URL configurável (WhatsApp, por padrão).
Está preparado para, futuramente, apontar diretamente para o motor de reservas do
Zeloa, sem exigir mudanças estruturais no site.
