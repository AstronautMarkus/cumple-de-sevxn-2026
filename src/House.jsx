import { useState } from "react";
import Embers from "./Embers.jsx";
import Dialog from "./Dialog.jsx";
import Viewer from "./Viewer.jsx";
import Finale from "./Finale.jsx";
import { IMG } from "./images.js";
import { unlockAudio } from "./sfx.js";
import house from "./data/house.json";

const { items } = house;
// Frames wrap across the wall, each with a fixed little tilt so it looks hung by hand
const TILT = [-3, 2, -1, 4, -2, 3, 1, -4];
const FLAGS = "FELIZ CUMPLE SEV".split("");
const BALLOONS = ["#d10a1e", "#f2ece4", "#8b0000", "#1a0507", "#ff2a3d"];

// Every frame gets the same area (in % of the gallery width) whatever its aspect ratio;
// together they cover ~a third of the wall, capped so 1-2 photos don't get huge
const SIZE = Math.min(22, 41 / Math.sqrt(items.length || 1));

// The frame takes the photo's real aspect ratio once it loads (CSS keeps the area constant)
const fitRatio = (e) => {
  const img = e.currentTarget;
  img.parentElement.style.setProperty("--ratio", img.naturalWidth / img.naturalHeight);
};

// each conversation gets its own id so the Dialog restarts from line 0
let talkId = 0;

// The party room: photos open in the Viewer and their "comment" plays when it closes;
// "Estoy listo" asks a few (too many) times and then the Finale sings
export default function House({ welcome }) {
  const [open, setOpen] = useState(null);
  // talk = { lines, after(result), id } while someone is speaking
  const [talk, setTalk] = useState(welcome ? { lines: house.welcome, id: 0 } : null);
  const [finale, setFinale] = useState(false);

  const say = (lines, after) => setTalk({ lines, after, id: ++talkId });

  const close = () => {
    // empty {"text": ""} placeholders are skipped, so unfinished photos just close quietly
    const lines = open.comment?.filter((l) => l.text) ?? [];
    if (lines.length) say(lines);
    setOpen(null);
  };

  const ready = () => {
    unlockAudio();
    say(house.ready, (result) => (result === "cancel" ? say(house.notReady) : setFinale(true)));
  };

  const endTalk = (result) => {
    setTalk(null);
    talk.after?.(result);
  };

  return (
    <div className="house">
      <Embers />
      <div className="grain" aria-hidden="true" />

      <div className="bunting" aria-hidden="true">
        {FLAGS.map((c, i) => (
          // --d sags the middle flags so the string hangs in a curve
          <span key={i} className={c === " " ? "gap" : ""} style={{ "--d": Math.sin((Math.PI * i) / (FLAGS.length - 1)) * 16 }}>
            {c}
          </span>
        ))}
      </div>
      <div className="balloons" aria-hidden="true">
        {BALLOONS.map((c, i) => <span key={i} style={{ "--c": c, "--i": i }} />)}
      </div>

      <h1 className="title">Nuestros mejores momentos</h1>

      <div className="gallery" style={{ "--size": `max(${SIZE}cqw, 110px)` }}>
        {items.map((it, i) => (
          <button
            key={i}
            className={`thing ${it.frame ?? (i % 2 ? "polaroid" : "frame")}`}
            style={{ "--rot": `${TILT[i % TILT.length]}deg` }}
            onClick={() => {
              unlockAudio();
              setOpen(it);
            }}
            aria-label={it.caption}
          >
            {IMG[it.img] ? <img src={IMG[it.img]} alt="" draggable={false} onLoad={fitRatio} /> : <div className="noface">?</div>}
          </button>
        ))}
      </div>

      {!finale && <button className="ready" onClick={ready}>Estoy listo</button>}

      {open && <Viewer item={open} onClose={close} />}
      {finale && <Finale lyrics={house.song} final={house.final} />}
      {talk && <Dialog key={talk.id} lines={talk.lines} onDone={endTalk} />}
    </div>
  );
}
