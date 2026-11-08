import React, { useEffect, useState } from "react";

/*
 * Recensioni Google sempre aggiornate: voto medio, totale e le ultime 5,
 * lette da /api/recensioni (cache 6 ore sulla CDN).
 * Se l'API non risponde mostra le testimonianze statiche passate in `fallback`
 * (quelle prerenderizzate per i crawler) senza numeri che potrebbero essere vecchi.
 */

const PLACE_ID = "ChIJ9QSKiKcJOxMRO3--jorfbQw";
const LINK_TUTTE = `https://search.google.com/local/reviews?placeid=${PLACE_ID}`;
const LINK_SCRIVI = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;

function Stelle({ n, color, size = 16 }) {
  return (
    <span aria-label={`${n} stelle su 5`} style={{ color, fontSize: size, letterSpacing: 2, lineHeight: 1 }}>
      {"★★★★★".slice(0, Math.round(n))}
      <span style={{ opacity: 0.25 }}>{"★★★★★".slice(Math.round(n))}</span>
    </span>
  );
}

function Card({ r, dark, colors }) {
  const { NAVY, NAVY_DEEP, GOLD, CREAM } = colors;
  const [aperta, setAperta] = useState(false);
  const lunga = (r.testo || "").length > 260;
  const testo = !lunga || aperta ? r.testo : r.testo.slice(0, 250).replace(/\s+\S*$/, "") + "…";
  return (
    <div className="testimonial-card" style={{
      padding: 28, display: "flex", flexDirection: "column", gap: 14,
      background: dark ? "rgba(255,255,255,0.06)" : "#fff",
      borderLeft: `3px solid ${GOLD}`, color: dark ? CREAM : NAVY,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {r.foto
          ? <img src={r.foto} alt="" width="40" height="40" loading="lazy" referrerPolicy="no-referrer" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
          : <div style={{ width: 40, height: 40, borderRadius: "50%", background: dark ? GOLD : NAVY, color: dark ? NAVY_DEEP : GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{r.iniziali}</div>}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{r.nome}</div>
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>{r.quando || r.servizio}</div>
        </div>
      </div>
      <Stelle n={r.rating} color={GOLD} />
      {testo && (
        <p className="serif" style={{ fontSize: "1.02rem", lineHeight: 1.55, fontStyle: "italic", margin: 0, opacity: 0.92 }}>
          "{testo}"
          {lunga && (
            <button onClick={() => setAperta(!aperta)} style={{ background: "none", border: "none", color: GOLD, cursor: "pointer", fontWeight: 600, fontStyle: "normal", fontSize: 13, marginLeft: 6, padding: 0 }}>
              {aperta ? "Riduci" : "Leggi tutto"}
            </button>
          )}
        </p>
      )}
      <div style={{ fontSize: 11, opacity: 0.55, marginTop: "auto" }}>Recensione Google</div>
    </div>
  );
}

export default function GoogleReviews({ colors, dark = false, fallback = [], titolo }) {
  const { NAVY, NAVY_DEEP, GOLD, CREAM } = colors;
  const [dati, setDati] = useState(null);

  useEffect(() => {
    let attivo = true;
    fetch("/api/recensioni")
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (attivo && d && d.recensioni && d.recensioni.length) setDati(d); })
      .catch(() => {});
    return () => { attivo = false; };
  }, []);

  const recensioni = dati ? dati.recensioni : fallback.slice(0, 5);
  const linkTutte = (dati && dati.linkTutte) || LINK_TUTTE;
  const linkScrivi = (dati && dati.linkScrivi) || LINK_SCRIVI;
  const voto = dati && dati.rating ? dati.rating.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : null;

  return (
    <section style={{ padding: "100px 32px", background: dark ? NAVY : CREAM, color: dark ? CREAM : NAVY }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span className="badge-gold" style={dark ? undefined : { background: "rgba(10,31,61,0.05)", color: NAVY, borderColor: "rgba(193,154,91,0.4)" }}>Dalle recensioni Google</span>
          <h2 className="serif h2-resp" style={{ fontSize: "2.6rem", fontWeight: 700, marginTop: 24, lineHeight: 1.1, color: dark ? CREAM : NAVY }}>
            {titolo || <>Cosa dicono i <em style={{ color: GOLD }}>nostri clienti</em></>}
          </h2>
        </div>

        {/* Riepilogo: voto medio e totale ben visibili */}
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "20px 36px",
          margin: "0 auto 48px", padding: "26px 32px", maxWidth: 860,
          background: dark ? "rgba(255,255,255,0.06)" : "#fff", border: `1px solid rgba(193,154,91,0.35)`, borderRadius: 6,
        }}>
          {voto ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, color: dark ? CREAM : NAVY }}>{voto}</div>
              <div>
                <Stelle n={dati.rating} color={GOLD} size={22} />
                <div style={{ fontSize: 15, marginTop: 6, fontWeight: 500 }}>
                  su <strong>{dati.totale}</strong> recensioni Google
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 16, fontWeight: 500 }}>Recensioni verificate su Google</div>
          )}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <a href={linkTutte} target="_blank" rel="noopener noreferrer" style={{
              background: GOLD, color: NAVY_DEEP, padding: "13px 24px", borderRadius: 4,
              fontWeight: 700, fontSize: 14, textDecoration: "none", letterSpacing: 0.5,
            }}>Leggi tutte le recensioni →</a>
            <a href={linkScrivi} target="_blank" rel="noopener noreferrer" style={{
              border: `1px solid ${GOLD}`, color: dark ? CREAM : NAVY, padding: "12px 22px", borderRadius: 4,
              fontWeight: 600, fontSize: 14, textDecoration: "none",
            }}>Lascia una recensione</a>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {recensioni.map((r, i) => <Card key={i} r={r} dark={dark} colors={colors} />)}
        </div>
      </div>
    </section>
  );
}
