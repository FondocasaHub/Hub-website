-- Area Agenti — Accordi di collaborazione con firma online (20/11/2026)
-- Lo Store Manager carica il PDF dell'accordo per ogni collaboratore; il collaboratore lo legge nell'Area Agenti
-- e lo firma con un clic (firma elettronica semplice: nome digitato, data e ora, impronta SHA-256 del PDF, IP e browser).

create table if not exists public.accordi (
  id bigint generated always as identity primary key,
  anno int not null,
  profilo uuid not null references public.profiles(id),
  titolo text not null,
  file_path text not null,
  file_sha256 text not null,
  stato text not null default 'da_firmare' check (stato in ('da_firmare', 'firmato', 'annullato')),
  creato_il timestamptz not null default now(),
  creato_da text,
  firmato_il timestamptz,
  firma_nome text,
  firma_ip text,
  firma_browser text
);
create index if not exists accordi_profilo on public.accordi (profilo, anno);
alter table public.accordi enable row level security;

create policy "accordi: lettura interessato, SM e amministrazione" on public.accordi
  for select to authenticated using (profilo = auth.uid() or public.sono_admin() or public.sono_amministrazione());
create policy "accordi: gestisce lo store manager" on public.accordi
  for all to authenticated using (public.sono_admin()) with check (public.sono_admin());
revoke all on public.accordi from anon;
grant select, insert, update, delete on public.accordi to authenticated;

-- La firma passa solo da qui: solo il destinatario, solo se da firmare, con il suo nome e cognome digitato
create or replace function public.firma_accordo(p_id bigint, p_nome text, p_browser text)
returns public.accordi language plpgsql security definer set search_path = public as $$
declare a public.accordi; atteso text; hdr json;
begin
  select * into a from accordi where id = p_id for update;
  if a.id is null or a.profilo <> auth.uid() then raise exception 'Accordo non trovato'; end if;
  if a.stato <> 'da_firmare' then raise exception 'Questo accordo non è da firmare'; end if;
  select coalesce(nullif(nome, ''), email) into atteso from profiles where id = auth.uid();
  if lower(regexp_replace(trim(coalesce(p_nome, '')), '\s+', ' ', 'g')) <> lower(regexp_replace(trim(atteso), '\s+', ' ', 'g')) then
    raise exception 'Scrivi nome e cognome esattamente come: %', atteso;
  end if;
  begin hdr := current_setting('request.headers', true)::json; exception when others then hdr := null; end;
  update accordi set stato = 'firmato', firmato_il = now(), firma_nome = atteso,
    firma_ip = split_part(coalesce(hdr->>'x-forwarded-for', hdr->>'x-real-ip', ''), ',', 1),
    firma_browser = left(coalesce(p_browser, ''), 300)
  where id = p_id returning * into a;
  return a;
end $$;
revoke all on function public.firma_accordo(bigint, text, text) from public, anon;
grant execute on function public.firma_accordo(bigint, text, text) to authenticated;

-- PDF in un bucket privato: percorso <anno>/<profilo>/<file>.pdf
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('accordi', 'accordi', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create policy "accordi pdf: lettura interessato, SM e amministrazione" on storage.objects
  for select to authenticated using (
    bucket_id = 'accordi' and ((storage.foldername(name))[2] = auth.uid()::text or public.sono_admin() or public.sono_amministrazione())
  );
create policy "accordi pdf: carica lo store manager" on storage.objects
  for insert to authenticated with check (bucket_id = 'accordi' and public.sono_admin());
create policy "accordi pdf: modifica lo store manager" on storage.objects
  for update to authenticated using (bucket_id = 'accordi' and public.sono_admin());
create policy "accordi pdf: elimina lo store manager" on storage.objects
  for delete to authenticated using (bucket_id = 'accordi' and public.sono_admin());

-- 23/11/2026: alla firma si salva anche la fotografia del budget concordato (fatturato e incarichi per trimestre)
alter table public.accordi add column if not exists budget_firmato jsonb;
-- firma_accordo aggiornata in produzione (migration accordi_budget_firmato): imposta budget_firmato da budget_collaboratori.
