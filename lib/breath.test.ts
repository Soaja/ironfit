// Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { breathAt } from "./breath.ts";

test("box breathing phases, countdown and cycles", () => {
  const s0 = breathAt(0);
  assert.ok(!s0.done && s0.label === "Inspira" && s0.secondsLeft === 4 && s0.cycle === 1);
  const s1 = breathAt(4000);
  assert.ok(!s1.done && s1.phase === 1 && s1.label === "Trattieni");
  const s2 = breathAt(9500);
  assert.ok(!s2.done && s2.label === "Espira" && s2.secondsLeft === 3 && Math.abs(s2.progress - 0.375) < 1e-9);
  const s3 = breathAt(16000);
  assert.ok(!s3.done && s3.cycle === 2 && s3.label === "Inspira");
  assert.deepEqual(breathAt(64000), { done: true, cycle: 4 });
  const neg = breathAt(-50);
  assert.ok(!neg.done && neg.phase === 0);
});
