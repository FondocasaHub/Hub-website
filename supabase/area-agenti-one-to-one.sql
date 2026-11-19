-- Area Agenti — One to One mensile (richiesta di Nicola, preparata da Sensoria il 19/11/2026).
-- Da eseguire una sola volta su Supabase, dopo area-agenti-produttivita.sql (vedo_produttivita) e
-- area-agenti-percorsi.sql (gestisco_percorso).
--
-- Ogni collaboratore (agente, manager, credito) prenota il suo One to One dell'ultimo giorno lavorativo del mese,
-- dalle 11:00, e compila prima la «Verifica mensile» (pagina 4 della Scheda One to One · Obiettivi 2027).
-- Nicola (admin) vede e completa tutte le schede; il Team Manager quelle del suo team. Gli slot liberi e gli inviti
-- li gestisce la funzione «one-to-one» (supabase/functions/one-to-one), che legge anche il calendario di Nicola.

-- Impostazioni (una riga sola): email del calendario dei One to One, orari, giorni spostati e orari chiusi.
create table public.one_to_one_impostazioni (
  id int primary key default 1 check (id = 1),
  email_coach text not null default '' check (email_coach = '' or email_coach ~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$'),
  nome_coach text not null default 'Nicola' check (char_length(nome_coach) <= 60),
  dalle time not null default '11:00',
  alle time not null default '19:00',
  pausa_dalle time,
  pausa_alle time,
  durata int not null default 30 check (durata between 15 and 120),
  giorni_spostati jsonb not null default '{}'::jsonb,   -- {"2026-12": "2026-12-30"}: il giorno di quel mese, se non è l'ultimo lavorativo
  chiusi jsonb not null default '[]'::jsonb,            -- ["2026-11-30T15:00:00+01:00", ...]: orari che Nicola toglie
  aggiornato_il timestamptz not null default now(),
  aggiornato_da uuid default auth.uid() references public.profiles(id)
);
insert into public.one_to_one_impostazioni (id, pausa_dalle, pausa_alle) values (1, '13:00', '14:00');

-- Un One to One per collaboratore e mese: prenotazione e verifica mensile.
create table public.one_to_one (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  mese date not null check (mese = date_trunc('month', mese)::date),
  inizio timestamptz,
  fine timestamptz,
  ics_uid text not null default (gen_random_uuid()::text || '@fondocasahub.com'),
  ics_seq int not null default 0,
  scheda jsonb not null default '{}'::jsonb check (pg_column_size(scheda) < 30000),
  confermato_il timestamptz,                 -- «Confermo» del collaboratore
  semaforo text check (semaforo in ('verde','giallo','rosso')),
  note_coach text not null default '' check (char_length(note_coach) <= 2000),
  coach_confermato_il timestamptz,           -- «Confermo» del coach: da qui la scheda è chiusa per il collaboratore
  coach_id uuid references public.profiles(id),
  creato_il timestamptz not null default now(),
  aggiornato_il timestamptz not null default now(),
  aggiornato_da uuid default auth.uid() references public.profiles(id),
  unique (user_id, mese)
);
create unique index one_to_one_orario on public.one_to_one (inizio) where inizio is not null;
create index one_to_one_mese on public.one_to_one (mese desc);

alter table public.one_to_one_impostazioni enable row level security;
alter table public.one_to_one enable row level security;

create policy "one to one impostazioni: le leggono tutti" on public.one_to_one_impostazioni
  for select to authenticated using (true);
create policy "one to one impostazioni: le cambia l'admin" on public.one_to_one_impostazioni
  for update to authenticated using (public.sono_admin()) with check (public.sono_admin());

create policy "one to one: vedo il mio, il manager il suo team, l'admin tutti" on public.one_to_one
  for select to authenticated using (public.vedo_produttivita(user_id));
create policy "one to one: creo il mio o quello del mio team" on public.one_to_one
  for insert to authenticated with check (user_id = auth.uid() or public.gestisco_percorso(user_id));
create policy "one to one: aggiorno il mio o quello del mio team" on public.one_to_one
  for update to authenticated using (user_id = auth.uid() or public.gestisco_percorso(user_id))
  with check (user_id = auth.uid() or public.gestisco_percorso(user_id));
create policy "one to one: elimina il manager del team o l'admin" on public.one_to_one
  for delete to authenticated using (public.gestisco_percorso(user_id));

revoke all on public.one_to_one, public.one_to_one_impostazioni from public, anon;
grant select, insert, update, delete on public.one_to_one to authenticated;
grant select, update on public.one_to_one_impostazioni to authenticated;

-- Regole: il collaboratore non tocca la parte del coach; dopo il «Confermo» del coach la scheda è chiusa;
-- l'orario si sposta o si disdice fino a 24 ore prima; l'orario deve stare negli orari dei One to One.
create or replace function public.one_to_one_regole() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  imp public.one_to_one_impostazioni;
  coach boolean := public.gestisco_percorso(new.user_id) and new.user_id <> auth.uid();
  ora_roma time;
  giorno int;
begin
  select * into imp from public.one_to_one_impostazioni where id = 1;
  new.aggiornato_il := now();
  new.aggiornato_da := auth.uid();

  if tg_op = 'UPDATE' then
    new.user_id := old.user_id; new.mese := old.mese; new.ics_uid := old.ics_uid; new.creato_il := old.creato_il;
  end if;

  if not coach then
    if tg_op = 'INSERT' then
      new.semaforo := null; new.note_coach := ''; new.coach_confermato_il := null; new.coach_id := null; new.ics_seq := 0;
    else
      new.semaforo := old.semaforo; new.note_coach := old.note_coach;
      new.coach_confermato_il := old.coach_confermato_il; new.coach_id := old.coach_id;
      if old.coach_confermato_il is not null
         and (new.scheda is distinct from old.scheda or new.confermato_il is distinct from old.confermato_il) then
        raise exception 'La scheda è già confermata dal coach: per cambiarla chiedi a %', imp.nome_coach;
      end if;
    end if;
    -- orario: si sposta o si disdice fino a 24 ore prima, sempre nel futuro
    if tg_op = 'UPDATE' and new.inizio is distinct from old.inizio
       and old.inizio is not null and old.inizio < now() + interval '24 hours' then
      raise exception 'Mancano meno di 24 ore al One to One: per spostarlo o disdirlo chiama %', imp.nome_coach;
    end if;
    if new.inizio is not null and (tg_op = 'INSERT' or new.inizio is distinct from old.inizio) and new.inizio <= now() then
      raise exception 'Questo orario è già passato: scegline un altro';
    end if;
    if new.confermato_il is not null and (tg_op = 'INSERT' or old.confermato_il is null) then
      new.confermato_il := now();
    end if;
  else
    if new.coach_confermato_il is not null and (tg_op = 'INSERT' or old.coach_confermato_il is null) then
      new.coach_confermato_il := now();
      new.coach_id := auth.uid();
    end if;
  end if;

  if new.inizio is not null then
    ora_roma := (new.inizio at time zone 'Europe/Rome')::time;
    giorno := extract(isodow from (new.inizio at time zone 'Europe/Rome'));
    if date_trunc('month', new.inizio at time zone 'Europe/Rome')::date <> new.mese then
      raise exception 'L''orario non è nel mese di questo One to One';
    end if;
    if giorno > 5 or ora_roma < imp.dalle or ora_roma + make_interval(mins => imp.durata) > imp.alle
       or extract(minute from ora_roma)::int % 15 <> 0
       or (imp.pausa_dalle is not null and imp.pausa_alle is not null
           and ora_roma < imp.pausa_alle and ora_roma + make_interval(mins => imp.durata) > imp.pausa_dalle) then
      raise exception 'Orario fuori dagli orari dei One to One';
    end if;
    new.fine := new.inizio + make_interval(mins => imp.durata);
  else
    new.fine := null;
  end if;
  return new;
end $$;

create trigger one_to_one_regole before insert or update on public.one_to_one
  for each row execute function public.one_to_one_regole();

create or replace function public.one_to_one_impostazioni_regole() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.id := 1; new.aggiornato_il := now(); new.aggiornato_da := auth.uid();
  return new;
end $$;
create trigger one_to_one_impostazioni_regole before update on public.one_to_one_impostazioni
  for each row execute function public.one_to_one_impostazioni_regole();

-- Orari già presi in un periodo, senza dire da chi (serve a mostrare gli slot liberi a tutti).
create or replace function public.one_to_one_occupati(p_dal timestamptz, p_al timestamptz)
returns table (inizio timestamptz, fine timestamptz, mio boolean)
language sql stable security definer set search_path = public as $$
  select o.inizio, o.fine, o.user_id = auth.uid()
  from public.one_to_one o
  where public.mio_ruolo() is not null and o.inizio is not null and o.inizio < p_al and o.fine > p_dal
$$;
revoke execute on function public.one_to_one_occupati(timestamptz, timestamptz) from public, anon;
grant execute on function public.one_to_one_occupati(timestamptz, timestamptz) to authenticated;

-- Chi deve fare il One to One: i collaboratori attivi che chi chiama può seguire (admin tutti, manager il suo team).
create or replace function public.one_to_one_collaboratori()
returns table (user_id uuid, nome text, email text, ruolo public.ruolo, team text)
language sql stable security definer set search_path = public as $$
  select p.id, p.nome, p.email, p.ruolo, p.team
  from public.profiles p
  where p.attivo and p.ruolo in ('agente','manager','credito') and p.id <> auth.uid() and public.gestisco_percorso(p.id)
  order by p.nome
$$;
revoke execute on function public.one_to_one_collaboratori() from public, anon;
grant execute on function public.one_to_one_collaboratori() to authenticated;
