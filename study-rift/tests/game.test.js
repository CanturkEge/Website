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
const correct = (s) => E.displayQuestion(s).answer;
test("valid questions, difficulty coverage and 15 nodes per class", () => {
  assert.equal(new Set(QUESTIONS.map((q) => q.id)).size, QUESTIONS.length);
  for (let d = 1; d <= 5; d++)
    assert(
      QUESTIONS.filter((q) => q.difficulty === d && q.course === "oop")
        .length >= 8,
    );
  for (const q of QUESTIONS) {
    assert(q.explanation && q.hint && q.source);
    if (q.type === "match") assert.equal(q.options.length, q.answer.length);
    else assert(q.options[q.answer]);
  }
  for (const c of CLASSES) {
    const nodes = SKILLS.filter((sk) => sk.classId === c.id);
    assert.equal(nodes.length, 15);
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
test("unique scaled queues do not repeat until deck exhausted", () => {
  for (const d of DUNGEONS) {
    const s = hunter(),
      queue = E.makeQueue(s, d);
    assert.equal(queue.length, 8);
    assert.equal(new Set(queue).size, 8);
    assert.equal(
      QUESTIONS.find((q) => q.id === queue[0]).difficulty,
      d.difficulty,
    );
    assert.equal(
      QUESTIONS.find((q) => q.id === queue[7]).difficulty,
      Math.min(5, d.difficulty + 1),
    );
  }
  const s = hunter(),
    a = E.makeQueue(s, DUNGEONS[0]),
    b = E.makeQueue(s, DUNGEONS[0]);
  assert.equal(
    a.slice(0, 6).filter((id) => b.slice(0, 6).includes(id)).length,
    0,
  );
});
test("duplicate submission cannot farm XP and correct restores mana", () => {
  const s = hunter();
  E.startRun(s, "e");
  s.run.mp = 0;
  E.answer(s, correct(s));
  assert(s.run.mp > 0);
  const xp = s.xp;
  assert.throws(() => E.answer(s, correct(s)));
  assert.equal(s.xp, xp);
});
test("full clear grants notes, rewards are idempotent, loadout requires camp", () => {
  const s = hunter();
  E.startRun(s, "e");
  for (let i = 0; i < 8; i++) {
    E.answer(s, correct(s));
    E.nextRoom(s);
  }
  assert.equal(s.run.status, "won");
  assert(s.run.drops.some((id) => E.item(id).slot === "notes"));
  const inv = JSON.stringify(s.inventory);
  E.nextRoom(s);
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
  E.startRun(s, "e");
  s.run.queue[0] = QUESTIONS.find((q) => q.type === "match").id;
  E.useSkill(s, "prophecy");
  assert.equal(Object.keys(s.run.fixedMatches).length, 1);
  assert.throws(() => E.useSkill(s, "eliminate"));
});
test("warden second chance preserves HP, does not farm XP or stats", () => {
  const s = hunter("warden");
  s.skills.push("warden-second");
  E.startRun(s, "e");
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
  E.startRun(s, "e");
  E.useSkill(s, "wager");
  const q = E.displayQuestion(s),
    base = 18 + q.difficulty * 8 + E.attributes(s).xp;
  assert.equal(E.answer(s, q.answer).xp, 2 * base);
  E.nextRoom(s);
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
  E.answer(s, q.answer, true);
  const xp = s.xp,
    old = s.training.id;
  E.startTraining(s, filters);
  assert.notEqual(s.training.id, old);
  s.training = { id: old, answered: false };
  E.answer(s, QUESTIONS.find((q) => q.id === old).answer, true);
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
