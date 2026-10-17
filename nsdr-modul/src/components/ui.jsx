import React from "react";
import { SOURCES } from "../data/sources.js";

export const EVIDENCE = {
  solid: {
    label: "Gesichert",
    dots: 3,
    color: "var(--ev-solid)",
    desc: "Mehrere Studien bzw. Meta-Analysen, repliziert.",
  },
  prelim: {
    label: "Vorläufig",
    dots: 2,
    color: "var(--ev-prelim)",
    desc: "Einzelstudien oder kleine RCTs, Befunde teils uneinheitlich.",
  },
  hypo: {
    label: "Hypothese",
    dots: 1,
    color: "var(--ev-hypo)",
    desc: "Plausibler Mechanismus, für NSDR nicht direkt gemessen.",
  },
  none: {
    label: "Nicht belegt",
    dots: 0,
    color: "var(--ev-none)",
    desc: "Keine Evidenz gefunden oder durch Daten widersprochen.",
  },
};

function EvidenceIcon({ level }) {
  const ev = EVIDENCE[level];
  if (ev.dots === 0) {
    return (
      <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true" className="shrink-0">
        <path d="M4 1 L12 9 M12 1 L4 9" style={{ stroke: ev.color, fill: "none" }} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="22" height="8" viewBox="0 0 22 8" aria-hidden="true" className="shrink-0">
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={4 + i * 7}
          cy="4"
          r="3"
          style={{ fill: i < ev.dots ? ev.color : "none", stroke: ev.color }}
          strokeWidth="1.25"
        />
      ))}
    </svg>
  );
}

export function EvidenceBadge({ level, children }) {
  const ev = EVIDENCE[level];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-bg px-2.5 py-1 font-mono text-[0.7rem] leading-none text-fg2"
      title={ev.desc}
    >
      <EvidenceIcon level={level} />
      <span>{children ?? ev.label}</span>
    </span>
  );
}

export function EvidenceLegend({ className = "" }) {
  return (
    <dl className={`grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {Object.entries(EVIDENCE).map(([key, ev]) => (
        <div key={key} className="flex min-w-0 flex-col gap-1.5">
          <dt>
            <EvidenceBadge level={key} />
          </dt>
          <dd className="text-[0.8rem] leading-snug text-fg3">{ev.desc}</dd>
        </div>
      ))}
    </dl>
  );
}

export const VERDICTS = {
  true: { label: "Stimmt", color: "var(--ev-solid)", icon: "check" },
  partly: { label: "Teilweise", color: "var(--ev-prelim)", icon: "half" },
  overstated: { label: "Übertrieben", color: "var(--ev-hypo)", icon: "up" },
  unsupported: { label: "Nicht belegt", color: "var(--ev-none)", icon: "cross" },
};

export function VerdictBadge({ verdict }) {
  const v = VERDICTS[verdict];
  const stroke = { style: { stroke: v.color, fill: "none" }, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[0.72rem] font-medium text-fg">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        {v.icon === "check" && <path d="M2.5 7.5 L5.5 10.5 L11.5 3.5" {...stroke} />}
        {v.icon === "half" && (
          <>
            <circle cx="7" cy="7" r="5" {...stroke} />
            <path d="M7 2 A5 5 0 0 1 7 12 Z" style={{ fill: v.color }} />
          </>
        )}
        {v.icon === "up" && <path d="M7 2.5 L12 11.5 L2 11.5 Z" {...stroke} />}
        {v.icon === "cross" && <path d="M3 3 L11 11 M11 3 L3 11" {...stroke} />}
      </svg>
      {v.label}
    </span>
  );
}

/** Kurzbeleg(e) mit Sprung ins Literaturverzeichnis. */
export function Cite({ k, prefix = "" }) {
  const keys = Array.isArray(k) ? k : [k];
  return (
    <span className="whitespace-normal">
      {" ("}
      {prefix}
      {keys.map((key, i) => {
        const src = SOURCES[key];
        if (!src) throw new Error(`Unbekannte Quelle: ${key}`);
        return (
          <React.Fragment key={key}>
            {i > 0 && "; "}
            <a className="nsdr-cite" href={`#ref-${key}`} title={`${src.authors} (${src.year ?? "o. J."}): ${src.title}`}>
              {src.cite}
            </a>
          </React.Fragment>
        );
      })}
      {")"}
    </span>
  );
}

export function Section({ id, number, eyebrow, title, intro, children }) {
  return (
    <section id={id} className="nsdr-gutter scroll-mt-6 py-16 sm:py-20" aria-labelledby={`${id}-title`}>
      <div className="mx-auto max-w-panel">
        <header className="mb-10 flex max-w-prose flex-col gap-3">
          <p className="nsdr-eyebrow">
            {number ? <span className="text-fg2">{number}</span> : null}
            {number ? " · " : null}
            {eyebrow}
          </p>
          <h2 id={`${id}-title`} className="font-display text-[clamp(1.75rem,3.4vw,2.6rem)] font-semibold leading-[1.08] tracking-[-0.015em] text-fg">
            {title}
          </h2>
          {intro ? <div className="nsdr-prose">{intro}</div> : null}
        </header>
        {children}
      </div>
    </section>
  );
}

/** Box für eine Korrektur gegenüber verbreiteten Behauptungen. */
export function Correction({ title = "Faktencheck", children }) {
  return (
    <aside className="rounded-xl border border-line bg-bg p-4 sm:p-5">
      <p className="nsdr-eyebrow mb-2 flex items-center gap-2 text-fg2">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="6" style={{ fill: "none", stroke: "var(--ev-prelim)" }} strokeWidth="1.5" />
          <path d="M7 3.8 V7.6 M7 9.6 V9.8" style={{ stroke: "var(--ev-prelim)" }} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {title}
      </p>
      <div className="font-serif text-[0.98rem] leading-relaxed text-fg2">{children}</div>
    </aside>
  );
}
