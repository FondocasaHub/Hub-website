-- Area Agenti — Report compensi v5 (15/10/2026): autorizzazione dello Store Manager
-- Flusso: report + pro-forma → approvazione Team Manager → autorizzazione Store Manager (Admin)
-- → verifica Amministrazione → fattura elettronica del collaboratore → pagamento.

alter table public.report_compensi drop constraint if exists report_compensi_stato_check;
alter table public.report_compensi add constraint report_compensi_stato_check
  check (stato in ('da approvare','da correggere','approvato','autorizzato','verificato','pagato'));
alter table public.report_compensi
  add column if not exists autorizzato_da text,
  add column if not exists autorizzato_il timestamptz,
  add column if not exists nota_sm text,
  add column if not exists email_sm_il timestamptz;

create or replace function public.report_dati_autore() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  select p.nome, p.email, p.team, p.livello into new.nome, new.email, new.team, new.livello
  from public.profiles p where p.id = auth.uid();
  new.utente := auth.uid();
  new.stato := 'da approvare';
  new.approvato_da := null; new.approvato_il := null; new.nota_tm := null;
  new.autorizzato_da := null; new.autorizzato_il := null; new.nota_sm := null;
  new.email_tm_il := null; new.email_sm_il := null; new.email_amministrazione_il := null;
  return new;
end $$;

-- Approvazione del Team Manager. Se approva l'Admin (Store Manager), il report è anche autorizzato.
create or replace function public.approva_report(rid bigint, approvato boolean, nota text default null) returns void
language plpgsql security definer set search_path = public as $$
declare chi text := (select coalesce(nullif(nome,''), email) from public.profiles where id = auth.uid());
declare sm boolean := public.sono_admin();
begin
  if not public.posso_approvare_report(rid) then raise exception 'Non puoi approvare questo report'; end if;
  update public.report_compensi set
    stato = case when not approvato then 'da correggere' when sm then 'autorizzato' else 'approvato' end,
    approvato_da = chi, approvato_il = now(), nota_tm = nota,
    autorizzato_da = case when approvato and sm then chi end,
    autorizzato_il = case when approvato and sm then now() end,
    nota_sm = null
  where id = rid and stato in ('da approvare','da correggere');
end $$;

-- Autorizzazione dello Store Manager (Admin)
create or replace function public.autorizza_report(rid bigint, autorizzato boolean, nota text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.sono_admin() then raise exception 'Solo lo Store Manager può autorizzare'; end if;
  update public.report_compensi set
    stato = case when autorizzato then 'autorizzato' else 'da correggere' end,
    autorizzato_da = (select coalesce(nullif(nome,''), email) from public.profiles where id = auth.uid()),
    autorizzato_il = now(), nota_sm = nota
  where id = rid and stato = 'approvato';
end $$;

-- L'Amministrazione vede i report solo dopo l'autorizzazione
drop policy if exists "report: vedo i miei, il mio team (manager), tutti (admin), gli approvati (amministrazione)" on public.report_compensi;
create policy "report: vedo i miei, il mio team (manager), tutti (admin), gli autorizzati (amministrazione)" on public.report_compensi
  for select to authenticated using (
    (utente = auth.uid() and public.mio_ruolo() is not null)
    or public.sono_admin()
    or (public.mio_ruolo() = 'manager' and team is not null and team = public.mio_team())
    or (public.sono_amministrazione() and stato in ('autorizzato','verificato','pagato'))
  );

-- Amministrazione: autorizzato → verificato → pagato
create or replace function public.lavora_report(rid bigint, nuovo_stato text, nota text default null) returns void
language plpgsql security definer set search_path = public as $$
declare attuale text := (select stato from public.report_compensi where id = rid);
begin
  if not (public.sono_amministrazione() or public.sono_admin()) then raise exception 'Solo Amministrazione'; end if;
  if not ((nuovo_stato = 'verificato' and attuale = 'autorizzato') or (nuovo_stato = 'pagato' and attuale = 'verificato')) then
    raise exception 'Passaggio non consentito: il report è "%"', attuale;
  end if;
  update public.report_compensi set stato = nuovo_stato, nota_amministrazione = coalesce(nota, nota_amministrazione) where id = rid;
end $$;

-- Email dello Store Manager (Admin) per la notifica
create or replace function public.email_store_manager(rid bigint) returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(distinct p.email), '{}') from public.profiles p
  where p.attivo and p.ruolo = 'admin'
    and exists (select 1 from public.report_compensi r where r.id = rid and (r.utente = auth.uid() or public.posso_approvare_report(rid)))
$$;

create or replace function public.segna_email_report(rid bigint, destinatario text) returns void
language sql security definer set search_path = public as $$
  update public.report_compensi set
    email_tm_il = case when destinatario = 'tm' then now() else email_tm_il end,
    email_sm_il = case when destinatario = 'sm' then now() else email_sm_il end,
    email_amministrazione_il = case when destinatario = 'amministrazione' then now() else email_amministrazione_il end
  where id = rid and (utente = auth.uid() or public.posso_approvare_report(rid))
$$;

revoke execute on function public.autorizza_report(bigint, boolean, text), public.email_store_manager(bigint) from public, anon;
grant execute on function public.autorizza_report(bigint, boolean, text), public.email_store_manager(bigint) to authenticated;

select stato, count(*) from public.report_compensi group by stato;
