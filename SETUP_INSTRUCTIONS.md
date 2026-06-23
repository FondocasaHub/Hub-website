# 🚀 Setup Completo - HUB Website Google Ads + GA4

## ✅ Status di Implementazione

| Componente | Status | Descrizione |
|---|---|---|
| Google Analytics 4 | ✅ Completo | GA4 ID: `G-KF0WC9R6H0` |
| Tracking Events | ✅ Completo | Form, Page View, Lead Gen |
| Thank You Page | ✅ Completo | Redirect automatico a `/grazie` |
| Google Ads Pixel | ✅ Pronto | Awaiting conversion labels |
| Campaign Strategy | ✅ Documentato | 5 campagne consigliate |
| UTM Parameters | ✅ Configurato | Pronto per il tracking |

---

## 📋 Cosa Fare Adesso (Passo-Passo)

### PASSO 1: Ottieni i Conversion Labels da Google Ads (⏱️ 5 min)

1. Vai a [Google Ads](https://ads.google.com)
2. Clicca: **Strumenti e impostazioni** (⚙️) → **Conversioni**
3. **Se non hai conversioni**, creale ora:
   
   **Conversione 1: Valutazione Immobiliare**
   - Clicca **+ Conversione**
   - Seleziona **Sito web**
   - Nome: `Valutazione Immobiliare`
   - Categoria: **Lead**
   - Valore: `50` EUR
   - Clicca **Continua** → Copia il **Conversion Label** (es: `AW-8316922963/abc123xyz`)

   **Conversione 2: Zero Vincoli 60**
   - Clicca **+ Conversione**
   - Seleziona **Sito web**
   - Nome: `Zero Vincoli 60`
   - Categoria: **Lead**
   - Valore: `100` EUR
   - Clicca **Continua** → Copia il **Conversion Label** (es: `AW-8316922963/def456uvw`)

---

## 💰 Budget Allocation (15 EUR/giorno)

| Campagna | Budget | % | Tipo |
|---|---|---|---|
| **Performance Max** | 9 EUR | 60% | Automatizzata (principale) |
| **Search - Zero Vincoli 60** | 6 EUR | 40% | Search (secondaria) |
| Search - Valutazione | —— | —— | Disattivata (budget limitato) |
| Display - Remarketing | —— | —— | Disattivata (attivare > 50 EUR/giorno) |
| YouTube - Branding | —— | —— | Disattivata (attivare > 50 EUR/giorno) |

**Strategia**: Concentrato su 2 campagne ad alto ROI. Scalare a 30+ EUR/giorno per attivare le altre.

4. **Copia i due label** e salvali da qualche parte

---

### PASSO 2: Configura le Credenziali Locali (⏱️ 2 min)

Crea file `.env.local` nella root del progetto:

```bash
# File: .env.local
VITE_GOOGLE_ADS_CONVERSION_VALUTAZIONE=AW-8316922963/COPIA-IL-TUO-LABEL-QUI
VITE_GOOGLE_ADS_CONVERSION_ZERO_VINCOLI=AW-8316922963/COPIA-IL-TUO-LABEL-QUI
```

---

### PASSO 3: Aggiorna il File di Configurazione (⏱️ 1 min)

Modifica `src/config/tracking.js`:

```javascript
export const GOOGLE_ADS_CONFIG = {
  customerID: '8316922963',
  conversions: {
    valutazione_immobiliare: {
      label: 'AW-8316922963/COPIA-IL-TUO-LABEL-QUI', // ← SOSTITUISCI
      value: 50,
      currency: 'EUR',
    },
    zero_vincoli_60: {
      label: 'AW-8316922963/COPIA-IL-TUO-LABEL-QUI', // ← SOSTITUISCI
      value: 100,
      currency: 'EUR',
    },
  },
};
```

---

### PASSO 4: Test Locale (⏱️ 10 min)

```bash
cd /Users/nicolanigido/Desktop/Hub-website

# Installa dipendenze (se non fatto)
npm install

# Avvia dev server
npm run dev
```

Poi:
1. Vai a `http://localhost:5173/zero-vincoli-60`
2. Compila il form con dati di test
3. Clicca "ADERISCO A ZERO VINCOLI 60"
4. Dovresti essere reindirizzato a `/grazie`

**Verifica del Tracking:**

Apri **DevTools** (F12) → **Console**:
```javascript
// Verifica GA4
window.gtag('event', 'test_event');
console.log(window.dataLayer); // Dovresti vedere gli eventi
```

---

### PASSO 5: Deploy su Vercel (⏱️ 3 min)

```bash
# Stai nella root del progetto
cd /Users/nicolanigido/Desktop/Hub-website

# Verifica che non ci siano errori
git status

# Stage tutti i file
git add .

# Commit
git commit -m "feat: add Google Ads + GA4 tracking and thank you page redirect"

# Push a GitHub
git push origin main
```

Vercel farà il deploy automaticamente entro 2 minuti. ✅

---

### PASSO 6: Verifica il Tracking su Produzione (⏱️ 10 min)

Una volta deployato su Vercel:

1. Vai a `https://fondocasahub.com/zero-vincoli-60`
2. Compila il form
3. Clicca submit
4. Verifica in **Google Analytics 4**:
   - Vai a [GA4 Home](https://analytics.google.com)
   - **Rapporti** → **Tempo reale**
   - Dovresti vedere gli event

5. Verifica in **Google Ads**:
   - Vai a **Strumenti** → **Conversioni**
   - Clicca sulla conversione
   - Verifica che il tracking sia attivo

---

### PASSO 7: Crea le Campagne (⏱️ 1-2 ore)

Segui il documento `GOOGLE_ADS_SETUP.md` per creare le 5 campagne:

1. **Performance Max** (automatizzata)
2. **Search - Valutazione Immobiliare**
3. **Search - Zero Vincoli 60**
4. **Display - Remarketing**
5. **YouTube - Brand Awareness**

Budget consigliato: **1.250 EUR/giorno** (vedi `src/config/campaigns.js`)

---

## 📊 File di Riferimento

| File | Descrizione | Status |
|---|---|---|
| `src/config/tracking.js` | Configurazione GA4 + Google Ads | ✅ Pronto |
| `src/config/campaigns.js` | Strategia campagne dettagliata | ✅ Pronto |
| `src/utils/trackingEvents.js` | Utility per tracciare eventi | ✅ Pronto |
| `GOOGLE_ADS_SETUP.md` | Guida setup Google Ads | ✅ Pronto |
| `.env.example` | Template variabili ambiente | ✅ Pronto |
| `.env.local` | Credenziali locali | ⏳ Tu devi creare |

---

## 🔗 Link Utili

- [Google Analytics 4](https://analytics.google.com)
- [Google Ads](https://ads.google.com)
- [GitHub - Hub Website Repo](https://github.com/FondocasaHub/Hub-website)
- [Vercel Deploy Dashboard](https://vercel.com/dashboard)

---

## ❓ FAQ

**Q: Quanto tempo prima di vedere i dati in Google Ads?**
A: 24-48 ore per il primo dato. Poi in tempo reale.

**Q: I dati in GA4 non appaiono subito?**
A: Verifica in "Rapporti → Tempo reale". I rapporti normali hanno delay di 24-48h.

**Q: Posso testare il tracking senza aspettare il deploy?**
A: Sì, in locale con `npm run dev`. Verifica in GA4 "Tempo reale".

**Q: Come cambio i Conversion Labels in futuro?**
A: Modifica `src/config/tracking.js` e fai git push. Vercel deploy automatico.

**Q: Qual è il budget minimo consigliato?**
A: Almeno 30 EUR/giorno per test iniziale. 1.250 EUR/giorno per risultati significativi.

---

## ✅ Checklist Finale

- [ ] Conversioni create in Google Ads
- [ ] Conversion Labels copiati e salvati
- [ ] File `src/config/tracking.js` aggiornato
- [ ] File `.env.local` creato
- [ ] Test locale (npm run dev) completato
- [ ] Git push fatto
- [ ] Deploy verificato su Vercel
- [ ] Google Analytics mostra i dati
- [ ] Google Ads mostra le conversioni
- [ ] Campagne create su Google Ads
- [ ] Budget e bid strategy configurati

---

## 🎯 Prossimi Step

1. **Oggi**: Ottieni conversion labels + configura locale + deploy
2. **Domani**: Crea campagne su Google Ads
3. **Giorni 2-7**: Monitora performance e ottimizza bid strategy
4. **Settimana 2+**: Scale budget su campagne performer

---

Good luck! 🚀 Se hai domande, controlla `GOOGLE_ADS_SETUP.md`
