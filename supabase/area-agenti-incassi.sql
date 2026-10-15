-- Area Agenti — Registro incassi (15/10/2026), come il Report di produzione del 09/10/2026.
-- Lo Store Manager (Admin) inserisce ogni operazione incassata; l'area calcola e salva la ripartizione
-- (collaboratore, override Team Manager, Buyer, Marketing, Store Manager, quota Hub).
-- Chi vede: Store Manager, Amministrazione e Marketing tutto; Team Manager il proprio team;
-- ogni collaboratore le operazioni su cui matura un compenso.

create table public.incassi (
  id bigint generated always as identity primary key,
  creato_il timestamptz not null default now(),
  creato_da uuid default auth.uid() references public.profiles(id),
  data_incasso date not null,
  produttore uuid not null references public.profiles(id),
  produttore_nome text not null,
  produttore_livello text not null,
  team text,
  cliente text not null,
  indirizzo text,
  lato text not null check (lato in ('Venditore','Acquirente')),
  tipologia text not null default 'standard' check (tipologia in ('standard','segnalata','generica')),
  importo numeric(12,2) not null check (importo > 0),
  quote jsonb not null,                -- [{chi, nome, voce, pct, importo}]  chi = null per FC Punto Hub
  beneficiari uuid[] not null default '{}',
  note text
);
alter table public.incassi enable row level security;
create index incassi_data on public.incassi (data_incasso);

create or replace function public.vedo_tutti_incassi() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.sono_admin()
    or (public.mio_ruolo() = 'staff' and public.mio_reparto() in ('amministrazione','marketing')), false)
$$;
revoke execute on function public.vedo_tutti_incassi() from public, anon;
grant execute on function public.vedo_tutti_incassi() to authenticated;

create policy "incassi: lettura per ruolo" on public.incassi
  for select to authenticated using (
    public.vedo_tutti_incassi()
    or (public.mio_ruolo() = 'manager' and team is not null and team = public.mio_team())
    or (auth.uid() = any (beneficiari) and public.mio_ruolo() is not null)
  );
create policy "incassi: inserisce lo store manager" on public.incassi
  for insert to authenticated with check (public.sono_admin());
create policy "incassi: modifica lo store manager" on public.incassi
  for update to authenticated using (public.sono_admin()) with check (public.sono_admin());
create policy "incassi: elimina lo store manager" on public.incassi
  for delete to authenticated using (public.sono_admin());
revoke all on public.incassi from anon;
grant select, insert, update, delete on public.incassi to authenticated;

select nome, email, ruolo, reparto, team, livello from public.profiles where attivo order by team, livello;
