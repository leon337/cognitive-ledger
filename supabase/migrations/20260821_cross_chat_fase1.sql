create extension if not exists vector with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create table public.clientes_autorizados (
  client_id text primary key,
  owner_id uuid not null,
  rotulo text not null,
  capacidades text[] not null default '{}',
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  revogado_em timestamptz,
  metadados jsonb not null default '{}'
);
alter table public.clientes_autorizados enable row level security;

create table public.auditoria_acessos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  client_id text not null,
  operacao text not null,
  finalidade text not null,
  evento_ids text[] not null default '{}',
  quantidade integer not null default 0,
  fonte_bruta_acessada boolean not null default false,
  justificativa_fonte_bruta text,
  resultado text not null,
  degradado boolean not null default false,
  erro_codigo text,
  criado_em timestamptz not null default now()
);
alter table public.auditoria_acessos enable row level security;

alter table public.eventos_cognitivos
  add column embedding extensions.vector(1024),
  add column embedding_model text,
  add column embedding_atualizado_em timestamptz;

create index eventos_cognitivos_embedding_hnsw_idx
  on public.eventos_cognitivos
  using hnsw (embedding extensions.vector_cosine_ops);

create or replace function public.buscar_eventos_hibrido(
  query_embedding extensions.vector(1024) default null,
  query_text text default null,
  filtro_projetos text[] default null,
  filtro_assuntos text[] default null,
  filtro_tipos text[] default null,
  inicio timestamptz default null,
  fim timestamptz default null,
  limite integer default 8
)
returns table (
  evento_id text,
  evento_timestamp timestamptz,
  evento_tipo text,
  titulo text,
  resumo text,
  contexto text,
  score_semantico double precision,
  score_textual double precision,
  score_recencia double precision,
  score_total double precision
)
language sql
stable
set search_path = public, extensions
as $$
  with parametros as (
    select
      greatest(1, least(coalesce(limite, 8), 12)) as limite_seguro,
      (
        coalesce(cardinality(filtro_projetos), 0) > 0
        or coalesce(cardinality(filtro_assuntos), 0) > 0
        or coalesce(cardinality(filtro_tipos), 0) > 0
        or inicio is not null
        or fim is not null
      ) as tem_filtro_exato
  ),
  candidatos as (
    select
      e.id as evento_id,
      e.timestamp as evento_timestamp,
      e.tipo as evento_tipo,
      e.titulo,
      e.resumo,
      e.contexto,
      case
        when query_embedding is null or e.embedding is null then 0.0
        else greatest(0.0, least(1.0, 1.0 - (e.embedding <=> query_embedding)))
      end::double precision as score_semantico,
      case
        when nullif(btrim(coalesce(query_text, '')), '') is null then 0.0
        else greatest(
          similarity(lower(coalesce(e.titulo, '')), lower(query_text)),
          similarity(lower(coalesce(e.resumo, '')), lower(query_text)),
          similarity(lower(coalesce(e.contexto, '')), lower(query_text))
        )
      end::double precision as score_textual,
      least(
        1.0,
        greatest(
          0.0,
          1.0 - (extract(epoch from (now() - e.timestamp)) / 31557600.0)
        )
      )::double precision as score_recencia
    from public.eventos_cognitivos e
    where
      (coalesce(cardinality(filtro_projetos), 0) = 0 or e.projetos && filtro_projetos)
      and (coalesce(cardinality(filtro_assuntos), 0) = 0 or e.assuntos && filtro_assuntos)
      and (coalesce(cardinality(filtro_tipos), 0) = 0 or e.tipo = any(filtro_tipos))
      and (inicio is null or e.timestamp >= inicio)
      and (fim is null or e.timestamp <= fim)
  ),
  pontuados as (
    select
      c.*,
      (0.60 * c.score_semantico + 0.25 * c.score_textual + 0.15 * c.score_recencia)::double precision as score_total
    from candidatos c
  )
  select
    p.evento_id,
    p.evento_timestamp,
    p.evento_tipo,
    p.titulo,
    p.resumo,
    p.contexto,
    p.score_semantico,
    p.score_textual,
    p.score_recencia,
    p.score_total
  from pontuados p
  cross join parametros cfg
  where cfg.tem_filtro_exato or p.score_total >= 0.30
  order by p.score_total desc, p.evento_timestamp desc
  limit (select limite_seguro from parametros);
$$;

revoke all on table public.clientes_autorizados from public, anon, authenticated;
revoke all on table public.auditoria_acessos from public, anon, authenticated;
grant all on table public.clientes_autorizados to service_role;
grant all on table public.auditoria_acessos to service_role;

revoke execute on function public.buscar_eventos_hibrido(
  extensions.vector, text, text[], text[], text[], timestamptz, timestamptz, integer
) from public, anon, authenticated;
grant execute on function public.buscar_eventos_hibrido(
  extensions.vector, text, text[], text[], text[], timestamptz, timestamptz, integer
) to service_role;
