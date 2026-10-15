-- Area Agenti — Report provvigioni e compensi (v4, 15/10/2026)
-- Flusso (circolare 01/2026): il collaboratore compila il report del periodo con la
-- fattura allegata → il Team Manager del suo team approva → parte l'email
-- all'Amministrazione (contabilita2@fondocasa.com, cc na.vomero e Store Manager)
-- → l'Amministrazione segna "verificato" e "pagato".

-- Livello compensi del collaboratore (lo imposta l'Admin in Gestione → Utenti)
alter table public.profiles add column if not exists livello text
  check (livello in ('new','junior','senior','buyer','team_manager','store_manager','marketing','altro'));

create or replace function public.sono_amministrazione() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.mio_ruolo() = 'staff' and public.mio_reparto() = 'amministrazione', false)
$$;
create or replace function public.mio_team() returns text
language sql stable security definer set search_path = public as $$
  select team from public.profiles where id = auth.uid() and attivo
$$;

create table public.report_compensi (
  id bigint generated always as identity primary key,
  creato_il timestamptz not null default now(),
  utente uuid not null default auth.uid() references public.profiles(id),
  nome text,               -- copiati dal profilo dal trigger: non falsificabili
  email text,
  team text,
  livello text,
  periodo_inizio date not null,
  periodo_fine date not null,
  operazioni jsonb not null,          -- [{data_incasso, riferimento, tipo, voce, etichetta, base, aliquota, fisso, compenso}]
  totale_fatturato numeric(12,2) not null default 0,
  totale_compenso numeric(12,2) not null default 0,
  allegati jsonb not null default '[]',
  note text,
  stato text not null default 'da approvare'
    check (stato in ('da approvare','da correggere','approvato','verificato','pagato')),
  approvato_da text,
  approvato_il timestamptz,
  nota_tm text,
  nota_amministrazione text,
  email_tm_il timestamptz,
  email_amministrazione_il timestamptz
);
alter table public.report_compensi enable row level security;

-- Il trigger copia nome, email, team e livello dal profilo di chi invia
create or replace function public.report_dati_autore() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  select p.nome, p.email, p.team, p.livello into new.nome, new.email, new.team, new.livello
  from public.profiles p where p.id = auth.uid();
  new.utente := auth.uid();
  new.stato := 'da approvare';
  new.approvato_da := null; new.approvato_il := null;
  new.email_tm_il := null; new.email_amministrazione_il := null;
  return new;
end $$;
create trigger report_compensi_autore before insert on public.report_compensi
  for each row execute function public.report_dati_autore();

-- Chi approva: Admin, oppure un Manager dello stesso team (non i propri report)
create or replace function public.posso_approvare_report(rid bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.report_compensi r
    where r.id = rid and (
      public.sono_admin()
      or (public.mio_ruolo() = 'manager' and r.team is not null and r.team = public.mio_team() and r.utente <> auth.uid())
    )
  )
$$;

create policy "report: inserisco i miei" on public.report_compensi
  for insert to authenticated with check (utente = auth.uid() and public.mio_ruolo() is not null);
create policy "report: vedo i miei, il mio team (manager), tutti (admin), gli approvati (amministrazione)" on public.report_compensi
  for select to authenticated using (
    (utente = auth.uid() and public.mio_ruolo() is not null)
    or public.sono_admin()
    or (public.mio_ruolo() = 'manager' and team is not null and team = public.mio_team())
    or (public.sono_amministrazione() and stato in ('approvato','verificato','pagato'))
  );
create policy "report: solo admin elimina" on public.report_compensi
  for delete to authenticated using (public.sono_admin());
-- Nessuna policy di update: gli stati cambiano solo con le funzioni qui sotto.
revoke all on public.report_compensi from anon;
grant select, insert, delete on public.report_compensi to authenticated;

-- Approvazione del Team Manager
create or replace function public.approva_report(rid bigint, approvato boolean, nota text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.posso_approvare_report(rid) then raise exception 'Non puoi approvare questo report'; end if;
  update public.report_compensi set
    stato = case when approvato then 'approvato' else 'da correggere' end,
    approvato_da = (select coalesce(nullif(nome,''), email) from public.profiles where id = auth.uid()),
    approvato_il = now(),
    nota_tm = nota
  where id = rid and stato in ('da approvare','da correggere');
end $$;

-- Lavorazione dell'Amministrazione (o dell'Admin)
create or replace function public.lavora_report(rid bigint, nuovo_stato text, nota text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not (public.sono_amministrazione() or public.sono_admin()) then raise exception 'Solo Amministrazione'; end if;
  if nuovo_stato not in ('approvato','verificato','pagato') then raise exception 'Stato non valido'; end if;
  update public.report_compensi set stato = nuovo_stato, nota_amministrazione = coalesce(nota, nota_amministrazione)
  where id = rid and stato in ('approvato','verificato','pagato');
end $$;

-- Email dei Team Manager che devono approvare (per la notifica)
create or replace function public.email_approvatori_report(rid bigint) returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(distinct p.email), '{}')
  from public.report_compensi r
  join public.profiles p on p.attivo and (
    (p.ruolo = 'manager' and p.team = r.team and p.id <> r.utente)
    or (p.ruolo = 'admin' and not exists (
      select 1 from public.profiles m where m.attivo and m.ruolo = 'manager' and m.team = r.team and m.id <> r.utente))
  )
  where r.id = rid and (r.utente = auth.uid() or public.posso_approvare_report(rid))
$$;

-- Segna le email inviate
create or replace function public.segna_email_report(rid bigint, destinatario text) returns void
language sql security definer set search_path = public as $$
  update public.report_compensi set
    email_tm_il = case when destinatario = 'tm' then now() else email_tm_il end,
    email_amministrazione_il = case when destinatario = 'amministrazione' then now() else email_amministrazione_il end
  where id = rid and (utente = auth.uid() or public.posso_approvare_report(rid))
$$;

revoke execute on function public.sono_amministrazione(), public.mio_team(), public.posso_approvare_report(bigint),
  public.approva_report(bigint, boolean, text), public.lavora_report(bigint, text, text),
  public.email_approvatori_report(bigint), public.segna_email_report(bigint, text) from public, anon;
grant execute on function public.sono_amministrazione(), public.mio_team(), public.posso_approvare_report(bigint),
  public.approva_report(bigint, boolean, text), public.lavora_report(bigint, text, text),
  public.email_approvatori_report(bigint), public.segna_email_report(bigint, text) to authenticated;

-- Fatture allegate: bucket privato, una cartella per utente
insert into storage.buckets (id, name, public, file_size_limit) values ('compensi', 'compensi', false, 20971520);
create policy "fatture: carico nella mia cartella" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'compensi' and (storage.foldername(name))[1] = auth.uid()::text and public.mio_ruolo() is not null);
create policy "fatture: le vede chi vede il report" on storage.objects
  for select to authenticated
  using (bucket_id = 'compensi' and (
    ((storage.foldername(name))[1] = auth.uid()::text and public.mio_ruolo() is not null)
    or public.sono_admin() or public.sono_amministrazione()
    or (public.mio_ruolo() = 'manager' and exists (
      select 1 from public.profiles p where p.id::text = (storage.foldername(name))[1] and p.team = public.mio_team()))
  ));
