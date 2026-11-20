-- Area Agenti — Jarvis, cabina di regia dello Store Manager (20/11/2026).
-- I dati (Vendilo + comparti) stanno solo in questa tabella: il codice del sito contiene solo la grafica.
-- Chi vede: solo admin (Store Manager). Pagina: /area-agenti/jarvis
create table if not exists public.jarvis_dati (
  id int primary key default 1 check (id = 1),
  vendilo jsonb not null,
  comparti jsonb not null,
  aggiornato_il timestamptz not null default now()
);
alter table public.jarvis_dati enable row level security;
create policy "jarvis: solo admin legge" on public.jarvis_dati for select to authenticated using (public.sono_admin());
create policy "jarvis: solo admin scrive" on public.jarvis_dati for all to authenticated using (public.sono_admin()) with check (public.sono_admin());
