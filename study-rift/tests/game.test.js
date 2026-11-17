import { test } from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";
import {
  QUESTIONS,
  ITEMS,
  SKILLS,
  DUNGEONS,
  CLASSES,
  COURSES,
} from "../game-data.js";
const hunter = (c = "sage") => {
  const s = E.freshState();
  E.chooseClass(s, c);
  return s;
};
const correct = (s, training = false) => {
  const q = E.displayQuestion(s, training);
  return q.type === "short" ? q.answer[0] : q.answer;
};
test("valid questions, difficulty coverage and 16 nodes per class", () => {
  assert.equal(new Set(QUESTIONS.map((q) => q.id)).size, QUESTIONS.length);
  for (let d = 1; d <= 5; d++)
    assert(
      QUESTIONS.filter((q) => q.difficulty === d && q.course === "oop")
        .length >= 8,
    );
  for (const q of QUESTIONS) {
    assert(q.explanation && q.hint && q.source);
    if (["match", "order"].includes(q.type))
      assert.equal(q.options.length, q.answer.length);
    else if (q.type === "short") assert(q.answer.length > 0);
    else if (q.type === "multi") assert(q.answer.every((i) => q.options[i]));
    else assert(q.options[q.answer]);
  }
  for (const c of CLASSES) {
    const nodes = SKILLS.filter((sk) => sk.classId === c.id);
    assert.equal(nodes.length, 16);
    assert.equal(new Set(nodes.map((n) => n.col)).size, 3);
    for (const sk of nodes)
      for (const dep of sk.requires) assert(nodes.some((n) => n.id === dep));
  }
});
test("course locks and migration preserve old progress", () => {
  const s = hunter();
  for (const c of COURSES.filter((c) => c.locked))
    assert.throws(() => E.switchCourse(s, c.id));
  const old = E.normalize({
    version: 1,
    xp: 800,
    inventory: { blade: 1 },
    skills: ["flow"],
    notes: "test",
    cleared: { e: 2 },
  });
  assert.equal(old.xp, 800);
  assert.equal(old.inventory.blade, 1);
  assert.equal(old.classId, null);
  assert.equal(old.notebooks.oop, "test");
  assert.equal(old.cleared["oop:e"], 2);
});
test("rooms use distinct tiered questions and varied examination formats", () => {
  for (const d of DUNGEONS) {
    const s = hunter(),
      rooms = E.makeRoomExams(s, d),
      queue = rooms.flatMap((r) => r.queue);
    assert.equal(rooms.length, 8);
    assert.equal(queue.length, 23);
    assert.equal(new Set(queue).size, 23);
    for (const [i, r] of rooms.entries()) {
      assert.equal(r.queue.length, E.ROOMS[i].count);
      for (const id of r.queue) {
        const q = QUESTIONS.find((q) => q.id === id);
        assert.equal(
          q.difficulty,
          Math.min(5, d.difficulty + (i >= 6 ? 1 : 0)),
        );
        assert(r.types.includes(q.type));
      }
    }
    assert(rooms.some((r) => r.seconds === 0));
    assert(rooms.some((r) => r.seconds > 0));
  }
});
test("duplicate submission cannot farm XP and correct restores mana", () => {
  const s = hunter();
  start(s, "e");
  s.run.mp = 0;
  E.answer(s, correct(s));
  assert(s.run.mp > 0);
  const xp = s.xp;
  assert.throws(() => E.answer(s, correct(s)));
  assert.equal(s.xp, xp);
});
test("full clear grants notes, rewards are idempotent, loadout requires camp", () => {
  const s = hunter();
  start(s, "e");
  while (s.run.status === "active") {
    E.answer(s, correct(s));
    next(s);
  }
  assert.equal(s.run.status, "won");
  assert(s.run.drops.some((id) => E.item(id).slot === "notes"));
  const inv = JSON.stringify(s.inventory);
  next(s);
  assert.equal(JSON.stringify(s.inventory), inv);
  assert.throws(() => E.equip(s, "dagger"));
  E.leaveRun(s);
  const note = Object.keys(s.inventory).find(
    (id) => E.item(id).slot === "notes",
  );
  E.equip(s, note);
  assert.equal(s.equipment.notes, note);
});
test("loot never repeats owned equipment; exhaustion yields essence and consumables", () => {
  const s = hunter(),
    ids = [];
  for (let i = 0; i < 45; i++) ids.push(E.rollLoot(s, "s"));
  const gear = ids.filter((id) => E.item(id).slot !== "consumable");
  assert.equal(gear.length, new Set(gear).size);
  assert(gear.every((id) => ["epic", "legendary"].includes(E.item(id).rarity)));
  const full = hunter();
  for (const i of ITEMS) full.inventory[i.id] = 1;
  assert(["potion", "ether"].includes(E.rollLoot(full, "s")));
  assert(full.essence > 0);
});
test("pity upgrades rarity and guaranteed notes avoid duplicates", () => {
  const s = hunter();
  for (let i = 0; i < 4; i++) E.rollLoot(s, "d", () => 0.9);
  assert.equal(E.item(E.rollLoot(s, "d", () => 0.9)).rarity, "epic");
  assert.notEqual(
    E.rollLoot(s, "e", Math.random, true),
    E.rollLoot(s, "e", Math.random, true),
  );
});
test("class, prerequisite and point constraints", () => {
  const s = hunter();
  assert.throws(() => E.chooseClass(s, "ranger"));
  assert.equal(E.points(s), 0);
  s.xp = 150;
  E.unlock(s, "sage-insight");
  assert.equal(E.attributes(s).hintCost, 12);
  assert.throws(() => E.unlock(s, "warden-mend"));
  assert.throws(() => E.unlock(s, "sage-prophecy"));
});
test("sage prophecy fills correct matches and rejects inappropriate formats", () => {
  const s = hunter();
  s.skills.push("sage-prophecy");
  start(s, "e");
  s.run.rooms[0].queue[0] = QUESTIONS.find((q) => q.type === "match").id;
  E.useSkill(s, "prophecy");
  assert.equal(Object.keys(s.run.fixedMatches).length, 1);
  assert.throws(() => E.useSkill(s, "eliminate"));
});
test("warden second chance preserves HP, does not farm XP or stats", () => {
  const s = hunter("warden");
  s.skills.push("warden-second");
  start(s, "e");
  s.run.hp = 1;
  const q = E.displayQuestion(s);
  E.answer(s, q.type === "match" ? [] : (q.answer + 1) % q.options.length);
  assert.equal(s.run.status, "failed");
  const n = s.stats.answered,
    xp = s.xp;
  E.useSkill(s, "second");
  assert.equal(s.run.status, "active");
  assert.equal(s.run.hp, 1);
  E.answer(s, correct(s));
  assert.equal(s.stats.answered, n);
  assert.equal(s.xp, xp);
  assert.throws(() => E.useSkill(s, "second"));
});
test("ranger wager multiplies XP and evasion blocks damage", () => {
  const s = hunter("ranger");
  s.skills.push("ranger-wager", "ranger-evasion");
  start(s, "e");
  E.useSkill(s, "wager");
  const q = E.displayQuestion(s),
    base = 18 + q.difficulty * 8 + E.attributes(s).xp;
  assert.equal(E.answer(s, correct(s)).xp, 2 * base);
  next(s);
  E.useSkill(s, "evasion");
  const n = E.displayQuestion(s),
    hp = s.run.hp;
  E.answer(s, n.type === "match" ? [] : (n.answer + 1) % n.options.length);
  assert.equal(s.run.hp, hp);
});
test("training topic and difficulty filters, no daily repeated XP", () => {
  const s = hunter(),
    filters = { topic: 0, difficulty: 5 };
  E.startTraining(s, filters);
  const q = E.displayQuestion(s, true);
  assert.equal(q.difficulty, 5);
  assert.equal(q.topic, 0);
  E.answer(s, correct(s, true), true);
  const xp = s.xp,
    old = s.training.id;
  E.startTraining(s, filters);
  assert.notEqual(s.training.id, old);
  s.training = { id: old, answered: false };
  E.answer(s, correct(s, true), true);
  assert.equal(s.xp, xp);
});
test("shop and salvage enforce costs and equipment ownership", () => {
  const s = hunter();
  assert.throws(() => E.buy(s, "potion"));
  s.gold = 55;
  E.buy(s, "ether");
  assert.equal(s.gold, 0);
  assert.throws(() => E.salvage(s, "dagger"));
  E.addItem(s, "blade");
  E.salvage(s, "blade");
  assert.equal(s.inventory.blade, 0);
  assert.equal(s.essence, 25);
});

function start(s, id) {
  const r = E.startRun(s, id);
  E.enterRoom(s, 0);
  return r;
}
function next(s) {
  const step = E.nextQuestion(s);
  if (step === "report") E.nextRoom(s);
  if (s.run?.status === "active" && s.run.roomMode === "map")
    E.enterRoom(s, s.run.index);
  return step;
}

test("bank doubled to 168 and six valid formats", () => {
  assert.equal(QUESTIONS.filter((q) => q.course === "oop").length, 168);
  for (const type of ["mc", "tf", "match", "multi", "order", "short"])
    assert(QUESTIONS.some((q) => q.type === type));
});
test("new formats grade canonical answers, reject partial and duplicate selections", () => {
  for (const q of QUESTIONS) {
    const value = q.type === "short" ? q.answer[0] : q.answer;
    assert(E.checkAnswer(q, value), q.id);
    if (q.type === "multi") {
      assert(!E.checkAnswer(q, q.answer.slice(1)));
      assert(!E.checkAnswer(q, [...q.answer, q.answer[0]]));
    }
    if (q.type === "order") assert(!E.checkAnswer(q, [...q.answer].reverse()));
  }
  const q = QUESTIONS.find((q) => q.id === "v3-s07");
  assert(E.checkAnswer(q, "  lsp  "));
});
test("multiple answer indices survive shuffled option mapping", () => {
  const s = hunter();
  E.startTraining(s, { type: "multi" });
  const q = E.displayQuestion(s, true);
  assert.equal(q.type, "multi");
  assert(E.checkAnswer(q, q.answer));
  E.answer(s, q.answer, true);
  assert(s.training.feedback.correct);
});
test("room locks, fatal damage and same-rank restart reset to room one", () => {
  const s = hunter();
  E.startRun(s, "e");
  assert.equal(s.run.roomMode, "map");
  assert.throws(() => E.answer(s, correct(s)));
  assert.throws(() => E.enterRoom(s, 1));
  E.enterRoom(s, 0);
  E.answer(s, correct(s));
  assert.equal(E.nextRoom(s), null);
  assert.equal(E.nextQuestion(s), "question");
  assert.equal(s.run.index, 0);
  assert.equal(s.run.questionIndex, 1);
  E.answer(s, correct(s));
  assert.equal(E.nextQuestion(s), "report");
  E.nextRoom(s);
  assert.equal(s.run.index, 1);
  assert.equal(s.run.roomMode, "map");
  assert.throws(() => E.enterRoom(s, 0));
  E.enterRoom(s, 1);
  s.run.hp = 1;
  const q = E.displayQuestion(s);
  E.answer(
    s,
    q.type === "short"
      ? "not-an-answer"
      : Array.isArray(q.answer)
        ? []
        : (q.answer + 1) % q.options.length,
  );
  assert.equal(s.run.status, "failed");
  assert.equal(E.nextRoom(s), null);
  assert.throws(() => E.enterRoom(s, 2));
  const xp = s.xp;
  E.retryRun(s);
  assert.equal(s.run.dungeon, "e");
  assert.equal(s.run.index, 0);
  assert.equal(s.run.roomMode, "map");
  assert.equal(s.xp, xp);
});
test("damage increased and new passive mitigates it without removing risk", () => {
  const s = hunter();
  E.startRun(s, "e");
  const q = E.currentQuestion(s),
    before = E.incomingDamage(s, q);
  assert(before >= 42);
  s.skills.push("sage-resistance");
  const after = E.incomingDamage(s, q);
  assert(after < before && after >= 8);
});
