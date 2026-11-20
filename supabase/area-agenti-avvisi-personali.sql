-- Area Agenti — Comunicazioni personali (20/11/2026)
-- destinatari valorizzato = la comunicazione la vedono solo quei profili (e l'admin); null = tutti i ruoli scelti.
alter table public.avvisi add column if not exists destinatari uuid[];
drop policy if exists "comunicazioni: vedo quelle del mio ruolo" on public.avvisi;
create policy "comunicazioni: vedo quelle del mio ruolo" on public.avvisi
  for select to authenticated using (
    sono_admin() or (mio_ruolo() = any (ruoli) and (destinatari is null or auth.uid() = any (destinatari)))
  );
