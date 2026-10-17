# NSDR-Modul: Der 20-Minuten-Gehirn-Reboot

Interaktives Modul für das **Allrounder Life-Optimization Protokoll** zu Non-Sleep Deep Rest (NSDR).
React 18 + Tailwind CSS 3, bewusst als einziger dunkler Look (Dark Mode).

Inhalt, in der Reihenfolge des Briefings:

1. **Was ist NSDR?** Definition, Herkunft (Yoga Nidra → Satyananda → Huberman), Abgrenzung zu Meditation und Power-Nap
2. **Hirnebene:** Gehirnwellen-Shift, präfrontaler Kortex & DMN, Exterozeption → Interozeption (mit Schaubildern)
3. **Gehirnwellen- & Effekt-Visualizer:** Zeitregler 00:00–20:00, Abspielen im Zeitraffer, EEG-Simulation (Beta rot → Theta blau), Bandanteile, drei Effekt-Balken, Tabellenansicht
4. **Messbare Effekte:** Dopamin, Neuroplastizität, Cortisol & HRV, Schlafdefizit, jeweils Behauptung vs. Messung
5. **Anatomie einer Session:** vier Phasen mit Zeitleiste, Anleitung und Begründung
6. **Einsatz-Protokoll:** Afternoon-Slump, Post-Workout/Post-Study, 3-Uhr-nachts
7. **Schnell-Vergleich:** 20 Min. Social Media vs. 20 Min. NSDR
8. **Hype-Check:** 15 verbreitete Behauptungen mit Urteil und Quelle (filterbar)
9. **Grenzen & Sicherheit** und **Literaturverzeichnis** (56 Quellen mit Design, Stichprobe, Effekt, Link)

Jede Aussage trägt einen Kurzbeleg, der ins Literaturverzeichnis springt, und eine Evidenz-Markierung:
**Gesichert** (repliziert, Meta-Analysen) · **Vorläufig** (Einzelstudien, kleine RCTs) · **Hypothese** (plausibel, nicht gemessen) · **Nicht belegt**.

## Was gegenüber dem Briefing geändert wurde

Mehrere Zahlen aus dem Briefing halten der Prüfung nicht stand. Das Modul übernimmt sie deshalb nicht als Fakten, sondern ordnet sie ein:

| Briefing | Befund | Im Modul |
|---|---|---|
| +65 % Dopamin in einer Session | Einzige Studie: Kjaer et al. 2002, PET, **n = 8** erfahrene Yoga-Lehrer; 7,9 % weniger Raclopride-Bindung, daraus +65 % *geschätzt*; nie repliziert | Zahl bleibt sichtbar, als „Einzelstudie, geschätzt“ markiert |
| „Füllt den Dopamin-Pool auf, statt ihn wie Social Media leerzupumpen“ | Weder gemessen noch etabliertes Konzept; auch Videospielen setzt striatal Dopamin frei (Koepp 1998) | Als „nicht belegt“ markiert |
| +20–50 % schnellere Neuroplastizität | Keine Quelle gefunden. Wache Ruhe nach dem Lernen: g = 0,45 (Weng 2025), bei jungen Gesunden schwächer (Parra 2026), teils kein Vorteil ggü. Social Media (Quevedo Pütter 2025) | Durch die Meta-Analysen ersetzt |
| Replay im Theta-Zustand 10–20× schneller | Ca. 20× komprimiertes Replay in Wach-Pausen gezeigt (Buch 2021), im Tiermodell an Sharp-Wave-Ripples gekoppelt, nicht an Theta | Korrigiert |
| Delta-Wellen bei wachem Bewusstsein | Delta-Befunde uneinheitlich, allenfalls lokal (Kachera 2025; Datta 2022) | Visualizer zeigt Delta nie dominant |
| PFC/DMN senken Glukose-/O₂-Verbrauch drastisch | PET: Umverteilung bei stabilem globalem Blutfluss (Lou 1999); DMN-Konnektivität sinkt nur bei Geübten (Fialoke 2024) | Korrigiert |
| Drastische Cortisol-Senkung | Kleine/inkonsistente Effekte; deutlich nur bei Risikogruppen (Koncz 2021) | Als „übertrieben“ markiert |
| 20–30 Min. NSDR kompensieren Schlafdefizit, bauen Adenosin ab | Nicht untersucht; ein 25-Min.-Nickerchen wirkte im direkten Vergleich besser als 10 Min. NSDR (Boukhris 2026b) | Als „nicht belegt“ markiert |
| Lange Ausatmung bremst „über das Zwerchfell“ den Sinusknoten | Respiratorische Sinusarrhythmie ist vagal vermittelt (Yasuma 2004) | Mechanismus korrigiert |
| Sympathikus → Parasympathikus „umschalten“ | Beide Äste bleiben aktiv (Ditto 2006); LF/HF misst keine Balance (Billman 2013) | Als „zwei Regler, kein Schalter“ dargestellt |
| Titel „… für +65 % Dopamin …“ | siehe oben | Titel ohne Dopamin-Versprechen; die Zahl steht mit Einordnung im Kopfbereich |

Neu recherchiert und eingebaut: die ersten randomisierten Studien unter dem Namen NSDR (Wrzeciono 2024; Boukhris 2024, 2026a, 2026b) und die Meta-Analysen 2025/2026 zu Yoga Nidra (Ghai 2025; Singh 2026).

Der **Visualizer** ist ausdrücklich ein schematisches Modell: Minute-für-Minute-Verläufe von Dopamin, vagaler Aktivität oder Konsolidierung hat niemand gemessen. Die Kurven sind aus qualitativen Befunden abgeleitet (`src/lib/model.js`) und im Modul so beschriftet.

## Nutzung

```bash
npm install
npm run dev              # Vorschau mit Vite
npm test                 # Tests für das Visualizer-Modell
npm run build:artifact   # eigenständige HTML-Seite nach build/nsdr-modul.html
```

`build:artifact` rendert das Markup vor (SSR), bettet das kompilierte Tailwind-CSS ein und lädt React 18.3.1 als UMD-Build von cdnjs. Die Ausgabe ist ein HTML-Fragment ohne `<html>`/`<head>`/`<body>`, wie es claude.ai-Artifacts erwarten.

## In eine eigene React/Tailwind-App übernehmen

1. `src/NSDRModule.jsx`, `src/components/`, `src/data/` und `src/lib/` kopieren.
2. Die Tokens und Komponenten-Klassen aus `src/styles.css` übernehmen (`:root`-Variablen, `@layer base`, `@layer components`).
3. In `tailwind.config.js` die `colors`, `fontFamily` und `maxWidth` aus `theme.extend` ergänzen.
4. Die drei Schriften laden (Bricolage Grotesque, Source Serif 4, JetBrains Mono), siehe `index.html`.
5. `<NSDRModule />` rendern.

## Struktur

```
src/
  NSDRModule.jsx            Seite: setzt alle Abschnitte zusammen
  components/
    Hero.jsx                Kopfbereich mit EEG-Zeitraffer und Kennzahlen
    WhatIsNSDR.jsx          1 · Definition, Herkunft, Abgrenzung
    BrainMechanisms.jsx     2 · drei Mechanismen mit Schaubildern
    BrainwaveVisualizer.jsx Interaktiver Visualizer
    EEGCanvas.jsx           Canvas-Simulation der EEG-Welle
    EffectCards.jsx         3 · Effekte
    SessionAnatomy.jsx      4 · Session in vier Phasen
    UseMatrix.jsx           5 · Einsatz-Protokoll
    ScrollVsNSDR.jsx        Vergleich Social Media vs. NSDR
    HypeCheck.jsx           Faktencheck
    SafetyAndSources.jsx    Grenzen & Literaturverzeichnis
    ui.jsx                  Evidenz-Badges, Kurzbelege, Abschnitts-Layout
  data/sources.js           Literatur mit Design, Stichprobe, Befund, Link
  lib/model.js              Schematisches Session-Modell (+ model.test.js)
scripts/build-artifact.mjs  Build der eigenständigen Seite
```

## Recherche

Stand: Oktober 2026. Die Quellen wurden per Websuche gegen Abstracts und Verlagsseiten geprüft; nicht jeder Volltext war zugänglich. Wo Band, Seiten, DOI oder Autor:innen-Initialen nicht sicher bestätigt werden konnten, fehlen sie bewusst, und der Link führt auf PubMed oder PubMed Central. Bildung, keine medizinische Beratung.
