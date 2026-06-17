# AI Lead Qualification Agent

Questa cartella contiene la struttura iniziale per costruire un agente AI che qualifica i lead del sito HUB e automatizza le risposte.

## Scopo

- qualificare i lead in base agli standard qualitativi di HUB
- inviare risposte automatiche via email e WhatsApp
- suggerire o pianificare una consulenza telefonica

## Contenuti

- `qualify-lead.js` : logica di prompt per il modello AI
- `notify.js` : funzioni placeholder per invio email e WhatsApp

## Come usare

1. Definire le variabili d’ambiente
   - `OPENAI_API_KEY`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_FROM`
   - `EMAIL_SMTP_HOST` / `SENDGRID_API_KEY`
2. Collegare il backend del sito a un endpoint di lead submission
3. Usare `qualifyLead()` per ottenere la valutazione del lead
4. Inviare notifiche con `sendEmailNotification()` e `sendWhatsAppNotification()`

## Prossimi sviluppi

- aggiungere un endpoint serverless `POST /api/lead`
- aggiungere salvataggio in Google Sheets o database
- aggiungere gestione automatica appuntamenti telefonici
