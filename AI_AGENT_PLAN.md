# AI Lead Qualification Agent - Plan

## Obiettivo
Costruire un agente AI che:
- riceve i lead dal form del sito
- valuta la qualità del contatto rispetto agli standard di HUB
- invia risposte automatiche via email e WhatsApp
- abilita un processo di consulenza telefonica quando il lead è valido
- conserva i dati in modo tracciabile

## Architettura consigliata

1. Frontend `src/App.jsx`
   - invia i dati del form a un endpoint backend
   - continua a usare FormSubmit per email immediata o invio diretto come fallback
   - registra il lead in Google Sheets o database

2. Backend / serverless
   - riceve i lead dal sito
   - chiama il modello AI per la qualificazione
   - invia notifiche via email / WhatsApp
   - crea promemoria o appuntamenti telefonici

3. AI / prompt-engineering
   - usa un LLM (OpenAI, Azure OpenAI, o altro) per classificare il lead
   - definisci criteri chiari di qualità
   - allena l’agente con esempi reali di lead buoni / non idonei

4. Canali di automazione
   - Email: SendGrid, Mailgun, SMTP, FormSubmit come fallback
   - WhatsApp: Twilio WhatsApp API, Meta Business API o simili
   - Telefono: SMS di conferma + link a calendario / callback manuale

## Cosa valutare per la qualificazione

Esempi di criteri qualitativi:
- Budget reale per acquisto o finanziamento
- Tempistica desiderata (subito, entro 3 mesi, oltre)
- Tipo di immobile richiesto
- Area geografica corretta (Napoli / Campania)
- Tipo di servizio: immobiliare, creditizio, assicurativo
- Consenso marketing e GDPR

## Flusso consigliato

1. Il lead compila il form sul sito.
2. Il frontend invia i dati al backend.
3. Il backend salva il lead in Google Sheets / database.
4. Il backend invia automaticamente:
   - email di conferma al lead
   - WhatsApp di benvenuto + call-to-action
5. Il backend chiede al modello AI se il lead è:
   - alto potenziale
   - da richiamare
   - non idoneo
6. Se valido, il backend invia un messaggio interno al team o attiva un telefono/callback.

## Prompts di esempio

Prompt base:

> Sei un agent di qualificazione lead per HUB Napoli. Valuta questo contatto su 5 criteri: qualità budget, urgenza, interesse reale, località, servizi richiesti. Rispondi con: `high`, `medium`, `low`, `reason`.

Input lead:
- Nome
- Email
- Telefono
- Messaggio
- Marketing consent
- Servizio richiesto

## MVP raccomandato

1. Backend con un endpoint `POST /lead`
2. Salvataggio lead su Google Sheets o DB
3. Qualificazione AI con un prompt template
4. Email di conferma automatica al lead
5. WhatsApp automatico per lead idonei
6. Opzione telefono: invio SMS + link a un calendario o call-back request

## Requisiti tecnici

- Account OpenAI / Azure OpenAI o modello LLM compatibile
- Account Twilio WhatsApp o Meta Business API
- Account email transactional (SendGrid/Mailgun/SMTP)
- Repo con backend o funzioni serverless
- Variabili d’ambiente per chiavi e URL

## Prossimi passi

1. Definire i criteri di lead-score di HUB
2. Scrivere il prompt di qualificazione e i casi d’uso
3. Preparare il backend di elaborazione lead
4. Collegare il sito al backend
5. Configurare i canali email/WhatsApp
6. Testare con almeno 10 lead reali

## Nota

Il sito attuale è una SPA front-end. Per l’agente AI serve un piccolo backend/serverless. Posso creare subito una struttura iniziale per:
- qualificazione lead
- notifiche email
- WhatsApp automation
- esito telefonico
