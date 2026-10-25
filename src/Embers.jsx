import { useEffect, useRef } from "react";

// Rising embers, like the red particles on his Steam background
export default function Embers() {
  const ref = useRef(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    };
    const spawn = () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.6,
      vy: Math.random() * 0.8 + 0.3,
      drift: Math.random() * 2 * Math.PI,
    });

    resize();
    addEventListener("resize", resize);
    const embers = Array.from({ length: 90 }, spawn);
    let frame;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const e of embers) {
        e.y -= e.vy;
        e.drift += 0.02;
        e.x += Math.sin(e.drift) * 0.4;
        if (e.y < -10) Object.assign(e, spawn(), { y: canvas.height + 10 });
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${30 + e.r * 20}, 40, ${0.4 + e.r / 5})`;
        ctx.shadowColor = "#ff2a3d";
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      frame = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
    };
  }, []);

  return <canvas id="embers" ref={ref} aria-hidden="true" />;
}
