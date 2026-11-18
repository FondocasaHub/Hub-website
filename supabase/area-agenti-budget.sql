-- Area Agenti — Budget incassi per mese e per team (18/11/2026)
-- Lo inserisce lo Store Manager (o Claude su sua indicazione); lo leggono Store Manager e Amministrazione
-- per lo scostamento nel riepilogo annuale della pagina Fatturato.

create table if not exists public.budget_incassi (
  anno int not null check (anno between 2025 and 2100),
  mese int not null check (mese between 1 and 12),
  team text not null,
  importo numeric(12,2) not null check (importo >= 0),
  aggiornato_il timestamptz not null default now(),
  primary key (anno, mese, team)
);
alter table public.budget_incassi enable row level security;

create policy "budget: lettura store manager e amministrazione" on public.budget_incassi
  for select to authenticated using (public.sono_admin() or public.sono_amministrazione());
create policy "budget: scrive solo lo store manager" on public.budget_incassi
  for all to authenticated using (public.sono_admin()) with check (public.sono_admin());
revoke all on public.budget_incassi from anon;
grant select, insert, update, delete on public.budget_incassi to authenticated;
