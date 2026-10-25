-- 25/10/2026 — La cartella Marketing (06-marketing) diventa visibile a tutti i ruoli
-- (manager, agente, credito, staff di ogni reparto). Da eseguire nel SQL Editor di Supabase.
create or replace function public.posso_vedere_cartella(cartella text) returns boolean
language sql stable security definer set search_path = public as $$
  select case
    when public.mio_ruolo() is null then false
    when public.mio_ruolo() = 'admin' then true
    when cartella = '01-tutti' then true
    when cartella = '02-agenti' then public.mio_ruolo() in ('manager','agente')
    when cartella = '03-credito' then public.mio_ruolo() in ('manager','credito')
    when cartella = '04-manager' then public.mio_ruolo() = 'manager'
    when cartella = '05-amministrazione' then public.mio_ruolo() = 'staff' and public.mio_reparto() = 'amministrazione'
    when cartella = '06-marketing' then true
    else false
  end
$$;
