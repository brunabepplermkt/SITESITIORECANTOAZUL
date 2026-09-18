-- Sítio Recanto Azul — schema inicial
-- Convenção: leitura pública liberada (site institucional), escrita restrita
-- a usuários autenticados (proprietário via painel /admin).

create table if not exists site_settings (
  id text primary key default 'main',
  site_name text not null default 'Sítio Recanto Azul',
  tagline text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  instagram text not null default '',
  address text not null default '',
  default_reserve_url text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists accommodations (
  slug text primary key,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  capacity text not null default '',
  price_from numeric,
  highlights text[] not null default '{}',
  amenities text[] not null default '{}',
  reserve_url text not null default '',
  order_index integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists accommodation_images (
  id uuid primary key default gen_random_uuid(),
  accommodation_slug text not null references accommodations(slug) on delete cascade,
  url text not null,
  alt text not null default '',
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists experiences (
  slug text primary key,
  name text not null,
  description text not null default '',
  image_url text not null default '',
  image_alt text not null default '',
  order_index integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  order_index integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists policies (
  id text primary key default 'main',
  content text not null default '',
  updated_at timestamptz not null default now()
);

-- RLS: leitura pública, escrita apenas para usuários autenticados.

alter table site_settings enable row level security;
alter table accommodations enable row level security;
alter table accommodation_images enable row level security;
alter table experiences enable row level security;
alter table faqs enable row level security;
alter table policies enable row level security;

create policy "public read site_settings" on site_settings for select using (true);
create policy "auth write site_settings" on site_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read accommodations" on accommodations for select using (true);
create policy "auth write accommodations" on accommodations for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read accommodation_images" on accommodation_images for select using (true);
create policy "auth write accommodation_images" on accommodation_images for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read experiences" on experiences for select using (true);
create policy "auth write experiences" on experiences for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read faqs" on faqs for select using (true);
create policy "auth write faqs" on faqs for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read policies" on policies for select using (true);
create policy "auth write policies" on policies for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage: bucket público para fotos das acomodações/experiências.
insert into storage.buckets (id, name, public)
values ('accommodation-images', 'accommodation-images', true)
on conflict (id) do nothing;

create policy "public read accommodation-images bucket"
  on storage.objects for select
  using (bucket_id = 'accommodation-images');

create policy "auth write accommodation-images bucket"
  on storage.objects for all
  using (bucket_id = 'accommodation-images' and auth.role() = 'authenticated')
  with check (bucket_id = 'accommodation-images' and auth.role() = 'authenticated');
