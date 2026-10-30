-- HUB 24 — Newsletter del settimanale (30/10/2026)
-- Iscritti alla copia gratuita della domenica e registro degli invii.
-- Da eseguire nel SQL Editor di Supabase.
-- Le tabelle sono gestite SOLO dalla Edge Function "hub24-newsletter" (service role):
-- nessun accesso diretto da browser, nemmeno in lettura.

create table if not exists public.hub24_iscritti (
  id            bigint generated always as identity primary key,
  email         text not null unique,
  nome          text,
  stato         text not null default 'in_attesa' check (stato in ('in_attesa','attivo','disiscritto')),
  token         uuid not null default gen_random_uuid(),
  consenso_il   timestamptz not null default now(),
  confermato_il timestamptz,
  disiscritto_il timestamptz,
  origine       text,
  creato_il     timestamptz not null default now()
);

create table if not exists public.hub24_invii (
  numero       integer primary key,
  data_numero  date not null,
  inviato_il   timestamptz not null default now(),
  destinatari  integer not null default 0
);

alter table public.hub24_iscritti enable row level security;
alter table public.hub24_invii enable row level security;
-- Nessuna policy: anon e utenti autenticati non leggono né scrivono.

-- Vista per l'Admin (conteggio iscritti), usabile dal SQL Editor:
-- select stato, count(*) from public.hub24_iscritti group by stato;
