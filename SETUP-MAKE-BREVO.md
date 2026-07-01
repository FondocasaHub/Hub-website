# 🚀 Setup Completo: Brevo + Make.com

## QUICK START

**Tempo totale: ~2-3 ore**

- [ ] 30 minuti: Carica template in Brevo
- [ ] 30 minuti: Crea contatti di test
- [ ] 60 minuti: Configura 3 scenari Make.com
- [ ] 30 minuti: Test completo

---

## ✅ STEP 1: Brevo - Carica 30 Template

### 1.1 Accedi a Brevo
- URL: https://app.brevo.com
- Email: `na.vomero@fondocasa.it`
- Password: [La tua password]

### 1.2 Naviga a "Email → Templates"

### 1.3 Crea i 30 Template Manualmente

Per ogni email (10 ACQUIRENTI + 10 VENDITORI + 10 CANDIDATI):

1. Clicca **"Create a template"**
2. Scegli **"Design emails"** (oppure codice HTML)
3. Compila:
   - **Template Name:** `[ACQ/VEN/CAN]-[NUMERO]-[TITOLO]`
   - **Subject:** [Oggetto email da file]
   - **Preview text:** (opzionale)
   - **Body:** [HTML fornito in file templates]
4. Clicca **"Save"**

**Esempio:**
- Nome: `ACQ-01-La-Chiamata`
- Oggetto: `Nicola, il tuo primo passo verso la casa giusta 🔑`
- Body: [HTML copiato da email-automation-setup.md]

### 1.4 Verifica Template Caricati
- Vai a **Email → Templates**
- Dovresti vedere 30 template:
  - 10 che iniziano con `ACQ-`
  - 10 che iniziano con `VEN-`
  - 10 che iniziano con `CAN-`

---

## ⚙️ STEP 2: Make.com - Crea 3 Scenari

### 2.1 Accedi a Make.com
- URL: https://www.make.com
- Email: `na.vomero@fondocasa.com`
- Password: [La tua password]

### 2.2 Crea Scenario 1: ACQUIRENTI

**Nome Scenario:** `[Fondocasa] Email Sequence - Acquirenti`

**Step 1: Webhooks (Trigger)**
- Modulo: **HTTP → Custom Webhook**
- Crea webhook trigger
- Nome: `Acquirenti - Valutazione`
- Riceverà POST da: form ContactForms (categoria = "Acquisitori")

**Step 2: Brevo - Create Contact**
- Modulo: **Brevo → Create a Contact**
- Email: `{{email}}` [dal POST del form]
- First Name: `{{nome}}`
- Last Name: `{{nome}}` [se disponibile]
- Custom Fields:
  - `categoria`: `{{categoria}}`
  - `telefono`: `{{telefono}}`

**Step 3: Brevo - Send Template Email**
- Modulo: **Brevo → Send Transactional Email**
- Template: `ACQ-01-La-Chiamata`
- To Email: `{{email}}`
- Contact Attributes:
  - `NOME`: `{{nome}}`

**Step 4: Wait 1 Day**
- Modulo: **Flow Control → Sleep**
- Duration: 1 day

**Step 5: Send Email 2**
- Modulo: **Brevo → Send Transactional Email**
- Template: `ACQ-02-Il-Mentore`
- To Email: `{{email}}`

**Step 6-20: Repeat per Emails 3-10**
- Alternare Sleep (1 day / 2 days in base timing)
- Send template via Brevo

**Timing completo:**
```
Email 1 (ACQ-01): Subito (Step 3)
Wait 1 day
Email 2 (ACQ-02): Day 1 (Step 5)
Wait 1 day
Email 3 (ACQ-03): Day 2
Wait 2 days
Email 4 (ACQ-04): Day 4
Wait 2 days
Email 5 (ACQ-05): Day 6
Wait 2 days
Email 6 (ACQ-06): Day 8
Wait 2 days
Email 7 (ACQ-07): Day 10
Wait 2 days
Email 8 (ACQ-08): Day 12
Wait 2 days
Email 9 (ACQ-09): Day 14
Wait 2 days
Email 10 (ACQ-10): Day 16
```

### 2.3 Crea Scenario 2: VENDITORI

**Nome Scenario:** `[Fondocasa] Email Sequence - Venditori`

**Identico a Scenario 1, ma:**
- Step 1: Trigger su form Venditori (es. "Vendi casa", "Contatti")
- Template: `VEN-01` a `VEN-10`
- Custom Fields: categoria = "Venditori"

### 2.4 Crea Scenario 3: CANDIDATI (Con Branching per Settore)

**Nome Scenario:** `[Fondocasa] Email Sequence - Candidati`

**Step 1: Webhooks (Trigger)**
- Modulo: **HTTP → Custom Webhook**
- Nome: `Candidati - Lavora con Noi`

**Step 2: Brevo - Create Contact**
- Email: `{{email}}`
- First Name: `{{nome}}`
- Custom Fields:
  - `settore_interesse`: `{{settore_interesse}}` [Da form]

**Step 3-4: IF Branching (Flow Control)**
- IF `{{settore_interesse}}` == "Immobiliare":
  - Send Email 2A: `CAN-02A-Mentore-Immobiliare`
- ELSE IF `{{settore_interesse}}` == "Credito":
  - Send Email 2B: `CAN-02B-Mentore-Credito`
- ELSE IF `{{settore_interesse}}` == "Assicurativo":
  - Send Email 2C: `CAN-02C-Mentore-Assicurativo`

**Step 5+: Send rest of sequence (Email 3-10)**
- Identico a Scenario 1, stesso timing
- Template: `CAN-03` a `CAN-10` (standard per tutti)

---

## 🧪 STEP 3: Test Completo

### Test 1: Acquirenti
1. **Compila form** "Comincia da qui" → Acquirenti
   - Nome: Test Acquirente
   - Email: `test.acquirenti@gmail.com`
   - Altre opzioni: completa normalmente

2. **Verifica in Brevo:**
   - Vai a Contacts
   - Cerca "test.acquirenti@gmail.com"
   - Verifica custom fields carichi

3. **Verifica email:**
   - Apri `test.acquirenti@gmail.com`
   - Email 1 dovrebbe arrivare in 2-5 minuti

### Test 2: Venditori
1. **Compila form** "Vendi casa" o Contatti
   - Nome: Test Venditore
   - Email: `test.venditori@gmail.com`

2. **Verifica stessi passi come Test 1**

### Test 3: Candidati
1. **Compila form** "Lavora con Noi"
   - Nome: Test Candidato
   - Email: `test.candidati@gmail.com`
   - Settore: Immobiliare

2. **Verifica stessi passi come Test 1**
3. **Verifica che Email 2A (non 2B/2C) arrivi** (branching corretto)

### Se email NON arrivano:
- [ ] Verifica webhook connesso al form
- [ ] Verifica template nome esatto in Brevo
- [ ] Verifica email SMTP impostata in Brevo
- [ ] Check log in Make.com (esecuzione scenario)

---

## 🔗 Webhook URLs (Da aggiornare nei Form)

Dopo aver creato i 3 scenari in Make.com, otterrai 3 webhook URL:

**Webhook Acquirenti:**
```
https://hook.eu1.make.com/[WEBHOOK_ID_ACQUIRENTI]
```

**Webhook Venditori:**
```
https://hook.eu1.make.com/[WEBHOOK_ID_VENDITORI]
```

**Webhook Candidati:**
```
https://hook.eu1.make.com/[WEBHOOK_ID_CANDIDATI]
```

Questi vanno sostituiti nei form (`ContactForms.jsx`, `App.jsx`, etc.) se non già fatto.

---

## 📧 Monitoraggio Email

### In Brevo:
1. Vai a **Email → Campaigns**
2. Ogni invio è un record
3. Monitora:
   - Delivered
   - Opened
   - Clicked
   - Bounced

### In Make.com:
1. Vai a **Executions**
2. Vedi ogni run dello scenario
3. Monitora: Success / Error

### KPI Target:

| Metrica | Target | Azione |
|---------|--------|--------|
| Open Rate | 40%+ | Se < 40%, migliora subject line |
| Click Rate | 15%+ | Se < 15%, migliora CTA |
| Bounce Rate | < 2% | Se > 2%, pulisci lista email |
| Conversione | 20%+ | Se < 20%, rivedere copy |

---

## ⚡ Quick Troubleshooting

### Email non arriva
→ Check: Brevo SMTP settings, webhook log in Make.com, email esiste in Brevo

### Email arriva ma non personalizzata
→ Check: Custom field name esatto, {{NOME}} scritto correttamente

### Email 2 non arriva dopo Email 1
→ Check: Sleep duration corretta (1 day = 86400 secondi), scenario in esecuzione

### Scenario crea duplicati
→ Check: Contatto già esiste in Brevo, configurare "Update if exists"

---

## 📋 Checklist Finale

- [ ] 30 template caricati in Brevo
- [ ] 3 scenari Make.com creati
- [ ] Test Email 1 ricevuta (Acquirenti)
- [ ] Test Email 2 ricevuta 24h dopo (Acquirenti)
- [ ] Test Email 2A ricevuta (Candidati - Immobiliare)
- [ ] Webhook URLs inseriti nei form
- [ ] Monitoraggio KPI attivato
- [ ] Team formato su processo

---

## 🎯 Status: READY TO LAUNCH

Una volta completata questa checklist:
```
✅ Email Sequences Attive
✅ Form → Brevo → Email Automation
✅ Personalization & Tracking
✅ Growth Hacking Pipeline
```

**Momentum:** 📈📈📈

---

**Data Setup:** 2026-07-01  
**Owner:** CEO Nicola Nigido  
**Support:** na.vomero@fondocasa.it
