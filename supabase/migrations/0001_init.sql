-- Sítio Recanto Azul — schema inicial
-- Convenção: leitura pública liberada (site institucional), escrita restrita
-- exclusivamente ao(s) e-mail(s) cadastrados em `admin_users` (ver seção
-- "Lista de administradores" abaixo e o passo a passo no README.md).

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
  price_from numeric check (price_from is null or price_from >= 0),
  highlights text[] not null default '{}',
  amenities text[] not null default '{}',
  reserve_url text not null default '',
  order_index integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists accommodations_order_idx on accommodations (order_index);

create table if not exists accommodation_images (
  id uuid primary key default gen_random_uuid(),
  accommodation_slug text not null references accommodations(slug) on delete cascade,
  url text not null,
  alt text not null default '',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  unique (accommodation_slug, url)
);

create index if not exists accommodation_images_slug_idx
  on accommodation_images (accommodation_slug, order_index);

create table if not exists experiences (
  slug text primary key,
  name text not null,
  description text not null default '',
  image_url text not null default '',
  image_alt text not null default '',
  order_index integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists experiences_order_idx on experiences (order_index);

create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null unique,
  answer text not null,
  order_index integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists faqs_order_idx on faqs (order_index);

create table if not exists policies (
  id text primary key default 'main',
  content text not null default '',
  updated_at timestamptz not null default now()
);

-- =============================================================
-- Lista de administradores
-- =============================================================
-- Só e-mails cadastrados aqui podem escrever nas tabelas do site.
-- Depois de criar seu usuário em Authentication → Users, rode:
--   insert into admin_users (email) values ('seu-email@dominio.com');
-- Esta tabela não tem nenhuma policy de leitura/escrita pública: só é
-- acessível via a função is_admin() (security definer) ou pelo SQL Editor/
-- service_role. Isso evita que qualquer pessoa que se autocadastre no
-- Supabase Auth (signup público fica habilitado por padrão) consiga editar
-- o site só por estar "autenticada".
create table if not exists admin_users (
  email text primary key
);

alter table admin_users enable row level security;

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admin_users where email = (auth.jwt() ->> 'email')
  );
$$;

revoke all on function is_admin() from public;
grant execute on function is_admin() to authenticated, anon;

-- RLS: leitura pública, escrita restrita a quem está em admin_users.

alter table site_settings enable row level security;
alter table accommodations enable row level security;
alter table accommodation_images enable row level security;
alter table experiences enable row level security;
alter table faqs enable row level security;
alter table policies enable row level security;

create policy "public read site_settings" on site_settings for select using (true);
create policy "admin write site_settings" on site_settings for all
  using (is_admin()) with check (is_admin());

create policy "public read accommodations" on accommodations for select using (true);
create policy "admin write accommodations" on accommodations for all
  using (is_admin()) with check (is_admin());

create policy "public read accommodation_images" on accommodation_images for select using (true);
create policy "admin write accommodation_images" on accommodation_images for all
  using (is_admin()) with check (is_admin());

create policy "public read experiences" on experiences for select using (true);
create policy "admin write experiences" on experiences for all
  using (is_admin()) with check (is_admin());

create policy "public read faqs" on faqs for select using (true);
create policy "admin write faqs" on faqs for all
  using (is_admin()) with check (is_admin());

create policy "public read policies" on policies for select using (true);
create policy "admin write policies" on policies for all
  using (is_admin()) with check (is_admin());

-- Storage: bucket público para fotos das acomodações/experiências.
-- Leitura pública (necessária para o site exibir as fotos); escrita restrita
-- aos administradores cadastrados em admin_users.
insert into storage.buckets (id, name, public)
values ('accommodation-images', 'accommodation-images', true)
on conflict (id) do nothing;

create policy "public read accommodation-images bucket"
  on storage.objects for select
  using (bucket_id = 'accommodation-images');

create policy "admin write accommodation-images bucket"
  on storage.objects for all
  using (bucket_id = 'accommodation-images' and is_admin())
  with check (bucket_id = 'accommodation-images' and is_admin());

-- =============================================================
-- Conteúdo inicial (seed)
-- =============================================================
-- Idêntico ao fallback em src/lib/content.ts. Popular o banco desde já evita
-- um estado ambíguo em que o painel edita uma linha nova enquanto o restante
-- do conteúdo ainda vem do fallback local. Tudo aqui é editável depois pelo
-- painel /admin.

insert into site_settings (id, site_name, tagline, phone, whatsapp, email, instagram, address, default_reserve_url)
values (
  'main',
  'Sítio Recanto Azul',
  'Natureza, privacidade e experiências para casais e grupos',
  '(00) 00000-0000',
  '5500000000000',
  'contato@sitiorecantoazul.com.br',
  'https://instagram.com/sitiorecantoazul',
  'Endereço a confirmar',
  'https://wa.me/5500000000000'
)
on conflict (id) do nothing;

insert into accommodations (slug, name, tagline, description, capacity, highlights, amenities, reserve_url, order_index)
values
  (
    'agata', 'Ágata', 'Hidro com vista e rede horizontal para dias lentos',
    'Um refúgio pensado para casais que buscam sossego. A Ágata combina conforto discreto com uma vista que convida a desacelerar — ideal para dias sem pressa, banhos demorados na hidro e tardes na rede horizontal.',
    '2 hóspedes',
    array['Hidro com vista', 'Rede horizontal'],
    array['Hidromassagem', 'Rede horizontal', 'Vista privativa'],
    'https://wa.me/5500000000000', 0
  ),
  (
    'mirante', 'Mirante', 'Hidro com vista panorâmica e rede horizontal',
    'Suspenso sobre a paisagem, o Mirante foi criado para quem quer acordar de frente para o horizonte. A hidromassagem com vista panorâmica transforma o fim de tarde em ritual, e a rede horizontal convida ao descanso prolongado.',
    '2 hóspedes',
    array['Hidro com vista panorâmica', 'Rede horizontal'],
    array['Hidromassagem panorâmica', 'Rede horizontal', 'Vista privativa'],
    'https://wa.me/5500000000000', 1
  ),
  (
    'doce-recanto', 'Doce Recanto', 'Hidro interna para uma estadia intimista',
    'Aconchegante e intimista, o Doce Recanto é o convite perfeito para uma pausa a dois, com hidromassagem interna e um ambiente pensado nos mínimos detalhes para o descanso.',
    '2 hóspedes',
    array['Hidro interna'],
    array['Hidromassagem interna'],
    'https://wa.me/5500000000000', 2
  ),
  (
    'domo-estelar', 'Domo Estelar', 'Teto transparente para dormir sob as estrelas',
    'A acomodação mais imersiva do Recanto Azul. O Domo Estelar combina teto transparente, mezanino, lareira ecológica e jacuzzi externa aquecida para uma experiência que mistura conforto e contato direto com o céu noturno.',
    '2 a 4 hóspedes',
    array['Jacuzzi externa aquecida', 'Banheira interna', 'Lareira ecológica', 'Chuveiro duplo', 'Telão/projetor', 'Mezanino', 'Teto transparente'],
    array['Jacuzzi externa aquecida', 'Banheira interna', 'Lareira ecológica', 'Chuveiro duplo', 'Telão com projetor', 'Mezanino', 'Teto transparente'],
    'https://wa.me/5500000000000', 3
  ),
  (
    'chale-para-grupos', 'Chalé para Grupos', 'Espaço amplo com galpão de festas e jacuzzi externa',
    'Pensado para reunir família e amigos, o Chalé para Grupos oferece uma casa completa com quartos, galpão de festas para celebrações e jacuzzi externa para relaxar depois de um dia cheio.',
    'Grupos',
    array['Capacidade para grupos', 'Galpão de festas', 'Casa com quartos', 'Jacuzzi externa'],
    array['Galpão de festas', 'Casa com múltiplos quartos', 'Jacuzzi externa'],
    'https://wa.me/5500000000000', 4
  ),
  (
    'celeiro', 'Celeiro', 'Até 11 hóspedes, com jacuzzi, lareira e sinuca',
    'O Celeiro é o ponto de encontro ideal para grupos maiores: jacuzzi externa coberta, lareira para noites frias, sinuca e churrasqueira para dias inteiros de convivência.',
    'Até 11 hóspedes',
    array['Até 11 hóspedes', 'Jacuzzi externa coberta', 'Lareira', 'Sinuca', 'Churrasqueira'],
    array['Jacuzzi externa coberta', 'Lareira', 'Sinuca', 'Churrasqueira'],
    'https://wa.me/5500000000000', 5
  )
on conflict (slug) do nothing;

-- Fotos placeholder (SVG locais do repositório). Substitua pelas fotos reais
-- pelo painel /admin assim que estiverem disponíveis.
insert into accommodation_images (accommodation_slug, url, alt, order_index)
values
  ('agata', '/images/placeholder/agata-1.svg', 'Acomodação Ágata — hidro com vista', 0),
  ('agata', '/images/placeholder/agata-2.svg', 'Acomodação Ágata — ambiente interno', 1),
  ('mirante', '/images/placeholder/mirante-1.svg', 'Acomodação Mirante — vista panorâmica', 0),
  ('mirante', '/images/placeholder/mirante-2.svg', 'Acomodação Mirante — ambiente interno', 1),
  ('doce-recanto', '/images/placeholder/doce-recanto-1.svg', 'Acomodação Doce Recanto — ambiente interno', 0),
  ('domo-estelar', '/images/placeholder/domo-1.svg', 'Domo Estelar — teto transparente', 0),
  ('domo-estelar', '/images/placeholder/domo-2.svg', 'Domo Estelar — jacuzzi externa', 1),
  ('chale-para-grupos', '/images/placeholder/chale-1.svg', 'Chalé para Grupos — área externa', 0),
  ('celeiro', '/images/placeholder/celeiro-1.svg', 'Celeiro — área de convivência', 0)
on conflict do nothing;

insert into experiences (slug, name, description, image_url, image_alt, order_index)
values
  ('mirante-por-do-sol', 'Mirante para o pôr do sol', 'Um ponto alto do sítio reservado para acompanhar o fim de tarde em silêncio.', '/images/placeholder/exp-mirante.svg', 'Mirante para o pôr do sol', 0),
  ('deck-nascer-do-sol', 'Deck para o nascer do sol', 'Um deck voltado para o horizonte, ideal para começar o dia com calma.', '/images/placeholder/exp-deck.svg', 'Deck para o nascer do sol', 1),
  ('balancos', 'Balanços pelo sítio', 'Balanços espalhados pela propriedade, para pausas simples em meio à natureza.', '/images/placeholder/exp-balancos.svg', 'Balanços pelo sítio', 2),
  ('piquenique', 'Piquenique', 'Um momento a dois ou em grupo, ao ar livre, cercado pela paisagem do Recanto Azul.', '/images/placeholder/exp-piquenique.svg', 'Piquenique', 3),
  ('passeio-a-cavalo', 'Passeio a cavalo', 'Uma forma tranquila de conhecer mais do sítio e da paisagem ao redor.', '/images/placeholder/exp-cavalo.svg', 'Passeio a cavalo', 4)
on conflict (slug) do nothing;

insert into faqs (question, answer, order_index)
values
  ('Como faço para reservar?', 'Você pode reservar diretamente pelo botão "Reservar" em qualquer acomodação, que te leva ao nosso canal de atendimento.', 0),
  ('Qual o horário de check-in e check-out?', 'Os horários serão informados no momento da confirmação da reserva.', 1),
  ('O sítio aceita animais de estimação?', 'Consulte disponibilidade diretamente com nossa equipe antes de reservar.', 2),
  ('Existe um número mínimo de noites?', 'As condições variam conforme a temporada e serão informadas no atendimento.', 3)
on conflict do nothing;

insert into policies (id, content)
values (
  'main',
  E'Conteúdo provisório. As políticas definitivas de reserva, cancelamento, check-in/check-out e regras da casa serão publicadas aqui e poderão ser editadas pelo painel administrativo.'
)
on conflict (id) do nothing;
