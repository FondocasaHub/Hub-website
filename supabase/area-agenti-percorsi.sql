-- Area Agenti — Percorsi di inserimento da 90 giorni guidati da Chirone (7/11/2026).
-- Da eseguire dopo area-agenti-produttivita.sql (usa vedo_produttivita e i diari giornalieri).
--
-- Il Team Manager avvia il percorso, approva le fasi e lo chiude; il collaboratore spunta solo i compiti.

create table public.percorsi_inserimento (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null check (tipo in ('agente','senior','buyer','credito')),
  data_inizio date not null default current_date,
  fase_approvata int not null default 1 check (fase_approvata between 1 and 3),
  compiti jsonb not null default '{}'::jsonb,   -- {"2026-11-09-strumenti": {"fatto": true, "data": "2026-11-09"}, ...}
  stato text not null default 'in corso' check (stato in ('in corso','superato','chiuso')),
  nota_tm text not null default '',
  creato_da uuid default auth.uid() references public.profiles(id),
  creato_il timestamptz not null default now(),
  aggiornato_il timestamptz not null default now()
);
create unique index percorsi_un_solo_attivo on public.percorsi_inserimento (user_id) where stato = 'in corso';

-- Chi gestisce il percorso: l'admin o il manager del team del collaboratore.
create or replace function public.gestisco_percorso(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.mio_ruolo() = 'admin', false)
    or (public.mio_ruolo() = 'manager' and exists (
      select 1 from public.profiles p where p.id = uid and p.team is not null and p.team = public.mio_team()))
$$;

alter table public.percorsi_inserimento enable row level security;
create policy "percorsi: vedo il mio, il manager il suo team, l'admin tutti" on public.percorsi_inserimento
  for select to authenticated using (public.vedo_produttivita(user_id));
create policy "percorsi: li avvia il manager del team o l'admin" on public.percorsi_inserimento
  for insert to authenticated with check (public.gestisco_percorso(user_id));
create policy "percorsi: aggiornano il collaboratore (compiti), il manager e l'admin" on public.percorsi_inserimento
  for update to authenticated using (public.vedo_produttivita(user_id)) with check (public.vedo_produttivita(user_id));
create policy "percorsi: elimina solo l'admin" on public.percorsi_inserimento
  for delete to authenticated using (public.sono_admin());
revoke all on public.percorsi_inserimento from public, anon;
grant select, insert, update, delete on public.percorsi_inserimento to authenticated;

-- Il collaboratore può cambiare solo i compiti spuntati.
create or replace function public.percorsi_regole() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.creato_da := auth.uid();
    new.compiti := '{}'::jsonb;
    new.fase_approvata := 1;
    new.stato := 'in corso';
  elsif not public.gestisco_percorso(old.user_id) then
    new.user_id := old.user_id; new.tipo := old.tipo; new.data_inizio := old.data_inizio;
    new.fase_approvata := old.fase_approvata; new.stato := old.stato; new.nota_tm := old.nota_tm;
    new.creato_da := old.creato_da; new.creato_il := old.creato_il;
  end if;
  new.aggiornato_il := now();
  return new;
end $$;
create trigger percorsi_regole before insert or update on public.percorsi_inserimento
  for each row execute function public.percorsi_regole();

revoke execute on function public.gestisco_percorso(uuid) from public, anon;
grant execute on function public.gestisco_percorso(uuid) to authenticated;

-- I consulenti del credito compaiono nel riepilogo del team (per avviare il loro percorso).
create or replace function public.produttivita_team(p_dal date)
returns table (
  user_id uuid, nome text, team text, giorni int,
  contatti int, appuntamenti int, incarichi int, visite int, proposte int, ore numeric,
  obiettivo_annuo numeric, provvigione_media numeric, incarichi_per_vendita numeric,
  appuntamenti_per_incarico numeric, contatti_per_appuntamento numeric, giorni_mese numeric, mesi_anno numeric
)
language sql stable security definer set search_path = public as $$
  select p.id, p.nome, p.team,
    count(g.data)::int,
    coalesce(sum(g.contatti), 0)::int, coalesce(sum(g.appuntamenti), 0)::int, coalesce(sum(g.incarichi), 0)::int,
    coalesce(sum(g.visite), 0)::int, coalesce(sum(g.proposte), 0)::int, coalesce(sum(g.ore), 0),
    o.obiettivo_annuo, o.provvigione_media, o.incarichi_per_vendita,
    o.appuntamenti_per_incarico, o.contatti_per_appuntamento, o.giorni_mese, o.mesi_anno
  from public.profiles p
  left join public.produttivita_giorno g on g.user_id = p.id and g.data >= p_dal
  left join public.produttivita_obiettivi o on o.user_id = p.id
  where p.attivo
    and p.ruolo in ('agente', 'manager', 'credito')
    and (public.mio_ruolo() = 'admin' or (public.mio_ruolo() = 'manager' and p.team is not null and p.team = public.mio_team()))
  group by p.id, p.nome, p.team, o.user_id
  order by p.team, p.nome
$$;

select count(*) as percorsi from public.percorsi_inserimento;
