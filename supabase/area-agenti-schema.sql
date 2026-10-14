-- Area Agenti FondoCasa Hub — schema v1 (14/10/2026)
-- Ruoli, profili, strumenti (CRM + Produttività), avvisi, archivio documenti per ruolo.

create type public.ruolo as enum ('admin','manager','agente','credito','staff');
create type public.reparto as enum ('amministrazione','marketing','property');

-- PROFILI -------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  email text not null,
  ruolo public.ruolo not null default 'agente',
  reparto public.reparto,
  team text,
  attivo boolean not null default true,
  creato_il timestamptz not null default now()
);
alter table public.profiles enable row level security;

create or replace function public.mio_ruolo() returns public.ruolo
language sql stable security definer set search_path = public as $$
  select ruolo from public.profiles where id = auth.uid() and attivo
$$;

create or replace function public.mio_reparto() returns public.reparto
language sql stable security definer set search_path = public as $$
  select reparto from public.profiles where id = auth.uid() and attivo
$$;

create or replace function public.sono_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.mio_ruolo() = 'admin', false)
$$;

create policy "profilo: leggo il mio, admin tutti" on public.profiles
  for select to authenticated using (id = auth.uid() or public.sono_admin());
create policy "profilo: solo admin modifica" on public.profiles
  for all to authenticated using (public.sono_admin()) with check (public.sono_admin());

-- Ogni nuovo utente invitato riceve un profilo (ruolo agente di default, l'admin lo cambia)
create or replace function public.nuovo_utente() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, nome)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nome', ''));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.nuovo_utente();

-- STRUMENTI (area CRM + menu Produttività) ---------------------------
create table public.strumenti (
  id bigint generated always as identity primary key,
  nome text not null,
  url text not null,
  categoria text not null check (categoria in ('crm','produttivita')),
  descrizione text,
  ruoli public.ruolo[] not null default '{admin,manager,agente,credito,staff}',
  ordine int not null default 0,
  attivo boolean not null default true
);
alter table public.strumenti enable row level security;

create policy "strumenti: vedo quelli del mio ruolo" on public.strumenti
  for select to authenticated
  using ((attivo and public.mio_ruolo() = any(ruoli)) or public.sono_admin());
create policy "strumenti: solo admin modifica" on public.strumenti
  for all to authenticated using (public.sono_admin()) with check (public.sono_admin());

-- AVVISI (home) -------------------------------------------------------
create table public.avvisi (
  id bigint generated always as identity primary key,
  titolo text not null,
  testo text,
  ruoli public.ruolo[] not null default '{admin,manager,agente,credito,staff}',
  pubblicato_il timestamptz not null default now(),
  scade_il date
);
alter table public.avvisi enable row level security;

create policy "avvisi: vedo quelli del mio ruolo" on public.avvisi
  for select to authenticated
  using ((public.mio_ruolo() = any(ruoli) and (scade_il is null or scade_il >= current_date)) or public.sono_admin());
create policy "avvisi: solo admin modifica" on public.avvisi
  for all to authenticated using (public.sono_admin()) with check (public.sono_admin());

-- DOCUMENTI (archivio privato, una cartella per livello) --------------
create or replace function public.posso_vedere_cartella(cartella text) returns boolean
language sql stable security definer set search_path = public as $$
  select case
    when public.mio_ruolo() is null then false
    when public.mio_ruolo() = 'admin' then true
    when cartella = '01-tutti' then true
    when cartella = '02-agenti' then public.mio_ruolo() in ('manager','agente')
    when cartella = '03-credito' then public.mio_ruolo() in ('manager','credito')
    when cartella = '04-manager' then public.mio_ruolo() = 'manager'
    when cartella = '05-amministrazione' then public.mio_ruolo() = 'staff' and public.mio_reparto() = 'amministrazione'
    when cartella = '06-marketing' then public.mio_ruolo() in ('manager','agente')
                                      or (public.mio_ruolo() = 'staff' and public.mio_reparto() = 'marketing')
    else false
  end
$$;

insert into storage.buckets (id, name, public) values ('documenti', 'documenti', false);

create policy "documenti: leggo le cartelle del mio ruolo" on storage.objects
  for select to authenticated
  using (bucket_id = 'documenti' and public.posso_vedere_cartella((storage.foldername(name))[1]));
create policy "documenti: solo admin carica" on storage.objects
  for insert to authenticated with check (bucket_id = 'documenti' and public.sono_admin());
create policy "documenti: solo admin aggiorna" on storage.objects
  for update to authenticated using (bucket_id = 'documenti' and public.sono_admin());
create policy "documenti: solo admin elimina" on storage.objects
  for delete to authenticated using (bucket_id = 'documenti' and public.sono_admin());

-- PERMESSI API --------------------------------------------------------
revoke all on public.profiles, public.strumenti, public.avvisi from anon;
grant select, insert, update, delete on public.profiles, public.strumenti, public.avvisi to authenticated;
revoke execute on function public.mio_ruolo(), public.mio_reparto(), public.sono_admin(), public.posso_vedere_cartella(text) from public, anon;
grant execute on function public.mio_ruolo(), public.mio_reparto(), public.sono_admin(), public.posso_vedere_cartella(text) to authenticated;

-- STRUMENTI INIZIALI --------------------------------------------------
insert into public.strumenti (nome, url, categoria, descrizione, ordine) values
  ('Vendilo CRM', 'https://vendilo.agentestrategico.it/login', 'crm', 'Gestione clienti e immobili — inserimento dati ogni giorno alle 19:00', 1),
  ('euromq', 'https://desk.euromq.it/auth/login', 'produttivita', 'Valutazioni immobiliari in autonomia', 1),
  ('Getrix', 'https://www.getrix.it/', 'produttivita', 'Gestionale annunci e pubblicazione sui portali', 2),
  ('Idealista', 'https://www.idealista.it/', 'produttivita', 'Portale annunci e richieste clienti', 3),
  ('RealMaps', 'https://realmapsbeta.portalerealmaps.it/login', 'produttivita', 'Trova numeri di telefono', 4);
