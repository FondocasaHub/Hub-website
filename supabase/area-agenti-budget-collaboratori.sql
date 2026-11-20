-- Area Agenti — Budget 2027 per collaboratore (20/11/2026)
-- Obiettivi annui per collaboratore: fatturato e, per il credito, volumi erogati (mutui, prestiti, cessioni del quinto),
-- sia di produzione personale sia di store (ambito). Legge lo Store Manager, l'Amministrazione e il collaboratore stesso.

create table if not exists public.budget_collaboratori (
  anno int not null check (anno between 2025 and 2100),
  profilo uuid not null references public.profiles(id),
  voce text not null check (voce in ('fatturato','mutui','prestiti','cessioni_quinto')),
  ambito text not null default 'personale' check (ambito in ('personale','store')),
  importo numeric(14,2) not null check (importo >= 0),
  note text,
  aggiornato_il timestamptz not null default now(),
  primary key (anno, profilo, voce, ambito)
);
alter table public.budget_collaboratori enable row level security;
create policy "budget collaboratori: lettura SM, amministrazione e interessato" on public.budget_collaboratori
  for select to authenticated using (public.sono_admin() or public.sono_amministrazione() or profilo = auth.uid());
create policy "budget collaboratori: scrive solo lo store manager" on public.budget_collaboratori
  for all to authenticated using (public.sono_admin()) with check (public.sono_admin());
revoke all on public.budget_collaboratori from anon;
grant select, insert, update, delete on public.budget_collaboratori to authenticated;

-- Aggiornamenti successivi (20/11/2026): incarichi, suddivisione per trimestre, quota diretta del Buyer
alter table public.budget_collaboratori drop constraint if exists budget_collaboratori_voce_check;
alter table public.budget_collaboratori add constraint budget_collaboratori_voce_check
  check (voce in ('fatturato', 'mutui', 'prestiti', 'cessioni_quinto', 'incarichi'));
alter table public.budget_collaboratori add column if not exists trimestri jsonb;
alter table public.budget_collaboratori add column if not exists quota_diretta numeric(14,2);
