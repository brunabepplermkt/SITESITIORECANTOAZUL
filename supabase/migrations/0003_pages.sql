-- Sítio Recanto Azul — páginas customizadas criadas pela proprietária
-- (ex.: "Galeria", "Sobre a proprietária"), com conteúdo em blocos de
-- texto e foto intercalados, reordenáveis. Mesmo padrão de segurança do
-- restante do CMS (is_admin(), definida na migration 0001).

create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  nav_label text,
  show_in_nav boolean not null default false,
  published boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists page_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  type text not null check (type in ('text', 'image')),
  content text,
  image_url text,
  image_alt text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists page_blocks_page_order_idx
  on page_blocks (page_id, order_index);

alter table pages enable row level security;
alter table page_blocks enable row level security;

create policy "public read published pages" on pages for select
  using (published = true);

create policy "admin manage pages" on pages for all
  using (is_admin()) with check (is_admin());

create policy "public read blocks of published pages" on page_blocks for select
  using (exists (
    select 1 from pages p where p.id = page_blocks.page_id and p.published = true
  ));

create policy "admin manage page_blocks" on page_blocks for all
  using (is_admin()) with check (is_admin());
