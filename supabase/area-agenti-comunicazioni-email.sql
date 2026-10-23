-- Area Agenti — Avviso email delle comunicazioni (23/10/2026)
-- Registra quando è partita l'email di avviso di una comunicazione e a quante persone.
-- L'email la invia la Edge Function "notifica-comunicazione" (solo Admin).

alter table public.avvisi add column if not exists email_inviata_il timestamptz;
alter table public.avvisi add column if not exists email_destinatari integer;
