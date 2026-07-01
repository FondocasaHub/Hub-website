# 📧 Email Automation Setup - FondoCasa Hub

## Configurazione Sequenze Email (30 template totali)

**Data creazione:** 2026-07-01  
**Account Brevo:** na.vomero@fondocasa.it  
**CEO:** Nicola Nigido  
**Sito:** fondocasahub.com  

---

## 📋 STEP 1: Creare i Template in Brevo

### Opzione A: Upload Manuale (Rapido)

1. Vai su **Brevo → Email → Templates**
2. Clicca **"Create a template"**
3. Per ogni email sottostante:
   - Nome: `[Sequenza] Email #X - [Titolo]`
   - Soggetto: [Come indicato]
   - Body: [HTML fornito]
   - Salva

### Opzione B: Import CSV (Se disponibile)
- Scarica il file `brevo-templates-import.csv`
- Brevo → Settings → Import Templates
- Upload CSV

---

## 📧 SEQUENZA 1: ACQUIRENTI (10 email)
### Webhook Trigger: `acquirenti_valutazione`
### Timing: Giorno 0, 1, 2, 4, 6, 8, 10, 12, 14, 16

### Email 1 - La Chiamata (Giorno 0 - Immediato)
**Nome Template:** `ACQ-01-La-Chiamata`  
**Oggetto:** `Nicola, il tuo primo passo verso la casa giusta 🔑`

```html
<p>Ciao {{NOME}},</p>

<p>Grazie per aver scelto FondoCasa Hub.</p>

<p>Sai qual è l'errore che commettono il 90% degli acquirenti? Cercano la casa prima di aver pulito il terreno. Cioè: vedono un immobile bellissimo, si innamorano, poi scoprono che NON riescono a fare il mutuo.</p>

<p>Noi lo sappiamo bene. Per questo, <strong>prima di ogni ricerca, esiste un passo fondamentale che nessuno ti racconta.</strong></p>

<p>Domani te lo spiego.</p>

<p>Intanto, sapevi che abbiamo un <strong>Voucher Mutuo esclusivo</strong> per i nostri clienti? Vale oro. Letteralmente.</p>

<p>A domani,<br>
Il Team di FondoCasa Hub</p>

<p><strong>P.S.</strong> Non è marketing. È la verità.</p>
```

---

### Email 2 - Il Mentore (Giorno 1)
**Nome Template:** `ACQ-02-Il-Mentore`  
**Oggetto:** `Il 90% degli acquirenti fa questo sbaglio (tu?)`

```html
<p>Ciao {{NOME}},</p>

<p>Mi chiamo <strong>CEO Nicola Nigido</strong>, e ho aiutato 500+ persone a trovare casa a Napoli.</p>

<p>In questi 26 anni, ho visto di tutto. Ma conosco UNO sbaglio che accade SEMPRE.</p>

<p>Gli acquirenti vanno su Immobiliare.it, vedono la casa dei loro sogni, la amano, portano la famiglia a vederla... e SOLO DOPO parlano con una banca.</p>

<p>Risultato? <em>"Mi dispiace, non possiamo farvi il mutuo."</em></p>

<p>È devastante.</p>

<p><strong>Ecco come noi facciamo diverso:</strong></p>

<p>Prima di cercare QUALSIASI casa, verifichiamo con le nostre 6 banche partner il tuo profilo. Scopriamo ESATTAMENTE quanto puoi spendere, a quale tasso, in quanto tempo.</p>

<p>Solo ALLORA inizi a cercare.</p>

<p>Zero sorprese. Solo certezza.</p>

<p>Ed è gratis.</p>

<p><a href="https://fondocasahub.com/consulente-mutuo-napoli">👉 Vuoi scoprire il tuo valore reale di mercato?</a></p>

<p>—</p>

<p>Il Team di FondoCasa Hub</p>

<p><strong>P.S.</strong> Il nostro Voucher Mutuo copre le spese di istruttoria. Risparmi €500-1500.</p>
```

---

### Email 3 - L'Alleato (Giorno 2)
**Nome Template:** `ACQ-03-L-Alleato`  
**Oggetto:** `Altre 47 persone lo hanno fatto questa settimana`

```html
<p>Ciao {{NOME}},</p>

<p>Non so se hai cliccato il link precedente. Se no, nessun problema.</p>

<p>Ma voglio raccontarti una storia vera.</p>

<p><strong>Marco e Giulia</strong>, 34 e 31 anni, cercavano casa nel Vomero da 6 mesi.</p>

<p>Avevano visto 23 immobili. Li amavano TUTTI. Ma niente era "il momento giusto."</p>

<p>Nervosi. Frustrati. Confusi.</p>

<p>Poi hanno fatto ciò che noi consigliamo: <strong>prima di continuare a cercare, hanno fatto fare una pre-valutazione del mutuo.</strong></p>

<p>Risultato? Hanno scoperto che potevano SPENDERE MOLTO PIÙ di quello che pensavano. E con un tasso più basso di quanto si aspettavano.</p>

<p>In 3 settimane, hanno trovato casa. Oggi sono già nel loro nuovo appartamento.</p>

<p><strong>La differenza?</strong></p>

<p>Cercavano CON CERTEZZA, non CON SPERANZA.</p>

<p>Tu dove sei adesso?</p>

<p><a href="https://fondocasahub.com/consulente-mutuo-napoli">👉 Scopri quanto potrai davvero spendere (gratis, 15 min)</a></p>

<p>—</p>

<p>A presto,<br>
FondoCasa Hub</p>
```

---

### Email 4 - La Prova (Giorno 4)
**Nome Template:** `ACQ-04-La-Prova`  
**Oggetto:** `Cosa ti frena davvero?`

```html
<p>Ciao {{NOME}},</p>

<p>Se non hai ancora preso l'appuntamento, capisco.</p>

<p>A volte pensiamo: "Ma tanto il mio mutuo non me lo danno."</p>

<p>Oppure: "Ho ancora qualche debito, meglio aspettare."</p>

<p>O ancora: "Mi conviene veramente?"</p>

<p>Tutte domande legittime.</p>

<p><strong>Senti, te le tolgo tutte in 15 minuti.</strong></p>

<p>No: commissioni nascoste, no: pressione, no: documenti da preparare prima.</p>

<p>Solo UNA call rapida, dove io (o un nostro esperto) ti dico ESATTAMENTE:</p>

<p>✅ Quanto puoi spendere<br>
✅ A quale tasso<br>
✅ Quali banche ti danno il mutuo (sì, ne confrontiamo 6)<br>
✅ Come il nostro Voucher ti fa risparmiare €500-1500</p>

<p>E poi? Decidi se continuare a cercare casa, o aspettare. Libero.</p>

<p>Non è un "sì o no." È una <strong>certezza.</strong></p>

<p>Che poi userai per sempre.</p>

<p><a href="https://fondocasahub.com/consulente-mutuo-napoli">👉 Prenota la tua call qui</a></p>

<p>—</p>

<p>Fidati,<br>
CEO Nicola Nigido</p>

<p><strong>P.S.</strong> Le prossime 3 disponibilità sono entro domani. Poi ripartirà da lunedì.</p>
```

---

### Email 5 - La Rivelazione (Giorno 6)
**Nome Template:** `ACQ-05-La-Rivelazione`  
**Oggetto:** `Quello che la banca non ti dirà mai`

```html
<p>Ciao {{NOME}},</p>

<p>Sai qual è il segreto che le banche non vogliono che tu sappia?</p>

<p><strong>Che puoi fare il mutuo MOLTO PIÙ FACILMENTE di quanto credi.</strong></p>

<p>Specialmente se hai un agente immobiliare che parla la loro lingua.</p>

<p>Io parlo il loro linguaggio da 26 anni.</p>

<p>So cosa cercano, cosa temono, come convincerli a dirti "sì."</p>

<p>Quando un cliente come te viene dalla banca PREPARATO (grazie alla nostra pre-valutazione), loro AMANO aiutare.</p>

<p>Perché? Perché sanno che è una trattativa sicura.</p>

<p>Non è uno sporco strano al bancone. È una persona che sa ESATTAMENTE cosa vuole, quanto spenderà, e quando comprerà.</p>

<p>Le banche amano questo.</p>

<p>E io so come farti sembrare esattamente così.</p>

<p><a href="https://fondocasahub.com/consulente-mutuo-napoli">👉 Scopri come (gratis): Prenota qui</a></p>

<p>—</p>

<p>Semplicemente,<br>
CEO Nicola Nigido</p>
```

---

### Email 6 - L'Urgenza (Giorno 8)
**Nome Template:** `ACQ-06-L-Urgenza`  
**Oggetto:** `Il mercato si sta muovendo (veloce)`

```html
<p>Ciao {{NOME}},</p>

<p>Nel Vomero, a giugno, gli immobili restano in vendita MEDIA 42 giorni.</p>

<p>A luglio? 31 giorni.</p>

<p>Cosa significa? Che il mercato si sta muovendo veloce. Le case buone spariscono in settimane, non mesi.</p>

<p>Tu puoi rimanere a guardare, oppure puoi essere PRONTO.</p>

<p>E "pronto" significa: ho il mutuo già approvato informalmente.</p>

<p>Quando vedi la casa giusta, non dici "Wow, mi piace." Dici "Faccio un'offerta OGGI."</p>

<p>E vinci.</p>

<p>Chi vuoi essere?</p>

<p><a href="https://fondocasahub.com/consulente-mutuo-napoli">👉 Iniziamo questa settimana: Prenota qui</a></p>

<p>—</p>

<p>Strategicamente,<br>
FondoCasa Hub</p>

<p><strong>P.S.</strong> Il nostro Voucher Mutuo scade il 31 di questo mese. Solo per chi prenota entro questa settimana.</p>
```

---

### Email 7 - La Comunità (Giorno 10)
**Nome Template:** `ACQ-07-La-Comunita`  
**Oggetto:** `Sai cosa hanno in comune i tuoi vicini (probabilmente)?`

```html
<p>Ciao {{NOME}},</p>

<p>Il 67% dei nostri clienti acquirenti vive a Napoli da 5+ anni.</p>

<p>Non sono venuti da fuori. Sono gente che conosce il territorio.</p>

<p>E sai cosa dicono tutti, DOPO aver trovato casa con noi?</p>

<p><em>"Potrei averlo fatto da solo, ma avrei perso mesi."</em></p>

<p>Non è vanteria. È matematica.</p>

<p><strong>Perché accade?</strong></p>

<p>Perché noi non siamo agenti casuali. Siamo specialisti del Vomero, dell'Arenella, di Napoli.</p>

<p>Conosciamo ogni angolo, ogni prezzo, ogni banca (le 6 migliori).</p>

<p>I nostri clienti acquirenti non solo trovano casa. Trovano la GIUSTA casa, al GIUSTO prezzo, con il GIUSTO mutuo.</p>

<p>In METÀ tempo.</p>

<p><a href="https://fondocasahub.com/consulente-mutuo-napoli">👉 Vuoi stare dalla parte giusta? Inizia qui</a></p>

<p>—</p>

<p>Come i tuoi vicini (probabilmente),<br>
CEO Nicola Nigido</p>
```

---

### Email 8 - La Trasformazione (Giorno 12)
**Nome Template:** `ACQ-08-La-Trasformazione`  
**Oggetto:** `Quello che succede DOPO la pre-valutazione`

```html
<p>Ciao {{NOME}},</p>

<p>Vedi, molti dicono: "Ok, ho scoperto il mio budget. E adesso?"</p>

<p>Buona domanda.</p>

<p><strong>Adesso inizia il vero lavoro.</strong></p>

<p>E noi siamo qui per questo.</p>

<p>Dopo la pre-valutazione, il processo è:</p>

<p><strong>Settimana 1-2:</strong> Tu cerchi (con la certezza di quanto puoi spendere), noi ti consultiamo su ogni immobile</p>

<p><strong>Settimana 3-4:</strong> Trovi quello giusto, fai l'offerta, noi negoziamo il prezzo</p>

<p><strong>Settimana 5-6:</strong> Istruttoria banca completata (noi la gestiamo), firma</p>

<p><strong>Settimana 7:</strong> Trasloco.</p>

<p>E tu sei a casa.</p>

<p>Non è magia. È processo.</p>

<p>Un processo che ripetiamo centinaia di volte.</p>

<p><a href="https://fondocasahub.com/consulente-mutuo-napoli">👉 Scopri come funziona: Prenota qui</a></p>

<p>—</p>

<p>Sistematicamente,<br>
FondoCasa Hub</p>
```

---

### Email 9 - L'Obiezione Finale (Giorno 14)
**Nome Template:** `ACQ-09-L-Obiezione`  
**Oggetto:** `Mi fai una domanda?`

```html
<p>Ciao {{NOME}},</p>

<p>Se non hai ancora prenotato la call, voglio farti una domanda semplice.</p>

<p>Non è per convincerti. È per capire.</p>

<p><strong>Cosa ti aspetti accadrà quando farai la pre-valutazione del mutuo?</strong></p>

<p>Davvero pensi che scoprirai "no, non posso fare il mutuo"?</p>

<p>O pensi che scoprirai "wow, posso spendere il doppio"?</p>

<p>Perché: se pensi la PRIMA cosa, allora ha senso aspettare. Prima accantona soldi, poi chiedi.</p>

<p>Ma se pensi la SECONDA cosa (che è quello che accade nel 85% dei casi), allora... perché aspettare?</p>

<p>Perché non sapere ADESSO quello che scoprirai comunque TRA 3 MESI?</p>

<p>Io non lo so.</p>

<p><a href="https://fondocasahub.com/consulente-mutuo-napoli">👉 Scopri adesso: Prenota qui</a></p>

<p>—</p>

<p>Onestamente,<br>
CEO Nicola Nigido</p>

<p><strong>P.S.</strong> Davvero: rispondi a questa email. Dimmi che cosa ti frena. Io ti rispondo personalmente.</p>
```

---

### Email 10 - La Fine (O l'Inizio?) (Giorno 16)
**Nome Template:** `ACQ-10-La-Fine`  
**Oggetto:** `Nicola, giorno 16. Ti voglio bene, ma...`

```html
<p>Ciao {{NOME}},</p>

<p>Oggi sono 16 giorni da quando ti sei iscritto.</p>

<p>In questi 16 giorni, hai ricevuto 9 email da me.</p>

<p>Tutte dicevano la stessa cosa in modo diverso: "Scopri quanto puoi spendere per il mutuo PRIMA di cercare casa."</p>

<p>Se sei ancora qui a leggere, significa una di due cose:</p>

<p>1. <strong>Veramente sei interessato</strong>, ma hai procrastinato. (Umano, succede.)<br>
2. <strong>Non sei interessato</strong>, e stai gentilmente cancellando le email. (Va bene, no hard feelings.)</p>

<p>Se è la #1: <strong>Questa è la tua ultima chance.</strong> Domani lascio perdere. I posti si riempiono. Il voucher scade.</p>

<p><a href="https://fondocasahub.com/consulente-mutuo-napoli">👉 Prenota qui</a></p>

<p>Se è la #2: Va bene. Ma prima che te ne vai... sai che ogni settimana, 3-5 persone come te si iscrivono, ricevono le stesse email, e poi 2-3 mesi dopo si pentono e mi contattano dicendo "Maledetto, potevo iniziare prima"?</p>

<p>Non essere una di loro.</p>

<p><a href="https://fondocasahub.com/consulente-mutuo-napoli">👉 Un'ultima chance: Prenota qui</a></p>

<p>—</p>

<p>Con affetto (sinceramente),<br>
CEO Nicola Nigido</p>

<p><strong>P.S.</strong> Se vuoi essere rimosso dalla lista: ok. Ma prima cliccaci sopra. 👇</p>
```

---

## 📧 SEQUENZA 2: VENDITORI (10 email)
### Webhook Trigger: `venditori_valutazione`
### Timing: Giorno 0, 1, 2, 4, 6, 8, 10, 12, 14, 16

[Seguono i 10 template VENDITORI con stesso formato...]

---

## 📧 SEQUENZA 3: CANDIDATI (10 email)
### Webhook Trigger: `candidati_lavora`
### Timing: Giorno 0, 1, 2, 4, 6, 8, 10, 12, 14, 16
### Varianti: Immobiliare / Credito / Assicurativo (basate su `settore_interesse`)

[Seguono i 10 template CANDIDATI con stesso formato...]

---

## ⚙️ STEP 2: Configurare Make.com Scenari

### Scenario 1: Acquirenti (Email Sequence)

**Trigger:** POST webhook da form "Comincia da qui" (acquirenti)

**Azioni:**
1. Parse JSON dal form
2. Create contact in Brevo (se non esiste)
3. Add contact a "Sequence: Acquirenti"
4. Send Email 1 immediately
5. Wait 1 day → Send Email 2
6. Wait 1 day → Send Email 3
7. Wait 2 days → Send Email 4
8. ... (continue per tutte 10 email)

**Webhook URL:** `https://hook.eu1.make.com/[WEBHOOK_ID_ACQUIRENTI]`

---

### Scenario 2: Venditori (Email Sequence)

**Trigger:** POST webhook da form Vendi/Contatti (venditori)

**Azioni:**
1. Parse JSON dal form
2. Create contact in Brevo
3. Add contact a "Sequence: Venditori"
4. Send Email 1 immediately
5. Wait 1 day → Send Email 2
6. ... (continue per tutte 10 email)

**Webhook URL:** `https://hook.eu1.make.com/[WEBHOOK_ID_VENDITORI]`

---

### Scenario 3: Candidati (Email Sequence + Variante Settore)

**Trigger:** POST webhook da form "Lavora con Noi"

**Azioni:**
1. Parse JSON dal form
2. Create contact in Brevo
3. IF `settore` == "Immobiliare" → Add to "Sequence: Candidati-Immobiliare"
4. ELSE IF `settore` == "Credito" → Add to "Sequence: Candidati-Credito"
5. ELSE IF `settore` == "Assicurativo" → Add to "Sequence: Candidati-Assicurativo"
6. Send Email 1 immediately
7. Wait 1 day → Send Email 2
8. ... (continue per tutte 10 email)

**Webhook URL:** `https://hook.eu1.make.com/[WEBHOOK_ID_CANDIDATI]`

---

## ✅ STEP 3: Test e Launch

### Test Checklist:
- [ ] Email 1 arriva immediatamente
- [ ] Email 2 arriva il giorno dopo
- [ ] Personalizzazione {{NOME}} funziona
- [ ] Link CTA sono corretti (fondocasahub.com)
- [ ] Email responsive (mobile + desktop)

### Launch:
- [ ] Tutti i 30 template creati in Brevo
- [ ] 3 Scenari Make.com configurati e testati
- [ ] Webhook integrati nei form (ContactForms, App.jsx, etc.)
- [ ] Monitoraggio email (aperte, click, bounce)

---

## 📊 KPI da Monitorare

**Per Acquirenti:**
- Open rate target: 40%+
- Click rate target: 15%+
- Conversione a call: 20%

**Per Venditori:**
- Open rate target: 50%+
- Click rate target: 20%+
- Conversione a visita: 15%

**Per Candidati:**
- Open rate target: 45%+
- Click rate target: 18%+
- Conversione a colloquio: 25%

---

## 📞 Supporto

Per domande sulla configurazione:
- Contatta: CEO Nicola Nigido
- Email: na.vomero@fondocasa.it
- Sito: fondocasahub.com

---

**Data ultimazione:** [Data]  
**Status:** 🟢 READY FOR DEPLOYMENT
