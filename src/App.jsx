import React, { useState, useEffect } from "react";
import ContactForms from "./components/ContactForms";
import QRCode from "react-qr-code";
import ZeroVincoli60Page from "./ZeroVincoli60Page";
import GraziePage from "./GraziePage";
import { GA4_ID } from "./config/tracking";
import { trackPageView } from "./utils/trackingEvents";
import VomeroPage from "./pages/VomeroPage";
import PosillpoPage from "./pages/PosillpoPage";
import ChiaiaPage from "./pages/ChiaiaPage";
import CentroStoricoPage from "./pages/CentroStoricoPage";
import BlogPage from "./pages/BlogPage";
import VendiCasaVomeroPage from "./pages/VendiCasaVomero";
import ConsulenteMutuoNapoliPage from "./pages/ConsulenteMutuoNapoli";
import CostruttoPage from "./pages/Costruttori";
import AgenziaImmobiliareVomeroNapoli from "./pages/AgenziaImmobiliareVomeroNapoli";
import AgenziaImmobiliareArenellaNapoli from "./pages/AgenziaImmobiliareArenellaNapoli";
import AgenziaImmobiliareChiaiaNapoli from "./pages/AgenziaImmobiliareChiaiaNapoli";
import AgenziaImmobiliarePosillipoNapoli from "./pages/AgenziaImmobiliarePosillipoNapoli";
import AgenziaImmobiliareFuorigrottaNapoli from "./pages/AgenziaImmobiliareFuorigrottaNapoli";
import AgenziaImmobiliareColliAmineiNapoli from "./pages/AgenziaImmobiliareColliAmineiNapoli";
import AgenziaImmobiliareCentroStoricoNapoli from "./pages/AgenziaImmobiliareCentroStoricoNapoli";
import AgenziaImmobiliareSoccavoNapoli from "./pages/AgenziaImmobiliareSoccavoNapoli";
import ValutaIlTuoImmobile from "./pages/ValutaIlTuoImmobile";

// === LOGO HUB ===
const HUB_LOGO = "/images/logo-hub-inline.png";

// === FOTO TEAM (10 persone) ===
const TEAM_PHOTOS = [
  "/images/team-0.jpg",
  "/images/team-1.jpg",
  "/images/team-2.jpg",
  "/images/team-3.jpg",
  "/images/team-4.jpg",
  "/images/team-5.jpg",
  "/images/team-6.jpg",
  "/images/team-7.jpg",
  "/images/team-8.jpg",
  "/images/team-9.jpg"
];

// === DATI TEAM (placeholder - sostituire con nomi reali) ===
const TEAM = [
  { foto: 9, nome: "Nicola Nigido",     nome1: "Nicola",    ruolo: "CEO e Store Manager",                 area: "Direzione",   iniziali: "NN",  tel: "3937882334", email: "nicola.nigido@fondocasa.it" },
  { foto: 8, nome: "Avv. Carlo Mosca",  nome1: "Carlo",     ruolo: "Responsabile Team Legale",            area: "Immobiliare", iniziali: "CM",  tel: "3289258010", email: "carlo.mosca@fondocasa.it" },
  { foto: 7, nome: "Vincenzo Esposito", nome1: "Vincenzo",  ruolo: "Team Manager",                        area: "Immobiliare", iniziali: "VE",  tel: "3518392699", email: "vincenzo.esposito@fondocasa.it" },
  { foto: 6, nome: "Vincenzo Di Pinto", nome1: "Vincenzo",  ruolo: "Consulente del Credito e Resp. Aste", area: "Creditizio",  iniziali: "VDP", tel: "3776765500", email: "vincenzo.dipinto@fondocasa.it" },
  { foto: 2, nome: "Annalisa Misuraca", nome1: "Annalisa",  ruolo: "Senior Agent",                        area: "Immobiliare", iniziali: "AM",  tel: "3383255417", email: "annalisa.misuraca@fondocasa.it" },
  { foto: 3, nome: "Leonardo Rausa",    nome1: "Leonardo",  ruolo: "Junior Agent",                        area: "Immobiliare", iniziali: "LR",  tel: "3421372855", email: "leonardo.rausa@fondocasa.it" },
  { foto: 0, nome: "Sara Calvino",      nome1: "Sara",      ruolo: "Buyer Agent",                         area: "Immobiliare", iniziali: "SC",  tel: "3667380144", email: "sara.calvino@fondocasa.it" },
  { foto: 5, nome: "Angela Chiocca",    nome1: "Angela",    ruolo: "Property Assistant",                  area: "Immobiliare", iniziali: "AC",  tel: "3355259648", email: "angela.chiocca@fondocasa.it" },
  { foto: 4, nome: "Sonia Cappiello",   nome1: "Sonia",     ruolo: "Property Assistant",                  area: "Immobiliare", iniziali: "SCa", tel: "3295826352", email: "sonia.cappiello@fondocasa.it" },
  { foto: 1, nome: "Francesco Terrin",  nome1: "Francesco", ruolo: "Property Assistant",                  area: "Immobiliare", iniziali: "FT",  tel: "3389625687", email: "francesco.terrin@fondocasa.it" }
];

// === TESTIMONIANZE REALI (Google) ===
const TESTIMONIALS = [
  {
    nome: "Giovanni Giuliano",
    iniziali: "GG",
    rating: 5,
    testo: "Esperienza molto positiva con FC Punto Hub: uno staff cordiale, sempre disponibile e altamente competente. Hanno gestito la vendita del mio immobile con professionalità e trasparenza, rispettando pienamente il prezzo concordato. Un servizio affidabile che mi sento di raccomandare.",
    servizio: "Vendita immobile",
    fonte: "Google Recensioni"
  },
  {
    nome: "Giuseppe Russo",
    iniziali: "GR",
    rating: 5,
    testo: "Nico è un grande professionista e un'ottima persona dotato di una grande sensibilità e empatia, ci ha seguito in modo impeccabile, con grande disponibilità, passo per passo nella realizzazione del sogno della nostra vita. Non posso che augurargli il meglio sia nella vita sia nel suo cammino professionale.",
    servizio: "Acquisto immobile",
    fonte: "Google Recensioni"
  },
  {
    nome: "Federica di Giovanni",
    iniziali: "FG",
    rating: 5,
    testo: "Nico ed Angela sono persone veramente speciali, professionisti nel loro settore. Ma soprattutto sempre presenti e disponibili in qualsiasi momento. Hanno fatto sì che il mio grande sogno diventasse realtà. Da oggi lo è! Grazie infinite ❤️",
    servizio: "Acquisto immobile",
    fonte: "Google Recensioni"
  },
  {
    nome: "Dina Granito",
    iniziali: "DG",
    rating: 5,
    testo: "Assistenza e attenzione alla persona eccellenti. Ho trovato professionalità, competenza e soprattutto grande umanità. Un'esperienza che consiglio a chiunque cerchi un riferimento serio nel settore immobiliare a Napoli.",
    servizio: "Cliente",
    fonte: "Google · Local Guide"
  },
  {
    nome: "Ciro Giuliano",
    iniziali: "CG",
    rating: 5,
    testo: "Cordialità, disponibilità e grande competenza da parte di tutto lo staff di FC Punto Hub. Ho apprezzato la loro professionalità in ogni fase: il mio immobile è stato venduto al prezzo concordato grazie a un servizio al top con strumenti digitali all'avanguardia.",
    servizio: "Vendita immobile",
    fonte: "Google Recensioni"
  }
];

// Unica fonte di verità per il routing custom: pathname -> chiave pagina.
// Usata sia all'avvio (useState) sia nel listener popstate (indietro/avanti del browser).
const URL_TO_PAGE = {
  '/': 'home',
  '/chi-siamo': 'chi-siamo',
  '/il-nostro-metodo': 'metodo',
  '/contatti': 'contatti',
  '/comincia': 'comincia',
  '/lavora-con-noi': 'carriera',
  '/privacy': 'privacy',
  '/cookie': 'cookie',
  '/note-legali': 'note-legali',
  '/zero-vincoli-60': 'zero-vincoli-60',
  '/costruttori': 'costruttori',
  '/vendi-casa-vomero': 'vendi-casa-vomero',
  '/consulente-mutuo-napoli': 'consulente-mutuo-napoli',
  '/agenzia-immobiliare-vomero-napoli': 'agenzia-immobiliare-vomero-napoli',
  '/agenzia-immobiliare-arenella-napoli': 'agenzia-immobiliare-arenella-napoli',
  '/agenzia-immobiliare-chiaia-napoli': 'agenzia-immobiliare-chiaia-napoli',
  '/agenzia-immobiliare-posillipo-napoli': 'agenzia-immobiliare-posillipo-napoli',
  '/agenzia-immobiliare-fuorigrotta-napoli': 'agenzia-immobiliare-fuorigrotta-napoli',
  '/agenzia-immobiliare-colli-aminei-napoli': 'agenzia-immobiliare-colli-aminei-napoli',
  '/agenzia-immobiliare-centro-storico-napoli': 'agenzia-immobiliare-centro-storico-napoli',
  '/agenzia-immobiliare-soccavo-napoli': 'agenzia-immobiliare-soccavo-napoli',
  '/valuta-il-tuo-immobile': 'valuta-il-tuo-immobile',
  '/grazie': 'grazie',
  '/vomero': 'vomero',
  '/posillipo': 'posillipo',
  '/chiaia': 'chiaia',
  '/centro-storico': 'centro-storico',
  '/blog': 'blog',
};

// Pagine standalone con la propria navbar/footer: non devono ricevere anche
// la navbar/footer condivisi di App.jsx (altrimenti si sovrappongono).
const STANDALONE_PAGES = [
  'zero-vincoli-60', 'costruttori', 'vendi-casa-vomero', 'consulente-mutuo-napoli',
  'agenzia-immobiliare-vomero-napoli', 'agenzia-immobiliare-arenella-napoli',
  'agenzia-immobiliare-chiaia-napoli', 'agenzia-immobiliare-posillipo-napoli',
  'agenzia-immobiliare-fuorigrotta-napoli', 'agenzia-immobiliare-colli-aminei-napoli',
  'agenzia-immobiliare-centro-storico-napoli',
  'agenzia-immobiliare-soccavo-napoli',
  'valuta-il-tuo-immobile',
];

export default function App() {
  const [page, setPage] = useState(() => URL_TO_PAGE[window.location.pathname] || 'home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Initialize Google Analytics 4
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA4_ID, { 'allow_google_signals': true, 'allow_ad_personalization_signals': true });
  }, []);

  // Track page view when page changes
  useEffect(() => {
    const pageTitle = PAGE_META[page]?.title || 'HUB Napoli';
    trackPageView(page, pageTitle);
  }, [page]);

  // SEO: sync browser URL and meta tags with current page
  const PAGE_META = {
    'home': { title: 'Agenzia Immobiliare e Mutui Napoli | FondoCasa Hub', desc: 'A Napoli, immobiliare, mutuo e assicurazione con un solo interlocutore: 26 anni di esperienza al Vomero. Richiedi una valutazione gratuita del tuo immobile.' },
    'chi-siamo': { title: 'Team Immobiliare Vomero Napoli | FondoCasa Hub', desc: 'Scopri il team FondoCasa Hub: 26 anni di esperienza tra immobiliare, mutui e assicurazioni al Vomero di Napoli. Contattaci per un servizio su misura.' },
    'metodo': { title: 'Metodo dei 7 Pilastri per Vendere Casa | FondoCasa Hub', desc: 'Vendi casa senza sorprese con il Metodo dei 7 Pilastri: due diligence, marketing dedicato e gestione di mutuo e assicurazione. Scopri come funziona.' },
    'contatti': { title: 'Contatti Agenzia Immobiliare Vomero | FondoCasa Hub', desc: 'Vieni in Via Pietro Mascagni 35 al Vomero o scrivici: rispondiamo entro 24 ore. Aperti lun-ven 9-19, sab 9-13. Richiedi una consulenza gratuita.' },
    'comincia': { title: 'Valutazione Gratuita Immobile Napoli | FondoCasa Hub', desc: 'Richiedi la valutazione gratuita del tuo immobile a Napoli: analisi di mercato precisa e risposta entro 24 ore dal team FondoCasa Hub. Inizia subito.' },
    'carriera': { title: 'Lavora con Noi: Agenti Immobiliari Napoli | FondoCasa Hub', desc: 'Cerchi lavoro nel settore immobiliare a Napoli? Candidati come agente, consulente creditizio o assicurativo nel team FondoCasa Hub. Posizioni aperte.' },
    'privacy': { title: 'Informativa sulla Privacy | FondoCasa Hub', desc: 'Scopri come FondoCasa Hub tratta i tuoi dati personali nel rispetto del GDPR: raccolta, uso e conservazione delle informazioni. Leggi l\'informativa completa.' },
    'cookie': { title: 'Cookie Policy del Sito | FondoCasa Hub', desc: 'Informazioni sui cookie tecnici e di terze parti utilizzati dal sito fondocasahub.com e su come gestire le tue preferenze. Consulta i dettagli completi.' },
    'note-legali': { title: 'Note Legali e Dati Societari | FondoCasa Hub', desc: 'Informazioni societarie, condizioni d\'uso e avvertenze legali di FC Punto Hub Srl, titolare del sito FondoCasa Hub. Consulta tutti i dettagli societari.' },
    'zero-vincoli-60': { title: 'Zero Vincoli 60: Vendi Casa in 60 Giorni | FondoCasa Hub', desc: 'Vendi casa a Napoli in 60 giorni con l\'incarico esclusivo Zero Vincoli 60: nessuna penale, massima libertà. Oltre 3.200 famiglie assistite. Scopri di più.' },
    'grazie': { title: 'Richiesta Ricevuta | FondoCasa Hub', desc: 'Grazie per averci contattato: un consulente FondoCasa Hub ti richiamerà entro 24 ore per la tua richiesta su casa, mutuo o assicurazione a Napoli.' },
    'vomero': { title: 'Agenzia Immobiliare Vomero Napoli | FondoCasa Hub', desc: 'Compra o vendi casa al Vomero con FondoCasa Hub: 26 anni di esperienza nel quartiere, valutazioni gratuite e consulenza su mutuo e assicurazione. Contattaci.' },
    'posillipo': { title: 'Agenzia Immobiliare Posillipo Napoli | FondoCasa Hub', desc: 'Vuoi comprare o vendere casa a Posillipo? FondoCasa Hub conosce il mercato locale e offre valutazioni gratuite con consulenza su mutuo e assicurazione.' },
    'chiaia': { title: 'Agenzia Immobiliare Chiaia Napoli | FondoCasa Hub', desc: 'FondoCasa Hub segue compravendite immobiliari a Chiaia, Napoli: valutazione gratuita del tuo immobile e assistenza fino al rogito. Richiedi una consulenza.' },
    'centro-storico': { title: 'Agenzia Immobiliare Centro Storico Napoli | FondoCasa Hub', desc: 'Acquista o vendi casa nel Centro Storico di Napoli con FondoCasa Hub: consulenza immobiliare, mutuo e assicurazione integrati. Richiedi info gratuite.' },
    'blog': { title: 'Blog Immobiliare Napoli | FondoCasa Hub', desc: 'Guide pratiche su casa, mutui e mercato immobiliare a Napoli: consigli per vendere, comprare o scegliere il quartiere giusto. Leggi gli articoli del blog.' },
  };

  const PAGE_URLS = {
    'home': '/',
    'chi-siamo': '/chi-siamo',
    'metodo': '/il-nostro-metodo',
    'contatti': '/contatti',
    'comincia': '/comincia',
    'carriera': '/lavora-con-noi',
    'privacy': '/privacy',
    'cookie': '/cookie',
    'note-legali': '/note-legali',
    'zero-vincoli-60': '/zero-vincoli-60',
    'costruttori': '/costruttori',
    'vendi-casa-vomero': '/vendi-casa-vomero',
    'consulente-mutuo-napoli': '/consulente-mutuo-napoli',
    'agenzia-immobiliare-vomero-napoli': '/agenzia-immobiliare-vomero-napoli',
    'agenzia-immobiliare-arenella-napoli': '/agenzia-immobiliare-arenella-napoli',
    'agenzia-immobiliare-chiaia-napoli': '/agenzia-immobiliare-chiaia-napoli',
    'agenzia-immobiliare-posillipo-napoli': '/agenzia-immobiliare-posillipo-napoli',
    'agenzia-immobiliare-fuorigrotta-napoli': '/agenzia-immobiliare-fuorigrotta-napoli',
    'agenzia-immobiliare-colli-aminei-napoli': '/agenzia-immobiliare-colli-aminei-napoli',
    'agenzia-immobiliare-centro-storico-napoli': '/agenzia-immobiliare-centro-storico-napoli',
    'agenzia-immobiliare-soccavo-napoli': '/agenzia-immobiliare-soccavo-napoli',
    'valuta-il-tuo-immobile': '/valuta-il-tuo-immobile',
    'grazie': '/grazie',
    'vomero': '/vomero',
    'posillipo': '/posillipo',
    'chiaia': '/chiaia',
    'centro-storico': '/centro-storico',
    'blog': '/blog',
  };

  // Pagine che gestiscono i propri meta tag via <Helmet> (vedi rispettivi componenti):
  // updateMeta() non deve sovrascriverli con i meta della home.
  const PAGES_WITH_OWN_HELMET = [
    'costruttori', 'vendi-casa-vomero', 'consulente-mutuo-napoli',
    'agenzia-immobiliare-vomero-napoli', 'agenzia-immobiliare-arenella-napoli',
    'agenzia-immobiliare-chiaia-napoli', 'agenzia-immobiliare-posillipo-napoli',
    'agenzia-immobiliare-fuorigrotta-napoli', 'agenzia-immobiliare-colli-aminei-napoli',
    'agenzia-immobiliare-centro-storico-napoli',
    'agenzia-immobiliare-soccavo-napoli',
    'valuta-il-tuo-immobile',
  ];

  const updateMeta = (p) => {
    if (PAGES_WITH_OWN_HELMET.includes(p)) return;
    const meta = PAGE_META[p] || PAGE_META['home'];
    document.title = meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', meta.desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', meta.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', meta.desc);
    const canonical = document.querySelector('link[rel="canonical"]');
    const url = 'https://www.fondocasahub.com' + (PAGE_URLS[p] || '/');
    if (canonical) canonical.setAttribute('href', url);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', url);
  };

  useEffect(() => { updateMeta(page); }, [page]);

  useEffect(() => {
    const onPopState = (e) => {
      const p = URL_TO_PAGE[window.location.pathname] || 'home';
      setPage(p);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page]);

  const NAVY = "#0A1F3D";
  const NAVY_DEEP = "#061229";
  const GOLD = "#C19A5B";
  const GOLD_BRIGHT = "#D4B27A";
  const CREAM = "#F5EFE4";

  const navigate = (p) => {
    setPage(p);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    const url = PAGE_URLS[p] || '/' + p;
    window.history.pushState({ page: p }, '', url);
  };

  const navItems = [
    { id: "home", label: "Home" },
    { id: "chi-siamo", label: "Chi siamo" },
    { id: "metodo", label: "Il nostro metodo" },
    { id: "blog", label: "Blog" },
    { id: "contatti", label: "Contatti" },
    { id: "comincia", label: "Comincia da qui", highlight: true },
    { id: "carriera", label: "Lavora con noi" }
  ];

  return (
    <div style={{ background: CREAM, color: NAVY, fontFamily: "'Jost', sans-serif", minHeight: "100vh" }}>
      <GlobalStyles NAVY={NAVY} NAVY_DEEP={NAVY_DEEP} GOLD={GOLD} GOLD_BRIGHT={GOLD_BRIGHT} CREAM={CREAM} />

      {/* WhatsApp floating */}
      <a href="https://wa.me/393924579047" target="_blank" rel="noopener noreferrer" className="whatsapp-float" title="Scrivici su WhatsApp">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* NAVBAR — nascosta sulle landing standalone con navbar propria */}
      {!STANDALONE_PAGES.includes(page) && <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled || page !== "home" ? "rgba(10,31,61,0.96)" : "transparent",
        backdropFilter: scrolled || page !== "home" ? "blur(12px)" : "none",
        transition: "all 0.4s",
        borderBottom: scrolled || page !== "home" ? `1px solid rgba(193,154,91,0.2)` : "none"
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => navigate("home")}>
            <div className="logo-container" style={{ width: 52, height: 52 }}>
              <img src={HUB_LOGO} alt="HUB" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ color: CREAM }}>
              <div style={{ fontSize: 10, letterSpacing: 2.5, color: GOLD, textTransform: "uppercase", marginBottom: 3, fontWeight: 500 }}>FondoCasa Hub</div>
              <div className="serif" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1, letterSpacing: 1 }}>HUB</div>
              <div style={{ fontSize: 9, letterSpacing: 1.8, color: "rgba(245,239,228,0.6)", textTransform: "uppercase", marginTop: 2 }}>Napoli</div>
            </div>
          </div>

          <div className="hide-mobile" style={{ display: "flex", gap: 28, alignItems: "center", color: CREAM, fontSize: 14 }}>
            {navItems.map(item => (
              item.highlight ? (
                <button
                  key={item.id}
                  className="btn-gold"
                  style={{
                    padding: "10px 22px", borderRadius: 3, border: "none", cursor: "pointer",
                    fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 600
                  }}
                  onClick={() => navigate(item.id)}
                >
                  {item.label}
                </button>
              ) : (
                <span
                  key={item.id}
                  className={`nav-link ${page === item.id ? "active" : ""}`}
                  onClick={() => navigate(item.id)}
                  style={{ color: page === item.id ? GOLD : CREAM }}
                >
                  {item.label}
                </span>
              )
            ))}
          </div>

          <button
            className="show-mobile"
            style={{ display: "none", background: "transparent", border: "none", color: CREAM, fontSize: 24, cursor: "pointer" }}
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            ☰
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div style={{ background: NAVY_DEEP, padding: "20px 32px", display: "flex", flexDirection: "column", gap: 16, borderTop: `1px solid rgba(193,154,91,0.2)` }}>
            {navItems.map(item => (
              <span
                key={item.id}
                onClick={() => navigate(item.id)}
                style={{
                  color: item.highlight ? GOLD : CREAM,
                  fontSize: 16, padding: "8px 0", cursor: "pointer",
                  fontWeight: item.highlight ? 600 : 400,
                  borderLeft: page === item.id ? `2px solid ${GOLD}` : "none",
                  paddingLeft: page === item.id ? 12 : 0
                }}
              >
                {item.label}
              </span>
            ))}
          </div>
        )}
      </nav>}

      {/* PAGINE */}
      {page === "home" && <HomePage navigate={navigate} colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "chi-siamo" && <ChiSiamoPage colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "metodo" && <MetodoPage navigate={navigate} colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "contatti" && <ContactPage navigate={navigate} colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "comincia" && <CominciaQuiPage colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "carriera" && <CarrieraPage colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "privacy" && <PrivacyPage colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "cookie" && <CookiePage colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "note-legali" && <NoteLegaliPage colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "zero-vincoli-60" && <ZeroVincoli60Page navigate={navigate} colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "costruttori" && <CostruttoPage />}
      {page === "agenzia-immobiliare-vomero-napoli" && <AgenziaImmobiliareVomeroNapoli />}
      {page === "agenzia-immobiliare-arenella-napoli" && <AgenziaImmobiliareArenellaNapoli />}
      {page === "agenzia-immobiliare-chiaia-napoli" && <AgenziaImmobiliareChiaiaNapoli />}
      {page === "agenzia-immobiliare-posillipo-napoli" && <AgenziaImmobiliarePosillipoNapoli />}
      {page === "agenzia-immobiliare-fuorigrotta-napoli" && <AgenziaImmobiliareFuorigrottaNapoli />}
      {page === "agenzia-immobiliare-colli-aminei-napoli" && <AgenziaImmobiliareColliAmineiNapoli />}
      {page === "agenzia-immobiliare-centro-storico-napoli" && <AgenziaImmobiliareCentroStoricoNapoli />}
      {page === "agenzia-immobiliare-soccavo-napoli" && <AgenziaImmobiliareSoccavoNapoli />}
      {page === "valuta-il-tuo-immobile" && <ValutaIlTuoImmobile />}
      {page === "vendi-casa-vomero" && <VendiCasaVomeroPage navigate={navigate} colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "consulente-mutuo-napoli" && <ConsulenteMutuoNapoliPage navigate={navigate} colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "grazie" && <GraziePage navigate={navigate} colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "vomero" && <VomeroPage navigate={navigate} colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "posillipo" && <PosillpoPage navigate={navigate} colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "chiaia" && <ChiaiaPage navigate={navigate} colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "centro-storico" && <CentroStoricoPage navigate={navigate} colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
      {page === "blog" && <BlogPage navigate={navigate} colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}

      {!STANDALONE_PAGES.includes(page) && <Footer navigate={navigate} colors={{NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM}} />}
    </div>
  );
}

// =====================================================
// GLOBAL STYLES
// =====================================================
function GlobalStyles({ NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM }) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Jost:wght@300;400;500;600;700&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { font-family: 'Jost', sans-serif; }
      .serif { font-family: 'Playfair Display', serif; }

      @keyframes fadeUp { from { opacity: 0; transform: translateY(40px);} to { opacity: 1; transform: translateY(0);} }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes shine { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      @keyframes pulseGold { 0%,100% { box-shadow: 0 0 0 0 rgba(193,154,91,0.5);} 50% { box-shadow: 0 0 0 14px rgba(193,154,91,0);} }
      @keyframes slideRight { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

      .fade-up { animation: fadeUp 0.9s ease-out forwards; }
      .fade-in { animation: fadeIn 1.2s ease-out forwards; }

      .hero-grad {
        background:
          radial-gradient(ellipse at 20% 0%, rgba(193,154,91,0.18) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 100%, rgba(193,154,91,0.12) 0%, transparent 50%),
          linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 60%, #0d2548 100%);
      }
      .gold-line { background: linear-gradient(90deg, transparent, ${GOLD}, transparent); height: 1px; }
      .gold-text {
        background: linear-gradient(90deg, ${GOLD} 0%, ${GOLD_BRIGHT} 50%, ${GOLD} 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shine 5s linear infinite;
      }
      .btn-gold {
        background: linear-gradient(135deg, ${GOLD} 0%, ${GOLD_BRIGHT} 100%);
        color: ${NAVY_DEEP};
        font-weight: 600;
        letter-spacing: 0.5px;
        transition: all 0.3s;
      }
      .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 12px 32px -8px rgba(193,154,91,0.5); }
      .btn-outline {
        background: transparent;
        color: ${CREAM};
        border: 1px solid ${GOLD};
        transition: all 0.3s;
      }
      .btn-outline:hover { background: ${GOLD}; color: ${NAVY_DEEP}; }

      .nav-link {
        position: relative;
        padding: 8px 0;
        cursor: pointer;
        transition: color 0.3s;
      }
      .nav-link::after {
        content: '';
        position: absolute;
        bottom: 0; left: 0;
        width: 0; height: 1px;
        background: ${GOLD};
        transition: width 0.3s;
      }
      .nav-link:hover::after, .nav-link.active::after { width: 100%; }

      .input-field {
        width: 100%;
        padding: 14px 18px;
        background: rgba(255,255,255,0.95);
        border: 1px solid rgba(10,31,61,0.15);
        border-radius: 4px;
        font-family: 'Jost', sans-serif;
        font-size: 15px;
        color: ${NAVY};
        transition: all 0.2s;
      }
      .input-field:focus {
        outline: none;
        border-color: ${GOLD};
        box-shadow: 0 0 0 3px rgba(193,154,91,0.15);
      }

      .badge-gold {
        display: inline-block;
        padding: 6px 14px;
        background: rgba(193,154,91,0.15);
        color: ${GOLD};
        border: 1px solid rgba(193,154,91,0.3);
        font-size: 11px;
        letter-spacing: 2px;
        text-transform: uppercase;
        font-weight: 500;
      }

      .pillar-card {
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid rgba(10,31,61,0.08);
      }
      .pillar-card:hover {
        transform: translateY(-6px);
        border-color: ${GOLD};
        box-shadow: 0 20px 60px -20px rgba(10,31,61,0.25);
      }

      .logo-container {
        background: linear-gradient(135deg, #f0f0f0 0%, #ffffff 50%, #d8d8d8 100%);
        padding: 4px;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6);
      }

      .whatsapp-float {
        position: fixed; bottom: 24px; right: 24px;
        width: 60px; height: 60px;
        background: #25D366; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 8px 24px rgba(37,211,102,0.4);
        cursor: pointer; z-index: 50;
        transition: transform 0.3s; color: white;
        text-decoration: none;
      }
      .whatsapp-float:hover { transform: scale(1.08); }

      .team-card {
        background: white;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(10,31,61,0.08);
        transition: all 0.4s;
        cursor: pointer;
      }
      .team-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 24px 48px -16px rgba(10,31,61,0.25);
      }
      .team-card img {
        width: 100%; aspect-ratio: 4/5;
        object-fit: cover;
        transition: transform 0.6s;
      }
      .team-card:hover img { transform: scale(1.05); }

      .testimonial-card {
        background: white;
        padding: 36px;
        border-radius: 8px;
        border-left: 3px solid ${GOLD};
        box-shadow: 0 8px 32px -12px rgba(10,31,61,0.12);
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .testimonial-card::before {
        content: '"';
        position: absolute;
        top: 12px; right: 24px;
        font-family: 'Playfair Display', serif;
        font-size: 100px;
        line-height: 1;
        color: ${GOLD};
        opacity: 0.15;
      }
      .star { color: ${GOLD}; font-size: 16px; }

      .step-circle {
        width: 36px; height: 36px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-weight: 700;
        font-family: 'Playfair Display', serif;
        transition: all 0.3s;
      }
      .step-active { background: ${GOLD}; color: ${NAVY_DEEP}; }
      .step-done { background: ${NAVY}; color: ${GOLD}; }
      .step-todo { background: rgba(10,31,61,0.1); color: rgba(10,31,61,0.4); }

      .qualify-option {
        padding: 20px 24px;
        background: white;
        border: 2px solid rgba(10,31,61,0.1);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.25s;
        text-align: left;
        font-family: 'Jost', sans-serif;
        font-size: 15px;
        color: ${NAVY};
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .qualify-option:hover {
        border-color: ${GOLD};
        background: rgba(193,154,91,0.04);
        transform: translateX(4px);
      }
      .qualify-option.selected {
        border-color: ${GOLD};
        background: rgba(193,154,91,0.1);
      }

      .number-card {
        border-left: 3px solid ${GOLD};
        padding: 20px 28px;
        background: rgba(255,255,255,0.04);
        backdrop-filter: blur(10px);
      }

      .pillar-tab {
        padding: 14px 20px;
        cursor: pointer;
        border-left: 2px solid transparent;
        transition: all 0.3s;
      }
      .pillar-tab:hover { background: rgba(193,154,91,0.05); }
      .pillar-tab.active {
        border-left-color: ${GOLD};
        background: rgba(193,154,91,0.08);
      }

      .service-tab {
        padding: 24px 20px;
        cursor: pointer;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(193,154,91,0.15);
        transition: all 0.3s;
        text-align: center;
        border-radius: 4px;
      }
      .service-tab.active { background: rgba(193,154,91,0.12); border-color: ${GOLD}; }
      .service-tab:hover { background: rgba(193,154,91,0.08); }

      .benefit-card {
        padding: 32px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(193,154,91,0.2);
        backdrop-filter: blur(10px);
        transition: all 0.4s;
      }
      .benefit-card:hover {
        background: rgba(255,255,255,0.07);
        border-color: ${GOLD};
        transform: translateY(-4px);
      }

      .talent-section {
        background: linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DEEP} 100%);
        color: ${CREAM};
      }

      @media (max-width: 768px) {
        .h1-resp { font-size: 2.2rem !important; line-height: 1.15 !important; }
        .h2-resp { font-size: 1.8rem !important; }
        .hide-mobile { display: none !important; }
        .show-mobile { display: block !important; }
        .grid-2-mobile { grid-template-columns: 1fr !important; }
        .grid-3-mobile { grid-template-columns: 1fr !important; }
        .grid-pillars-mobile { grid-template-columns: 1fr !important; }
        .grid-team-mobile { grid-template-columns: repeat(2, 1fr) !important; }
      }
    `}</style>
  );
}

// =====================================================
// PROMO ZERO VINCOLI 60
// =====================================================
function PromoZeroVincoli() {
  const NAVY_DEEP = "#06152A";
  const NAVY = "#0A1F3D";
  const GOLD = "#C19A5B";
  const CREAM = "#F5EFE4";
  return (
    <section style={{
      background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 100%)`,
      padding: "72px 32px",
      borderTop: `2px solid ${GOLD}`,
      borderBottom: `2px solid rgba(193,154,91,0.3)`,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: `repeating-linear-gradient(45deg, ${GOLD} 0, ${GOLD} 1px, transparent 1px, transparent 60px)`
      }} />
      <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <span style={{
          display: "inline-block",
          background: "rgba(193,154,91,0.12)",
          border: `1px solid ${GOLD}`,
          color: GOLD,
          fontSize: 11,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          padding: "6px 20px",
          borderRadius: 2,
          marginBottom: 28,
          fontWeight: 600,
        }}>◆ Promo esclusiva · Valida fino al 30 settembre 2026 ◆</span>

        <h2 className="serif" style={{
          fontSize: "3.2rem", fontWeight: 700, color: CREAM,
          marginBottom: 20, lineHeight: 1.05, letterSpacing: "-0.5px",
        }}>
          Zero <em style={{ color: GOLD }}>Vincoli</em> 60
        </h2>

        <p style={{
          fontSize: "1.15rem", color: "rgba(245,239,228,0.82)", lineHeight: 1.65,
          maxWidth: 620, margin: "0 auto 40px", fontWeight: 300,
        }}>
          Affidaci la vendita della tua casa. Dopo 60 giorni decidi tu.<br />
          <strong style={{ color: CREAM, fontWeight: 600 }}>Senza penali. Senza costi nascosti. Solo risultati.</strong>
        </p>

        <a
          href="/zero-vincoli-60"
          style={{
            display: "inline-block",
            background: GOLD,
            color: NAVY_DEEP,
            padding: "17px 44px",
            borderRadius: 3,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Scopri l'offerta →
        </a>
      </div>
    </section>
  );
}

// =====================================================
// HOME
// =====================================================
function HomePage({ navigate, colors }) {
  const { NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM } = colors;
  const [tIndex, setTIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTIndex(i => (i + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(t);
  }, []);

  const numbers = [
    { value: "26", suffix: "anni", label: "Di esperienza nel mercato immobiliare e creditizio" },
    { value: "3.898", label: "Famiglie assistite tra immobile, credito e assicurazione" },
    { value: "10", label: "Professionisti specializzati su due team" },
    { value: "Napoli", label: "La nostra città, presidiata in ogni quartiere" }
  ];

  const services = [
    { brand: "Fondocasa", title: "Immobiliare", icon: "◆", desc: "Vendita e acquisto in esclusiva" },
    { brand: "WeUnit", title: "Creditizio", icon: "◆", desc: "Mediazione mutui e credito" },
    { brand: "Henia", title: "Assicurativo", icon: "◆", desc: "Protezione del patrimonio" }
  ];

  return (
    <>
      {/* HERO */}
      <section className="hero-grad" style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 100, paddingBottom: 60, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: `repeating-linear-gradient(45deg, ${GOLD} 0, ${GOLD} 1px, transparent 1px, transparent 60px)` }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 2, width: "100%" }}>
          <div style={{ maxWidth: 920 }}>
            {/* Logo HUB */}
            <div className="fade-up" style={{ animationDelay: "0.05s", marginBottom: 40 }}>
              <img src="/logo-hub.png" alt="HUB Logo" width="120" height="120" style={{ filter: 'drop-shadow(0 8px 24px rgba(212, 175, 55, 0.25))' }} />
            </div>

            <div className="fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
              <span className="badge-gold">Hub Immobiliare · Creditizio · Assicurativo</span>
            </div>

            <h1 className="serif h1-resp fade-up" style={{
              animationDelay: "0.3s",
              fontSize: "4.4rem", fontWeight: 700, lineHeight: 1.05,
              color: CREAM, marginTop: 32, marginBottom: 28,
              letterSpacing: "-1px", opacity: 0
            }}>
              Tre servizi.<br/>
              <span className="gold-text">Un solo punto di riferimento.</span>
            </h1>

            <p className="fade-up" style={{
              animationDelay: "0.5s",
              fontSize: "1.25rem", lineHeight: 1.6, color: "rgba(245,239,228,0.85)",
              maxWidth: 760, marginBottom: 44, fontWeight: 300, opacity: 0
            }}>
              A Napoli, da 26 anni, riuniamo sotto lo stesso tetto vendita immobiliare, mediazione creditizia e consulenza assicurativa.
              Grazie a strumenti digitali innovativi e a un metodo strutturato, oggi operiamo con efficacia in <strong>tutta la città</strong> —
              dal Vomero al centro storico, da Chiaia al Vomero Alto, da Posillipo ai Camaldoli.
            </p>

            <div className="fade-up" style={{ animationDelay: "0.7s", display: "flex", gap: 16, flexWrap: "wrap", opacity: 0 }}>
              <button className="btn-gold" style={{ padding: "18px 36px", borderRadius: 3, border: "none", cursor: "pointer", fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase", animation: "pulseGold 2.5s infinite" }} onClick={() => navigate("comincia")}>
                Comincia da qui →
              </button>
              <button className="btn-outline" style={{ padding: "18px 36px", borderRadius: 3, cursor: "pointer", fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase" }} onClick={() => navigate("metodo")}>
                Scopri il metodo
              </button>
              <button className="btn-outline" style={{ padding: "18px 36px", borderRadius: 3, cursor: "pointer", fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase" }} onClick={() => navigate("contatti")}>
                Contattaci
              </button>
            </div>
          </div>

          <div className="fade-up" style={{ animationDelay: "0.9s", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginTop: 80, opacity: 0 }}>
            {numbers.map((n, i) => (
              <div key={i} className="number-card">
                <div className="serif gold-text" style={{ fontSize: "2.4rem", fontWeight: 700, lineHeight: 1 }}>
                  {n.value} {n.suffix && <span style={{ fontSize: "1rem", fontWeight: 400 }}>{n.suffix}</span>}
                </div>
                <div style={{ color: "rgba(245,239,228,0.7)", fontSize: 13, marginTop: 8, lineHeight: 1.4 }}>{n.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO ZERO VINCOLI 60 */}
      <PromoZeroVincoli />

      {/* CONTACT FORMS */}
      <ContactForms />

      {/* I TRE BRAND */}
      <section style={{ padding: "120px 32px", background: CREAM }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 800, margin: "0 auto 70px" }}>
            <span className="badge-gold" style={{ background: "rgba(10,31,61,0.05)", color: NAVY, borderColor: "rgba(193,154,91,0.4)" }}>I tre pilastri di servizio</span>
            <h2 className="serif h2-resp" style={{ fontSize: "3rem", fontWeight: 700, marginTop: 24, marginBottom: 24, lineHeight: 1.1, letterSpacing: "-0.5px" }}>
              Tre brand. <em style={{ color: GOLD }}>Un'unica regia.</em>
            </h2>
            <div className="gold-line" style={{ width: 80, margin: "0 auto 24px" }} />
            <p style={{ fontSize: "1.15rem", lineHeight: 1.7, color: "rgba(10,31,61,0.75)" }}>
              Tre marchi consolidati che collaborano sotto il tetto di HUB per offrirti un servizio integrato:
              <strong> Fondocasa</strong> per l'immobiliare, <strong>WeUnit</strong> per il credito, <strong>Henia</strong> per l'assicurativo.
            </p>
          </div>

          <div className="grid-3-mobile" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {services.map((s, i) => (
              <div key={i} className="pillar-card" style={{ padding: 44, background: "white", borderRadius: 6, textAlign: "center" }}>
                <div style={{ color: GOLD, fontSize: 36, marginBottom: 20 }}>{s.icon}</div>
                <div style={{ fontSize: 11, letterSpacing: 2.5, color: GOLD, textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>{s.brand}</div>
                <h3 className="serif" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 16, color: NAVY }}>{s.title}</h3>
                <p style={{ color: "rgba(10,31,61,0.7)", lineHeight: 1.6, fontSize: 15 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERCORSO DI SCELTA */}
      <section style={{ padding: "120px 32px", background: NAVY, color: CREAM }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 70 }}>
            <span className="badge-gold">Da dove vuoi cominciare?</span>
            <h2 className="serif h2-resp" style={{ fontSize: "3rem", fontWeight: 700, marginTop: 24, lineHeight: 1.1, color: CREAM }}>
              Scegli il tuo <span className="gold-text">percorso</span>.
            </h2>
          </div>

          <div className="grid-2-mobile" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
            {[
              { title: "Vuoi vendere il tuo immobile?", desc: "Scopri il metodo dei 7 Pilastri e richiedi una valutazione gratuita.", cta: "Comincia →", action: () => navigate("comincia") },
              { title: "Quanto vale casa tua?", desc: "5 semplici domande e ricevi una stima reale, basata su vendite comparabili della tua zona, entro 24 ore.", cta: "Valuta il tuo immobile →", href: "/valuta-il-tuo-immobile", action: () => navigate("valuta-il-tuo-immobile") },
              { title: "Cerchi casa a Napoli?", desc: "Comincia da qui e ti facciamo trovare l'immobile giusto, con il mutuo già pronto.", cta: "Comincia →", action: () => navigate("comincia") },
              { title: "Vuoi conoscerci meglio?", desc: "Scopri chi siamo, il nostro team e perché 3.898 famiglie ci hanno scelto.", cta: "Chi siamo →", action: () => navigate("chi-siamo") },
              { title: "Vuoi lavorare con noi?", desc: "Ti formiamo, ti diamo gli strumenti, ti accompagniamo. Scopri la carriera in HUB.", cta: "Carriera →", action: () => navigate("carriera") },
              { title: "Sei un costruttore?", desc: "Divisione Cantieri: vendi il tuo cantiere in tutta Italia. Zero anticipo, zero rischio. Solo risultati. Metodo ZERCOSS.", cta: "Scopri il servizio →", action: () => navigate("costruttori"), gold: true }
            ].map((c, i) => {
              const Tag = c.href ? "a" : "div";
              return (
                <Tag
                  key={i}
                  href={c.href}
                  onClick={c.href ? (e) => { e.preventDefault(); c.action(); } : c.action}
                  style={{
                    padding: 40, background: "rgba(255,255,255,0.04)",
                    border: c.gold ? `1px solid ${GOLD}` : "1px solid rgba(193,154,91,0.2)", borderRadius: 6, cursor: "pointer",
                    background: c.gold ? "rgba(201,168,76,0.07)" : "rgba(255,255,255,0.04)",
                    transition: "all 0.3s", textDecoration: "none", display: "block", color: "inherit",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = c.gold ? GOLD : "rgba(193,154,91,0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <h3 className="serif" style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 12, color: CREAM }}>{c.title}</h3>
                  <p style={{ color: "rgba(245,239,228,0.75)", lineHeight: 1.6, marginBottom: 20, fontSize: 15 }}>{c.desc}</p>
                  <span style={{ color: GOLD, fontWeight: 600, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>{c.cta}</span>
                </Tag>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIANZE - carosello */}
      <section style={{ padding: "120px 32px", background: CREAM }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span className="badge-gold" style={{ background: "rgba(10,31,61,0.05)", color: NAVY, borderColor: "rgba(193,154,91,0.4)" }}>Recensioni Google verificate</span>
            <h2 className="serif h2-resp" style={{ fontSize: "2.6rem", fontWeight: 700, marginTop: 24, lineHeight: 1.1 }}>
              Cosa dicono i <em style={{ color: GOLD }}>nostri clienti</em>
            </h2>
          </div>

          <div key={tIndex} className="fade-in testimonial-card" style={{ padding: 56 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
              {Array(TESTIMONIALS[tIndex].rating).fill(0).map((_, i) => <span key={i} className="star">★</span>)}
            </div>
            <p className="serif" style={{ fontSize: "1.4rem", lineHeight: 1.5, color: NAVY, fontStyle: "italic", marginBottom: 28, fontWeight: 400 }}>
              "{TESTIMONIALS[tIndex].testo}"
            </p>
            <div className="gold-line" style={{ width: 50, marginBottom: 20 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: NAVY, color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                {TESTIMONIALS[tIndex].iniziali}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: NAVY, fontSize: 15 }}>{TESTIMONIALS[tIndex].nome}</div>
                <div style={{ fontSize: 12, color: "rgba(10,31,61,0.6)", marginTop: 2 }}>{TESTIMONIALS[tIndex].servizio} · {TESTIMONIALS[tIndex].fonte}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTIndex(i)} style={{
                width: i === tIndex ? 32 : 8, height: 8,
                background: i === tIndex ? GOLD : "rgba(10,31,61,0.2)",
                border: "none", borderRadius: 4, cursor: "pointer", transition: "all 0.3s"
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* DOVE OPERIAMO — link interni verso le landing di quartiere, per SEO locale */}
      <section style={{ padding: "80px 32px", background: NAVY_DEEP, color: CREAM }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, letterSpacing: 3, color: GOLD, textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Dove operiamo</div>
            <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 700, lineHeight: 1.2 }}>
              Agenzia immobiliare a Napoli:<br />
              <span style={{ color: GOLD }}>ogni quartiere, una competenza</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { slug: "vomero", nome: "Vomero", desc: "Il quartiere residenziale più richiesto di Napoli. HUB ha sede qui da 26 anni.", prezzo: "3.500 – 5.500 €/mq" },
              { slug: "arenella", nome: "Arenella", desc: "La collina a ridosso del Vomero: stessa qualità della vita, prezzi più accessibili.", prezzo: null },
              { slug: "chiaia", nome: "Chiaia", desc: "Il quartiere più elegante di Napoli, tra Riviera e Via dei Mille.", prezzo: "4.000 – 7.000 €/mq" },
              { slug: "posillipo", nome: "Posillipo", desc: "Il segmento premium di Napoli: ville con vista mare e appartamenti esclusivi.", prezzo: "5.000 – 12.000 €/mq" },
              { slug: "fuorigrotta", nome: "Fuorigrotta", desc: "Napoli Ovest: Mostra d'Oltremare, stadio e Città della Scienza, ben collegata.", prezzo: null },
              { slug: "colli-aminei", nome: "Colli Aminei", desc: "Zona residenziale a nord, vicino ai grandi ospedali e alla Metro Linea 1.", prezzo: null },
              { slug: "centro-storico", nome: "Centro Storico", desc: "Patrimonio UNESCO: Decumani, San Domenico Maggiore e via Duomo. Valori diversi da strada a strada.", prezzo: "1.700 – 3.100 €/mq" },
              { slug: "soccavo", nome: "Soccavo", desc: "Napoli ovest: il miglior rapporto metri quadri/prezzo della città, ben collegata dalla Circumflegrea.", prezzo: "1.900 – 2.800 €/mq" },
            ].map(q => {
              const pageKey = `agenzia-immobiliare-${q.slug}-napoli`;
              return (
                <a
                  key={q.slug}
                  href={`/agenzia-immobiliare-${q.slug}-napoli`}
                  onClick={(e) => { e.preventDefault(); navigate(pageKey); }}
                  style={{ padding: 28, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(193,154,91,0.2)", borderRadius: 4, cursor: "pointer", transition: "all 0.25s", textDecoration: "none", color: "inherit", display: "block" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = "rgba(193,154,91,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(193,154,91,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                >
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: GOLD, marginBottom: 8 }}>{`Agenzia immobiliare a ${q.nome} →`}</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.75, marginBottom: q.prezzo ? 12 : 0 }}>{q.desc}</p>
                  {q.prezzo && <div style={{ fontSize: 12, letterSpacing: 1, color: GOLD, fontWeight: 600 }}>{q.prezzo}</div>}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* BANNER DIVISIONE CANTIERI */}
      <section style={{ padding: "80px 32px", background: NAVY }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 48, justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 480px" }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: GOLD, textTransform: "uppercase", fontWeight: 600, marginBottom: 16 }}>Divisione Cantieri · Copertura Nazionale</div>
            <h2 className="serif" style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 700, color: "#F8F8F8", lineHeight: 1.2, marginBottom: 20 }}>
              Sei un <em style={{ color: GOLD }}>costruttore</em>?<br />Vendiamo il tuo cantiere<br />in tutta Italia.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(248,248,248,0.75)", lineHeight: 1.7, marginBottom: 28, maxWidth: 520 }}>
              FondoCasa Hub – Divisione Cantieri affianca sviluppatori e costruttori su tutto il territorio nazionale. Marketing avanzato, prequalifica finanziaria degli acquirenti, gestione trattativa e rogito. <strong style={{ color: GOLD }}>Zero anticipo. Zero rischio. Solo risultati.</strong>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
              {["Zero anticipo", "Zero rischio", "Marketing avanzato", "Prequalifica mutuo", "Gestione rogito", "Copertura nazionale"].map(tag => (
                <span key={tag} style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", color: GOLD, border: "1px solid rgba(201,168,76,0.35)", padding: "5px 12px", borderRadius: 2 }}>{tag}</span>
              ))}
            </div>
            <button
              onClick={() => navigate("costruttori")}
              style={{ background: GOLD, color: NAVY, border: "none", padding: "16px 36px", borderRadius: 3, fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#E2C97E"}
              onMouseLeave={e => e.currentTarget.style.background = GOLD}
            >
              Scopri la Divisione Cantieri →
            </button>
          </div>
          <div style={{ flex: "1 1 260px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { n: "0%", label: "Anticipo richiesto" },
              { n: "1,5%", label: "Solo a rogito avvenuto" },
              { n: "100%", label: "Gestione end-to-end" },
              { n: "360°", label: "Marketing & finanza" },
            ].map(s => (
              <div key={s.n} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 4, padding: "24px 16px", textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: GOLD, fontFamily: "'Playfair Display', serif" }}>{s.n}</div>
                <div style={{ fontSize: 12, color: "rgba(248,248,248,0.6)", marginTop: 6, letterSpacing: 0.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SEO */}
      <FAQSection colors={{ NAVY, GOLD, CREAM }} />

      {/* NEWSLETTER BREVO */}
      <NewsletterSection colors={{ NAVY, GOLD, CREAM }} />
    </>
  );
}

function NewsletterSection({ colors }) {
  const { NAVY, GOLD, CREAM } = colors;
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) return;
    setStatus("loading");
    try {
      const formData = new FormData();
      formData.append("EMAIL", email);
      formData.append("NOME", nome);
      formData.append("email_address_check", "");
      formData.append("locale", "it");

      const response = await fetch(
        "https://9c72d01c.sibforms.com/serve/MUIFAB1J55WTqPS-LvOkkoRX9BiMyiSHZB_Bvsa0EBMIF7Lkqlfb1wOv-MdnyEy8i2xnFYfeaYM0EAXGDuTPa-L-sG5K4xbdTM8Yx_XkmGrGsbmTR1OgLF4K5zr-aeFfdTHy00dh1xlle_KurcWAKrz89QxKxmftIEFv8K7g2Nw6k-BUUpVkTDi-rhZATjN0nPKLZlVLK_FW2Fh84Q==",
        { method: "POST", body: formData, mode: "no-cors" }
      );
      // no-cors restituisce sempre opaque — consideriamo successo
      setStatus("success");
      setNome("");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 16px",
    fontSize: 15,
    border: "1px solid #d0d8e0",
    borderRadius: 4,
    fontFamily: "Helvetica, sans-serif",
    boxSizing: "border-box",
    marginTop: 6,
    outline: "none",
    color: "#1b3a5c",
  };

  const labelStyle = {
    display: "block",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: NAVY,
    fontFamily: "Helvetica, sans-serif",
    marginTop: 16,
  };

  return (
    <section style={{ padding: "100px 32px", background: CREAM }}>
      <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: GOLD, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>
          Newsletter
        </div>
        <h2 className="serif" style={{ fontSize: 36, fontWeight: 700, color: NAVY, marginBottom: 16, lineHeight: 1.25 }}>
          Resta aggiornato con FondoCasa Hub
        </h2>
        <p style={{ fontSize: 16, color: "#5a6a7a", marginBottom: 40, lineHeight: 1.7 }}>
          Immobili, mutui e opportunità esclusive a Napoli. Iscriviti gratis.
        </p>

        {status === "success" ? (
          <div style={{ backgroundColor: "#e7faf0", border: "1px solid #13ce66", borderRadius: 6, padding: "24px 20px", color: "#085229", fontSize: 16, fontFamily: "Helvetica, sans-serif", lineHeight: 1.6 }}>
            ✅ <strong>Grazie!</strong> Controlla la tua email e clicca sul link per confermare l'iscrizione.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
            <label style={labelStyle} htmlFor="nl-nome">Nome</label>
            <input
              id="nl-nome"
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Il tuo nome"
              required
              style={inputStyle}
            />
            <label style={labelStyle} htmlFor="nl-email">Email</label>
            <input
              id="nl-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="La tua email"
              required
              style={inputStyle}
            />
            {status === "error" && (
              <div style={{ marginTop: 12, color: "#661d1d", backgroundColor: "#ffeded", border: "1px solid #ff4949", borderRadius: 4, padding: "10px 14px", fontSize: 14, fontFamily: "Helvetica, sans-serif" }}>
                Si è verificato un errore. Riprova o scrivici su info@fondocasahub.com
              </div>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                marginTop: 20,
                width: "100%",
                padding: "14px 32px",
                backgroundColor: status === "loading" ? "#8a9bb0" : NAVY,
                color: "#fff",
                border: "none",
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: status === "loading" ? "not-allowed" : "pointer",
                fontFamily: "Helvetica, sans-serif",
                transition: "background-color 0.2s",
              }}
            >
              {status === "loading" ? "Invio in corso..." : "ISCRIVITI GRATIS"}
            </button>
            <p style={{ marginTop: 12, fontSize: 11, color: "#8390A4", fontFamily: "Helvetica, sans-serif", textAlign: "center" }}>
              Nessuno spam. Puoi disiscriverti in qualsiasi momento.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Qual è la migliore agenzia immobiliare al Vomero di Napoli?",
    a: "HUB – FC Punto Hub Srl è una delle agenzie immobiliari di riferimento al Vomero di Napoli, con 26 anni di attività in Via Pietro Mascagni 35. Opera con il brand Fondocasa per la compravendita immobiliare, WeUnit per la mediazione creditizia e Henia per la consulenza assicurativa, offrendo un servizio integrato che ha assistito oltre 3.898 famiglie."
  },
  {
    q: "Come vendere casa a Napoli senza problemi?",
    a: "Per vendere casa a Napoli senza problemi è fondamentale: verificare la regolarità urbanistica e catastale dell'immobile, affidarsi a un'agenzia immobiliare qualificata con esperienza locale, fissare un prezzo coerente con i valori di mercato del quartiere e preparare tutta la documentazione prima di iniziare le trattative. HUB utilizza un metodo strutturato in 7 pilastri che riduce i tempi di vendita e protegge il venditore in ogni fase."
  },
  {
    q: "Quali documenti servono per vendere casa a Napoli?",
    a: "Per vendere un immobile a Napoli servono: atto di provenienza (rogito o successione), visura e planimetria catastale aggiornate, attestato di Prestazione Energetica (APE), certificato di agibilità, conformità urbanistica, eventuali concessioni edilizie e documenti condominiali (regolamento, ultima assemblea, spese). I nostri consulenti verificano gratuitamente la completezza del fascicolo prima di avviare la vendita."
  },
  {
    q: "Quanto vale un appartamento al Vomero di Napoli?",
    a: "I valori immobiliari al Vomero di Napoli variano in base alla zona, al piano e alle condizioni dell'immobile. In media, un appartamento ristrutturato al Vomero si colloca tra 3.500 e 5.500 €/mq, con punte più alte a Vomero Alto e Belvedere. Per una valutazione gratuita e precisa del tuo immobile, contatta HUB: i nostri agenti conoscono ogni microzona del quartiere."
  },
  {
    q: "Come scegliere un'agenzia immobiliare a Napoli?",
    a: "Per scegliere un'agenzia immobiliare a Napoli valuta: anni di esperienza nel mercato locale, presenza fisica nel quartiere, metodo di lavoro trasparente, referenze e recensioni verificabili, e la capacità di offrire servizi integrati (immobiliare, mutuo, assicurazione). Diffidate delle agenzie che promettono prezzi impossibili o che non verificano i documenti prima di mettere in vendita."
  },
  {
    q: "Come evitare problemi nella vendita di un immobile?",
    a: "I problemi più comuni nella vendita di un immobile riguardano irregolarità catastali o urbanistiche, difformità planimetriche, ipoteche non estinte e contestazioni in fase di rogito. Per evitarli: verifica sempre la conformità dell'immobile prima di metterlo sul mercato, affidati a professionisti che gestiscono anche la parte documentale, e scegli un notaio di fiducia. HUB effettua una due diligence completa prima di avviare ogni compravendita."
  },
  {
    q: "Come ottenere un mutuo per comprare casa a Napoli?",
    a: "Per ottenere un mutuo a Napoli è consigliabile rivolgersi a un mediatore creditizio qualificato che possa confrontare le offerte di più banche e trovare la soluzione più adatta al tuo profilo. WeUnit, il ramo creditizio di HUB, offre consulenza gratuita per mutui prima casa, surroga e liquidità, con accesso a oltre 20 istituti di credito e pratiche seguite fino all'erogazione."
  },
  {
    q: "Cosa fa un'agenzia immobiliare per vendere casa?",
    a: "Un'agenzia immobiliare qualificata si occupa di: valutazione dell'immobile, verifica della documentazione, realizzazione di foto e materiali di marketing, pubblicazione degli annunci sui portali, selezione e gestione delle visite, negoziazione con gli acquirenti, assistenza nel compromesso e coordinamento fino al rogito notarile. HUB aggiunge a questo percorso la consulenza su mutuo e assicurazione, chiudendo il cerchio in un unico punto di riferimento."
  },
  {
    q: "Cos'è il metodo dei 7 Pilastri di HUB?",
    a: "Il metodo dei 7 Pilastri è l'approccio strutturato che HUB applica a ogni compravendita immobiliare: 1) analisi documentale e due diligence, 2) valutazione di mercato precisa, 3) piano di marketing dedicato, 4) qualificazione degli acquirenti, 5) negoziazione protetta, 6) gestione di mutuo e assicurazione in parallelo, 7) assistenza fino al rogito e oltre. Un metodo costruito in 26 anni che riduce i tempi di vendita e protegge venditore e acquirente in ogni fase."
  },
  {
    q: "Perché scegliere HUB rispetto a un'agenzia immobiliare tradizionale?",
    a: "HUB non è una semplice agenzia immobiliare: è l'unico punto di Napoli dove trovare sotto lo stesso tetto la consulenza immobiliare (Fondocasa), la mediazione creditizia per il mutuo (WeUnit) e la consulenza assicurativa (Henia). Questo significa che l'acquirente può trovare casa e ottenere il mutuo nello stesso posto, e il venditore ha un team che gestisce anche l'aspetto finanziario dell'acquirente — riducendo drasticamente i rischi di trattative saltate per mancanza di finanziamento."
  },
  {
    q: "Cosa significa avere immobiliare, mutuo e assicurazione in un unico posto?",
    a: "Significa che quando vendi o compri casa con HUB non devi coordinare da solo tre professionisti diversi — agente immobiliare, consulente del credito e broker assicurativo. Tutto avviene internamente, con team che si parlano in tempo reale. L'acquirente ottiene la pre-valutazione del mutuo prima ancora di fare un'offerta, e il venditore sa già se l'acquirente è finanziariamente qualificato. Il risultato sono trattative più veloci, meno rischi e meno stress."
  },
  {
    q: "Come funziona il mandato in esclusiva con HUB?",
    a: "Il mandato in esclusiva con HUB significa che il tuo immobile viene gestito con priorità assoluta: piano di marketing dedicato, pubblicazione su tutti i principali portali immobiliari, reportistica periodica sull'andamento delle visite e feedback da ogni acquirente. A differenza del mandato non esclusivo, l'agenzia investe davvero nel promuovere il tuo immobile perché ha la certezza di rappresentarti. HUB offre trasparenza totale: sai sempre cosa sta succedendo con la tua casa."
  },
  {
    q: "Quanto tempo impiega HUB per vendere un immobile a Napoli?",
    a: "I tempi di vendita dipendono dal quartiere, dal prezzo e dalle condizioni dell'immobile. Con il metodo HUB, grazie alla corretta valutazione iniziale e alla qualificazione degli acquirenti, i tempi medi si accorciano significativamente rispetto al mercato. Gli immobili correttamente prezzati e con documentazione in ordine trovano acquirente entro 60-90 giorni. Contattaci per una stima personalizzata basata sul tuo specifico immobile."
  },
  {
    q: "HUB opera solo al Vomero o anche in altri quartieri di Napoli?",
    a: "HUB ha sede al Vomero (Via Pietro Mascagni 35) ma opera in tutta Napoli: Chiaia, Posillipo, Mergellina, Centro Storico, Toledo, Quartieri Spagnoli, Fuorigrotta, Bagnoli, Soccavo, Arenella e Vomero Alto. La conoscenza profonda del mercato napoletano permette al team di valutare correttamente immobili in ogni zona e trovare gli acquirenti giusti per ogni tipologia di proprietà."
  },
  {
    q: "HUB offre valutazioni immobiliari gratuite?",
    a: "Sì, HUB offre valutazioni immobiliari gratuite e senza impegno per immobili a Napoli. La valutazione viene effettuata da un consulente specializzato che analizza: i prezzi di mercato della zona, le vendite recenti comparabili, le caratteristiche specifiche dell'immobile (piano, esposizione, condizioni, classe energetica) e la domanda attuale per quella tipologia. Per richiedere una valutazione gratuita, compila il form sul sito o scrivici su WhatsApp."
  }
];

function FAQSection({ colors }) {
  const { NAVY, GOLD, CREAM } = colors;
  const [open, setOpen] = useState(null);

  return (
    <section style={{ padding: "100px 32px", background: NAVY }} itemScope itemType="https://schema.org/FAQPage">
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="badge-gold">Domande frequenti</span>
          <h2 className="serif" style={{ fontSize: "2.6rem", fontWeight: 700, color: CREAM, marginTop: 24, lineHeight: 1.1 }}>
            Tutto quello che vuoi sapere su <em style={{ color: GOLD }}>HUB e il mercato immobiliare</em> a Napoli
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {FAQS.map((faq, i) => (
            <div key={i} itemScope itemProp="mainEntity" itemType="https://schema.org/Question"
              style={{ borderBottom: "1px solid rgba(193,154,91,0.15)" }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%", textAlign: "left", background: "transparent", border: "none",
                  padding: "24px 0", cursor: "pointer", display: "flex", justifyContent: "space-between",
                  alignItems: "center", gap: 16
                }}
              >
                <span itemProp="name" style={{ fontSize: "1.05rem", fontWeight: 600, color: CREAM, lineHeight: 1.4 }}>
                  {faq.q}
                </span>
                <span style={{ color: GOLD, fontSize: 22, flexShrink: 0, transition: "transform 0.3s",
                  transform: open === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
              </button>
              {open === i && (
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p itemProp="text" style={{
                    color: "rgba(245,239,228,0.8)", fontSize: 15, lineHeight: 1.8,
                    paddingBottom: 28, margin: 0
                  }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 56 }}>
          <p style={{ color: "rgba(245,239,228,0.6)", fontSize: 14, marginBottom: 20 }}>
            Non hai trovato risposta? Scrivici direttamente.
          </p>
          <a href="https://wa.me/393924579047" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-block", background: "#25D366", color: "white", padding: "14px 32px",
              borderRadius: 3, textDecoration: "none", fontWeight: 600, fontSize: 14, letterSpacing: 1 }}>
            Scrivici su WhatsApp →
          </a>
        </div>
      </div>
    </section>
  );
}

// =====================================================
// CHI SIAMO
// =====================================================
function ChiSiamoPage({ colors }) {
  const { NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM } = colors;
  const [filterArea, setFilterArea] = useState("Tutti");

  const areas = ["Tutti", "Direzione", "Immobiliare", "Creditizio", "Assicurativo"];
  const filteredTeam = filterArea === "Tutti" ? TEAM : TEAM.filter(t => t.area === filterArea);

  return (
    <>
      {/* Hero pagina */}
      <section className="hero-grad" style={{ paddingTop: 160, paddingBottom: 100, padding: "160px 32px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <span className="badge-gold">Chi siamo</span>
          <h1 className="serif h1-resp" style={{ fontSize: "3.6rem", fontWeight: 700, color: CREAM, marginTop: 24, marginBottom: 24, lineHeight: 1.1 }}>
            Un team. <span className="gold-text">Un metodo.</span><br/>26 anni di risultati.
          </h1>
          <div className="gold-line" style={{ width: 80, margin: "0 auto 24px" }} />
          <p style={{ color: "rgba(245,239,228,0.85)", fontSize: "1.15rem", lineHeight: 1.7, maxWidth: 720, margin: "0 auto" }}>
            Dietro HUB ci sono 10 professionisti che ogni giorno mettono competenza, passione e strumenti digitali al servizio di chi vuole vendere casa, comprare casa, accendere un mutuo o proteggere il proprio patrimonio.
          </p>
        </div>
      </section>

      {/* Storia */}
      <section style={{ padding: "100px 32px", background: CREAM }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="grid-2-mobile" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, alignItems: "center" }}>
            <div>
              <span className="badge-gold" style={{ background: "rgba(10,31,61,0.05)", color: NAVY, borderColor: "rgba(193,154,91,0.4)" }}>La nostra storia</span>
              <h2 className="serif" style={{ fontSize: "2.4rem", fontWeight: 700, marginTop: 20, marginBottom: 24, lineHeight: 1.15 }}>
                Da una piccola realtà del Vomero<br/>a <em style={{ color: GOLD }}>Hub di riferimento</em> per Napoli.
              </h2>
            </div>
            <div style={{ color: "rgba(10,31,61,0.8)", fontSize: 16, lineHeight: 1.8 }}>
              <p style={{ marginBottom: 16 }}>
                <strong>Tutto è cominciato 26 anni fa</strong>, con l'idea che vendere casa non potesse essere un atto improvvisato. Doveva essere un metodo. Negli anni abbiamo visto migliaia di trattative, capito gli errori più costosi che fanno perdere decine di migliaia di euro ai proprietari, e costruito una procedura che oggi chiamiamo <strong>i 7 Pilastri dell'Hub</strong>.
              </p>
              <p style={{ marginBottom: 16 }}>
                <strong>Poi è arrivata la sinergia con WeUnit</strong>: la consulenza creditizia integrata che ci permette di portarti acquirenti già pre-qualificati, con il mutuo istruito prima della proposta. Niente più trattative chiuse e poi saltate.
              </p>
              <p>
                <strong>Oggi, con Henia Insurance Broker</strong>, completiamo il cerchio: immobile, mutuo e protezione del patrimonio sotto un unico tetto, gestiti da un team coordinato che parla la stessa lingua.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Network */}
      <section style={{ padding: "80px 32px", background: "#ECE4D2" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <h2 className="serif" style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 16 }}>Il network HUB</h2>
          <p style={{ color: "rgba(10,31,61,0.7)", fontSize: 15, marginBottom: 48 }}>Tre brand consolidati che operano in sinergia</p>
          <div className="grid-3-mobile" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              { brand: "Fondocasa", role: "Consulenza Immobiliare", desc: "Vendita, acquisto, locazione. Specializzazione su Napoli con metodo dei 7 Pilastri." },
              { brand: "WeUnit", role: "Mediazione Creditizia", desc: "Mutui, credito personale, surroga. Mediatore creditizio iscritto OAM." },
              { brand: "Henia", role: "Insurance Broker", desc: "Polizze casa, vita, mutuo. Intermediario assicurativo iscritto RUI/IVASS." }
            ].map((b, i) => (
              <div key={i} style={{ padding: 32, background: "white", borderRadius: 6, borderTop: `3px solid ${GOLD}` }}>
                <div className="serif" style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY, marginBottom: 8 }}>{b.brand}</div>
                <div style={{ fontSize: 12, letterSpacing: 1.5, color: GOLD, textTransform: "uppercase", marginBottom: 16 }}>{b.role}</div>
                <p style={{ color: "rgba(10,31,61,0.7)", fontSize: 14, lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section style={{ padding: "100px 32px", background: CREAM }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span className="badge-gold" style={{ background: "rgba(10,31,61,0.05)", color: NAVY, borderColor: "rgba(193,154,91,0.4)" }}>Il team HUB</span>
            <h2 className="serif h2-resp" style={{ fontSize: "2.8rem", fontWeight: 700, marginTop: 20, lineHeight: 1.1 }}>
              Le persone <em style={{ color: GOLD }}>dietro il metodo.</em>
            </h2>
            <p style={{ color: "rgba(10,31,61,0.7)", fontSize: 16, marginTop: 20, maxWidth: 600, margin: "20px auto 0" }}>
              10 professionisti, una sede, una visione condivisa.
            </p>
          </div>

          {/* Filtri area */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 50, flexWrap: "wrap" }}>
            {areas.map(a => (
              <button key={a} onClick={() => setFilterArea(a)} style={{
                padding: "10px 22px",
                background: filterArea === a ? NAVY : "transparent",
                color: filterArea === a ? GOLD : NAVY,
                border: filterArea === a ? "none" : `1px solid rgba(10,31,61,0.2)`,
                borderRadius: 24, cursor: "pointer", fontSize: 13,
                letterSpacing: 1, textTransform: "uppercase", fontWeight: 500,
                transition: "all 0.3s"
              }}>
                {a}
              </button>
            ))}
          </div>

          <div className="grid-team-mobile" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 28 }}>
            {filteredTeam.map((p, i) => (
              <div key={i} className="team-card">
                <img src={TEAM_PHOTOS[p.foto]} alt={p.nome} />
                <div style={{ padding: "20px 22px 24px" }}>
                  <div style={{ fontSize: 10, letterSpacing: 1.8, color: GOLD, textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>{p.area}</div>
                  <div className="serif" style={{ fontSize: "1.15rem", fontWeight: 700, color: NAVY, lineHeight: 1.2, marginBottom: 4 }}>{p.nome}</div>
                  <div style={{ fontSize: 13, color: "rgba(10,31,61,0.65)", marginBottom: 16 }}>{p.ruolo}</div>

                  <div style={{ borderTop: `1px solid rgba(193,154,91,0.25)`, paddingTop: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                      <a href={`tel:+39${p.tel}`}
                        style={{ display: "flex", alignItems: "center", gap: 6, color: NAVY, textDecoration: "none", fontSize: 12, fontWeight: 500 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.14 1.18 2 2 0 012.12 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
                        +39 {p.tel}
                      </a>
                      <a href={`mailto:${p.email}`}
                        style={{ display: "flex", alignItems: "center", gap: 6, color: NAVY, textDecoration: "none", fontSize: 11, wordBreak: "break-all" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        {p.email}
                      </a>
                      <a href={`https://wa.me/39${p.tel}?text=${encodeURIComponent(`Ciao ${p.nome1} ho cliccato il tuo link`)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 6, color: "#25D366", textDecoration: "none", fontSize: 12, fontWeight: 600, marginTop: 2 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </a>
                    </div>

                    <div style={{ flexShrink: 0, background: "white", padding: 4, borderRadius: 4, border: `1px solid rgba(193,154,91,0.2)` }}>
                      <QRCode
                        value={`https://wa.me/39${p.tel}?text=${encodeURIComponent(`Ciao ${p.nome1} ho cliccato il tuo link`)}`}
                        size={72}
                        fgColor={NAVY_DEEP}
                        bgColor="white"
                        level="M"
                      />
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonianze grid */}
      <section style={{ padding: "100px 32px", background: NAVY, color: CREAM }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span className="badge-gold">Recensioni Google verificate</span>
            <h2 className="serif h2-resp" style={{ fontSize: "2.6rem", fontWeight: 700, marginTop: 24, lineHeight: 1.1, color: CREAM }}>
              Le parole dei <span className="gold-text">nostri clienti</span>
            </h2>
          </div>

          <div className="grid-2-mobile" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 28 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card" style={{ background: "rgba(255,255,255,0.06)", borderLeft: `3px solid ${GOLD}`, color: CREAM }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {Array(t.rating).fill(0).map((_, j) => <span key={j} className="star">★</span>)}
                </div>
                <p className="serif" style={{ fontSize: "1.05rem", lineHeight: 1.55, color: "rgba(245,239,228,0.92)", fontStyle: "italic", marginBottom: 20, flex: 1 }}>
                  "{t.testo}"
                </p>
                <div className="gold-line" style={{ width: 40, marginBottom: 16 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: GOLD, color: NAVY_DEEP, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "'Playfair Display', serif", fontSize: 14 }}>
                    {t.iniziali}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: CREAM }}>{t.nome}</div>
                    <div style={{ fontSize: 11, color: "rgba(245,239,228,0.6)", marginTop: 2 }}>{t.servizio} · {t.fonte}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// =====================================================
// METODO
// =====================================================
function MetodoPage({ navigate, colors }) {
  const { NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM } = colors;
  const [activePillar, setActivePillar] = useState(0);

  const pillars = [
    { n: "01", title: "Valutazione di Mercato Reale", short: "Prezzo giusto, non prezzo desiderato.", desc: "Analizziamo le ultime 50 transazioni della tua zona di Napoli per tipologia, piano e stato. Ti consegniamo un Dossier Proprietario con dati notarili reali, non stime di portali. Vendere al prezzo giusto significa vendere — non aspettare." },
    { n: "02", title: "Servizio Fotografico Professionale", short: "Il 95% decide nei primi 3 secondi.", desc: "Fotografo professionista, ottiche grandangolari, post-produzione cinematografica. Le foto del tuo immobile devono fermare il dito sullo schermo. Niente cellulare, niente compromessi." },
    { n: "03", title: "Home Staging Strategico", short: "Vendere uno spazio, non una stanza vuota.", desc: "Suggerimenti operativi su luce, declutter, neutralizzazione. Quando serve, intervento di home staging professionale per immobili di pregio. Un investimento minimo che alza il prezzo finale." },
    { n: "04", title: "Marketing Multicanale Targettizzato", short: "Trovare il compratore giusto, non aspettarlo.", desc: "Campagne Meta Ads geolocalizzate, database interno di acquirenti pre-qualificati, portali premium, network agenzia. Il tuo immobile arriva davanti a chi può davvero comprarlo." },
    { n: "05", title: "Pre-qualificazione Mortgage WeUnit", short: "Solo compratori con mutuo già istruito.", desc: "Grazie a WeUnit, ogni acquirente che ti portiamo è già passato dal nostro consulente creditizio. Niente trattative chiuse e poi saltate per mutuo negato. 26 anni di esperienza nel credito immobiliare al servizio della tua vendita." },
    { n: "06", title: "Negoziazione Strutturata", short: "Un metodo, non improvvisazione.", desc: "Real Value Method: tecnica di negoziazione documentata, gestione delle proposte multiple, protezione del prezzo. Ogni trattativa è seguita personalmente dal Store Manager." },
    { n: "07", title: "Assistenza Notarile Completa", short: "Dalla proposta al rogito, mano nella mano.", desc: "Ti accompagniamo in ogni passaggio: verifica documentale, gestione tecnico, scelta del notaio, presenza all'atto. Non vendiamo case, gestiamo patrimoni." }
  ];

  return (
    <>
      <section className="hero-grad" style={{ padding: "160px 32px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <span className="badge-gold">Il nostro metodo</span>
          <h1 className="serif h1-resp" style={{ fontSize: "3.6rem", fontWeight: 700, color: CREAM, marginTop: 24, marginBottom: 24, lineHeight: 1.1 }}>
            I <span className="gold-text">7 Pilastri</span> dell'Hub
          </h1>
          <div className="gold-line" style={{ width: 80, margin: "0 auto 24px" }} />
          <p style={{ color: "rgba(245,239,228,0.85)", fontSize: "1.15rem", lineHeight: 1.7, maxWidth: 720, margin: "0 auto" }}>
            Niente è lasciato al caso, niente al "vediamo come va". Ogni mandato segue lo stesso percorso strutturato in 7 passaggi documentati. Il tuo immobile merita un metodo, non un'agenzia che improvvisa.
          </p>
        </div>
      </section>

      {/* 7 Pilastri */}
      <section style={{ padding: "100px 32px", background: NAVY, color: CREAM, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(193,154,91,0.08) 0%, transparent 70%)" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          <div className="grid-pillars-mobile" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 60, alignItems: "start" }}>
            <div>
              {pillars.map((p, i) => (
                <div key={i} className={`pillar-tab ${activePillar === i ? "active" : ""}`} onClick={() => setActivePillar(i)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span className="serif" style={{ fontSize: 22, color: activePillar === i ? GOLD : "rgba(245,239,228,0.4)", fontWeight: 700, minWidth: 36 }}>{p.n}</span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 15, color: activePillar === i ? CREAM : "rgba(245,239,228,0.7)" }}>{p.title}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div key={activePillar} className="fade-in" style={{ padding: 48, background: "rgba(255,255,255,0.03)", border: `1px solid rgba(193,154,91,0.2)`, borderRadius: 4, position: "relative" }}>
              <div style={{ position: "absolute", top: 24, right: 32 }} className="serif gold-text">
                <span style={{ fontSize: 64, fontWeight: 700, opacity: 0.5 }}>{pillars[activePillar].n}</span>
              </div>
              <h3 className="serif" style={{ fontSize: "2.2rem", fontWeight: 700, lineHeight: 1.15, marginBottom: 20, color: CREAM, maxWidth: "85%" }}>
                {pillars[activePillar].title}
              </h3>
              <p style={{ color: GOLD, fontSize: "1.1rem", fontStyle: "italic", marginBottom: 28, fontFamily: "'Playfair Display', serif" }}>
                "{pillars[activePillar].short}"
              </p>
              <div className="gold-line" style={{ width: 60, marginBottom: 28 }} />
              <p style={{ color: "rgba(245,239,228,0.85)", lineHeight: 1.8, fontSize: 16 }}>
                {pillars[activePillar].desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strumenti distintivi */}
      <section style={{ padding: "100px 32px", background: CREAM }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span className="badge-gold" style={{ background: "rgba(10,31,61,0.05)", color: NAVY, borderColor: "rgba(193,154,91,0.4)" }}>Strumenti esclusivi</span>
            <h2 className="serif h2-resp" style={{ fontSize: "2.4rem", fontWeight: 700, marginTop: 20, lineHeight: 1.1 }}>
              Tre strumenti che <em style={{ color: GOLD }}>nessuno usa come noi.</em>
            </h2>
          </div>

          <div className="grid-3-mobile" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {[
              { t: "Real Value Method", d: "La nostra tecnica di negoziazione documentata. Nasce da migliaia di trattative al Vomero, oggi applicata in tutta Napoli. Ti spieghiamo come gestire le proposte e proteggere il prezzo." },
              { t: "Dossier Proprietario", d: "Il documento personalizzato che ti consegniamo dopo il sopralluogo: valutazione, dati notarili comparativi, strategia di vendita, piano marketing. Una vera bussola per la tua trattativa." },
              { t: "Report Quindicinale", d: "Ogni 15 giorni ricevi un report dettagliato su Idealista e Immobiliare.it: visualizzazioni, contatti, posizionamento. Tracciabilità totale, zero zone grigie." }
            ].map((s, i) => (
              <div key={i} className="pillar-card" style={{ padding: 36, background: "white", borderRadius: 6 }}>
                <div className="serif gold-text" style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 16 }}>0{i+1}</div>
                <h3 className="serif" style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 12, color: NAVY }}>{s.t}</h3>
                <p style={{ color: "rgba(10,31,61,0.7)", lineHeight: 1.6, fontSize: 14 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section style={{ padding: "100px 32px", background: "linear-gradient(135deg, " + NAVY_DEEP + " 0%, " + NAVY + " 100%)", color: CREAM, textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 className="serif h2-resp" style={{ fontSize: "2.6rem", fontWeight: 700, lineHeight: 1.15, marginBottom: 24 }}>
            Applica i 7 Pilastri<br/><span className="gold-text">al tuo immobile.</span>
          </h2>
          <p style={{ color: "rgba(245,239,228,0.85)", fontSize: "1.1rem", lineHeight: 1.6, marginBottom: 36 }}>
            Inizia con una valutazione gratuita: in 48 ore ti consegniamo il Dossier Proprietario con il valore reale di mercato.
          </p>
          <button className="btn-gold" style={{ padding: "20px 44px", borderRadius: 3, border: "none", cursor: "pointer", fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase", animation: "pulseGold 2.5s infinite" }} onClick={() => navigate("comincia")}>
            Verifica se possiamo aiutarti →
          </button>
        </div>
      </section>
    </>
  );
}

// =====================================================
// COMINCIA DA QUI - FORM QUALIFICA
// =====================================================
function CominciaQuiPage({ colors }) {
  const { NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM } = colors;
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    obiettivo: "", tempi: "", zona: "",
    nome: "", telefono: "", email: "", privacy: false
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  const handleSend = async () => {
    if (!canSend || sending) return;
    setSending(true);
    try {
      const res = await fetch('https://hook.eu1.make.com/7fqc30vc6gfaqi4vgsi9neyrwijpxg1d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          categoria: 'Comincia Da Qui',
          nome: data.nome,
          email: data.email,
          telefono: data.telefono,
          obiettivo: data.obiettivo,
          tempi: data.tempi,
          zona: data.zona,
          _subject: 'Lead qualificato HUB Napoli – Comincia Da Qui',
          _replyto: data.email,
        })
      });
      if (!res.ok) throw new Error('Errore nell\'invio del form');
      setSent(true);
      if (window.fbq) window.fbq('track', 'Lead');
    } catch {
      alert('Errore nell\'invio. Riprova o contattaci direttamente.');
    } finally {
      setSending(false);
    }
  };

  const obiettivi = [
    { v: "vendere", l: "Vendere un immobile" },
    { v: "comprare", l: "Comprare un immobile" },
    { v: "mutuo", l: "Stipulare un mutuo" },
    { v: "assicurazione", l: "Proteggere il mio patrimonio" },
    { v: "lavoro", l: "Lavorare con voi" }
  ];
  const tempi = [
    { v: "subito", l: "Subito (entro 30 giorni)", priority: true },
    { v: "breve", l: "A breve (1-3 mesi)", priority: true },
    { v: "valutando", l: "Sto valutando (3-6 mesi)" },
    { v: "info", l: "Solo informazioni per ora" }
  ];
  const zone = [
    "Vomero · Vomero Alto · Arenella",
    "Chiaia · Posillipo · Mergellina",
    "Centro storico · Toledo · Spagnoli",
    "Fuorigrotta · Bagnoli · Soccavo",
    "Altro quartiere di Napoli"
  ];

  const isPriority = data.tempi === "subito" || data.tempi === "breve";
  const totalSteps = 4;
  const canSend = data.nome && data.telefono && data.email && data.privacy;

  return (
    <>
      <section className="hero-grad" style={{ padding: "160px 32px 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <span className="badge-gold">Verifica se possiamo aiutarti</span>
          <h1 className="serif h1-resp" style={{ fontSize: "3.4rem", fontWeight: 700, color: CREAM, marginTop: 24, marginBottom: 20, lineHeight: 1.1 }}>
            Comincia <span className="gold-text">da qui.</span>
          </h1>
          <p style={{ color: "rgba(245,239,228,0.85)", fontSize: "1.1rem", lineHeight: 1.6, maxWidth: 600, margin: "0 auto" }}>
            4 domande per capire se siamo il punto di riferimento giusto per te. Ci vogliono meno di 90 secondi.
          </p>
        </div>
      </section>

      <section style={{ padding: "60px 32px 120px", background: CREAM }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {/* Progress */}
          {!sent && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 60 }}>
              {[1,2,3,4].map(s => (
                <React.Fragment key={s}>
                  <div className={`step-circle ${step === s ? "step-active" : step > s ? "step-done" : "step-todo"}`}>
                    {step > s ? "✓" : s}
                  </div>
                  {s < 4 && <div style={{ width: 40, height: 1, background: step > s ? GOLD : "rgba(10,31,61,0.15)" }} />}
                </React.Fragment>
              ))}
            </div>
          )}

          {!sent && (
            <div style={{ background: "white", padding: 48, borderRadius: 8, boxShadow: "0 20px 60px -30px rgba(10,31,61,0.2)" }}>
              {step === 1 && (
                <div className="fade-in">
                  <div style={{ fontSize: 11, letterSpacing: 2, color: GOLD, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Domanda 1 di 4</div>
                  <h2 className="serif" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8, color: NAVY }}>Cosa vuoi fare?</h2>
                  <p style={{ color: "rgba(10,31,61,0.6)", marginBottom: 32, fontSize: 15 }}>Scegli l'opzione che descrive meglio il tuo obiettivo.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {obiettivi.map(o => (
                      <button key={o.v} className={`qualify-option ${data.obiettivo === o.v ? "selected" : ""}`} onClick={() => { setData({...data, obiettivo: o.v}); setTimeout(next, 250); }}>
                        <span>{o.l}</span>
                        <span style={{ color: GOLD, fontSize: 18 }}>→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="fade-in">
                  <div style={{ fontSize: 11, letterSpacing: 2, color: GOLD, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Domanda 2 di 4</div>
                  <h2 className="serif" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8, color: NAVY }}>In che tempi?</h2>
                  <p style={{ color: "rgba(10,31,61,0.6)", marginBottom: 32, fontSize: 15 }}>Quando vorresti iniziare?</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {tempi.map(t => (
                      <button key={t.v} className={`qualify-option ${data.tempi === t.v ? "selected" : ""}`} onClick={() => { setData({...data, tempi: t.v}); setTimeout(next, 250); }}>
                        <span>{t.l} {t.priority && <span style={{ color: GOLD, marginLeft: 8, fontSize: 11, fontWeight: 600 }}>★ PRIORITÀ</span>}</span>
                        <span style={{ color: GOLD, fontSize: 18 }}>→</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={prev} style={{ marginTop: 24, background: "transparent", border: "none", color: "rgba(10,31,61,0.5)", cursor: "pointer", fontSize: 13 }}>← Indietro</button>
                </div>
              )}

              {step === 3 && (
                <div className="fade-in">
                  <div style={{ fontSize: 11, letterSpacing: 2, color: GOLD, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Domanda 3 di 4</div>
                  <h2 className="serif" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8, color: NAVY }}>In quale zona di Napoli?</h2>
                  <p style={{ color: "rgba(10,31,61,0.6)", marginBottom: 32, fontSize: 15 }}>Dove si trova l'immobile o dove vuoi cercare?</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {zone.map(z => (
                      <button key={z} className={`qualify-option ${data.zona === z ? "selected" : ""}`} onClick={() => { setData({...data, zona: z}); setTimeout(next, 250); }}>
                        <span>{z}</span>
                        <span style={{ color: GOLD, fontSize: 18 }}>→</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={prev} style={{ marginTop: 24, background: "transparent", border: "none", color: "rgba(10,31,61,0.5)", cursor: "pointer", fontSize: 13 }}>← Indietro</button>
                </div>
              )}

              {step === 4 && (
                <div className="fade-in">
                  <div style={{ fontSize: 11, letterSpacing: 2, color: GOLD, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Ultimo passaggio</div>
                  <h2 className="serif" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8, color: NAVY }}>I tuoi contatti</h2>
                  <p style={{ color: "rgba(10,31,61,0.6)", marginBottom: 32, fontSize: 15 }}>
                    {isPriority ? "Riceverai una chiamata prioritaria entro 24 ore." : "Ti ricontatteremo entro 48 ore con le informazioni richieste."}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <input className="input-field" placeholder="Nome e cognome *" value={data.nome} onChange={e => setData({...data, nome: e.target.value})} />
                    <input className="input-field" type="tel" inputMode="tel" pattern="^\+?3?9?[ ]?3\d{2}[ ]?\d{6,7}$" title="Inserisci un numero di cellulare italiano, es. 333 1234567 oppure +39 333 1234567" required placeholder="Telefono * (es. 333 1234567)" value={data.telefono} onChange={e => setData({...data, telefono: e.target.value})} />
                    <input className="input-field" placeholder="Email *" type="email" value={data.email} onChange={e => setData({...data, email: e.target.value})} />
                    <label style={{ display: "flex", gap: 10, fontSize: 12, color: "rgba(10,31,61,0.7)", marginTop: 4 }}>
                      <input type="checkbox" checked={data.privacy} onChange={e => setData({...data, privacy: e.target.checked})} />
                      <span>Acconsento al trattamento dei dati ai sensi del GDPR per essere ricontattato</span>
                    </label>
                    <button
                      className="btn-gold"
                      style={{ padding: "16px", borderRadius: 3, border: "none", cursor: canSend && !sending ? "pointer" : "not-allowed", fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 10, opacity: canSend && !sending ? 1 : 0.5 }}
                      onClick={handleSend}
                    >
                      {sending ? "Invio in corso…" : isPriority ? "Invia richiesta prioritaria →" : "Invia richiesta →"}
                    </button>
                  </div>
                  <button onClick={prev} style={{ marginTop: 24, background: "transparent", border: "none", color: "rgba(10,31,61,0.5)", cursor: "pointer", fontSize: 13 }}>← Indietro</button>
                </div>
              )}
            </div>
          )}

          {/* Conferma finale */}
          {sent && (
            <div className="fade-in" style={{ background: NAVY, padding: 56, borderRadius: 8, color: CREAM, textAlign: "center", boxShadow: "0 30px 80px -30px rgba(10,31,61,0.4)" }}>
              <div style={{ fontSize: 64, color: GOLD, marginBottom: 20 }}>✓</div>
              {isPriority ? (
                <>
                  <h3 className="serif" style={{ fontSize: "2rem", marginBottom: 16, color: CREAM }}>Richiesta prioritaria ricevuta</h3>
                  <p style={{ color: "rgba(245,239,228,0.85)", lineHeight: 1.6, fontSize: 16, marginBottom: 24 }}>
                    Grazie {data.nome.split(" ")[0]}! Ti contatteremo <strong style={{ color: GOLD }}>entro 24 ore</strong> al numero indicato.
                    Vista la tempistica, abbiamo segnato la tua richiesta come prioritaria e sarà gestita personalmente dal team direzionale.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="serif" style={{ fontSize: "2rem", marginBottom: 16, color: CREAM }}>Richiesta ricevuta</h3>
                  <p style={{ color: "rgba(245,239,228,0.85)", lineHeight: 1.6, fontSize: 16, marginBottom: 24 }}>
                    Grazie {data.nome.split(" ")[0]}! Ti contatteremo entro <strong>48 ore</strong> con le informazioni che ci hai chiesto.
                  </p>
                </>
              )}
              <div style={{ paddingTop: 24, borderTop: `1px solid rgba(193,154,91,0.2)`, marginTop: 24 }}>
                <p style={{ fontSize: 13, color: "rgba(245,239,228,0.6)", marginBottom: 8 }}>Hai bisogno di parlarci subito?</p>
                <a href="https://wa.me/393924579047" target="_blank" rel="noopener noreferrer" style={{ color: GOLD, fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
                  Scrivici su WhatsApp →
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// =====================================================
// CARRIERA
// =====================================================
function CarrieraPage({ colors }) {
  const { NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM } = colors;
  const [candForm, setCandForm] = useState({
    nome: "", telefono: "", email: "", esperienza: "", area: "", motivazione: "", privacy: false
  });
  const [candSent, setCandSent] = useState(false);
  const [candSending, setCandSending] = useState(false);

  const handleCandSend = async () => {
    const canSend = candForm.nome && candForm.telefono && candForm.email && candForm.area && candForm.privacy;
    if (!canSend || candSending) return;
    setCandSending(true);
    try {
      const res = await fetch('https://hook.eu1.make.com/h4ao1l1gmh9v3yhx8kb4mdoj3gve87t9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          categoria: 'Candidatura',
          name: candForm.nome,
          email: candForm.email,
          phone: candForm.telefono,
          area: candForm.area,
          esperienza: candForm.esperienza,
          motivazione: candForm.motivazione,
          _subject: 'Candidatura HUB Napoli',
          _replyto: candForm.email,
        })
      });
      if (!res.ok) throw new Error('Errore nell\'invio del form');
      setCandSent(true);
    } catch {
      alert('Errore nell\'invio. Riprova o contattaci direttamente.');
    } finally {
      setCandSending(false);
    }
  };

  return (
    <>
      <section className="hero-grad" style={{ padding: "160px 32px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <span className="badge-gold">Carriera in HUB</span>
          <h1 className="serif h1-resp" style={{ fontSize: "3.6rem", fontWeight: 700, color: CREAM, marginTop: 24, marginBottom: 24, lineHeight: 1.1 }}>
            Cerchiamo <span className="gold-text">talenti</span>,<br/>non venditori porta a porta.
          </h1>
          <div className="gold-line" style={{ width: 80, margin: "0 auto 24px" }} />
          <p style={{ color: "rgba(245,239,228,0.85)", fontSize: "1.15rem", lineHeight: 1.7, maxWidth: 720, margin: "0 auto" }}>
            Se sei un agente immobiliare ambizioso, un consulente del credito che vuole crescere, o un professionista in cerca di un percorso strutturato:
            <strong> HUB è il posto giusto</strong>. Niente fai-da-te, niente improvvisazione. Solo metodo, formazione, strumenti.
          </p>
        </div>
      </section>

      <section className="talent-section" style={{ padding: "100px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Vantaggi */}
          <div className="grid-3-mobile" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 80 }}>
            {[
              { n: "01", t: "Formazione continua", d: "Onboarding strutturato + formazione mensile su acquisizione, negoziazione e digitale. Cresci con il metodo, non per tentativi." },
              { n: "02", t: "Più trattative chiuse", d: "Quando porti un acquirente, il nostro mediatore creditizio WeUnit lo pre-qualifica subito. Meno trattative saltano per mutuo negato, più chiusure reali." },
              { n: "03", t: "Brand riconosciuto", d: "Lavori sotto un'insegna leader del Vomero con 26 anni di storia, oggi presente in tutta Napoli. I clienti ti aprono la porta perché sanno chi siamo." },
              { n: "04", t: "Strumenti digitali", d: "CRM avanzato, fotografo, materiale marketing, campagne adv già attive. Tu ti concentri sulle relazioni, noi a tutto il resto." },
              { n: "05", t: "Affiancamento operativo", d: "Team Manager dedicato (Vincenzo Esposito guida il Team 2): supporto in trattativa, sviluppo personale costante." },
              { n: "06", t: "Servizio completo al cliente", d: "Offri immobile, mutuo e assicurazione tramite un unico hub. Il cliente percepisce più valore, tu chiudi più mandati." }
            ].map((b, i) => (
              <div key={i} className="benefit-card">
                <div className="serif gold-text" style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1, marginBottom: 16 }}>{b.n}</div>
                <h3 className="serif" style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: 12, color: CREAM }}>{b.t}</h3>
                <p style={{ color: "rgba(245,239,228,0.75)", lineHeight: 1.6, fontSize: 14 }}>{b.d}</p>
              </div>
            ))}
          </div>

          {/* 3 carriere */}
          <div style={{ background: "rgba(255,255,255,0.04)", padding: 56, borderRadius: 4, border: `1px solid rgba(193,154,91,0.2)`, marginBottom: 60 }}>
            <h3 className="serif" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 12, color: CREAM, textAlign: "center" }}>
              Tre carriere possibili. Una sola sede.
            </h3>
            <p style={{ textAlign: "center", color: "rgba(245,239,228,0.7)", marginBottom: 36, fontSize: 15 }}>
              Ognuno dei tre rami dell'hub ha un percorso professionale autonomo, con formazione e crescita verticale.
            </p>
            <div className="grid-3-mobile" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {[
                { area: "Immobiliare · Fondocasa", role: "Agente Immobiliare", growth: "Junior → Senior → Team Manager → Store Manager" },
                { area: "Creditizio · WeUnit", role: "Consulente del Credito", growth: "Onboarding OAM → Consulente → Coordinatore" },
                { area: "Assicurativo · Henia", role: "Consulente Assicurativo", growth: "Formazione IVASS → Consulente → Specialist patrimoniale" }
              ].map((c, i) => (
                <div key={i} style={{ padding: 24, background: "rgba(193,154,91,0.06)", borderTop: `2px solid ${GOLD}` }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: GOLD, textTransform: "uppercase", marginBottom: 8 }}>{c.area}</div>
                  <div className="serif" style={{ fontSize: "1.3rem", color: CREAM, fontWeight: 600, marginBottom: 12 }}>{c.role}</div>
                  <div style={{ fontSize: 13, color: "rgba(245,239,228,0.7)", lineHeight: 1.5 }}>{c.growth}</div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 28, textAlign: "center", fontSize: 12, color: "rgba(245,239,228,0.5)", fontStyle: "italic" }}>
              Le attività di mediazione creditizia sono riservate a soggetti iscritti OAM. Le attività di intermediazione assicurativa sono riservate a soggetti iscritti RUI/IVASS. I tre rami operano in modo coordinato ma con ruoli, contratti e remunerazioni distinti.
            </p>
          </div>

          {/* Form candidatura */}
          <div className="grid-2-mobile" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
            <div>
              <h3 className="serif" style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: 24, color: CREAM, lineHeight: 1.1 }}>
                Candidati ora.<br/>Ti rispondiamo in 48 ore.
              </h3>
              <p style={{ color: "rgba(245,239,228,0.8)", lineHeight: 1.7, marginBottom: 28, fontSize: 16 }}>
                Ogni candidatura è valutata personalmente dal team direzionale. Se il tuo profilo è in linea, ti invitiamo a un colloquio conoscitivo riservato.
              </p>
              <div style={{ padding: 28, background: "rgba(193,154,91,0.08)", borderLeft: `3px solid ${GOLD}` }}>
                <p className="serif" style={{ fontStyle: "italic", color: GOLD, fontSize: "1.1rem", lineHeight: 1.5, marginBottom: 12 }}>
                  "In HUB non assumiamo agenti. Costruiamo professionisti."
                </p>
                <p style={{ fontSize: 13, color: "rgba(245,239,228,0.6)", letterSpacing: 1, textTransform: "uppercase" }}>
                  Dr. Nicola Nigido — Store Manager
                </p>
              </div>
            </div>

            {!candSent ? (
              <div style={{ background: "rgba(255,255,255,0.06)", padding: 40, borderRadius: 4, border: `1px solid rgba(193,154,91,0.3)` }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <input className="input-field" placeholder="Nome e cognome *" value={candForm.nome} onChange={e => setCandForm({...candForm, nome: e.target.value})} />
                  <input className="input-field" type="tel" inputMode="tel" pattern="^\+?3?9?[ ]?3\d{2}[ ]?\d{6,7}$" title="Inserisci un numero di cellulare italiano, es. 333 1234567 oppure +39 333 1234567" required placeholder="Telefono * (es. 333 1234567)" value={candForm.telefono} onChange={e => setCandForm({...candForm, telefono: e.target.value})} />
                  <input className="input-field" placeholder="Email *" type="email" value={candForm.email} onChange={e => setCandForm({...candForm, email: e.target.value})} />
                  <select className="input-field" value={candForm.area} onChange={e => setCandForm({...candForm, area: e.target.value})}>
                    <option value="">Area di interesse *</option>
                    <option>Immobiliare (Fondocasa)</option>
                    <option>Creditizio (WeUnit)</option>
                    <option>Assicurativo (Henia)</option>
                    <option>Marketing / Back office</option>
                  </select>
                  <select className="input-field" value={candForm.esperienza} onChange={e => setCandForm({...candForm, esperienza: e.target.value})}>
                    <option value="">Esperienza nel settore</option>
                    <option>Nessuna, voglio iniziare</option>
                    <option>1-2 anni</option>
                    <option>3-5 anni</option>
                    <option>Oltre 5 anni</option>
                  </select>
                  <textarea
                    className="input-field"
                    placeholder="Perché vuoi unirti a HUB? (max 500 caratteri)"
                    rows={4} maxLength={500}
                    value={candForm.motivazione}
                    onChange={e => setCandForm({...candForm, motivazione: e.target.value})}
                    style={{ resize: "vertical", fontFamily: "'Jost', sans-serif" }}
                  />
                  <label style={{ display: "flex", gap: 10, fontSize: 12, color: "rgba(245,239,228,0.7)" }}>
                    <input type="checkbox" checked={candForm.privacy} onChange={e => setCandForm({...candForm, privacy: e.target.checked})} />
                    <span>Acconsento al trattamento dei dati per finalità di selezione (GDPR)</span>
                  </label>
                  <button
                    className="btn-gold"
                    style={{ padding: "16px", borderRadius: 3, border: "none", cursor: candSending ? "not-allowed" : "pointer", fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 8, opacity: candSending ? 0.6 : 1 }}
                    onClick={handleCandSend}
                  >
                    {candSending ? "Invio in corso…" : "Invia candidatura →"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: "rgba(193,154,91,0.1)", padding: 48, borderRadius: 4, border: `1px solid ${GOLD}`, textAlign: "center", color: CREAM }}>
                <div style={{ fontSize: 48, color: GOLD, marginBottom: 16 }}>✓</div>
                <h3 className="serif" style={{ fontSize: "1.6rem", marginBottom: 12 }}>Candidatura ricevuta</h3>
                <p style={{ color: "rgba(245,239,228,0.85)", lineHeight: 1.6 }}>
                  Grazie {candForm.nome.split(" ")[0]}! Il team direzionale leggerà personalmente la tua candidatura. Ti contatteremo entro 48 ore.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// =====================================================
// CONTATTI
// =====================================================
function ContactPage({ navigate, colors }) {
  const { NAVY, GOLD, CREAM } = colors;
  const [form, setForm] = useState({ nome: "", telefono: "", email: "", messaggio: "", privacy: false, marketing: false });
  const [sent, setSent] = useState(false);
  const canSend = form.nome && form.telefono && form.email && form.messaggio && form.privacy;

  const handleSend = async () => {
    if (!canSend) return;

    try {
      const emailResponse = await fetch('https://hook.eu1.make.com/vxi6kpwrhgfruxdf9bddsy7gjf5apxy8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          categoria: 'Contatti',
          name: form.nome,
          email: form.email,
          phone: form.telefono,
          message: form.messaggio,
          marketing_consent: form.marketing ? 'Sì' : 'No',
          _subject: 'Richiesta HUB Napoli - sito web',
          _replyto: form.email,
        })
      });

      if (!emailResponse.ok) {
        throw new Error('Errore nell\'invio del form');
      }

      // Send to Google Sheets via Apps Script if available
      try {
        const sheetResponse = await fetch('https://script.google.com/macros/s/1-ufWrj8PncYdBmq_Alf7Hw5nNDKwH51BsRMnw9EK1VnEo_s6OjVMhxvi/exec', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: form.nome,
            telefono: form.telefono,
            email: form.email,
            messaggio: form.messaggio,
            marketing: form.marketing
          })
        });

        if (!sheetResponse.ok) {
          console.warn('Google Sheets non raggiungibile:', sheetResponse.statusText);
        }
      } catch (sheetError) {
        console.warn('Impossibile salvare su Google Sheets:', sheetError);
      }

      setSent(true);
      if (window.fbq) {
        window.fbq('track', 'Lead');
      }
    } catch (error) {
      console.error('Error sending form:', error);
      const message = error?.text || error?.message || 'Errore sconosciuto';
      alert(`Errore nell\'invio del form: ${message}. Riprova o contattaci direttamente.`);
    }
  };

  return (
    <>
      <section className="hero-grad" style={{ padding: "160px 32px 100px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <span className="badge-gold">Contattaci</span>
          <h1 className="serif h1-resp" style={{ fontSize: "3.6rem", fontWeight: 700, color: CREAM, marginTop: 24, marginBottom: 24, lineHeight: 1.1 }}>
            Parla con <span className="gold-text">HUB Napoli</span> oggi.
          </h1>
          <p style={{ color: "rgba(245,239,228,0.85)", fontSize: "1.15rem", lineHeight: 1.7, maxWidth: 720, margin: "0 auto" }}>
            Compila il form per ricevere una risposta personalizzata e veloce. Siamo a disposizione per valutazioni immobiliari, mutui, assicurazioni e consulenza integrata.
          </p>
        </div>
      </section>

      <section style={{ padding: "80px 32px 120px", background: CREAM }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div className="grid-2-mobile" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40, alignItems: "flex-start" }}>
            <div>
              <h2 className="serif" style={{ fontSize: "2.4rem", fontWeight: 700, marginBottom: 20, color: NAVY }}>Form contatti</h2>
              <p style={{ color: "rgba(10,31,61,0.75)", fontSize: 15, lineHeight: 1.8, marginBottom: 36 }}>
                Inserisci i tuoi dati e il messaggio. Riceverai una conferma immediata e potremo contattarti entro 24 ore lavorative.
              </p>
              {!sent ? (
                <div style={{ display: "grid", gap: 16 }}>
                  <input className="input-field" placeholder="Nome e cognome *" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
                  <input className="input-field" type="tel" inputMode="tel" pattern="^\+?3?9?[ ]?3\d{2}[ ]?\d{6,7}$" title="Inserisci un numero di cellulare italiano, es. 333 1234567 oppure +39 333 1234567" required placeholder="Telefono * (es. 333 1234567)" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                  <input className="input-field" placeholder="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  <textarea className="input-field" placeholder="Messaggio *" rows={6} value={form.messaggio} onChange={e => setForm({ ...form, messaggio: e.target.value })} style={{ resize: "vertical", fontFamily: "'Jost', sans-serif" }} />
                  <label style={{ display: "flex", gap: 10, fontSize: 12, color: "rgba(10,31,61,0.7)" }}>
                    <input type="checkbox" checked={form.privacy} onChange={e => setForm({ ...form, privacy: e.target.checked })} />
                    <span>Acconsento al trattamento dei miei dati personali ai sensi del GDPR per ricevere una risposta alla richiesta inviata e per le finalità indicate nella <span onClick={() => navigate("privacy")} style={{ color: "#b68a39", textDecoration: "underline", cursor: "pointer" }}>privacy policy</span>.</span>
                  </label>
                  <label style={{ display: "flex", gap: 10, fontSize: 12, color: "rgba(10,31,61,0.7)" }}>
                    <input type="checkbox" checked={form.marketing} onChange={e => setForm({ ...form, marketing: e.target.checked })} />
                    <span>Acconsento all'utilizzo dei miei dati per finalità di marketing e al caricamento delle liste contatti su Meta/Facebook per campagne personalizzate.</span>
                  </label>
                  <button
                    className="btn-gold"
                    style={{ padding: "16px", borderRadius: 3, border: "none", cursor: canSend ? "pointer" : "not-allowed", fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 8, opacity: canSend ? 1 : 0.5 }}
                    onClick={handleSend}
                  >
                    Invia richiesta →
                  </button>
                </div>
              ) : (
                <div style={{ padding: 44, borderRadius: 8, background: NAVY, color: CREAM, textAlign: "center" }}>
                  <div style={{ fontSize: 56, color: GOLD, marginBottom: 20 }}>✓</div>
                  <h3 className="serif" style={{ fontSize: "2rem", marginBottom: 12 }}>Richiesta inviata</h3>
                  <p style={{ color: "rgba(245,239,228,0.85)", fontSize: 16, lineHeight: 1.8 }}>
                    Grazie {form.nome.split(" ")[0]}! Il tuo messaggio è pronto per essere inviato al nostro ufficio. Se preferisci, usa anche WhatsApp per una risposta immediata.
                  </p>
                </div>
              )}
            </div>

            <div style={{ padding: 36, borderRadius: 8, background: NAVY, color: CREAM, border: `1px solid rgba(193,154,91,0.2)` }}>
              <div style={{ marginBottom: 28 }}>
                <span className="badge-gold" style={{ background: "rgba(255,255,255,0.08)", color: GOLD }}>Sede e contatti</span>
                <h3 className="serif" style={{ fontSize: "2rem", fontWeight: 700, marginTop: 18, marginBottom: 14 }}>HUB Napoli</h3>
                <p style={{ color: "rgba(245,239,228,0.8)", lineHeight: 1.8, fontSize: 15 }}>
                  Via Pietro Mascagni, 35<br />80128 Napoli<br />
                  Tel: 081 18653202<br />
                  Email: na.vomero@fondocasa.it
                </p>
              </div>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 12, letterSpacing: 2.5, textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>Orari</h4>
                <p style={{ color: "rgba(245,239,228,0.7)", fontSize: 14, lineHeight: 1.7 }}>
                  Lun-Ven 09:00-19:00<br />Sab 09:00-13:00
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: 12, letterSpacing: 2.5, textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>Contatto rapido</h4>
                <a href="https://wa.me/393924579047" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", color: GOLD, textDecoration: "none", fontWeight: 600, marginBottom: 10 }}>
                  WhatsApp HUB Napoli →
                </a>
                <p style={{ color: "rgba(245,239,228,0.7)", fontSize: 14, lineHeight: 1.7, marginTop: 14 }}>
                  Oppure clicca il pulsante in basso per tornare alla home e scoprire il metodo completo.
                </p>
                <button className="btn-outline" style={{ marginTop: 18, padding: "14px 24px", borderRadius: 3, border: "1px solid rgba(193,154,91,0.4)", background: "transparent", color: CREAM, cursor: "pointer", textTransform: "uppercase", fontSize: 12, letterSpacing: 1.2 }} onClick={() => navigate("home")}>Torna alla home</button>
              </div>
            </div>
          </div>

          {/* Google Maps embed */}
          <div style={{ marginTop: 56 }}>
            <h3 className="serif" style={{ fontSize: "1.6rem", fontWeight: 700, color: NAVY, marginBottom: 20 }}>
              📍 Dove siamo
            </h3>
            <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid rgba(10,31,61,0.12)`, boxShadow: "0 4px 24px rgba(10,31,61,0.08)" }}>
              <iframe
                title="HUB Napoli – Via Pietro Mascagni 35"
                src="https://maps.google.com/maps?q=Via+Pietro+Mascagni+35+Napoli+80128&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="380"
                style={{ border: 0, display: "block" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                aria-label="Mappa sede HUB Napoli – Via Pietro Mascagni 35"
              />
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
              <a
                href="https://maps.google.com/?q=Via+Pietro+Mascagni+35+Napoli"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#b68a39", fontSize: 14, fontWeight: 600, textDecoration: "none" }}
              >
                Apri in Google Maps →
              </a>
              <a
                href="https://maps.apple.com/?q=Via+Pietro+Mascagni+35+Napoli"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#b68a39", fontSize: 14, fontWeight: 600, textDecoration: "none" }}
              >
                Apri in Apple Maps →
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// =====================================================
// PRIVACY POLICY
// =====================================================
function PrivacyPage({ colors }) {
  const { NAVY, GOLD, CREAM } = colors;
  React.useEffect(() => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = `(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);`;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <section className="hero-grad" style={{ padding: "160px 32px 100px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <span className="badge-gold">Privacy Policy</span>
          <h1 className="serif h1-resp" style={{ fontSize: "3.6rem", fontWeight: 700, color: CREAM, marginTop: 24, marginBottom: 24, lineHeight: 1.1 }}>
            La tua privacy è una priorità per HUB.
          </h1>
          <p style={{ color: "rgba(245,239,228,0.85)", fontSize: "1.15rem", lineHeight: 1.7, maxWidth: 720, margin: "0 auto" }}>
            In questa pagina trovi tutte le informazioni sul trattamento dei dati personali, le finalità, i diritti e le garanzie previste dalla normativa GDPR.
          </p>
        </div>
      </section>

      <section style={{ padding: "80px 32px 120px", background: CREAM, color: NAVY }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <a href="https://www.iubenda.com/privacy-policy/40741385" className="iubenda-white iubenda-noiframe iubenda-embed" title="Privacy Policy">Privacy Policy</a>
        </div>
      </section>
    </>
  );
}

// =====================================================
// COOKIE POLICY
// =====================================================
function CookiePage({ colors }) {
  const { NAVY, GOLD, CREAM } = colors;
  React.useEffect(() => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = `(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);`;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <section className="hero-grad" style={{ padding: "160px 32px 100px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <span className="badge-gold">Cookie Policy</span>
          <h1 className="serif h1-resp" style={{ fontSize: "3.6rem", fontWeight: 700, color: CREAM, marginTop: 24, marginBottom: 24, lineHeight: 1.1 }}>
            Trasparenza sui cookie usati da HUB.
          </h1>
          <p style={{ color: "rgba(245,239,228,0.85)", fontSize: "1.15rem", lineHeight: 1.7, maxWidth: 720, margin: "0 auto" }}>
            Scopri quali cookie usiamo per far funzionare il sito, quali sono strettamente necessari e come puoi gestirli.
          </p>
        </div>
      </section>

      <section style={{ padding: "80px 32px 120px", background: CREAM, color: NAVY }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <a href="https://www.iubenda.com/privacy-policy/40741385/cookie-policy" className="iubenda-white iubenda-noiframe iubenda-embed" title="Cookie Policy">Cookie Policy</a>
        </div>
      </section>
    </>
  );
}

// =====================================================
// NOTE LEGALI
// =====================================================
function NoteLegaliPage({ colors }) {
  const { NAVY, GOLD, CREAM } = colors;
  return (
    <>
      <section className="hero-grad" style={{ padding: "160px 32px 100px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <span className="badge-gold">Note legali</span>
          <h1 className="serif h1-resp" style={{ fontSize: "3.6rem", fontWeight: 700, color: CREAM, marginTop: 24, marginBottom: 24, lineHeight: 1.1 }}>
            Informazioni legali e responsabilità.
          </h1>
          <p style={{ color: "rgba(245,239,228,0.85)", fontSize: "1.15rem", lineHeight: 1.7, maxWidth: 720, margin: "0 auto" }}>
            Leggi come HUB gestisce responsabilità, diritti d'autore e contenuti del sito.
          </p>
        </div>
      </section>

      <section style={{ padding: "80px 32px 120px", background: CREAM, color: NAVY }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 40 }}>
          {[
            { title: "Proprietà del sito", text: "FC Punto Hub Srl - Via Pietro Mascagni, 35, 80128 Napoli - P.IVA IT01924140096" },
            { title: "Contenuti", text: "Tutti i contenuti del sito sono di proprietà di FC Punto Hub Srl e sono protetti dal diritto d'autore. È vietata la riproduzione non autorizzata." },
            { title: "Esclusione di responsabilità", text: "Le informazioni fornite hanno carattere generale. HUB non è responsabile per errori, omissioni o aggiornamenti mancanti nelle informazioni pubblicate." },
            { title: "Collegamenti esterni", text: "Il sito può contenere link verso siti terzi. HUB non è responsabile per i contenuti o le policy dei siti esterni collegati." }
          ].map((item, index) => (
            <div key={index} style={{ padding: 30, background: "white", borderRadius: 8, boxShadow: "0 16px 40px rgba(10,31,61,0.05)" }}>
              <h2 className="serif" style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 14, color: NAVY }}>{item.title}</h2>
              <p style={{ lineHeight: 1.8, color: "rgba(10,31,61,0.78)", fontSize: 15 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// =====================================================
// FOOTER
const QUARTIERE_FOOTER_LINKS = [
  { slug: "vomero", nome: "Vomero" },
  { slug: "arenella", nome: "Arenella" },
  { slug: "chiaia", nome: "Chiaia" },
  { slug: "posillipo", nome: "Posillipo" },
  { slug: "fuorigrotta", nome: "Fuorigrotta" },
  { slug: "colli-aminei", nome: "Colli Aminei" },
  { slug: "centro-storico", nome: "Centro Storico" },
  { slug: "soccavo", nome: "Soccavo" },
];

function Footer({ navigate, colors }) {
  const { NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM } = colors;
  return (
    <section style={{ padding: "100px 32px 60px", background: NAVY_DEEP, color: CREAM }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="grid-2-mobile" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 60, marginBottom: 60 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div className="logo-container" style={{ width: 64, height: 64 }}>
                <img src={HUB_LOGO} alt="HUB" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 2.5, color: GOLD, textTransform: "uppercase", marginBottom: 4, fontWeight: 500 }}>FondoCasa Hub</div>
                <div className="serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: 1 }}>HUB</div>
                <div style={{ fontSize: 11, letterSpacing: 1.8, color: "rgba(245,239,228,0.6)", textTransform: "uppercase", marginTop: 3 }}>Napoli</div>
              </div>
            </div>
            <p style={{ color: "rgba(245,239,228,0.6)", fontSize: 14, lineHeight: 1.6, maxWidth: 380 }}>
              Hub Immobiliare · Creditizio · Assicurativo. L'unico punto di riferimento a Napoli che integra vendita, mutuo e protezione del patrimonio sotto un unico tetto.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: GOLD, marginBottom: 20 }}>Contatti</h4>
            <div style={{ fontSize: 14, color: "rgba(245,239,228,0.75)", lineHeight: 2 }}>
              Via Pietro Mascagni, 35<br/>
              80128 Napoli<br/>
              Tel. 081 18653202<br/>
              na.vomero@fondocasa.it
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: GOLD, marginBottom: 20 }}>Sezioni</h4>
            <div style={{ fontSize: 14, color: "rgba(245,239,228,0.75)", lineHeight: 2 }}>
              <div style={{ cursor: "pointer" }} onClick={() => navigate("home")}>Home</div>
              <div style={{ cursor: "pointer" }} onClick={() => navigate("chi-siamo")}>Chi siamo</div>
              <div style={{ cursor: "pointer" }} onClick={() => navigate("metodo")}>Il nostro metodo</div>
              <div style={{ cursor: "pointer" }} onClick={() => navigate("blog")}>Blog</div>
              <div style={{ cursor: "pointer", color: GOLD }} onClick={() => navigate("comincia")}>Comincia da qui</div>
              <a
                href="/valuta-il-tuo-immobile"
                onClick={(e) => { e.preventDefault(); navigate("valuta-il-tuo-immobile"); }}
                style={{ display: "block", cursor: "pointer", color: "inherit", textDecoration: "none" }}
              >
                Valuta il tuo immobile
              </a>
              <div style={{ cursor: "pointer" }} onClick={() => navigate("carriera")}>Lavora con noi</div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: GOLD, marginBottom: 20 }}>Quartieri</h4>
            <div style={{ fontSize: 14, color: "rgba(245,239,228,0.75)", lineHeight: 2 }}>
              <div style={{ cursor: "pointer" }} onClick={() => navigate("vomero")}>Vomero</div>
              <div style={{ cursor: "pointer" }} onClick={() => navigate("posillipo")}>Posillipo</div>
              <div style={{ cursor: "pointer" }} onClick={() => navigate("chiaia")}>Chiaia</div>
              <div style={{ cursor: "pointer" }} onClick={() => navigate("centro-storico")}>Centro Storico</div>
              <div style={{ cursor: "pointer" }} onClick={() => navigate("zero-vincoli-60")}>Zero Vincoli 60</div>
              <div style={{ cursor: "pointer", color: GOLD, fontWeight: 600 }} onClick={() => navigate("costruttori")}>Divisione Cantieri ↗</div>
            </div>
          </div>
        </div>

        <div className="gold-line" style={{ marginBottom: 30 }} />

        <div style={{ marginBottom: 30 }}>
          <h4 style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: GOLD, marginBottom: 16 }}>Zone servite a Napoli</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 28px", fontSize: 14, color: "rgba(245,239,228,0.75)" }}>
            {QUARTIERE_FOOTER_LINKS.map(({ slug, nome }) => {
              const pageKey = `agenzia-immobiliare-${slug}-napoli`;
              return (
                <a
                  key={slug}
                  href={`/agenzia-immobiliare-${slug}-napoli`}
                  onClick={(e) => { e.preventDefault(); navigate(pageKey); }}
                  style={{ color: "inherit", textDecoration: "none" }}
                  onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(245,239,228,0.75)"; }}
                >
                  {`Agenzia immobiliare a ${nome}`}
                </a>
              );
            })}
          </div>
        </div>

        <div className="gold-line" style={{ marginBottom: 30 }} />

        <div style={{ marginBottom: 24, fontSize: 11, color: "rgba(245,239,228,0.5)", lineHeight: 1.7, fontStyle: "italic" }}>
          Le attività di mediazione creditizia sono svolte tramite mediatori iscritti all'Albo OAM nell'ambito della partnership con WeUnit. Le attività di intermediazione assicurativa sono svolte da Henia Insurance Broker, intermediario iscritto al RUI tenuto dall'IVASS. Ciascun ramo opera in autonomia nel rispetto delle normative di settore.
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, fontSize: 12, color: "rgba(245,239,228,0.5)" }}>
          <div>© 2026 FC Punto Hub Srl — Via Pietro Mascagni, 35 · 80128 Napoli — P.IVA IT01924140096 — Tutti i diritti riservati</div>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="https://www.iubenda.com/privacy-policy/40741385" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(245,239,228,0.5)", textDecoration: "none", cursor: "pointer" }}>Privacy Policy</a>
            <a href="https://www.iubenda.com/privacy-policy/40741385/cookie-policy" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(245,239,228,0.5)", textDecoration: "none", cursor: "pointer" }}>Cookie Policy</a>
            <span style={{ cursor: "pointer" }} onClick={() => navigate("note-legali")}>Note legali</span>
          </div>
        </div>
      </div>
    </section>
  );
}
