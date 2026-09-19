-- Sítio Recanto Azul — rodada técnica de correção e estabilização.
-- Idempotente e não-destrutiva: não recria tabelas existentes, não apaga
-- dados, não desativa RLS. Só ajusta policies, privilégios de função e
-- adiciona uma função utilitária + um índice.

-- =============================================================
-- 1) Conteúdo despublicado não deve ser público (achado #6)
-- =============================================================
-- Antes: "using (true)" liberava leitura de TODAS as linhas via REST público,
-- inclusive as despublicadas (accommodations/experiences/faqs ganharam a
-- coluna `published` na migration 0004, mas a policy de leitura nunca foi
-- atualizada para considerá-la). Corrige para o mesmo padrão já usado em
-- reviews/pages desde o início: visitante só lê published = true; quem tem
-- is_admin() continua lendo tudo via a policy "admin write ..." (for all).

drop policy if exists "public read accommodations" on accommodations;
create policy "public read published accommodations" on accommodations for select
  using (published = true);

drop policy if exists "public read experiences" on experiences;
create policy "public read published experiences" on experiences for select
  using (published = true);

drop policy if exists "public read faqs" on faqs;
create policy "public read published faqs" on faqs for select
  using (published = true);

-- =============================================================
-- 2) is_admin() — reduzir superfície (achado #8)
-- =============================================================
-- A função continua existindo e utilizável pelas policies (mesmo objeto,
-- mesmo esquema — nada muda para o RLS). O que muda: as policies de escrita/
-- administração passam a valer só para o papel `authenticated`, então o
-- papel `anon` nunca mais PRECISA de EXECUTE em is_admin() (antes, mesmo uma
-- consulta pública de visitante avaliava essa policy, já que ela valia para
-- todos os papéis por padrão). Com isso, revogamos EXECUTE de `anon`: um
-- visitante não autenticado não consegue mais chamar
-- `/rest/v1/rpc/is_admin` nem depender dela em nenhum caminho de leitura.
-- Login/administração continuam funcionando normalmente (papel
-- `authenticated` mantém EXECUTE).

alter policy "admin write site_settings" on site_settings to authenticated;
alter policy "admin write accommodations" on accommodations to authenticated;
alter policy "admin write accommodation_images" on accommodation_images to authenticated;
alter policy "admin write experiences" on experiences to authenticated;
alter policy "admin write faqs" on faqs to authenticated;
alter policy "admin write policies" on policies to authenticated;
alter policy "admin write accommodation-images bucket" on storage.objects to authenticated;
alter policy "admin manage reviews" on reviews to authenticated;
alter policy "admin manage pages" on pages to authenticated;
alter policy "admin manage page_blocks" on page_blocks to authenticated;
alter policy "admin write home_sections" on home_sections to authenticated;

revoke execute on function is_admin() from anon;

-- =============================================================
-- 3) Reordenação atômica (achado #12)
-- =============================================================
-- As rotinas de reordenar (fotos de acomodação, FAQ, seções da Home,
-- avaliações) trocavam a posição de duas linhas com dois UPDATEs
-- independentes: se o segundo falhasse (queda de rede, etc.), duas linhas
-- podiam ficar com o mesmo order_index até a próxima tentativa. Uma função
-- fazendo as duas trocas em uma única chamada é atômica (se a segunda parte
-- falhar, a primeira é desfeita) sem precisar de transação manual no
-- client. `security invoker` (padrão) + SQL dinâmico só sobre uma lista fixa
-- de tabelas conhecidas: continua sujeita à RLS de cada tabela (não é um
-- jeito de burlar is_admin()), e o nome de tabela/coluna nunca vem
-- diretamente de entrada arbitrária do usuário sem essa validação.
create or replace function reorder_swap(
  p_table text,
  p_id_column text,
  p_order_column text,
  p_id_a text,
  p_order_a integer,
  p_id_b text,
  p_order_b integer
)
returns void
language plpgsql
as $$
begin
  if p_table not in ('accommodation_images', 'faqs', 'home_sections', 'reviews', 'page_blocks') then
    raise exception 'reorder_swap: tabela não permitida: %', p_table;
  end if;
  if p_id_column not in ('id', 'key') then
    raise exception 'reorder_swap: coluna de id não permitida: %', p_id_column;
  end if;
  if p_order_column <> 'order_index' then
    raise exception 'reorder_swap: coluna de ordem não permitida: %', p_order_column;
  end if;

  execute format('update %I set %I = $1 where %I = $2', p_table, p_order_column, p_id_column)
    using p_order_b, p_id_a;
  execute format('update %I set %I = $1 where %I = $2', p_table, p_order_column, p_id_column)
    using p_order_a, p_id_b;
end;
$$;

revoke all on function reorder_swap(text, text, text, text, integer, text, integer) from public;
grant execute on function reorder_swap(text, text, text, text, integer, text, integer) to authenticated;

-- =============================================================
-- 4) Índice de FK sem índice (achado #18 — Performance Advisor)
-- =============================================================
create index if not exists reviews_accommodation_slug_idx
  on reviews (accommodation_slug);
