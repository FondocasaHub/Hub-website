-- 16/11/2026 — I miei copioni (Sensoria): l'elenco delle persone attive dell'Area agenti per il marketing.
-- Serve al server di Sensoria per sapere a chi può mandare un copione (nome ed email come nel profilo): la chiama con il
-- token di chi è del marketing (staff + reparto marketing) o manager/admin quando apre «I miei copioni».
-- Per tutti gli altri restituisce zero righe. Nessuna tabella nuova. Da eseguire nel SQL Editor di Supabase.
create or replace function public.agenti_per_copioni()
returns table (nome text, email text, ruolo public.ruolo, reparto public.reparto, team text)
language sql stable security definer set search_path = public as $$
  select p.nome, p.email, p.ruolo, p.reparto, p.team
  from public.profiles p
  where p.attivo
    and (public.mio_ruolo() in ('admin', 'manager')
         or (public.mio_ruolo() = 'staff' and public.mio_reparto() = 'marketing'))
  order by p.nome
$$;

revoke execute on function public.agenti_per_copioni() from public, anon;
grant execute on function public.agenti_per_copioni() to authenticated;
