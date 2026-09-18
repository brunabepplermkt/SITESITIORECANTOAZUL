-- Sítio Recanto Azul — expansão do CMS: seções da Home configuráveis,
-- campos adicionais de acomodação/experiência (capacidade detalhada, SEO,
-- destaque/ordem na Home, publicar/despublicar), configurações de reservas
-- (BookingProvider) e de marketing/analytics. Mesmo padrão de segurança
-- do restante do CMS (is_admin(), definida na migration 0001).

-- =============================================================
-- Seções da Home (título/subtítulo/texto/imagem/visibilidade/ordem)
-- =============================================================
-- Uma linha por seção fixa da Home (hero, intro, acomodacoes, experiencias,
-- avaliacoes, sitio, localizacao, cta_final). A lista de seções em si é fixa
-- no código (não é um page-builder livre); o que é editável é o conteúdo,
-- a visibilidade e a ordem entre elas.
create table if not exists home_sections (
  key text primary key,
  title text,
  subtitle text,
  body text,
  image_url text,
  image_alt text,
  button_label text,
  button_href text,
  visible boolean not null default true,
  order_index integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table home_sections enable row level security;

create policy "public read home_sections" on home_sections for select using (true);
create policy "admin write home_sections" on home_sections for all
  using (is_admin()) with check (is_admin());

insert into home_sections (key, order_index) values
  ('hero', 0),
  ('intro', 1),
  ('acomodacoes', 2),
  ('sitio', 3),
  ('experiencias', 4),
  ('avaliacoes', 5),
  ('cta_final', 6)
on conflict (key) do nothing;

-- =============================================================
-- Acomodações: capacidade detalhada, destaque/ordem na Home, SEO, status
-- =============================================================
alter table accommodations
  add column if not exists short_description text,
  add column if not exists adults integer,
  add column if not exists children integer,
  add column if not exists beds integer,
  add column if not exists rooms integer,
  add column if not exists bathrooms integer,
  add column if not exists published boolean not null default true,
  add column if not exists featured_home boolean not null default false,
  add column if not exists home_order integer not null default 0,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists og_image_url text;

-- Marca as 4 acomodações românticas já existentes como destaque da Home,
-- na mesma ordem que já era hardcoded no componente — preserva o
-- comportamento atual sem exigir que a proprietária reconfigure nada.
update accommodations set featured_home = true, home_order = 0 where slug = 'agata';
update accommodations set featured_home = true, home_order = 1 where slug = 'mirante';
update accommodations set featured_home = true, home_order = 2 where slug = 'doce-recanto';
update accommodations set featured_home = true, home_order = 3 where slug = 'domo-estelar';

-- =============================================================
-- Experiências: publicar/despublicar, CTA opcional, SEO (páginas futuras)
-- =============================================================
alter table experiences
  add column if not exists published boolean not null default true,
  add column if not exists cta_label text,
  add column if not exists cta_href text,
  add column if not exists seo_title text,
  add column if not exists seo_description text;

-- =============================================================
-- FAQ: publicar/despublicar (mesmo padrão de reviews/páginas/acomodações)
-- =============================================================
alter table faqs
  add column if not exists published boolean not null default true;

-- =============================================================
-- Configurações do site: contato consolidado, SEO padrão, reservas,
-- marketing/analytics — tudo em site_settings (fonte única), sem duplicar
-- a mesma informação em várias tabelas.
-- =============================================================
alter table site_settings
  add column if not exists google_maps_url text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists og_image_url text,
  -- Reservas (BookingProvider): "none" | "link" | "widget" | "zeloa"
  add column if not exists booking_provider text not null default 'link'
    check (booking_provider in ('none', 'link', 'widget', 'zeloa')),
  add column if not exists booking_base_url text,
  add column if not exists booking_open_mode text not null default 'new_tab'
    check (booking_open_mode in ('same_tab', 'new_tab')),
  add column if not exists booking_cta_label text not null default 'Reservar',
  add column if not exists booking_show_search_home boolean not null default false,
  add column if not exists booking_show_search_accommodation boolean not null default false,
  add column if not exists booking_show_calendar boolean not null default false,
  add column if not exists booking_widget_embed_url text,
  -- Marketing/analytics: IDs públicos de tracking apenas (nunca secrets).
  add column if not exists google_analytics_id text,
  add column if not exists meta_pixel_id text;
