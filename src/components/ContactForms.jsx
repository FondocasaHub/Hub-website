import { useState } from "react";

const NAVY = "#0A1F3D";
const NAVY_DEEP = "#061229";
const GOLD = "#C19A5B";
const GOLD_BRIGHT = "#D4B27A";
const CREAM = "#F5EFE4";

// Make.com Webhooks (Brevo Integration)
const WEBHOOK_VENDITORI = "https://hook.eu1.make.com/vxi6kpwrhgfruxdf9bddsy7gjf5apxy8";    // Vendi + Cerca
const WEBHOOK_CREDITO = "https://hook.eu1.make.com/h4ao1l1gmh9v3yhx8kb4mdoj3gve87t9";      // Mutuo + Lavora

const CATEGORIE = [
  { id: "vendi",  label: "Vendi casa",      icon: "🏠", endpoint: WEBHOOK_VENDITORI },
  { id: "cerca",  label: "Cerca casa",       icon: "🔍", endpoint: WEBHOOK_VENDITORI },
  { id: "mutuo",  label: "Mutuo & Credito",  icon: "💼", endpoint: WEBHOOK_CREDITO },
  { id: "lavora", label: "Lavora con noi",   icon: "🤝", endpoint: WEBHOOK_CREDITO },
];

const EMPTY_FORM = { nome: "", email: "", telefono: "", note: "", budget: "", mq: "", indirizzo: "", privacy: false };

export default function ContactForms() {
  const [active, setActive] = useState(null); // id categoria aperta
  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const categoria = CATEGORIE.find(c => c.id === active);

  const open = (id) => {
    setActive(id);
    setForm(EMPTY_FORM);
    setSent(false);
    setError("");
  };

  const close = () => {
    setActive(null);
    setSent(false);
    setError("");
  };

  const canSend = form.nome && form.email && form.telefono && form.privacy && !sending;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!canSend) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(categoria.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          categoria: categoria.label,
          nome:      form.nome,
          email:     form.email,
          telefono:  form.telefono,
          note:      form.note || "—",
          budget:    form.budget || "—",
          mq:        form.mq || "—",
          indirizzo_immobile: form.indirizzo || "—",
          _subject:  `${categoria.label} – HUB Napoli`,
          _replyto:  form.email,
        }),
      });
      if (!res.ok) throw new Error("Errore nell'invio del form");
      // Conferma email al cliente via Make.com
      fetch("https://hook.eu1.make.com/7ba2bowjarz6hdebo19si4ekkeiuukjm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.nome, email: form.email, categoria: categoria.label }),
      }).catch(() => {});
      setSent(true);
      if (window.fbq) window.fbq("track", "Lead");
    } catch (err) {
      setError("Errore nell'invio. Riprova o scrivici direttamente.");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <section style={{ background: NAVY, padding: "80px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Titolo sezione */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{
            display: "inline-block", padding: "6px 14px",
            background: "rgba(193,154,91,0.15)", color: GOLD,
            border: "1px solid rgba(193,154,91,0.3)",
            fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500,
            marginBottom: 16,
          }}>Come possiamo aiutarti?</span>
          <h2 className="serif" style={{ color: CREAM, fontSize: "2.2rem", fontWeight: 700, margin: 0 }}>
            Scegli il tuo percorso
          </h2>
        </div>

        {/* 4 pulsanti */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16, marginBottom: 40,
        }}>
          {CATEGORIE.map((c) => (
            <button
              key={c.id}
              onClick={() => open(c.id)}
              style={{
                padding: "28px 16px",
                background: active === c.id
                  ? `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_BRIGHT} 100%)`
                  : "rgba(255,255,255,0.04)",
                color: active === c.id ? NAVY_DEEP : CREAM,
                border: `1px solid ${active === c.id ? GOLD : "rgba(193,154,91,0.25)"}`,
                borderRadius: 6, cursor: "pointer",
                fontSize: 15, fontWeight: 600, letterSpacing: 0.3,
                fontFamily: "'Jost', sans-serif",
                transition: "all 0.25s",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 10,
              }}
              onMouseEnter={e => {
                if (active !== c.id) {
                  e.currentTarget.style.borderColor = GOLD;
                  e.currentTarget.style.background = "rgba(193,154,91,0.1)";
                }
              }}
              onMouseLeave={e => {
                if (active !== c.id) {
                  e.currentTarget.style.borderColor = "rgba(193,154,91,0.25)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }
              }}
            >
              <span style={{ fontSize: 28 }}>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* Form modale inline */}
        {active && (
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid rgba(193,154,91,0.3)`,
            borderRadius: 8, padding: "40px 36px",
            animation: "fadeUp 0.3s ease",
          }}>
            {!sent ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                  <h3 className="serif" style={{ color: CREAM, fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
                    {categoria.icon} {categoria.label}
                  </h3>
                  <button onClick={close} style={{
                    background: "none", border: "none", color: GOLD,
                    fontSize: 24, cursor: "pointer", lineHeight: 1,
                  }}>×</button>
                </div>

                <form onSubmit={handleSend}>
                  {/* Campo nascosto categoria per Make.com */}
                  <input type="hidden" name="categoria" value={categoria.label} />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <input
                      className="input-field"
                      placeholder="Nome e Cognome *"
                      value={form.nome}
                      onChange={set("nome")}
                      required
                    />
                    <input
                      className="input-field"
                      placeholder="Telefono *"
                      type="tel"
                      value={form.telefono}
                      onChange={set("telefono")}
                      required
                    />
                  </div>

                  <input
                    className="input-field"
                    placeholder="Email *"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    required
                    style={{ marginBottom: 16 }}
                  />

                  {active === "vendi" ? (
            <>
              <input
                className="input-field"
                placeholder="Mq immobile *"
                type="number"
                min="1"
                value={form.mq}
                onChange={set("mq")}
                required
                style={{ marginBottom: 16 }}
              />
              <input
                className="input-field"
                placeholder="Indirizzo immobile *"
                value={form.indirizzo}
                onChange={set("indirizzo")}
                required
                style={{ marginBottom: 16 }}
              />
            </>
          ) : (
            <input
                    className="input-field"
                    placeholder="Budget / Importo (opzionale)"
                    value={form.budget}
                    onChange={set("budget")}
                    style={{ marginBottom: 16 }}
                  />
          )}

                  <textarea
                    className="input-field"
                    placeholder="Note aggiuntive (opzionale)"
                    rows={3}
                    value={form.note}
                    onChange={set("note")}
                    style={{ resize: "vertical", marginBottom: 20 }}
                  />

                  <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginBottom: 24 }}>
                    <input
                      type="checkbox"
                      checked={form.privacy}
                      onChange={set("privacy")}
                      required
                      style={{ marginTop: 3, accentColor: GOLD, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 13, color: "rgba(245,239,228,0.65)", lineHeight: 1.5 }}>
                      Acconsento al trattamento dei miei dati personali ai sensi del GDPR per essere ricontattato da FondoCasa Hub. *
                    </span>
                  </label>

                  {error && (
                    <div style={{ color: "#e07070", fontSize: 13, marginBottom: 16 }}>{error}</div>
                  )}

                  <button
                    type="submit"
                    disabled={!canSend}
                    className="btn-gold"
                    style={{
                      width: "100%", padding: "16px",
                      borderRadius: 4, border: "none",
                      cursor: canSend ? "pointer" : "not-allowed",
                      fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase",
                      opacity: canSend ? 1 : 0.5, transition: "opacity 0.2s",
                    }}
                  >
                    {sending ? "Invio in corso…" : "Invia richiesta →"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 className="serif" style={{ color: GOLD, fontSize: "1.8rem", fontWeight: 700, marginBottom: 12 }}>
                  Richiesta inviata!
                </h3>
                <p style={{ color: "rgba(245,239,228,0.75)", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                  Grazie {form.nome.split(" ")[0]}! Ti ricontatteremo entro <strong style={{ color: CREAM }}>24-48 ore</strong>.
                </p>
                <button onClick={close} className="btn-outline" style={{
                  padding: "12px 32px", borderRadius: 4, cursor: "pointer",
                  fontSize: 13, letterSpacing: 1.2, textTransform: "uppercase",
                }}>
                  Chiudi
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
