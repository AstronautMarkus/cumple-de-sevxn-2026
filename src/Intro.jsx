import { useEffect, useState } from "react";
import Dialog from "./Dialog.jsx";
import { unlockAudio } from "./sfx.js";
import intro from "./data/intro.json";

const FADE = 1000;

// Black screen + the intro story; the first tap is needed so the browser allows sound
export default function Intro({ onDone }) {
  const [started, setStarted] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const start = () => {
    unlockAudio();
    setStarted(true);
  };

  useEffect(() => {
    if (started) return;
    const onKey = (e) => ["z", "enter", " "].includes(e.key.toLowerCase()) && start();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [started]);

  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onDone, FADE);
  };

  return (
    <div className={`intro${leaving ? " leaving" : ""}`}>
      {started ? (
        <Dialog lines={intro} face="bakebake" onDone={finish} />
      ) : (
        <p className="press" onPointerDown={start}>[ toca o presiona Z ]</p>
      )}
    </div>
  );
}
