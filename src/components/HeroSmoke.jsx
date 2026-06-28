"use client";

import { useRef, useState } from "react";

export default function HeroSmoke({ children }) {
  const [puffs, setPuffs] = useState([]);
  const lastEmitRef = useRef(0);
  const puffIdRef = useRef(0);

  const handlePointerMove = (event) => {
    const now = window.performance.now();
    if (now - lastEmitRef.current < 80) return;
    lastEmitRef.current = now;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    const nextPuffs = Array.from({ length: 2 }, () => ({
      id: puffIdRef.current++,
      x: x + (Math.random() - 0.5) * 26,
      y: y + (Math.random() - 0.5) * 26,
      size: 72 + Math.random() * 72,
      driftX: (Math.random() - 0.5) * 76,
      driftY: -24 - Math.random() * 44,
      duration: 1400 + Math.random() * 700,
    }));

    setPuffs((current) => [...current.slice(-36), ...nextPuffs]);
    window.setTimeout(() => {
      setPuffs((current) => current.filter((item) => !nextPuffs.some((puff) => puff.id === item.id)));
    }, 2300);
  };

  return (
    <section className="pace-hero smoke-field relative overflow-hidden text-white" onPointerMove={handlePointerMove}>
      {puffs.map((puff) => (
        <span
          aria-hidden="true"
          className="smoke-puff"
          key={puff.id}
          style={{
            "--drift-x": `${puff.driftX}px`,
            "--drift-y": `${puff.driftY}px`,
            animationDuration: `${puff.duration}ms`,
            height: `${puff.size}px`,
            left: puff.x,
            top: puff.y,
            width: `${puff.size}px`,
          }}
        />
      ))}
      <div className="relative z-10">{children}</div>
    </section>
  );
}