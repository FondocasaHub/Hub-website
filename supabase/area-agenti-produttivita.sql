-- Area Agenti — Produttività personale: obiettivi e diario giornaliero (Modulo Giornaliero Contatti HUB).
-- Da eseguire una sola volta su Supabase, dopo area-agenti-schema.sql e area-agenti-compensi.sql (mio_team).
--
-- Ogni collaboratore scrive solo i propri dati. Li leggono anche il Team Manager del suo team e l'admin.

-- Obiettivi personali: dal guadagno annuo voluto si ricavano i numeri di ogni giorno.
create table public.produttivita_obiettivi (
  user_id uuid primary key default auth.uid() references public.profiles(id) on delete cascade,
  obiettivo_annuo numeric not null default 30000 check (obiettivo_annuo >= 0),        -- provvigioni personali in euro
  provvigione_media numeric not null default 3000 check (provvigione_media > 0),      -- provvigione personale media per operazione
  incarichi_per_vendita numeric not null default 2 check (incarichi_per_vendita > 0),
  appuntamenti_per_incarico numeric not null default 5 check (appuntamenti_per_incarico > 0),
  contatti_per_appuntamento numeric not null default 80 check (contatti_per_appuntamento > 0),
  giorni_mese numeric not null default 22 check (giorni_mese between 1 and 31),
  mesi_anno numeric not null default 11 check (mesi_anno between 1 and 12),
  ore_giorno numeric not null default 8 check (ore_giorno between 1 and 24),
  aggiornato_il timestamptz not null default now()
);

-- Diario: una riga per persona e per giorno.
create table public.produttivita_giorno (
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  data date not null,
  contatti int not null default 0 check (contatti between 0 and 1000),
  appuntamenti int not null default 0 check (appuntamenti between 0 and 100),
  incarichi int not null default 0 check (incarichi between 0 and 100),
  visite int not null default 0 check (visite between 0 and 100),
  proposte int not null default 0 check (proposte between 0 and 100),
  ore numeric not null default 0 check (ore between 0 and 24),
  focus text not null default '' check (char_length(focus) <= 300),
  piano jsonb not null default '{}'::jsonb,   -- liste del modulo: obiettivi, team, importanti, supporto, inderogabili, deleghe, richiamare
  aggiornato_il timestamptz not null default now(),
  primary key (user_id, data)
);
create index produttivita_giorno_data on public.produttivita_giorno (data desc);

create or replace function public.vedo_produttivita(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select case
    when public.mio_ruolo() is null then false
    when uid = auth.uid() then true
    when public.mio_ruolo() = 'admin' then true
    when public.mio_ruolo() = 'manager' then exists (
      select 1 from public.profiles p
      where p.id = uid and p.team is not null and p.team = public.mio_team())
    else false
  end
$$;

alter table public.produttivita_obiettivi enable row level security;
alter table public.produttivita_giorno enable row level security;

create policy "obiettivi: vedo i miei, il manager il suo team, l'admin tutti" on public.produttivita_obiettivi
  for select to authenticated using (public.vedo_produttivita(user_id));
create policy "obiettivi: scrivo solo i miei" on public.produttivita_obiettivi
  for insert to authenticated with check (user_id = auth.uid() and public.mio_ruolo() is not null);
create policy "obiettivi: aggiorno solo i miei" on public.produttivita_obiettivi
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "diario: vedo il mio, il manager il suo team, l'admin tutti" on public.produttivita_giorno
  for select to authenticated using (public.vedo_produttivita(user_id));
create policy "diario: scrivo solo il mio" on public.produttivita_giorno
  for insert to authenticated with check (user_id = auth.uid() and public.mio_ruolo() is not null);
create policy "diario: aggiorno solo il mio" on public.produttivita_giorno
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "diario: cancello solo il mio" on public.produttivita_giorno
  for delete to authenticated using (user_id = auth.uid());

revoke all on table public.produttivita_obiettivi, public.produttivita_giorno from public, anon;
grant select, insert, update on table public.produttivita_obiettivi to authenticated;
grant select, insert, update, delete on table public.produttivita_giorno to authenticated;

-- Riepilogo del team per il manager e l'admin: totali dal giorno indicato, con nome e obiettivi.
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
    and p.ruolo in ('agente', 'manager')
    and (public.mio_ruolo() = 'admin' or (public.mio_ruolo() = 'manager' and p.team is not null and p.team = public.mio_team()))
  group by p.id, p.nome, p.team, o.user_id
  order by p.team, p.nome
$$;

revoke execute on function public.vedo_produttivita(uuid), public.produttivita_team(date) from public, anon;
grant execute on function public.vedo_produttivita(uuid), public.produttivita_team(date) to authenticated;
