import { useEffect, useRef, useState } from "react";
import { IMG } from "./images.js";
import { blip, boom, squeak, unlockAudio } from "./sfx.js";
import Burst from "./Burst.jsx";

// Undertale-style dialog. Each line in the JSON:
//   text            what is said ("\n" breaks the line)
//   speed           ms per character (default 40)
//   face            portrait from src/img, sticks until another line changes it
//   show            big item over the screen from src/img, sticks until "show": null
//   shake: true     portrait rattles on this line
//   fx              "flash" | "red" | "hit" | "explode", fires when the line starts
//   choices         ["Sí", "No"]: Undertale-style options once the text is out, picked with the heart
//   cancel          the choice that ends the dialog early, onDone("cancel"); any other choice continues

const SPEED = 40;
const PAUSE = 250; // extra wait after punctuation, like Undertale
// Blip pitch per face: [base Hz, random jitter]; the attacker's voice is all over the place
const VOICES = { bakebake: [260, 30], tux: [190, 20], atacante: [90, 300] };

const SHAKE = [
  { transform: "translate(0, 0)" },
  { transform: "translate(-10px, 6px)" },
  { transform: "translate(9px, -7px)" },
  { transform: "translate(-6px, -4px)" },
  { transform: "translate(5px, 5px)" },
  { transform: "translate(0, 0)" },
];

export default function Dialog({ lines, face: defaultFace = "tux", onDone }) {
  const [line, setLine] = useState(0);
  const [shown, setShown] = useState(0);
  const [pick, setPick] = useState(0);
  const canvas = useRef(null);
  const box = useRef(null);

  const stickyAt = (key) => lines.slice(0, line + 1).findLast((l) => key in l)?.[key];
  const { text, speed = SPEED, fx, choices, cancel } = lines[line];
  const typing = shown < text.length;
  const choosing = choices && !typing;
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const face = stickyAt("face") ?? defaultFace;
  const item = stickyAt("show");
  const shake = lines[line].shake && !calm;

  // A button clicked to open this dialog keeps focus, and Space would click it again behind the chatbox
  useEffect(() => document.activeElement?.blur(), []);

  // Every fx shakes and flashes (color per fx in style.css)
  useEffect(() => {
    if (!fx || calm) return;
    box.current?.animate(SHAKE, { duration: fx === "explode" ? 500 : 300 });
    if (fx === "explode") boom();
    if (fx === "hit") squeak();
  }, [line]);

  // Typewriter
  useEffect(() => {
    if (!typing) return;
    const prev = text[shown - 1];
    const delay = speed + (prev && ".,!?".includes(prev) ? PAUSE : 0);
    const t = setTimeout(() => {
      if (text[shown].trim()) blip(VOICES[face]);
      setShown((s) => s + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [typing, shown, text, speed, face]);

  const next = () => {
    if (line < lines.length - 1) {
      setLine(line + 1);
      setShown(0);
      setPick(0);
    } else {
      onDone();
    }
  };

  const choose = (i) => (choices[i] === cancel ? onDone("cancel") : next());

  const advance = () => {
    unlockAudio();
    if (typing) setShown(text.length);
    else if (choosing) choose(pick);
    else next();
  };

  const move = (step) => {
    setPick((p) => (p + step + choices.length) % choices.length);
    blip(VOICES[face]);
  };

  // Z / Enter / Space advance, X / Shift skip the current line
  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === "z" || k === "enter" || k === " ") {
        e.preventDefault();
        advance();
      } else if ((k === "x" || k === "shift") && typing) setShown(text.length);
      else if (choosing && (k === "arrowleft" || k === "arrowup")) move(-1);
      else if (choosing && (k === "arrowright" || k === "arrowdown")) move(1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  // GIFs can't be paused: grab the first frame into a canvas and show it when silent
  const freeze = (e) => {
    const img = e.currentTarget;
    const c = canvas.current;
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0);
  };

  return (
    <div className="dialog-layer" onPointerDown={choosing ? undefined : advance}>
      {IMG[item] && (
        <img key={item} src={IMG[item]} alt="" className={`item ${item}${calm ? "" : " jitter"}`} />
      )}
      <div className="chatbox" ref={box} role="dialog" aria-live="polite">
        <div className={`portrait${shake ? " shake" : ""}`}>
          {IMG[face] ? (
            <>
              <img src={IMG[face]} alt="" onLoad={freeze} hidden={!typing} />
              <canvas ref={canvas} hidden={typing} aria-hidden="true" />
            </>
          ) : (
            <div className="noface">?</div>
          )}
        </div>
        <div className="dialog-body">
          <p className="dialog">
            <span className="star">*</span>
            <span className="text">{text.slice(0, shown)}</span>
          </p>
          {choosing && (
            <div className="choices">
              {choices.map((c, i) => (
                <button
                  key={c}
                  className={i === pick ? "on" : ""}
                  onPointerEnter={() => setPick(i)}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    choose(i);
                  }}
                >
                  <span className="soul" aria-hidden="true">{i === pick ? "❤" : ""}</span>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {fx && !calm && <div key={`f${line}`} className={`flash ${fx}`} />}
      {fx === "explode" && !calm && <Burst key={`b${line}`} />}
    </div>
  );
}
