import { useState } from "react";
import Intro from "./Intro.jsx";
import House from "./House.jsx";

const KEY = "sev-intro-seen";

// sessionStorage can throw in private mode / blocked storage; then the intro just replays
function seen() {
  try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; }
}

export default function App() {
  const [introDone, setIntroDone] = useState(seen);
  // the welcome dialog only plays right after the intro, not on reloads
  const [welcome, setWelcome] = useState(false);

  const finish = () => {
    try { sessionStorage.setItem(KEY, "1"); } catch {}
    setWelcome(true);
    setIntroDone(true);
  };

  return introDone ? <div className="fade-in"><House welcome={welcome} /></div> : <Intro onDone={finish} />;
}
