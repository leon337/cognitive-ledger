-- Dados exclusivamente sintéticos para o laboratório local. Não copiar dados reais.
insert into public.eventos_cognitivos (
  id, timestamp, tipo, status, titulo, resumo, contexto,
  assuntos, projetos, ideias, decisoes, hipoteses,
  questoes_abertas, proximos_passos, metadados
) values
  (
    'ec-lab-001', '2026-08-20T12:00:00Z', 'decisao', 'ativo',
    'Integração do ecossistema em modo somente leitura',
    'O laboratório deve recuperar contexto sem alterar eventos.',
    'Cenário sintético do Cognitive Ledger',
    array['continuidade', 'integracao'], array['MCF', 'Cognitive Ledger'],
    array['memoria externa'], array['usar leitura antes de escrita'],
    array['busca textual atende ao primeiro laboratório'],
    array['como medir relevancia textual?'], array['validar MCP local'],
    '{"sintetico": true}'::jsonb
  ),
  (
    'ec-lab-002', '2026-08-21T12:00:00Z', 'atualizacao_de_projeto', 'ativo',
    'Busca textual gratuita como padrão',
    'O modo textual substitui a dependência obrigatória de embeddings pagos.',
    'Cenário sintético do Cognitive Ledger',
    array['busca textual', 'custo zero'], array['Cognitive Ledger'],
    array['fallback deterministico'], array['desativar provedor pago por padrao'],
    array['pg_trgm recupera contexto suficiente no lab'],
    array['qual modelo local avaliar depois?'], array['executar E2E sem chave API'],
    '{"sintetico": true}'::jsonb
  ),
  (
    'ec-lab-003', '2026-08-22T12:00:00Z', 'hipotese', 'ativo',
    'Evento sintético não relacionado',
    'Registro usado para verificar que o ranking não devolve ruído.',
    'Laboratório isolado',
    array['qualidade'], array['Projeto Sintético'],
    '{}', '{}', array['limiar textual reduz ruido'], '{}', '{}',
    '{"sintetico": true}'::jsonb
  )
on conflict (id) do nothing;

insert into public.fontes (
  id, evento_id, tipo_de_fonte, provedor, referencia,
  escopo_da_captura, conteudo_bruto, metadados
) values
  (
    'fonte-lab-001', 'ec-lab-001', 'teste', 'laboratorio-local',
    'fixture://cognitive-ledger/ec-lab-001', 'fixture sintetica',
    'Conteúdo bruto exclusivamente sintético para testar a capability separada.',
    '{"sintetico": true}'::jsonb
  )
on conflict (id) do nothing;

insert into public.relacoes (
  id, evento_origem_id, evento_destino_id, tipo, rotulo
) values
  (
    'relacao-lab-001', 'ec-lab-002', 'ec-lab-001', 'revisa',
    'A estratégia textual revisa a dependência obrigatória de embeddings.'
  )
on conflict (id) do nothing;

insert into public.clientes_autorizados (
  client_id, owner_id, rotulo, capacidades, ativo, revogado_em, metadados
) values
  (
    'mcf-lab-readonly', '00000000-0000-0000-0000-000000000001',
    'MCF Lab Read-only',
    array['ler_diario', 'buscar_eventos', 'recuperar_contexto'],
    true, null, '{"sintetico": true}'::jsonb
  ),
  (
    'mcf-lab-raw-controlled', '00000000-0000-0000-0000-000000000001',
    'MCF Lab Raw Controlled',
    array['ler_diario', 'buscar_eventos', 'recuperar_contexto', 'ler_fonte_bruta'],
    true, null, '{"sintetico": true}'::jsonb
  )
on conflict (client_id) do nothing;

