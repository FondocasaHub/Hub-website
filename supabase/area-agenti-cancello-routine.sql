-- Area Agenti — Compiti giornalieri dei veterani (deciso da Nicola il 7/11/2026).
-- Da eseguire dopo area-agenti-cancello.sql. Le spunte stanno nel diario del giorno.
alter table public.produttivita_giorno add column if not exists routine jsonb not null default '{}'::jsonb;

-- cancello_team restituisce anche livello e ruoli extra (per scegliere i compiti: agente, senior, buyer, credito).
drop function if exists public.cancello_team();
create function public.cancello_team()
returns table (id uuid, nome text, ruolo public.ruolo, team text, creato_il timestamptz, livello text, ruoli_extra text[])
language sql stable security definer set search_path = public as $$
  select p.id, p.nome, p.ruolo, p.team, p.creato_il, p.livello, p.ruoli_extra
  from public.profiles p
  where p.attivo and p.ruolo in ('agente', 'credito')
    and (public.mio_ruolo() = 'admin' or (public.mio_ruolo() = 'manager' and p.team is not null and p.team = public.mio_team()))
  order by p.team, p.nome
$$;
revoke execute on function public.cancello_team() from public, anon;
grant execute on function public.cancello_team() to authenticated;

select count(*) filter (where routine <> '{}'::jsonb) as giorni_con_spunte from public.produttivita_giorno;
