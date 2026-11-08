-- HUB 24 — Invio della newsletter a blocchi (08/11/2026)
-- Da eseguire nel SQL Editor di Supabase PRIMA di pubblicare la nuova versione della funzione
-- "hub24-newsletter" (senza questa tabella la funzione non invia nulla e restituisce l'errore).
--
-- Perché: l'8/11 la funzione si è fermata a metà (WORKER_RESOURCE_LIMIT) dopo aver già spedito
-- una parte delle email; il numero veniva registrato in hub24_invii solo a fine giro, quindi ogni
-- nuovo tentativo ripartiva dall'inizio della lista e poteva mandare doppioni.
-- Ora ogni destinatario viene segnato qui appena la sua email parte: un nuovo tentativo manda
-- solo a chi manca. hub24_invii resta il registro dei numeri inviati a tutti (completati).

create table if not exists public.hub24_invii_destinatari (
  numero     integer not null,
  email      text not null,
  inviato_il timestamptz not null default now(),
  primary key (numero, email)
);

alter table public.hub24_invii_destinatari enable row level security;
-- Nessuna policy: come le altre tabelle HUB 24, la gestisce solo la Edge Function (service role).

-- Controllo di un invio:
-- select numero, count(*) from public.hub24_invii_destinatari group by numero order by numero desc;

-- Numero 3 (08/11/2026): inviato dalla vecchia versione, che si è fermata tre volte ("CPU Time exceeded")
-- senza registrarlo. Segnato come completato (destinatari 0 = numero reale non noto) per non rispedirlo.
insert into public.hub24_invii (numero, data_numero, destinatari) values (3, '2026-11-08', 0)
  on conflict (numero) do nothing;

-- Applicato l'08/11/2026 (migrazione hub24_invii_a_blocchi). L'invio parte dai cron già presenti:
-- hub24-newsletter-domenica (30 7 * * 0 UTC) e hub24-newsletter-domenica-retry (30 8 * * 0 UTC).
