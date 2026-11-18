// Anteprima del link per agente (18/11/2026).
// WhatsApp, Facebook ecc. leggono solo i meta tag dell'HTML (non eseguono JavaScript), quindi il link
// /resta-informato?a=rausa mostrava sempre "Nicola Nigido". Qui, dopo la build, si crea una copia della
// pagina per ogni agente (dist/resta-informato/a/<codice>.html) con titolo e anteprima a suo nome;
// vercel.json la serve quando c'è ?a=<codice>. La pagina normale è pagina.html (non index.html): con index.html Vercel la serviva direttamente e ignorava la regola per agente. L'elenco agenti è letto da AGENTI dentro la pagina stessa.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const src = "dist/resta-informato/pagina.html";
const html = readFileSync(src, "utf8");
const blocco = html.match(/var AGENTI=\{([\s\S]*?)\n\s*\};/);
if (!blocco) throw new Error("AGENTI non trovato in resta-informato/pagina.html");
const agenti = [...blocco[1].matchAll(/^\s*([a-z]+):\{nome:"([^"]+)"/gm)].map((m) => ({ codice: m[1], nome: m[2] }));
if (agenti.length < 5) throw new Error(`Trovati solo ${agenti.length} agenti`);

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
mkdirSync("dist/resta-informato/a", { recursive: true });
for (const { codice, nome } of agenti) {
  const n = esc(nome);
  const out = html
    .replace(/<title>[^<]*<\/title>/, `<title>Restiamo in contatto · ${n} | FC Punto Hub Napoli</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1Ricevi gratis HUB 24, il settimanale su casa, mutui, affitti e mercato di Napoli, e le opportunità selezionate da ${n} e FC Punto Hub.$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1Restiamo in contatto · ${n}, FC Punto Hub$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1https://www.fondocasahub.com/resta-informato?a=${codice}$2`);
  if (!out.includes(`· ${n}, FC Punto Hub`)) throw new Error(`Anteprima non sostituita per ${codice}`);
  writeFileSync(`dist/resta-informato/a/${codice}.html`, out);
}
console.log(`resta-informato: ${agenti.length} anteprime agente create`);
