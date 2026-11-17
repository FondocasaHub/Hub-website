-- HUB 24 — Iscrizione dalla pagina /resta-informato (17/11/2026)
-- Da eseguire nel SQL Editor di Supabase PRIMA di pubblicare la versione della funzione
-- "hub24-newsletter" che salva telefono, interessi e consensi separati.
--
-- Perché: Nico ricontatta i ~6.600 contatti della sua rubrica (WhatsApp personale + link).
-- Chi si iscrive da /resta-informato lascia anche cellulare e interessi, e sceglie
-- separatamente se ricevere aggiornamenti su WhatsApp e proposte/consulenze personalizzate.
-- Il consenso a HUB 24 via email resta quello obbligatorio, con doppio opt-in come oggi.

alter table public.hub24_iscritti add column if not exists telefono text;
alter table public.hub24_iscritti add column if not exists interessi text[];
alter table public.hub24_iscritti add column if not exists consenso_whatsapp_il timestamptz;
alter table public.hub24_iscritti add column if not exists consenso_offerte_il timestamptz;

-- Controlli (solo conteggi):
-- select origine, count(*) from public.hub24_iscritti group by origine;
-- select count(*) filter (where consenso_whatsapp_il is not null) as whatsapp,
--        count(*) filter (where consenso_offerte_il is not null) as offerte
--   from public.hub24_iscritti where stato = 'attivo';

-- 17/11/2026 — link personali degli agenti (/resta-informato?a=<codice>)
alter table public.hub24_iscritti add column if not exists agente text;
-- select coalesce(agente,'nigido/sito') agente, stato, count(*) from public.hub24_iscritti
--  where origine like 'resta-informato%' group by 1,2 order by 1;
