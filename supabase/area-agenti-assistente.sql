-- Area Agenti — Chirone, l'assistente HUB: documenti per ruolo, log delle domande e limite giornaliero.
-- Da eseguire una sola volta su Supabase, dopo area-agenti-schema.sql.
-- I testi dei documenti non stanno in questo repository: si caricano a parte.

-- Base di conoscenza: ogni utente legge solo i documenti del proprio ruolo.
-- ruoli: tutti, manager, agente, credito, staff, staff-marketing, staff-amministrazione, staff-property.
create table public.assistente_documenti (
  id text primary key,
  titolo text not null unique,
  ruoli text[] not null check (cardinality(ruoli) > 0),
  aggiornato date not null,
  corpo text not null
);
alter table public.assistente_documenti enable row level security;

create or replace function public.assistente_posso_leggere(ruoli text[]) returns boolean
language sql stable security definer set search_path = public as $$
  select case
    when public.mio_ruolo() is null then false
    when public.mio_ruolo() = 'admin' then true
    when 'tutti' = any(ruoli) then true
    when public.mio_ruolo()::text = any(ruoli) then true
    when public.mio_ruolo() = 'staff' then ('staff-' || public.mio_reparto()::text) = any(ruoli)
    else false
  end
$$;
revoke execute on function public.assistente_posso_leggere(text[]) from public, anon;
grant execute on function public.assistente_posso_leggere(text[]) to authenticated;

create policy "assistente_documenti: leggo quelli del mio ruolo" on public.assistente_documenti
  for select to authenticated using (public.assistente_posso_leggere(ruoli));
revoke all on table public.assistente_documenti from public, anon, authenticated;
grant select on table public.assistente_documenti to authenticated;

-- Log: nessuno scrive direttamente sulla tabella. Si passa dalle tre funzioni
-- qui sotto, che lavorano solo sull'utente che le chiama. Legge solo l'admin.
create table public.assistente_log (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles(id),
  ruolo text not null,
  domanda text not null check (char_length(domanda) <= 2000),
  risposta text,
  fonti_citate text[] not null default '{}',
  senza_fonte boolean not null default false,
  feedback smallint check (feedback in (1, -1)),
  created_at timestamptz not null default now()
);
create index assistente_log_utente_data on public.assistente_log (user_id, created_at desc);
create index assistente_log_data on public.assistente_log (created_at desc);

alter table public.assistente_log enable row level security;

create policy "assistente_log: legge solo l'admin" on public.assistente_log
  for select to authenticated using (public.sono_admin());

revoke all on table public.assistente_log from public, anon, authenticated;
grant select on table public.assistente_log to authenticated;

-- Registra la domanda e applica il limite di 50 al giorno (ora italiana).
-- Il blocco per utente evita che due richieste simultanee superino il limite.
-- Restituisce l'id e le domande restanti; id nullo = limite raggiunto.
create or replace function public.assistente_inizia(p_domanda text)
returns table (log_id bigint, restanti integer)
language plpgsql security definer set search_path = public as $$
declare
  limite constant integer := 50;
  usate integer;
  nuovo bigint;
begin
  if public.mio_ruolo() is null then
    raise exception 'utente non attivo' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('assistente:' || auth.uid()::text, 0));
  select count(*) into usate from public.assistente_log
    where user_id = auth.uid()
      and created_at >= (date_trunc('day', now() at time zone 'Europe/Rome') at time zone 'Europe/Rome');
  if usate >= limite then
    return query select null::bigint, 0;
    return;
  end if;
  insert into public.assistente_log (user_id, ruolo, domanda)
    values (
      auth.uid(),
      public.mio_ruolo()::text || coalesce('-' || public.mio_reparto()::text, ''),
      p_domanda
    )
    returning id into nuovo;
  return query select nuovo, limite - usate - 1;
end;
$$;

-- Salva la risposta di una propria domanda. Vale una sola volta per riga.
create or replace function public.assistente_completa(p_id bigint, p_risposta text, p_fonti text[], p_senza_fonte boolean)
returns void
language sql security definer set search_path = public as $$
  update public.assistente_log
    set risposta = p_risposta, fonti_citate = coalesce(p_fonti, '{}'), senza_fonte = coalesce(p_senza_fonte, false)
    where id = p_id and user_id = auth.uid() and risposta is null and public.mio_ruolo() is not null;
$$;

-- Salva il pollice su o giù di una propria risposta. p_voto nullo toglie il voto.
create or replace function public.assistente_feedback(p_id bigint, p_voto smallint)
returns void
language sql security definer set search_path = public as $$
  update public.assistente_log
    set feedback = p_voto
    where id = p_id and user_id = auth.uid() and public.mio_ruolo() is not null;
$$;

revoke execute on function public.assistente_inizia(text), public.assistente_completa(bigint, text, text[], boolean), public.assistente_feedback(bigint, smallint) from public, anon;
grant execute on function public.assistente_inizia(text), public.assistente_completa(bigint, text, text[], boolean), public.assistente_feedback(bigint, smallint) to authenticated;
