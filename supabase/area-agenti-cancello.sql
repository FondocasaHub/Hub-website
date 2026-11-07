-- Area Agenti — Cancello giornaliero (deciso da Nicola il 7/11/2026).
-- Da eseguire dopo area-agenti-produttivita.sql e area-agenti-percorsi.sql.
--
-- Agenti, buyer e consulenti del credito ogni mattina confermano il briefing di Chirone;
-- se il giorno lavorativo prima non hanno fatto i compiti (briefing, diario, compiti del percorso,
-- compiti del coaching e compito correttivo di Chirone) l'area resta bloccata finché non li
-- completano o finché il Team Manager non li sblocca con una motivazione. Weekend, festivi e
-- assenze segnate dal Team Manager non contano.

-- Presenza del giorno: briefing confermato, assenza giustificata, sblocco del Team Manager.
create table public.giornata_presenze (
  user_id uuid not null references public.profiles(id) on delete cascade,
  data date not null,
  briefing_il timestamptz,
  assenza text check (assenza in ('ferie','malattia','permesso','altro')),
  sblocco_il timestamptz,
  sblocco_da uuid references public.profiles(id),
  sblocco_motivo text not null default '' check (char_length(sblocco_motivo) <= 500),
  aggiornato_da uuid default auth.uid() references public.profiles(id),
  aggiornato_il timestamptz not null default now(),
  primary key (user_id, data)
);
create index giornata_presenze_data on public.giornata_presenze (data desc);

-- Compiti assegnati: dal coaching (One to One, messaggio settimanale), dal Team Manager, da Chirone.
create table public.compiti_assegnati (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  origine text not null default 'coaching' check (origine in ('coaching','manager','chirone')),
  testo text not null check (char_length(testo) between 3 and 500),
  dal date not null default ((now() at time zone 'Europe/Rome')::date),
  scadenza date not null,
  chiave text,                       -- per i compiti di Chirone: "chirone-AAAA-MM-GG" (uno al giorno)
  fatto_il timestamptz,
  annullato boolean not null default false,
  assegnato_da uuid default auth.uid() references public.profiles(id),
  creato_il timestamptz not null default now(),
  unique (user_id, chiave)
);
create index compiti_assegnati_aperti on public.compiti_assegnati (user_id, scadenza) where fatto_il is null and not annullato;

alter table public.giornata_presenze enable row level security;
alter table public.compiti_assegnati enable row level security;

create policy "presenze: vedo le mie, il manager il suo team, l'admin tutte" on public.giornata_presenze
  for select to authenticated using (public.vedo_produttivita(user_id));
create policy "presenze: scrivo le mie o quelle del mio team" on public.giornata_presenze
  for insert to authenticated with check (user_id = auth.uid() or public.gestisco_percorso(user_id));
create policy "presenze: aggiorno le mie o quelle del mio team" on public.giornata_presenze
  for update to authenticated using (user_id = auth.uid() or public.gestisco_percorso(user_id))
  with check (user_id = auth.uid() or public.gestisco_percorso(user_id));
create policy "presenze: elimina il manager del team o l'admin" on public.giornata_presenze
  for delete to authenticated using (public.gestisco_percorso(user_id));

create policy "compiti: vedo i miei, il manager il suo team, l'admin tutti" on public.compiti_assegnati
  for select to authenticated using (public.vedo_produttivita(user_id));
create policy "compiti: li assegna il manager del team, l'admin o Chirone a me" on public.compiti_assegnati
  for insert to authenticated with check (public.gestisco_percorso(user_id) or (user_id = auth.uid() and origine = 'chirone'));
create policy "compiti: aggiornano il collaboratore (fatto), il manager e l'admin" on public.compiti_assegnati
  for update to authenticated using (public.vedo_produttivita(user_id)) with check (public.vedo_produttivita(user_id));
create policy "compiti: elimina il manager del team o l'admin" on public.compiti_assegnati
  for delete to authenticated using (public.gestisco_percorso(user_id));

revoke all on public.giornata_presenze, public.compiti_assegnati from public, anon;
grant select, insert, update, delete on public.giornata_presenze, public.compiti_assegnati to authenticated;

-- Il collaboratore conferma solo il briefing di oggi; assenze e sblocchi solo il Team Manager o l'admin.
create or replace function public.presenze_regole() returns trigger
language plpgsql security definer set search_path = public as $$
declare oggi date := (now() at time zone 'Europe/Rome')::date;
begin
  new.aggiornato_il := now();
  new.aggiornato_da := auth.uid();
  if not public.gestisco_percorso(new.user_id) then
    if new.data <> oggi then raise exception 'Puoi confermare solo il briefing di oggi'; end if;
    if tg_op = 'INSERT' then
      new.assenza := null; new.sblocco_il := null; new.sblocco_da := null; new.sblocco_motivo := '';
      new.briefing_il := case when new.briefing_il is not null then now() end;
    else
      new.user_id := old.user_id; new.data := old.data;
      new.assenza := old.assenza; new.sblocco_il := old.sblocco_il; new.sblocco_da := old.sblocco_da; new.sblocco_motivo := old.sblocco_motivo;
      new.briefing_il := coalesce(old.briefing_il, case when new.briefing_il is not null then now() end);
    end if;
  else
    if new.sblocco_il is not null and (tg_op = 'INSERT' or old.sblocco_il is null) then
      if btrim(coalesce(new.sblocco_motivo, '')) = '' then raise exception 'Scrivi la motivazione dello sblocco'; end if;
      new.sblocco_il := now();
      new.sblocco_da := auth.uid();
    end if;
    if new.sblocco_il is null then new.sblocco_da := null; end if;
  end if;
  return new;
end $$;
create trigger presenze_regole before insert or update on public.giornata_presenze
  for each row execute function public.presenze_regole();

-- Il collaboratore può solo segnare fatto/non fatto; Chirone gli assegna al massimo il compito di oggi.
create or replace function public.compiti_regole() returns trigger
language plpgsql security definer set search_path = public as $$
declare oggi date := (now() at time zone 'Europe/Rome')::date;
begin
  if tg_op = 'INSERT' then
    new.assegnato_da := auth.uid();
    new.creato_il := now();
    new.fatto_il := null;
    new.annullato := false;
    if not public.gestisco_percorso(new.user_id) then
      new.origine := 'chirone'; new.dal := oggi; new.scadenza := oggi;
      new.chiave := 'chirone-' || to_char(oggi, 'YYYY-MM-DD');
    end if;
  else
    if not public.gestisco_percorso(old.user_id) then
      new.user_id := old.user_id; new.origine := old.origine; new.testo := old.testo; new.dal := old.dal;
      new.scadenza := old.scadenza; new.chiave := old.chiave; new.annullato := old.annullato;
      new.assegnato_da := old.assegnato_da; new.creato_il := old.creato_il;
    end if;
    if new.fatto_il is not null and old.fatto_il is null then new.fatto_il := now(); end if;
  end if;
  return new;
end $$;
create trigger compiti_regole before insert or update on public.compiti_assegnati
  for each row execute function public.compiti_regole();

-- Collaboratori soggetti al cancello visibili al Team Manager (il suo team) o all'admin (tutti).
create or replace function public.cancello_team()
returns table (id uuid, nome text, ruolo public.ruolo, team text, creato_il timestamptz)
language sql stable security definer set search_path = public as $$
  select p.id, p.nome, p.ruolo, p.team, p.creato_il
  from public.profiles p
  where p.attivo and p.ruolo in ('agente', 'credito')
    and (public.mio_ruolo() = 'admin' or (public.mio_ruolo() = 'manager' and p.team is not null and p.team = public.mio_team()))
  order by p.team, p.nome
$$;

revoke execute on function public.cancello_team() from public, anon;
grant execute on function public.cancello_team() to authenticated;

select (select count(*) from public.giornata_presenze) as presenze, (select count(*) from public.compiti_assegnati) as compiti;
