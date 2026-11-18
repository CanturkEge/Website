import { test } from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";
import { QUESTIONS, ITEMS, COURSES, DUNGEONS } from "../game-data.js";
import { DS_SOURCES } from "../ds-sources.js";
import { courseUnits, courseLessons, learningState, markLesson } from "../learning.js";
import { gradeAnswer, publicQuestion } from "../question-utils.js";

const bank = QUESTIONS.filter(q => q.course === "structures");
function hunter() {
  const s = E.freshState();
  E.chooseClass(s, "sage");
  E.switchCourse(s, "structures");
  s.xp = 20000;
  return s;
}
test("Data Structures opens with 180 sourced questions across all six weeks and five tiers", () => {
  const course = COURSES.find(c => c.id === "structures");
  assert.equal(course.locked, false);
  assert.equal(course.topics.length, 6);
  assert.equal(bank.length, 180);
  assert.equal(new Set(bank.map(q => q.prompt)).size, 180);
  for (let topic = 0; topic < 6; topic++) {
    const qs = bank.filter(q => q.topic === topic);
    assert.equal(qs.length, 30);
    for (let d = 1; d <= 5; d++) {
      const tier = qs.filter(q => q.difficulty === d);
      assert.equal(tier.length, 6);
      assert.equal(new Set(tier.map(q => q.type)).size, 6);
    }
  }
  for (const q of bank) {
    const source = DS_SOURCES[q.topic];
    assert.equal(q.sourceFile, source.file);
    assert(q.sourcePages.length > 0);
    assert(q.sourcePages.every(p => Number.isInteger(p) && p > 0 && p <= source.pages), q.id);
    assert(q.explanation.length >= 40 && q.hint && q.source, q.id);
    assert.equal(new Set(q.options).size, q.options.length, q.id);
    assert(gradeAnswer(q, q.type === "short" ? q.answer[0] : q.answer), q.id);
    if (q.type === "order") assert.deepEqual([...q.answer].sort(), [...q.options].sort());
    if (q.type === "match") assert.equal(new Set(q.answer).size, q.answer.length);
    if (q.type === "multi") assert(q.answer.length > 1 && q.answer.every(i => Number.isInteger(i) && i >= 0 && i < q.options.length));
    const visible = publicQuestion(q);
    assert(!("answer" in visible) && !("hint" in visible) && !("numeric" in visible));
  }
});
test("Data Structures allocates distinct valid exams at every tier and completes all eight rooms", () => {
  for (const d of DUNGEONS) {
    for (let seed = 1; seed <= 20; seed++) {
      const s = hunter();
      let n = seed;
      const rng = () => (n = (Math.imul(n, 1664525) + 1013904223) >>> 0) / 4294967296;
      const rooms = E.makeRoomExams(s, d, rng);
      const ids = rooms.flatMap(r => r.queue);
      assert.equal(ids.length, 23);
      assert.equal(new Set(ids).size, 23);
      rooms.forEach((r,i) => r.queue.forEach(id => {
        const q = bank.find(q => q.id === id);
        assert(q, id);
        assert(E.ROOMS[i].types.includes(q.type));
        assert.equal(q.difficulty, Math.min(5, d.difficulty + (i >= 6 ? 1 : 0)));
      }));
    }
    const s = hunter();
    E.startRun(s, d.id);
    while (s.run.status === "active") {
      if (s.run.roomMode === "map") E.enterRoom(s, s.run.index);
      if (s.run.roomMode === "report") { E.nextRoom(s); continue; }
      const q = E.displayQuestion(s);
      E.answer(s, q.type === "short" ? q.answer[0] : q.answer);
      if (s.run.status === "active") E.nextQuestion(s);
    }
    assert.equal(s.run.status, "won");
    assert.equal(s.run.correct, 23);
    assert(s.run.drops.some(id => ITEMS.find(i => i.id === id && i.course === "structures" && i.slot === "notes")));
  }
});
test("six units, 24 lessons and 48 cards/checks save independently from OOD and Modeling", () => {
  const units = courseUnits("structures"), lessons = courseLessons("structures");
  assert.equal(units.length, 6);
  assert.equal(lessons.length, 24);
  assert.equal(lessons.flatMap(l => l.cards).length, 48);
  assert.equal(lessons.flatMap(l => l.checks).length, 48);
  for (const l of lessons) {
    assert.equal(l.sections.length, 3);
    assert(l.source && l.sections.every(s => s.title && s.text.length >= 60));
    for (const q of l.checks) assert(q.options[q.answer] && q.explanation && new Set(q.options).size === q.options.length);
  }
  const s = hunter();
  markLesson(s, lessons[0].id);
  learningState(s).cards[lessons[0].cards[0].id] = "known";
  for (const other of ["oop", "simulation"]) {
    E.switchCourse(s, other);
    assert.equal(learningState(s).read.length, 0);
    assert.throws(() => markLesson(s, lessons[0].id));
  }
  E.switchCourse(s, "structures");
  const restored = E.normalize(JSON.parse(JSON.stringify(s)));
  assert(learningState(restored).read.includes(lessons[0].id));
  assert.equal(learningState(restored).cards[lessons[0].cards[0].id], "known");
  assert.equal(E.bank(restored).length, 180);
});
test("Data Structures cheat sheets grant free scoped hints and enter the course market", () => {
  const sheets = ITEMS.filter(i => i.course === "structures" && i.slot === "notes");
  assert.equal(sheets.length, 7);
  assert(sheets.every(i => i.sheet.length >= 4));
  const s = hunter();
  s.inventory["notes-ds-1"] = 1;
  E.equip(s, "notes-ds-1");
  E.startRun(s, "e");
  const q = bank.find(q => q.topic === 0 && q.type === "mc");
  s.run.rooms[0].queue[0] = q.id;
  E.enterRoom(s, 0);
  const mp = s.run.mp;
  E.useSkill(s, "notes");
  assert.equal(s.run.mp, mp);
  assert(s.run.hint && s.run.noteUses === 1);
  E.leaveRun(s);
  for (const other of ["oop", "simulation"]) {
    E.switchCourse(s, other);
    E.startRun(s, "e");
    E.enterRoom(s, 0);
    assert.throws(() => E.useSkill(s, "notes"));
    E.leaveRun(s);
  }
  E.switchCourse(s, "structures");
  for (const o of E.marketOffers(s).filter(o => o.kind === "gear")) {
    const i = E.item(o.itemId);
    assert(!i.course || i.course === "structures");
  }
});
