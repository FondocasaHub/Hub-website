import React, { useState, useEffect } from "react";

const ARTICLES = [
  {
    slug: "come-vendere-casa-napoli-guida-completa",
    title: "Come vendere casa a Napoli: guida completa per vender velocemente",
    excerpt: "Guida definitiva per vendere casa a Napoli. Dalla preparazione all'annuncio, dalla gestione delle visite alla chiusura della vendita: tutti i passi per vendere velocemente e al miglior prezzo.",
    date: "2026-06-14",
    category: "Vendere Casa",
    readTime: "12 min",
    content: `
      <h2>Come vendere casa a Napoli: la guida definitiva</h2>
      <p>Vendere una casa a Napoli non è solo una questione di prezzo. È una strategia che richiede preparazione, conoscenza del mercato locale e decisioni intelligenti in ogni fase. Questa guida ti porterà passo dopo passo attraverso il processo di vendita, dalle scelte iniziali fino al rogito.</p>
      <p>HUB, con 26 anni di esperienza nel mercato napoletano, ha aiutato migliaia di famiglie a vendere le loro case velocemente e al giusto prezzo. Ecco il metodo dei 7 pilastri che abbiamo sviluppato.</p>

      <h3>Fase 1: La preparazione - Rendere la casa pronta alla vendita</h3>
      <p>La prima impressione è cruciale. Gli acquirenti decidono se una casa "piace" nei primi 15 secondi di visita. Prima di metterla sul mercato:</p>
      <ul>
        <li><strong>Pulizia profonda:</strong> una casa pulita e ordinata vale il 10-15% in più. Non è un dettaglio, è un fattore decisivo.</li>
        <li><strong>Depersonalizzazione:</strong> rimuovi foto di famiglia, oggetti personali e decorazioni eccessive. L'acquirente deve vedersi vivere in quella casa, non in casa tua.</li>
        <li><strong>Piccoli lavori di manutenzione:</strong> rubinetti che gocciolano, vernici scrostate, porte che cigolano. Risolvili: costano poco ma creano un'impressione di proprietà trascurata.</li>
        <li><strong>Illuminazione:</strong> massimizza la luce naturale. Se necessario, usa luci calde in serata per rendere gli spazi più accoglienti.</li>
        <li><strong>Odori:</strong> elimina odori di cucina o animali. Un odore gradevole (ma non di deodorante artificiale) aiuta l'atmosfera.</li>
      </ul>

      <h3>Fase 2: La valutazione accurata - Non esagerare il prezzo</h3>
      <p>L'errore più comune è sopravvalutare la casa per "avere margine di trattativa". Non funziona così:</p>
      <ul>
        <li><strong>Un prezzo gonfiato allontana gli acquirenti reali</strong> dal primo annuncio. Le visite diminuiscono, la casa rimane in vendita più a lungo e alla fine la abbassi comunque.</li>
        <li><strong>A Napoli, le case ben prezzate si vendono in 30-60 giorni.</strong> Le case sopravvalutate restano sul mercato 6-12 mesi, abbattendo ulteriormente il valore percepito.</li>
        <li><strong>Come calcolare il prezzo giusto:</strong> non usare annunci gonfiati sui portali. Usa comparabili recenti di vendite reali (negli ultimi 6 mesi) nella tua zona, in condizioni simili alla tua casa.</li>
      </ul>
      <p><strong>Consiglio:</strong> HUB offre valutazioni gratuite basate su dati reali di vendita nel tuo quartiere e nel tuo mese. Richiedi una stima senza impegno.</p>

      <h3>Fase 3: Documentazione - Raccogli tutto prima di iniziare</h3>
      <p>La documentazione corretta accelera le trattative e evita problemi legali. Preparala prima di iniziare:</p>
      <ul>
        <li><strong>Atto di proprietà (rogito catastale)</strong> - verifica la conformità catastale</li>
        <li><strong>Visura catastale aggiornata</strong> - deve corrispondere allo stato effettivo dell'immobile</li>
        <li><strong>Planimetria catastale</strong> - consegna una copia stampata agli acquirenti</li>
        <li><strong>Certificato di agibilità</strong> - indispensabile per chi compra con mutuo</li>
        <li><strong>Dichiarazione di conformità impianti</strong> (elettrico, gas, idraulico)</li>
        <li><strong>Attestato di Prestazione Energetica (APE)</strong> - obbligatorio per legge</li>
        <li><strong>Certificato di non iscrizione di ipoteca</strong> - dal notaio o agenzia delle entrate</li>
        <li><strong>Documentazione condominiale</strong> - budget annuale, verbali ultimi 3 anni, regolamento</li>
        <li><strong>Comunicazione al catasto se ci sono state modifiche</strong> - divani, bagni, cucine non contano; pareti, finestre sì</li>
      </ul>
      <p><strong>Importante:</strong> se la documentazione ha difetti o mancanze, risolvili PRIMA di mettere la casa in vendita. Un difetto scoperto dopo una lunga trattativa affossa la vendita.</p>

      <h3>Fase 4: Il marketing - Come attirare gli acquirenti giusti</h3>
      <p>Oggi la maggior parte degli acquirenti inizia cercando online. La visibilità è tutto:</p>
      <ul>
        <li><strong>Foto professionali:</strong> foto scattate con smartphone non vendono case. Foto professionali, ben illuminate e ben inquadrate, possono aumentare l'interesse del 40%. Vale la pena investirci.</li>
        <li><strong>Descrizione accurata:</strong> non dire "comodo" o "ben tenuto" (parole vuote). Descrivi specificamente: "Vomero, via XX, piano 4°, 120mq, 4 camere, ristrutturato 2020, affaccio su parco, parcheggio in garage".</li>
        <li><strong>Multichannel:</strong> non affidarti a un solo portale (Immobiliare.it, Subito, ecc.). Sii su tutti, e aggiorna frequentemente gli annunci.</li>
        <li><strong>Video virtuale o tour 3D:</strong> i video aumentano le visite del 50-70%. Un tour 3D attira visitatori seri, non curiosi.</li>
        <li><strong>Annunci locali e circoli di vicini:</strong> molti venditori trovano acquirenti tra amici e circoli. Comunica che stai vendendo.</li>
      </ul>

      <h3>Fase 5: Le visite - Gestiscile strategicamente</h3>
      <p>Come si comporta durante la visita fa la differenza tra vendere e non vendere:</p>
      <ul>
        <li><strong>Non stare sempre presente:</strong> l'agente immobiliare sappia condurre la visita; la tua presenza intimorisce l'acquirente e impedisce al suo agente di negoziare liberamente.</li>
        <li><strong>Tieni la casa immacolata prima di ogni visita:</strong> aria fresca (apri le finestre prima), niente odori di cucina, toilette pulito al 100%.</li>
        <li><strong>Permetti agli acquirenti di "sentirsi a casa":</strong> lascia che tocchino, che si muovano, che si immaginino. Non fare tour guidati serrati; dai spazio.</li>
        <li><strong>Raccogli feedback da ogni visita:</strong> chiedi all'agente cosa ha detto l'acquirente. Il prezzo è giusto? La casa è "troppo piccola"? Mancano garage? Questi feedback sono preziosi.</li>
      </ul>

      <h3>Fase 6: La negoziazione - Come arrivare all'accordo</h3>
      <p>Raramente un acquirente offre il prezzo chiesto. La negoziazione è normale:</p>
      <ul>
        <li><strong>Un ribasso di 2-5% è aspettato:</strong> se chiedi 250.000 € e ricevi offerta di 240.000 €, non è un insulto. È il mercato.</li>
        <li><strong>Non scendere emotivamente:</strong> decidi il prezzo minimo che accetti PRIMA di ricevere offerte. Se scendere sotto quel prezzo non conviene, rifiuta.</li>
        <li><strong>La velocità ha valore:</strong> un acquirente che offre 245.000 € ma chiude in 30 giorni è migliore di uno che ne offre 250.000 € ma richiede 4 mesi. Il tempo = denaro.</li>
        <li><strong>Offerte multiple?</strong> Se ricevi più offerte, puoi farle "competere" educatamente. A volte gli acquirenti salgono se sanno che ce ne sono altri interessati.</li>
      </ul>

      <h3>Fase 7: La chiusura - Dal compromesso al rogito</h3>
      <p>Una volta raggiunto l'accordo, sei nella fase finale:</p>
      <ul>
        <li><strong>Compromesso (o contratto preliminare):</strong> vincolante per entrambi. Se l'acquirente si ritira, perde la caparra (di solito il 10% del prezzo). Se tu ti ritiri, devetti il doppio della caparra.</li>
        <li><strong>Verifiche dell'acquirente:</strong> avrà diritto a fare ispezioni tecniche (strutture, impianti, infiltrazioni). Coopera e sii trasparente.</li>
        <li><strong>Approvazione mutuo:</strong> se l'acquirente compra con mutuo, la banca farà ispezione e valutazione. Se il valore è inferiore alle aspettative della banca, il mutuo scende. Questo è un rischio che corre l'acquirente, non tu.</li>
        <li><strong>Rogito (atto ufficiale):</strong> firmato davanti al notaio, è il trasferimento ufficiale della proprietà. A questo punto la casa è dell'acquirente.</li>
      </ul>

      <h3>Gli errori più comuni che rallentano la vendita</h3>
      <p>Basandoci su 26 anni di esperienza, ecco i 5 errori che le persone commettono più spesso:</p>
      <ol>
        <li><strong>Prezzo non realistico:</strong> il 40% delle case che restano sul mercato sono sopravvalutate di 10-20%.</li>
        <li><strong>Documentazione incompleta:</strong> un documento mancante può bloccare tutto per mesi.</li>
        <li><strong>Foto scadenti:</strong> gli annunci con foto mediocri ricevono il 60% di visite in meno.</li>
        <li><strong>Non sapere quand'è il "momento di scendere":</strong> aspettare una cifra precisa quando il mercato non la offre spreca mesi di opportunità.</li>
        <li><strong>Fare da soli, senza professionisti:</strong> vendere una casa è complesso legalmente e fiscalmente. Un agente esperto recupera facilmente il suo compenso (che è di solito il 3-4% condiviso tra i due agenti).</li>
      </ol>

      <h3>Il metodo HUB: i 7 pilastri per vendere velocemente</h3>
      <p>Nel 2026, il mercato napoletano è saturo di annunci. Per distinguerti e vendere PRIMA e MEGLIO, usiamo il metodo dei 7 Pilastri:</p>
      <ol>
        <li><strong>Analisi documentale completa:</strong> risolviamo problemi prima di iniziare. Niente sorprese.</li>
        <li><strong>Valutazione di mercato precisa:</strong> il prezzo giusto, non gonfiato. Attira buyer seri dal primo giorno.</li>
        <li><strong>Piano di marketing dedicato:</strong> foto professionali, video, multichannel, social. La tua casa si vede.</li>
        <li><strong>Qualificazione degli acquirenti:</strong> gestiamo le visite per attirare buyer certi di affetto, non curiosi.</li>
        <li><strong>Negoziazione protetta:</strong> mediamo tra le parti con esperienza. Niente errori.</li>
        <li><strong>Gestione mutuo e assicurazione in parallelo:</strong> mentre tu vendi, WeUnit (nostro ramo creditizio) prepara il finanziamento per l'acquirente. Meno impedimenti, più velocità.</li>
        <li><strong>Assistenza fino al rogito e oltre:</strong> supporto legale e fiscale fino a che il trasferimento non è ufficiale.</li>
      </ol>

      <h3>Zero Vincoli 60: se vuoi vendere ancora più velocemente</h3>
      <p>Se hai fretta (trasferimento per lavoro, separazione, situazione economica difficile), abbiamo una soluzione speciale:</p>
      <p><strong>Zero Vincoli 60:</strong> la tua casa si vende in 60 giorni garantito. Nessun vincolo contrattuale, nessun rischio. Se non vendiamo, non paghi nulla. Come funziona? Lo spieghiamo di persona.</p>

      <h3>Domande frequenti</h3>
      <p><strong>Quanto tempo ci vuole a vendere una casa a Napoli?</strong><br/>In media, 45-90 giorni se il prezzo è realistico e la documentazione è completa. Sopravvalutate o con difetti: 6-12 mesi o più.</p>
      <p><strong>Posso vendere senza agenzia?</strong><br/>Sì, ma le statistiche mostrano che le case vendute senza agente impiegano 3 volte più a lungo e spesso finiscono per meno soldi (perché l'agente dell'acquirente negozia con più forza quando il venditore è non professionista).</p>
      <p><strong>Che documenti devo avere?</strong><br/>Leggi la sezione Fase 3. Se manca anche uno, risolvi prima.</p>
      <p><strong>Se ho una casa con difformità catastale, posso venderla?</strong><br/>Sì, ma sarà più complicato e potrai vendere solo a chi non ha bisogno di mutuo (contanti). Meglio regularizzarla prima se è semplice.</p>

      <h3>Contatta HUB per una consulenza gratuita</h3>
      <p>Se stai considerando di vendere la tua casa a Napoli, contattaci per una <strong>valutazione gratuita</strong> e una consulenza personalizzata. Non aspettare il momento "perfetto": il momento migliore è quando hai deciso che è ora di farlo.</p>
      <p><strong>Via Pietro Mascagni 35 - Vomero, Napoli</strong><br/>
      <strong>Tel. 081 18653202</strong><br/>
      <strong>WhatsApp</strong> - scrivici direttamente per una risposta veloce</p>
      <p>Siamo qui da 26 anni. Aiutiamo le famiglie napoletane a vendere velocemente, proteggendo i loro diritti ogni passo del cammino.</p>
    `
  },
  {
    slug: "tasse-costi-vendita-casa-napoli-2026",
    title: "Quanto costa vendere una casa a Napoli: tasse, spese e detrazioni 2026",
    excerpt: "Analisi completa dei costi di vendita immobile: plusvalenza, imposta di registro, agenzia, notaio. Quanto te ne rimarrà realmente in tasca.",
    date: "2026-06-14",
    category: "Fiscalità & Costi",
    readTime: "11 min",
    content: `
      <h2>Quanto costa vendere casa a Napoli: la vera matematica</h2>
      <p>Quando vendi una casa, il prezzo concordato non è quello che finisce nel tuo conto. Tasse, commissioni, spese notarili, e in alcuni casi plusvalenza, riducono l'importo netto. Questa guida ti mostra esattamente cosa aspettarti.</p>

      <h3>Esempio concreto: vendita di 250.000 €</h3>
      <p>Supponiamo tu venda una casa al prezzo di <strong>250.000 €</strong>. Ecco cosa viene sottratto:</p>

      <table style="border-collapse: collapse; width: 100%;">
        <tr style="border-bottom: 2px solid #333;">
          <td style="padding: 10px;"><strong>Voce di spesa</strong></td>
          <td style="padding: 10px; text-align: right;"><strong>Importo</strong></td>
          <td style="padding: 10px; text-align: right;"><strong>% sul prezzo</strong></td>
        </tr>
        <tr style="border-bottom: 1px solid #ccc;">
          <td style="padding: 10px;">Prezzo lordo di vendita</td>
          <td style="padding: 10px; text-align: right;"><strong>250.000 €</strong></td>
          <td style="padding: 10px; text-align: right;">100%</td>
        </tr>
        <tr style="border-bottom: 1px solid #ccc;">
          <td style="padding: 10px;">Commissione agenzia (divisa tra buyer e seller agente)*</td>
          <td style="padding: 10px; text-align: right;">-7.500 €</td>
          <td style="padding: 10px; text-align: right;">-3%</td>
        </tr>
        <tr style="border-bottom: 1px solid #ccc;">
          <td style="padding: 10px;">Spese notarili (rogito + atto di vendita)</td>
          <td style="padding: 10px; text-align: right;">-1.500 €</td>
          <td style="padding: 10px; text-align: right;">-0,6%</td>
        </tr>
        <tr style="border-bottom: 1px solid #ccc;">
          <td style="padding: 10px;">Imposta di registro</td>
          <td style="padding: 10px; text-align: right;">-7.500 €</td>
          <td style="padding: 10px; text-align: right;">-3%</td>
        </tr>
        <tr style="border-bottom: 1px solid #ccc;">
          <td style="padding: 10px;">Tassa ipotecaria e catastale (stima)</td>
          <td style="padding: 10px; text-align: right;">-300 €</td>
          <td style="padding: 10px; text-align: right;">-0,12%</td>
        </tr>
        <tr style="border-bottom: 1px solid #ccc;">
          <td style="padding: 10px;">Plusvalenza (se la casa è stata presa prima del 2011)</td>
          <td style="padding: 10px; text-align: right;">-VARIABILE</td>
          <td style="padding: 10px; text-align: right;">-VARIABILE</td>
        </tr>
        <tr style="background-color: #f0f0f0; border-bottom: 2px solid #333;">
          <td style="padding: 10px;"><strong>NETTO CHE RICEVI (senza plusvalenza)</strong></td>
          <td style="padding: 10px; text-align: right;"><strong>233.200 €</strong></td>
          <td style="padding: 10px; text-align: right;">-6,72%</td>
        </tr>
      </table>

      <p><em>*La commissione viene solitamente pagata al 50% dal buyer e al 50% dal seller. L'importo totale (3-4%) è condiviso.</em></p>

      <h3>Analisi dettagliata di ogni costo</h3>

      <p><strong>1. Commissione dell'agente (0-4% del prezzo)</strong></p>
      <ul>
        <li>Solitamente <strong>3-4% split</strong> (metà pagata dall'acquirente, metà dal venditore)</li>
        <li>Se vendi senza agenzia: risparmi la commissione, ma spesso il prezzo finale è inferiore (l'agente dell'acquirente negozia più forte)</li>
        <li>Nel nostro esempio: 3% = 7.500 € totali, di cui 3.750 € a carico del venditore</li>
        <li><strong>Negoziabile?</strong> Per vendite di prestigio o grandi volumi, sì. Per una casa normale: no, è il standard di mercato</li>
      </ul>

      <p><strong>2. Imposta di registro (3-9% del prezzo, a seconda del caso)</strong></p>
      <ul>
        <li><strong>3%</strong> se è la tua prima casa ceduta (esenzione parziale)</li>
        <li><strong>9%</strong> se è una seconda casa o una proprietà da investimento</li>
        <li>Nel nostro esempio, assumendo prima casa: 3% = 7.500 €</li>
        <li>Questa è la tassa più importante e non è negoziabile</li>
      </ul>

      <p><strong>3. Spese notarili (800-2.000 €)</strong></p>
      <ul>
        <li>Il notaio redige l'atto di vendita e lo registra. È una spesa obbligatoria</li>
        <li>Varia in base al prezzo della casa e alla complessità dell'operazione</li>
        <li>Per una casa di 250.000 €: circa 1.200-1.500 €</li>
      </ul>

      <p><strong>4. Tassa ipotecaria e catastale</strong></p>
      <ul>
        <li><strong>Tassa ipotecaria:</strong> se la casa è gravata da ipoteca, la cancellazione costa circa 50-150 €</li>
        <li><strong>Tassa catastale:</strong> per l'iscrizione al catasto, circa 50-100 €</li>
        <li>Nel nostro esempio: circa 300 € totali</li>
      </ul>

      <p><strong>5. Imposta sulla plusvalenza (se applicabile)</strong></p>
      <p>Questa è la parte più complessa. Non sempre paghi la plusvalenza, dipende da quando hai comprato la casa:</p>

      <ul>
        <li><strong>Casa comprata prima del 1° gennaio 2011:</strong> Plusvalenza tassata al 26% sul guadagno (solo se realizzi utile)</li>
        <li><strong>Esempio:</strong> Se hai comprato a 150.000 € nel 2010 e vendi a 250.000 €, guadagno = 100.000 €. Tasse sulla plusvalenza = 26.000 €</li>
        <li><strong>Casa comprata dopo il 1° gennaio 2011:</strong> Esentasse se è tua prima casa. Se è seconda casa, plusvalenza al 26%</li>
        <li><strong>Casa ereditata:</strong> Base di calcolo è il valore al momento dell'eredità, non il prezzo di acquisto originale. Spesso non c'è plusvalenza.</li>
        <li><strong>Importante:</strong> Non tutti gli immobili hanno plusvalenza. Se vendi al prezzo di acquisto (o meno), non paghi tasse sulla plusvalenza</li>
      </ul>

      <h3>Scenario A: Prima casa, nessuna plusvalenza</h3>
      <p>Comprata a 200.000 €, venduta a 250.000 € nel 2026 (dopo il 2011):</p>
      <ul>
        <li>Prezzo di vendita: 250.000 €</li>
        <li>Commissione: -3.750 € (il tuo 50%)</li>
        <li>Imposta registro (3%): -7.500 €</li>
        <li>Spese notarili: -1.500 €</li>
        <li>Tasse ipotecaria/catastale: -300 €</li>
        <li>Plusvalenza: € 0 (esentasse su prima casa)</li>
        <li><strong>NETTO: 235.450 €</strong></li>
      </ul>

      <h3>Scenario B: Prima casa, con plusvalenza pre-2011</h3>
      <p>Comprata a 150.000 € nel 2010, venduta a 250.000 € nel 2026:</p>
      <ul>
        <li>Prezzo di vendita: 250.000 €</li>
        <li>Commissione: -3.750 €</li>
        <li>Imposta registro (3%): -7.500 €</li>
        <li>Spese notarili: -1.500 €</li>
        <li>Tasse ipotecaria/catastale: -300 €</li>
        <li>Plusvalenza: 100.000 € × 26% = -26.000 €</li>
        <li><strong>NETTO: 209.950 €</strong></li>
      </ul>

      <h3>Scenario C: Seconda casa</h3>
      <p>Comprata a 200.000 €, venduta a 250.000 € nel 2026:</p>
      <ul>
        <li>Prezzo di vendita: 250.000 €</li>
        <li>Commissione: -3.750 €</li>
        <li>Imposta registro (9% per seconda casa): -22.500 €</li>
        <li>Spese notarili: -1.500 €</li>
        <li>Tasse ipotecaria/catastale: -300 €</li>
        <li>Plusvalenza: 50.000 € × 26% = -13.000 €</li>
        <li><strong>NETTO: 208.450 €</strong></li>
      </ul>

      <h3>Come risparmiare sui costi di vendita</h3>
      <ul>
        <li><strong>Non sopravvalutare la casa:</strong> Se la vendi a prezzo realistico, la vendi velocemente e risparmi mesi di mutuo + spese di mantenimento</li>
        <li><strong>Documentazione in ordine:</strong> Evita spese legali per sanare irregolarità. Una visura catastale conforme vale più che correggere dopo</li>
        <li><strong>Manutenzione preventiva:</strong> Un piccolo intervento prima di vendere (€500) evita che l'acquirente chieda uno sconto di €5.000</li>
        <li><strong>Scegli il notaio con cura:</strong> I costi notarili variano di 300-500 €. Chiedi preventivi a 2-3 notai</li>
        <li><strong>Pianifica il timing:</strong> Se hai fretta, spesso devi scendere sul prezzo. Dai tempo al mercato di assorbire la vendita</li>
      </ul>

      <h3>Il ruolo del commercialista</h3>
      <p>Se hai dubbi sulla plusvalenza o sulla tassazione della tua specifica casa, consulta un commercialista prima di firmare il compromesso. Costa 200-300 € e ti evita sorprese di migliaia di euro. È un investimento che si ripaga subito.</p>

      <h3>HUB: trasparenza su tutti i costi</h3>
      <p>Quando vendi con HUB, ti spieghiamo esattamente:</p>
      <ul>
        <li>Quale sarà il tuo netto (dopo commissione e tasse)</li>
        <li>Se ci sono rischi di plusvalenza</li>
        <li>Quale notaio scegliere (con preventivi)</li>
        <li>Quale agente fiscale consultare se necessario</li>
      </ul>
      <p>Nessuna sorpresa. Nessun costo nascosto. Trasparenza totale dal primo colloquio.</p>
    `
  },
  {
    slug: "trovare-agente-immobiliare-napoli",
    title: "Come trovare un bravo agente immobiliare a Napoli: criteri di scelta",
    excerpt: "Guida per scegliere il miglior agente immobiliare a Napoli. Quali domande fare, cosa controllare, come riconoscere i professionisti dai dilettanti.",
    date: "2026-06-14",
    category: "Scelta dell'Agente",
    readTime: "9 min",
    content: `
      <h2>Come scegliere un bravo agente immobiliare a Napoli</h2>
      <p>L'agente immobiliare che scegli farà la differenza tra una vendita veloce e profittevole, e mesi di frustrazione. Questa guida ti aiuterà a identificare i professionisti dai dilettanti.</p>

      <h3>I criteri per scegliere bene</h3>
      <p><strong>1. Esperienza specifica nel tuo quartiere</strong></p>
      <ul>
        <li>Non tutti gli agenti conoscono tutti i quartieri di Napoli.</li>
        <li>Un agente che vende principalmente al Vomero sa dove sono i comparabili, quali sono i prezzi reali, quali sono i tempi medi di vendita.</li>
        <li><strong>Domanda chiave:</strong> "Quante case hai venduto nel mio quartiere negli ultimi 12 mesi?" Se la risposta è vaga, passa oltre.</li>
      </ul>

      <p><strong>2. Presence fisica nel territorio</strong></p>
      <ul>
        <li>Un agente che ha un ufficio nel tuo quartiere conosce meglio il mercato locale rispetto a uno che lavora da casa o lontano.</li>
        <li>Chiedi se hanno un ufficio nel tuo quartiere e quanto tempo trascorrono lì.</li>
      </ul>

      <p><strong>3. Track record verificabile</strong></p>
      <ul>
        <li>Chiedi referenze di proprietari che hanno venduto con loro. Parla direttamente con loro.</li>
        <li>Cerca recensioni su Google, Facebook, portali immobiliari. Leggi sia le positive che le negative.</li>
        <li>Attenzione: le agenzie piccole spesso hanno poche recensioni. Non è per forza negativo; può significare che lavorano più per passaparola.</li>
      </ul>

      <p><strong>4. Competenza tecnica e legale</strong></p>
      <ul>
        <li>Un bravo agente deve parlare fluentemente di documentazione, conformità catastale, APE, certificazioni impianti.</li>
        <li>Se durante il colloquio non sa cosa significa "certificato di agibilità", è un campanello d'allarme.</li>
        <li>Deve essere in grado di guidarti su documentazione mancante o irregolarità.</li>
      </ul>

      <p><strong>5. Professionalità nella comunicazione</strong></p>
      <ul>
        <li>Comunica in modo chiaro e trasparente sui costi (percentuale di commissione, spese aggiuntive)?</li>
        <li>Ti spiega il processo di vendita passo per passo?</li>
        <li>Ascolta le tue priorità (velocità vs massimo prezzo) e adatta la strategia?</li>
        <li>O è tutto "voi dovete scendere sul prezzo" e "accettate ogni offerta"?</li>
      </ul>

      <h3>Le domande critiche da porre</h3>
      <p>Quando parli con un agente, fai queste domande:</p>
      <ol>
        <li><strong>"Quante case avete venduto nel mio quartiere negli ultimi 12 mesi?"</strong> → Vuoi sentire numeri concreti, non "molte".</li>
        <li><strong>"Qual è il tempo medio di vendita per case come la mia?"</strong> → Deve darti un range (45-90 giorni se ben prezzata).</li>
        <li><strong>"Come determinate il prezzo di un immobile?"</strong> → Se dicono "al feeling" o "decidiamo noi", passa oltre. Deve basarsi su comparabili recenti.</li>
        <li><strong>"Come vi comunico feedback durante il processo?"</strong> → Devono offrire comunicazione frequente (almeno settimanale).</li>
        <li><strong>"Se la casa non si vende entro 90 giorni, qual è il piano B?"</strong> → Se non hanno un piano B, non sono professionisti.</li>
        <li><strong>"Mi farete foto professionali e video?"</strong> → Un agente professionista investe in foto e video di qualità.</li>
        <li><strong>"Come gestite le visite e gli acquirenti? Sarò sempre presente?"</strong> → Un bravo agente sa quando mandarti fuori per permettere negoziazione libera.</li>
        <li><strong>"Qual è la vostra commissione e cosa include?"</strong> → Deve essere trasparente su costi e che cosa fa per quel costo.</li>
      </ol>

      <h3>Le agenzie grandi vs quelle piccole</h3>
      <p><strong>Agenzia grande (catena nazionale):</strong></p>
      <ul>
        <li>✅ Risorse tecniche: foto professionali, video, siti internet, marketing</li>
        <li>✅ Rete ampia: contatti con altri agenti per portare buyer</li>
        <li>❌ Spesso meno personalizzate, più standardizzate</li>
        <li>❌ Agente turnover alto (molti agenti impreparati)</li>
      </ul>

      <p><strong>Agenzia piccola o locale:</strong></p>
      <ul>
        <li>✅ Conosce il territorio in profondità</li>
        <li>✅ Rapporto più personale con il proprietario</li>
        <li>✅ Flessibilità nelle strategie</li>
        <li>❌ Meno risorse tecniche (foto meno professionali, siti semplici)</li>
        <li>❌ Rete potenzialmente più piccola di buyer</li>
      </ul>

      <p><strong>Il nostro consiglio:</strong> Non è questione di grande vs piccolo. È questione di professionista vs dilettante. Una piccola agenzia con agenti esperti è meglio di una grande con agenti impreparati, e viceversa.</p>

      <h3>I segnali di allerta: evita questi agenti</h3>
      <ul>
        <li>✋ Ti spinge a sopravvalutare la casa ("ha il potenziale, chiediamo il massimo")</li>
        <li>✋ Non sa spiegare il processo di vendita</li>
        <li>✋ Non ha foto professionali da mostrati di case precedenti vendute</li>
        <li>✋ Non vuole mettere per iscritto commissioni e accordi</li>
        <li>✋ Non ha ufficio, non ha numero telefonico fisso</li>
        <li>✋ Non può darti referenze di vendite recenti</li>
        <li>✋ Promette garantie impossibili ("vendiamo in 30 giorni sicuro")</li>
        <li>✋ Non ascolta le tue priorità; propone sempre la stessa tattica a tutti</li>
      </ul>

      <h3>L'importanza del mandato di vendita</h3>
      <p>Una volta scelto l'agente, firmerai un "mandato di vendita" (accordo di rappresentanza). Leggi bene:</p>
      <ul>
        <li><strong>Mandato esclusiva:</strong> solo questo agente vende la casa. Più vincolante, ma significa più lavoro dedicato.</li>
        <li><strong>Mandato pluriagenzia:</strong> più agenti vendono contemporaneamente. Meno vincolante, ma meno focalizzato.</li>
        <li><strong>Durata del mandato:</strong> solitamente 3-4 mesi. Se nessuno la compra, rinegozia o scuoti l'agente.</li>
        <li><strong>Commissione:</strong> solitamente 2-4% condiviso tra agente del venditore e agente dell'acquirente. Che sia scritto in nero su bianco.</li>
      </ul>

      <h3>HUB: 26 anni di esperienza nel tuo quartiere</h3>
      <p>HUB ha 10 professionisti che vivono e lavorano a Napoli dal 1999. Conosciamo ogni microzona, ogni costruttore, ogni tipo di immobile.</p>
      <p>Se cerchi un agente che conosce davvero il tuo quartiere e sa come vendere velocemente, contattaci per una consulenza gratuita. Ti spiegheremo come funzioniamo e cosa faremo per la TUA casa specifica.</p>
      <p>Non promettiamo miracoli. Promettiamo trasparenza, professionalità e risultati basati su 26 anni di mercato napoletano.</p>
    `
  },
  {
    slug: "documenti-vendita-immobile-napoli",
    title: "Documenti necessari per vendere una casa a Napoli: checklist completa",
    excerpt: "Lista completa di tutti i documenti richiesti per vendere un immobile a Napoli. Dal rogito all'APE, dalla visura catastale alle certificazioni di impianti: non dimenticare nulla.",
    date: "2026-06-14",
    category: "Legale & Documenti",
    readTime: "10 min",
    content: `
      <h2>Documenti per vendere casa a Napoli: la lista definitiva</h2>
      <p>La documentazione è il fondamento di una vendita immobiliare sicura e veloce. Un documento mancante può bloccare la chiusura a pochi giorni dal rogito. Questa è la lista completa e aggiornata di tutti i documenti che devi avere per vendere una casa a Napoli nel 2026.</p>

      <h3>Documenti di proprietà e catastali</h3>
      <p><strong>1. Rogito di compravendita originale (o copia notarile)</strong></p>
      <ul>
        <li>L'atto ufficiale che prova la tua proprietà</li>
        <li>Richiedilo al notaio che l'ha stipulato, oppure vai dall'Agenzia delle Entrate con un documento di identità</li>
        <li>Essenziale: senza questo non puoi provare che la casa è tua</li>
      </ul>

      <p><strong>2. Visura catastale aggiornata</strong></p>
      <ul>
        <li>Documento che attesta i dati catastali della proprietà: superficie, categoria, rendita</li>
        <li>Dove ottenerla: portale AgenziaEntrateEntratel oppure da un geometra</li>
        <li>Deve essere attuale (non più di 3 mesi vecchia). Stampane una copia per l'acquirente.</li>
        <li>Costo: circa €5-10 se la richiedi online</li>
      </ul>

      <p><strong>3. Planimetria catastale aggiornata</strong></p>
      <ul>
        <li>Il disegno tecnico della casa con le stanze, le misure, le uscite</li>
        <li>Se la planimetria in catasto non corrisponde allo stato effettivo (pareti abbattute, stanze combinate), devi regolarizzarla PRIMA di vendere</li>
        <li>Per regolarizzarla: affidati a un geometra, il quale farà una comunicazione al catasto</li>
        <li>Scarica la planimetria dal sito dell'Agenzia delle Entrate</li>
      </ul>

      <h3>Certificazioni di agibilità e conformità</h3>
      <p><strong>4. Certificato di agibilità</strong></p>
      <ul>
        <li>Documento che certifica che l'immobile è conforme alle norme di sicurezza e igiene ed è idoneo all'abitazione</li>
        <li>Fondamentale: se l'acquirente ha un mutuo, la banca lo richiede</li>
        <li>Se non ce l'hai, richiedi al Comune di Napoli (Ufficio Edilizia) una copia dell'originale, oppure rivolgiti a un geometra per ottenerlo</li>
        <li>Costo: circa €50-150 a seconda se è copia storica o nuova</li>
      </ul>

      <p><strong>5. Attestato di Prestazione Energetica (APE)</strong></p>
      <ul>
        <li>Obbligatorio dal 2009. Certifica l'efficienza energetica della casa (classe A, B, C, ecc.)</li>
        <li>Redatto da un certificatore energetico abilitato (geometra, ingegnere, architetto specializzato)</li>
        <li>Deve contenere: dati dell'edificio, consumi stimati, classe energetica, consigli di miglioramento</li>
        <li>Costo: €150-400 a seconda della dimensione della casa</li>
        <li>Validità: 10 anni dalla data di rilascio</li>
        <li>Importante per il 2026: classi F e G (molto inefficienti) stanno diventando invendibili. Se la tua casa è in classe F/G, considera interventi di efficientamento prima della vendita</li>
      </ul>

      <p><strong>6. Dichiarazione di conformità degli impianti (o Certificato di Conformità)</strong></p>
      <ul>
        <li><strong>Impianto elettrico:</strong> certificato di conformità dell'impianto, rilasciato dall'ultimo installatore o da un elettricista certificato</li>
        <li><strong>Impianto gas:</strong> certificato di conformità dell'impianto di riscaldamento/cucina a gas</li>
        <li><strong>Impianto idraulico e fognario:</strong> pur non essendo sempre "certificato", documenta lo stato dell'impianto</li>
        <li>Se gli impianti sono vecchi (>20 anni), considera una manutenzione profonda prima di vendere</li>
        <li>Costo certificati: €50-150 ciascuno</li>
      </ul>

      <h3>Documenti di regolarità urbanistica</h3>
      <p><strong>7. Autorizzazione edilizia (Concessione edilizia / CILA / SCIA)</strong></p>
      <ul>
        <li>Se hai fatto lavori strutturali (ampliamento, veranda, sopraelevazione), devi avere il permesso originale del Comune</li>
        <li>Piccoli lavori (porte, finestre, bagni): richiedono CILA (Comunicazione Inizio Lavori Asseverata)</li>
        <li>Lavori strutturali: richiedono SCIA (Segnalazione Certificata di Inizio Attività) o vecchia Concessione Edilizia</li>
        <li>Richiedila al Comune di Napoli (Sportello Unico per l'Edilizia)</li>
      </ul>

      <p><strong>8. Certificato di conformità urbanistica (o Attestato di Conformità Urbanistica)</strong></p>
      <ul>
        <li>Documenta che l'edificio è costruito conformemente al progetto autorizzato e alle norme urbanistiche</li>
        <li>Se la casa ha difformità (es. un muro costruito in 10 cm in più rispetto al progetto), deve essere sanabile</li>
        <li>Per ottenerlo: affidati a un geometra che farà ispezione e documentazione</li>
        <li>Costo: €100-300</li>
      </ul>

      <h3>Documenti condominiali (se in condominio)</h3>
      <p><strong>9. Documentazione condominiale</strong></p>
      <ul>
        <li><strong>Ultimo bilancio preventivo:</strong> spese condominiali annuali previste</li>
        <li><strong>Verbali assemblea ultimi 3 anni:</strong> decisioni prese dai condomini (lavori in corso, delibere)</li>
        <li><strong>Regolamento condominiale:</strong> norme su uso degli spazi comuni, animali domestici, orari lavori</li>
        <li><strong>Certificato dell'amministratore:</strong> attestante che la proprietà è in regola con il pagamento delle spese condominiali</li>
        <li><strong>Copia della polizza assicurazione condominio:</strong> per responsabilità civile dell'edificio</li>
        <li>L'amministratore di condominio ha l'obbligo di fornirti tutti questi documenti su richiesta entro 30 giorni</li>
      </ul>

      <h3>Documenti fiscali e ipotecari</h3>
      <p><strong>10. Certificato di non iscrizione di ipoteca</strong></p>
      <ul>
        <li>Prova che la casa non è gravata da mutuo o altri debiti garantiti sull'immobile</li>
        <li>Se hai ancora un mutuo, devi estinguerlo al rogito (con i soldi della vendita) oppure informare l'acquirente</li>
        <li>Richiedi questo certificato dal notaio oppure dall'Agenzia delle Entrate</li>
      </ul>

      <p><strong>11. Documento di identità del proprietario</strong></p>
      <ul>
        <li>Patente, passaporto o carta d'identità validi</li>
        <li>Necessari per il rogito</li>
      </ul>

      <p><strong>12. Codice fiscale</strong></p>
      <ul>
        <li>Necessario per le operazioni catastali e il rogito</li>
      </ul>

      <h3>Documenti per l'acquirente (che dovrebbe verificare)</h3>
      <p>Questi documenti l'acquirente probabilmente farà verificare da suo conto, ma è bene che tu sia trasparente:</p>
      <ul>
        <li><strong>Planimetria conforme allo stato effettivo:</strong> se non corrisponde, la casa potrebbe non essere finanziabile con mutuo</li>
        <li><strong>Regolarità catastale:</strong> assenza di discrepanze tra il catasto e lo stato reale</li>
        <li><strong>Assenza di vincoli (archeologico, paesaggistico, storico):</strong> che potrebbero limitare future ristrutturazioni</li>
        <li><strong>Assenza di servitù o diritti di terzi:</strong> es. diritto di passaggio sulla tua proprietà</li>
      </ul>

      <h3>Checklist pre-vendita: stampa e verifica</h3>
      <p>Crea questa lista e spunta man mano:</p>
      <ol>
        <li>☐ Rogito originale o copia notarile</li>
        <li>☐ Visura catastale aggiornata</li>
        <li>☐ Planimetria catastale aggiornata e conforme</li>
        <li>☐ Certificato di agibilità</li>
        <li>☐ APE (Attestato Prestazione Energetica)</li>
        <li>☐ Certificato conformità impianto elettrico</li>
        <li>☐ Certificato conformità impianto gas</li>
        <li>☐ Autorizzazione edilizia (se lavori fatti)</li>
        <li>☐ Certificato conformità urbanistica</li>
        <li>☐ Documentazione condominiale (se condominio)</li>
        <li>☐ Certificato non iscrizione ipoteca</li>
        <li>☐ Documento di identità valido</li>
        <li>☐ Codice fiscale</li>
      </ol>

      <h3>Se manca un documento: cosa fare</h3>
      <p><strong>Documento semplice da ottenere (visura, planimetria, certificato agibilità):</strong> Ottienilo prima di iniziare a vendere. Piccolo ritardo, grande beneficio.</p>
      <p><strong>Documento complesso (regolarità urbanistica, conformità impianti):</strong> Se la casa ha irregolarità, affidati a un geometra o a un avvocato specializzato in diritto immobiliare. È un investimento che alla fine protegge il valore della casa.</p>
      <p><strong>Documento introvabile (vecchio rogito, licenza edilizia storica):</strong> Il notaio o un geometra possono aiutarti a rintracciarlo negli archivi comunali o presso l'Agenzia delle Entrate.</p>

      <h3>Quanto tempo per raccogliere tutto?</h3>
      <p>Se la documentazione è in ordine: <strong>1-2 settimane</strong>.</p>
      <p>Se ci sono irregolarità da risolvere: <strong>4-8 settimane</strong> (dipende dalla complessità).</p>
      <p><strong>Consiglio:</strong> Non aspettare il momento della vendita per raccogliere documenti. Raccoglili oggi, verifica con un geometra, risolvi i problemi. Quando deciderai di vendere, sarai pronto in 24 ore.</p>

      <h3>HUB ti aiuta nella documentazione</h3>
      <p>La documentazione è il nostro pane quotidiano. In 26 anni, abbiamo risolto migliaia di irregolarità immobiliari a Napoli. Se hai domande su quali documenti servono per la TUA casa specifica, contattaci per una consulenza gratuita.</p>
      <p>Non sottovalutare questa fase: una vendita veloce parte da una documentazione completa e regolare.</p>
    `
  },
  {
    slug: "tassi-bce-giugno-2026-mutui",
    title: "Tassi BCE giugno 2026: come l'aumento dei tassi influenza i mutui a Napoli",
    excerpt: "La BCE ha nuovamente aumentato i tassi di riferimento a giugno. Scopri come questo impatta le rate dei mutui, cosa significa per chi compra casa e quali strategie conviene adottare nel 2026.",
    date: "2026-06-12",
    category: "Credito & Mutui",
    readTime: "7 min",
    content: `
      <h2>Rialzo BCE di giugno 2026: cosa significa per i tuoi mutui</h2>
      <p>Dal 17 giugno 2026, la Banca Centrale Europea ha nuovamente aumentato i tassi di riferimento di <strong>0,25%</strong>. Questa decisione avrà un impatto diretto su chi sta valutando un mutuo per comprare casa a Napoli. Ecco cosa devi sapere.</p>

      <h3>Il rialzo dei tassi BCE dal 17 giugno 2026</h3>
      <p>A partire dal 17 giugno, i tassi di riferimento della BCE sono aumentati di <strong>0,25%</strong>:</p>
      <ul>
        <li><strong>Tasso di rifinanziamento principale:</strong> 2,40% (precedente: 2,15%)</li>
        <li><strong>Tasso sui depositi:</strong> 2,25% (precedente: 2,00%)</li>
      </ul>
      <p>Sebbene l'incremento sia contenuto (0,25%), ha un impatto concreto sui mutui, soprattutto per chi sta pensando di accenderne uno nei prossimi mesi.</p>

      <h3>Come funziona il tasso del mutuo: BCE + Spread</h3>
      <p>È importante capire come viene calcolato il tasso del tuo mutuo:</p>
      <p><strong>Tasso del mutuo = Tasso BCE + Spread bancario</strong></p>
      <p>Lo spread è il margine che la banca aggiunge al tasso di riferimento BCE per coprire i costi operativi e i rischi. Lo spread varia da banca a banca.</p>

      <h3>Mutui a tasso variabile: aumenteranno subito di 0,25%</h3>
      <p>Se hai un mutuo a tasso variabile, la tua rata <strong>aumenterà di 0,25%</strong> a partire da giugno. Questo significa:</p>
      <ul>
        <li>Una rata che era di 1.000 € aumenterà di circa 50-60 € al mese (dipende dall'importo finanziato)</li>
        <li>Chi vuole accendere un nuovo mutuo variabile pagherà subito il tasso più alto</li>
        <li>Se prevedi ulteriori aumenti dei tassi BCE, il variabile può diventare costoso nel tempo</li>
      </ul>

      <h3>Mutui a tasso fisso: i NUOVI saranno più cari</h3>
      <p>Se hai già un mutuo a tasso fisso sottoscritto prima del 17 giugno, la tua rata <strong>non cambia</strong>. Tuttavia:</p>
      <ul>
        <li><strong>I NUOVI mutui a tasso fisso saranno più cari</strong> perché le banche li quotano includendo il nuovo tasso BCE più alto</li>
        <li>Chi sottoscrive un mutuo fisso dopo il 17 giugno pagherà un tasso di partenza superiore rispetto a prima</li>
      </ul>

      <h3>A parità di rata: meno denaro finanziato</h3>
      <p>Questo è un punto fondamentale che pochi comprendono:</p>
      <p><strong>Se fissi una rata mensile massima, con i tassi più alti potrai finanziare meno denaro.</strong></p>
      <p>Esempio illustrativo:</p>
      <ul>
        <li>Prima del rialzo: con una rata di 1.000 € potevi finanziare (ipotesi illustrativa) 240.000 € a 25 anni</li>
        <li>Dopo il rialzo: con la stessa rata di 1.000 € potrai finanziare meno (es. 235.000 €) perché il tasso è salito dello 0,25%</li>
      </ul>
      <p>Se vuoi mantenere lo stesso importo finanziato (240.000 €), la tua rata mensile sarà più alta di circa 50-60 €.</p>

      <h3>Cosa scegliere: fisso o variabile?</h3>
      <p><strong>Tasso fisso:</strong> Protegge da futuri aumenti BCE, ma il tasso di partenza ora è più alto dopo il rialzo del 17 giugno. Se prevedi di restare nella casa a lungo, è una scelta di protezione.</p>
      <p><strong>Tasso variabile:</strong> Inizia più basso rispetto al fisso, ma rischia di crescere ulteriormente se la BCE continua a salire. Scegli questa opzione solo se sei sicuro che i tassi caleranno nei prossimi anni.</p>

      <h3>Consigli pratici per chi vuole un mutuo a Napoli</h3>
      <ul>
        <li><strong>Se vuoi il tasso fisso, agisci velocemente:</strong> prima sottoscrivi, meglio è, perché ogni ulteriore rialzo BCE farà salire i nuovi tassi fissi</li>
        <li><strong>Valuta bene la rata che puoi sostenere:</strong> non prendere il massimo che le banche ti offrono; scegli una rata che ti lasci spazio per le emergenze</li>
        <li><strong>Confronta gli spread bancari:</strong> possono variare di 0,3-0,5% da banca a banca; una differenza che costa migliaia di euro nel corso del mutuo</li>
        <li><strong>Chiedi una consulenza a WeUnit:</strong> il ramo creditizio di HUB offre una pre-analisi gratuita per capire quale soluzione (fisso, variabile, cap) conviene alla tua situazione specifica</li>
      </ul>

      <h3>Conclusione</h3>
      <p>L'aumento dei tassi BCE di giugno rende i nuovi mutui più costosi, sia a tasso fisso che variabile. Ma per chi ha una buona situazione finanziaria, è ancora possibile accendere un mutuo e comprare casa a Napoli, dove i prezzi restano competitivi.</p>
      <p>La chiave è: (1) capire bene cosa puoi permetterti, (2) scegliere consapevolmente tra fisso e variabile, (3) confrontare le offerte bancarie, (4) farsi consigliare da un esperto di credito.</p>
      <p>Contatta WeUnit per una consulenza gratuita: analizzeremo la tua capacità di mutuo e ti guideremo nella scelta migliore.</p>
    `
  },
  {
    slug: "prezzi-case-napoli-2026",
    title: "Prezzi delle case a Napoli: andamento del mercato immobiliare 2026",
    excerpt: "Analisi aggiornata dei prezzi al metro quadro per quartiere a Napoli nel 2026. Vomero, Chiaia, Posillipo, Centro Storico: dove conviene comprare e cosa aspettarsi.",
    date: "2026-05-19",
    category: "Mercato Immobiliare",
    readTime: "7 min",
    content: `
      <h2>Il mercato immobiliare napoletano nel 2026</h2>
      <p>Il 2026 conferma la solidità del mercato immobiliare napoletano. Dopo anni di crescita moderata, Napoli si posiziona come una delle città italiane con il miglior rapporto qualità/prezzo per gli immobili residenziali, attirando sia acquirenti locali sia investitori nazionali e internazionali.</p>

      <h3>Prezzi per quartiere a Napoli nel 2026</h3>
      <p>Ecco una panoramica dei valori medi al metro quadro per immobili ristrutturati:</p>
      <ul>
        <li><strong>Posillipo:</strong> 5.500 – 12.000 €/mq (ville panoramiche e appartamenti di pregio)</li>
        <li><strong>Chiaia / Riviera:</strong> 4.500 – 7.500 €/mq (posizioni fronte mare fino a 8.000 €/mq)</li>
        <li><strong>Vomero:</strong> 3.800 – 5.500 €/mq (alta domanda, offerta limitata)</li>
        <li><strong>Mergellina:</strong> 3.500 – 5.000 €/mq</li>
        <li><strong>Arenella:</strong> 2.800 – 4.000 €/mq</li>
        <li><strong>Centro Storico (ristrutturato):</strong> 2.500 – 4.500 €/mq</li>
        <li><strong>Centro Storico (da ristrutturare):</strong> 1.200 – 2.500 €/mq</li>
        <li><strong>Fuorigrotta / Bagnoli:</strong> 1.800 – 3.200 €/mq</li>
      </ul>

      <h3>Tendenze 2026: cosa sta succedendo</h3>
      <p>Il mercato napoletano nel 2026 mostra alcune tendenze chiare:</p>
      <ul>
        <li><strong>Stabilizzazione dei tassi:</strong> dopo il ciclo di rialzi BCE, i tassi sui mutui si sono stabilizzati, riattivando la domanda di acquirenti con mutuo</li>
        <li><strong>Crescita del Centro Storico:</strong> il quartiere UNESCO continua ad attrarre investitori per affitti brevi e B&B; la domanda supera l'offerta di qualità</li>
        <li><strong>Pressione al Vomero:</strong> il quartiere più richiesto mantiene prezzi solidi; la domanda eccede l'offerta disponibile</li>
        <li><strong>Rivalutazione di Fuorigrotta:</strong> il completamento della metro linea 6 ha riportato interesse su quest'area con prezzi ancora accessibili</li>
      </ul>

      <h3>Conviene comprare casa a Napoli nel 2026?</h3>
      <p>Per chi acquista per abitare: sì, soprattutto con mutuo a tasso fisso. I prezzi napoletani restano competitivi rispetto a Roma, Milano e alle principali città europee affacciate sul Mediterraneo.</p>
      <p>Per chi investe: il rendimento da affitto breve nel Centro Storico e a Chiaia supera ancora il 6-7% annuo lordo, con buone prospettive di rivalutazione.</p>

      <h3>Ottieni una valutazione precisa</h3>
      <p>I dati medi sono utili come orientamento, ma il valore reale di un immobile dipende da decine di variabili specifiche. HUB offre valutazioni gratuite basate su dati reali di vendita nella stessa zona e nello stesso periodo.</p>
    `
  },
  {
    slug: "valutazione-immobile-napoli",
    title: "Come si valuta un immobile a Napoli: metodi e criteri professionali",
    excerpt: "Scopri come viene calcolato il valore di una casa a Napoli: comparativo di mercato, stato dell'immobile, piano, esposizione e tutti i fattori che incidono sul prezzo.",
    date: "2026-05-12",
    category: "Consigli Pratici",
    readTime: "8 min",
    content: `
      <h2>Come si calcola il valore di una casa a Napoli</h2>
      <p>La domanda più comune che riceviamo da chi vuole vendere o comprare casa a Napoli è: "quanto vale questo immobile?" La risposta non è mai semplice, perché il valore dipende da molteplici fattori che solo chi conosce bene il mercato locale sa pesare correttamente.</p>

      <h3>Il metodo comparativo di mercato (CMA)</h3>
      <p>Il metodo più affidabile è il <strong>Comparative Market Analysis</strong>: confronto con immobili simili venduti nella stessa zona negli ultimi 6-12 mesi. Non annunci di vendita (che possono essere gonfiati), ma prezzi reali di transazioni concluse.</p>

      <h3>I fattori che incidono sul valore</h3>
      <ul>
        <li><strong>Zona e microzona:</strong> a parità di piano e metratura, due appartamenti nello stesso quartiere possono valere il 20-40% di differenza in base alla via specifica</li>
        <li><strong>Piano:</strong> al Vomero un piano alto con vista vale il 15-25% in più rispetto al piano basso senza affaccio</li>
        <li><strong>Esposizione e luminosità:</strong> gli appartamenti esposti a sud e luminosi valgono mediamente il 10-15% in più</li>
        <li><strong>Stato conservativo:</strong> un immobile ristrutturato ottimamente vale il 30-40% più di uno da ristrutturare nelle stesse condizioni strutturali</li>
        <li><strong>Efficienza energetica (classe APE):</strong> dal 2024 la classe energetica incide sempre di più sulle trattative; una classe A o B può valere 5-10% in più rispetto alla stessa unità in classe F o G</li>
        <li><strong>Regolarità urbanistica e catastale:</strong> un immobile con difformità documentali vale meno e si vende più lentamente</li>
        <li><strong>Dotazioni condominiali:</strong> ascensore, portineria, posto auto, terrazzo condominiale</li>
      </ul>

      <h3>L'errore più comune: basarsi sui prezzi degli annunci</h3>
      <p>Gli annunci pubblicati sui portali riflettono il <em>prezzo richiesto</em>, non quello di vendita. In media, in Italia, lo scarto tra prezzo richiesto e prezzo di vendita è del 10-20%. A Napoli, nelle zone più liquide come il Vomero, lo scarto è più contenuto (5-12%), mentre in zone con meno transazioni può essere superiore.</p>

      <h3>La valutazione gratuita di HUB</h3>
      <p>HUB offre valutazioni gratuite e senza impegno per immobili a Napoli. La valutazione viene elaborata dai nostri agenti con accesso ai dati reali di vendita del quartiere, non da algoritmi automatici. Contattaci per ricevere una stima precisa entro 24 ore.</p>
    `
  },
  {
    slug: "acquisto-prima-casa-napoli-guida",
    title: "Acquistare la prima casa a Napoli: guida passo dopo passo per il 2026",
    excerpt: "Dalla ricerca al rogito: tutto quello che devi sapere per comprare casa a Napoli per la prima volta. Agevolazioni, mutuo, documenti e consigli pratici di HUB.",
    date: "2026-05-05",
    category: "Comprare Casa",
    readTime: "10 min",
    content: `
      <h2>Comprare la prima casa a Napoli nel 2026: guida completa</h2>
      <p>Acquistare la prima casa è uno dei momenti più importanti della vita. A Napoli, con le sue particolarità di mercato, è ancora più importante essere preparati. Ecco la guida completa di HUB per chi acquista per la prima volta.</p>

      <h3>Step 1: definisci il budget reale</h3>
      <p>Prima di cercare casa, calcola il budget effettivo considerando:</p>
      <ul>
        <li>Risparmio disponibile per l'anticipo (le banche finanziano solitamente l'80% del valore)</li>
        <li>Rata mensile sostenibile (non più del 30-35% del reddito netto)</li>
        <li>Spese accessorie: imposta di registro, notaio, agenzia, trasloco, eventuali lavori</li>
      </ul>
      <p>Con WeUnit, il ramo creditizio di HUB, puoi ottenere una pre-analisi gratuita della tua capacità di mutuo prima ancora di iniziare a cercare casa.</p>

      <h3>Step 2: scegli il quartiere giusto</h3>
      <p>Napoli è una città di quartieri: la scelta della zona deve bilanciare qualità della vita, servizi, collegamenti e budget. I quartieri più richiesti (Vomero, Chiaia, Posillipo) hanno prezzi più alti ma maggiore liquidità del mercato; zone come Fuorigrotta o Arenella offrono prezzi più accessibili con buoni servizi.</p>

      <h3>Step 3: la ricerca dell'immobile</h3>
      <p>Usa più canali: portali immobiliari, agenzie locali con mandati in esclusiva, e il passaparola. Un'agenzia immobiliare con conoscenza profonda della zona, come HUB al Vomero, ha spesso accesso a immobili non ancora pubblicati.</p>

      <h3>Step 4: proposta d'acquisto e trattativa</h3>
      <p>Una volta trovata la casa giusta, si presenta una proposta d'acquisto scritta con caparra confirmatoria. Attenzione: verifica sempre la documentazione dell'immobile prima di versare qualsiasi cifra.</p>

      <h3>Step 5: verifiche documentali essenziali</h3>
      <ul>
        <li>Conformità catastale (planimetria = stato reale)</li>
        <li>Conformità urbanistica (nessun abuso edilizio)</li>
        <li>Assenza di ipoteche o pignoramenti (visura ipotecaria)</li>
        <li>Situazione condominiale (eventuali morosità del venditore)</li>
        <li>APE aggiornato</li>
      </ul>

      <h3>Step 6: compromesso e rogito</h3>
      <p>Il compromesso (contratto preliminare) è un passo vincolante: dopo la firma, in caso di recesso del venditore, si ha diritto al doppio della caparra. Al rogito (atto definitivo dal notaio) si completa il trasferimento di proprietà.</p>

      <h3>Le agevolazioni prima casa 2026</h3>
      <ul>
        <li>Imposta di registro al 2% (invece del 9%) sul valore catastale</li>
        <li>IVA al 4% se si acquista dal costruttore</li>
        <li>Garanzia CONSAP per under 36 (garanzia statale all'80% del mutuo)</li>
        <li>Detrazione interessi mutuo fino a 4.000€/anno in dichiarazione dei redditi</li>
      </ul>

      <h3>HUB: un unico punto per tutto il percorso</h3>
      <p>Con HUB trovi la casa, verifichi i documenti, ottieni il mutuo con WeUnit e assicuri l'immobile con Henia. Un percorso completo, senza sorprese, in un unico punto di riferimento a Napoli.</p>
    `
  },
  {
    slug: "agenzia-immobiliare-napoli-come-scegliere",
    title: "Come scegliere un'agenzia immobiliare a Napoli: 7 criteri fondamentali",
    excerpt: "Non tutte le agenzie immobiliari sono uguali. Ecco i 7 criteri per scegliere il partner giusto per vendere o comprare casa a Napoli senza rischi.",
    date: "2026-04-28",
    category: "Consigli Pratici",
    readTime: "6 min",
    content: `
      <h2>Come scegliere un'agenzia immobiliare a Napoli</h2>
      <p>A Napoli operano decine di agenzie immobiliari, dalle grandi catene ai piccoli operatori locali. Scegliere quella giusta può fare la differenza tra una compravendita serena e un'esperienza stressante e costosa. Ecco i 7 criteri che contano davvero.</p>

      <h3>1. Esperienza locale certificata</h3>
      <p>Un'agenzia che opera nel quartiere da anni conosce i prezzi reali delle singole vie, i meccanismi del mercato locale e i potenziali acquirenti. Non affidarti a chi "copre tutta Napoli" in modo generico.</p>

      <h3>2. Metodo di valutazione trasparente</h3>
      <p>L'agenzia deve sapere spiegare come calcola il valore del tuo immobile, con dati di mercato reali e comparativi verificabili. Diffida di chi propone prezzi gonfiati per aggiudicarsi il mandato, o di chi fa valutazioni istantanee senza vedere l'immobile.</p>

      <h3>3. Verifica documentale preventiva</h3>
      <p>Un'agenzia seria verifica la conformità catastale e urbanistica prima di mettere l'immobile sul mercato. Questo evita brutte sorprese a pochi giorni dal rogito.</p>

      <h3>4. Piano di marketing specifico</h3>
      <p>Come verrà promosso il tuo immobile? Servizio fotografico professionale, virtual tour, pubblicazione sui principali portali, social media, mailing list di acquirenti già qualificati: un piano di marketing concreto fa la differenza sui tempi di vendita.</p>

      <h3>5. Qualificazione degli acquirenti</h3>
      <p>Non tutte le visite portano a un'offerta seria. Un'agenzia professionale qualifica gli acquirenti in anticipo, verificando la loro reale capacità finanziaria, evitando di farti perdere tempo con persone che non possono ottenere il mutuo.</p>

      <h3>6. Servizio integrato (mutuo + assicurazione)</h3>
      <p>Un venditore ha interesse a che l'acquirente ottenga il mutuo. Se l'agenzia ha accesso a un mediatore creditizio interno, le trattative che partono si concludono: non salta il rogito per mancanza di finanziamento all'ultimo momento.</p>

      <h3>7. Recensioni verificabili e referenze reali</h3>
      <p>Controlla le recensioni su Google Business Profile: devono essere recenti, specifiche e numerose. Diffida di profili con poche recensioni o tutte generiche.</p>

      <h3>HUB Napoli: i 7 criteri in un unico posto</h3>
      <p>HUB opera al Vomero da 26 anni con un team di 10 professionisti, un metodo strutturato in 7 pilastri, un ramo creditizio (WeUnit) e uno assicurativo (Henia) integrati, e oltre 5 recensioni Google a 5 stelle. Contattaci per una consulenza gratuita senza impegno.</p>
    `
  },
  {
    slug: "come-vendere-casa-napoli",
    title: "Come vendere casa a Napoli nel 2025: guida completa",
    excerpt: "Tutto quello che devi sapere per vendere casa a Napoli: documentazione, valutazione, marketing e negoziazione. La guida pratica di HUB.",
    date: "2025-05-15",
    category: "Vendere Casa",
    readTime: "8 min",
    content: `
      <h2>Vendere casa a Napoli: da dove iniziare</h2>
      <p>Vendere un immobile a Napoli nel 2025 richiede preparazione, strategia e — soprattutto — una conoscenza profonda del mercato locale. Il mercato napoletano è eterogeneo: i valori variano moltissimo da quartiere a quartiere e persino da strada a strada.</p>

      <h3>1. Valutazione corretta del prezzo</h3>
      <p>Il primo errore che i venditori commettono è sopravvalutare l'immobile. Un prezzo troppo alto blocca le trattative per mesi e alla fine porta a svendere. Una valutazione professionale basata su dati reali di vendita nella stessa zona è il primo passo obbligatorio.</p>

      <h3>2. Verifica documentale: la due diligence</h3>
      <p>Prima di mettere l'immobile sul mercato, è indispensabile verificare:</p>
      <ul>
        <li>Conformità catastale e urbanistica</li>
        <li>Assenza di ipoteche o pignoramenti</li>
        <li>APE (Attestato di Prestazione Energetica) aggiornato</li>
        <li>Planimetria catastale conforme allo stato dei luoghi</li>
        <li>Documenti condominiali in regola</li>
      </ul>

      <h3>3. Marketing professionale</h3>
      <p>Foto di qualità professionale, virtual tour 3D, pubblicazione sui principali portali immobiliari (Immobiliare.it, Idealista, Casa.it) e sui social media fanno la differenza nella velocità di vendita e nel prezzo finale ottenuto.</p>

      <h3>4. Qualificazione degli acquirenti</h3>
      <p>Non tutti gli interessati sono acquirenti seri. La qualificazione preventiva — verifica della capacità finanziaria e della reale intenzione di acquisto — evita visite inutili e trattative che si bloccano per mancanza di mutuo.</p>

      <h3>5. Negoziazione e rogito</h3>
      <p>La trattativa sul prezzo e le condizioni richiede esperienza e neutralità. Un agente immobiliare professionista tutela gli interessi del venditore senza compromettere la trattativa.</p>

      <h2>Il programma Zero Vincoli 60 di HUB</h2>
      <p>HUB offre una garanzia unica a Napoli: con Zero Vincoli 60, vendiamo la tua casa in 60 giorni o la acquistiamo noi. Nessun vincolo, nessun rischio per il venditore.</p>
    `
  },
  {
    slug: "mutuo-prima-casa-napoli",
    title: "Mutuo prima casa a Napoli 2025: tutto quello che devi sapere",
    excerpt: "Tassi, requisiti, documenti e consigli per ottenere il mutuo prima casa a Napoli. La guida aggiornata di WeUnit (HUB).",
    date: "2025-05-08",
    category: "Mutui",
    readTime: "7 min",
    content: `
      <h2>Mutuo prima casa a Napoli nel 2025</h2>
      <p>Ottenere un mutuo per comprare la prima casa a Napoli è più semplice se si sa da dove partire. I tassi nel 2025 si sono stabilizzati dopo il ciclo di rialzi BCE, rendendo il momento favorevole per chi vuole acquistare.</p>

      <h3>Requisiti per il mutuo prima casa</h3>
      <ul>
        <li>Non essere proprietario di altri immobili (o averne uno inagibile)</li>
        <li>Reddito dimostrabile e stabile</li>
        <li>Rata non superiore al 30-35% del reddito mensile netto</li>
        <li>Immobile da adibire ad abitazione principale</li>
      </ul>

      <h3>Agevolazioni prima casa 2025</h3>
      <p>Per la prima casa esistono importanti agevolazioni fiscali:</p>
      <ul>
        <li><strong>Imposta di registro agevolata:</strong> 2% invece del 9% sul valore catastale</li>
        <li><strong>IVA ridotta:</strong> 4% per acquisti da costruttore</li>
        <li><strong>Garanzia CONSAP:</strong> per under 36 con ISEE fino a 40.000€, garanzia statale all'80% del mutuo</li>
      </ul>

      <h3>Quanto vale il tuo mutuo?</h3>
      <p>Con un reddito netto di 2.000€/mese, una rata sostenibile si aggira sui 600-700€. Questo corrisponde a un mutuo di circa 130.000-150.000€ a 25 anni ai tassi attuali.</p>

      <h3>WeUnit: il mediatore creditizio di HUB</h3>
      <p>WeUnit confronta le offerte di oltre 20 banche per trovare il mutuo più adatto alla tua situazione. La consulenza è gratuita e la pratica viene seguita fino all'erogazione.</p>
    `
  },
  {
    slug: "migliori-quartieri-abitare-napoli",
    title: "Migliori quartieri dove abitare a Napoli nel 2025",
    excerpt: "Vomero, Posillipo, Chiaia, Centro Storico: confronto tra i quartieri di Napoli per qualità della vita, prezzi e servizi. Guida completa di HUB.",
    date: "2025-04-28",
    category: "Mercato Immobiliare",
    readTime: "10 min",
    content: `
      <h2>I migliori quartieri di Napoli per vivere nel 2025</h2>
      <p>Napoli è una città di quartieri, ognuno con la sua identità, i suoi prezzi e la sua qualità della vita. Scegliere dove abitare è una decisione fondamentale che dipende da molti fattori: budget, stile di vita, vicinanza al lavoro e ai servizi.</p>

      <h3>Vomero: il quartiere più richiesto</h3>
      <p>Il Vomero è il quartiere residenziale per eccellenza di Napoli: alto sul mare, con aria fresca, ottimi collegamenti (funicolare e metro) e una vasta offerta di negozi e ristoranti. I prezzi rispecchiano la domanda: 3.500-5.500 €/mq per gli appartamenti ristrutturati.</p>

      <h3>Posillipo: lusso e vista mare</h3>
      <p>Il quartiere più esclusivo di Napoli. Case con vista sul Golfo, ville panoramiche e residenze di pregio. I prezzi partono da 5.000 €/mq e possono superare i 12.000 €/mq per le ville più pregiate.</p>

      <h3>Chiaia: eleganza e vivibilità</h3>
      <p>Chiaia è il quartiere più elegante di Napoli, con la Riviera e i negozi di lusso. Molto richiesto da giovani professionisti e famiglie. Prezzi tra 4.000 e 7.000 €/mq nelle posizioni migliori.</p>

      <h3>Centro Storico: opportunità e cultura</h3>
      <p>Per chi ama la vita urbana intensa e non disdegna la ristrutturazione, il Centro Storico UNESCO offre opportunità interessanti a prezzi più accessibili: 1.200-4.000 €/mq a seconda delle condizioni.</p>

      <h3>Fuorigrotta e Bagnoli: qualità a prezzi contenuti</h3>
      <p>Zone in evoluzione, con prezzi tra 1.800 e 3.200 €/mq, buoni collegamenti (metro linea 6) e progetti di riqualificazione in corso.</p>

      <h3>Come scegliere il quartiere giusto?</h3>
      <p>HUB offre una consulenza gratuita per orientarti nella scelta del quartiere più adatto alle tue esigenze e al tuo budget. Contattaci per parlare con un consulente esperto del mercato napoletano.</p>
    `
  },
  {
    slug: "vendere-casa-senza-agenzia-napoli",
    title: "Vendere casa senza agenzia a Napoli: conviene davvero?",
    excerpt: "Analisi costi-benefici della vendita privata vs agenzia a Napoli. Rischi, opportunità e tutto quello che devi sapere prima di decidere.",
    date: "2025-04-15",
    category: "Consigli Pratici",
    readTime: "9 min",
    content: `
      <h2>Vendere casa da soli a Napoli: è davvero conveniente?</h2>
      <p>Sempre più proprietari si chiedono se ha senso affidarsi a un'agenzia immobiliare o vendere direttamente. La risposta non è semplice e dipende da molti fattori.</p>

      <h3>I rischi della vendita privata</h3>
      <ul>
        <li><strong>Prezzo sbagliato:</strong> senza dati di mercato reali, il rischio di sovrastimare (e bloccare la vendita) o sottostimare (e perdere soldi) è alto</li>
        <li><strong>Problemi documentali:</strong> difformità catastali, ipoteche, mancanza di APE: se vengono fuori dopo il compromesso, possono bloccare o annullare la vendita</li>
        <li><strong>Acquirenti non qualificati:</strong> chi non ha un mutuo approvato può bloccarti per mesi</li>
        <li><strong>Trappole contrattuali:</strong> un compromesso mal redatto può costare molto caro</li>
        <li><strong>Tempo e stress:</strong> gestire visite, trattative e burocrazia richiede tempo e competenze specifiche</li>
      </ul>

      <h3>Quanto costa un'agenzia immobiliare?</h3>
      <p>Le provvigioni tipiche a Napoli variano tra il 2% e il 4% sul prezzo di vendita per parte (venditore e acquirente). Su un immobile da 200.000€, la provvigione è di 4.000-8.000€ per il venditore.</p>

      <h3>Cosa ottieni con un'agenzia professionale?</h3>
      <ul>
        <li>Valutazione precisa basata su dati reali</li>
        <li>Due diligence documentale preventiva</li>
        <li>Marketing professionale (foto, portali, social)</li>
        <li>Qualificazione degli acquirenti</li>
        <li>Negoziazione professionale</li>
        <li>Assistenza legale e notarile</li>
      </ul>

      <h3>La garanzia Zero Vincoli 60 di HUB</h3>
      <p>HUB offre una soluzione unica: Zero Vincoli 60. Vendiamo la tua casa in 60 giorni, al prezzo concordato, senza vincoli. Se non vendiamo, valutiamo l'acquisto diretto. Una garanzia concreta che non esiste nella vendita privata.</p>

      <h3>Conclusione</h3>
      <p>La vendita privata può sembrare conveniente sulla carta, ma i rischi e il tempo richiesto spesso superano il risparmio sulla provvigione. Con HUB hai la certezza del risultato e la tranquillità di un servizio professionale e garantito.</p>
    `
  }
];

export default function BlogPage({ navigate, colors }) {
  const { NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM } = colors;
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    // Blog schema
    const schema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Blog Immobiliare HUB Napoli",
      "description": "Articoli e guide pratiche sul mercato immobiliare di Napoli: vendere casa, mutui, quartieri e molto altro.",
      "url": "https://www.fondocasahub.com/blog",
      "publisher": {
        "@type": "Organization",
        "name": "HUB – FC Punto Hub Srl",
        "url": "https://www.fondocasahub.com"
      },
      "blogPost": ARTICLES.map(a => ({
        "@type": "BlogPosting",
        "headline": a.title,
        "description": a.excerpt,
        "datePublished": a.date,
        "author": { "@type": "Organization", "name": "HUB Napoli" },
        "url": `https://www.fondocasahub.com/blog/${a.slug}`
      }))
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-blog';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { const el = document.getElementById('schema-blog'); if (el) el.remove(); };
  }, []);

  if (selectedArticle) {
    const art = ARTICLES.find(a => a.slug === selectedArticle);
    return (
      <div style={{ background: CREAM, color: NAVY, fontFamily: "'Jost', sans-serif", paddingTop: 80 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 32px" }}>
          <button
            onClick={() => setSelectedArticle(null)}
            style={{ background: "none", border: "none", color: GOLD, cursor: "pointer", fontSize: 14, letterSpacing: 1, fontWeight: 600, marginBottom: 32, display: "flex", alignItems: "center", gap: 8 }}
          >
            ← Torna al blog
          </button>
          <div style={{ fontSize: 12, letterSpacing: 2, color: GOLD, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>{art.category} · {art.readTime} di lettura</div>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 700, color: NAVY, lineHeight: 1.3, marginBottom: 16 }}>{art.title}</h1>
          <div style={{ fontSize: 13, color: "rgba(10,31,61,0.5)", marginBottom: 40 }}>Pubblicato il {new Date(art.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })} · HUB Napoli</div>
          <div
            style={{ fontSize: 16, lineHeight: 1.9, color: NAVY }}
            dangerouslySetInnerHTML={{ __html: art.content
              .replace(/<h2>/g, `<h2 style="font-size:1.5rem;font-weight:700;color:${NAVY};margin:40px 0 16px">`)
              .replace(/<h3>/g, `<h3 style="font-size:1.15rem;font-weight:700;color:${NAVY};margin:32px 0 12px">`)
              .replace(/<ul>/g, `<ul style="padding-left:24px;margin-bottom:20px">`)
              .replace(/<li>/g, `<li style="margin-bottom:8px">`)
              .replace(/<p>/g, `<p style="margin-bottom:20px">`)
            }}
          />
          <div style={{ marginTop: 48, padding: 32, background: NAVY_DEEP, borderRadius: 4, color: CREAM, textAlign: "center" }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: GOLD, textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Hai bisogno di una consulenza?</div>
            <p style={{ marginBottom: 24, opacity: 0.85 }}>HUB offre consulenze gratuite per vendere, comprare o trovare il mutuo giusto a Napoli.</p>
            <button onClick={() => navigate("comincia")} style={{ background: GOLD, color: NAVY, border: "none", padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>
              Consulenza gratuita
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: CREAM, color: NAVY, fontFamily: "'Jost', sans-serif", paddingTop: 80 }}>
      {/* Hero */}
      <section style={{ background: NAVY_DEEP, color: CREAM, padding: "64px 32px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: GOLD, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Blog Immobiliare</div>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
            Guide pratiche sul mercato<br />
            <span style={{ color: GOLD }}>immobiliare di Napoli</span>
          </h1>
          <p style={{ fontSize: 17, opacity: 0.8, lineHeight: 1.7 }}>
            Articoli, consigli e analisi di mercato da chi vive il settore immobiliare napoletano ogni giorno.
          </p>
        </div>
      </section>

      {/* Articles grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 32 }}>
          {ARTICLES.map(art => (
            <article
              key={art.slug}
              onClick={() => setSelectedArticle(art.slug)}
              style={{
                background: "#fff",
                borderRadius: 4,
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 2px 16px rgba(10,31,61,0.08)",
                transition: "transform 0.2s, box-shadow 0.2s",
                border: `1px solid rgba(10,31,61,0.06)`
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(10,31,61,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(10,31,61,0.08)"; }}
            >
              <div style={{ background: NAVY_DEEP, height: 6 }} />
              <div style={{ padding: "28px 28px 32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 11, letterSpacing: 1.5, color: GOLD, textTransform: "uppercase", fontWeight: 600 }}>{art.category}</span>
                  <span style={{ fontSize: 12, color: "rgba(10,31,61,0.45)" }}>{art.readTime}</span>
                </div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY, lineHeight: 1.4, marginBottom: 12 }}>{art.title}</h2>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(10,31,61,0.7)", marginBottom: 20 }}>{art.excerpt}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "rgba(10,31,61,0.45)" }}>
                    {new Date(art.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>Leggi →</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 64, textAlign: "center", padding: 48, background: NAVY_DEEP, borderRadius: 4, color: CREAM }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: GOLD, textTransform: "uppercase", fontWeight: 600, marginBottom: 16 }}>Hai una domanda?</div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>Parla con un consulente HUB Napoli</h2>
          <p style={{ opacity: 0.8, marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>Ogni situazione è unica. I nostri consulenti rispondono alle tue domande gratuitamente, senza impegno.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("comincia")} style={{ background: GOLD, color: NAVY, border: "none", padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>Consulenza gratuita</button>
            <button onClick={() => navigate("contatti")} style={{ background: "transparent", color: CREAM, border: `2px solid rgba(255,255,255,0.3)`, padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>Contattaci</button>
          </div>
        </div>
      </section>
    </div>
  );
}
