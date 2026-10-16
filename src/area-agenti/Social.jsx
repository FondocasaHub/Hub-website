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

function SocialImmobili() {
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

/* ================= AUGURI ================= */
const FESTE = {
  halloween: { nome: "Halloween", occhiello: "31 OTTOBRE", titolo: "Happy Halloween", sotto: "Dolcetto o scherzetto? Per noi solo case da sogno.", decor: "luna", emoji: "🎃",
    testo: "Dolcetto o scherzetto? Da noi niente scherzetti: solo case da sogno e consulenti al vostro fianco. Buon Halloween a tutti!" },
  natale: { nome: "Natale", occhiello: "25 DICEMBRE", titolo: "Buon Natale", sotto: "Che ogni casa sia piena di luce, calore e persone care.", decor: "neve", emoji: "🎄",
    testo: "Che ogni casa sia piena di luce, calore e persone care. Grazie a tutte le famiglie che quest'anno ci hanno scelto: vi auguriamo un sereno Natale." },
  capodanno: { nome: "Buon anno 2027", occhiello: "1 GENNAIO", titolo: "Buon 2027", sotto: "Un nuovo anno di progetti, traguardi e nuove case.", decor: "scintille", emoji: "🥂",
    testo: "Un nuovo anno di progetti, traguardi e nuove case. Grazie per la fiducia che ci avete dato: il 2027 lo costruiamo insieme. Buon anno!" },
  befana: { nome: "Befana", occhiello: "6 GENNAIO", titolo: "Buona Befana", sotto: "Che la calza sia piena di dolci… e di nuove chiavi di casa.", decor: "stelle", emoji: "🧦",
    testo: "Che la calza sia piena di dolci… e magari delle chiavi di una nuova casa! Buona Epifania a tutti voi e alle vostre famiglie." },
  sanvalentino: { nome: "San Valentino", occhiello: "14 FEBBRAIO", titolo: "Buon San Valentino", sotto: "Il posto più bello è quello dove si è insieme.", decor: "cuori", emoji: "❤️",
    testo: "Il posto più bello è quello dove si è insieme. A chi ama, a chi sogna una casa per due e a chi la sta già vivendo: buon San Valentino." },
  pasqua: { nome: "Pasqua", occhiello: "28 MARZO 2027", titolo: "Buona Pasqua", sotto: "Serenità e rinascita a voi e alle vostre famiglie.", decor: "uova", emoji: "🕊️",
    testo: "Un augurio di serenità e rinascita a voi e alle vostre famiglie. Buona Pasqua da tutto il team." },
};

const FORMATI_AUGURI = [
  { id: "post", nome: "Post Facebook e Instagram (4:5)", w: 1080, h: 1350, tipo: "verticale" },
  { id: "quadrato", nome: "Post quadrato (1:1)", w: 1080, h: 1080, tipo: "quadrato" },
  { id: "storia", nome: "Storia Facebook e Instagram", w: 1080, h: 1920, tipo: "storia" },
  { id: "tiktok", nome: "TikTok · copertina", w: 1080, h: 1920, tipo: "tiktok" },
  { id: "fb-link", nome: "Facebook · post orizzontale", w: 1200, h: 630, tipo: "orizzontale" },
  { id: "linkedin", nome: "LinkedIn · post", w: 1200, h: 627, tipo: "orizzontale" },
];

function caso(seme) { let x = seme; return () => { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; }; }

function decora(ctx, w, h, tipo, centro) {
  const r = caso(tipo.length * 7919 + w);
  const u = Math.min(w, h) / 100;
  ctx.save();
  ctx.strokeStyle = C.gold; ctx.fillStyle = C.gold; ctx.lineCap = "round";
  const libero = (x, y) => Math.abs(x - w / 2) > w * 0.36 || Math.abs(y - centro) > h * 0.24;
  const punti = (n, f) => { let k = 0, t = 0; while (k < n && t < n * 30) { t++; const x = r() * w, y = r() * h; if (!libero(x, y)) continue; f(x, y, 0.6 + r() * 1.2); k++; } };
  const stellina = (x, y, s) => { ctx.globalAlpha = 0.35 + r() * 0.5; ctx.lineWidth = Math.max(1.5, 0.22 * u * s); const l = 1.4 * u * s;
    ctx.beginPath(); ctx.moveTo(x - l, y); ctx.lineTo(x + l, y); ctx.moveTo(x, y - l); ctx.lineTo(x, y + l); ctx.stroke(); };
  const puntino = (x, y, s) => { ctx.globalAlpha = 0.25 + r() * 0.5; ctx.beginPath(); ctx.arc(x, y, 0.35 * u * s, 0, Math.PI * 2); ctx.fill(); };

  if (tipo === "neve") punti(26, (x, y, s) => { ctx.globalAlpha = 0.3 + r() * 0.45; ctx.lineWidth = Math.max(1.5, 0.2 * u * s); const l = 2.2 * u * s;
    for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
      const bx = x + Math.cos(a) * l * 0.6, by = y + Math.sin(a) * l * 0.6;
      [a + 0.6, a - 0.6].forEach((b) => { ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(b) * l * 0.3, by + Math.sin(b) * l * 0.3); ctx.stroke(); }); } });
  if (tipo === "cuori") punti(22, (x, y, s) => { ctx.globalAlpha = 0.3 + r() * 0.45; ctx.lineWidth = Math.max(1.5, 0.22 * u * s); const k = 1.6 * u * s;
    ctx.beginPath(); ctx.moveTo(x, y + k); ctx.bezierCurveTo(x - 2 * k, y - 0.2 * k, x - 0.9 * k, y - 1.6 * k, x, y - 0.5 * k); ctx.bezierCurveTo(x + 0.9 * k, y - 1.6 * k, x + 2 * k, y - 0.2 * k, x, y + k); ctx.stroke(); });
  if (tipo === "uova") punti(16, (x, y, s) => { ctx.globalAlpha = 0.3 + r() * 0.4; ctx.lineWidth = Math.max(1.5, 0.22 * u * s); const k = 1.5 * u * s;
    ctx.beginPath(); ctx.ellipse(x, y, k, k * 1.35, (r() - 0.5) * 0.6, 0, Math.PI * 2); ctx.stroke(); });
  if (tipo === "luna") {
    const mx = w * 0.8, my = h * 0.16, mr = 9 * u;
    ctx.save(); ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.clip();
    ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.arc(mx + mr * 0.45, my - mr * 0.25, mr * 0.9, 0, Math.PI * 2); ctx.fill("evenodd");
    ctx.restore();
  }
  if (tipo === "scintille") punti(14, (x, y, s) => { ctx.globalAlpha = 0.35 + r() * 0.4; ctx.lineWidth = Math.max(1.5, 0.18 * u * s); const l = 2.6 * u * s;
    for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * l * 0.35, y + Math.sin(a) * l * 0.35); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke(); } });
  punti(tipo === "stelle" || tipo === "luna" ? 34 : 16, stellina);
  punti(40, puntino);
  ctx.restore();
}

function disegnaAuguri(canvas, f, festa, foto, logo) {
  const { w, h } = f; canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d"); const F = FESTE[festa]; const u = Math.min(w, h) / 100;
  const oriz = f.tipo === "orizzontale";
  // sfondo
  const g = ctx.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, Math.max(w, h) * 0.75);
  g.addColorStop(0, "#14305A"); g.addColorStop(0.55, C.navy); g.addColorStop(1, C.navyDeep);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  if (foto) { ctx.globalAlpha = 0.45; copri(ctx, foto, 0, 0, w, h); ctx.globalAlpha = 1; ctx.fillStyle = "rgba(6,18,41,0.55)"; ctx.fillRect(0, 0, w, h); }
  // cornice
  ctx.strokeStyle = C.gold; ctx.globalAlpha = 0.55; ctx.lineWidth = Math.max(2, 0.25 * u);
  const ins = 3.2 * u; ctx.strokeRect(ins, ins, w - 2 * ins, h - 2 * ins); ctx.globalAlpha = 1;

  const safeB = f.tipo === "tiktok" ? 430 : f.tipo === "storia" ? 300 : 0;
  const centro = oriz ? h * 0.44 : (h - safeB) * 0.46;
  decora(ctx, w, h, F.decor, centro);

  ctx.textAlign = "center";
  const s = oriz ? h / 100 : f.tipo === "quadrato" ? 0.95 * u : u;
  // occhiello
  ctx.font = `600 ${oriz ? 3.6 * s : 3 * s}px Jost, sans-serif`; ctx.fillStyle = C.goldBright;
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = `${0.4 * s}px`;
  ctx.fillText(F.occhiello, w / 2, centro - (oriz ? 16 * s : 13 * s));
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = "0px";
  // titolo
  const ts = oriz ? 13 * s : f.tipo === "quadrato" ? 11.5 * s : 11 * s;
  ctx.font = `700 ${ts}px "Playfair Display", serif`; ctx.fillStyle = C.cream;
  const righe = avvolgi(ctx, F.titolo, w * (oriz ? 0.8 : 0.82));
  let y = centro - ((righe.length - 1) * ts * 1.05) / 2 + ts * 0.3;
  righe.forEach((rr) => { ctx.fillText(rr, w / 2, y); y += ts * 1.05; });
  // filetto
  y += -ts * 0.55;
  ctx.fillStyle = C.gold; ctx.fillRect(w / 2 - 6 * s, y, 12 * s, Math.max(2, 0.3 * s));
  // sottotitolo
  const ss = oriz ? 4 * s : 3.5 * s;
  ctx.font = `400 italic ${ss}px "Playfair Display", serif`; ctx.fillStyle = C.cream;
  y += ss * 2;
  avvolgi(ctx, F.sotto, w * (oriz ? 0.7 : 0.74)).slice(0, 3).forEach((rr) => { ctx.fillText(rr, w / 2, y); y += ss * 1.35; });
  // firma
  const fy = h - safeB - (oriz ? 9 * s : 9 * u);
  const lh = oriz ? 11 * s : 8.5 * u;
  if (logo) ctx.drawImage(logo, w / 2 - (lh * logo.width / logo.height) / 2, fy - lh - 1.5 * u, lh * logo.width / logo.height, lh);
  ctx.font = `600 ${oriz ? 3 * s : 2.4 * u}px Jost, sans-serif`; ctx.fillStyle = C.cream;
  ctx.fillText("FC PUNTO HUB · FONDOCASA HUB", w / 2, fy + 1.4 * u);
  ctx.font = `400 ${oriz ? 2.5 * s : 2 * u}px Jost, sans-serif`; ctx.fillStyle = C.goldBright;
  ctx.fillText("Via Pietro Mascagni 35 · Vomero, Napoli", w / 2, fy + 4.6 * u);
  ctx.textAlign = "left";
}

const ALLEGRO = {
  halloween: { bg: ["#2B0F45", "#7A1FA2", "#FF7A00"], testo: "#FFF3E0", accento: "#FFB703", titolo: "Buon Halloween!", sotto: "Dolcetto o scherzetto? Noi scegliamo… casa nuova!",
    icone: ["🎃", "👻", "🦇", "🕸️", "🍬", "🌙", "🕷️"], grandi: ["🎃", "👻"], coriandoli: ["#FF7A00", "#FFB703", "#B5179E", "#7BD389"],
    testo2: "Dolcetto o scherzetto? Da noi niente scherzetti: solo case da sogno! 🎃👻 Buon Halloween da tutto il team!" },
  natale: { bg: ["#7A0019", "#C1121F", "#0B6E4F"], testo: "#FFFFFF", accento: "#FFD166", titolo: "Buon Natale!", sotto: "Sotto l'albero? Le chiavi di casa nuova!",
    icone: ["🎄", "🎁", "⛄", "❄️", "🦌", "🔔", "⭐", "🍪"], grandi: ["🎄", "🎁"], coriandoli: ["#FFD166", "#FFFFFF", "#06D6A0", "#EF476F"],
    testo2: "Sotto l'albero quest'anno? Le chiavi di casa nuova! 🎄🎁 Buon Natale a voi e alle vostre famiglie!" },
  capodanno: { bg: ["#140C3A", "#3A0CA3", "#7B2FF7"], testo: "#FFFFFF", accento: "#FFD60A", titolo: "Buon 2027!", sotto: "Nuovo anno, nuova casa? Brindiamo insieme!",
    icone: ["🎆", "🥂", "🎉", "✨", "🍾", "🎇", "🎊"], grandi: ["🥂", "🎉"], coriandoli: ["#FFD60A", "#F72585", "#4CC9F0", "#FFFFFF", "#80FFDB"],
    testo2: "Nuovo anno, nuova casa? 🥂 Brindiamo insieme a un 2027 pieno di traguardi! Buon anno da tutto il team!" },
  befana: { bg: ["#2D1E6B", "#5A3E9B", "#F2A541"], testo: "#FFFFFF", accento: "#FFD166", titolo: "Viva la Befana!", sotto: "Quest'anno nella calza… le chiavi di casa!",
    icone: ["🧹", "🧦", "🍬", "🍭", "⭐", "🌙", "🍫"], grandi: ["🧦", "🧹"], coriandoli: ["#FFD166", "#F28482", "#84DCC6", "#FFFFFF"],
    testo2: "Quest'anno nella calza… le chiavi di casa! 🧦🍬 Buona Befana a grandi e piccini!" },
  sanvalentino: { bg: ["#C9184A", "#FF4D6D", "#FF8FA3"], testo: "#FFFFFF", accento: "#FFF0F3", titolo: "Buon San Valentino!", sotto: "Casa è dove c'è il tuo cuore.",
    icone: ["❤️", "💕", "💘", "🌹", "💌", "🥰", "🎈"], grandi: ["💘", "🌹"], coriandoli: ["#FFFFFF", "#FFCCD5", "#FFB3C1", "#C9184A"],
    testo2: "Casa è dove c'è il tuo cuore ❤️ A chi cerca il nido perfetto per due: buon San Valentino!" },
  pasqua: { bg: ["#BDE0FE", "#CDF5E6", "#FFF1C1"], testo: "#2B2D6E", accento: "#FF6B9A", titolo: "Buona Pasqua!", sotto: "Una sorpresa nell'uovo? Una casa nuova!",
    icone: ["🐣", "🐰", "🥚", "🌷", "🌼", "🐥", "🦋"], grandi: ["🐰", "🐣"], coriandoli: ["#FF6B9A", "#FFD166", "#7BD389", "#8EC5FF"],
    testo2: "Una sorpresa nell'uovo? Magari una casa nuova! 🐣🌷 Buona Pasqua a tutti voi!" },
};

function disegnaAuguriAllegro(canvas, f, festa, foto, logo) {
  const { w, h } = f; canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d"); const A = ALLEGRO[festa]; const u = Math.min(w, h) / 100;
  const oriz = f.tipo === "orizzontale";
  const g = ctx.createLinearGradient(0, 0, w * 0.4, h);
  g.addColorStop(0, A.bg[0]); g.addColorStop(0.55, A.bg[1]); g.addColorStop(1, A.bg[2]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  if (foto) { ctx.globalAlpha = 0.35; copri(ctx, foto, 0, 0, w, h); ctx.globalAlpha = 1; }
  const r = caso(festa.length * 104729 + w + h);
  const safeB = f.tipo === "tiktok" ? 430 : f.tipo === "storia" ? 300 : 0;
  const centro = oriz ? h * 0.42 : (h - safeB) * 0.44;
  const libero = (x, y, m) => Math.abs(x - w / 2) > w * (oriz ? 0.3 : 0.38) + m || Math.abs(y - centro) > h * (oriz ? 0.3 : 0.2) + m;
  // coriandoli
  for (let i = 0; i < 90; i++) {
    const x = r() * w, y = r() * h; ctx.fillStyle = A.coriandoli[i % A.coriandoli.length]; ctx.globalAlpha = 0.55 + r() * 0.4;
    ctx.save(); ctx.translate(x, y); ctx.rotate(r() * Math.PI);
    if (i % 3) ctx.fillRect(-0.5 * u, -0.25 * u, 1 * u, 0.5 * u); else { ctx.beginPath(); ctx.arc(0, 0, 0.4 * u, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  // icone sparse
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  let k = 0, t = 0;
  while (k < (oriz ? 12 : 16) && t < 600) {
    t++; const s = (oriz ? 7 : 6) * u * (0.6 + r() * 0.8), x = s / 2 + r() * (w - s), y = s / 2 + r() * (h - s);
    if (!libero(x, y, s * 0.4) || y > h - safeB - 14 * u && Math.abs(x - w / 2) < 22 * u) continue;
    ctx.save(); ctx.translate(x, y); ctx.rotate((r() - 0.5) * 0.7); ctx.font = `${s}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.fillText(A.icone[k % A.icone.length], 0, 0); ctx.restore(); k++;
  }
  // due illustrazioni grandi
  const big = oriz ? 22 * u : 20 * u;
  ctx.font = `${big}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  if (oriz) { ctx.fillText(A.grandi[0], w * 0.1, h * 0.5); ctx.fillText(A.grandi[1], w * 0.9, h * 0.5); }
  else { ctx.fillText(A.grandi[0], w * 0.22, centro - 25 * u); ctx.fillText(A.grandi[1], w * 0.78, centro - 25 * u); }
  // titolo
  const ts = oriz ? 12 * u : f.tipo === "quadrato" ? 11 * u : 11.5 * u;
  ctx.font = `700 ${ts}px Fredoka, Jost, sans-serif`;
  const righe = avvolgi(ctx, A.titolo, w * (oriz ? 0.62 : 0.86));
  let y = centro - ((righe.length - 1) * ts) / 2;
  righe.forEach((rr) => {
    ctx.lineJoin = "round"; ctx.lineWidth = ts * 0.12; ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.strokeText(rr, w / 2 + ts * 0.04, y + ts * 0.06);
    ctx.fillStyle = A.testo; ctx.fillText(rr, w / 2, y); y += ts;
  });
  // sottotitolo in etichetta
  const ss = oriz ? 4.2 * u : 3.8 * u;
  ctx.font = `600 ${ss}px Fredoka, Jost, sans-serif`;
  const righeS = avvolgi(ctx, A.sotto, w * (oriz ? 0.56 : 0.72)).slice(0, 2);
  const bw = Math.max(...righeS.map((x) => ctx.measureText(x).width)) + ss * 2.4, bh = righeS.length * ss * 1.3 + ss * 1.2;
  y += ss * 0.2;
  ctx.fillStyle = A.accento; ctx.beginPath(); ctx.roundRect(w / 2 - bw / 2, y - ss * 0.2, bw, bh, bh / 2); ctx.fill();
  ctx.fillStyle = festa === "pasqua" ? "#FFFFFF" : festa === "sanvalentino" ? "#C9184A" : "#1B1B3A";
  righeS.forEach((rr, i) => ctx.fillText(rr, w / 2, y - ss * 0.2 + ss * 1.25 + i * ss * 1.3));
  // firma in pillola scura
  const lh = oriz ? 9 * u : 7 * u, fy = h - safeB - (oriz ? 7 * u : 7 * u);
  ctx.font = `600 ${oriz ? 2.8 * u : 2.4 * u}px Jost, sans-serif`;
  const firma = "FC PUNTO HUB · FONDOCASA HUB";
  const lw = logo ? lh * logo.width / logo.height : 0, tw = ctx.measureText(firma).width;
  const pw = lw + tw + 7 * u, ph = lh + 3 * u;
  ctx.fillStyle = festa === "pasqua" ? "rgba(43,45,110,0.88)" : "rgba(0,0,0,0.32)";
  ctx.beginPath(); ctx.roundRect(w / 2 - pw / 2, fy - ph / 2, pw, ph, ph / 2); ctx.fill();
  if (logo) ctx.drawImage(logo, w / 2 - pw / 2 + 2.5 * u, fy - lh / 2, lw, lh);
  ctx.fillStyle = "#FFFFFF"; ctx.textAlign = "left"; ctx.fillText(firma, w / 2 - pw / 2 + 4.5 * u + lw, fy + 0.1 * u);
  ctx.textBaseline = "alphabetic";
}

function testiAuguri(festa, stile = "elegante") {
  if (stile === "allegro") {
    const A = ALLEGRO[festa], F = FESTE[festa];
    const tag = { halloween: "#halloween #happyhalloween", natale: "#buonnatale #natale", capodanno: "#buonanno #2027 #capodanno", befana: "#befana #epifania", sanvalentino: "#sanvalentino #love", pasqua: "#buonapasqua #pasqua" }[festa];
    return [
      { id: "fb", nome: "Facebook · post", testo: `${A.testo2}\n\n🏡 FC Punto Hub · FondoCasa Hub – Via Pietro Mascagni 35, Vomero` },
      { id: "ig", nome: "Instagram · post", testo: `${A.testo2}\n\n📍 Via Pietro Mascagni 35, Vomero\n\n${tag} #napoli #vomero #fondocasa #fcpuntohub #casa #immobiliare` },
      { id: "storia", nome: "Storia · testo e sticker", testo: `${A.titolo} ${F.emoji}\nSticker "Sondaggio": Casa nuova nel 2027? Sì 🙋 / Ci penso 🤔` },
      { id: "linkedin", nome: "LinkedIn · post", testo: `${A.titolo} ${F.emoji}\n\n${A.testo2}\n\n${tag.replace(/#(\w)/g, (m, c) => "#" + c.toUpperCase())} #RealEstate #Napoli` },
      { id: "tiktok", nome: "TikTok · didascalia", testo: `${A.titolo} ${F.emoji} ${A.sotto} ${tag} #napoli #casa #immobiliare #perte` },
    ];
  }
  const F = FESTE[festa];
  const firma = "Il team di FC Punto Hub · FondoCasa Hub\n📍 Via Pietro Mascagni 35, Vomero – Napoli";
  const tag = { halloween: "#halloween", natale: "#buonnatale #natale", capodanno: "#buonanno #2027 #capodanno", befana: "#befana #epifania", sanvalentino: "#sanvalentino", pasqua: "#buonapasqua #pasqua" }[festa];
  return [
    { id: "fb", nome: "Facebook · post", testo: `${F.emoji} ${F.titolo}!\n\n${F.testo}\n\n${firma}` },
    { id: "ig", nome: "Instagram · post", testo: `${F.emoji} ${F.titolo}!\n\n${F.testo}\n\n${firma}\n\n${tag} #napoli #vomero #fondocasa #fcpuntohub #immobiliare #casa` },
    { id: "storia", nome: "Storia · testo", testo: `${F.titolo} ${F.emoji}\nDa tutto il team FC Punto Hub` },
    { id: "linkedin", nome: "LinkedIn · post", testo: `${F.titolo} da tutto il team di FC Punto Hub · FondoCasa Hub.\n\n${F.testo}\n\n${tag.replace(/#(\w)/g, (m, c) => "#" + c.toUpperCase())} #RealEstate #Napoli` },
    { id: "tiktok", nome: "TikTok · didascalia", testo: `${F.titolo} ${F.emoji} dal team FC Punto Hub! ${tag} #napoli #immobiliare` },
  ];
}

function Auguri() {
  const [festa, setFesta] = useState("halloween");
  const [stile, setStile] = useState("elegante");
  const [foto, setFoto] = useState(null);
  const [logo, setLogo] = useState(null);
  const [pronte, setPronte] = useState(false);
  const [copiato, setCopiato] = useState("");
  const tele = useRef({});
  useEffect(() => {
    caricaImmagine(LOGO).then(setLogo).catch(() => setLogo(null));
    const fonti = document.fonts ? Promise.all([document.fonts.load('700 40px Fredoka'), document.fonts.load('600 40px Fredoka'), document.fonts.ready]).catch(() => null) : Promise.resolve();
    fonti.then(() => setPronte(true));
  }, []);
  useEffect(() => {
    if (!pronte) return;
    const disegnaF = stile === "allegro" ? disegnaAuguriAllegro : disegnaAuguri;
    FORMATI_AUGURI.forEach((f) => { const c = tele.current[f.id]; if (c) disegnaF(c, f, festa, foto, logo); });
  }, [festa, stile, foto, logo, pronte]);
  const scarica = (f) => new Promise((ok) => {
    tele.current[f.id].toBlob((b) => {
      const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `auguri-${festa}-${stile}-${f.id}.jpg`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); ok();
    }, "image/jpeg", 0.93);
  });
  const scaricaTutti = async () => { for (const f of FORMATI_AUGURI) { await scarica(f); await new Promise((r) => setTimeout(r, 400)); } };
  const copia = async (t) => { try { await navigator.clipboard.writeText(t.testo); setCopiato(t.id); setTimeout(() => setCopiato(""), 1800); } catch { /* ignore */ } };

  return (
    <>
      <section className="aa-card aa-sezione">
        <h2 className="aa-h2"><span className="aa-sezione-n">01</span>Festività</h2>
        <div className="aa-schede aa-schede-tipi">
          {Object.entries(FESTE).map(([id, f]) => <button key={id} type="button" className={festa === id ? "attivo" : ""} onClick={() => setFesta(id)}>{f.nome}</button>)}
        </div>
        <div className="aa-stile">
          <span>Stile</span>
          {[["elegante", "Elegante · blu e oro"], ["allegro", "Allegro · colorato e divertente"]].map(([id, nome]) => (
            <button key={id} type="button" className={`aa-btn aa-btn-piccolo ${stile === id ? "aa-btn-pieno" : ""}`} onClick={() => setStile(id)}>{nome}</button>
          ))}
        </div>
        <div className="aa-allegato">
          <label className="aa-btn aa-upload">{foto ? "Cambia foto di sfondo" : "+ Foto di sfondo (facoltativa)"}<input type="file" accept="image/*" onChange={(e) => { const fl = e.target.files?.[0]; if (fl) caricaImmagine(URL.createObjectURL(fl)).then(setFoto); }} /></label>
          {foto && <button type="button" className="aa-link" onClick={() => setFoto(null)}>Togli foto</button>}
          <span className="aa-nota">Senza foto le immagini usano lo sfondo blu e oro del marchio.</span>
        </div>
      </section>
      <section className="aa-card">
        <div className="aa-riga aa-riga-spazio">
          <h2 className="aa-h2"><span className="aa-sezione-n">02</span>Immagini</h2>
          <button className="aa-btn aa-btn-pieno" onClick={scaricaTutti}>Scarica tutte</button>
        </div>
        <div className="aa-oh-griglia">
          {FORMATI_AUGURI.map((f) => (
            <figure key={f.id} className={`aa-oh-formato aa-oh-${f.tipo}`}>
              <canvas ref={(el) => { tele.current[f.id] = el; }} />
              <figcaption><span><strong>{f.nome}</strong><small>{f.w} × {f.h}</small></span>
                <button className="aa-btn aa-btn-piccolo" onClick={() => scarica(f)}>Scarica</button></figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="aa-card">
        <h2 className="aa-h2"><span className="aa-sezione-n">03</span>Testi da copiare</h2>
        <div className="aa-oh-testi">
          {testiAuguri(festa, stile).map((t) => (
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

export default function Social() {
  const [modo, setModo] = useState(() => (new URLSearchParams(window.location.search).get("modo") === "auguri" ? "auguri" : "immobili"));
  return (
    <>
      <div className="aa-intestazione">
        <p className="aa-occhiello">Marketing · format social</p>
        <h1 className="aa-titolo">Social</h1>
        <p className="aa-sottotitolo">Immagini e testi pronti per Facebook, Instagram, LinkedIn e TikTok: per ogni immobile (appena acquisito, open house, prezzo ribassato, venduto) e per gli auguri delle festività.</p>
      </div>
      <div className="aa-schede">
        <button className={modo === "immobili" ? "attivo" : ""} onClick={() => setModo("immobili")}>Immobili</button>
        <button className={modo === "auguri" ? "attivo" : ""} onClick={() => setModo("auguri")}>Auguri festività</button>
      </div>
      {modo === "immobili" ? <SocialImmobili /> : <Auguri />}
    </>
  );
}
