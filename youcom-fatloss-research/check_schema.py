#!/usr/bin/env python3
"""Check an output schema against JSON Schema Draft 7 and the documented
You.com Research API output_schema limits (beta, as of Oct 2026):
every object has properties + additionalProperties:false, every property is
required, no top-level anyOf, no bare {"type": "null"}, nesting depth <= 5,
<= 100 properties, <= 500 enum values, string budget <= 25,000.

Usage: python3 check_schema.py 02_OUTPUT_SCHEMA.json
"""
import json
import sys

from jsonschema import Draft7Validator

MAX_DEPTH = 5
MAX_PROPERTIES = 100
MAX_ENUM_VALUES = 500
MAX_STRING_BUDGET = 25_000


def walk(node, path, level, stats, errors):
    """level = nesting level of this node, counting every object/array node."""
    types = node.get("type")
    types = types if isinstance(types, list) else [types]

    if node == {"type": "null"}:
        errors.append(f"{path}: bare null type")

    if "enum" in node:
        stats["enum_values"] += len(node["enum"])
        stats["string_budget"] += sum(len(str(v)) for v in node["enum"])

    if "object" in types:
        stats["max_depth"] = max(stats["max_depth"], level)
        props = node.get("properties")
        if not props:
            errors.append(f"{path}: object without properties")
            props = {}
        if node.get("additionalProperties") is not False:
            errors.append(f"{path}: additionalProperties must be false")
        if set(node.get("required", [])) != set(props):
            errors.append(f"{path}: required does not list exactly all properties")
        for name, child in props.items():
            stats["properties"] += 1
            stats["string_budget"] += len(name)
            walk(child, f"{path}.{name}", level + 1, stats, errors)
    elif "array" in types:
        stats["max_depth"] = max(stats["max_depth"], level)
        walk(node.get("items", {}), f"{path}[]", level + 1, stats, errors)
    else:
        # Scalar leaf: count it as a level too (most conservative reading).
        stats["max_depth_with_leaves"] = max(stats["max_depth_with_leaves"], level)


def main(path):
    with open(path, encoding="utf-8") as f:
        schema = json.load(f)

    Draft7Validator.check_schema(schema)
    errors = []
    if schema.get("type") != "object":
        errors.append("root must be type object")
    if "anyOf" in schema:
        errors.append("top-level anyOf is not allowed")

    stats = {"properties": 0, "enum_values": 0, "string_budget": 0,
             "max_depth": 0, "max_depth_with_leaves": 0}
    walk(schema, "$", 1, stats, errors)

    if stats["max_depth_with_leaves"] > MAX_DEPTH:
        errors.append(f"depth incl. leaves {stats['max_depth_with_leaves']} > {MAX_DEPTH}")
    if stats["properties"] > MAX_PROPERTIES:
        errors.append(f"{stats['properties']} properties > {MAX_PROPERTIES}")
    if stats["enum_values"] > MAX_ENUM_VALUES:
        errors.append(f"{stats['enum_values']} enum values > {MAX_ENUM_VALUES}")
    if stats["string_budget"] > MAX_STRING_BUDGET:
        errors.append(f"string budget {stats['string_budget']} > {MAX_STRING_BUDGET}")

    print(f"file size: {len(open(path, encoding='utf-8').read())} chars")
    for key, value in stats.items():
        print(f"{key}: {value}")
    if errors:
        print("FAIL")
        for e in errors:
            print(" -", e)
        return 1
    print("OK: Draft 7 valid and within documented You.com limits")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "02_OUTPUT_SCHEMA.json"))
