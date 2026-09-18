-- Sítio Recanto Azul — avaliações de hóspedes (copiadas manualmente pela
-- proprietária de Airbnb/Booking/Google/reservas diretas). Segue o mesmo
-- padrão de segurança do restante do CMS: leitura pública restrita a
-- avaliações publicadas; escrita restrita a administradores (is_admin(),
-- definida na migration 0001).

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  text text not null,
  rating smallint check (rating is null or (rating between 1 and 5)),
  source text not null default 'direto'
    check (source in ('airbnb', 'booking', 'google', 'direto', 'outro')),
  accommodation_slug text references accommodations(slug) on delete set null,
  date_label text,
  order_index integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_published_order_idx
  on reviews (published, order_index);

alter table reviews enable row level security;

-- Visitantes só veem avaliações já publicadas.
create policy "public read published reviews" on reviews for select
  using (published = true);

-- Só administradores autorizados podem ver/criar/editar/excluir tudo
-- (incluindo rascunhos não publicados).
create policy "admin manage reviews" on reviews for all
  using (is_admin()) with check (is_admin());
