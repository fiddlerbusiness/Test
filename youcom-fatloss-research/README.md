# You.com Research Playground – Fettabbau mit Muskelerhalt (Top 10 Strategien)

| Feld im Playground | Einstellung |
|---|---|
| **Input** | `01_INPUT_prompt.txt` vollständig einfügen (34.869 Zeichen, nur ASCII, Limit 40.000) |
| **Research effort** | `Frontier` |
| **Background** | **AN** (Pflicht: Frontier ohne Background liefert laut Changelog 422) |
| **Output schema** | `02_OUTPUT_SCHEMA.json` vollständig einfügen |
| **Freshness** | `Default: No limits` (keine Einschränkung – Schlüsselstudien stammen aus 1995–2026) |
| **Country** | `Default: All countries` |
| **Include domains** | **leer lassen** (Variante A) |
| **Exclude domains** | `03_EXCLUDE_domains.txt` (95 Domains; mindestens die ersten 35) |
| **Boost domains** | `04_BOOST_domains.txt` (27 Domains; mindestens die ersten 20) |

## Variante B (strenge Whitelist)
`05_INCLUDE_domains_strict.txt` in **Include domains**, dafür **Exclude** und **Boost leer lassen**.
`include_domains` und `exclude_domains` schließen sich gegenseitig aus, `boost_domains` lässt sich nicht mit `include_domains` kombinieren.

## Falls das Schema mit 422 abgelehnt wird
Die dokumentierten Limits (Tiefe ≤ 5, ≤ 100 Properties, ≤ 500 Enum-Werte, String-Budget ≤ 25.000) hält das Schema ein
(`python3 check_schema.py 02_OUTPUT_SCHEMA.json`). Nicht dokumentiert ist, ob `minItems`/`maxItems` unterstützt werden.
Nennt die Fehlermeldung diese Keywords, die beiden Zeilen `"minItems": 10,` und `"maxItems": 10,` löschen – die
Vorgabe „exakt 10“ steht zusätzlich im Input und in der `description`.

## Abweichungen vom ursprünglichen Schema-Wunsch (bewusst)
- `synergy_matrix` als Top-Level-Property ergänzt (im Input gefordert, fehlte in der Schema-Liste; mit `additionalProperties: false` wäre sie sonst nicht ausgebbar).
- `executive_summary` ergänzt.
- Pro Strategie: `ranking_rationale`, `effect_size_summary` (Effektstärken in natürlichen Einheiten mit KI, k/N, Design), `counter_evidence`.
- `actionable_protocol` ist flach (nur Skalare), damit die Verschachtelungstiefe 5 auch bei strengster Zählweise nicht überschritten wird.
- Zahlenbereiche als `{low, high, notes}`; `notes` für Population und Evidenzstärke.
- `evidence_conflicts`: zusätzlich `conflicting_findings`, `certainty_of_interpretation`.
- `references`: zusätzlich `population_and_sample`, `verified`.
- Kein `$schema`-Keyword (optional in Draft 7, vermeidet Ablehnung durch den Validator).

## Ergebnis prüfen
```
python3 -m json.tool antwort.json > /dev/null && echo "valide"
```
