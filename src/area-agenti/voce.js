// Voce di Chirone: riconoscimento vocale (agente) e sintesi vocale (Chirone) con le API del browser.
// Nessun costo e nessuna chiave: Chrome, Edge e Safari le offrono già. Firefox non ha il riconoscimento.

export function supportoVoce() {
  if (typeof window === "undefined") return { ascolto: false, parlato: false };
  return {
    ascolto: Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    parlato: "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function",
  };
}

// Toglie dal testo tutto quello che non va letto ad alta voce.
export function testoParlato(testo) {
  return String(testo || "")
    .split("\n")
    .filter((r) => !/^\W*font[ei]\W*:/i.test(r.trim()))
    .join("\n")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\*\*|__|[*_`#>]/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/^\s*(\d+)[.)]\s+/gm, "$1. ")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .replace(/[«»“”"]/g, "")
    .replace(/([.!?:;])\s*\n+\s*/g, "$1 ")
    .replace(/\s*\n+\s*/g, ". ")
    .replace(/(\.\s*){2,}/g, ". ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Preferisce una voce italiana di buona qualità, se il dispositivo ne ha una.
export function scegliVoce(voci) {
  const it = (voci || []).filter((v) => /^it(-|_|$)/i.test(v.lang));
  const preferite = [/google/i, /federica|alice|luca|elsa|diego|isabella/i, /premium|enhanced|natural/i];
  for (const regola of preferite) {
    const v = it.find((x) => regola.test(x.name));
    if (v) return v;
  }
  return it[0] || null;
}

export function creaRiconoscimento() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = "it-IT";
  r.interimResults = true;
  r.continuous = false;
  r.maxAlternatives = 1;
  return r;
}
