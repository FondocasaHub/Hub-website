-- Area Agenti — Incarico di ricerca immobiliare in esclusiva (Buyer Agent), 21/10/2026
-- L'agente compila l'incarico con il cliente e registra le lavorazioni con data ed esito.
-- Lo vedono l'autore, il Manager del suo team e lo Store Manager (admin).

create table public.incarichi_ricerca (
  id bigint generated always as identity primary key,
  creato_il timestamptz not null default now(),
  aggiornato_il timestamptz not null default now(),
  creato_da uuid default auth.uid() references public.profiles(id),
  creato_da_nome text,
  team text,
  committente text not null default '',
  telefono text,
  data_firma date default current_date,
  scadenza date,
  stato text not null default 'attivo' check (stato in ('attivo', 'concluso', 'scaduto', 'revocato')),
  dati jsonb not null default '{}'
);
alter table public.incarichi_ricerca enable row level security;

create policy "incarichi_ricerca: lettura autore, manager del team, admin" on public.incarichi_ricerca
  for select to authenticated using (
    public.sono_admin() or creato_da = auth.uid()
    or (public.mio_ruolo() = 'manager' and team = public.mio_team())
  );
create policy "incarichi_ricerca: crea chiunque autenticato" on public.incarichi_ricerca
  for insert to authenticated with check (public.mio_ruolo() is not null);
create policy "incarichi_ricerca: modifica autore, manager del team, admin" on public.incarichi_ricerca
  for update to authenticated
  using (public.sono_admin() or creato_da = auth.uid() or (public.mio_ruolo() = 'manager' and team = public.mio_team()))
  with check (public.sono_admin() or creato_da = auth.uid() or (public.mio_ruolo() = 'manager' and team = public.mio_team()));
create policy "incarichi_ricerca: elimina autore o admin" on public.incarichi_ricerca
  for delete to authenticated using (public.sono_admin() or creato_da = auth.uid());
revoke all on public.incarichi_ricerca from anon;
grant select, insert, update, delete on public.incarichi_ricerca to authenticated;

-- Autore e team li decide il database; la scadenza è sempre firma + 6 mesi
create or replace function public.incarichi_ricerca_regole() returns trigger
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
  new.scadenza := case when new.data_firma is null then null else (new.data_firma + interval '6 months')::date end;
  new.aggiornato_il := now();
  return new;
end $$;
create trigger incarichi_ricerca_regole before insert or update on public.incarichi_ricerca
  for each row execute function public.incarichi_ricerca_regole();

select count(*) from public.incarichi_ricerca;
