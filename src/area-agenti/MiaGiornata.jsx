// "La mia giornata": diario giornaliero (Modulo Giornaliero Contatti HUB) e calcolatore di produttività personale.
// Ognuno scrive solo i propri dati; il Team Manager vede il riepilogo del suo team, l'admin di tutti (regole RLS).
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabase";
import {
  OBIETTIVI_PREDEFINITI, LISTE_PIANO, MINIMO_CONTATTI_HUB,
  calcolaObiettivi, totali, euro, uno, oggiRoma, lunedi, piuGiorni,
} from "./produttivita";
import { PercorsoOggi, PercorsiTeam } from "./Percorso.jsx";

const NUMERI = [
  ["appuntamenti", "Appuntamenti di acquisizione"],
  ["incarichi", "Incarichi firmati"],
  ["visite", "Visite con acquirenti"],
  ["proposte", "Proposte raccolte"],
  ["ore", "Ore lavorate"],
];
const VUOTO = { contatti: 0, appuntamenti: 0, incarichi: 0, visite: 0, proposte: 0, ore: 0, focus: "", piano: {} };

const giorniLavorati = (dal, al) => {
  let c = 0;
  for (let d = dal; d <= al; d = piuGiorni(d, 1)) {
    const g = new Date(`${d}T12:00:00Z`).getUTCDay();
    if (g >= 1 && g <= 5) c++;
  }
  return c;
};
const dataLunga = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

function Barra({ valore, obiettivo }) {
  const pct = obiettivo > 0 ? Math.min(100, Math.round((valore / obiettivo) * 100)) : 0;
  return (
    <div className="mg-barra" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${pct}%` }} className={pct >= 100 ? "ok" : ""} />
    </div>
  );
}

export default function MiaGiornata({ profilo }) {
  const oggi = oggiRoma();
  const [data, setData] = useState(oggi);
  const [giorno, setGiorno] = useState(null);
  const [obiettivi, setObiettivi] = useState(null);
  const [storico, setStorico] = useState([]);
  const [team, setTeam] = useState(null);
  const [stato, setStato] = useState("");
  const [modObiettivi, setModObiettivi] = useState(false);
  const timer = useRef(null);
  const isManager = profilo.ruolo === "manager" || profilo.ruolo === "admin";

  const inizioMese = `${oggi.slice(0, 8)}01`;
  const caricaStorico = useCallback(async () => {
    const dal = [inizioMese, lunedi(oggi)].sort()[0];
    const { data: righe } = await supabase.from("produttivita_giorno")
      .select("data, contatti, appuntamenti, incarichi, visite, proposte, ore")
      .eq("user_id", profilo.id).gte("data", dal).order("data");
    setStorico(righe || []);
  }, [profilo.id, oggi, inizioMese]);

  useEffect(() => {
    (async () => {
      const { data: o } = await supabase.from("produttivita_obiettivi").select("*").eq("user_id", profilo.id).maybeSingle();
      setObiettivi(o || { ...OBIETTIVI_PREDEFINITI });
      if (!o) setModObiettivi(true);
      caricaStorico();
      if (isManager) {
        const { data: t } = await supabase.rpc("produttivita_team", { p_dal: lunedi(oggi) });
        setTeam(t || []);
      }
    })();
  }, [profilo.id, isManager, oggi, caricaStorico]);

  useEffect(() => {
    setGiorno(null);
    supabase.from("produttivita_giorno").select("*").eq("user_id", profilo.id).eq("data", data).maybeSingle()
      .then(({ data: g }) => setGiorno(g ? { ...VUOTO, ...g, piano: g.piano || {} } : { ...VUOTO }));
  }, [profilo.id, data]);

  const salva = useCallback((nuovo) => {
    clearTimeout(timer.current);
    setStato("Salvataggio…");
    timer.current = setTimeout(async () => {
      const riga = {
        user_id: profilo.id, data,
        contatti: nuovo.contatti, appuntamenti: nuovo.appuntamenti, incarichi: nuovo.incarichi,
        visite: nuovo.visite, proposte: nuovo.proposte, ore: nuovo.ore,
        focus: nuovo.focus, piano: nuovo.piano, aggiornato_il: new Date().toISOString(),
      };
      const { error } = await supabase.from("produttivita_giorno").upsert(riga, { onConflict: "user_id,data" });
      setStato(error ? `Non salvato: ${error.message}` : "Salvato ✓");
      if (!error) caricaStorico();
    }, 700);
  }, [profilo.id, data, caricaStorico]);

  const modifica = (campi) => {
    setGiorno((g) => { const nuovo = { ...g, ...campi }; salva(nuovo); return nuovo; });
  };
  const numero = (k, delta) => modifica({ [k]: Math.max(0, (Number(giorno[k]) || 0) + delta) });

  const calcolo = useMemo(() => calcolaObiettivi(obiettivi || {}), [obiettivi]);
  const settimana = useMemo(() => totali(storico.filter((g) => g.data >= lunedi(oggi) && g.data <= oggi)), [storico, oggi]);
  const mese = useMemo(() => totali(storico.filter((g) => g.data >= inizioMese && g.data <= oggi)), [storico, oggi, inizioMese]);
  const giorniSett = giorniLavorati(lunedi(oggi), oggi);
  const giorniMese = giorniLavorati(inizioMese, oggi);

  async function salvaObiettivi(e) {
    e.preventDefault();
    const riga = { user_id: profilo.id, aggiornato_il: new Date().toISOString() };
    for (const k of Object.keys(OBIETTIVI_PREDEFINITI)) riga[k] = Number(obiettivi[k]) || OBIETTIVI_PREDEFINITI[k];
    const { error } = await supabase.from("produttivita_obiettivi").upsert(riga, { onConflict: "user_id" });
    if (error) { alert(`Obiettivi non salvati: ${error.message}`); return; }
    setObiettivi(riga);
    setModObiettivi(false);
  }

  if (!giorno || !obiettivi) return <p className="aa-nota">Caricamento…</p>;
  const obiettivoContatti = calcolo.giorno.contatti;

  return (
    <>
      <div className="aa-intestazione">
        <p className="aa-occhiello">Produttività</p>
        <h1 className="aa-titolo">La mia giornata</h1>
        <p className="aa-sottotitolo">Il Modulo Giornaliero Contatti in digitale: compilalo durante la giornata. Vendilo resta il CRM ufficiale, da aggiornare entro le 19:00.</p>
      </div>

      <PercorsoOggi profilo={profilo} oggi={oggi} aggiornato={storico} />

      <div className="mg-data">
        <button className="aa-btn aa-btn-piccolo" onClick={() => setData(piuGiorni(data, -1))} aria-label="Giorno precedente">←</button>
        <input type="date" value={data} max={oggi} onChange={(e) => e.target.value && setData(e.target.value)} />
        <button className="aa-btn aa-btn-piccolo" onClick={() => setData(piuGiorni(data, 1))} disabled={data >= oggi} aria-label="Giorno successivo">→</button>
        {data !== oggi && <button className="aa-btn aa-btn-piccolo" onClick={() => setData(oggi)}>Oggi</button>}
        <span className="mg-giorno">{dataLunga(data)}</span>
        <span className="aa-nota mg-stato">{stato}</span>
      </div>

      <section className="aa-card mg-contatti">
        <div>
          <h2 className="aa-h2">Contatti</h2>
          <p className="aa-nota">Fattene una ragione: devi parlare con le persone. Obiettivo di oggi: {obiettivoContatti}.</p>
        </div>
        <div className="mg-contatore">
          <button onClick={() => numero("contatti", -1)} aria-label="Togli un contatto">−</button>
          <strong>{giorno.contatti}<small>/{obiettivoContatti}</small></strong>
          <button onClick={() => numero("contatti", 1)} aria-label="Aggiungi un contatto">+1</button>
          <button onClick={() => numero("contatti", 5)} aria-label="Aggiungi cinque contatti">+5</button>
        </div>
        <Barra valore={giorno.contatti} obiettivo={obiettivoContatti} />
      </section>

      <section className="aa-card">
        <h2 className="aa-h2">Numeri della giornata</h2>
        <div className="mg-numeri">
          {NUMERI.map(([k, etichetta]) => (
            <label key={k} className="aa-campo">
              <span>{etichetta}</span>
              <input type="number" min="0" step={k === "ore" ? "0.5" : "1"} inputMode="decimal" value={giorno[k]}
                onChange={(e) => modifica({ [k]: Math.max(0, Number(e.target.value) || 0) })} />
            </label>
          ))}
        </div>
      </section>

      <section className="aa-card">
        <h2 className="aa-h2">Il focus e il piano</h2>
        <label className="aa-campo aa-campo-largo">
          <span>Il focus di oggi</span>
          <input type="text" maxLength={300} value={giorno.focus} placeholder="La cosa più importante da ottenere oggi"
            onChange={(e) => modifica({ focus: e.target.value })} />
        </label>
        <div className="mg-liste">
          {LISTE_PIANO.map(([k, etichetta]) => (
            <label key={k} className="aa-campo">
              <span>{etichetta}</span>
              <textarea rows={3} placeholder="Una voce per riga" value={(giorno.piano[k] || []).join("\n")}
                onChange={(e) => modifica({ piano: { ...giorno.piano, [k]: e.target.value.split("\n").slice(0, 15) } })} />
            </label>
          ))}
        </div>
        <p className="aa-nota">In "Da richiamare" scrivi solo il nome di riferimento: i recapiti restano su Vendilo.</p>
      </section>

      <section className="aa-card">
        <h2 className="aa-h2">Come sto andando</h2>
        <table className="aa-tabella mg-andamento">
          <thead><tr><th></th><th>Settimana</th><th>Obiettivo</th><th>Mese</th><th>Obiettivo</th></tr></thead>
          <tbody>
            <tr>
              <td>Contatti</td>
              <td>{settimana.contatti}<Barra valore={settimana.contatti} obiettivo={obiettivoContatti * giorniSett} /></td>
              <td>{obiettivoContatti * giorniSett}</td>
              <td>{mese.contatti}<Barra valore={mese.contatti} obiettivo={obiettivoContatti * giorniMese} /></td>
              <td>{obiettivoContatti * giorniMese}</td>
            </tr>
            <tr>
              <td>Appuntamenti</td>
              <td>{settimana.appuntamenti}</td><td>{uno(calcolo.giorno.appuntamenti * giorniSett)}</td>
              <td>{mese.appuntamenti}</td><td>{uno(calcolo.giorno.appuntamenti * giorniMese)}</td>
            </tr>
            <tr>
              <td>Incarichi</td>
              <td>{settimana.incarichi}</td><td>—</td>
              <td>{mese.incarichi}</td><td>{uno(calcolo.mese.incarichi)}</td>
            </tr>
            <tr>
              <td>Ore</td>
              <td>{uno(settimana.ore)}</td><td>{giorniSett * (Number(obiettivi.ore_giorno) || 8)}</td>
              <td>{uno(mese.ore)}</td><td>{giorniMese * (Number(obiettivi.ore_giorno) || 8)}</td>
            </tr>
          </tbody>
        </table>
        <p className="aa-nota">Obiettivi calcolati sui giorni lavorativi trascorsi, da lunedì a venerdì.</p>
      </section>

      <section className="aa-card">
        <div className="mg-testa">
          <h2 className="aa-h2">I miei obiettivi</h2>
          {!modObiettivi && <button className="aa-btn aa-btn-piccolo" onClick={() => setModObiettivi(true)}>Modifica</button>}
        </div>
        <div className="mg-risultati">
          <div><strong>{euro(calcolo.giorno.fatturato)}</strong><span>provvigioni al giorno</span></div>
          <div><strong>{euro(calcolo.giorno.fatturatoOra)}</strong><span>all'ora</span></div>
          <div><strong>{obiettivoContatti}</strong><span>contatti al giorno</span></div>
          <div><strong>{uno(calcolo.settimana.appuntamenti)}</strong><span>appuntamenti a settimana</span></div>
          <div><strong>{uno(calcolo.mese.incarichi)}</strong><span>incarichi al mese</span></div>
          <div><strong>{uno(calcolo.anno.vendite)}</strong><span>vendite all'anno</span></div>
        </div>
        {calcolo.giorno.contattiCalcolati < MINIMO_CONTATTI_HUB && (
          <p className="aa-nota">Il calcolo darebbe {calcolo.giorno.contattiCalcolati} contatti al giorno: vale il minimo dell'Hub di {MINIMO_CONTATTI_HUB}.</p>
        )}
        {modObiettivi && (
          <form className="mg-form" onSubmit={salvaObiettivi}>
            <div className="aa-griglia-campi">
              {[
                ["obiettivo_annuo", "Provvigioni personali che voglio guadagnare in un anno (€)"],
                ["provvigione_media", "La mia provvigione media per operazione (€)"],
                ["incarichi_per_vendita", "Incarichi necessari per una vendita"],
                ["appuntamenti_per_incarico", "Appuntamenti di acquisizione per un incarico"],
                ["contatti_per_appuntamento", "Contatti per un appuntamento"],
                ["giorni_mese", "Giorni lavorativi al mese"],
                ["mesi_anno", "Mesi lavorativi all'anno"],
                ["ore_giorno", "Ore lavorative al giorno"],
              ].map(([k, etichetta]) => (
                <label key={k} className="aa-campo">
                  <span>{etichetta}</span>
                  <input type="number" min="0" step="any" value={obiettivi[k] ?? ""} required
                    onChange={(e) => setObiettivi({ ...obiettivi, [k]: e.target.value })} />
                </label>
              ))}
            </div>
            <p className="aa-nota">I rapporti di conversione partono da valori indicativi: aggiornali con i tuoi numeri reali di Vendilo (sezione Numeri).</p>
            <button className="aa-btn aa-btn-pieno" type="submit">Salva obiettivi</button>
          </form>
        )}
      </section>

      {isManager && team && <PercorsiTeam profilo={profilo} oggi={oggi} team={team} />}

      {isManager && team && (
        <section className="aa-card">
          <h2 className="aa-h2">{profilo.ruolo === "admin" ? "Tutti i team" : "Il mio team"} · questa settimana</h2>
          {team.length === 0 ? <p className="aa-nota">Nessun collaboratore.</p> : (
            <div className="aa-scorri">
              <table className="aa-tabella">
                <thead><tr><th>Collaboratore</th><th>Giorni compilati</th><th>Contatti</th><th>Obiettivo</th><th>Appuntamenti</th><th>Incarichi</th><th>Proposte</th><th>Ore</th></tr></thead>
                <tbody>
                  {team.map((t) => {
                    const ob = calcolaObiettivi(t.obiettivo_annuo ? t : {}).giorno.contatti * giorniSett;
                    return (
                      <tr key={t.user_id}>
                        <td>{t.nome || "—"}{profilo.ruolo === "admin" && t.team ? <small> · {t.team}</small> : null}</td>
                        <td>{t.giorni}/{giorniSett}</td>
                        <td>{t.contatti}<Barra valore={t.contatti} obiettivo={ob} /></td>
                        <td>{ob}</td>
                        <td>{t.appuntamenti}</td><td>{t.incarichi}</td><td>{t.proposte}</td><td>{uno(t.ore)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}
