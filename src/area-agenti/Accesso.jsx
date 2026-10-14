import React, { useState } from "react";
import { supabase } from "./supabase";

const LOGO = "/images/logo-hub-inline.png";

function Guscio({ children }) {
  return (
    <div className="aa-accesso">
      <div className="aa-accesso-box">
        <img src={LOGO} alt="FondoCasa Hub" className="aa-accesso-logo" />
        <p className="aa-occhiello">FondoCasa Hub · Napoli Vomero</p>
        {children}
      </div>
    </div>
  );
}

export function Accesso({ erroreLink }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modo, setModo] = useState("login"); // login | recupero
  const [stato, setStato] = useState({ caricamento: false, errore: erroreLink ? "Il link non è più valido: chiedi un nuovo invito o usa 'Password dimenticata'." : "", info: "" });

  const accedi = async (e) => {
    e.preventDefault();
    setStato({ caricamento: true, errore: "", info: "" });
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setStato({ caricamento: false, info: "", errore: error.message.includes("Invalid login") ? "Email o password non corretti." : error.message });
    }
  };

  const recupera = async (e) => {
    e.preventDefault();
    setStato({ caricamento: true, errore: "", info: "" });
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/area-agenti/nuova-password`,
    });
    setStato({
      caricamento: false,
      errore: error ? error.message : "",
      info: error ? "" : "Se l'indirizzo è registrato, riceverai un'email con il link per scegliere una nuova password.",
    });
  };

  return (
    <Guscio>
      <h1 className="aa-accesso-titolo">{modo === "login" ? "Area Agenti" : "Recupera password"}</h1>
      <p className="aa-accesso-sotto">
        {modo === "login" ? "Accesso riservato ai collaboratori di FC Punto Hub." : "Inserisci la tua email: ti mandiamo il link per reimpostarla."}
      </p>

      <form onSubmit={modo === "login" ? accedi : recupera} className="aa-form">
        <label>
          Email
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {modo === "login" && (
          <label>
            Password
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        )}
        {stato.errore && <p className="aa-errore">{stato.errore}</p>}
        {stato.info && <p className="aa-info">{stato.info}</p>}
        <button className="aa-btn aa-btn-pieno" disabled={stato.caricamento}>
          {stato.caricamento ? "Attendi…" : modo === "login" ? "Entra" : "Invia il link"}
        </button>
      </form>

      <button className="aa-link" onClick={() => { setModo(modo === "login" ? "recupero" : "login"); setStato({ caricamento: false, errore: "", info: "" }); }}>
        {modo === "login" ? "Password dimenticata?" : "← Torna all'accesso"}
      </button>
      <a className="aa-link aa-link-sito" href="/">fondocasahub.com</a>
    </Guscio>
  );
}

export function NuovaPassword({ email, primoAccesso, onFatto }) {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [stato, setStato] = useState({ caricamento: false, errore: "" });

  const salva = async (e) => {
    e.preventDefault();
    if (p1.length < 8) return setStato({ caricamento: false, errore: "La password deve avere almeno 8 caratteri." });
    if (p1 !== p2) return setStato({ caricamento: false, errore: "Le due password non coincidono." });
    setStato({ caricamento: true, errore: "" });
    const { error } = await supabase.auth.updateUser({ password: p1 });
    if (error) return setStato({ caricamento: false, errore: error.message });
    window.history.replaceState({}, "", "/area-agenti");
    onFatto();
  };

  return (
    <Guscio>
      <h1 className="aa-accesso-titolo">{primoAccesso ? "Benvenuto in squadra" : "Nuova password"}</h1>
      <p className="aa-accesso-sotto">
        Scegli la password per <strong>{email}</strong>. Ti servirà per entrare nell'Area Agenti.
      </p>
      <form onSubmit={salva} className="aa-form">
        <label>
          Nuova password
          <input type="password" autoComplete="new-password" required value={p1} onChange={(e) => setP1(e.target.value)} />
        </label>
        <label>
          Ripeti la password
          <input type="password" autoComplete="new-password" required value={p2} onChange={(e) => setP2(e.target.value)} />
        </label>
        <p className="aa-nota">Almeno 8 caratteri.</p>
        {stato.errore && <p className="aa-errore">{stato.errore}</p>}
        <button className="aa-btn aa-btn-pieno" disabled={stato.caricamento}>
          {stato.caricamento ? "Salvataggio…" : "Salva ed entra"}
        </button>
      </form>
    </Guscio>
  );
}
