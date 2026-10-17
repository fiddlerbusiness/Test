#!/usr/bin/env python3
"""Check You.com results, build the M7 synthesis input and merge all runs.

    python3 tools/youcom_pipeline.py check results/M1.json [more files]
    python3 tools/youcom_pipeline.py synth-input results/M1.json ... results/M6.json
    python3 tools/youcom_pipeline.py merge results/M1.json ... results/M6.json results/M7.json

A result file may hold the bare JSON answer, the full Playground/API task
response (answer under result.output.content) or either one in ``` fences.
Wildcards such as results/M*.json also work on Windows. Standard library only.
"""

import argparse
import glob
import json
import re
import sys
import unicodedata
from pathlib import Path
from urllib.parse import unquote

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_prompts as bp  # noqa: E402  (module definitions and schemas)

WEIGHTS = (0.30, 0.25, 0.25, 0.10, 0.10)
SCORE_KEYS = ("c1_long_term_weight", "c2_lean_mass", "c3_certainty", "c4_generalisability", "c5_feasibility_safety")
C3_RANGES = {"high": (4.5, 5.0), "moderate": (3.0, 4.0), "low": (0.0, 2.5)}
STRATEGY_FIELDS = (
    "strategy_name", "category", "phase_relevance", "evidence_grade", "evidence_grade_by_outcome",
    "evidence_grade_rationale", "effect_size_summary", "long_term_weight_loss_mechanism",
    "muscle_preservation_mechanism", "actionable_protocol", "counter_evidence_and_uncertainties",
    "common_pitfalls", "citation_ids",
)
MINIMUMS = {"synergy_matrix": 6, "evidence_conflicts": 8, "key_limitations": 8, "considered_but_excluded": 10}

LETTER = r"[^\W\d_]"
MODULE_REF_RE = re.compile(rf"\bM\d+[a-z]?-{LETTER}(?:{LETTER}|['\-])*?\d{{4}}[a-z]?(?!\w)")
MODULE_REF_PARTS_RE = re.compile(rf"^M\d+[a-z]?-({LETTER}(?:{LETTER}|['\-])*?\d{{4}})[a-z]?$")
FINAL_REF_RE = re.compile(rf"^{LETTER}(?:{LETTER}|['\-])*\d{{4}}[a-z]?$")
BRACKET_RE = re.compile(r"\[([^\[\]]{1,400})\]")
DOI_RE = re.compile(r"10\.\d{4,9}/[^\s\"'<>\[\]]+", re.I)
PMID_RE = re.compile(r"pubmed\.ncbi\.nlm\.nih\.gov/(\d+)", re.I)
PMC_RE = re.compile(r"\bPMC\d+\b", re.I)
URL_PREFIXES = ("https://doi.org/", "https://pubmed.ncbi.nlm.nih.gov/", "https://pmc.ncbi.nlm.nih.gov/",
                "https://www.ncbi.nlm.nih.gov/pmc/")


# --------------------------------------------------------------------------
# Loading
# --------------------------------------------------------------------------

class Result:
    def __init__(self, path, answer, sources):
        self.path = path
        self.answer = answer
        self.sources = sources  # URLs from the API response, None if not available

    @property
    def mid(self):
        return self.answer["module_id"].strip()

    @property
    def is_synthesis(self):
        return "final_ranking" in self.answer


def parse_json_text(raw):
    text = raw.strip()
    fence = re.match(r"^```[A-Za-z]*\s*(.*?)\s*```$", text, re.S)
    return json.loads(fence.group(1) if fence else text)


def is_answer(node):
    return (isinstance(node, dict) and isinstance(node.get("module_id"), str)
            and isinstance(node.get("candidates", node.get("final_ranking")), list))


def find_answer(node):
    stack = [node]
    while stack:
        cur = stack.pop()
        if isinstance(cur, str):
            stripped = cur.strip()
            if not stripped.startswith(("{", "```")):
                continue
            try:
                cur = parse_json_text(stripped)
            except ValueError:
                continue
        if is_answer(cur):
            return cur
        if isinstance(cur, dict):
            stack.extend(value for key, value in cur.items() if key != "input")
        elif isinstance(cur, list):
            stack.extend(cur)
    return None


def harvest_urls(node, answer, found):
    """Collect URLs of the API response (its sources list), skipping the answer and the echoed input."""
    if node is answer:
        return found
    if isinstance(node, dict):
        for key, value in node.items():
            if key != "input":
                harvest_urls(value, answer, found)
    elif isinstance(node, list):
        for value in node:
            harvest_urls(value, answer, found)
    elif isinstance(node, str) and node.startswith(("http://", "https://")):
        found.add(node)
    return found


def load(path):
    raw = Path(path).read_text(encoding="utf-8-sig")
    try:
        data = parse_json_text(raw)
    except ValueError as err:
        sys.exit(f"{path}: kein gültiges JSON ({err}). Ist die Antwort abgeschnitten?")
    answer = find_answer(data)
    if answer is None:
        sys.exit(f"{path}: keine Antwort gefunden (erwartet: Objekt mit module_id und candidates bzw. final_ranking).")
    sources = harvest_urls(data, answer, set()) if answer is not data else set()
    return Result(Path(path), answer, sources or None)


def expand(patterns):
    paths = []
    for pattern in patterns:
        hits = sorted(glob.glob(pattern)) if any(ch in pattern for ch in "*?[") else [pattern]
        if not hits:
            sys.exit(f"Keine Datei passt zu {pattern}")
        paths += [p for p in hits if p not in paths]
    return paths


def module_sort_key(result):
    match = re.match(r"M(\d+)", result.mid)
    return (int(match.group(1)) if match else 99, result.mid)


def split_results(results):
    modules = sorted((r for r in results if not r.is_synthesis), key=module_sort_key)
    synthesis = [r for r in results if r.is_synthesis]
    seen = {}
    for res in modules:
        if res.mid in seen:
            sys.exit(f"module_id {res.mid} kommt doppelt vor ({seen[res.mid]} und {res.path}). "
                     "Geteilte Module brauchen eigene IDs, z. B. M2a und M2b.")
        seen[res.mid] = res.path
    return modules, synthesis


# --------------------------------------------------------------------------
# Generic helpers
# --------------------------------------------------------------------------

TYPE_CHECKS = {
    "object": lambda v: isinstance(v, dict),
    "array": lambda v: isinstance(v, list),
    "string": lambda v: isinstance(v, str),
    "integer": lambda v: isinstance(v, int) and not isinstance(v, bool),
    "number": lambda v: isinstance(v, (int, float)) and not isinstance(v, bool),
    "boolean": lambda v: isinstance(v, bool),
    "null": lambda v: v is None,
}


def validate(value, schema, path="$"):
    """Minimal JSON Schema check: type, enum, properties, required, additionalProperties, items."""
    types = schema.get("type")
    if types:
        types = types if isinstance(types, list) else [types]
        if not any(TYPE_CHECKS[t](value) for t in types):
            return [f"{path}: erwartet {'|'.join(types)}, gefunden {type(value).__name__}"]
    errors = []
    if "enum" in schema and value not in schema["enum"]:
        errors.append(f"{path}: {value!r} ist kein erlaubter Wert")
    if isinstance(value, dict):
        props = schema.get("properties", {})
        errors += [f"{path}: Feld '{key}' fehlt" for key in schema.get("required", []) if key not in value]
        if schema.get("additionalProperties") is False:
            errors += [f"{path}: unerwartetes Feld '{key}'" for key in value if key not in props]
        for key, sub in props.items():
            if key in value:
                errors += validate(value[key], sub, f"{path}.{key}")
    elif isinstance(value, list) and "items" in schema:
        for i, item in enumerate(value):
            errors += validate(item, schema["items"], f"{path}[{i}]")
    return errors


def iter_strings(node):
    if isinstance(node, str):
        yield node
    elif isinstance(node, dict):
        for value in node.values():
            yield from iter_strings(value)
    elif isinstance(node, list):
        for value in node:
            yield from iter_strings(value)


def citation_lists(node):
    if isinstance(node, dict):
        for key, value in node.items():
            if key == "citation_ids" and isinstance(value, list):
                yield value
            else:
                yield from citation_lists(value)
    elif isinstance(node, list):
        for value in node:
            yield from citation_lists(value)


def cited_module_ids(answer):
    body = {key: value for key, value in answer.items() if key != "references"}
    ids = {cid.strip() for ids_ in citation_lists(body) for cid in ids_ if isinstance(cid, str)}
    for text in iter_strings(body):
        ids.update(MODULE_REF_RE.findall(text))
    return ids


def weighted(scores):
    return round(sum(w * float(scores[key]) for w, key in zip(WEIGHTS, SCORE_KEYS)), 2)


def word_count(node):
    return sum(len(text.split()) for text in iter_strings(node))


def id_number(identifier):
    """Sort key for H1..H10 / K1..K10; optional extras such as X1 go last."""
    identifier = (identifier or "").strip()
    match = re.search(r"\d+", identifier)
    return (identifier[:1].upper() not in "HK", int(match.group(0)) if match else 0, identifier)


def norm_name(name):
    return re.sub(r"[^a-z0-9]", "", str(name).lower())


def ref_keys(ref):
    """DOI keys and PMID/PMC keys of a reference, from url, retrieved_url and citation."""
    dois, others = set(), set()
    for field in ("url", "retrieved_url", "citation"):
        value = unquote(str(ref.get(field) or ""))
        dois.update("doi:" + doi.lower().rstrip(".,;)") for doi in DOI_RE.findall(value))
        others.update("pmid:" + pmid for pmid in PMID_RE.findall(value))
        others.update("pmc:" + pmc.upper() for pmc in PMC_RE.findall(value))
    return dois, others


def url_keys(url):
    url = unquote(url)
    keys = {"doi:" + doi.lower().rstrip(".,;)") for doi in DOI_RE.findall(url)}
    keys.update("pmid:" + pmid for pmid in PMID_RE.findall(url))
    keys.update("pmc:" + pmc.upper() for pmc in PMC_RE.findall(url))
    bare = re.sub(r"^https?://(www\.)?", "", url.strip().lower()).split("#")[0].rstrip("/")
    keys.add("url:" + bare)
    return keys


# --------------------------------------------------------------------------
# check
# --------------------------------------------------------------------------

def check_scores(label, scores, grade, errors, warnings):
    for key in SCORE_KEYS + ("weighted",):
        value = scores.get(key)
        if not isinstance(value, (int, float)) or not 0 <= value <= 5:
            errors.append(f"{label}: {key}={value!r} liegt nicht zwischen 0 und 5")
            return
    expected = weighted(scores)
    if abs(expected - scores["weighted"]) > 0.051:
        errors.append(f"{label}: weighted {scores['weighted']} passt nicht zur Formel ({expected:.2f})")
    if grade in C3_RANGES:
        low, high = C3_RANGES[grade]
        if not low <= scores["c3_certainty"] <= high:
            warnings.append(f"{label}: C3 {scores['c3_certainty']} passt nicht zu evidence_grade '{grade}' ({low}-{high})")


def check_references(res, errors, warnings, notes):
    answer, mid = res.answer, res.mid
    refs = answer.get("references", [])
    ids = [str(ref.get("id", "")).strip() for ref in refs]
    duplicates = sorted({i for i in ids if ids.count(i) > 1})
    if duplicates:
        errors.append(f"doppelte Referenz-IDs: {', '.join(duplicates)}")
    wrong_prefix = [i for i in ids if not i.startswith(f"{mid}-")]
    if wrong_prefix:
        warnings.append(f"Referenz-IDs ohne Präfix '{mid}-': {', '.join(wrong_prefix[:8])}")
    cited = cited_module_ids(answer)
    unresolved = sorted(cited - set(ids))
    if unresolved:
        errors.append(f"zitierte IDs ohne Referenz: {', '.join(unresolved)}")
    uncited = sorted(set(ids) - cited)
    if uncited:
        warnings.append(f"Referenzen, die nirgends zitiert werden: {', '.join(uncited)}")
    odd_urls = [ref["id"] for ref in refs if not str(ref.get("url", "")).startswith(URL_PREFIXES)]
    if odd_urls:
        warnings.append(f"url weder doi.org noch PubMed/PMC: {', '.join(odd_urls)}")
    if res.sources is None:
        notes.append("Keine Quellenliste der API in der Datei: Abgleich 'Referenz wirklich abgerufen?' übersprungen "
                     "(dafür die komplette Antwort mit sources speichern).")
        return
    source_keys = set().union(*(url_keys(url) for url in res.sources))
    unmatched = []
    for ref in refs:
        keys = set().union(*ref_keys(ref))
        keys |= {key for field in ("url", "retrieved_url") if ref.get(field) for key in url_keys(ref[field])}
        if not keys & source_keys:
            unmatched.append(ref.get("id", "?"))
    if unmatched:
        warnings.append(f"{len(unmatched)} von {len(refs)} Referenzen nicht in der Quellenliste der API "
                        f"(manuell prüfen, ggf. nur DOI/PMID-Abweichung): {', '.join(unmatched)}")
    else:
        notes.append(f"Alle {len(refs)} Referenzen finden sich in der Quellenliste der API.")


def check_module(res, errors, warnings, notes):
    answer, mid = res.answer, res.mid
    errors += validate(answer, bp.module_schema())
    if errors:
        return
    base = re.match(r"M\d+", mid)
    module = next((m for m in bp.MODULES if base and m["id"] == base.group(0)), None)
    names = [c["strategy_name"] for c in answer["candidates"]]
    if module is None:
        warnings.append(f"module_id {mid} gehört zu keinem bekannten Modul (M1-M6)")
    else:
        scope = [name for name, _ in module["scope"]]
        unknown = [n for n in names if norm_name(n) not in {norm_name(s) for s in scope}]
        if unknown:
            warnings.append(f"strategy_name weicht vom SCOPE ab: {'; '.join(unknown)}")
        if mid == module["id"] and len(names) != len(scope):
            warnings.append(f"{len(names)} statt {len(scope)} Kandidaten")
        wanted = {h for h, _ in module["heuristics"]}
        got = {h["heuristic_id"].strip() for h in answer["heuristic_tests"]}
        if mid == module["id"] and wanted - got:
            warnings.append(f"fehlende Heuristik-Tests: {', '.join(sorted(wanted - got, key=id_number))}")
        wanted = {k for k, _ in module["conflicts"]}
        got = {k["conflict_id"].strip() for k in answer["evidence_conflicts"]}
        if mid == module["id"] and wanted - got:
            warnings.append(f"fehlende Konflikte: {', '.join(sorted(wanted - got, key=id_number))}")
        if mid == module["id"] and len(answer["key_limitations"]) < len(module["limitations"]):
            warnings.append(f"{len(answer['key_limitations'])} statt {len(module['limitations'])} Limitationen")
    for i, cand in enumerate(answer["candidates"], 1):
        check_scores(f"{mid}.{i}", cand["scores"], cand["evidence_grade"], errors, warnings)
    check_references(res, errors, warnings, notes)
    words = word_count(answer)
    notes.append(f"{len(names)} Kandidaten, {len(answer['references'])} Referenzen, {words:,} Wörter")


def check_synthesis(res, errors, warnings, notes):
    answer = res.answer
    errors += validate(answer, bp.synthesis_schema())
    if errors:
        return
    ranking = answer["final_ranking"]
    ranks = sorted(item["rank"] for item in ranking)
    if ranks != list(range(1, 11)):
        errors.append(f"final_ranking braucht die Ränge 1-10 je einmal, gefunden: {ranks}")
    if [item["rank"] for item in ranking] != ranks:
        warnings.append("final_ranking ist nicht aufsteigend sortiert")
    for item in ranking:
        check_scores(f"Rang {item['rank']} ({item['candidate_key']})", item["scores"], None, errors, warnings)
    ordered = sorted(ranking, key=lambda item: item["rank"])
    for upper, lower in zip(ordered, ordered[1:]):
        if weighted(upper["scores"]) + 0.005 < weighted(lower["scores"]):
            warnings.append(f"Rang {upper['rank']} hat einen niedrigeren Score als Rang {lower['rank']}")
    if not 6 <= len(answer["synergy_matrix"]) <= 8:
        warnings.append(f"synergy_matrix hat {len(answer['synergy_matrix'])} statt 6-8 Einträge")
    if len(answer["considered_but_excluded"]) < 10:
        warnings.append(f"considered_but_excluded hat nur {len(answer['considered_but_excluded'])} Einträge (mind. 10)")
    own = [str(ref.get("id", "")) for ref in answer["references"]]
    if [i for i in own if not i.startswith("M7-")]:
        warnings.append("M7-Referenzen ohne Präfix 'M7-'")
    module_ids = sorted(i for i in cited_module_ids(answer) if not i.startswith("M7-"))
    unresolved_own = sorted({i for i in cited_module_ids(answer) if i.startswith("M7-")} - set(own))
    if unresolved_own:
        errors.append(f"zitierte M7-IDs ohne Referenz: {', '.join(unresolved_own)}")
    notes.append(f"{len(module_ids)} zitierte Modul-IDs werden beim merge gegen M1-M6 geprüft; "
                 f"{len(own)} eigene Referenzen, {word_count(answer):,} Wörter")


def cmd_check(paths):
    failed = False
    for path in paths:
        res = load(path)
        errors, warnings, notes = [], [], []
        (check_synthesis if res.is_synthesis else check_module)(res, errors, warnings, notes)
        status = "FEHLER" if errors else ("OK mit Hinweisen" if warnings else "OK")
        print(f"\n== {path} ({res.mid}): {status}")
        for line in errors:
            print(f"  FEHLER:  {line}")
        for line in warnings:
            print(f"  HINWEIS: {line}")
        for line in notes:
            print(f"  INFO:    {line}")
        failed |= bool(errors)
    return 1 if failed else 0


# --------------------------------------------------------------------------
# synth-input
# --------------------------------------------------------------------------

# Character budgets per evidence-pack section, tried in order until the M7 input fits.
# The DETAILED best-scored candidates get why/effects/against; the rest get other_why only.
DETAILED = 12
TRIM_LEVELS = [
    {"why": 400, "effects": 320, "against": 200, "ids": 10, "other_why": 200,
     "target_lines": 7, "target_chars": 220, "interp": 260, "refs": True},
    {"why": 400, "effects": 320, "against": 200, "ids": 10, "other_why": 200,
     "target_lines": 7, "target_chars": 220, "interp": 260, "refs": False},
    {"why": 320, "effects": 220, "against": 120, "ids": 8, "other_why": 150,
     "target_lines": 6, "target_chars": 180, "interp": 200, "refs": False},
    {"why": 240, "effects": 160, "against": 0, "ids": 6, "other_why": 100,
     "target_lines": 5, "target_chars": 160, "interp": 160, "refs": False},
    {"why": 160, "effects": 0, "against": 0, "ids": 4, "other_why": 80,
     "target_lines": 4, "target_chars": 140, "interp": 120, "refs": False},
]


def clip(text, limit):
    text = " ".join(str(text).split())
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0]
    if cut.count("[") > cut.count("]"):
        cut = cut[:cut.rfind("[")].rstrip()
    return cut + " ..."


def candidate_index(modules):
    return {f"{res.mid}.{i}": (res, cand)
            for res in modules for i, cand in enumerate(res.answer["candidates"], 1)}


def build_pack(modules, level):
    index = candidate_index(modules)
    by_score = sorted(index, key=lambda key: -index[key][1]["scores"]["weighted"])
    detailed = set(by_score[:DETAILED])
    target_names = {norm_name(name) for name in bp.TARGET_STRATEGIES}

    out = ["== CANDIDATES (module scores; 'why' = module score rationale) =="]
    for key, (res, cand) in index.items():
        scores, grades = cand["scores"], cand["evidence_grade_by_outcome"]
        out.append(f"[{key}] {cand['strategy_name']}")
        out.append(f"  {cand['category']} | {cand['phase_relevance']} | grade {cand['evidence_grade']} "
                   f"(WLM {grades['long_term_weight_maintenance']}, lean mass {grades['lean_mass_preservation']}) | "
                   + " ".join(f"C{i} {scores[k]}" for i, k in enumerate(SCORE_KEYS, 1)) + f" = {scores['weighted']}")
        if key in detailed:
            out.append("  why: " + clip(cand["score_rationale"], level["why"]))
            if level["effects"]:
                out.append("  effects: " + clip(cand["effect_size_summary"], level["effects"]))
            if level["against"]:
                out.append("  against: " + clip(cand["counter_evidence_and_uncertainties"], level["against"]))
        else:
            out.append("  why: " + clip(cand["score_rationale"], level["other_why"]))
        if norm_name(cand["strategy_name"]) in target_names:
            lines = [t.strip() for t in str(cand["actionable_protocol"]["quantitative_targets"]).splitlines() if t.strip()]
            out += [f"  target: {clip(t, level['target_chars'])}" for t in lines[:level["target_lines"]]]
        out.append("  ids: " + ", ".join(cand["citation_ids"][:level["ids"]]))
    out.append("")

    extra = [(res.mid, text) for res in modules for text in res.answer.get("additional_candidates", [])]
    if extra:
        out.append("== ADDITIONAL CANDIDATES (no dossier; cannot enter the top 10) ==")
        out += [f"- ({mid}) {clip(text, 260)}" for mid, text in extra]
        out.append("")

    heuristics = sorted(((res.mid, h) for res in modules for h in res.answer.get("heuristic_tests", [])),
                        key=lambda pair: id_number(pair[1]["heuristic_id"]))
    if heuristics:
        out.append("== HEURISTIC VERDICTS ==")
        for mid, h in heuristics:
            out.append(f"- {h['heuristic_id']} ({mid}) {clip(h['claim'], 90)} -> {h['verdict']} "
                       f"({h['confidence_in_verdict']}): {clip(h['verdict_explanation'], level['interp'])} "
                       f"[{'; '.join(h['citation_ids'][:4])}]")
        out.append("")

    conflicts = sorted(((res.mid, k) for res in modules for k in res.answer.get("evidence_conflicts", [])),
                       key=lambda pair: id_number(pair[1]["conflict_id"]))
    if conflicts:
        out.append("== CONFLICT INTERPRETATIONS ==")
        for mid, k in conflicts:
            out.append(f"- {k['conflict_id']} ({mid}) {clip(k['topic'], 90)}: "
                       f"{clip(k['current_best_interpretation'], level['interp'])} "
                       f"({k['confidence_in_interpretation']}) [{'; '.join(k['citation_ids'][:4])}]")
        out.append("")

    if level["refs"]:
        used = set(MODULE_REF_RE.findall("\n".join(out)))
        refs = [ref for res in modules for ref in res.answer.get("references", []) if ref.get("id") in used]
        if refs:
            out.append("== REFERENCE INDEX (module ids cited above) ==")
            out += [f"{ref['id']}: {ref['study_type']} | {clip(ref['citation'], 80)}" for ref in refs]
    return "\n".join(out).rstrip()


def cmd_synth_input(paths, output):
    modules, synthesis = split_results([load(p) for p in paths])
    if synthesis:
        print(f"Hinweis: {len(synthesis)} Synthese-Datei(en) ignoriert.")
    if not modules:
        sys.exit("Keine Moduldateien (M1-M6) angegeben.")
    template = (bp.ROOT / bp.SYNTHESIS_TEMPLATE_FILE).read_text(encoding="utf-8")
    limit = bp.INPUT_LIMIT - 200
    for n, level in enumerate(TRIM_LEVELS):
        text = template.replace(bp.EVIDENCE_PACK_PLACEHOLDER, build_pack(modules, level))
        if len(text) <= limit:
            break
    else:
        sys.exit(f"Auch gekürzt {len(text):,} Zeichen (> {limit:,}). Weniger Module pro Synthese übergeben.")
    target = Path(output) if output else Path(paths[0]).parent / "M7_synthesis_INPUT.txt"
    target.write_text(text, encoding="utf-8")
    count = len(candidate_index(modules))
    print(f"{target}: {len(text):,} Zeichen (Limit {bp.INPUT_LIMIT:,}), Kürzungsstufe {n}, "
          f"{count} Kandidaten aus {', '.join(r.mid for r in modules)}")
    missing = [m["id"] for m in bp.MODULES if not any(r.mid.startswith(m["id"]) for r in modules)]
    if missing:
        print(f"Achtung: keine Ergebnisse für {', '.join(missing)}; deren Kandidaten fehlen im Ranking.")
    return 0


# --------------------------------------------------------------------------
# merge
# --------------------------------------------------------------------------

def strip_accents(text):
    return "".join(ch for ch in unicodedata.normalize("NFKD", text) if not unicodedata.combining(ch))


def base_id(old_id, ref):
    match = MODULE_REF_PARTS_RE.match(old_id)
    if match:
        base = match.group(1)
    else:
        citation = str(ref.get("citation", ""))
        surname = re.match(rf"\s*({LETTER}+)", citation)
        year = re.search(r"\b(?:19|20)\d{2}\b", citation)
        base = (surname.group(1) if surname else "Ref") + (year.group(0) if year else "")
    return strip_accents(base).replace("'", "")


def group_references(results, problems):
    """Deduplicate references across runs. Returns (groups, old_id -> group index)."""
    entries = [(str(ref.get("id", "")).strip(), ref) for res in results for ref in res.answer.get("references", [])]
    parent = list(range(len(entries)))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    owner = {}
    for i, (_, ref) in enumerate(entries):
        # DOI decides; PMID/PMC only without DOI, so a wrong retrieved_url cannot merge two papers
        dois, others = ref_keys(ref)
        keys = dois or others or {"cit:" + re.sub(r"[^a-z0-9]", "", str(ref.get("citation", "")).lower())[:80]}
        for key in keys:
            if key in owner:
                parent[find(i)] = find(owner[key])
            else:
                owner[key] = i

    members = {}
    for i in range(len(entries)):
        members.setdefault(find(i), []).append(i)
    groups, old_to_group = [], {}
    for indices in members.values():
        old_id, ref = entries[indices[0]]
        groups.append({"base": base_id(old_id, ref), "ref": ref})
        for i in indices:
            if old_to_group.get(entries[i][0], len(groups) - 1) != len(groups) - 1:
                problems.append(f"ID {entries[i][0]} steht für verschiedene Quellen")
            old_to_group[entries[i][0]] = len(groups) - 1
    return groups, old_to_group


def assign_global_ids(groups, cited_groups):
    """FirstAuthorYear ids for the cited groups; letter suffix only where author and year repeat."""
    by_base = {}
    for g in sorted(cited_groups):
        by_base.setdefault(groups[g]["base"], []).append(g)
    new_ids = {}
    for base, members in by_base.items():
        for n, g in enumerate(members):
            suffix = "" if len(members) == 1 else ("abcdefghijklmnopqrstuvwxyz"[n] if n < 26 else str(n))
            new_ids[g] = base + suffix
    return new_ids


def rewrite_ids(node, mapping, unresolved):
    if isinstance(node, str):
        def swap(match):
            old = match.group(0)
            if old in mapping:
                return mapping[old]
            unresolved.add(old)
            return old
        return MODULE_REF_RE.sub(swap, node)
    if isinstance(node, list):
        return [rewrite_ids(value, mapping, unresolved) for value in node]
    if isinstance(node, dict):
        return {key: rewrite_ids(value, mapping, unresolved) for key, value in node.items()}
    return node


def cited_final_ids(final):
    body = {key: value for key, value in final.items() if key != "references"}
    ids = {cid.strip() for ids_ in citation_lists(body) for cid in ids_ if isinstance(cid, str)}
    for text in iter_strings(body):
        for group in BRACKET_RE.findall(text):
            ids.update(token.strip() for token in re.split(r"[;,]", group) if FINAL_REF_RE.match(token.strip()))
    return ids


def heuristic_as_conflict(h):
    return {
        "topic": f"Heuristic test {h['heuristic_id']}: {h['claim']}",
        "conflicting_findings": h["evidence_for_and_against"],
        "current_best_interpretation": f"Verdict: {h['verdict'].replace('_', ' ')}. {h['verdict_explanation']}",
        "confidence_in_interpretation": h["confidence_in_verdict"],
        "citation_ids": h["citation_ids"],
    }


def cmd_merge(paths, output):
    modules, synthesis = split_results([load(p) for p in paths])
    if len(synthesis) != 1:
        sys.exit(f"Genau eine M7-Datei nötig, gefunden: {len(synthesis)}.")
    synth = synthesis[0]
    problems, warnings = [], []
    for res in modules + [synth]:
        schema = bp.synthesis_schema() if res.is_synthesis else bp.module_schema()
        problems += [f"{res.path}: {e}" for e in validate(res.answer, schema)]
    if problems:
        print("Schemafehler in den Eingabedateien, zuerst 'check' ausführen:")
        print("\n".join(f"  {p}" for p in problems[:30]))
        return 1

    index = candidate_index(modules)
    top = []
    for item in sorted(synth.answer["final_ranking"], key=lambda r: r["rank"]):
        entry = index.get(item["candidate_key"].strip())
        if entry is None:
            entry = next(((r, c) for r, c in index.values()
                          if norm_name(c["strategy_name"]) == norm_name(item["strategy_name"])), None)
        if entry is None:
            problems.append(f"Rang {item['rank']}: Kandidat {item['candidate_key']} / {item['strategy_name']} "
                            "in keinem Modul gefunden")
            continue
        top.append({"rank": item["rank"], **{key: entry[1][key] for key in STRATEGY_FIELDS}})

    conflicts = sorted((k for res in modules for k in res.answer["evidence_conflicts"]),
                       key=lambda k: id_number(k["conflict_id"]))
    heuristics = sorted((h for res in modules for h in res.answer["heuristic_tests"]),
                        key=lambda h: id_number(h["heuristic_id"]))
    final = {
        "ranking_methodology": synth.answer["ranking_methodology"],
        "top_10_strategies": top,
        "physiological_targets_summary": synth.answer["physiological_targets_summary"],
        "synergy_matrix": synth.answer["synergy_matrix"],
        "evidence_conflicts": [{key: value for key, value in k.items() if key != "conflict_id"} for k in conflicts]
                              + [heuristic_as_conflict(h) for h in heuristics],
        "key_limitations": [text for res in modules for text in res.answer["key_limitations"]],
        "considered_but_excluded": synth.answer["considered_but_excluded"],
        "references": [],
    }

    groups, old_to_group = group_references(modules + [synth], problems)
    cited_old = cited_module_ids(final)
    new_ids = assign_global_ids(groups, {old_to_group[i] for i in cited_old if i in old_to_group})
    mapping = {old: new_ids[g] for old, g in old_to_group.items() if g in new_ids}
    unresolved = set()
    final = rewrite_ids(final, mapping, unresolved)
    refs = {new_id: {**{k: v for k, v in groups[g]["ref"].items() if k != "retrieved_url"}, "id": new_id}
            for g, new_id in new_ids.items()}
    cited = cited_final_ids(final)
    unresolved |= cited - set(refs)
    final["references"] = [refs[i] for i in sorted(refs, key=str.lower)]
    if unresolved:
        problems.append(f"zitierte IDs ohne Referenz: {', '.join(sorted(unresolved))}")

    original = json.loads((bp.ROOT / "00_original_output_schema.json").read_text(encoding="utf-8"))
    problems += validate(final, original)
    if [s["rank"] for s in top] != list(range(1, 11)):
        problems.append(f"top_10_strategies hat {len(top)} Einträge bzw. Lücken in den Rängen")
    for key, minimum in MINIMUMS.items():
        if len(final[key]) < minimum:
            warnings.append(f"{key}: {len(final[key])} Einträge (Minimum laut Prompt: {minimum})")
    if len(final["references"]) < 40:
        warnings.append(f"nur {len(final['references'])} Referenzen (der Original-Prompt erwartet typischerweise >= 40)")
    missing = [m["id"] for m in bp.MODULES if not any(r.mid.startswith(m["id"]) for r in modules)]
    if missing:
        warnings.append(f"keine Ergebnisse für {', '.join(missing)}")

    target = Path(output) if output else synth.path.parent / "final_merged.json"
    target.write_text(json.dumps(final, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    deduplicated = sum(len(r.answer["references"]) for r in modules + [synth]) - len(groups)
    print(f"{target}: {len(top)} Strategien, {len(final['evidence_conflicts'])} Konflikte/Heuristiken, "
          f"{len(final['key_limitations'])} Limitationen, {len(final['references'])} Referenzen "
          f"({deduplicated} Dubletten zusammengeführt, {len(groups) - len(refs)} nur in nicht übernommenen "
          "Dossiers zitiert)")
    for line in problems:
        print(f"  FEHLER:  {line}")
    for line in warnings:
        print(f"  HINWEIS: {line}")
    if not problems:
        print("  OK: entspricht 00_original_output_schema.json, alle Zitate lösen auf.")
    return 1 if problems else 0


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("check", help="Ergebnisdateien prüfen").add_argument("files", nargs="+")
    synth = sub.add_parser("synth-input", help="M7-Input aus den Modulergebnissen bauen")
    synth.add_argument("files", nargs="+")
    synth.add_argument("-o", "--output")
    merge = sub.add_parser("merge", help="M1-M7 zum Original-Schema zusammenführen")
    merge.add_argument("files", nargs="+", help="Moduldateien und die M7-Datei")
    merge.add_argument("-o", "--output")
    args = parser.parse_args()
    paths = expand(args.files)
    if args.command == "check":
        return cmd_check(paths)
    if args.command == "synth-input":
        return cmd_synth_input(paths, args.output)
    return cmd_merge(paths, args.output)


if __name__ == "__main__":
    sys.exit(main())
