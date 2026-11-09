-- HUB 24 — Promemoria di conferma dell'iscrizione (09/11/2026)
-- Da eseguire nel SQL Editor di Supabase PRIMA di pubblicare la versione della funzione
-- "hub24-newsletter" con l'azione "ricorda".
--
-- Perché: il 9/11 risultavano 26 iscritti "in_attesa" (doppio opt-in mai completato), 7 dei quali
-- iscritti il 30/10 prima delle 09:46, quando il link nell'email di conferma usciva rotto.
-- Il promemoria rimanda il link UNA sola volta per iscritto: ricordato_il segna chi l'ha già avuto.
-- La data del consenso (consenso_il) non viene toccata.

alter table public.hub24_iscritti add column if not exists ricordato_il timestamptz;

-- Controllo prima dell'invio (solo conteggi):
-- select count(*) from public.hub24_iscritti
--  where stato = 'in_attesa' and ricordato_il is null and consenso_il < now() - interval '2 days';
--
-- Invio (a blocchi di 2 che si avviano a catena):
-- POST /functions/v1/hub24-newsletter  { "azione": "ricorda" }
