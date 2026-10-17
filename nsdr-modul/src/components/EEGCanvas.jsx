import React, { useEffect, useRef } from "react";
import { BANDS, WAVE_COMPONENTS, bandShares, dominantBand, traceColor } from "../lib/model.js";

// Feste Phasenlagen, damit Server- und Client-Render identisch bleiben.
const PHASE_OFFSETS = {
  beta: [0.3, 2.1, 4.4],
  alpha: [1.2, 3.7],
  theta: [0.8, 2.9],
  delta: [1.9, 5.1],
};

function sample(tau, shares) {
  let v = 0;
  for (const band of BANDS) {
    const { amp, freqs } = WAVE_COMPONENTS[band.id];
    const a = (amp * Math.sqrt(shares[band.id])) / Math.sqrt(freqs.length);
    freqs.forEach((f, k) => {
      v += a * Math.sin(2 * Math.PI * f * tau + PHASE_OFFSETS[band.id][k]);
    });
  }
  // deterministisches „Rauschen“ aus inkommensurablen hohen Frequenzen
  v += 1.6 * Math.sin(2 * Math.PI * 37.3 * tau) + 1.1 * Math.sin(2 * Math.PI * 43.9 * tau + 1.3);
  return v;
}

/**
 * Scrollender EEG-Streifen (Simulation, Ableitung O1–M2).
 * - minuteRef: Ref mit der aktuellen Session-Minute (wird pro Frame gelesen)
 * - autoMinute: Funktion(elapsedSec) → Minute, für den selbstlaufenden Hero
 */
export default function EEGCanvas({ minuteRef, autoMinute, initialMinute = 0, height = 150, windowSec = 4, showScale = true, label }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const labelRef = useRef(null);
  const initialBand = dominantBand(initialMinute);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(wrap);
    const colors = {
      grid: css.getPropertyValue("--line").trim() || "#243142",
      gridStrong: css.getPropertyValue("--line-strong").trim() || "#33445a",
      text: css.getPropertyValue("--fg-3").trim() || "#8593a3",
      bg: css.getPropertyValue("--bg").trim() || "#0b1016",
    };

    let width = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let lastMinute = -1;
    const start = performance.now();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      draw(performance.now(), true);
    };

    const currentMinute = (now) => {
      // bei reduzierter Bewegung: null → der Aufrufer wählt einen statischen Zustand
      if (autoMinute) return autoMinute(reduceMotion ? null : (now - start) / 1000);
      return minuteRef?.current ?? 0;
    };

    function draw(now, force = false) {
      if (!width) return;
      const minute = currentMinute(now);
      if (reduceMotion && !force && Math.abs(minute - lastMinute) < 1e-6) return;
      lastMinute = minute;
      const shares = bandShares(minute);
      const win = width < 520 ? windowSec * 0.6 : windowSec;
      const tSec = reduceMotion ? win : (now - start) / 1000;
      const H = height;
      const mid = H / 2 + 6;
      const pxPerUv = (H * 0.34) / 60;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, H);

      // Raster wie auf EEG-Papier: 0,2 s fein, 1 s kräftiger (zeitlich verankert, scrollt mit)
      const pxPerSec = width / win;
      const t0 = tSec - win;
      ctx.lineWidth = 1;
      for (let k = Math.ceil(t0 * 5); k <= Math.floor(tSec * 5); k += 1) {
        const x = ((k / 5 - t0) / win) * width;
        const secMark = k % 5 === 0;
        ctx.strokeStyle = secMark ? colors.gridStrong : colors.grid;
        ctx.globalAlpha = secMark ? 0.9 : 0.55;
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, H);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      ctx.moveTo(0, Math.round(mid) + 0.5);
      ctx.lineTo(width, Math.round(mid) + 0.5);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Kurve
      const color = traceColor(shares);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      const step = 1;
      for (let x = 0; x <= width; x += step) {
        const tau = tSec - win + (x / width) * win;
        const y = mid - sample(tau, shares) * pxPerUv;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Maßstab: 50 µV und 1 s (auf schmalen Flächen 0,5 s)
      if (showScale) {
        const scaleSec = width < 520 ? 0.5 : 1;
        const barW = scaleSec * pxPerSec;
        const x0 = width - 14;
        const y0 = H - 12;
        const barH = 50 * pxPerUv;
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x0, y0 - barH);
        ctx.lineTo(x0, y0);
        ctx.lineTo(x0 - barW, y0);
        ctx.stroke();
        ctx.font = "500 10px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "right";
        const labels = [
          ["50 µV", x0 - 6, y0 - barH + 10],
          [scaleSec === 1 ? "1 s" : "0,5 s", x0 - barW / 2 + 12, y0 - 5],
        ];
        for (const [text, x, y] of labels) {
          const w = ctx.measureText(text).width;
          ctx.fillStyle = colors.bg;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(x - w - 3, y - 10, w + 6, 13);
          ctx.globalAlpha = 1;
          ctx.fillStyle = colors.text;
          ctx.fillText(text, x, y);
        }
      }

      if (labelRef.current) {
        const dom = dominantBand(minute);
        const text = `Dominant: ${dom.label} (${dom.range})`;
        if (labelRef.current.textContent !== text) labelRef.current.textContent = text;
      }
    }

    const loop = (now) => {
      if (visible) draw(now);
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(wrap);
    resize();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [autoMinute, minuteRef, height, windowSec, showScale]);

  return (
    <div ref={wrapRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        height={height}
        role="img"
        aria-label="Simuliertes EEG-Signal, dessen Frequenz im Verlauf der Session sinkt"
        className="block w-full"
        style={{ height }}
      />
      <div className="pointer-events-none absolute left-3 top-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.68rem] text-fg3">
        <span>{label ?? "EEG O1–M2 · Simulation"}</span>
        <span ref={labelRef} className="text-fg2" aria-live="off">
          {`Dominant: ${initialBand.label} (${initialBand.range})`}
        </span>
      </div>
    </div>
  );
}
