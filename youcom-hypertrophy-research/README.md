# You.com Research: Hypertrophie-Hebel innerhalb einer Trainingseinheit (modulare Version)

Der ursprüngliche Prompt hat alles in **einem** Lauf verlangt: rund 70 Studien-Leads prüfen (Bibliografie, Preprint-Status, Retraktion), 10 Hebel analysieren, ranken, eine Trainingseinheit bauen und alles als ein einziges JSON ausgeben. Diese Version teilt die Arbeit in **11 Rechercheläufe**, eine **automatische Prüfung** und einen **Syntheseschritt**.

## Ablauf

1. **11 Läufe in You.com** (je Hebel einer, plus L11 für zusätzliche Kandidaten): Inhalt von `runs/L01.txt` … `runs/L11.txt` jeweils ins Feld **Input** kopieren, übrige Felder wie unten.
2. Jede Antwort als `L01.json` … `L11.json` in einem Ordner speichern (Download-Symbol im Response-Bereich).
3. Prüfen und zusammenführen:
   ```
   python3 qc_merge.py <ordner>
   ```
   Das Skript erzeugt `merged.json` und `qc_report.txt`. Es findet abgeschnittene oder ungültige Antworten, zitierte, aber nicht gelistete Quellen, gelistete, aber nie zitierte Quellen, zurückgezogene Studien, die als Evidenz verwendet werden, und falsch markierte Preprints. Doppelte Studien (gleiche DOI) werden zusammengeführt und erhalten globale IDs (G001 …).
   Jeden Lauf mit `ERROR` oder `research_status` ≠ `complete` wiederholen.
4. **Synthese** (Ranking, Fazit, Trainingseinheit): `05_SYNTHESIS_prompt.txt` plus `merged.json` (als Datei anhängen oder einfügen) in ein Chat-Modell mit großem Kontextfenster geben. Dafür ist keine Websuche nötig, und `merged.json` passt nicht in das 40.000-Zeichen-Feld von You.com. Für ein deutsches Handbuch im Syntheseprompt „English“ durch „German“ ersetzen.

## Felder im You.com Research Playground (für alle 11 Läufe gleich)

| Feld | Inhalt |
|---|---|
| **Input** | `runs/LXX.txt` vollständig (14.000–16.500 Zeichen, nur ASCII, Limit 40.000) |
| **Research effort** | `Frontier` (Alternative: `Exhaustive`) |
| **Background** | **AN** |
| **Output schema** | `02_OUTPUT_SCHEMA.json` (55 Properties, Tiefe 5, ~7.400 Zeichen; innerhalb der dokumentierten Limits). Bei Fehlermeldung Feld **leer lassen**: Die identische Struktur steht auch im Input. |
| **Freshness** | `Default: No limits`. Schlüsselstudien stammen von 2012–2023; die Suche nach Studien von 2024–2026 erzwingt der Prompt selbst. |
| **Country** | `Default: All countries` |
| **Include domains** | **leer lassen**. Das Feld würde die Suche auf diese Domains beschränken, und nicht gelistete Verlage und Preprint-Server würden wegfallen. |
| **Exclude domains** | `03_EXCLUDE_domains.txt` (69 Domains: Social Media, Fitness-Magazine, Coaching-, App- und Research-Review-Seiten, KI-Tools) |
| **Boost domains** | `04_BOOST_domains.txt` (20 Domains: PubMed/PMC, Europe PMC, SportRxiv, Fachverlage, Retraction Watch) |

Lassen sich in den Domain-Feldern nicht alle Zeilen auf einmal einfügen, die Domains einzeln über **+** hinzufügen.

## Dateien

| Datei | Zweck |
|---|---|
| `runs/L01.txt` … `runs/L11.txt` | Fertige Inputs zum Kopieren (generiert) |
| `00_core.txt` | Gemeinsamer Kern: Rolle, Scope, Evidenzregeln, Vorgehen, Impact-Scoring, Ausgabeformat |
| `levers/L01.txt` … `levers/L11.txt` | Hebelspezifische Briefings mit Fragen und Leads (erste Zeile = `RUN:`-Zeile) |
| `02_OUTPUT_SCHEMA.json` | JSON-Schema für das Feld *Output schema* |
| `03_EXCLUDE_domains.txt`, `04_BOOST_domains.txt` | Domainlisten |
| `05_SYNTHESIS_prompt.txt` | Syntheseprompt für Ranking und Trainingseinheit |
| `qc_merge.py` | Prüfung und Zusammenführung der 11 Antworten (nur Python-Standardbibliothek) |

Nach Änderungen an `00_core.txt` oder `levers/` die Inputs neu erzeugen:
```
for f in levers/L*.txt; do n=$(basename "$f"); { head -n 1 "$f"; echo; cat 00_core.txt; tail -n +2 "$f"; } > "runs/$n"; done
```

## Hebel

| Lauf | Hebel |
|---|---|
| L01 | Mechanische Spannung und Nähe zum Muskelversagen |
| L02 | Bewegungsumfang und Muskellänge |
| L03 | Satzpausen |
| L04 | Volumen pro Einheit („Junk Volume“) |
| L05 | Übungsreihenfolge |
| L06 | Wiederholungstempo und exzentrische Kontrolle |
| L07 | Lastwahl |
| L08 | Übungsauswahl und Stabilität |
| L09 | Intensitätstechniken (Drop-Sets, Rest-Pause, Myo-Reps, Supersätze, Cluster) |
| L10 | Aufwärmen, Potenzierung, Ermüdungsmanagement |
| L11 | Screening zusätzlicher Kandidaten (Aufmerksamkeitsfokus, Dehnen zwischen Sätzen, BFR, unilateral vs. bilateral) |
