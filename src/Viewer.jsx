import { useEffect, useRef, useState } from "react";
import { IMG } from "./images.js";

// A memory opened big: drag it around, close with ×, Esc or tapping outside
export default function Viewer({ item, onClose }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [onClose]);

  const grab = (e) => {
    drag.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => drag.current && setPos({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
  const drop = () => (drag.current = null);

  return (
    <div className="viewer" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <figure
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        onPointerDown={grab}
        onPointerMove={move}
        onPointerUp={drop}
        onPointerCancel={drop}
      >
        <button className="close" onPointerDown={(e) => e.stopPropagation()} onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        {IMG[item.img] ? <img src={IMG[item.img]} alt={item.caption} draggable={false} /> : <div className="noface">?</div>}
        <figcaption>{item.caption}</figcaption>
      </figure>
    </div>
  );
}
