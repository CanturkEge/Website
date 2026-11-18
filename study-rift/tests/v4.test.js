import { test } from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";
import { QUESTIONS } from "../game-data.js";
import {
  courseUnits,
  courseLessons,
  learningState,
  markLesson,
} from "../learning.js";
const hunter = () => {
  const s = E.freshState();
  E.chooseClass(s, "sage");
  return s;
};
const correct = (s, training = false) => {
  const q = E.displayQuestion(s, training);
  return q.type === "short" ? q.answer[0] : q.answer;
};
function clearRoom(s) {
  E.enterRoom(s, s.run.index);
  while (s.run.roomMode === "question") {
    E.answer(s, correct(s));
    E.nextQuestion(s);
  }
}
test("answer feedback stays inside room; abilities refresh per room, not per question", () => {
  const s = hunter();
  E.startRun(s, "e");
  E.enterRoom(s, 0);
  E.useSkill(s, "hint");
  E.answer(s, correct(s));
  assert.equal(s.run.roomMode, "question");
  assert.equal(s.run.index, 0);
  E.nextQuestion(s);
  assert.equal(s.run.index, 0);
  assert.equal(s.run.questionIndex, 1);
  assert.throws(() => E.useSkill(s, "hint"));
  E.answer(s, correct(s));
  E.nextQuestion(s);
  assert.equal(s.run.roomMode, "report");
  assert.equal(E.nextQuestion(s), null);
  E.nextRoom(s);
  E.enterRoom(s, 1);
  E.useSkill(s, "hint");
  assert(s.run.hint);
});
test("persistent room deadline cannot restart, and expiry blocks late answers and second chance", () => {
  const s = hunter();
  E.startRun(s, "e");
  clearRoom(s);
  E.nextRoom(s);
  E.enterRoom(s, 1);
  const deadline = s.run.rooms[1].deadline;
  const restored = E.normalize(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.run.rooms[1].deadline, deadline);
  assert.throws(() => E.enterRoom(restored, 1));
  const n = restored.stats.answered;
  restored.run.rooms[1].deadline = Date.now() - 1;
  assert.throws(() => E.answer(restored, correct(restored)));
  assert.equal(restored.stats.answered, n);
  assert.equal(restored.run.status, "failed");
  assert(restored.run.timedOut);
  assert.throws(() => E.useSkill(restored, "second"));
  E.retryRun(restored);
  assert.equal(restored.run.index, 0);
  assert.equal(restored.run.rooms[1].deadline, null);
});
test("final timely answer stops room clock before reading its feedback", () => {
  const s = hunter();
  E.startRun(s, "e");
  clearRoom(s);
  E.nextRoom(s);
  E.enterRoom(s, 1);
  const room = s.run.rooms[1];
  while (s.run.questionIndex < room.queue.length - 1) {
    E.answer(s, correct(s));
    E.nextQuestion(s);
  }
  E.answer(s, correct(s));
  assert.equal(s.run.roomMode, "question");
  assert.equal(room.deadline, null);
  assert(!E.expireRun(s, Date.now() + 10000000));
  E.nextQuestion(s);
  assert.equal(s.run.roomMode, "report");
});
test("v0.3 active runs preserve single-question rooms and old answers without retroactive time limits", () => {
  const s = hunter();
  s.version = 3;
  E.startRun(s, "e");
  s.run.queue = s.run.rooms.map((r) => r.queue[0]);
  delete s.run.rooms;
  delete s.run.questionIndex;
  s.run.roomMode = "question";
  const normalized = E.normalize(s);
  assert.equal(normalized.run.rooms.length, 8);
  assert(
    normalized.run.rooms.every((r) => r.queue.length === 1 && r.seconds === 0),
  );
  assert.equal(E.currentQuestion(normalized).id, s.run.queue[0]);
  assert.equal(normalized.classId, "sage");
});
test("mana regeneration is scarce and wrong answers drain mana as well as health", () => {
  const s = hunter();
  E.startRun(s, "e");
  E.enterRoom(s, 0);
  s.run.mp = 0;
  E.answer(s, correct(s));
  assert(s.run.mp > 0 && s.run.mp <= 8);
  E.nextQuestion(s);
  s.run.mp = 20;
  E.answer(s, "definitely-incorrect");
  assert.equal(s.run.mp, 12);
  assert.equal(s.run.feedback.mana, -8);
  assert(s.run.feedback.damage > 0);
});
test("timed training mission requires explicit start, expires, retries and grants one daily reward", () => {
  const s = hunter();
  for (let i = 0; i < 5; i++) {
    E.startTraining(s);
    E.answer(s, correct(s, true), true);
  }
  assert.equal(s.daily.ids.length, 0);
  assert(!s.daily.claimed);
  E.startDaily(s);
  const first = s.daily.deadline;
  s.daily.deadline = Date.now() - 1;
  E.startTraining(s);
  E.answer(s, correct(s, true), true);
  assert(s.daily.failed);
  assert(!s.daily.claimed);
  const rewarded = s.daily.rewardedIds.length;
  E.startDaily(s);
  assert(s.daily.deadline >= first);
  assert.equal(s.daily.rewardedIds.length, rewarded);
  const gold = s.gold,
    potions = s.inventory.potion;
  for (let i = 0; i < 5; i++) {
    E.startTraining(s);
    E.answer(s, correct(s, true), true);
  }
  assert(s.daily.claimed);
  assert.equal(s.gold, gold + 35);
  assert.equal(s.inventory.potion, potions + 1);
  assert.throws(() => E.startDaily(s));
  E.startTraining(s);
  E.answer(s, correct(s, true), true);
  assert.equal(s.gold, gold + 35);
});
test("learning path has scoped unit lessons, valid mini checks and durable read/card progress", () => {
  const s = hunter(),
    units = courseUnits("oop"),
    lessons = courseLessons("oop");
  assert.equal(units.length, 6);
  assert.equal(lessons.length, 18);
  assert.equal(new Set(lessons.map((l) => l.id)).size, 18);
  for (const l of lessons) {
    assert(l.sections.length >= 3);
    assert(l.cards.length >= 2);
    assert(l.checks.every((q) => q.options[q.answer] && q.explanation));
  }
  markLesson(s, "java-1");
  markLesson(s, "java-1");
  learningState(s).cards["java-1-card-0"] = "review";
  const restored = E.normalize(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(learningState(restored).read, ["java-1"]);
  assert.equal(learningState(restored).cards["java-1-card-0"], "review");
  restored.course = "os";
  assert.equal(learningState(restored).read.length, 0);
  assert.throws(() => markLesson(restored, "java-1"));
  assert.equal(courseLessons("os").length, 0);
});

test("untouched v0.3 room maps upgrade without restarting rewards or losing daily XP history", () => {
  const s = hunter();
  s.version = 3;
  s.xp = 150;
  E.startRun(s, "e");
  s.run.queue = s.run.rooms.map((r) => r.queue[0]);
  delete s.run.rooms;
  delete s.run.questionIndex;
  s.daily.ids = ["j1"];
  delete s.daily.rewardedIds;
  const upgraded = E.normalize(s);
  assert.equal(upgraded.run.queue.length, 23);
  assert.equal(upgraded.run.index, 0);
  assert.equal(upgraded.stats.runs, 1);
  assert.equal(upgraded.xp, 150);
  assert.deepEqual(upgraded.daily.rewardedIds, ["j1"]);
  assert.deepEqual(upgraded.daily.ids, []);
});
