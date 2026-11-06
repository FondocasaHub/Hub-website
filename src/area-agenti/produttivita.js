// Calcolatore di produttività personale: dagli obiettivi annui ai numeri di ogni giorno.
// Usato dalla pagina "La mia giornata" e da /api/assistente (Chirone). Nessuna dipendenza.

export const OBIETTIVI_PREDEFINITI = {
  obiettivo_annuo: 30000,
  provvigione_media: 3000,
  incarichi_per_vendita: 2,
  appuntamenti_per_incarico: 5,
  contatti_per_appuntamento: 80,
  giorni_mese: 22,
  mesi_anno: 11,
  ore_giorno: 8,
};

// Minimo dell'Hub per i listing agent (organigramma 9/10/2026): 50 contatti al giorno.
export const MINIMO_CONTATTI_HUB = 50;

export const LISTE_PIANO = [
  ["obiettivi", "Obiettivi della giornata"],
  ["team", "Attività con il team"],
  ["importanti", "Cose importanti, non urgenti"],
  ["supporto", "Attività di supporto (amministrazione, organizzazione, materiale)"],
  ["inderogabili", "Attività inderogabili personali"],
  ["deleghe", "Deleghe"],
  ["richiamare", "Da richiamare dopo le 19"],
];

const n = (v, riserva) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : riserva);

// Restituisce gli obiettivi annui, mensili, settimanali e giornalieri.
export function calcolaObiettivi(o = {}) {
  const p = { ...OBIETTIVI_PREDEFINITI, ...Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined)) };
  const obiettivo = Math.max(0, Number(p.obiettivo_annuo) || 0);
  const giorniAnno = n(p.giorni_mese, 22) * n(p.mesi_anno, 11);
  const vendite = obiettivo / n(p.provvigione_media, 3000);
  const incarichi = vendite * n(p.incarichi_per_vendita, 2);
  const appuntamenti = incarichi * n(p.appuntamenti_per_incarico, 5);
  const contatti = appuntamenti * n(p.contatti_per_appuntamento, 80);
  const perGiorno = (x) => x / giorniAnno;
  const contattiGiorno = Math.ceil(perGiorno(contatti));
  return {
    giorniAnno,
    anno: { fatturato: obiettivo, vendite, incarichi, appuntamenti, contatti },
    mese: { fatturato: obiettivo / n(p.mesi_anno, 11), vendite: vendite / n(p.mesi_anno, 11), incarichi: incarichi / n(p.mesi_anno, 11) },
    settimana: {
      appuntamenti: (appuntamenti / giorniAnno) * 5,
      contatti: Math.max(contattiGiorno, MINIMO_CONTATTI_HUB) * 5,
    },
    giorno: {
      fatturato: perGiorno(obiettivo),
      fatturatoOra: perGiorno(obiettivo) / n(p.ore_giorno, 8),
      contatti: Math.max(contattiGiorno, MINIMO_CONTATTI_HUB),
      contattiCalcolati: contattiGiorno,
      appuntamenti: perGiorno(appuntamenti),
    },
  };
}

export const euro = (v) => `${Math.round(Number(v) || 0).toLocaleString("it-IT")} €`;
export const uno = (v) => (Math.round((Number(v) || 0) * 10) / 10).toLocaleString("it-IT");

// Somma i numeri del diario su un insieme di giorni.
export function totali(giorni) {
  const t = { giorni: giorni.length, contatti: 0, appuntamenti: 0, incarichi: 0, visite: 0, proposte: 0, ore: 0 };
  for (const g of giorni) for (const k of ["contatti", "appuntamenti", "incarichi", "visite", "proposte", "ore"]) t[k] += Number(g[k]) || 0;
  return t;
}

// Data di oggi e lunedì della settimana corrente, ora italiana.
export function oggiRoma() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(new Date());
}
export function lunedi(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  const giorno = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - giorno);
  return d.toISOString().slice(0, 10);
}
export function piuGiorni(iso, k) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + k);
  return d.toISOString().slice(0, 10);
}
