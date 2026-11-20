// Jarvis — cabina di regia dello Store Manager (solo admin).
// La grafica sta in jarvis-template.html (nessun dato). I numeri arrivano dalla
// tabella jarvis_dati, leggibile solo dall'admin grazie alle regole RLS.
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import template from "./jarvis-template.html?raw";

export default function Jarvis({ vai }) {
  const [dati, setDati] = useState(undefined); // undefined = caricamento, null = nessun dato
  const [errore, setErrore] = useState(null);
  const [vista, setVista] = useState("store");

  useEffect(() => {
    supabase.from("jarvis_dati").select("vendilo, comparti, aggiornato_il").eq("id", 1).maybeSingle()
      .then(({ data, error }) => { if (error) setErrore(error.message); setDati(data || null); });
  }, []);

  useEffect(() => {
    const ricevi = (e) => {
      if (e.origin === window.location.origin && e.data && typeof e.data.jarvisVista === "string") setVista(e.data.jarvisVista);
    };
    window.addEventListener("message", ricevi);
    return () => window.removeEventListener("message", ricevi);
  }, []);

  const srcDoc = useMemo(() => {
    if (!dati) return null;
    const json = JSON.stringify({ V: dati.vendilo, D: dati.comparti, vista }).replace(/</g, "\\u003c");
    return template.replace("<script>", `<script>window.__JARVIS__=${json};</script>\n<script>`);
  }, [dati, vista]);

  if (dati === undefined) return <div style={stile.messaggio}>Jarvis si sta avviando…</div>;
  if (!srcDoc) {
    return (
      <div style={stile.messaggio}>
        <p>{errore ? `Errore: ${errore}` : "Nessun dato disponibile per Jarvis."}</p>
        <button style={stile.torna} onClick={() => vai("")}>← Area Agenti</button>
      </div>
    );
  }

  return (
    <div style={stile.pagina}>
      <iframe key={vista} title="Jarvis FC Punto Hub" srcDoc={srcDoc} style={stile.iframe} allow="autoplay" />
      <button style={stile.torna} onClick={() => vai("")} aria-label="Torna all'Area Agenti">← Area</button>
    </div>
  );
}

const stile = {
  pagina: { position: "fixed", inset: 0, background: "#0A1628", zIndex: 50 },
  iframe: { width: "100%", height: "100%", border: 0, display: "block" },
  torna: {
    position: "fixed", left: 12, bottom: "calc(12px + env(safe-area-inset-bottom))", zIndex: 51,
    background: "rgba(10,22,40,.85)", color: "#C9A84C", border: "1px solid #C9A84C", borderRadius: 10,
    padding: "8px 12px", fontFamily: "Jost, sans-serif", fontSize: 13, cursor: "pointer",
  },
  messaggio: {
    minHeight: "100vh", background: "#0A1628", color: "#FCFDFD", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "Jost, sans-serif", position: "relative",
  },
};
