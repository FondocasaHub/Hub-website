// Cancello giornaliero: briefing del mattino, blocco dell'area se mancano i compiti del giorno prima,
// compiti assegnati (coaching, Team Manager, Chirone) e pannello del Team Manager (sblocchi, assenze, compiti).
import React, { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import { oggiRoma, piuGiorni } from "./produttivita";
import { allarmiPercorso } from "./percorsi";
import { supportoVoce, testoParlato, scegliVoce } from "./voce";
import {
  soggettoCancello, caricaStati, obiettivoContatti, compitoCorrettivo, vociBriefing,
  dataBreve, ORIGINI, ASSENZE, venerdi,
} from "./cancello-regole.js";

const LOGO = "/images/logo-hub-inline.png";
const ora = (ts) => new Date(ts).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
const dataLunga = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

/* ---------- Stato del cancello dell'utente collegato ---------- */
// Se il caricamento fallisce l'area resta aperta: meglio nessun blocco che un blocco per errore.
export function useCancello(profilo) {
  const soggetto = soggettoCancello(profilo);
  const [stato, setStato] = useState(undefined);
  const ricarica = useCallback(async () => {
    if (!soggetto) { setStato(null); return; }
    try {
      const m = await caricaStati(supabase, [profilo], oggiRoma());
      setStato(m[profilo.id]);
    } catch (e) {
      console.error("cancello:", e.message);
      setStato(null);
    }
  }, [soggetto, profilo]);
  useEffect(() => { ricarica(); }, [ricarica]);
  return [stato, ricarica];
}

/* ---------- Briefing del mattino (schermo intero, prima di tutto) ---------- */
export function BriefingMattino({ profilo, stato, onFatto, esci }) {
  const [obiettivoOggi, setObiettivoOggi] = useState(null);
  const [allarmi, setAllarmi] = useState([]);
  const [parla, setParla] = useState(false);
  const [errore, setErrore] = useState("");
  const [invio, setInvio] = useState(false);
  const creato = useRef(false);
  const voce = supportoVoce().parlato;

  useEffect(() => {
    (async () => {
      const { data: ob } = await supabase.from("produttivita_obiettivi").select("*").eq("user_id", profilo.id).maybeSingle();
      setObiettivoOggi(obiettivoContatti(profilo, stato.percorso, ob, stato.oggi));
      if (stato.percorso) {
        const { data: diario } = await supabase.from("produttivita_giorno")
          .select("data, contatti, appuntamenti, incarichi, visite, proposte").eq("user_id", profilo.id).gte("data", stato.percorso.data_inizio);
        setAllarmi(allarmiPercorso(stato.percorso, diario || [], stato.oggi));
      }
      // Compito correttivo di Chirone (uno al giorno, se ieri i contatti erano sotto obiettivo).
      if (!creato.current && stato.precedente) {
        creato.current = true;
        const testo = compitoCorrettivo(stato, obiettivoContatti(profilo, stato.percorso, ob, stato.precedente));
        if (testo && !stato.compiti.some((c) => c.chiave === `chirone-${stato.oggi}`)) {
          const { error } = await supabase.from("compiti_assegnati").upsert(
            { user_id: profilo.id, origine: "chirone", testo, dal: stato.oggi, scadenza: stato.oggi, chiave: `chirone-${stato.oggi}` },
            { onConflict: "user_id,chiave", ignoreDuplicates: true });
          if (!error) onFatto(false);
        }
      }
    })();
  }, [profilo, stato, onFatto]);

  useEffect(() => () => { if (voce) window.speechSynthesis.cancel(); }, [voce]);

  const voci = vociBriefing({ profilo, stato, obiettivoOggi, allarmi });
  const saluto = `Buongiorno ${(profilo.nome || "").split(" ")[0]}! Oggi è ${dataLunga(stato.oggi)}.`;

  const ascolta = () => {
    const s = window.speechSynthesis;
    if (parla) { s.cancel(); setParla(false); return; }
    const testo = testoParlato([saluto, ...voci.map((v) => `${v.titolo}. ${v.righe.join(". ")}`)].join("\n"));
    const u = new SpeechSynthesisUtterance(testo);
    u.lang = "it-IT";
    const v = scegliVoce(s.getVoices());
    if (v) u.voice = v;
    u.onend = () => setParla(false);
    u.onerror = () => setParla(false);
    s.cancel();
    s.speak(u);
    setParla(true);
  };

  const conferma = async () => {
    setInvio(true);
    if (voce) window.speechSynthesis.cancel();
    const { error } = await supabase.from("giornata_presenze").upsert(
      { user_id: profilo.id, data: stato.oggi, briefing_il: new Date().toISOString() }, { onConflict: "user_id,data" });
    setInvio(false);
    if (error) { setErrore(`Non salvato: ${error.message}`); return; }
    onFatto(true);
  };

  return (
    <div className="cg-schermo">
      <div className="cg-briefing">
        <div className="cg-testa">
          <img src={LOGO} alt="" />
          <div>
            <p className="aa-occhiello">Chirone · briefing del mattino</p>
            <h1 className="aa-titolo">{saluto}</h1>
          </div>
        </div>
        {obiettivoOggi === null ? <p className="aa-nota">Preparo la tua giornata…</p> : voci.map((v) => (
          <section key={v.titolo} className={`cg-voce ${v.rosso ? "cg-voce-rossa" : ""}`}>
            <h2>{v.titolo}</h2>
            <ul>{v.righe.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </section>
        ))}
        <div className="cg-azioni">
          {voce && <button className="aa-btn" onClick={ascolta}>{parla ? "⏹ Ferma" : "🔊 Ascolta"}</button>}
          <button className="aa-btn aa-btn-pieno" onClick={conferma} disabled={invio || obiettivoOggi === null}>Ho capito, inizio la giornata</button>
        </div>
        <p className="aa-nota">Il briefing va confermato ogni giorno lavorativo appena inizi a lavorare. Se un giorno non lo confermi, il giorno dopo ti può sbloccare solo il Team Manager.</p>
        {errore && <p className="aa-errore">{errore}</p>}
        <button className="cg-esci" onClick={esci}>Esci</button>
      </div>
    </div>
  );
}

/* ---------- Area bloccata ---------- */
function ElencoMancanze({ stato }) {
  return (
    <ul className="cg-mancanze">
      {stato.mancanze.map((m, i) => <li key={i} className={m.soloTM ? "solo-tm" : ""}>{m.testo}</li>)}
    </ul>
  );
}

export function PaginaBloccata({ stato, vai, ricarica }) {
  return (
    <div className="aa-card cg-bloccata">
      <p className="aa-occhiello">Area bloccata</p>
      <h1 className="aa-titolo">🔒 Prima completa i compiti di {dataBreve(stato.precedente || stato.oggi)}</h1>
      <p>Finché non li completi puoi usare solo <strong>La mia giornata</strong>, le <strong>Istruzioni</strong>, il <strong>CRM</strong> (Vendilo), gli strumenti di <strong>Produttività</strong> e Chirone.</p>
      <ElencoMancanze stato={stato} />
      <div className="cg-azioni">
        <button className="aa-btn aa-btn-pieno" onClick={() => vai("giornata")}>Vai a La mia giornata</button>
        <button className="aa-btn" onClick={ricarica}>Ho completato, ricontrolla</button>
      </div>
      {stato.mancanze.some((m) => m.soloTM) && <p className="aa-nota">Per il briefing non confermato chiedi al tuo Team Manager: può sbloccarti scrivendo una motivazione, oppure segnare l'assenza se eri giustificato.</p>}
    </div>
  );
}

export function AvvisoBlocco({ stato, vai, ricarica }) {
  if (!stato?.bloccato && !(stato?.sbloccato && stato.mancanze.length)) return null;
  return (
    <div className={`cg-avviso ${stato.bloccato ? "" : "cg-avviso-giallo"}`} role="alert">
      <strong>{stato.bloccato ? `🔒 Area bloccata: ${stato.mancanze.length} cose da completare` : `🔓 Sbloccato oggi dal Team Manager: restano ${stato.mancanze.length} cose da completare`}</strong>
      <span>
        <button className="aa-btn aa-btn-piccolo" onClick={() => vai(stato.bloccato ? "" : "giornata")}>Vedi cosa manca</button>{" "}
        <button className="aa-btn aa-btn-piccolo" onClick={ricarica}>Ricontrolla</button>
      </span>
    </div>
  );
}

/* ---------- I miei compiti assegnati (in "La mia giornata") ---------- */
export function CompitiAssegnati({ profilo, onCambio }) {
  const [compiti, setCompiti] = useState(null);
  const [errore, setErrore] = useState("");
  const oggi = oggiRoma();

  const carica = useCallback(async () => {
    const { data } = await supabase.from("compiti_assegnati").select("*").eq("user_id", profilo.id).eq("annullato", false)
      .or(`fatto_il.is.null,fatto_il.gte.${piuGiorni(oggi, -7)}`).order("scadenza");
    setCompiti(data || []);
  }, [profilo.id, oggi]);
  useEffect(() => { carica(); }, [carica]);

  const spunta = async (c, fatto) => {
    setCompiti((l) => l.map((x) => (x.id === c.id ? { ...x, fatto_il: fatto ? new Date().toISOString() : null } : x)));
    const { error } = await supabase.from("compiti_assegnati").update({ fatto_il: fatto ? new Date().toISOString() : null }).eq("id", c.id);
    setErrore(error ? `Non salvato: ${error.message}` : "");
    onCambio?.();
  };

  if (!compiti?.length) return null;
  return (
    <section className="aa-card pc-percorso">
      <p className="aa-occhiello">Compiti assegnati</p>
      <h2 className="aa-h2">Dal coaching, dal Team Manager e da Chirone</h2>
      <div className="pc-compiti">
        {compiti.map((c) => (
          <label key={c.id} className={`pc-compito ${c.fatto_il ? "fatto" : ""} ${!c.fatto_il && c.scadenza < oggi ? "scaduto" : ""}`}>
            <input type="checkbox" checked={!!c.fatto_il} onChange={(e) => spunta(c, e.target.checked)} />
            <span><small>{ORIGINI[c.origine]} · entro {dataBreve(c.scadenza)}{!c.fatto_il && c.scadenza < oggi ? " · SCADUTO" : ""}</small>{c.testo}</span>
          </label>
        ))}
      </div>
      <p className="aa-nota">Spunta solo quello che hai fatto davvero: il Team Manager lo verifica nel One to One.</p>
      {errore && <p className="aa-errore">{errore}</p>}
    </section>
  );
}

/* ---------- Pannello del Team Manager ---------- */
export function CancelloTeam({ profilo }) {
  const oggi = oggiRoma();
  const [persone, setPersone] = useState(null);
  const [stati, setStati] = useState({});
  const [aperto, setAperto] = useState(null);       // id della riga espansa
  const [form, setForm] = useState(null);           // { tipo: 'compito'|'assenza'|'sblocco', user_id, ... }
  const [msg, setMsg] = useState("");

  const carica = useCallback(async () => {
    const { data, error } = await supabase.rpc("cancello_team");
    if (error) { setMsg(`Errore: ${error.message}`); setPersone([]); return; }
    setPersone(data || []);
    try { setStati(await caricaStati(supabase, data || [], oggi)); } catch (e) { setMsg(`Errore: ${e.message}`); }
  }, [oggi]);
  useEffect(() => { carica(); }, [carica]);

  const salva = async (e) => {
    e.preventDefault();
    let r;
    if (form.tipo === "compito") {
      r = await supabase.from("compiti_assegnati").insert({ user_id: form.user_id, origine: form.origine, testo: form.testo.trim(), scadenza: form.scadenza });
    } else if (form.tipo === "assenza") {
      r = await supabase.from("giornata_presenze").upsert({ user_id: form.user_id, data: form.data, assenza: form.assenza || null }, { onConflict: "user_id,data" });
    } else {
      r = await supabase.from("giornata_presenze").upsert(
        { user_id: form.user_id, data: oggi, sblocco_il: new Date().toISOString(), sblocco_motivo: form.motivo.trim() }, { onConflict: "user_id,data" });
    }
    if (r.error) { setMsg(`Errore: ${r.error.message}`); return; }
    setMsg("Salvato ✓"); setForm(null); carica();
  };
  const annulla = async (id) => {
    if (!window.confirm("Annulli questo compito?")) return;
    const { error } = await supabase.from("compiti_assegnati").update({ annullato: true }).eq("id", id);
    setMsg(error ? `Errore: ${error.message}` : "Compito annullato ✓"); carica();
  };

  if (persone === null) return null;
  const nome = (id) => persone.find((p) => p.id === id)?.nome || "—";

  return (
    <section className="aa-card">
      <div className="mg-testa">
        <h2 className="aa-h2">Cancello giornaliero · {profilo.ruolo === "admin" ? "tutti i team" : "il mio team"}</h2>
        <button className="aa-btn aa-btn-piccolo" onClick={() => setForm({ tipo: "compito", user_id: persone[0]?.id || "", origine: "coaching", testo: "", scadenza: venerdi(oggi) })}>+ Assegna compito</button>
      </div>
      <p className="aa-nota">Agenti, buyer e consulenti del credito confermano il briefing ogni mattina; se il giorno prima mancano diario o compiti, l'area resta bloccata. Sblocchi e assenze restano registrati.</p>

      {form && (
        <form className="mg-form" onSubmit={salva}>
          <h3 className="aa-h3">{form.tipo === "compito" ? "Assegna un compito" : form.tipo === "assenza" ? `Assenza di ${nome(form.user_id)}` : `Sblocca oggi ${nome(form.user_id)}`}</h3>
          {form.tipo === "compito" && (
            <div className="aa-griglia-campi">
              <label className="aa-campo"><span>Collaboratore</span>
                <select required value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}>
                  {persone.map((p) => <option key={p.id} value={p.id}>{p.nome || "—"}{p.team ? ` · ${p.team}` : ""}</option>)}
                </select>
              </label>
              <label className="aa-campo"><span>Da dove viene</span>
                <select value={form.origine} onChange={(e) => setForm({ ...form, origine: e.target.value })}>
                  <option value="coaching">Coaching (One to One / messaggio settimanale)</option>
                  <option value="manager">Team Manager</option>
                </select>
              </label>
              <label className="aa-campo"><span>Entro il</span>
                <input type="date" required min={oggi} value={form.scadenza} onChange={(e) => setForm({ ...form, scadenza: e.target.value })} />
              </label>
              <label className="aa-campo aa-campo-largo"><span>Compito</span>
                <textarea required minLength={3} maxLength={500} rows={2} value={form.testo} placeholder="Es. 3 appuntamenti di acquisizione fissati entro venerdì"
                  onChange={(e) => setForm({ ...form, testo: e.target.value })} />
              </label>
            </div>
          )}
          {form.tipo === "assenza" && (
            <div className="aa-griglia-campi">
              <label className="aa-campo"><span>Giorno</span>
                <input type="date" required value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
              </label>
              <label className="aa-campo"><span>Motivo</span>
                <select value={form.assenza} onChange={(e) => setForm({ ...form, assenza: e.target.value })}>
                  {Object.entries(ASSENZE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  <option value="">— Nessuna assenza (togli)</option>
                </select>
              </label>
            </div>
          )}
          {form.tipo === "sblocco" && (
            <label className="aa-campo aa-campo-largo"><span>Motivazione (obbligatoria, resta nello storico)</span>
              <textarea required rows={2} maxLength={500} value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} />
            </label>
          )}
          <button className="aa-btn aa-btn-pieno" type="submit">Salva</button>{" "}
          <button className="aa-btn" type="button" onClick={() => setForm(null)}>Annulla</button>
        </form>
      )}

      {persone.length === 0 ? <p className="aa-nota">Nessun collaboratore soggetto al cancello.</p> : (
        <div className="aa-scorri">
          <table className="aa-tabella">
            <thead><tr><th>Collaboratore</th><th>Briefing oggi</th><th>Stato</th><th>Compiti aperti</th><th></th></tr></thead>
            <tbody>
              {persone.map((p) => {
                const s = stati[p.id];
                if (!s) return <tr key={p.id}><td>{p.nome}</td><td colSpan={4}>…</td></tr>;
                return (
                  <React.Fragment key={p.id}>
                    <tr className={s.bloccato ? "pc-riga-rossa" : ""}>
                      <td><strong>{p.nome || "—"}</strong><br /><small className="aa-nota">{p.ruolo === "credito" ? "Credito" : "Agente"}{p.team ? ` · ${p.team}` : ""}</small></td>
                      <td>{!s.lavorativoOggi ? (s.assenzaOggi ? ASSENZE[s.assenzaOggi] : "non lavorativo") : s.briefing ? `✓ ${ora(s.briefingIl)}` : <span className="cg-no">✗ non ancora</span>}</td>
                      <td>
                        {s.bloccato ? <span className="cg-no">🔒 Bloccato ({s.mancanze.length})</span>
                          : s.sbloccato ? <span>🔓 Sbloccato: <small>{s.sbloccoMotivo}</small></span>
                          : s.mancanze.length ? <span>{s.mancanze.length} da completare</span>
                          : <span className="aa-stato aa-stato-completata">in regola</span>}
                        {s.mancanze.length > 0 && <><br /><button className="cg-link" onClick={() => setAperto(aperto === p.id ? null : p.id)}>{aperto === p.id ? "nascondi" : "cosa manca"}</button></>}
                      </td>
                      <td>{s.compiti.length}{s.compiti.length > 0 && <> · <button className="cg-link" onClick={() => setAperto(aperto === p.id ? null : p.id)}>vedi</button></>}</td>
                      <td className="pc-azioni">
                        {s.bloccato && <button className="aa-btn aa-btn-piccolo" onClick={() => setForm({ tipo: "sblocco", user_id: p.id, motivo: "" })}>Sblocca oggi</button>}
                        <button className="aa-btn aa-btn-piccolo" onClick={() => setForm({ tipo: "assenza", user_id: p.id, data: s.precedente && !s.briefing ? s.precedente : oggi, assenza: "ferie" })}>Assenza</button>
                        <button className="aa-btn aa-btn-piccolo" onClick={() => setForm({ tipo: "compito", user_id: p.id, origine: "coaching", testo: "", scadenza: venerdi(oggi) })}>+ Compito</button>
                      </td>
                    </tr>
                    {aperto === p.id && (
                      <tr><td colSpan={5}>
                        {s.mancanze.length > 0 && <ElencoMancanze stato={s} />}
                        {s.compiti.length > 0 && (
                          <ul className="cg-compiti-tm">
                            {s.compiti.map((c) => (
                              <li key={c.id}>{ORIGINI[c.origine]} · entro {dataBreve(c.scadenza)}: {c.testo}{" "}
                                <button className="cg-link" onClick={() => annulla(c.id)}>annulla</button></li>
                            ))}
                          </ul>
                        )}
                      </td></tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {msg && <p className="aa-nota">{msg}</p>}
    </section>
  );
}
