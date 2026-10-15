import React, { useEffect, useState, useCallback } from "react";
import { supabase, BUCKET, CARTELLE, RUOLI, REPARTI } from "./supabase";
import { GestioneComunicazioni } from "./Comunicazioni.jsx";
import { LIVELLI } from "./compensi";

const LINK_INVITO = "https://supabase.com/dashboard/project/iymxkvrgkhfaqcyxjsyz/auth/users";

export default function Gestione({ profilo, onAggiorna }) {
  const [scheda, setScheda] = useState("utenti");
  const schede = [
    { id: "utenti", label: "Utenti" },
    { id: "strumenti", label: "Strumenti" },
    { id: "avvisi", label: "Comunicazioni" },
    { id: "documenti", label: "Documenti" },
  ];
  return (
    <>
      <div className="aa-intestazione">
        <p className="aa-occhiello">Solo Admin</p>
        <h1 className="aa-titolo">Gestione</h1>
      </div>
      <div className="aa-schede" role="tablist">
        {schede.map((s) => (
          <button key={s.id} role="tab" aria-selected={scheda === s.id} className={scheda === s.id ? "attivo" : ""} onClick={() => setScheda(s.id)}>{s.label}</button>
        ))}
      </div>
      {scheda === "utenti" && <Utenti io={profilo} />}
      {scheda === "strumenti" && <Strumenti onAggiorna={onAggiorna} />}
      {scheda === "avvisi" && <GestioneComunicazioni profilo={profilo} />}
      {scheda === "documenti" && <CaricaDocumenti />}
    </>
  );
}

function useMessaggio() {
  const [msg, setMsg] = useState(null);
  const mostra = (testo, errore = false) => {
    setMsg({ testo, errore });
    setTimeout(() => setMsg(null), 3500);
  };
  const vista = msg ? <p className={msg.errore ? "aa-errore" : "aa-info"}>{msg.testo}</p> : null;
  return [vista, mostra];
}

/* ---------------- UTENTI ---------------- */
function Utenti({ io }) {
  const [utenti, setUtenti] = useState([]);
  const [vista, mostra] = useMessaggio();
  const carica = useCallback(() => {
    supabase.from("profiles").select("*").order("attivo", { ascending: false }).order("nome")
      .then(({ data }) => setUtenti(data || []));
  }, []);
  useEffect(carica, [carica]);

  const cambia = (id, campo, valore) =>
    setUtenti((u) => u.map((x) => (x.id === id ? { ...x, [campo]: valore, _mod: true } : x)));

  const salva = async (u) => {
    if (u.id === io.id && (u.ruolo !== "admin" || !u.attivo)) {
      return mostra("Non puoi togliere a te stesso il ruolo Admin o disattivarti.", true);
    }
    const { error } = await supabase.from("profiles")
      .update({ nome: u.nome, ruolo: u.ruolo, reparto: u.reparto || null, livello: u.livello || null, team: u.team || null, attivo: u.attivo })
      .eq("id", u.id);
    if (error) return mostra(error.message, true);
    mostra(`Salvato: ${u.nome || u.email}`);
    carica();
  };

  return (
    <section className="aa-card">
      <div className="aa-box-info">
        <strong>Nuovo collaboratore</strong>
        <ol>
          <li>Apri Supabase → Authentication → Users e premi <em>Add user → Send invitation</em> con la sua email.</li>
          <li>Torna qui: compare nell'elenco come <em>Agente</em>. Imposta nome, ruolo e team e premi Salva.</li>
          <li>Lui riceve l'email, sceglie la password ed entra.</li>
        </ol>
        <a className="aa-btn" href={LINK_INVITO} target="_blank" rel="noopener noreferrer">Invita su Supabase ↗</a>
      </div>
      <p className="aa-nota">Per chi esce: togli la spunta "Attivo" e salva. L'accesso a strumenti e documenti si chiude subito.</p>
      {vista}
      <div className="aa-scorri">
        <table className="aa-tabella aa-tabella-edit">
          <thead><tr><th>Nome</th><th>Email</th><th>Ruolo</th><th>Reparto</th><th>Livello compensi</th><th>Team</th><th>Attivo</th><th></th></tr></thead>
          <tbody>
            {utenti.map((u) => (
              <tr key={u.id} className={u.attivo ? "" : "aa-spento"}>
                <td><input value={u.nome || ""} onChange={(e) => cambia(u.id, "nome", e.target.value)} placeholder="Nome e cognome" /></td>
                <td className="aa-email">{u.email}</td>
                <td>
                  <select value={u.ruolo} onChange={(e) => cambia(u.id, "ruolo", e.target.value)}>
                    {RUOLI.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
                  </select>
                </td>
                <td>
                  <select value={u.reparto || ""} onChange={(e) => cambia(u.id, "reparto", e.target.value)}>
                    {REPARTI.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
                  </select>
                </td>
                <td>
                  <select value={u.livello || ""} onChange={(e) => cambia(u.id, "livello", e.target.value)}>
                    <option value="">—</option>
                    {LIVELLI.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
                  </select>
                </td>
                <td><input value={u.team || ""} onChange={(e) => cambia(u.id, "team", e.target.value)} placeholder="Es. Team Nigido" /></td>
                <td><input type="checkbox" checked={u.attivo} onChange={(e) => cambia(u.id, "attivo", e.target.checked)} aria-label="Attivo" /></td>
                <td><button className="aa-btn aa-btn-piccolo" disabled={!u._mod} onClick={() => salva(u)}>Salva</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------------- STRUMENTI ---------------- */
const NUOVO_STRUMENTO = { nome: "", url: "https://", categoria: "produttivita", descrizione: "", ordine: 99, ruoli: RUOLI.map((r) => r.id), attivo: true };

function Strumenti({ onAggiorna }) {
  const [lista, setLista] = useState([]);
  const [nuovo, setNuovo] = useState(NUOVO_STRUMENTO);
  const [vista, mostra] = useMessaggio();

  const carica = useCallback(() => {
    supabase.from("strumenti").select("*").order("categoria").order("ordine")
      .then(({ data }) => setLista(data || []));
  }, []);
  useEffect(carica, [carica]);

  const cambia = (id, campo, valore) =>
    setLista((l) => l.map((x) => (x.id === id ? { ...x, [campo]: valore, _mod: true } : x)));

  const urlValido = (u) => { try { return /^https?:$/.test(new URL(u).protocol); } catch { return false; } };

  const salva = async (s) => {
    if (!s.nome.trim() || !urlValido(s.url)) return mostra("Servono un nome e un indirizzo valido (https://…).", true);
    const { id, _mod, ...dati } = s;
    const { error } = await supabase.from("strumenti").update({ ...dati, ordine: Number(dati.ordine) || 0 }).eq("id", id);
    if (error) return mostra(error.message, true);
    mostra(`Salvato: ${s.nome}`); carica(); onAggiorna();
  };

  const aggiungi = async (e) => {
    e.preventDefault();
    if (!nuovo.nome.trim() || !urlValido(nuovo.url)) return mostra("Servono un nome e un indirizzo valido (https://…).", true);
    const { error } = await supabase.from("strumenti").insert({ ...nuovo, ordine: Number(nuovo.ordine) || 0 });
    if (error) return mostra(error.message, true);
    setNuovo(NUOVO_STRUMENTO); mostra("Strumento aggiunto"); carica(); onAggiorna();
  };

  const elimina = async (s) => {
    if (!window.confirm(`Eliminare ${s.nome}?`)) return;
    const { error } = await supabase.from("strumenti").delete().eq("id", s.id);
    if (error) return mostra(error.message, true);
    mostra("Eliminato"); carica(); onAggiorna();
  };

  const RuoliCheck = ({ valore, onChange }) => (
    <div className="aa-ruoli">
      {RUOLI.map((r) => (
        <label key={r.id}>
          <input type="checkbox" checked={valore.includes(r.id)}
            onChange={(e) => onChange(e.target.checked ? [...valore, r.id] : valore.filter((x) => x !== r.id))} />
          {r.nome}
        </label>
      ))}
    </div>
  );

  return (
    <section className="aa-card">
      <p className="aa-nota">Le modifiche compaiono subito nel menu Produttività e nell'area CRM. "Ruoli" decide chi vede lo strumento.</p>
      {vista}
      <div className="aa-scorri">
        <table className="aa-tabella aa-tabella-edit">
          <thead><tr><th>Nome</th><th>Indirizzo</th><th>Area</th><th>Descrizione</th><th>Ordine</th><th>Ruoli</th><th>Attivo</th><th></th></tr></thead>
          <tbody>
            {lista.map((s) => (
              <tr key={s.id} className={s.attivo ? "" : "aa-spento"}>
                <td><input value={s.nome} onChange={(e) => cambia(s.id, "nome", e.target.value)} /></td>
                <td><input value={s.url} onChange={(e) => cambia(s.id, "url", e.target.value)} className="aa-input-url" /></td>
                <td>
                  <select value={s.categoria} onChange={(e) => cambia(s.id, "categoria", e.target.value)}>
                    <option value="crm">CRM</option><option value="produttivita">Produttività</option>
                  </select>
                </td>
                <td><input value={s.descrizione || ""} onChange={(e) => cambia(s.id, "descrizione", e.target.value)} /></td>
                <td><input type="number" value={s.ordine} onChange={(e) => cambia(s.id, "ordine", e.target.value)} className="aa-input-num" /></td>
                <td><RuoliCheck valore={s.ruoli} onChange={(v) => cambia(s.id, "ruoli", v)} /></td>
                <td><input type="checkbox" checked={s.attivo} onChange={(e) => cambia(s.id, "attivo", e.target.checked)} aria-label="Attivo" /></td>
                <td className="aa-azioni">
                  <button className="aa-btn aa-btn-piccolo" disabled={!s._mod} onClick={() => salva(s)}>Salva</button>
                  <button className="aa-link aa-link-rosso" onClick={() => elimina(s)}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="aa-h2">Aggiungi strumento</h2>
      <form className="aa-form aa-form-riga" onSubmit={aggiungi}>
        <label>Nome<input value={nuovo.nome} onChange={(e) => setNuovo({ ...nuovo, nome: e.target.value })} required /></label>
        <label>Indirizzo della pagina di accesso<input value={nuovo.url} onChange={(e) => setNuovo({ ...nuovo, url: e.target.value })} required /></label>
        <label>Area
          <select value={nuovo.categoria} onChange={(e) => setNuovo({ ...nuovo, categoria: e.target.value })}>
            <option value="produttivita">Produttività</option><option value="crm">CRM</option>
          </select>
        </label>
        <label>Descrizione<input value={nuovo.descrizione} onChange={(e) => setNuovo({ ...nuovo, descrizione: e.target.value })} /></label>
        <label>Ordine<input type="number" value={nuovo.ordine} onChange={(e) => setNuovo({ ...nuovo, ordine: e.target.value })} /></label>
        <div className="aa-form-campo">Visibile a<RuoliCheck valore={nuovo.ruoli} onChange={(v) => setNuovo({ ...nuovo, ruoli: v })} /></div>
        <button className="aa-btn aa-btn-pieno">Aggiungi</button>
      </form>
    </section>
  );
}

/* ---------------- DOCUMENTI ---------------- */
function nomeSicuro(nome) {
  // Supabase Storage non accetta alcuni caratteri nei nomi: togliamo accenti e simboli.
  return nome.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\- ()]/g, "_");
}

function CaricaDocumenti() {
  const [cartella, setCartella] = useState(CARTELLE[0].id);
  const [file, setFile] = useState([]);
  const [caricamento, setCaricamento] = useState(false);
  const [vista, mostra] = useMessaggio();

  const carica = useCallback(() => {
    supabase.storage.from(BUCKET).list(cartella, { limit: 500, sortBy: { column: "name", order: "asc" } })
      .then(({ data }) => setFile((data || []).filter((f) => f.id && !f.name.startsWith("."))));
  }, [cartella]);
  useEffect(carica, [carica]);

  const carica_file = async (e) => {
    const scelti = Array.from(e.target.files || []);
    if (!scelti.length) return;
    setCaricamento(true);
    let ok = 0;
    for (const f of scelti) {
      const { error } = await supabase.storage.from(BUCKET).upload(`${cartella}/${nomeSicuro(f.name)}`, f, { upsert: true });
      if (error) mostra(`${f.name}: ${error.message}`, true); else ok++;
    }
    setCaricamento(false);
    e.target.value = "";
    if (ok) mostra(`${ok} file caricati`);
    carica();
  };

  const elimina = async (f) => {
    if (!window.confirm(`Eliminare ${f.name}?`)) return;
    const { error } = await supabase.storage.from(BUCKET).remove([`${cartella}/${f.name}`]);
    if (error) return mostra(error.message, true);
    carica();
  };

  const info = CARTELLE.find((c) => c.id === cartella);

  return (
    <section className="aa-card">
      <p className="aa-nota">Carica i file nella cartella giusta: è la cartella a decidere chi li vede. Un file con lo stesso nome sostituisce la versione precedente.</p>
      <div className="aa-form aa-form-riga">
        <label>Cartella
          <select value={cartella} onChange={(e) => setCartella(e.target.value)}>
            {CARTELLE.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>
        <label className="aa-btn aa-btn-pieno aa-upload">
          {caricamento ? "Caricamento…" : "Carica file"}
          <input type="file" multiple onChange={carica_file} disabled={caricamento} />
        </label>
      </div>
      <p className="aa-nota">{info?.descr}</p>
      {vista}
      {file.length === 0 ? <p className="aa-nota">Cartella vuota.</p> : (
        <ul className="aa-lista-avvisi">
          {file.map((f) => (
            <li key={f.id}>
              <span>{f.name}</span>
              <button className="aa-link aa-link-rosso" onClick={() => elimina(f)}>Elimina</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
