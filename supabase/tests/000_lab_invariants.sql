do $$
declare
  v_eventos integer;
  v_embeddings integer;
  v_auditorias integer;
  v_resultados integer;
begin
  select count(*) into v_eventos from public.eventos_cognitivos;
  select count(*) into v_embeddings
    from public.eventos_cognitivos where embedding is not null;
  select count(*) into v_auditorias from public.auditoria_acessos;
  select count(*) into v_resultados
    from public.buscar_eventos_hibrido(
      null, 'busca textual gratuita', null, null, null, null, null, 8
    );

  if v_eventos <> 3 then
    raise exception 'LAB_EVENTOS_ESPERADOS_3_OBTIDOS_%', v_eventos;
  end if;
  if v_embeddings <> 0 then
    raise exception 'LAB_EMBEDDINGS_DEVEM_SER_ZERO';
  end if;
  if v_auditorias <> 0 then
    raise exception 'LAB_AUDITORIA_DEVE_INICIAR_VAZIA';
  end if;
  if v_resultados < 1 then
    raise exception 'LAB_BUSCA_TEXTUAL_SEM_RESULTADO';
  end if;
end;
$$;

