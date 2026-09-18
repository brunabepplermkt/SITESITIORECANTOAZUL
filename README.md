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
3. Crie um bucket de storage público chamado `accommodation-images`.
4. Crie um usuário (e-mail/senha) em *Authentication* para acessar o painel `/admin`.
5. Preencha as variáveis de ambiente com a URL e as chaves do projeto.

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
