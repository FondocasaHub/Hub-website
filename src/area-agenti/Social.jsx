import React, { useEffect, useMemo, useRef, useState } from "react";

// Generatore Open House: immagini pronte per Facebook (evento, post, storia), Instagram (post, storia),
// LinkedIn e TikTok, con i testi da copiare. Tutto avviene nel browser: la foto non viene caricata sul server.

const LOGO = "/images/logo-hub-bianco.png";
const C = { navy: "#0A1F3D", navyDeep: "#061229", gold: "#C19A5B", goldBright: "#D4B27A", cream: "#F5EFE4" };
const WHATSAPP_STORE = "392 457 9047";

export const TIPI = {
  acquisito: { nome: "Appena acquisito", pill: "APPENA ACQUISITO", cta: "Richiedi informazioni" },
  openhouse: { nome: "Open House", pill: "OPEN HOUSE", cta: "Prenota la visita" },
  ribassato: { nome: "Prezzo ribassato", pill: "PREZZO RIBASSATO", cta: "Prenota la visita" },
  venduto: { nome: "Appena venduto", pill: "VENDUTO", cta: "Vuoi vendere casa? Valutazione gratuita" },
};

const FORMATI_TUTTI = [
  { id: "fb-evento", nome: "Facebook · copertina evento", w: 1920, h: 1005, tipo: "orizzontale", solo: "openhouse" },
  { id: "fb-link", nome: "Facebook · post orizzontale", w: 1200, h: 630, tipo: "orizzontale", tranne: "openhouse" },
  { id: "post", nome: "Post Facebook e Instagram (4:5)", w: 1080, h: 1350, tipo: "verticale" },
  { id: "quadrato", nome: "Post quadrato (1:1)", w: 1080, h: 1080, tipo: "quadrato" },
  { id: "storia", nome: "Storia Facebook e Instagram", w: 1080, h: 1920, tipo: "storia" },
  { id: "tiktok", nome: "TikTok · copertina", w: 1080, h: 1920, tipo: "tiktok" },
  { id: "linkedin", nome: "LinkedIn · post", w: 1200, h: 627, tipo: "orizzontale" },
];
const formatiPer = (tipo) => FORMATI_TUTTI.filter((f) => (!f.solo || f.solo === tipo) && f.tranne !== tipo);

const dataLunga = (iso) => (iso ? new Date(iso + "T12:00").toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" }) : "");
const maiusc = (s) => s.toUpperCase();

function caricaImmagine(src) {
  return new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });
}

function avvolgi(ctx, testo, larghezza) {
  const parole = String(testo || "").split(/\s+/).filter(Boolean);
  const righe = []; let riga = "";
  parole.forEach((p) => {
    const prova = riga ? `${riga} ${p}` : p;
    if (ctx.measureText(prova).width > larghezza && riga) { righe.push(riga); riga = p; } else riga = prova;
  });
  if (riga) righe.push(riga);
  return righe;
}

function copri(ctx, img, x, y, w, h) {
  const r = Math.max(w / img.width, h / img.height);
  const iw = img.width * r, ih = img.height * r;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

function pillola(ctx, testo, x, y, size) {
  ctx.font = `600 ${size}px Jost, sans-serif`;
  const pad = size * 0.9, w = ctx.measureText(testo).width + pad * 2, h = size * 2.1;
  ctx.fillStyle = C.gold;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
  ctx.fillStyle = C.navyDeep; ctx.textBaseline = "middle";
  ctx.fillText(testo, x + pad, y + h / 2 + 1);
  ctx.textBaseline = "alphabetic";
  return h;
}

// Disegna un formato. d = dati del modulo, foto = Image o null, logo = Image
function disegna(canvas, f, d, foto, logo) {
  const { w, h } = f;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  const oriz = f.tipo === "orizzontale";
  const u = Math.min(w, h) / 100; // unità

  // Sfondo: foto + velatura blu
  ctx.fillStyle = C.navy; ctx.fillRect(0, 0, w, h);
  if (foto) copri(ctx, foto, 0, 0, w, h);
  let g;
  if (oriz) {
    g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, "rgba(6,18,41,0.96)"); g.addColorStop(0.5, "rgba(10,31,61,0.82)"); g.addColorStop(0.78, "rgba(10,31,61,0.15)"); g.addColorStop(1, "rgba(10,31,61,0)");
  } else {
    g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(6,18,41,0.55)"); g.addColorStop(0.22, "rgba(10,31,61,0)"); g.addColorStop(0.45, "rgba(10,31,61,0.25)"); g.addColorStop(0.68, "rgba(10,31,61,0.88)"); g.addColorStop(1, "rgba(6,18,41,0.98)");
  }
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  // Margini (TikTok: zone sicure per interfaccia dell'app)
  const m = f.tipo === "tiktok" ? { l: 70, r: 170, t: 170, b: 430 } : f.tipo === "storia" ? { l: 80, r: 80, t: 210, b: 300 } : { l: 7 * u, r: 7 * u, t: 6 * u, b: 6.5 * u };
  const larg = oriz ? w * 0.5 : w - m.l - m.r;

  // Logo HUB
  const lh = oriz ? h * 0.2 : f.tipo === "quadrato" ? 15 * u : 17 * u;
  if (logo) ctx.drawImage(logo, m.l, m.t, lh * (logo.width / logo.height), lh);
  ctx.font = `500 ${oriz ? h * 0.024 : 2.3 * u}px Jost, sans-serif`;
  ctx.fillStyle = C.cream; ctx.globalAlpha = 0.9;
  ctx.fillText("FC PUNTO HUB · VOMERO", m.l + lh * (logo ? logo.width / logo.height : 0) + 1.6 * u, m.t + lh * 0.56);
  ctx.globalAlpha = 1;

  // Blocco testi, costruito dal basso
  const s = oriz ? h / 100 : f.tipo === "quadrato" ? 0.9 * u : u;
  const titoloSize = oriz ? h * 0.075 : 6.6 * s;
  ctx.font = `700 ${titoloSize}px "Playfair Display", serif`;
  const righeTitolo = avvolgi(ctx, d.titolo || "Titolo dell'immobile", larg).slice(0, 3);

  const blocchi = [];
  const T = TIPI[d.tipo];
  blocchi.push({ tipo: "pill", testo: T.pill, size: oriz ? h * 0.032 : 3 * s });
  righeTitolo.forEach((r) => blocchi.push({ tipo: "titolo", testo: r, size: titoloSize }));
  if (d.zona) blocchi.push({ tipo: "zona", testo: d.zona, size: oriz ? h * 0.036 : 3.4 * s });
  const dettagli = [d.mq && `${d.mq} mq`, d.locali && `${d.locali} locali`, d.bagni && `${d.bagni} ${d.bagni === "1" ? "bagno" : "bagni"}`, d.tipo !== "ribassato" && d.tipo !== "venduto" && d.tipo !== "acquisito" && d.prezzo && `€ ${d.prezzo}`].filter(Boolean).join("  ·  ");
  if (dettagli) blocchi.push({ tipo: "dett", testo: dettagli, size: oriz ? h * 0.03 : 2.9 * s });
  const grande = oriz ? h * 0.05 : 4.6 * s, sotto = oriz ? h * 0.034 : 3.3 * s;
  if (d.tipo === "openhouse") {
    blocchi.push({ tipo: "data", testo: d.data ? maiusc(dataLunga(d.data)) : "DATA", size: grande });
    blocchi.push({ tipo: "ora", testo: d.dalle && d.alle ? `dalle ${d.dalle} alle ${d.alle}` : "orario", size: sotto });
  } else if (d.tipo === "acquisito") {
    blocchi.push({ tipo: "data", testo: d.prezzo ? `€ ${d.prezzo}` : "NUOVO IN VENDITA", size: grande });
    blocchi.push({ tipo: "ora", testo: "In esclusiva FC Punto Hub", size: sotto });
  } else if (d.tipo === "ribassato") {
    blocchi.push({ tipo: "data", testo: d.prezzo ? `€ ${d.prezzo}` : "€ nuovo prezzo", size: grande });
    blocchi.push({ tipo: "ora", testo: d.prezzoVecchio ? `invece di € ${d.prezzoVecchio}` : "invece di € …", size: sotto, barrato: d.prezzoVecchio ? `€ ${d.prezzoVecchio}` : "" });
  } else {
    blocchi.push({ tipo: "data", testo: d.giorni ? `VENDUTO IN ${d.giorni} GIORNI` : "VENDUTO", size: grande });
    blocchi.push({ tipo: "ora", testo: "Grazie per la fiducia!", size: sotto });
  }
  blocchi.push({ tipo: "cta", testo: `${T.cta} · WhatsApp ${d.telefono || WHATSAPP_STORE}`, size: oriz ? h * 0.028 : 2.7 * s });

  const spazio = (b) => b.tipo === "pill" ? b.size * 2.1 + b.size * 0.9 : b.tipo === "titolo" ? b.size * 1.14 : b.tipo === "cta" ? b.size * 3.2 + b.size * 0.6 : b.tipo === "data" ? b.size * 1.6 : b.size * 1.6;
  const altezza = blocchi.reduce((a, b) => a + spazio(b), 0);
  let y = oriz ? Math.max(m.t + lh + 4 * s, (h - altezza) / 2 + lh * 0.35) : h - m.b - altezza;

  blocchi.forEach((b) => {
    if (b.tipo === "pill") { pillola(ctx, b.testo, m.l, y, b.size); y += b.size * 2.1 + b.size * 0.9; return; }
    if (b.tipo === "titolo") { ctx.font = `700 ${b.size}px "Playfair Display", serif`; ctx.fillStyle = C.cream; y += b.size; ctx.fillText(b.testo, m.l, y); y += b.size * 0.14; return; }
    if (b.tipo === "zona") { y += b.size * 0.4; ctx.font = `500 ${b.size}px Jost, sans-serif`; ctx.fillStyle = C.goldBright; y += b.size; ctx.fillText(b.testo, m.l, y); y += b.size * 0.2; return; }
    if (b.tipo === "dett") { y += b.size * 0.5; ctx.font = `400 ${b.size}px Jost, sans-serif`; ctx.fillStyle = C.cream; y += b.size; ctx.fillText(b.testo, m.l, y); y += b.size * 0.1; return; }
    if (b.tipo === "data") {
      y += b.size * 0.55;
      ctx.fillStyle = C.gold; ctx.fillRect(m.l, y, b.size * 1.6, Math.max(3, b.size * 0.08));
      y += b.size * 0.25;
      ctx.font = `700 ${b.size}px Jost, sans-serif`; ctx.fillStyle = C.cream; y += b.size * 0.95; ctx.fillText(b.testo, m.l, y);
      return;
    }
    if (b.tipo === "ora") {
      ctx.font = `500 ${b.size}px Jost, sans-serif`; ctx.fillStyle = C.goldBright; y += b.size * 1.25; ctx.fillText(b.testo, m.l, y);
      if (b.barrato) {
        const x0 = m.l + ctx.measureText(b.testo.slice(0, b.testo.length - b.barrato.length)).width, x1 = m.l + ctx.measureText(b.testo).width;
        ctx.strokeStyle = C.goldBright; ctx.lineWidth = Math.max(2, b.size * 0.08); ctx.beginPath(); ctx.moveTo(x0, y - b.size * 0.32); ctx.lineTo(x1, y - b.size * 0.32); ctx.stroke();
      }
      y += b.size * 0.35; return;
    }
    if (b.tipo === "cta") {
      y += b.size * 0.6;
      ctx.font = `600 ${b.size}px Jost, sans-serif`;
      const bw = Math.min(larg, ctx.measureText(b.testo).width + b.size * 2.4), bh = b.size * 2.6;
      ctx.strokeStyle = C.gold; ctx.lineWidth = Math.max(2, b.size * 0.08);
      ctx.beginPath(); ctx.roundRect(m.l, y, bw, bh, b.size * 0.4); ctx.stroke();
      ctx.fillStyle = C.cream; ctx.textBaseline = "middle"; ctx.fillText(b.testo, m.l + b.size * 1.2, y + bh / 2 + 1, bw - b.size * 2.4); ctx.textBaseline = "alphabetic";
    }
  });
}

function testi(d) {
  const tel = d.telefono || WHATSAPP_STORE;
  const titolo = d.titolo || "[titolo immobile]";
  const dove = d.zona || "[zona / indirizzo]";
  const car = [d.mq && `${d.mq} mq`, d.locali && `${d.locali} locali`, d.bagni && `${d.bagni} ${d.bagni === "1" ? "bagno" : "bagni"}`].filter(Boolean).join(", ");
  const Car = car ? car.charAt(0).toUpperCase() + car.slice(1) + "." : "";
  const punti = (d.punti || "").split("\n").map((r) => r.trim()).filter(Boolean);
  const elenco = punti.length ? "\n" + punti.map((p) => `✔️ ${p}`).join("\n") + "\n" : "";
  const zonaTag = (d.zona || "").split(/[,·-]/)[0].trim().replace(/\s+/g, "").toLowerCase();
  const firma = "FC Punto Hub · FondoCasa Hub – Via Pietro Mascagni 35, Napoli";
  const quando = d.data ? `${dataLunga(d.data)}${d.dalle && d.alle ? `, dalle ${d.dalle} alle ${d.alle}` : ""}` : "[data e orario]";
  const prezzo = d.prezzo ? `€ ${d.prezzo}` : "[prezzo]";
  const vecchio = d.prezzoVecchio ? `€ ${d.prezzoVecchio}` : "[prezzo precedente]";
  const tagBase = `#napoli #immobiliare #casainvendita${zonaTag ? " #" + zonaTag : ""} #fondocasa #fcpuntohub`;

  const V = {
    acquisito: {
      apertura: `🆕 APPENA ACQUISITO · ${titolo}`, riga: `📍 ${dove}${d.prezzo ? `\n💶 ${prezzo}` : ""}`,
      corpo: `${Car}${elenco}\nÈ appena entrato nel nostro portafoglio in esclusiva: sii tra i primi a vederlo.`,
      cta: `Info e visite: WhatsApp ${tel}`, tag: `#appenaacquisito #nuovoinvendita ${tagBase}`,
      linkedin: `Nuova acquisizione in esclusiva a ${dove}: ${titolo}.`, tiktok: `Appena acquisito a ${dove} 🏡 ${titolo}. Info su WhatsApp ${tel} #nuovoinvendita #napoli #casa #immobiliare #hometour`,
      storia: `Sticker "Link" o "Domande": Chiedi info\nTesto: Appena acquisito! WhatsApp ${tel}`,
    },
    openhouse: {
      apertura: `🏡 OPEN HOUSE · ${titolo}`, riga: `📍 ${dove}\n📅 ${quando}`,
      corpo: `${Car}${d.prezzo ? ` Prezzo: ${prezzo}.` : ""}${elenco}\nVisita senza impegno con i nostri consulenti; su richiesta consulenza mutuo gratuita con WeUnit.`,
      cta: `Prenota la visita: WhatsApp ${tel}`, tag: `#openhouse ${tagBase}`,
      linkedin: `Open House a ${dove}: ${titolo}. ${quando}.`, tiktok: `Open House a ${dove} 🏡 ${titolo} – ${quando}. Prenota su WhatsApp ${tel} 📲 #openhouse #napoli #casa #immobiliare #hometour`,
      storia: `Sticker "Conto alla rovescia": Open House – ${quando}\nSticker "Link" o "Domande": Prenota la visita\nTesto: Ti aspettiamo! WhatsApp ${tel}`,
    },
    ribassato: {
      apertura: `📉 PREZZO RIBASSATO · ${titolo}`, riga: `📍 ${dove}\n💶 Ora ${prezzo} (prima ${vecchio})`,
      corpo: `${Car}${elenco}\nUn'occasione da cogliere adesso: il nuovo prezzo è già in vigore.`,
      cta: `Prenota la visita: WhatsApp ${tel}`, tag: `#prezzoribassato #occasione ${tagBase}`,
      linkedin: `Nuovo prezzo per ${titolo} a ${dove}: ora ${prezzo} (prima ${vecchio}).`, tiktok: `Prezzo ribassato a ${dove} 📉 ${titolo}: ora ${prezzo}. Visite su WhatsApp ${tel} #occasione #napoli #casa #immobiliare`,
      storia: `Sticker "Link" o "Domande": Prenota la visita\nTesto: Nuovo prezzo ${prezzo}! WhatsApp ${tel}`,
    },
    venduto: {
      apertura: `🔑 VENDUTO · ${titolo}`, riga: `📍 ${dove}${d.giorni ? `\n⏱️ Venduto in ${d.giorni} giorni` : ""}`,
      corpo: `Grazie ai proprietari per la fiducia e congratulazioni ai nuovi acquirenti! 🥂${elenco}`,
      cta: `Vuoi vendere anche tu? Valutazione gratuita: WhatsApp ${tel}`, tag: `#venduto #casavenduta ${tagBase}`,
      linkedin: `Un altro immobile venduto a ${dove}: ${titolo}${d.giorni ? `, in ${d.giorni} giorni` : ""}. Grazie ai clienti per la fiducia.`, tiktok: `VENDUTO a ${dove} 🔑 ${titolo}${d.giorni ? ` in ${d.giorni} giorni` : ""}! Vuoi vendere? WhatsApp ${tel} #venduto #napoli #casa #immobiliare`,
      storia: `Sticker "Link": Valutazione gratuita\nTesto: Venduto! Vuoi vendere anche tu? WhatsApp ${tel}`,
    },
  }[d.tipo];

  const post = `${V.apertura}\n${V.riga}\n\n${V.corpo}\n\n${V.cta}`;
  const out = [];
  if (d.tipo === "openhouse") out.push({ id: "fb-evento", nome: "Facebook · evento", testo: `TITOLO EVENTO: Open House – ${titolo}, ${dove}\n\nDESCRIZIONE:\n${post}\n\n${firma}` });
  out.push({ id: "fb-post", nome: "Facebook · post", testo: `${post}\n\n${firma}` });
  out.push({ id: "ig", nome: "Instagram · post", testo: `${post} (link in bio)\n\n${V.tag} #casanapoli #nuovacasa` });
  out.push({ id: "storia", nome: "Storia · testo e sticker", testo: V.storia });
  out.push({ id: "linkedin", nome: "LinkedIn · post", testo: `${V.linkedin}\n\n${Car}${elenco}\n${V.cta}\n\n#RealEstate #Napoli #Immobiliare #FondoCasa` });
  out.push({ id: "tiktok", nome: "TikTok · didascalia", testo: V.tiktok });
  return out;
}

export default function Social() {
  const [d, setD] = useState({ tipo: "openhouse", prezzoVecchio: "", giorni: "", titolo: "", zona: "", data: "", dalle: "10:00", alle: "13:00", mq: "", locali: "", bagni: "", prezzo: "", telefono: "", punti: "" });
  const [foto, setFoto] = useState(null);
  const [logo, setLogo] = useState(null);
  const [pronte, setPronte] = useState(false);
  const [copiato, setCopiato] = useState("");
  const tele = useRef({});
  const set = (k, v) => setD({ ...d, [k]: v });

  useEffect(() => {
    caricaImmagine(LOGO).then(setLogo).catch(() => setLogo(null));
    (document.fonts?.ready || Promise.resolve()).then(() => setPronte(true));
  }, []);

  useEffect(() => {
    if (!pronte) return;
    formatiPer(d.tipo).forEach((f) => { const c = tele.current[f.id]; if (c) disegna(c, f, d, foto, logo); });
  }, [d, foto, logo, pronte]);

  const scegliFoto = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    caricaImmagine(url).then(setFoto);
  };

  const nomeFile = (f) => `${d.tipo}-${(d.zona || "immobile").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${f.id}.jpg`;
  const scarica = (f) => new Promise((ok) => {
    tele.current[f.id].toBlob((b) => {
      const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = nomeFile(f);
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); ok();
    }, "image/jpeg", 0.92);
  });
  const scaricaTutti = async () => { for (const f of formatiPer(d.tipo)) { await scarica(f); await new Promise((r) => setTimeout(r, 400)); } };

  const copia = async (t) => { try { await navigator.clipboard.writeText(t.testo); setCopiato(t.id); setTimeout(() => setCopiato(""), 1800); } catch { /* ignore */ } };
  const elencoTesti = useMemo(() => testi(d), [d]);

  return (
    <>
      <div className="aa-intestazione">
        <p className="aa-occhiello">Marketing · format social</p>
        <h1 className="aa-titolo">Social immobili</h1>
        <p className="aa-sottotitolo">Per ogni immobile: appena acquisito, open house, prezzo ribassato, appena venduto. Compila i dati e carica una foto: ottieni le immagini per Facebook, Instagram, LinkedIn e TikTok con i testi pronti da copiare.</p>
      </div>

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2"><span className="aa-sezione-n">01</span>Contenuto e dati</h2>
        <div className="aa-schede aa-schede-tipi">
          {Object.entries(TIPI).map(([id, t]) => (
            <button key={id} type="button" className={d.tipo === id ? "attivo" : ""} onClick={() => set("tipo", id)}>{t.nome}</button>
          ))}
        </div>
        <div className="aa-griglia-campi">
          <label className="aa-campo aa-campo-largo"><span>Titolo immobile <em>*</em></span>
            <input value={d.titolo} maxLength={60} onChange={(e) => set("titolo", e.target.value)} placeholder="es. Trilocale luminoso con terrazzo" /></label>
          <label className="aa-campo"><span>Zona / indirizzo <em>*</em></span>
            <input value={d.zona} maxLength={40} onChange={(e) => set("zona", e.target.value)} placeholder="es. Vomero, via Cilea" /></label>
          {d.tipo === "openhouse" && <>
            <label className="aa-campo"><span>Data <em>*</em></span>
              <input type="date" value={d.data} onChange={(e) => set("data", e.target.value)} /></label>
            <label className="aa-campo"><span>Dalle</span><input type="time" value={d.dalle} onChange={(e) => set("dalle", e.target.value)} /></label>
            <label className="aa-campo"><span>Alle</span><input type="time" value={d.alle} onChange={(e) => set("alle", e.target.value)} /></label>
          </>}
          {d.tipo === "venduto" && (
            <label className="aa-campo"><span>Venduto in quanti giorni (facoltativo)</span><input inputMode="numeric" value={d.giorni} onChange={(e) => set("giorni", e.target.value)} /></label>
          )}
          <label className="aa-campo"><span>Metri quadri</span><input inputMode="numeric" value={d.mq} onChange={(e) => set("mq", e.target.value)} /></label>
          <label className="aa-campo"><span>Locali</span><input inputMode="numeric" value={d.locali} onChange={(e) => set("locali", e.target.value)} /></label>
          <label className="aa-campo"><span>Bagni</span><input inputMode="numeric" value={d.bagni} onChange={(e) => set("bagni", e.target.value)} /></label>
          {d.tipo !== "venduto" && (
            <label className="aa-campo"><span>{d.tipo === "ribassato" ? "Nuovo prezzo *" : "Prezzo (facoltativo)"}</span><input value={d.prezzo} onChange={(e) => set("prezzo", e.target.value)} placeholder="es. 420.000" /></label>
          )}
          {d.tipo === "ribassato" && (
            <label className="aa-campo"><span>Prezzo precedente *</span><input value={d.prezzoVecchio} onChange={(e) => set("prezzoVecchio", e.target.value)} placeholder="es. 450.000" /></label>
          )}
          <label className="aa-campo"><span>WhatsApp per prenotare</span><input value={d.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder={`${WHATSAPP_STORE} (store)`} /></label>
          <label className="aa-campo aa-campo-largo"><span>Punti di forza (uno per riga, solo nei testi)</span>
            <textarea rows={3} value={d.punti} onChange={(e) => set("punti", e.target.value)} placeholder={"Terrazzo di 30 mq\nPiano alto con ascensore\nA 5 minuti dalla metro"} /></label>
          <div className="aa-allegato aa-campo-largo">
            <label className="aa-btn aa-upload">{foto ? "Cambia foto" : "+ Foto principale *"}<input type="file" accept="image/*" onChange={(e) => scegliFoto(e.target.files?.[0])} /></label>
            <span className="aa-nota">Usa la foto più bella, orizzontale e luminosa. Resta sul tuo dispositivo: non viene caricata.</span>
          </div>
        </div>
      </section>

      <section className="aa-card">
        <div className="aa-riga aa-riga-spazio">
          <h2 className="aa-h2"><span className="aa-sezione-n">02</span>Immagini</h2>
          <button className="aa-btn aa-btn-pieno" onClick={scaricaTutti} disabled={!foto}>Scarica tutte</button>
        </div>
        <div className="aa-oh-griglia">
          {formatiPer(d.tipo).map((f) => (
            <figure key={f.id} className={`aa-oh-formato aa-oh-${f.tipo}`}>
              <canvas ref={(el) => { tele.current[f.id] = el; }} />
              <figcaption>
                <span><strong>{f.nome}</strong><small>{f.w} × {f.h}</small></span>
                <button className="aa-btn aa-btn-piccolo" onClick={() => scarica(f)}>Scarica</button>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="aa-nota">TikTok: l'immagine fa da copertina o primo fotogramma del video; i testi stanno fuori dalle zone coperte dai pulsanti dell'app.</p>
      </section>

      <section className="aa-card">
        <h2 className="aa-h2"><span className="aa-sezione-n">03</span>Testi da copiare</h2>
        <div className="aa-oh-testi">
          {elencoTesti.map((t) => (
            <div key={t.id} className="aa-oh-testo">
              <div className="aa-riga aa-riga-spazio"><strong>{t.nome}</strong>
                <button className="aa-btn aa-btn-piccolo" onClick={() => copia(t)}>{copiato === t.id ? "Copiato ✓" : "Copia"}</button></div>
              <pre>{t.testo}</pre>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
