-- Area Agenti — Richieste "Ingaggio Marketing" (v2, 15/10/2026)
-- Gli agenti compilano il modulo dall'area; marketing, manager e admin le gestiscono.

create or replace function public.gestisco_marketing() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    public.mio_ruolo() in ('admin','manager')
    or (public.mio_ruolo() = 'staff' and public.mio_reparto() = 'marketing'),
  false)
$$;
revoke execute on function public.gestisco_marketing() from public, anon;
grant execute on function public.gestisco_marketing() to authenticated;

create table public.richieste_marketing (
  id bigint generated always as identity primary key,
  creato_il timestamptz not null default now(),
  utente uuid not null default auth.uid() references public.profiles(id),
  agente_nome text not null,
  agente_team text not null,
  agente_email text not null,
  codice_annuncio text not null,
  indirizzo text not null,
  dati jsonb not null,                       -- tutti i campi del modulo
  allegati jsonb not null default '[]',      -- [{percorso, nome, tipo, dimensione}]
  stato text not null default 'ricevuta'
    check (stato in ('ricevuta','in lavorazione','completata','respinta')),
  nota_marketing text,
  email_inviata_il timestamptz
);
alter table public.richieste_marketing enable row level security;

create policy "richieste: l'agente attivo inserisce le proprie" on public.richieste_marketing
  for insert to authenticated
  with check (utente = auth.uid() and public.mio_ruolo() is not null);
create policy "richieste: vedo le mie, marketing/manager/admin tutte" on public.richieste_marketing
  for select to authenticated
  using ((utente = auth.uid() and public.mio_ruolo() is not null) or public.gestisco_marketing());
create policy "richieste: solo marketing/manager/admin aggiornano" on public.richieste_marketing
  for update to authenticated
  using (public.gestisco_marketing()) with check (public.gestisco_marketing());
create policy "richieste: solo admin elimina" on public.richieste_marketing
  for delete to authenticated using (public.sono_admin());

revoke all on public.richieste_marketing from anon;
grant select, insert, update, delete on public.richieste_marketing to authenticated;

-- Allegati: bucket privato, una cartella per utente (<uid>/<id-pratica>/file), max 50 MB a file
insert into storage.buckets (id, name, public, file_size_limit)
values ('richieste', 'richieste', false, 52428800);

create policy "allegati: carico nella mia cartella" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'richieste' and (storage.foldername(name))[1] = auth.uid()::text and public.mio_ruolo() is not null);
create policy "allegati: vedo i miei, marketing/manager/admin tutti" on storage.objects
  for select to authenticated
  using (bucket_id = 'richieste' and (((storage.foldername(name))[1] = auth.uid()::text and public.mio_ruolo() is not null) or public.gestisco_marketing()));
create policy "allegati: solo admin elimina" on storage.objects
  for delete to authenticated using (bucket_id = 'richieste' and public.sono_admin());
