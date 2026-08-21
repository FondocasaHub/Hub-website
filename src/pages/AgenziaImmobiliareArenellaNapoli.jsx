import QuartiereLandingPage from "../components/QuartiereLandingPage";

/*
 * Landing "agenzia immobiliare a Napoli, Arenella".
 * Vedi nota contenuti in AgenziaImmobiliareVomeroNapoli.jsx: le cifre di
 * mercato non verificate restano tra [PLACEHOLDER: ...].
 */

export default function AgenziaImmobiliareArenellaNapoli() {
  return (
    <QuartiereLandingPage
      quartiere="Arenella"
      slug="arenella"
      heroEyebrow="Agenzia Immobiliare a Napoli, Arenella"
      heroTitle={<>Agenzia immobiliare a Napoli,<br/>zona <span className="accent">Arenella</span>.</>}
      heroSubtitle="Compra o vendi casa all'Arenella con un'agenzia radicata sulla collina del Vomero da 26 anni. Valutazione gratuita e servizio integrato immobiliare, mutuo e assicurazione."
      heroPills={["26 anni di esperienza", "Valutazione gratuita", "Via Pietro Mascagni 35"]}
      alsoServesAreas={["Vomero", "Chiaia", "Posillipo", "Fuorigrotta", "Colli Aminei"]}
      nearbyAreas={[
        { name: "Vomero", slug: "vomero" },
        { name: "Colli Aminei", slug: "colli-aminei" },
        { name: "Chiaia", slug: "chiaia" },
        { name: "Posillipo", slug: "posillipo" },
      ]}
      whyUsPoints={[
        {
          icon: "🏠",
          title: "26 anni sulla collina del Vomero",
          desc: "Sede in Via Pietro Mascagni 35, a pochi passi dall'Arenella: conosciamo i valori reali della zona, non le medie cittadine.",
        },
        {
          icon: "📊",
          title: "Valutazioni su dati reali",
          desc: "Confrontiamo il tuo immobile con le vendite comparabili effettive del quartiere, non con stime generiche da portale.",
        },
        {
          icon: "🤝",
          title: "Un solo interlocutore",
          desc: "Immobiliare, mutuo e assicurazione seguiti dallo stesso team, dalla valutazione fino al rogito.",
        },
        {
          icon: "⭐",
          title: "Recensioni verificate 5/5",
          desc: "Famiglie della zona Vomero-Arenella ci hanno scelto, con recensioni verificate a 5 stelle su Google.",
        },
      ]}
      marketText={[
        "L'Arenella è il quartiere collinare che si sviluppa a ridosso del Vomero, tra Cangiani e la zona di Piazzetta Portanova, salendo verso Capodimonte. Meno centrale rispetto al cuore del Vomero, mantiene comunque una posizione elevata e ben collegata: chi cerca casa in questa zona valuta soprattutto il rapporto tra qualità della vita — aria più salubre, minore traffico, buona presenza di verde — e un accesso ancora comodo ai servizi del Vomero, raggiungibile in pochi minuti a piedi o con i mezzi pubblici. Non è un caso che negli ultimi anni il quartiere abbia attratto sempre più chi lavora al Vomero o in centro ma non vuole rinunciare a un ambiente più residenziale e a prezzi meno esposti alla pressione della zona più centrale.",
        "Il tessuto urbano dell'Arenella è prevalentemente residenziale, con una prevalenza di edifici costruiti tra gli anni '50 e '80, spesso con tagli familiari e in molti casi con terrazzi o giardini condominiali, una caratteristica meno comune nelle zone più dense della città. Non mancano alcune palazzine più recenti e complessi con maggiori dotazioni (ascensore, portineria, box auto), particolarmente ricercati da chi si trasferisce da zone più centrali in cerca di più spazio a parità di budget. Anche la presenza di piccoli esercizi commerciali di vicinato lungo le strade principali contribuisce a mantenere un carattere di quartiere vivibile a piedi, senza la densità e il traffico tipici delle zone più basse della città.",
        "Sul fronte dei prezzi, l'Arenella si posiziona generalmente al di sotto del Vomero centrale, pur restando in una fascia medio-alta per gli standard cittadini. Lo scarto tra un immobile ristrutturato e uno da rimettere a nuovo, sulla stessa strada, resta ampio. Le differenze principali dipendono dalla vicinanza al confine con il Vomero vero e proprio — dove i valori si avvicinano a quelli della zona più centrale — e dalla presenza di vista, piano alto o spazi esterni, elementi che nella collina napoletana incidono più che altrove sul prezzo finale.",
        "La domanda arriva soprattutto da famiglie che cercano più metratura rispetto al Vomero centrale mantenendo un accesso rapido ai suoi servizi, scuole e collegamenti: un profilo di acquirente che valuta il quartiere come alternativa più accessibile senza rinunciare alla collina. Non mancano anche giovani coppie al primo acquisto, attratte da un mercato con margini di trattativa spesso più ampi rispetto al Vomero centrale.",
        "Per chi vende, la preparazione documentale resta il passaggio più delicato, specialmente negli edifici più datati dove nel tempo possono essersi accumulate difformità catastali minori. Verificare la regolarità urbanistica prima di mettere l'immobile sul mercato evita rallentamenti in fase di rogito e rafforza la posizione negoziale del venditore, soprattutto in una zona dove il confronto con altre proposte simili è frequente.",
      ]}
      faq={[
        {
          q: "Quanto vale un appartamento all'Arenella?",
          a: "Generalmente meno del Vomero centrale, ma comunque in una fascia medio-alta per Napoli. Il valore cambia sensibilmente da una strada all'altra e in base a piano, ascensore e stato dell'immobile. Richiedi una valutazione gratuita per una stima basata sulle vendite reali della tua zona.",
        },
        {
          q: "L'Arenella è considerata parte del Vomero?",
          a: "L'Arenella è un quartiere a sé stante, confinante con il Vomero e con Capodimonte, ma nel linguaggio comune viene spesso associata alla zona Vomero per posizione collinare e stile di vita simile.",
        },
        {
          q: "Quanto tempo serve per vendere casa all'Arenella?",
          a: "Dipende soprattutto dal prezzo di partenza, dalla documentazione e dal marketing dell'immobile. Con il programma Zero Vincoli 60 i primi 60 giorni seguono un piano di attività definito da contratto: se al termine non sei soddisfatto del servizio, o se non abbiamo svolto tutte le attività previste, puoi recedere dall'incarico senza penali. Un immobile con carte in regola e prezzo in linea con il mercato si vende generalmente più rapidamente.",
        },
        {
          q: "Come si raggiunge l'Arenella dal centro di Napoli?",
          a: "L'Arenella è servita da diverse linee bus e dista pochi minuti a piedi dalle stazioni delle funicolari del Vomero, il che la rende comoda pur mantenendo un ambiente più tranquillo rispetto al centro città.",
        },
      ]}
      seo={{
        title: "Agenzia Immobiliare a Napoli, Arenella | FondoCasa Hub",
        description: "Compra o vendi casa a Napoli, zona Arenella, con FondoCasa Hub: 26 anni di esperienza e conoscenza diretta del quartiere. Richiedi una valutazione gratuita.",
      }}
    />
  );
}
