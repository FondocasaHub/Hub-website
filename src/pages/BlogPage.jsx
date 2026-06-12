import React, { useState, useEffect } from "react";

const ARTICLES = [
  {
    slug: "tassi-bce-giugno-2026-mutui",
    title: "Tassi BCE giugno 2026: come l'aumento dei tassi influenza i mutui a Napoli",
    excerpt: "La BCE ha nuovamente aumentato i tassi di riferimento a giugno. Scopri come questo impatta le rate dei mutui, cosa significa per chi compra casa e quali strategie conviene adottare nel 2026.",
    date: "2026-06-12",
    category: "Credito & Mutui",
    readTime: "7 min",
    content: `
      <h2>I tassi BCE a giugno 2026 e l'impatto sui mutui</h2>
      <p>La Banca Centrale Europea ha confermato il rialzo dei tassi di riferimento a giugno 2026, proseguendo la sua politica di contenimento dell'inflazione. Per chi sta pensando di comprare casa a Napoli nei prossimi mesi, è fondamentale capire come questo aumento si riflette sulle rate dei mutui e quali sono le scelte più convenienti.</p>

      <h3>I nuovi tassi di riferimento della BCE dal 17 giugno 2026</h3>
      <p>A partire dal 17 giugno 2026, la Banca Centrale Europea ha annunciato i seguenti tassi di riferimento:</p>
      <ul>
        <li><strong>Tasso di rifinanziamento principale:</strong> 2,40% (in aumento di 0,25% rispetto al 2,15% precedente)</li>
        <li><strong>Tasso sui depositi:</strong> 2,25% (in aumento di 0,25% rispetto al 2,00% precedente)</li>
      </ul>
      <p>Si tratta di un ulteriore step nel ciclo di normalizzazione della politica monetaria BCE, anche se con un ritmo di aumento che continua a rallentare rispetto ai rialzi più aggressivi dei mesi precedenti. Questo segnale è positivo per chi spera in una stabilizzazione dei tassi sui mutui nei prossimi mesi.</p>

      <h3>Come gli aumenti BCE influenzano i mutui a Napoli</h3>
      <p>Il tasso BCE non è il tasso del tuo mutuo, ma è il parametro su cui si basano i costi del denaro per le banche. Quando la BCE alza il tasso:</p>
      <ul>
        <li><strong>I mutui a tasso variabile:</strong> le rate aumenteranno proporzionalmente. Un mutuo che oggi costa il 3,5% potrebbe superare il 4,0-4,5% nei prossimi mesi</li>
        <li><strong>I mutui a tasso fisso:</strong> non risentiranno immediatamente dell'aumento, ma i nuovi mutui sottoscritti avranno tassi più alti dei precedenti</li>
        <li><strong>I mutui con cap (tetto massimo):</strong> proteggeranno da ulteriori aumenti dopo aver raggiunto il livello di protezione concordato</li>
      </ul>

      <h3>I tassi attuali per i mutui a Napoli (giugno 2026)</h3>
      <p>Sulla base della situazione di mercato a giugno 2026, in seguito al nuovo tasso BCE al 2,40%:</p>
      <ul>
        <li><strong>Tasso fisso:</strong> 3,0% – 3,8% (spread bancario: 0,60% – 1,40%)</li>
        <li><strong>Tasso variabile:</strong> Euribor 3M + spread (varia da banca a banca, mediamente 1,8% – 2,3%)</li>
        <li><strong>Tasso variabile con cap:</strong> generalmente 0,4% – 0,8% più alto del variabile puro, ma con protezione dai rialzi futuri</li>
      </ul>

      <h3>Tasso fisso o tasso variabile? Cosa conviene nel 2026?</h3>
      <p><strong>Tasso fisso:</strong> consigliato se hai intenzione di restare nella casa per almeno 10-15 anni e preferisci prevedibilità di spesa. Stai "assicurando" il tasso di oggi contro il rischio di rialzi futuri.</p>
      <p><strong>Tasso variabile:</strong> potrebbe convenire se prevedi di vendere o refinanziare entro 5-7 anni, oppure se la tua situazione lavorativa è stabile e puoi permetterti variazioni di rata fino al 30-40%. Oggi il variabile costa meno, ma la rata può crescere.</p>
      <p><strong>Variabile con cap:</strong> soluzione di compromesso: risparmi sul tasso iniziale ma sei protetto da aumenti oltre una certa soglia.</p>

      <h3>Esempio concreto: quanto costa un mutuo a Napoli a giugno 2026</h3>
      <p>Scenario: acquisto di un immobile a Napoli per 300.000 €, finanziamento dell'80% (240.000 €), mutuo a 30 anni.</p>
      <ul>
        <li><strong>Tasso fisso 3,4%:</strong> rata mensile circa 1.075 € / interesse totale: 146.850 €</li>
        <li><strong>Tasso variabile Euribor 3M (1,8%) + 2,0% = 3,8%:</strong> rata iniziale circa 1.110 € / aumenterà se l'Euribor sale</li>
      </ul>
      <p>Come vedi, i tassi attuali sono significativamente più bassi rispetto ai picchi di fine 2023, rendendo i mutui più sostenibili per le famiglie napoletane.</p>
      <p>La differenza di 220 € al mese sembra significativa inizialmente, ma il tasso fisso ti protegge da eventuali aumenti nei prossimi 30 anni.</p>

      <h3>Cosa aspettarsi nei prossimi mesi della BCE</h3>
      <p>Gli analisti prevedono che la BCE possa:</p>
      <ul>
        <li>Stabilizzare i tassi a giugno-luglio (scenario più probabile)</li>
        <li>Iniziare a tagliare i tassi nel secondo semestre 2026 se l'inflazione continua a scendere</li>
        <li>Continuare i rialzi se l'inflazione rimane ostinata (scenario meno probabile)</li>
      </ul>

      <h3>Consigli pratici per chi compra casa a Napoli nel 2026</h3>
      <ul>
        <li><strong>Agisci ora se sei interessato:</strong> i tassi potrebbero calare nel secondo semestre, ma oggi puoi bloccare un tasso fisso relativamente vantaggioso rispetto ai massimi di fine 2023</li>
        <li><strong>Confronta le offerte:</strong> lo spread bancario varia tra 1,8% e 2,2%; cambiare banca o negoziare può farti risparmiare centinaia di euro nel corso del mutuo</li>
        <li><strong>Valuta la tua sostenibilità finanziaria:</strong> non scegliere il mutuo in base al tasso più basso, ma in base a quale rata riesci a sostenere serenamente. Ricorda il limite del 30-35% del reddito netto</li>
        <li><strong>Consulta un esperto:</strong> WeUnit, il ramo creditizio di HUB, può analizzare la tua situazione e consigliarti la soluzione più conveniente con una pre-analisi gratuita</li>
      </ul>

      <h3>Conclusione</h3>
      <p>L'aumento dei tassi BCE rende il mercato dei mutui più selective, ma non impedisce a chi ha una buona situazione finanziaria di comprare casa. A Napoli, dove i prezzi restano competitivi, oggi è ancora un buon momento per accendere un mutuo a tasso fisso e realizzare il sogno della casa.</p>
      <p>Contatta HUB per una consulenza gratuita sui mutui: analizzeremo la tua situazione e ti proporremo le soluzioni più convenienti tra le principali banche italiane.</p>
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
