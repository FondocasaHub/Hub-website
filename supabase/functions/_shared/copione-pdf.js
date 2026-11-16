// PDF stampabile di un copione per l'agente («I miei copioni», dal 16/11/2026).
// Lo usano la pagina dell'Area agenti («Scarica il PDF», nel browser) e la funzione notifica-copione (email).
// pdf-lib si passa da fuori (npm nel sito, esm.sh nella funzione), così questo file non dipende da dove gira.
// `dati` = la vista del copione data dal server di Sensoria (POST /api/agenti/copioni/<id>/email o GET …/<id>).

const A4 = [595.28, 841.89];
const MARGINE = 56;
const NAVY = [10 / 255, 31 / 255, 61 / 255];
const ORO = [193 / 255, 154 / 255, 91 / 255];
const TENUE = [91 / 255, 101 / 255, 119 / 255];

// i caratteri che i font standard del PDF non hanno (Helvetica = WinAnsi) diventano parole o spariscono
const SOSTITUZIONI = { "≤": "fino a ", "≥": "almeno ", "→": "->", "←": "<-", "⚠": "!", "✓": "v", "×": "x", "−": "-", " ": " ", " ": " " };

export async function pdfCopione(PDFLib, dati) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const doc = await PDFDocument.create();
  doc.setTitle(`Copione · ${dati.titolo || ""}`);
  doc.setAuthor("FondoCasa Hub · Marketing");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const grassetto = await doc.embedFont(StandardFonts.HelveticaBold);
  const corsivo = await doc.embedFont(StandardFonts.HelveticaOblique);
  const ok = new Map();
  const pulisci = (t) => Array.from(String(t ?? "").replace(/[\r\t]/g, " "))
    .map((c) => SOSTITUZIONI[c] ?? c)
    .join("")
    .split("")
    .filter((c) => {
      if (c === "\n") return true;
      if (!ok.has(c)) { try { font.widthOfTextAtSize(c, 10); grassetto.widthOfTextAtSize(c, 10); ok.set(c, true); } catch { ok.set(c, false); } }
      return ok.get(c);
    })
    .join("");

  let pagina = doc.addPage(A4);
  let y = A4[1] - MARGINE;
  const larghezza = A4[0] - 2 * MARGINE;
  const nuovaPagina = () => { pagina = doc.addPage(A4); y = A4[1] - MARGINE; };
  const spazio = (h) => { if (y - h < MARGINE) nuovaPagina(); };
  const righe = (testo, f, dim, max) => {
    const out = [];
    for (const paragrafo of pulisci(testo).split("\n")) {
      let riga = "";
      for (const parola of paragrafo.split(/\s+/).filter(Boolean)) {
        const prova = riga ? riga + " " + parola : parola;
        if (f.widthOfTextAtSize(prova, dim) <= max || !riga) riga = prova;
        else { out.push(riga); riga = parola; }
      }
      out.push(riga);
    }
    return out;
  };
  const scrivi = (testo, { f = font, dim = 11, colore = NAVY, rientro = 0, dopo = 4, interlinea = 1.35 } = {}) => {
    for (const r of righe(testo, f, dim, larghezza - rientro)) {
      spazio(dim * interlinea);
      y -= dim * interlinea;
      pagina.drawText(r, { x: MARGINE + rientro, y, size: dim, font: f, color: rgb(...colore) });
    }
    y -= dopo;
  };
  const titolo = (t) => {
    spazio(40);
    y -= 14;
    scrivi(t, { f: grassetto, dim: 13, dopo: 2 });
    pagina.drawLine({ start: { x: MARGINE, y: y - 5 }, end: { x: MARGINE + 40, y: y - 5 }, thickness: 1.5, color: rgb(...ORO) });
    y -= 10;
  };
  const battuta = (b, numero) => {
    if (b.segnaposto) { scrivi("(qui va l'inizio che hai registrato)", { f: corsivo, colore: TENUE, rientro: 22 }); return; }
    const testo = b.altro ? `${b.altro}: «${b.testo}»` : `«${b.testo}»${b.solo_voce ? "  (solo voce)" : ""}`;
    spazio(30);
    if (numero) pagina.drawText(String(numero), { x: MARGINE, y: y - 11 * 1.35, size: 11, font: grassetto, color: rgb(...ORO) });
    scrivi(testo, { f: b.altro ? corsivo : font, dim: 12, rientro: 22, dopo: 8, colore: b.altro ? TENUE : NAVY });
  };

  scrivi("FONDOCASA HUB · COPIONE PER LE RIPRESE", { f: grassetto, dim: 9, colore: ORO, dopo: 6 });
  scrivi(dati.titolo || "", { f: grassetto, dim: 19, interlinea: 1.25, dopo: 6 });
  const sotto = [dati.agente && `Per ${dati.agente}`, dati.secondi && `Dura circa ${dati.secondi} secondi`,
    dati.versione && `versione ${dati.versione}`].filter(Boolean).join(" · ");
  if (sotto) scrivi(sotto, { colore: TENUE, dim: 10 });
  if (dati.prenotazione) scrivi(`Riprese: ${dati.prenotazione.giorno} alle ${dati.prenotazione.ora}`, { f: grassetto, dim: 11 });

  const inizio = dati.inizio || [];
  if (inizio.length) {
    titolo(inizio.length > 1 ? `L'inizio: registralo in ${inizio.length} modi` : "L'inizio");
    for (const ap of inizio) {
      if (inizio.length > 1) scrivi(`Versione ${ap.lettera}`, { f: grassetto, dim: 10, colore: ORO, dopo: 2 });
      for (const b of ap.righe || []) battuta(b, 0);
    }
  }
  titolo(inizio.length ? "Poi, in ordine" : "Cosa dici, in ordine");
  for (const b of dati.battute || []) battuta(b, b.n || 0);
  if ((dati.controlla || []).length) {
    titolo("Da controllare prima delle riprese");
    for (const c of dati.controlla) scrivi(`•  ${c}`, { dim: 10.5, rientro: 4, dopo: 5 });
  }
  y -= 10;
  spazio(20);
  scrivi("Se qualcosa non va, scrivilo nell'Area agenti › I miei copioni. Grazie!", { f: corsivo, dim: 9, colore: TENUE });
  return await doc.save();
}
