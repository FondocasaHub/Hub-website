-- Area Agenti — Scheda valutazione immobile online (20/10/2026)
-- L'agente compila e salva la scheda; la vede lui, il Manager del suo team e lo Store Manager (admin).

create table public.valutazioni (
  id bigint generated always as identity primary key,
  creato_il timestamptz not null default now(),
  aggiornato_il timestamptz not null default now(),
  creato_da uuid default auth.uid() references public.profiles(id),
  creato_da_nome text,
  team text,
  indirizzo text not null default '',
  proprietario text,
  telefono text,
  data_valutazione date default current_date,
  dati jsonb not null default '{}'
);
alter table public.valutazioni enable row level security;

create policy "valutazioni: lettura autore, manager del team, admin" on public.valutazioni
  for select to authenticated using (
    public.sono_admin() or creato_da = auth.uid()
    or (public.mio_ruolo() = 'manager' and team = public.mio_team())
  );
create policy "valutazioni: crea chiunque autenticato" on public.valutazioni
  for insert to authenticated with check (true);
create policy "valutazioni: modifica autore, manager del team, admin" on public.valutazioni
  for update to authenticated
  using (public.sono_admin() or creato_da = auth.uid() or (public.mio_ruolo() = 'manager' and team = public.mio_team()))
  with check (public.sono_admin() or creato_da = auth.uid() or (public.mio_ruolo() = 'manager' and team = public.mio_team()));
create policy "valutazioni: elimina autore o admin" on public.valutazioni
  for delete to authenticated using (public.sono_admin() or creato_da = auth.uid());
revoke all on public.valutazioni from anon;
grant select, insert, update, delete on public.valutazioni to authenticated;

-- Autore e team li decide il database, non il browser
create or replace function public.valutazioni_regole() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.creato_da := auth.uid();
    new.creato_da_nome := (select coalesce(nullif(nome,''), email) from public.profiles where id = auth.uid());
    new.team := public.mio_team();
  else
    new.creato_da := old.creato_da; new.creato_da_nome := old.creato_da_nome;
    if not public.sono_admin() then new.team := old.team; end if;
  end if;
  new.aggiornato_il := now();
  return new;
end $$;
create trigger valutazioni_regole before insert or update on public.valutazioni
  for each row execute function public.valutazioni_regole();

select count(*) from public.valutazioni;
