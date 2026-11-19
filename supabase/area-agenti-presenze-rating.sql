-- Area Agenti — Presenze e Rating agente (richiesta di Nicola del 19/11/2026).
-- Da eseguire dopo area-agenti-one-to-one.sql, area-agenti-produttivita.sql (vedo_produttivita),
-- area-agenti-percorsi.sql (gestisco_percorso) e area-agenti-incassi.sql.
--
-- Il rating dell'agente (0–100) è la media pesata di:
--   fatturato (incassi del periodo come produttore / obiettivo annuo in proporzione ai giorni),
--   recensioni Google con il nome dell'agente (numero rispetto all'obiettivo + media stelle),
--   presenze a: riunioni settimanali, One to One mensili, riunioni di fine mese, eventi formativi FondoCasa,
--   convention aziendali, bootcamp Agente Strategico in città, eventi nazionali Agente Strategico.
-- I pesi li decide Nicola (tabella rating_impostazioni). Le voci senza dati nel periodo non pesano.

-- Eventi (una riga per riunione/evento) e presenze (una riga per convocato).
create table public.presenze_eventi (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in ('settimanale','one_to_one','fine_mese','formazione_fc','convention','bootcamp_as','nazionale_as')),
  titolo text not null default '' check (char_length(titolo) <= 120),
  data date not null,
  luogo text not null default '' check (char_length(luogo) <= 120),
  team text,                                   -- null = tutto lo store
  creato_da uuid default auth.uid() references public.profiles(id),
  creato_il timestamptz not null default now()
);
create index presenze_eventi_data on public.presenze_eventi (data desc);

create table public.presenze (
  evento_id bigint not null references public.presenze_eventi(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  stato text not null check (stato in ('presente','ritardo','assente','giustificato')),
  note text not null default '' check (char_length(note) <= 300),
  segnato_da uuid default auth.uid() references public.profiles(id),
  segnato_il timestamptz not null default now(),
  primary key (evento_id, user_id)
);
create index presenze_utente on public.presenze (user_id);

-- Recensioni per agente: arrivano da Google in automatico (funzione recensioni-google) o a mano.
-- user_id null = recensione con un nome ambiguo (es. due «Angela»): la assegna lo Store Manager o il Team Manager.
create table public.recensioni_agente (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  data date not null default current_date,
  fonte text not null default 'google' check (fonte in ('google','immobiliare','idealista','altro')),
  stelle int not null check (stelle between 1 and 5),
  cliente text not null default '' check (char_length(cliente) <= 120),
  testo text not null default '' check (char_length(testo) <= 4000),
  candidati uuid[] not null default '{}',      -- per le ambigue: chi potrebbe essere
  google_id text,
  creato_da uuid default auth.uid() references public.profiles(id),
  creato_il timestamptz not null default now()
);
create index recensioni_agente_utente on public.recensioni_agente (user_id, data);
-- Recensioni Google già lette dalla funzione (così una recensione assegnata a mano non torna «da assegnare»).
create table public.recensioni_google_viste (
  google_id text primary key,
  letta_il timestamptz not null default now()
);

create table public.rating_impostazioni (
  id int primary key default 1 check (id = 1),
  pesi jsonb not null default '{"fatturato":40,"recensioni":15,"settimanale":10,"one_to_one":8,"fine_mese":7,"formazione_fc":6,"convention":5,"bootcamp_as":5,"nazionale_as":4}'::jsonb,
  recensioni_mese numeric not null default 1 check (recensioni_mese >= 0),   -- obiettivo recensioni al mese per agente
  aggiornato_il timestamptz not null default now(),
  aggiornato_da uuid default auth.uid() references public.profiles(id)
);
insert into public.rating_impostazioni (id) values (1);

alter table public.presenze_eventi enable row level security;
alter table public.presenze enable row level security;
alter table public.recensioni_agente enable row level security;
alter table public.recensioni_google_viste enable row level security;
alter table public.rating_impostazioni enable row level security;

create policy "eventi: li vedono tutti" on public.presenze_eventi
  for select to authenticated using (public.mio_ruolo() is not null);
create policy "eventi: li crea l'admin o il manager per il suo team" on public.presenze_eventi
  for insert to authenticated with check (public.sono_admin() or (public.mio_ruolo() = 'manager' and team is not null and team = public.mio_team()));
create policy "eventi: li cambia l'admin o chi li ha creati" on public.presenze_eventi
  for update to authenticated using (public.sono_admin() or (public.mio_ruolo() = 'manager' and creato_da = auth.uid()))
  with check (public.sono_admin() or (public.mio_ruolo() = 'manager' and team is not null and team = public.mio_team()));
create policy "eventi: li elimina l'admin o chi li ha creati" on public.presenze_eventi
  for delete to authenticated using (public.sono_admin() or (public.mio_ruolo() = 'manager' and creato_da = auth.uid()));

create policy "presenze: vedo le mie, il manager il suo team, l'admin tutte" on public.presenze
  for select to authenticated using (public.vedo_produttivita(user_id));
create policy "presenze: le segna il manager del team o l'admin" on public.presenze
  for insert to authenticated with check (public.gestisco_percorso(user_id));
create policy "presenze: le corregge il manager del team o l'admin" on public.presenze
  for update to authenticated using (public.gestisco_percorso(user_id)) with check (public.gestisco_percorso(user_id));
create policy "presenze: le toglie il manager del team o l'admin" on public.presenze
  for delete to authenticated using (public.gestisco_percorso(user_id));

create policy "recensioni: vedo le mie, il manager il suo team e le ambigue, l'admin tutte" on public.recensioni_agente
  for select to authenticated using (
    (user_id is not null and public.vedo_produttivita(user_id))
    or (user_id is null and public.mio_ruolo() in ('admin','manager')));
create policy "recensioni: le inserisce il manager del team o l'admin" on public.recensioni_agente
  for insert to authenticated with check (user_id is not null and public.gestisco_percorso(user_id));
create policy "recensioni: assegna o corregge il manager del team o l'admin" on public.recensioni_agente
  for update to authenticated using (
    (user_id is null and public.mio_ruolo() in ('admin','manager')) or (user_id is not null and public.gestisco_percorso(user_id)))
  with check (user_id is not null and public.gestisco_percorso(user_id));
create policy "recensioni: elimina il manager del team o l'admin" on public.recensioni_agente
  for delete to authenticated using (public.sono_admin() or (user_id is not null and public.gestisco_percorso(user_id)));

create policy "rating impostazioni: le leggono tutti" on public.rating_impostazioni
  for select to authenticated using (public.mio_ruolo() is not null);
create policy "rating impostazioni: le cambia l'admin" on public.rating_impostazioni
  for update to authenticated using (public.sono_admin()) with check (public.sono_admin());

revoke all on public.presenze_eventi, public.presenze, public.recensioni_agente, public.recensioni_google_viste, public.rating_impostazioni from public, anon;
grant select, insert, update, delete on public.presenze_eventi, public.presenze, public.recensioni_agente to authenticated;
grant select, update on public.rating_impostazioni to authenticated;

create or replace function public.rating_impostazioni_regole() returns trigger
language plpgsql security definer set search_path = public as $$
begin new.id := 1; new.aggiornato_il := now(); new.aggiornato_da := auth.uid(); return new; end $$;
create trigger rating_impostazioni_regole before update on public.rating_impostazioni
  for each row execute function public.rating_impostazioni_regole();

create or replace function public.presenze_regole() returns trigger
language plpgsql security definer set search_path = public as $$
begin new.segnato_da := auth.uid(); new.segnato_il := now(); return new; end $$;
create trigger presenze_regole before insert or update on public.presenze
  for each row execute function public.presenze_regole();

-- Rating del periodo per le persone che chi chiama può vedere (sé stesso; il manager il suo team; l'admin tutti).
create or replace function public.rating_agenti(p_dal date, p_al date)
returns table (
  user_id uuid, nome text, team text, ruolo public.ruolo, livello text,
  fatturato numeric, obiettivo numeric, p_fatturato numeric,
  recensioni int, stelle numeric, p_recensioni numeric,
  presenze jsonb, rating numeric)
language plpgsql stable security definer set search_path = public as $$
declare
  imp public.rating_impostazioni;
  giorni numeric := greatest(p_al - p_dal + 1, 1);
  mesi numeric := greatest(p_al - p_dal + 1, 1) / 30.4375;
begin
  select * into imp from public.rating_impostazioni where id = 1;
  return query
  with persone as (
    select p.id, p.nome, p.team, p.ruolo, p.livello from public.profiles p
    where p.attivo and p.ruolo in ('agente','manager','credito','admin') and public.vedo_produttivita(p.id)
  ),
  fatt as (
    select i.produttore as uid, sum(i.importo) as tot from public.incassi i
    where i.data_incasso between p_dal and p_al group by 1
  ),
  rec as (
    select r.user_id as uid, count(*)::int as n, avg(r.stelle)::numeric as media from public.recensioni_agente r
    where r.user_id is not null and r.data between p_dal and p_al group by 1
  ),
  cnt as (
    select pr.user_id as uid, e.tipo,
      count(*) filter (where pr.stato = 'presente')::int as presenti,
      count(*) filter (where pr.stato = 'ritardo')::int as ritardi,
      count(*) filter (where pr.stato = 'assente')::int as assenti,
      count(*) filter (where pr.stato = 'giustificato')::int as giustificati
    from public.presenze pr join public.presenze_eventi e on e.id = pr.evento_id
    where e.data between p_dal and p_al group by 1, 2
  ),
  pres as (
    select c.uid, jsonb_object_agg(c.tipo, jsonb_build_object(
      'presenti', c.presenti, 'ritardi', c.ritardi, 'assenti', c.assenti, 'giustificati', c.giustificati,
      'punti', case when c.presenti + c.ritardi + c.assenti > 0
        then round(100.0 * (c.presenti + 0.5 * c.ritardi) / (c.presenti + c.ritardi + c.assenti), 1) end)) as j
    from cnt c group by c.uid
  ),
  base as (
    select pe.id, pe.nome, pe.team, pe.ruolo, pe.livello,
      coalesce(f.tot, 0) as fatturato,
      o.obiettivo_annuo as obiettivo,
      case when coalesce(o.obiettivo_annuo, 0) > 0
        then least(100, round(100.0 * coalesce(f.tot, 0) / (o.obiettivo_annuo * giorni / 365), 1)) end as p_fatturato,
      coalesce(r.n, 0) as recensioni,
      round(r.media, 2) as stelle,
      case when coalesce(r.n, 0) = 0 then 0
           when imp.recensioni_mese * mesi <= 0 then round(100.0 * r.media / 5, 1)
           else round(50.0 * least(1, r.n / (imp.recensioni_mese * mesi)) + 50.0 * r.media / 5, 1) end as p_recensioni,
      coalesce(pr.j, '{}'::jsonb) as presenze
    from persone pe
    left join fatt f on f.uid = pe.id
    left join public.produttivita_obiettivi o on o.user_id = pe.id
    left join rec r on r.uid = pe.id
    left join pres pr on pr.uid = pe.id
  )
  select b.id, b.nome, b.team, b.ruolo, b.livello, b.fatturato, b.obiettivo, b.p_fatturato,
    b.recensioni, b.stelle, b.p_recensioni, b.presenze,
    (select case when sum(w.peso) > 0 then round(sum(w.peso * w.punti) / sum(w.peso), 1) end
       from (select (kv.value)::numeric as peso,
                    case kv.key when 'fatturato' then b.p_fatturato
                                when 'recensioni' then b.p_recensioni
                                else (b.presenze -> kv.key ->> 'punti')::numeric end as punti
             from jsonb_each_text(imp.pesi) kv) w
      where w.punti is not null and w.peso > 0) as rating
  from base b
  order by 13 desc nulls last, 2;
end $$;
revoke execute on function public.rating_agenti(date, date) from public, anon;
grant execute on function public.rating_agenti(date, date) to authenticated;

-- Lettura automatica delle recensioni Google ogni 6 ore (funzione supabase/functions/recensioni-google).
select cron.schedule('recensioni-google-6h', '17 */6 * * *', $$
  select net.http_post(
    url := 'https://iymxkvrgkhfaqcyxjsyz.supabase.co/functions/v1/recensioni-google',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb)
$$);
