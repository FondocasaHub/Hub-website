// Cancello giornaliero (deciso da Nicola il 7/11/2026): agenti, buyer e consulenti del credito (anche i veterani, con i compiti di routine.js)
// devono confermare ogni mattina il briefing di Chirone e completare i compiti del giorno prima,
// altrimenti l'area resta bloccata finché non li completano o il Team Manager non li sblocca.
// Usato dall'Area Agenti e da /api/assistente (Chirone). Nessuna dipendenza da React.
import { piuGiorni, calcolaObiettivi } from "./produttivita.js";
import { compitiArretrati, compitiDelGiorno, contattiAttesi, giorniPercorso } from "./percorsi.js";
import { TIPI_ROUTINE, tipoRoutine, compitiRoutine, routineFatta } from "./routine.js";

// Prima data controllata: il primo giorno di cancello è lunedì 9/11, il primo blocco possibile martedì 10/11.
export const DATA_ATTIVAZIONE = "2026-11-09";
export const RUOLI_CANCELLO = ["agente", "credito"];
export const soggettoCancello = (p) => Boolean(p && RUOLI_CANCELLO.includes(p.ruolo));

// Con il blocco restano aperti: La mia giornata (compiti e diario), Istruzioni (manuali), CRM (Vendilo), Documenti (deciso da Nicola il 7/11),
// strumenti di Produttività (servono per i compiti) e Chirone.
export const PAGINE_APERTE = ["giornata", "istruzioni", "crm", "documenti", "produttivita"];

export const ORIGINI = { coaching: "Compito del coaching", manager: "Compito del Team Manager", chirone: "Compito di Chirone" };
export const ASSENZE = { ferie: "Ferie", malattia: "Malattia", permesso: "Permesso", altro: "Altra assenza giustificata" };

const GIORNI = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
const MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
export function dataBreve(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${GIORNI[d.getUTCDay()]} ${d.getUTCDate()} ${MESI[d.getUTCMonth()]}`;
}

// Pasqua (calendario gregoriano) per calcolare Pasquetta.
function pasqua(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mese = Math.floor((h + l - 7 * m + 114) / 31), giorno = ((h + l - 7 * m + 114) % 31) + 1;
  return `${y}-${String(mese).padStart(2, "0")}-${String(giorno).padStart(2, "0")}`;
}
// Festività nazionali + San Gennaro (patrono di Napoli, 19 settembre).
const FISSE = ["01-01", "01-06", "04-25", "05-01", "06-02", "08-15", "09-19", "11-01", "12-08", "12-25", "12-26"];
export function festivo(iso) {
  return FISSE.includes(iso.slice(5)) || iso === piuGiorni(pasqua(Number(iso.slice(0, 4))), 1);
}
export function giornoLavorativo(iso, assenze = new Set()) {
  const g = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return g >= 1 && g <= 5 && !festivo(iso) && !assenze.has(iso);
}
// Venerdì della settimana (o del lunedì successivo se è weekend): scadenza dei compiti del coaching.
export function venerdi(iso) {
  const g = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return piuGiorni(iso, g === 6 ? 6 : g === 0 ? 5 : 5 - g);
}

// Obiettivo contatti di una data: percorso (rampa), credito 40 (20 + 10 + 10), altrimenti il calcolatore.
export function obiettivoContatti(profilo, percorso, obiettivi, data) {
  if (percorso) {
    const { lav, cal } = giorniPercorso(percorso.data_inizio, data);
    if (lav >= 1 && cal <= 90) return contattiAttesi(percorso.tipo, lav);
  }
  if (profilo.ruolo === "credito") return 40;
  return calcolaObiettivi(obiettivi || {}).giorno.contatti;
}

// Stato del cancello di un collaboratore a partire dai dati già letti.
export function statoCancello({ profilo, oggi, presenze = [], diari = [], percorso = null, compiti = [] }) {
  const inizio = [DATA_ATTIVAZIONE, String(profilo.creato_il || "").slice(0, 10)].sort().pop();
  const perData = Object.fromEntries(presenze.map((r) => [r.data, r]));
  const assenze = new Set(presenze.filter((r) => r.assenza).map((r) => r.data));
  const oggiP = perData[oggi] || null;
  const lavorativoOggi = oggi >= DATA_ATTIVAZIONE && giornoLavorativo(oggi, assenze);

  let precedente = null;
  for (let k = 1; k <= 20; k++) {
    const d = piuGiorni(oggi, -k);
    if (d < inizio) break;
    if (giornoLavorativo(d, assenze)) { precedente = d; break; }
  }

  const mancanze = [];
  let diarioPrecedente = null;
  if (precedente) {
    if (!perData[precedente]?.briefing_il) {
      mancanze.push({ tipo: "presenza", data: precedente, soloTM: true,
        testo: `${dataBreve(precedente)}: non hai aperto l'area riservata né confermato il briefing del mattino. Ti può sbloccare solo il Team Manager.` });
    }
    diarioPrecedente = diari.find((x) => x.data === precedente) || null;
    if (!diarioPrecedente || (Number(diarioPrecedente.contatti) || 0) + (Number(diarioPrecedente.ore) || 0) === 0) {
      mancanze.push({ tipo: "diario", data: precedente,
        testo: `Diario di ${dataBreve(precedente)} non compilato: in "La mia giornata" torna a ${dataBreve(precedente)} e inserisci contatti, numeri e ore.` });
    }
  }
  // Veterani (nessun percorso in corso): compiti giornalieri della routine.
  const tipo = tipoRoutine(profilo);
  if (!percorso && precedente) {
    for (const c of compitiRoutine(tipo, precedente)) {
      if (!routineFatta(diarioPrecedente, c.chiave)) {
        mancanze.push({ tipo: "routine", data: precedente, chiave: c.chiave,
          testo: `Compiti di ${dataBreve(precedente)} (${c.blocco.replace(/^\S+\s/, "")}): ${c.testo}. Spuntalo in "La mia giornata".` });
      }
    }
  }
  if (percorso) {
    for (const c of compitiArretrati(percorso, oggi)) {
      if (c.data >= inizio && giornoLavorativo(c.data, assenze)) {
        mancanze.push({ tipo: "percorso", data: c.data, chiave: c.chiave, testo: `Percorso di inserimento, ${dataBreve(c.data)}: ${c.testo}` });
      }
    }
  }
  for (const c of compiti) {
    if (c.scadenza < oggi) mancanze.push({ tipo: "compito", id: c.id, data: c.scadenza, testo: `${ORIGINI[c.origine] || "Compito"} scaduto ${dataBreve(c.scadenza)}: ${c.testo}` });
  }

  const sbloccato = Boolean(oggiP?.sblocco_il);
  return {
    oggi, inizio, lavorativoOggi, precedente, diarioPrecedente,
    briefing: Boolean(oggiP?.briefing_il), briefingIl: oggiP?.briefing_il || null,
    assenzaOggi: oggiP?.assenza || null,
    sbloccato, sbloccoMotivo: oggiP?.sblocco_motivo || "",
    mancanze, bloccato: lavorativoOggi && mancanze.length > 0 && !sbloccato,
    compiti, percorso,
    routine: percorso ? null : { tipo, nome: TIPI_ROUTINE[tipo], oggi: compitiRoutine(tipo, oggi) },
  };
}

// Legge i dati e calcola lo stato del cancello per uno o più collaboratori. Restituisce { [id]: stato }.
export async function caricaStati(supabase, profili, oggi) {
  if (!profili.length) return {};
  const ids = profili.map((p) => p.id);
  const dal = piuGiorni(oggi, -21);
  const [pres, diari, perc, comp] = await Promise.all([
    supabase.from("giornata_presenze").select("*").in("user_id", ids).gte("data", dal),
    supabase.from("produttivita_giorno").select("user_id, data, contatti, ore, routine").in("user_id", ids).gte("data", dal),
    supabase.from("percorsi_inserimento").select("*").in("user_id", ids).eq("stato", "in corso"),
    supabase.from("compiti_assegnati").select("*").in("user_id", ids).is("fatto_il", null).eq("annullato", false).order("scadenza"),
  ]);
  for (const r of [pres, diari, perc, comp]) if (r.error) throw new Error(r.error.message);
  const out = {};
  for (const p of profili) {
    out[p.id] = statoCancello({
      profilo: p, oggi,
      presenze: pres.data.filter((r) => r.user_id === p.id),
      diari: diari.data.filter((r) => r.user_id === p.id),
      percorso: perc.data.find((r) => r.user_id === p.id) || null,
      compiti: comp.data.filter((r) => r.user_id === p.id),
    });
  }
  return out;
}

// Compito correttivo di Chirone: se il giorno prima i contatti sono sotto obiettivo, oggi li recupera.
export function compitoCorrettivo(stato, obiettivo) {
  const d = stato.diarioPrecedente;
  if (!d || !obiettivo) return null;
  const fatti = Number(d.contatti) || 0;
  if (fatti >= obiettivo) return null;
  return `Recupera i contatti di ${dataBreve(stato.precedente)}: ne hai fatti ${fatti} su ${obiettivo}. Oggi aggiungi ${obiettivo - fatti} contatti al tuo obiettivo del giorno.`;
}

// Le voci del briefing del mattino (testo e lettura a voce).
export function vociBriefing({ profilo, stato, obiettivoOggi, allarmi = [] }) {
  const voci = [];
  const p = stato.percorso;
  if (p) {
    const { cal } = giorniPercorso(p.data_inizio, stato.oggi);
    const oggiC = compitiDelGiorno(p.tipo, p.data_inizio, stato.oggi);
    if (cal >= 1 && cal <= 90) voci.push({ titolo: `Percorso di inserimento · giorno ${cal} di 90`, righe: oggiC.length ? oggiC.map((c) => `${c.blocco}: ${c.testo}`) : ["Oggi nessun compito del percorso."] });
  }
  if (stato.routine?.oggi.length) {
    voci.push({ titolo: `I tuoi compiti di oggi · ${stato.routine.nome}`, righe: stato.routine.oggi.map((c) => `${c.blocco.replace(/^\S+\s/, "")}: ${c.testo}`) });
  }
  const aperti = stato.compiti.filter((c) => c.scadenza >= stato.oggi);
  if (aperti.length) voci.push({ titolo: "Compiti assegnati", righe: aperti.map((c) => `${ORIGINI[c.origine]} (entro ${dataBreve(c.scadenza)}): ${c.testo}`) });
  if (obiettivoOggi) voci.push({ titolo: "Numeri di oggi", righe: [`Obiettivo contatti: ${obiettivoOggi}.`, "Segna i contatti in \"La mia giornata\" durante il giorno e aggiorna Vendilo entro le 19:00."] });
  if (allarmi.length) voci.push({ titolo: "Attenzione", righe: allarmi.map((a) => a.testo), rosso: allarmi.some((a) => a.grave) });
  if (stato.mancanze.length) voci.push({ titolo: "Da completare prima di tutto", righe: stato.mancanze.map((m) => m.testo), rosso: true });
  voci.push({ titolo: "Stasera", righe: ["Compila il diario della giornata e spunta i compiti fatti: domani, se manca qualcosa, l'area resta bloccata finché non completi."] });
  return voci;
}

// Riepilogo per Chirone.
export function riepilogoCancello(stato) {
  const righe = [];
  righe.push(stato.lavorativoOggi
    ? `Briefing di oggi: ${stato.briefing ? "confermato" : "NON ancora confermato"}.`
    : `Oggi non è un giorno lavorativo${stato.assenzaOggi ? ` (${ASSENZE[stato.assenzaOggi] || stato.assenzaOggi})` : ""}: nessun obbligo.`);
  if (stato.bloccato) righe.push(`AREA BLOCCATA: per sbloccarla deve completare: ${stato.mancanze.map((m) => m.testo).join(" | ")}`);
  else if (stato.sbloccato) righe.push(`Sbloccato oggi dal Team Manager (motivo: ${stato.sbloccoMotivo}). Restano da completare: ${stato.mancanze.map((m) => m.testo).join(" | ") || "niente"}.`);
  else righe.push("Nessun compito arretrato: è in regola.");
  if (stato.routine?.oggi.length) righe.push(`Compiti giornalieri di oggi (${stato.routine.nome}): ${stato.routine.oggi.map((c) => c.testo).join(" | ")}`);
  const aperti = stato.compiti.filter((c) => c.scadenza >= stato.oggi);
  if (aperti.length) righe.push(`Compiti assegnati aperti: ${aperti.map((c) => `${ORIGINI[c.origine]} entro ${c.scadenza}: ${c.testo}`).join(" | ")}`);
  return righe;
}
