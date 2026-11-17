import { test } from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";
import { QUESTIONS, ITEMS, COURSES, DUNGEONS } from "../game-data.js";
import { SIMULATION_SOURCES } from "../simulation-sources.js";
import {
  courseUnits,
  courseLessons,
  learningState,
  markLesson,
} from "../learning.js";
import {
  gradeAnswer,
  parseNumericAnswer,
  publicQuestion,
} from "../question-utils.js";
const hunter = () => {
  const s = E.freshState();
  E.chooseClass(s, "sage");
  E.switchCourse(s, "simulation");
  s.xp = 20000;
  return s;
};
const bank = QUESTIONS.filter((q) => q.course === "simulation");
test("Modeling opens with 220 unique questions, all 11 source chapters and balanced five tiers", () => {
  assert.equal(COURSES.filter((c) => !c.locked).length, 2);
  assert.equal(bank.length, 220);
  assert.equal(new Set(bank.map((q) => q.prompt)).size, 220);
  for (let chapter = 0; chapter < 11; chapter++) {
    const qs = bank.filter((q) => q.topic === chapter);
    assert.equal(qs.length, 20);
    assert.equal(new Set(qs.map((q) => q.type)).size, 6);
    for (let difficulty = 1; difficulty <= 5; difficulty++)
      assert.equal(qs.filter((q) => q.difficulty === difficulty).length, 4);
  }
});
test("source references, answer options and metadata are structurally valid", () => {
  for (const q of bank) {
    const source = SIMULATION_SOURCES[q.topic];
    assert.equal(q.sourceFile, source.file);
    assert(
      q.sourcePages.length &&
        q.sourcePages.every(
          (p) => Number.isInteger(p) && p >= 1 && p <= source.pages,
        ),
    );
    assert(q.explanation.length > 40 && q.hint && q.source);
    assert.equal(new Set(q.options).size, q.options.length);
    assert(gradeAnswer(q, q.type === "short" ? q.answer[0] : q.answer));
    if (q.type === "multi")
      assert(
        q.answer.length > 1 &&
          q.answer.every((i) => Number.isInteger(i) && i < q.options.length),
      );
    if (q.type === "order")
      assert.deepEqual([...q.options].sort(), [...q.answer].sort());
    if (q.type === "match")
      assert.equal(new Set(q.answer).size, q.answer.length);
    if (q.numeric) {
      assert(Number.isFinite(q.numeric.value));
      assert(q.numeric.tolerance >= 0);
      assert.equal(q.answerFormat.kind, "number");
    }
  }
});
test("numeric shorts accept decimal comma, exponent, fractions and explicit units with bounded tolerance", () => {
  const q = {
    type: "short",
    answer: ["0.3333"],
    numeric: { value: 1 / 3, tolerance: 0.000051, units: ["saat", "h"] },
    answerFormat: { kind: "number" },
  };
  for (const value of ["0,3333", "0.3333", "1/3", "3.333333e-1", "0,3333 saat"])
    assert(gradeAnswer(q, value), value);
  for (const value of [
    "",
    "NaN",
    "Infinity",
    "1/0",
    "0.3334",
    "33%",
    "0.3333 dakika",
    "0,3,3",
    "1+2",
    "0.3333 junk",
  ])
    assert(!gradeAnswer(q, value), value);
  assert.equal(parseNumericAnswer("−2"), -2);
  assert.equal(parseNumericAnswer("1e309"), null);
  assert(gradeAnswer({ type: "short", answer: ["İstatistik"] }, "istatistik"));
  const visible = publicQuestion({ ...q, id: "x", numeric: q.numeric });
  assert(!("numeric" in visible));
  assert(!("answer" in visible));
  assert.equal(visible.answerFormat.kind, "number");
});
test("all Modeling tiers can allocate and complete eight rooms without repeats or course leakage", () => {
  for (const d of DUNGEONS) {
    for (let seed = 1; seed <= 12; seed++) {
      const s = hunter();
      let n = seed;
      const rng = () =>
        (n = (Math.imul(n, 1664525) + 1013904223) >>> 0) / 4294967296;
      const rooms = E.makeRoomExams(s, d, rng),
        ids = rooms.flatMap((r) => r.queue);
      assert.equal(ids.length, 23);
      assert.equal(new Set(ids).size, 23);
      rooms.forEach((room, i) =>
        room.queue.forEach((id) => {
          const q = bank.find((q) => q.id === id);
          assert(q);
          assert(E.ROOMS[i].types.includes(q.type));
          assert.equal(
            q.difficulty,
            Math.min(5, d.difficulty + (i >= 6 ? 1 : 0)),
          );
        }),
      );
    }
    const s = hunter();
    E.startRun(s, d.id);
    while (s.run.status === "active") {
      const r = s.run;
      if (r.roomMode === "map") E.enterRoom(s, r.index);
      if (r.roomMode === "report") {
        E.nextRoom(s);
        continue;
      }
      const q = E.displayQuestion(s);
      E.answer(s, q.type === "short" ? q.answer[0] : q.answer);
      if (s.run.status === "active") E.nextQuestion(s);
    }
    assert.equal(s.run.status, "won");
    assert.equal(s.run.correct, 23);
    assert(
      s.run.drops.some((id) =>
        ITEMS.find(
          (i) => i.id === id && i.slot === "notes" && i.course === "simulation",
        ),
      ),
    );
  }
});
test("Modeling has 36 sourced lessons, 72 flashcards and optional checks with independent progress", () => {
  const units = courseUnits("simulation"),
    lessons = courseLessons("simulation");
  assert.equal(units.length, 11);
  assert.equal(lessons.length, 36);
  assert.equal(lessons.flatMap((l) => l.cards).length, 72);
  assert.equal(lessons.flatMap((l) => l.checks).length, 72);
  for (const l of lessons) {
    assert.equal(l.sections.length, 3);
    assert(l.source);
    for (const q of l.checks) assert(q.options[q.answer] && q.explanation);
  }
  const s = hunter();
  markLesson(s, lessons[0].id);
  assert.deepEqual(learningState(s).read, [lessons[0].id]);
  E.switchCourse(s, "oop");
  assert.equal(learningState(s).read.length, 0);
  assert.throws(() => markLesson(s, lessons[0].id));
  E.switchCourse(s, "simulation");
  assert(learningState(E.normalize(s)).read.includes(lessons[0].id));
});
test("Modeling cheat sheets are functional course-scoped loot and market offers", () => {
  const sheets = ITEMS.filter(
    (i) => i.course === "simulation" && i.slot === "notes",
  );
  assert.equal(sheets.length, 12);
  assert(sheets.every((i) => i.sheet.length >= 3));
  const s = hunter(),
    q = bank[0];
  s.inventory["notes-sim-01"] = 1;
  E.equip(s, "notes-sim-01");
  E.startRun(s, "e");
  s.run.rooms[0].queue[0] = q.id;
  s.run.queue[0] = q.id;
  E.enterRoom(s, 0);
  const mp = s.run.mp;
  E.useSkill(s, "notes");
  assert.equal(s.run.mp, mp);
  assert(s.run.hint);
  assert.equal(s.run.noteUses, 1);
  E.leaveRun(s);
  E.switchCourse(s, "oop");
  E.startRun(s, "e");
  E.enterRoom(s, 0);
  assert.throws(() => E.useSkill(s, "notes"));
  E.leaveRun(s);
  E.switchCourse(s, "simulation");
  assert(
    E.marketOffers(s)
      .filter((o) => o.kind === "gear")
      .every(
        (o) =>
          !ITEMS.find((i) => i.id === o.itemId).course ||
          ITEMS.find((i) => i.id === o.itemId).course === "simulation",
      ),
  );
});
