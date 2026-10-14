#!/usr/bin/env python3
"""Check the 11 You.com lever dossiers and merge them for the synthesis step.

Usage:  python3 qc_merge.py <folder with the saved You.com responses (*.json)>
Writes merged.json and qc_report.txt into that folder.
"""
import json
import re
import sys
from pathlib import Path

REQUIRED = ["lever_id", "lever_name", "research_status", "overall_evidence_level", "evidence_summary",
            "comparisons", "findings_by_training_status", "dose_response_and_ceiling", "counter_evidence",
            "limitations", "newest_evidence_verdict", "impact_scoring", "practical_implication",
            "open_questions", "verification_log", "omitted_due_to_length", "sources"]
LEVERS = [f"L{i:02d}" for i in range(1, 12)]
BRACKETS = re.compile(r"\[([^\[\]]*)\]")
LOCAL_ID = re.compile(r"\bS\d{1,3}\b")
PREPRINT = re.compile(r"sportrxiv|medrxiv|biorxiv|osf\.io|preprint", re.I)
CAUTION = ["retracted", "expression_of_concern", "correction", "not_checked", "none_found"]


def caution(status):
    return CAUTION.index(status) if status in CAUTION else CAUTION.index("not_checked")


def find_dossier(obj):
    """Return the dossier dict, also when the API wraps it or returns it as a JSON string."""
    if isinstance(obj, dict):
        if "lever_id" in obj and "sources" in obj:
            return obj
        children = obj.values()
    elif isinstance(obj, list):
        children = obj
    elif isinstance(obj, str) and "lever_id" in obj:
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", obj.strip())
        try:
            return find_dossier(json.loads(text))
        except json.JSONDecodeError:
            return None
    else:
        return None
    for child in children:
        found = find_dossier(child)
        if found:
            return found
    return None


def walk_strings(obj, fn):
    """Apply fn to every string in obj (except the sources list) and return the new object."""
    if isinstance(obj, dict):
        return {k: (v if k == "sources" else walk_strings(v, fn)) for k, v in obj.items()}
    if isinstance(obj, list):
        return [walk_strings(v, fn) for v in obj]
    return fn(obj) if isinstance(obj, str) else obj


def source_key(src):
    doi = (src.get("doi") or "").lower().strip()
    doi = re.sub(r"^(https?://(dx\.)?doi\.org/|doi:\s*)", "", doi)
    if doi:
        return "doi:" + doi
    return "cit:" + re.sub(r"[^a-z0-9]", "", (src.get("citation") or "").lower())[:120]


def main(folder):
    folder = Path(folder)
    report, dossiers = [], []

    for f in sorted(folder.glob("*.json")):
        if f.name == "merged.json":
            continue
        try:
            dossier = find_dossier(json.loads(f.read_text(encoding="utf-8")))
        except json.JSONDecodeError as e:
            report.append(f"ERROR {f.name}: invalid JSON ({e}) - output was probably cut off; re-run this lever")
            continue
        if not dossier:
            report.append(f"ERROR {f.name}: no dossier found (no object with lever_id and sources)")
            continue
        dossier["_file"] = f.name
        dossiers.append(dossier)

    found = {d.get("lever_id") for d in dossiers}
    for lever in LEVERS:
        if lever not in found:
            report.append(f"ERROR missing dossier {lever}")

    sources, mapping_all = {}, {}
    for d in dossiers:
        lid, name = d.get("lever_id"), d["_file"]
        tag = f"{lid} ({name})"
        missing = [k for k in REQUIRED if k not in d]
        if missing:
            report.append(f"ERROR {tag}: missing fields {missing}")
        if d.get("research_status") != "complete":
            report.append(f"WARN  {tag}: research_status={d.get('research_status')}")
        if d.get("omitted_due_to_length"):
            report.append(f"WARN  {tag}: omitted_due_to_length={d['omitted_due_to_length']}")
        not_checked = (d.get("verification_log") or {}).get("not_checked") or []
        if not_checked:
            report.append(f"INFO  {tag}: not checked by the agent: {not_checked}")
        scoring = d.get("impact_scoring") or []
        if not scoring or scoring[0].get("scope") != "lever_overall":
            report.append(f"WARN  {tag}: first impact_scoring entry is not scope=lever_overall")
        for status in ("untrained", "trained"):
            if not ((d.get("findings_by_training_status") or {}).get(status) or "").strip():
                report.append(f"WARN  {tag}: findings for {status} are empty")

        local = {}
        for s in d.get("sources") or []:
            if s.get("id") in local:
                report.append(f"ERROR {tag}: duplicate source id {s.get('id')}")
            local[s.get("id")] = s

        referenced = set()
        evidence_refs = set()
        for c in d.get("comparisons") or []:
            evidence_refs.update(c.get("source_ids") or [])
        referenced |= evidence_refs
        def collect(text):
            for group in BRACKETS.findall(text):
                referenced.update(LOCAL_ID.findall(group))
            return text
        walk_strings(d, collect)

        for sid in sorted(referenced - set(local)):
            report.append(f"ERROR {tag}: {sid} is cited but not listed in sources")
        for sid in sorted(set(local) - referenced):
            report.append(f"WARN  {tag}: {sid} is listed but never cited")
        for sid, s in local.items():
            if PREPRINT.search(s.get("citation") or "") and s.get("peer_reviewed") is True:
                report.append(f"WARN  {tag}: {sid} looks like a preprint but peer_reviewed=true")
            if s.get("retraction_status") == "retracted" and sid in evidence_refs:
                report.append(f"ERROR {tag}: retracted source {sid} is used as evidence in comparisons")
            if s.get("retraction_status") == "not_checked":
                report.append(f"WARN  {tag}: retraction status of {sid} not checked")

        mapping = {}
        for sid, s in local.items():
            key = source_key(s)
            if key not in sources:
                sources[key] = dict(s, id=f"G{len(sources) + 1:03d}", used_in=[])
            merged = sources[key]
            merged["used_in"].append(lid)
            status = s.get("retraction_status")
            if caution(status) < caution(merged.get("retraction_status")):
                report.append(f"WARN  {merged['id']}: retraction status differs between dossiers; kept '{status}'")
                merged["retraction_status"] = status
            if s.get("peer_reviewed") is False and merged.get("peer_reviewed") is True:
                report.append(f"WARN  {merged['id']}: peer_reviewed differs between dossiers; kept false")
                merged["peer_reviewed"] = False
            mapping[sid] = merged["id"]
        mapping_all[lid] = mapping

    merged_dossiers = []
    for d in sorted(dossiers, key=lambda x: str(x.get("lever_id"))):
        mapping = mapping_all.get(d.get("lever_id"), {})
        swap = lambda m: mapping.get(m.group(0), m.group(0))
        new = walk_strings(d, lambda t: BRACKETS.sub(lambda g: "[" + LOCAL_ID.sub(swap, g.group(1)) + "]", t))
        for c in new.get("comparisons") or []:
            c["source_ids"] = [mapping.get(s, s) for s in c.get("source_ids") or []]
        new.pop("sources", None)
        new.pop("_file", None)
        merged_dossiers.append(new)

    out = {"dossiers": merged_dossiers, "sources": list(sources.values())}
    (folder / "merged.json").write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding="utf-8")
    errors = sum(line.startswith("ERROR") for line in report)
    summary = (f"{len(dossiers)} dossiers, {len(sources)} unique sources, "
               f"{errors} errors, {sum(line.startswith('WARN') for line in report)} warnings")
    (folder / "qc_report.txt").write_text("\n".join([summary] + report) + "\n", encoding="utf-8")
    print(summary)
    print("\n".join(report))
    return 1 if errors else 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    sys.exit(main(sys.argv[1]))
