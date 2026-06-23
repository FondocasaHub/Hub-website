# 📊 Google Sheets Dashboard Automatico - Google Ads Monitoring

## Setup (10 minuti)

### PASSO 1: Crea un Nuovo Google Sheet

1. Vai a [Google Sheets](https://sheets.google.com)
2. Clicca **+ Nuovo** → **Foglio di calcolo**
3. Rinomina: "HUB Ads Monitoring - Daily"

---

### PASSO 2: Copia lo Script Apps Script

1. Nel foglio appena creato, clicca **Estensioni** → **Apps Script**
2. Cancella il codice default e incolla questo:

```javascript
// ============================================
// GOOGLE ADS MONITORING SCRIPT
// HUB Website - Daily Report
// ============================================

const CUSTOMER_ID = '8316922963'; // Il tuo Customer ID
const SHEET_NAME = 'Monitoring';

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 Google Ads')
    .addItem('Aggiorna dati oggi', 'updateAdsData')
    .addItem('Configura trigger giornaliero', 'setupTrigger')
    .addToUi();
}

function updateAdsData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
      setupSheetHeaders();
    }
    
    // Fetch Google Ads data
    const report = AdsApp.report(`
      SELECT 
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros,
        metrics.conversion_value
      FROM campaign
      WHERE segments.date >= YESTERDAY()
      ORDER BY metrics.impressions DESC
    `);

    const rows = [];
    const today = new Date().toLocaleDateString('it-IT');
    
    report.rows().forEach(row => {
      const cost = row['metrics.cost_micros'] / 1000000;
      const conversions = row['metrics.conversions'] || 0;
      const cpa = conversions > 0 ? cost / conversions : 0;
      const ctr = row['metrics.clicks'] > 0 ? (row['metrics.clicks'] / row['metrics.impressions'] * 100).toFixed(2) : 0;
      
      rows.push([
        today,
        row['campaign.name'],
        row['metrics.impressions'],
        row['metrics.clicks'],
        ctr + '%',
        conversions,
        cost.toFixed(2),
        cpa.toFixed(2),
        (row['metrics.conversion_value'] || 0).toFixed(2)
      ]);
    });

    // Aggiungi i dati al foglio
    const startRow = sheet.getLastRow() + 1;
    if (startRow > 1) {
      sheet.getRange(startRow, 1, rows.length, rows[0].length).setValues(rows);
    }
    
    SpreadsheetApp.getUi().alert(`✅ Dati aggiornati! ${rows.length} campagne caricate.`);
  } catch (e) {
    SpreadsheetApp.getUi().alert(`❌ Errore: ${e.message}`);
    Logger.log(e);
  }
}

function setupSheetHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const headers = [
    'Data',
    'Campagna',
    'Impressioni',
    'Click',
    'CTR %',
    'Conversioni',
    'Spend (EUR)',
    'CPA (EUR)',
    'Conv. Value (EUR)'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formatta header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#667eea');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
}

function setupTrigger() {
  // Rimuovi trigger existenti
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Crea nuovo trigger per ogni giorno alle 8:00 AM
  ScriptApp.newTrigger('updateAdsData')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();
  
  SpreadsheetApp.getUi().alert('✅ Trigger impostato! Si aggiornerà ogni giorno alle 8:00 AM');
}

function getCurrentStats() {
  const report = AdsApp.report(`
    SELECT 
      SUM(metrics.conversions) as total_conversions,
      SUM(metrics.cost_micros) as total_cost
    FROM campaign
    WHERE segments.date >= YESTERDAY()
  `);
  
  let totalConversions = 0;
  let totalCost = 0;
  
  report.rows().forEach(row => {
    totalConversions = row['total_conversions'] || 0;
    totalCost = (row['total_cost'] || 0) / 1000000;
  });
  
  return {
    conversions: totalConversions,
    cost: totalCost,
    cpa: totalConversions > 0 ? totalCost / totalConversions : 0
  };
}
```

3. Salva lo script (Ctrl+S)

---

### PASSO 3: Autorizza Google Ads

1. Nel terminale dello script, clicca **Esegui** → Scegli **updateAdsData**
2. Ti chiederà di autorizzare l'accesso a Google Ads
3. **Consenti** l'accesso

---

### PASSO 4: Configura il Trigger Automatico

1. Nel foglio Google Sheets, vai su **Estensioni** → **Apps Script**
2. Torna al nostro foglio
3. Clicca il menu **📊 Google Ads** → **Configura trigger giornaliero**
4. ✅ Fatto! Si aggiornerà automaticamente ogni giorno alle 8:00 AM

---

### PASSO 5: Personalizza il Foglio (Opzionale)

Aggiungi grafici per visualizzare:

**Grafico 1: Conversioni per Giorno**
- Dati: Colonna Data + Conversioni
- Tipo: Grafico a linee

**Grafico 2: Spesa vs CPA**
- Dati: Colonna Spend + CPA
- Tipo: Grafico combinato

**Grafico 3: Performance per Campagna (Ultimi 7 giorni)**
- Dati: Campagna + Conversioni
- Tipo: Grafico a barre

---

## 📊 Colonne nel Dashboard

| Colonna | Descrizione |
|---|---|
| **Data** | Giorno del report |
| **Campagna** | Nome campagna Google Ads |
| **Impressioni** | Numero di impression |
| **Click** | Numero di clic |
| **CTR %** | Click-Through Rate |
| **Conversioni** | Lead generati |
| **Spend (EUR)** | Budget speso |
| **CPA (EUR)** | Costo per acquisizione |
| **Conv. Value (EUR)** | Valore totale conversioni |

---

## 🚀 Cosa Monitorare

Ogni mattina alle 8:00, controllare:

1. **Conversioni** - Aumentano? Trend positivo?
2. **CPA** - Rimane basso (< 40 EUR)?
3. **CTR** - Performance click (> 2% è buono)?
4. **Spend** - Siamo nei 15 EUR/giorno?

---

## ⚙️ Troubleshooting

**Script non funziona?**
- ✅ Verifica che il Google Ads account sia autorizzato
- ✅ Controlla che l'ID Customer sia corretto (8316922963)
- ✅ Assicurati che Google Ads abbia dati (aspetta 24h dal primo submit)

**Trigger non si attiva?**
- ✅ Vai a **Esegui** → Vedi cosa c'è in "Esecuzioni recenti"
- ✅ Se errore, clicca su "Dettagli" per debug

---

## 📈 Strategie di Ottimizzazione

Basato su cosa vedi nel dashboard:

| Metrica | Target | Azione |
|---|---|---|
| **Conversioni < 1/giorno** | Aumentare | ↑ Aumenta bid strategy |
| **CPA > 50 EUR** | Ridurre | 🎯 Refina targeting |
| **CTR < 1%** | Aumentare | ✍️ Migliora ad copy |
| **Spend < 10 EUR** | Controllare | 📊 Budget attivo? |

---

## 🎯 Prossimi Step

1. **Crea il Sheet** e fai il setup
2. **Aggiorna manualmente oggi** per testare
3. **Imposta il trigger** per l'automazione
4. **Controlla ogni mattina** il dashboard
5. **Ottimizza in base ai dati** ogni 3-5 giorni

---

**Buon monitoring!** 📊✨
