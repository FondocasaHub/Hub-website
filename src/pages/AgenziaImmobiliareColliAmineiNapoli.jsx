import QuartiereLandingPage from "../components/QuartiereLandingPage";

/*
 * Landing "agenzia immobiliare a Napoli, Colli Aminei".
 * Vedi nota contenuti in AgenziaImmobiliareVomeroNapoli.jsx: le cifre di
 * mercato non verificate restano tra [PLACEHOLDER: ...].
 */

export default function AgenziaImmobiliareColliAmineiNapoli() {
  return (
    <QuartiereLandingPage
      quartiere="Colli Aminei"
      slug="colli-aminei"
      heroEyebrow="Agenzia Immobiliare a Napoli, Colli Aminei"
      heroTitle={<>Agenzia immobiliare a Napoli,<br/>zona <span className="accent">Colli Aminei</span>.</>}
      heroSubtitle="Compra o vendi casa ai Colli Aminei con un'agenzia con 26 anni di esperienza sul mercato immobiliare di Napoli. Valutazione gratuita e servizio integrato immobiliare, mutuo e assicurazione."
      heroPills={["26 anni di esperienza", "Valutazione gratuita", "Via Pietro Mascagni 35"]}
      alsoServesAreas={["Vomero", "Chiaia", "Posillipo", "Fuorigrotta", "Arenella"]}
      nearbyAreas={[
        { name: "Arenella", slug: "arenella" },
        { name: "Vomero", slug: "vomero" },
        { name: "Chiaia", slug: "chiaia" },
        { name: "Fuorigrotta", slug: "fuorigrotta" },
      ]}
      whyUsPoints={[
        {
          icon: "🏠",
          title: "26 anni sul mercato di Napoli",
          desc: "Dalla sede di Via Pietro Mascagni 35 seguiamo compravendite anche ai Colli Aminei, con un metodo collaudato in 26 anni di attività.",
        },
        {
          icon: "📊",
          title: "Valutazioni su dati reali",
          desc: "Confrontiamo il tuo immobile con le vendite comparabili effettive della zona, non con stime generiche da portale.",
        },
        {
          icon: "🤝",
          title: "Un solo interlocutore",
          desc: "Immobiliare, mutuo e assicurazione seguiti dallo stesso team, dalla valutazione fino al rogito.",
        },
        {
          icon: "⭐",
          title: "Recensioni verificate 5/5",
          desc: "Clienti in tutta Napoli ci hanno scelto, con recensioni verificate a 5 stelle su Google.",
        },
      ]}
      marketText={[
        "Colli Aminei è un quartiere collinare del settore settentrionale di Napoli, sviluppato prevalentemente a partire dagli anni '60-'70, noto soprattutto per la vicinanza ai due principali poli ospedalieri della città, il Cardarelli e il Monaldi. Questa collocazione, unita alla presenza della fermata Colli Aminei della Metro Linea 1, lo rende un quartiere ben collegato sia verso il centro sia verso la tangenziale, pur mantenendo un carattere prevalentemente residenziale e tranquillo. La vicinanza a Capodimonte e al suo parco offre inoltre un accesso al verde raro da trovare in altre zone della città con la stessa comodità di collegamenti.",
        "Il patrimonio immobiliare è composto in gran parte da condomini di medie e grandi dimensioni, spesso con ascensore e box auto, caratteristiche diffuse per via dell'epoca di costruzione più recente rispetto ai quartieri storici della città. I tagli disponibili sono generalmente familiari, con una buona presenza di trilocali e quadrilocali adatti a chi cerca spazio senza allontanarsi troppo dal centro cittadino. La pianificazione urbanistica più razionale rispetto ai quartieri storici si traduce spesso anche in strade più ampie e una migliore disponibilità di parcheggio, un aspetto molto apprezzato da chi si trasferisce da zone più dense della città.",
        "Sul fronte dei prezzi, i Colli Aminei si collocano in una fascia media per Napoli, generalmente più accessibile rispetto a Vomero, Chiaia e Posillipo. A incidere di più sono lo stato dell'immobile e la distanza dalla stazione della metropolitana. La vicinanza alla fermata della metropolitana e ai poli ospedalieri sono tra i fattori che incidono maggiormente sulla domanda e quindi sul valore degli immobili della zona.",
        "La domanda arriva soprattutto da famiglie che lavorano nella zona ospedaliera o negli uffici limitrofi, e da chi cerca un buon collegamento metro verso il centro mantenendo prezzi più accessibili rispetto alle zone collinari più centrali. È inoltre un quartiere di interesse per chi investe in immobili da destinare alla locazione a personale sanitario o universitario, vista la vicinanza ai grandi ospedali cittadini e la buona disponibilità di mezzi pubblici su gomma e su ferro.",
        "Per chi vende casa ai Colli Aminei, la documentazione richiesta riguarda soprattutto la regolarità catastale e urbanistica dei condomini più datati. Un immobile ben posizionato rispetto alla fermata metro e con documentazione in ordine si distingue rapidamente dalla concorrenza, in una zona dove il collegamento ai trasporti pesa molto sulle scelte degli acquirenti. Anche lo stato delle parti comuni del condominio — ascensore, facciata, impianti — incide in modo significativo sulla velocità di vendita, più che in edifici di pregio dove prevale il valore della singola unità.",
      ]}
      faq={[
        {
          q: "Quanto vale un appartamento ai Colli Aminei?",
          a: "I Colli Aminei sono generalmente più accessibili rispetto a Vomero, Chiaia e Posillipo. Il valore cambia in base alla strada, allo stato dell'immobile e alla vicinanza alla metropolitana. Richiedi una valutazione gratuita per una stima basata sulle vendite reali della tua zona.",
        },
        {
          q: "I Colli Aminei sono ben collegati al centro di Napoli?",
          a: "Sì, grazie alla fermata Colli Aminei della Metro Linea 1, che collega rapidamente il quartiere sia al centro città sia alla tangenziale.",
        },
        {
          q: "Quanto tempo serve per vendere casa ai Colli Aminei?",
          a: "Dipende soprattutto dal prezzo di partenza, dalla documentazione e dal marketing dell'immobile. Con il programma Zero Vincoli 60 i primi 60 giorni seguono un piano di attività definito da contratto: se al termine non sei soddisfatto del servizio, o se non abbiamo svolto tutte le attività previste, puoi recedere dall'incarico senza penali. La vicinanza alla metro tende a facilitare la vendita rispetto a zone meno servite.",
        },
        {
          q: "Perché i Colli Aminei sono richiesti da chi lavora in ambito sanitario?",
          a: "Per la vicinanza diretta ai due principali ospedali di Napoli, il Cardarelli e il Monaldi, che rende il quartiere una scelta pratica per chi vi lavora o studia in ambito medico.",
        },
      ]}
      seo={{
        title: "Agenzia Immobiliare a Napoli, Colli Aminei | FondoCasa Hub",
        description: "Compra o vendi casa a Napoli, zona Colli Aminei, con FondoCasa Hub: 26 anni di esperienza al servizio del quartiere. Richiedi una valutazione gratuita.",
      }}
    />
  );
}
