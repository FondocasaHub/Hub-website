# Setup Form Submissions, Google Sheets, and Facebook Pixel

## 1. Email Delivery
- Il sito invia i messaggi del form direttamente a `na.vomero@fondocasa.it` tramite FormSubmit.co.
- Non è necessario creare un account EmailJS.
- Se vuoi cambiare l'indirizzo email destinatario, modifica l'endpoint in `src/App.jsx`:
  - `https://formsubmit.co/ajax/na.vomero@fondocasa.it`

## 2. Google Sheets Setup (opzionale)
1. Crea un nuovo Google Sheet
2. Aggiungi intestazioni: Timestamp, Nome, Telefono, Email, Messaggio, Marketing Consent
3. Vai su Estensioni > Apps Script
4. Incolla il codice di `google-apps-script.js`
5. Salva e deploya come web app
6. Imposta:
   - Esegui come: Me
   - Chi può accedere: Chiunque
7. Se lo deployi, mantieni l'URL in `src/App.jsx`

## 3. Facebook Pixel
- Il Pixel è già configurato in `index.html` con ID `1470114024601384`.
- Se cambi pixel, sostituisci l'ID in `index.html`.

## 4. Test form
- Compila il form di contatto
- Verifica che appaia il messaggio di successo
- Controlla che l'email arrivi a `na.vomero@fondocasa.it`
- Se hai attivato lo script Google, verifica anche l'inserimento su Google Sheets
- Verifica il tracking Pixel in Events Manager se necessario
