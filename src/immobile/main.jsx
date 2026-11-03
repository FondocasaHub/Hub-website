// Minisito della proprietà: entry separato, senza login, in sola lettura.
// L'unica cosa che può fare è chiamare minisito_immobile con il token del link.
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import ReportImmobile from "./ReportImmobile.jsx";

const supabase = createClient("https://iymxkvrgkhfaqcyxjsyz.supabase.co", "sb_publishable_NBu5yxfOtUSRW-ZYFL4JgQ_QBOxIVYT", {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const token = window.location.pathname.split("/").filter(Boolean)[1] || "";
const TOKEN_VALIDO = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Minisito() {
  const [dati, setDati] = useState(undefined);

  useEffect(() => {
    if (!TOKEN_VALIDO.test(token)) { setDati(null); return; }
    supabase.rpc("minisito_immobile", { tok: token }).then(({ data, error }) => setDati(error ? null : data));
  }, []);

  if (dati === undefined) return <p className="im-stato">Caricamento del report…</p>;
  if (dati === null) {
    return (
      <div className="im-stato">
        <h1>Report non disponibile</h1>
        <p>Il link non è valido o è stato sostituito. Chiedi quello aggiornato al tuo agente FondoCasa Hub.</p>
      </div>
    );
  }
  return <ReportImmobile dati={dati} />;
}

createRoot(document.getElementById("root")).render(<Minisito />);
