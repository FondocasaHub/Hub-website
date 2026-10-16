-- Area Agenti — Manuale di inserimento online (16/10/2026)
-- Il Team Manager compila la scheda di inserimento del nuovo collaboratore (15 step),
-- la invia allo Store Manager, che la verifica e la chiude (o la rimanda).

create table public.inserimenti (
  id bigint generated always as identity primary key,
  creato_il timestamptz not null default now(),
  aggiornato_il timestamptz not null default now(),
  creato_da uuid default auth.uid() references public.profiles(id),
  creato_da_nome text,
  team text,
  collaboratore text not null,
  ruolo text,
  data_ingresso date,
  cellulare text,
  mail_aziendale text,
  steps jsonb not null default '{}',     -- {"01": {"fatto": true, "data": "2026-10-16", "sigla": "VE"}, ...}
  note text,
  stato text not null default 'in corso' check (stato in ('in corso','da verificare','da rivedere','verificato')),
  inviato_il timestamptz,
  verificato_da text,
  verificato_il timestamptz,
  nota_sm text,
  data_operativita date
);
alter table public.inserimenti enable row level security;

create policy "inserimenti: lettura manager del team e admin" on public.inserimenti
  for select to authenticated using (
    public.sono_admin()
    or (public.mio_ruolo() = 'manager' and (team = public.mio_team() or creato_da = auth.uid()))
  );
create policy "inserimenti: creano manager e admin" on public.inserimenti
  for insert to authenticated with check (public.sono_admin() or public.mio_ruolo() = 'manager');
create policy "inserimenti: modificano manager del team e admin" on public.inserimenti
  for update to authenticated
  using (public.sono_admin() or (public.mio_ruolo() = 'manager' and (team = public.mio_team() or creato_da = auth.uid())))
  with check (public.sono_admin() or (public.mio_ruolo() = 'manager' and (team = public.mio_team() or creato_da = auth.uid())));
create policy "inserimenti: elimina solo admin" on public.inserimenti
  for delete to authenticated using (public.sono_admin());
revoke all on public.inserimenti from anon;
grant select, insert, update, delete on public.inserimenti to authenticated;

-- Regole: solo lo Store Manager verifica; il Team Manager non tocca le schede verificate
create or replace function public.inserimenti_regole() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.creato_da := auth.uid();
    new.creato_da_nome := (select coalesce(nullif(nome,''), email) from public.profiles where id = auth.uid());
    if not public.sono_admin() then new.team := public.mio_team(); new.stato := 'in corso'; end if;
    new.verificato_da := null; new.verificato_il := null; new.nota_sm := null; new.data_operativita := null;
  else
    if not public.sono_admin() then
      if old.stato = 'verificato' then raise exception 'Scheda già verificata dallo Store Manager'; end if;
      if new.stato not in ('in corso','da verificare') and new.stato is distinct from old.stato then raise exception 'Solo lo Store Manager può verificare'; end if;
      new.team := old.team; new.creato_da := old.creato_da; new.creato_da_nome := old.creato_da_nome;
      new.verificato_da := old.verificato_da; new.verificato_il := old.verificato_il;
      new.nota_sm := old.nota_sm; new.data_operativita := old.data_operativita;
    end if;
    if new.stato = 'da verificare' and old.stato is distinct from 'da verificare' then new.inviato_il := now(); end if;
  end if;
  new.aggiornato_il := now();
  return new;
end $$;
create trigger inserimenti_regole before insert or update on public.inserimenti
  for each row execute function public.inserimenti_regole();

select count(*) from public.inserimenti;
