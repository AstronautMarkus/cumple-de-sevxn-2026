import { useEffect, useRef } from "react";

const COLORS = ["#ff2a3d", "#d10a1e", "#ffffff", "#ff8fa3", "#8b0000"];

// One-shot explosion of hearts and confetti from the center of the screen
export default function Burst() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.6;

    const parts = Array.from({ length: 220 }, () => {
      const a = Math.random() * Math.PI * 2;
      const v = 4 + Math.random() * 12;
      return {
        x: cx, y: cy,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4,
        size: 6 + Math.random() * 14,
        spin: Math.random() * 6, rot: 0,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        heart: Math.random() < 0.35,
        life: 1,
      };
    });

    let frame;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of parts) {
        if (p.life <= 0) continue;
        alive = true;
        p.vy += 0.25;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.spin * 0.02;
        p.life -= 0.008;
        ctx.save();
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.heart) {
          ctx.font = `${p.size * 1.6}px serif`;
          ctx.fillText("♥", 0, 0);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      if (alive) frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas className="burst" ref={ref} aria-hidden="true" />;
}
