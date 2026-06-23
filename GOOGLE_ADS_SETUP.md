# 📊 Configurazione Google Ads & GA4 - HUB Website

## ✅ Cosa è Stato Implementato

Il sito è stato configurato con:

1. **Google Analytics 4 (GA4)** - ID: `G-KF0WC9R6H0`
   - Tracking automatico di tutte le pagine
   - Tracciamento degli eventi di form submission
   - Tracciamento dei lead generati

2. **Google Ads Conversion Tracking** - Customer ID: `8316922963`
   - Evento di conversione per "Valutazione Immobiliare"
   - Evento di conversione per "Zero Vincoli 60"
   - Pixel di tracciamento configurato

3. **Tracking Events Centralizati**
   - Ogni form submission viene tracciato
   - Ogni page view viene registrato in GA4
   - I lead generati vengono segnalati a Google Ads

---

## 🔧 PASSO 1: Creare i Conversion Labels in Google Ads

### Accedi a Google Ads
1. Vai a [Google Ads](https://ads.google.com)
2. Clicca su **Strumenti e impostazioni** (ingranaggio in alto a destra)
3. Clicca su **Conversioni**

### Crea Conversion per "Valutazione Immobiliare"
1. Clicca su **+ Conversione**
2. Seleziona **Sito web**
3. Compila il form:
   - **Nome conversione**: `Valutazione Immobiliare`
   - **Categoria**: Lead
   - **Valore**: 50 EUR (opzionale, ma consigliato)
   - **Conteggio**: "Una volta per clic" (o ogni volta per form multipli)
4. Clicca **Continua**
5. **Copia il Conversion Label** (es: `AW-8316922963/abc123xyz`)

### Crea Conversion per "Zero Vincoli 60"
Ripeti i passaggi sopra con:
- **Nome conversione**: `Zero Vincoli 60`
- **Categoria**: Lead
- **Valore**: 100 EUR
- **Copia il Conversion Label** (es: `AW-8316922963/def456uvw`)

---

## 🔄 PASSO 2: Aggiorna i Conversion Labels nel Codice

### Modifica il file `src/config/tracking.js`

Sostituisci i Conversion Labels con i tuoi:

```javascript
export const GOOGLE_ADS_CONFIG = {
  customerID: '8316922963',
  conversions: {
    valutazione_immobiliare: {
      label: 'AW-8316922963/abc123xyz', // ← SOSTITUISCI CON IL TUO
      value: 50,
      currency: 'EUR',
    },
    zero_vincoli_60: {
      label: 'AW-8316922963/def456uvw', // ← SOSTITUISCI CON IL TUO
      value: 100,
      currency: 'EUR',
    },
  },
};
```

---

## 🧪 PASSO 3: Verifica il Tracking

### Testa in locale
1. Avvia il dev server: `npm run dev`
2. Apri la DevTools di Chrome (F12)
3. Vai al tab **Console**
4. Visita `/zero-vincoli-60`
5. Compila e invia il form

### Verifica nel Logs di GA4
1. Vai a [Google Analytics](https://analytics.google.com)
2. **Rapporti** → **Tempo reale**
3. Dovresti vedere:
   - Event: `form_submit`
   - Event: `zero_vincoli_60_request`
   - Event: `generate_lead`

### Verifica in Google Ads
1. Vai a **Strumenti** → **Conversioni**
2. Clicca sulla conversione
3. **Tag di monitoraggio** → Verifica che il tag sia installato
4. La conversione dovrebbe registrarsi entro pochi minuti dal test

---

## 📱 PASSO 4: Crea Campagne su Google Ads

### Strategie Consigliate

#### Campagna 1: Performance Max (Consigliata)
- **Obiettivo**: Massimizzare conversioni
- **Budget**: Parte dal 30% del budget totale
- **Audience**: Tutti coloro che hanno visitato il sito

#### Campagna 2: Search - "Valutazione Immobiliare"
- **Parole chiave**: valutazione casa napoli, vendi casa napoli, stima immobile napoli
- **Landing page**: `fondocasahub.com/comincia`
- **Bid strategy**: Target CPA (costo per acquisizione)

#### Campagna 3: Search - "Zero Vincoli 60"
- **Parole chiave**: zero vincoli 60, vendi casa 60 giorni, zero rischi casa
- **Landing page**: `fondocasahub.com/zero-vincoli-60`
- **Bid strategy**: Target CPA

#### Campagna 4: Remarketing
- **Obiettivo**: Retargeting di visitatori che non hanno convertito
- **Audience**: Visitatori delle ultime 30 giorni
- **Messaggio**: "Ricevi la tua valutazione gratuita" o "Zero Vincoli 60"

---

## 📊 PASSO 5: Configura UTM Parameters

Per tracciare le campagne, aggiungi UTM parameters agli URL:

### Template
```
https://fondocasahub.com/zero-vincoli-60?utm_source=google&utm_medium=cpc&utm_campaign=zero-vincoli-60&utm_content=ad-copy&utm_term=keyword
```

### Esempi per Google Ads

**Performance Max**:
```
?utm_source=google&utm_medium=pmax&utm_campaign=pmax-mix
```

**Search - Valutazione**:
```
?utm_source=google&utm_medium=cpc&utm_campaign=search-valutazione&utm_term=valutazione-casa
```

**Search - Zero Vincoli**:
```
?utm_source=google&utm_medium=cpc&utm_campaign=search-zero-vincoli&utm_term=zero-vincoli-60
```

---

## 🎯 DASHBOARD DA MONITORARE

### Google Analytics 4
- **Pagine Principali**: /zero-vincoli-60, /comincia, /grazie
- **Conversion Rate**: % di visitatori che convertono
- **Event Count**: Numero di form submission
- **Fonte di traffico**: Quale campagna genera più conversioni

### Google Ads
- **ROAS (Return on Ad Spend)**: Revenue / Cost
- **CPA (Cost Per Acquisition)**: Cost / Conversions
- **Conversion Rate**: Conversioni / Clicks
- **Quality Score**: Qualità del traffico per Search

---

## 🚀 Checklist Finale

- [ ] Conversioni create in Google Ads
- [ ] Conversion Labels copiati e inseriti in `src/config/tracking.js`
- [ ] Form testato in locale - conversione registrata
- [ ] Verifica in GA4 Tempo Reale
- [ ] Deploy su Vercel
- [ ] Campagne create su Google Ads
- [ ] UTM parameters aggiunti agli URL
- [ ] Budget e bid strategy configurati
- [ ] Dashboard monitorato per i primi 3 giorni

---

## 🔗 Link Utili

- [Google Analytics 4](https://analytics.google.com)
- [Google Ads](https://ads.google.com)
- [Google Ads Conversion Tracking](https://support.google.com/google-ads/answer/3103387)
- [GA4 Events Documentation](https://support.google.com/analytics/answer/9322688)

---

## 📞 Supporto

Se il tracking non funziona:
1. Verifica che GA4 script sia caricato (console → type `window.gtag`)
2. Verifica che i Conversion Labels siano corretti
3. Attendi 24h per vedere i dati in Google Ads (può essere lento all'inizio)
4. Controlla Google Ads Event Verification Tool
