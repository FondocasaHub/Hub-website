-- Area Agenti — Dashboard Immobili, correzione del 03/11/2026
-- Una nuova richiesta si aggancia a una scheda esistente solo con lo stesso codice E lo stesso indirizzo:
-- gli agenti usano anche codici segnaposto come "00" per immobili diversi.
-- Maiuscole, spazi e punteggiatura dell'indirizzo non contano.

create or replace function public.immobile_da_richiesta(r public.richieste_marketing) returns bigint
language plpgsql security definer set search_path = public as $$
declare
  iid bigint;
  d jsonb := r.dati;
  numero constant text := '^\d+(\.\d+)?$';
  buyer uuid;
  consulente uuid;
begin
  select id into iid from public.immobili
  where lower(trim(riferimento_vendilo)) = lower(trim(r.codice_annuncio))
    and regexp_replace(lower(indirizzo), '[^a-z0-9]', '', 'g') = regexp_replace(lower(r.indirizzo), '[^a-z0-9]', '', 'g')
    and stato in ('attivo','in trattativa')
  order by id desc limit 1;

  if iid is null then
    select id into buyer from public.profiles
    where attivo and team = r.agente_team and (livello = 'buyer' or 'buyer' = any(ruoli_extra))
    order by creato_il limit 1;

    -- Se il Listing è anche consulente del credito gestisce lui i mutui dei suoi immobili,
    -- altrimenti la consulente del credito dello store.
    select id into consulente from public.profiles
    where id = r.utente and (ruolo = 'credito' or 'credito' = any(ruoli_extra) or 'credito_store' = any(ruoli_extra));
    if consulente is null then
      consulente := public.consulente_credito_store();
    end if;

    insert into public.immobili (richiesta_id, riferimento_vendilo, indirizzo, zona, team, contratto, tipologia,
      prezzo, mq, locali, classe_en, listing_id, buyer_id, consulente_credito_id)
    values (r.id, trim(r.codice_annuncio), r.indirizzo, d ->> 'zona', r.agente_team, d ->> 'contratto', d ->> 'tipologia',
      case when d ->> 'prezzo' ~ numero then (d ->> 'prezzo')::numeric end,
      case when d ->> 'mq' ~ numero then (d ->> 'mq')::numeric end,
      case when d ->> 'locali' ~ numero then (d ->> 'locali')::numeric end,
      d ->> 'classe_en', r.utente, buyer, consulente)
    returning id into iid;
  end if;

  insert into public.documenti_immobile (immobile_id, tipo, bucket, file, nome, dimensione, caricato_da)
  select iid,
    case a ->> 'tipo' when 'pratica' then 'pratica edilizia' when 'relazione' then 'relazione tecnica'
      when 'foto' then 'foto' when 'video' then 'video' when 'planimetria' then 'planimetria' else 'altro' end,
    'richieste', a ->> 'percorso', a ->> 'nome', (a ->> 'dimensione')::bigint, r.utente
  from jsonb_array_elements(r.allegati) a
  on conflict (bucket, file) do nothing;

  return iid;
end $$;
revoke execute on function public.immobile_da_richiesta(public.richieste_marketing) from public, anon, authenticated;
