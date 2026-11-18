import React from "react";
import { VIDEO_FORMAZIONE } from "./formazione.js";

// Area agenti › Social › Formazione e metodi: i video del Marketing su come si lavora, uno sotto l'altro (elenco in
// formazione.js). Con «dentro» è una scheda di Social e non ha l'intestazione sua.
export default function Formazione({ vai, dentro }) {
  return (
    <>
      {dentro ? (
        <p className="aa-nota">Video brevi su come lavoriamo insieme. Guardali quando ti servono.</p>
      ) : (
        <div className="aa-intestazione">
          <p className="aa-occhiello">Marketing</p>
          <h1 className="aa-titolo">Formazione e metodi</h1>
          <p className="aa-sottotitolo">Video brevi su come lavoriamo insieme. Guardali quando ti servono.</p>
        </div>
      )}
      {VIDEO_FORMAZIONE.map((v) => (
        <section key={v.id} id={`video-${v.id}`} className="aa-card fm-video">
          <video className={`fm-player${v.verticale ? " fm-verticale" : ""}`} src={v.video} poster={v.copertina}
            controls playsInline preload="none" />
          <div className="fm-testo">
            <p className="cp-lettera">Video {v.n} · {v.durata}</p>
            <h2 className="aa-h2">{v.titolo}</h2>
            <p className="aa-nota">{v.testo}</p>
            {v.apri && <button className="aa-link" onClick={() => vai(v.apri.pagina)}>{v.apri.testo} →</button>}
          </div>
        </section>
      ))}
    </>
  );
}
