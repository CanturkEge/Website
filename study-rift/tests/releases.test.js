import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compareVersions, RELEASES, VERSION } from "../releases.js";
import { QUESTIONS } from "../game-data.js";
import { gradeAnswer, rankPoints, publicQuestion } from "../question-utils.js";
test("three-part numeric versions do not carry at ten", () => {
  assert(compareVersions("0.3.10", "0.3.9") > 0);
  assert(compareVersions("1.20.0", "1.9.99") > 0);
  assert(compareVersions("0.10.0", "0.9.99") > 0);
  assert.equal(compareVersions("1.20.0", "1.20.0"), 0);
  assert.throws(() => compareVersions("1.2", "1.2.0"));
  assert.equal(VERSION, "0.3.0");
  assert(RELEASES.every((r) => /^\d+\.\d+\.\d+$/.test(r.version)));
});
test("deployed mastery bank matches current content and exact fixed-point budget", () => {
  const snapshot = JSON.parse(
    readFileSync(
      new URL(
        "../supabase/functions/study-rift-mastery/bank.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  assert.deepEqual(snapshot, JSON.parse(JSON.stringify(QUESTIONS)));
  assert.equal(
    [1, 2, 3, 4, 5].reduce((v, d) => v + 2 * rankPoints(d), 0),
    200,
  );
  for (const q of snapshot)
    assert(gradeAnswer(q, q.type === "short" ? q.answer[0] : q.answer));
});

test("public exam questions expose candidates without solutions or hints", () => {
  for (const q of QUESTIONS) {
    const visible = publicQuestion(q);
    assert(!("answer" in visible));
    assert(!("hint" in visible));
    assert(!("explanation" in visible));
    if (q.type === "match")
      assert.deepEqual([...visible.choices].sort(), [...q.answer].sort());
  }
});
