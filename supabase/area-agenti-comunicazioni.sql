-- Area Agenti — Comunicazioni con allegati (v3, 15/10/2026)
-- La tabella "avvisi" diventa l'archivio delle comunicazioni: ogni comunicazione
-- può avere allegati, salvati nel bucket "documenti" sotto 00-comunicazioni/<id>/.
-- "scade_il" indica fino a quando la comunicazione resta in evidenza nella home;
-- nell'archivio Comunicazioni resta sempre visibile a chi ha il ruolo giusto.

alter table public.avvisi add column if not exists allegati jsonb not null default '[]';
alter table public.avvisi add column if not exists autore text;

drop policy if exists "avvisi: vedo quelli del mio ruolo" on public.avvisi;
create policy "comunicazioni: vedo quelle del mio ruolo" on public.avvisi
  for select to authenticated
  using (public.mio_ruolo() = any(ruoli) or public.sono_admin());

-- Allegati: li legge chi può vedere la comunicazione a cui appartengono
create or replace function public.posso_vedere_comunicazione(id_testo text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.avvisi a
    where a.id::text = id_testo
      and (public.mio_ruolo() = any(a.ruoli) or public.sono_admin())
  )
$$;
revoke execute on function public.posso_vedere_comunicazione(text) from public, anon;
grant execute on function public.posso_vedere_comunicazione(text) to authenticated;

create policy "comunicazioni: leggo gli allegati delle mie comunicazioni" on storage.objects
  for select to authenticated
  using (bucket_id = 'documenti'
         and (storage.foldername(name))[1] = '00-comunicazioni'
         and public.posso_vedere_comunicazione((storage.foldername(name))[2]));
-- Caricamento ed eliminazione restano solo all'Admin (regole già esistenti sul bucket "documenti").
