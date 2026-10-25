import { useEffect, useState } from "react";
import Dialog from "./Dialog.jsx";
import { playSong, unlockAudio } from "./sfx.js";

// Level = the age he turns this birthday season (born 25 Oct 2007)
// shortcut: from October on counts this year's birthday, before that last year's
const now = new Date();
const LEVEL = now.getFullYear() - 2007 - (now.getMonth() < 9 ? 1 : 0);

// Lights off, cake, the song with karaoke lyrics, blow the candles, final words
// phases: "song" -> "blow" -> "words" -> "done" -> (20 s later) rickroll. It never closes on purpose.
const RICKROLL_AFTER = 20000;

export default function Finale({ lyrics, final }) {
  const [phase, setPhase] = useState("song");
  const [sung, setSung] = useState(-1);

  useEffect(() => {
    const { starts, length, stop } = playSong();
    const timers = starts.map((s, i) => setTimeout(() => setSung(i), s * 1000));
    timers.push(setTimeout(() => setPhase("blow"), length * 1000 + 600));
    return () => {
      timers.forEach(clearTimeout);
      stop();
    };
  }, []);

  const [rolled, setRolled] = useState(false);
  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => setRolled(true), RICKROLL_AFTER);
    return () => clearTimeout(t);
  }, [phase]);

  const blow = () => {
    if (phase !== "blow") return;
    unlockAudio();
    setPhase("words");
  };

  const lit = phase === "song" || phase === "blow";

  return (
    <div className={`finale ${phase}`}>
      <p className="lyric" aria-live="polite">{phase === "song" ? lyrics[sung] ?? "" : ""}</p>

      <button className="cake" onClick={blow} disabled={phase !== "blow"} aria-label="Soplar las velas">
        <span className="candles">
          {String(LEVEL).split("").map((d, i) => (
            <span key={i} className="candle">
              <i className={lit ? "flame" : "smoke"} />
              {d}
            </span>
          ))}
        </span>
        <span className="tier top" />
        <span className="tier bottom" />
        <span className="plate" />
      </button>

      {phase === "blow" && <p className="hint-blow">Pide un deseo... y toca la torta para soplar las velas</p>}

      {phase === "done" && (
        <div className="the-end">
          <h1>Feliz cumpleaños, Sev</h1>
          <p className="lvl">
            Nivel {LEVEL - 1} → <b>{LEVEL}</b> · LEVEL UP
          </p>
        </div>
      )}

      {phase === "words" && <Dialog lines={final} onDone={() => setPhase("done")} />}

      {rolled && (
        <iframe
          className="rickroll"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0&rel=0"
          title="Never Gonna Give You Up"
          allow="autoplay; encrypted-media"
        />
      )}
    </div>
  );
}
