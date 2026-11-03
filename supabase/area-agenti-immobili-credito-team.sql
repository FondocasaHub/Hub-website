-- Area Agenti — Dashboard Immobili, correzione del 03/11/2026
-- 1. La consulente del credito dello store si indica con 'credito_store' in ruoli_extra:
--    oggi è un'agente con doppio ruolo, non un utente con ruolo principale Credito.
-- 2. L'email "Nuovo immobile" arriva anche all'Admin che guida un team (Team Nigido).
-- Da eseguire nel SQL Editor di Supabase PRIMA di pubblicare il sito con questa modifica.

alter table public.profiles drop constraint if exists profiles_ruoli_extra_check;
alter table public.profiles add constraint profiles_ruoli_extra_check
  check (ruoli_extra <@ array['buyer','credito','credito_store','listing']);

update public.profiles
set ruoli_extra = array(select distinct unnest(ruoli_extra || array['credito','credito_store']))
where nome = 'Angela Chiocca' and attivo;

create or replace function public.consulente_credito_store() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.profiles
  where attivo and ('credito_store' = any(ruoli_extra) or (ruolo = 'credito' and not ('listing' = any(ruoli_extra))))
  order by ('credito_store' = any(ruoli_extra)) desc, creato_il
  limit 1
$$;
revoke execute on function public.consulente_credito_store() from public, anon, authenticated;

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
  where lower(trim(riferimento_vendilo)) = lower(trim(r.codice_annuncio)) and stato in ('attivo','in trattativa')
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

create or replace function public.destinatari_notifica_immobile(iid bigint) returns setof text
language sql stable security definer set search_path = public as $$
  select distinct p.email from public.profiles p
  join public.immobili i on i.id = iid and p.team = i.team
  where p.attivo and public.vedo_immobile(iid)
    and (p.ruolo in ('manager','admin') or p.livello = 'buyer' or 'buyer' = any(p.ruoli_extra) or p.id = i.buyer_id)
$$;

-- Schede già create senza consulente.
update public.immobili i
set consulente_credito_id = coalesce(
  (select p.id from public.profiles p where p.id = i.listing_id and ('credito' = any(p.ruoli_extra) or 'credito_store' = any(p.ruoli_extra) or p.ruolo = 'credito')),
  public.consulente_credito_store())
where i.consulente_credito_id is null;

-- Testi con gli accenti: alla prima esecuzione erano arrivati con la codifica sbagliata.
update public.attivita_catalogo set titolo = 'Priorità visite ai qualificati' where codice = 'f3_priorita';
update public.attivita_catalogo set titolo = 'Documentazione già raccolta' where codice = 'f4_documentazione';
update public.attivita_catalogo set titolo = 'Report settimanale alla proprietà' where codice = 'f5_report';
update public.attivita_catalogo set titolo = 'Attività su Vendilo' where codice = 'f5_vendilo';

create or replace function public.immobili_guardia() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  cambiati text[];
  consentiti text[] := '{}';
begin
  new.updated_at := now();
  if auth.uid() is null or public.sono_admin() or (public.mio_ruolo() = 'manager' and old.team = public.mio_team()) then
    return new;
  end if;
  select coalesce(array_agg(n.key), '{}') into cambiati
  from jsonb_each(to_jsonb(new)) n
  where n.value is distinct from to_jsonb(old) -> n.key and n.key not in ('updated_at', 'notifica_inviata_il');
  if old.listing_id = auth.uid() then
    consentiti := consentiti || array['riferimento_vendilo','indirizzo','zona','contratto','tipologia','prezzo','mq','locali','classe_en','stato'];
  end if;
  if public.sono_buyer() and old.team = public.mio_team() then
    consentiti := consentiti || array['data_sopralluogo_marketing','data_open_house'];
  end if;
  if not cambiati <@ consentiti then
    raise exception 'Il tuo ruolo non può modificare questi dati dell''immobile' using errcode = '42501';
  end if;
  return new;
end $$;

create or replace function public.acquirenti_guardia() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if auth.uid() is null or public.gestisco_immobile(old.immobile_id) then return new; end if;
  if new.immobile_id is distinct from old.immobile_id then
    raise exception 'L''acquirente non può cambiare immobile' using errcode = '42501';
  end if;
  if public.sono_buyer_immobile(old.immobile_id) then
    -- L'esito del mutuo lo registra il consulente del credito.
    if new.esito_mutuo is distinct from old.esito_mutuo then
      raise exception 'L''esito del mutuo lo registra il consulente del credito' using errcode = '42501';
    end if;
  elsif new.nome is distinct from old.nome or new.stato is distinct from old.stato then
    raise exception 'Il consulente del credito registra solo esito e note' using errcode = '42501';
  end if;
  return new;
end $$;
