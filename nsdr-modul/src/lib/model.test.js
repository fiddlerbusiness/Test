import test from "node:test";
import assert from "node:assert/strict";
import { bandShares, dominantBand, effectLevels, formatMinutes, phaseAt, traceColor } from "./model.js";

test("Bandanteile summieren sich zu 1", () => {
  for (let t = 0; t <= 20; t += 0.25) {
    const s = bandShares(t);
    const sum = Object.values(s).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `t=${t}: ${sum}`);
  }
});

test("Dominantes Band folgt dem Modell Beta → Alpha → Theta → Alpha", () => {
  assert.equal(dominantBand(0).id, "beta");
  assert.equal(dominantBand(3).id, "alpha");
  assert.equal(dominantBand(14).id, "theta");
  assert.equal(dominantBand(19.5).id, "alpha");
});

test("Delta dominiert nie (das wäre Tiefschlaf)", () => {
  for (let t = 0; t <= 20; t += 0.1) assert.notEqual(dominantBand(t).id, "delta");
});

test("Effekt-Level bleiben in [0, 1]", () => {
  for (let t = 0; t <= 20; t += 0.5) {
    for (const v of Object.values(effectLevels(t))) assert.ok(v >= 0 && v <= 1);
  }
});

test("Phasen und Zeitformat", () => {
  assert.equal(phaseAt(0).id, "p1");
  assert.equal(phaseAt(2).id, "p2");
  assert.equal(phaseAt(14.9).id, "p3");
  assert.equal(phaseAt(20).id, "p4");
  assert.equal(formatMinutes(7.5), "07:30");
  assert.equal(formatMinutes(20), "20:00");
});

test("Kurvenfarbe ist ein gültiger rgb()-String", () => {
  assert.match(traceColor(bandShares(10)), /^rgb\(\d+, \d+, \d+\)$/);
});
