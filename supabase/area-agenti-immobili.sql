-- Area Agenti — Dashboard Immobili (v1, 03/11/2026)
-- Una scheda online per ogni incarico: nasce dal Modulo Ingaggio Marketing, la prosegue
-- la Buyer Agent del team. La proprietà vede un minisito in sola lettura con link a token.
-- Da eseguire nel SQL Editor di Supabase DOPO schema, richieste e compensi.
-- Poi: pubblicare la Edge Function "notifica-immobile" (stessi secrets di notifica-marketing).
--
-- Corrispondenza con i ruoli della specifica:
--   Store Manager = ruolo admin · Team Manager = ruolo manager + team
--   Buyer Agent = livello 'buyer' oppure 'buyer' in ruoli_extra
--   Consulente del credito = ruolo credito oppure 'credito' in ruoli_extra
--   Listing Agent = chi ha creato l'immobile (listing_id)

-- PROFILI: un utente può avere più ruoli ------------------------------
alter table public.profiles add column if not exists ruoli_extra text[] not null default '{}';
alter table public.profiles drop constraint if exists profiles_ruoli_extra_check;
alter table public.profiles add constraint profiles_ruoli_extra_check
  check (ruoli_extra <@ array['buyer','credito','listing']);

create or replace function public.sono_buyer() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select livello = 'buyer' or 'buyer' = any(ruoli_extra)
    from public.profiles where id = auth.uid() and attivo), false)
$$;

-- TABELLE -------------------------------------------------------------
create table public.immobili (
  id bigint generated always as identity primary key,
  richiesta_id bigint unique references public.richieste_marketing(id) on delete set null,
  riferimento_vendilo text not null,
  indirizzo text not null,
  zona text,
  team text not null check (team in ('Team Nigido','Team Esposito')),
  contratto text,
  tipologia text,
  prezzo numeric,
  mq numeric,
  locali numeric,
  classe_en text,
  listing_id uuid not null references public.profiles(id),
  buyer_id uuid references public.profiles(id),
  consulente_credito_id uuid references public.profiles(id),
  data_acquisizione date not null default current_date,
  data_sopralluogo_marketing date,
  data_open_house date,
  stato text not null default 'attivo' check (stato in ('attivo','in trattativa','venduto','ritirato')),
  notifica_inviata_il timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Il token sta in una tabella a parte: Buyer e Credito vedono l'immobile, non il link della proprietà.
create table public.minisiti (
  immobile_id bigint primary key references public.immobili(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  attivo boolean not null default true
);

create table public.documenti_immobile (
  id bigint generated always as identity primary key,
  immobile_id bigint not null references public.immobili(id) on delete cascade,
  tipo text not null check (tipo in ('planimetria','pratica edilizia','relazione tecnica','foto','video','altro')),
  bucket text not null default 'immobili' check (bucket in ('immobili','richieste')),
  file text not null,
  nome text not null,
  dimensione bigint,
  caricato_da uuid default auth.uid() references public.profiles(id),
  data timestamptz not null default now(),
  unique (bucket, file)
);

-- Le fasi della Procedura Buyer Agent v1.0 stanno nel database: check-list, avanzamento e minisito leggono da qui.
create table public.attivita_catalogo (
  codice text primary key,
  fase smallint not null,
  fase_titolo text not null,
  quando text,
  titolo text not null,
  responsabile text not null check (responsabile in ('buyer','listing','manager')),
  ordine smallint not null
);

insert into public.attivita_catalogo (codice, fase, fase_titolo, quando, titolo, responsabile, ordine) values
  ('f1_cartello',       1, 'Presidio della zona',    'Giorno 0-2', 'Cartello plastificato nel palazzo', 'buyer', 1),
  ('f1_civici',         1, 'Presidio della zona',    'Giorno 0-2', 'Chiamate ai civici vicini con copione', 'buyer', 2),
  ('f1_volantini',      1, 'Presidio della zona',    'Giorno 0-2', 'Volantinaggio con data Open House', 'buyer', 3),
  ('f1_vendilo',        1, 'Presidio della zona',    'Giorno 0-2', 'Esiti civici su Vendilo', 'buyer', 4),
  ('f2_richieste',      2, 'Riattivazione richieste','Giorno 1-3', 'Vecchie richieste in zona', 'buyer', 1),
  ('f2_influenza',      2, 'Riattivazione richieste','Giorno 1-3', 'Centri di influenza e conoscenti', 'buyer', 2),
  ('f2_vendilo',        2, 'Riattivazione richieste','Giorno 1-3', 'Inserimento su Vendilo', 'buyer', 3),
  ('f2_credito',        2, 'Riattivazione richieste','Giorno 1-3', 'Passaggio al credito degli interessati con mutuo', 'buyer', 4),
  ('f3_motivazione',    3, 'Prequalifica acquirenti','Continua',   'Motivazione', 'buyer', 1),
  ('f3_mutuo',          3, 'Prequalifica acquirenti','Continua',   'Mutuo con la consulente del credito', 'buyer', 2),
  ('f3_classificazione',3, 'Prequalifica acquirenti','Continua',   'Classificazione su Vendilo', 'buyer', 3),
  ('f3_priorita',       3, 'Prequalifica acquirenti','Continua',   'Priorità visite ai qualificati', 'buyer', 4),
  ('f4_documentazione', 4, 'Lancio e Open House',    'Open House entro 15 giorni dal sopralluogo', 'Documentazione già raccolta', 'listing', 1),
  ('f4_relazione',      4, 'Lancio e Open House',    'Open House entro 15 giorni dal sopralluogo', 'Relazione tecnica (Listing o geometra)', 'listing', 2),
  ('f4_anteprima',      4, 'Lancio e Open House',    'Open House entro 15 giorni dal sopralluogo', 'Anteprima nei gruppi Facebook', 'buyer', 3),
  ('f4_sopralluogo',    4, 'Lancio e Open House',    'Open House entro 15 giorni dal sopralluogo', 'Sopralluogo Marketing e data Open House', 'buyer', 4),
  ('f4_annuncio',       4, 'Lancio e Open House',    'Open House entro 15 giorni dal sopralluogo', 'Annuncio su portali e social', 'listing', 5),
  ('f4_open_house',     4, 'Lancio e Open House',    'Open House entro 15 giorni dal sopralluogo', 'Organizzazione Open House', 'buyer', 6),
  ('f5_vendilo',        5, 'Tracciamento e report',  'Fino alla vendita', 'Attività su Vendilo', 'buyer', 1),
  ('f5_report',         5, 'Tracciamento e report',  'Ogni settimana', 'Report settimanale alla proprietà', 'listing', 2),
  ('f5_revisione',      5, 'Tracciamento e report',  'Dopo 2 settimane', 'Revisione con il Team Manager', 'manager', 3);

create table public.attivita_immobile (
  immobile_id bigint not null references public.immobili(id) on delete cascade,
  codice_attivita text not null references public.attivita_catalogo(codice),
  completata boolean not null default false,
  data date,
  esito text,
  autore_id uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  primary key (immobile_id, codice_attivita)
);

-- Pubblicazione quotidiana: una riga per fascia oraria, con i gruppi usati.
create table public.pubblicazioni (
  id bigint generated always as identity primary key,
  immobile_id bigint not null references public.immobili(id) on delete cascade,
  data date not null default current_date,
  fascia text not null check (fascia in ('mattina','pranzo','sera')),
  canale text not null,
  autore_id uuid default auth.uid() references public.profiles(id),
  unique (immobile_id, data, fascia)
);

-- I numeri di ogni riga sono quelli della giornata: i totali e le settimane sono somme.
create table public.kpi_immobile (
  immobile_id bigint not null references public.immobili(id) on delete cascade,
  data date not null default current_date,
  civici_contattati int not null default 0 check (civici_contattati >= 0),
  volantini int not null default 0 check (volantini >= 0),
  vecchie_richieste int not null default 0 check (vecchie_richieste >= 0),
  nuovi_contatti int not null default 0 check (nuovi_contatti >= 0),
  prequalificati int not null default 0 check (prequalificati >= 0),
  presenze_open_house int not null default 0 check (presenze_open_house >= 0),
  visite int not null default 0 check (visite >= 0),
  proposte int not null default 0 check (proposte >= 0),
  visite_portali int not null default 0 check (visite_portali >= 0),
  messaggi_portali int not null default 0 check (messaggi_portali >= 0),
  messaggi_instagram int not null default 0 check (messaggi_instagram >= 0),
  messaggi_facebook int not null default 0 check (messaggi_facebook >= 0),
  messaggi_tiktok int not null default 0 check (messaggi_tiktok >= 0),
  messaggi_whatsapp int not null default 0 check (messaggi_whatsapp >= 0),
  email_inviate int not null default 0 check (email_inviate >= 0),
  autore_id uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  primary key (immobile_id, data)
);

-- Solo il necessario: i contatti degli acquirenti restano su Vendilo.
create table public.acquirenti_immobile (
  id bigint generated always as identity primary key,
  immobile_id bigint not null references public.immobili(id) on delete cascade,
  nome text not null,
  stato text not null default 'da finanziare' check (stato in ('pronto','da finanziare','non qualificato')),
  esito_mutuo text check (esito_mutuo in ('in corso','positivo','negativo')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Niente chiave esterna su immobile_id: lo storico sopravvive all'eliminazione della scheda.
create table public.storico_immobile (
  id bigint generated always as identity primary key,
  immobile_id bigint not null,
  tabella text not null,
  operazione text not null,
  riferimento text,
  modifiche jsonb,
  autore_id uuid,
  autore_nome text,
  quando timestamptz not null default now()
);
create index on public.storico_immobile (immobile_id, quando desc);

-- CHI PUÒ FARE COSA (security definer: evita la ricorsione tra le regole) --
create or replace function public.gestisco_immobile(iid bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select public.sono_admin() or exists (select 1 from public.immobili i
    where i.id = iid and public.mio_ruolo() = 'manager' and i.team = public.mio_team())
$$;

create or replace function public.sono_listing_immobile(iid bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select public.mio_ruolo() is not null and exists (select 1 from public.immobili i
    where i.id = iid and i.listing_id = auth.uid())
$$;

create or replace function public.sono_buyer_immobile(iid bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select public.sono_buyer() and exists (select 1 from public.immobili i
    where i.id = iid and i.team = public.mio_team())
$$;

create or replace function public.lavoro_immobile(iid bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select public.gestisco_immobile(iid) or public.sono_listing_immobile(iid) or public.sono_buyer_immobile(iid)
$$;

create or replace function public.sono_credito_immobile(iid bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select public.mio_ruolo() is not null and exists (select 1 from public.immobili i
    where i.id = iid and i.consulente_credito_id = auth.uid()
      and exists (select 1 from public.acquirenti_immobile a where a.immobile_id = i.id and a.stato = 'da finanziare'))
$$;

create or replace function public.vedo_immobile(iid bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select public.lavoro_immobile(iid) or public.sono_credito_immobile(iid)
$$;

create or replace function public.posso_spuntare(iid bigint, codice_att text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.gestisco_immobile(iid)
    or (public.sono_buyer_immobile(iid) and exists (select 1 from public.attivita_catalogo c where c.codice = codice_att and c.responsabile <> 'manager'))
    or (public.sono_listing_immobile(iid) and exists (select 1 from public.attivita_catalogo c where c.codice = codice_att and c.responsabile = 'listing'))
$$;

create or replace function public.vedo_allegato_immobile(percorso text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.documenti_immobile d
    where d.bucket = 'richieste' and d.file = percorso and public.vedo_immobile(d.immobile_id))
$$;

-- REGOLE RLS ----------------------------------------------------------
alter table public.immobili enable row level security;
alter table public.minisiti enable row level security;  -- nessuna regola: si passa dalle funzioni sotto
alter table public.documenti_immobile enable row level security;
alter table public.attivita_catalogo enable row level security;
alter table public.attivita_immobile enable row level security;
alter table public.pubblicazioni enable row level security;
alter table public.kpi_immobile enable row level security;
alter table public.acquirenti_immobile enable row level security;
alter table public.storico_immobile enable row level security;

create policy "immobili: vedo secondo il mio ruolo" on public.immobili
  for select to authenticated using (public.vedo_immobile(id));
create policy "immobili: modifico se ci lavoro" on public.immobili
  for update to authenticated using (public.lavoro_immobile(id))
  with check (public.sono_admin()
    or (public.mio_ruolo() = 'manager' and team = public.mio_team())
    or (public.sono_buyer() and team = public.mio_team())
    or listing_id = auth.uid());
create policy "immobili: solo admin elimina" on public.immobili
  for delete to authenticated using (public.sono_admin());

create policy "documenti immobile: vedo se vedo l'immobile" on public.documenti_immobile
  for select to authenticated using (public.vedo_immobile(immobile_id));
create policy "documenti immobile: carica Listing o manager" on public.documenti_immobile
  for insert to authenticated with check (public.sono_listing_immobile(immobile_id) or public.gestisco_immobile(immobile_id));
create policy "documenti immobile: elimina Listing o manager" on public.documenti_immobile
  for delete to authenticated using (public.sono_listing_immobile(immobile_id) or public.gestisco_immobile(immobile_id));

create policy "catalogo attività: lo leggono gli attivi" on public.attivita_catalogo
  for select to authenticated using (public.mio_ruolo() is not null);

create policy "attività: vedo se vedo l'immobile" on public.attivita_immobile
  for select to authenticated using (public.vedo_immobile(immobile_id));
create policy "attività: inserisco secondo il responsabile" on public.attivita_immobile
  for insert to authenticated with check (public.posso_spuntare(immobile_id, codice_attivita));
create policy "attività: aggiorno secondo il responsabile" on public.attivita_immobile
  for update to authenticated using (public.posso_spuntare(immobile_id, codice_attivita))
  with check (public.posso_spuntare(immobile_id, codice_attivita));

create policy "pubblicazioni: vedo se vedo l'immobile" on public.pubblicazioni
  for select to authenticated using (public.vedo_immobile(immobile_id));
create policy "pubblicazioni: inserisce Buyer o manager" on public.pubblicazioni
  for insert to authenticated with check (public.sono_buyer_immobile(immobile_id) or public.gestisco_immobile(immobile_id));
create policy "pubblicazioni: aggiorna Buyer o manager" on public.pubblicazioni
  for update to authenticated using (public.sono_buyer_immobile(immobile_id) or public.gestisco_immobile(immobile_id));
create policy "pubblicazioni: elimina Buyer o manager" on public.pubblicazioni
  for delete to authenticated using (public.sono_buyer_immobile(immobile_id) or public.gestisco_immobile(immobile_id));

create policy "kpi: vedo se vedo l'immobile" on public.kpi_immobile
  for select to authenticated using (public.vedo_immobile(immobile_id));
create policy "kpi: inserisce chi ci lavora" on public.kpi_immobile
  for insert to authenticated with check (public.lavoro_immobile(immobile_id));
create policy "kpi: aggiorna chi ci lavora" on public.kpi_immobile
  for update to authenticated using (public.lavoro_immobile(immobile_id));

-- Il consulente del credito vede solo gli acquirenti da finanziare dei suoi immobili.
create policy "acquirenti: vedo secondo il ruolo" on public.acquirenti_immobile
  for select to authenticated using (public.lavoro_immobile(immobile_id)
    or (stato = 'da finanziare' and exists (select 1 from public.immobili i
      where i.id = immobile_id and i.consulente_credito_id = auth.uid() and public.mio_ruolo() is not null)));
create policy "acquirenti: inserisce Buyer o manager" on public.acquirenti_immobile
  for insert to authenticated with check (public.sono_buyer_immobile(immobile_id) or public.gestisco_immobile(immobile_id));
create policy "acquirenti: aggiorna Buyer, manager o credito" on public.acquirenti_immobile
  for update to authenticated using (public.sono_buyer_immobile(immobile_id) or public.gestisco_immobile(immobile_id)
    or public.sono_credito_immobile(immobile_id));
create policy "acquirenti: elimina Buyer o manager" on public.acquirenti_immobile
  for delete to authenticated using (public.sono_buyer_immobile(immobile_id) or public.gestisco_immobile(immobile_id));

create policy "storico: lo vede chi lavora l'immobile" on public.storico_immobile
  for select to authenticated using (public.lavoro_immobile(immobile_id));

-- GUARDIE SUI CAMPI: la RLS decide le righe, queste decidono le colonne -
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
create trigger immobili_guardia before update on public.immobili
  for each row execute function public.immobili_guardia();

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
create trigger acquirenti_guardia before update on public.acquirenti_immobile
  for each row execute function public.acquirenti_guardia();

create or replace function public.firma_riga_immobile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.autore_id := auth.uid();
  new.updated_at := now();
  if tg_table_name = 'attivita_immobile' then
    if new.completata and new.data is null then new.data := current_date; end if;
  end if;
  return new;
end $$;
create trigger firma_attivita before insert or update on public.attivita_immobile
  for each row execute function public.firma_riga_immobile();
create trigger firma_kpi before insert or update on public.kpi_immobile
  for each row execute function public.firma_riga_immobile();

-- STORICO: ogni modifica con chi, cosa, quando ------------------------
create or replace function public.registra_storico_immobile() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  prima jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  dopo jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  riga jsonb := coalesce(dopo, prima);
  modifiche jsonb;
begin
  if tg_op = 'UPDATE' then
    select jsonb_object_agg(n.key, jsonb_build_object('prima', prima -> n.key, 'dopo', n.value)) into modifiche
    from jsonb_each(dopo) n
    where n.value is distinct from prima -> n.key and n.key not in ('updated_at', 'notifica_inviata_il');
    if modifiche is null then return null; end if;
  else
    modifiche := riga - 'updated_at' - 'notifica_inviata_il';
  end if;
  insert into public.storico_immobile (immobile_id, tabella, operazione, riferimento, modifiche, autore_id, autore_nome)
  values (
    case when tg_table_name = 'immobili' then (riga ->> 'id')::bigint else (riga ->> 'immobile_id')::bigint end,
    tg_table_name, lower(tg_op),
    coalesce(riga ->> 'codice_attivita', riga ->> 'data', riga ->> 'id'),
    modifiche, auth.uid(), (select nome from public.profiles where id = auth.uid())
  );
  return null;
end $$;
create trigger storico after insert or update or delete on public.immobili
  for each row execute function public.registra_storico_immobile();
create trigger storico after insert or delete on public.documenti_immobile
  for each row execute function public.registra_storico_immobile();
create trigger storico after insert or update or delete on public.attivita_immobile
  for each row execute function public.registra_storico_immobile();
create trigger storico after insert or update or delete on public.pubblicazioni
  for each row execute function public.registra_storico_immobile();
create trigger storico after insert or update or delete on public.kpi_immobile
  for each row execute function public.registra_storico_immobile();
create trigger storico after insert or update or delete on public.acquirenti_immobile
  for each row execute function public.registra_storico_immobile();

-- CREAZIONE DAL MODULO INGAGGIO MARKETING -----------------------------
-- Stesso annuncio ancora in lavorazione: nessuna nuova scheda, gli allegati si aggiungono a quella esistente.
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
    where id = r.utente and (ruolo = 'credito' or 'credito' = any(ruoli_extra));
    if consulente is null then
      select id into consulente from public.profiles
      where attivo and ruolo = 'credito' and not ('listing' = any(ruoli_extra))
      order by creato_il limit 1;
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

-- Un errore qui non deve mai bloccare l'invio del modulo al marketing.
create or replace function public.richiesta_crea_immobile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  begin
    perform public.immobile_da_richiesta(new);
  exception when others then
    raise warning 'Scheda immobile non creata dalla richiesta %: %', new.id, sqlerrm;
  end;
  return null;
end $$;
create trigger richiesta_crea_immobile after insert on public.richieste_marketing
  for each row execute function public.richiesta_crea_immobile();

create or replace function public.minisito_nuovo_immobile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.minisiti (immobile_id) values (new.id);
  return null;
end $$;
create trigger minisito_nuovo_immobile after insert on public.immobili
  for each row execute function public.minisito_nuovo_immobile();

-- FUNZIONI PER LA PAGINA ----------------------------------------------
-- Solo nomi e ruoli: i profili restano leggibili dal singolo utente e dall'Admin.
create or replace function public.colleghi_immobili()
returns table (id uuid, nome text, team text, ruolo public.ruolo, livello text, ruoli_extra text[])
language sql stable security definer set search_path = public as $$
  select p.id, p.nome, p.team, p.ruolo, p.livello, p.ruoli_extra
  from public.profiles p
  where p.attivo and public.mio_ruolo() is not null
  order by p.nome
$$;

create or replace function public.destinatari_notifica_immobile(iid bigint) returns setof text
language sql stable security definer set search_path = public as $$
  select distinct p.email from public.profiles p
  join public.immobili i on i.id = iid and p.team = i.team
  where p.attivo and public.vedo_immobile(iid)
    and (p.ruolo = 'manager' or p.livello = 'buyer' or 'buyer' = any(p.ruoli_extra) or p.id = i.buyer_id)
$$;

create or replace function public.segna_notifica_immobile(iid bigint) returns void
language sql security definer set search_path = public as $$
  update public.immobili set notifica_inviata_il = now() where id = iid and public.vedo_immobile(iid)
$$;

create or replace function public.link_minisito(iid bigint) returns uuid
language plpgsql security definer set search_path = public as $$
declare t uuid;
begin
  if not (public.sono_listing_immobile(iid) or public.gestisco_immobile(iid)) then
    raise exception 'Il link lo gestiscono il Listing Agent e i manager' using errcode = '42501';
  end if;
  select token into t from public.minisiti where immobile_id = iid and attivo;
  return t;
end $$;

-- Sostituisce il link: quello vecchio smette subito di funzionare.
create or replace function public.rigenera_minisito(iid bigint) returns uuid
language plpgsql security definer set search_path = public as $$
declare t uuid;
begin
  if not (public.sono_listing_immobile(iid) or public.gestisco_immobile(iid)) then
    raise exception 'Il link lo gestiscono il Listing Agent e i manager' using errcode = '42501';
  end if;
  update public.minisiti set token = gen_random_uuid(), attivo = true where immobile_id = iid returning token into t;
  return t;
end $$;

-- Il report della proprietà: nessun acquirente, nessuna nota libera, nessun nome di collaboratore.
create or replace function public.report_immobile_dati(iid bigint) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'report_data', current_date,
    'immobile', jsonb_build_object(
      'riferimento', i.riferimento_vendilo, 'indirizzo', i.indirizzo, 'zona', i.zona, 'contratto', i.contratto,
      'tipologia', i.tipologia, 'prezzo', i.prezzo, 'mq', i.mq, 'locali', i.locali, 'classe_en', i.classe_en,
      'stato', i.stato, 'data_acquisizione', i.data_acquisizione, 'data_open_house', i.data_open_house),
    'fasi', (
      select jsonb_agg(jsonb_build_object('fase', f.fase, 'titolo', f.fase_titolo, 'attivita', f.attivita) order by f.fase)
      from (
        select c.fase, c.fase_titolo,
          jsonb_agg(jsonb_build_object('titolo', c.titolo, 'completata', coalesce(a.completata, false),
            'data', case when a.completata then a.data end) order by c.ordine) as attivita
        from public.attivita_catalogo c
        left join public.attivita_immobile a on a.codice_attivita = c.codice and a.immobile_id = i.id
        group by c.fase, c.fase_titolo
      ) f),
    'pubblicazioni', (select count(*) from public.pubblicazioni p where p.immobile_id = i.id),
    'totali', (
      select jsonb_build_object(
        'civici_contattati', coalesce(sum(k.civici_contattati), 0), 'volantini', coalesce(sum(k.volantini), 0),
        'nuovi_contatti', coalesce(sum(k.nuovi_contatti), 0), 'prequalificati', coalesce(sum(k.prequalificati), 0),
        'presenze_open_house', coalesce(sum(k.presenze_open_house), 0), 'visite', coalesce(sum(k.visite), 0),
        'proposte', coalesce(sum(k.proposte), 0), 'visite_portali', coalesce(sum(k.visite_portali), 0),
        'messaggi_portali', coalesce(sum(k.messaggi_portali), 0), 'messaggi_instagram', coalesce(sum(k.messaggi_instagram), 0),
        'messaggi_facebook', coalesce(sum(k.messaggi_facebook), 0), 'messaggi_tiktok', coalesce(sum(k.messaggi_tiktok), 0),
        'messaggi_whatsapp', coalesce(sum(k.messaggi_whatsapp), 0), 'email_inviate', coalesce(sum(k.email_inviate), 0))
      from public.kpi_immobile k where k.immobile_id = i.id),
    'settimane', (
      select coalesce(jsonb_agg(s order by s.settimana), '[]') from (
        select date_trunc('week', k.data)::date as settimana,
          sum(k.visite_portali) as visite_portali,
          sum(k.messaggi_portali + k.messaggi_instagram + k.messaggi_facebook + k.messaggi_tiktok + k.messaggi_whatsapp) as messaggi,
          sum(k.nuovi_contatti) as nuovi_contatti,
          sum(k.visite) as visite
        from public.kpi_immobile k where k.immobile_id = i.id
        group by 1
      ) s))
  from public.immobili i where i.id = iid
$$;

create or replace function public.report_immobile(iid bigint) returns jsonb
language sql stable security definer set search_path = public as $$
  select case when public.lavoro_immobile(iid) then public.report_immobile_dati(iid) end
$$;

-- L'unica porta per chi non ha un account: il token apre un solo report, in sola lettura.
create or replace function public.minisito_immobile(tok uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select public.report_immobile_dati(m.immobile_id) from public.minisiti m where m.token = tok and m.attivo
$$;

-- ALLEGATI ------------------------------------------------------------
-- Bucket privato, una cartella per immobile (<id-immobile>/<file>), max 50 MB a file.
insert into storage.buckets (id, name, public, file_size_limit)
values ('immobili', 'immobili', false, 52428800);

create or replace function public.immobile_da_cartella(percorso text) returns bigint
language sql immutable as $$
  select case when split_part(percorso, '/', 1) ~ '^\d+$' then split_part(percorso, '/', 1)::bigint end
$$;

create policy "immobili file: vedo se vedo l'immobile" on storage.objects
  for select to authenticated
  using (bucket_id = 'immobili' and public.vedo_immobile(public.immobile_da_cartella(name)));
create policy "immobili file: carica Listing o manager" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'immobili' and (public.sono_listing_immobile(public.immobile_da_cartella(name)) or public.gestisco_immobile(public.immobile_da_cartella(name))));
create policy "immobili file: elimina Listing o manager" on storage.objects
  for delete to authenticated
  using (bucket_id = 'immobili' and (public.sono_listing_immobile(public.immobile_da_cartella(name)) or public.gestisco_immobile(public.immobile_da_cartella(name))));
-- Gli allegati del modulo restano nel bucket "richieste": li apre anche chi lavora l'immobile.
create policy "allegati: li vede anche chi vede l'immobile" on storage.objects
  for select to authenticated
  using (bucket_id = 'richieste' and public.vedo_allegato_immobile(name));

-- PERMESSI API --------------------------------------------------------
revoke all on public.immobili, public.minisiti, public.documenti_immobile, public.attivita_catalogo,
  public.attivita_immobile, public.pubblicazioni, public.kpi_immobile, public.acquirenti_immobile,
  public.storico_immobile from anon, authenticated;
grant select, update, delete on public.immobili to authenticated;
grant select, insert, delete on public.documenti_immobile to authenticated;
grant select on public.attivita_catalogo, public.storico_immobile to authenticated;
grant select, insert, update on public.attivita_immobile, public.kpi_immobile to authenticated;
grant select, insert, update, delete on public.pubblicazioni, public.acquirenti_immobile to authenticated;

revoke execute on function public.sono_buyer(), public.gestisco_immobile(bigint), public.sono_listing_immobile(bigint),
  public.sono_buyer_immobile(bigint), public.lavoro_immobile(bigint), public.sono_credito_immobile(bigint),
  public.vedo_immobile(bigint), public.posso_spuntare(bigint, text), public.vedo_allegato_immobile(text),
  public.immobile_da_richiesta(public.richieste_marketing), public.colleghi_immobili(),
  public.destinatari_notifica_immobile(bigint), public.segna_notifica_immobile(bigint), public.link_minisito(bigint),
  public.rigenera_minisito(bigint), public.report_immobile_dati(bigint), public.report_immobile(bigint),
  public.minisito_immobile(uuid), public.immobile_da_cartella(text) from public, anon;
grant execute on function public.sono_buyer(), public.gestisco_immobile(bigint), public.sono_listing_immobile(bigint),
  public.sono_buyer_immobile(bigint), public.lavoro_immobile(bigint), public.sono_credito_immobile(bigint),
  public.vedo_immobile(bigint), public.posso_spuntare(bigint, text), public.vedo_allegato_immobile(text),
  public.colleghi_immobili(), public.destinatari_notifica_immobile(bigint), public.segna_notifica_immobile(bigint),
  public.link_minisito(bigint), public.rigenera_minisito(bigint), public.report_immobile(bigint),
  public.immobile_da_cartella(text) to authenticated;
grant execute on function public.minisito_immobile(uuid) to anon, authenticated;

-- FACOLTATIVO: schede per gli incarichi già inviati prima di questa versione.
-- Da lanciare una volta sola, dopo aver controllato l'elenco degli utenti con ruolo e team:
-- select public.immobile_da_richiesta(r) from public.richieste_marketing r
--   where r.stato <> 'respinta' order by r.id;
