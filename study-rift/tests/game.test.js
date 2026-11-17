import { test } from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";
import { QUESTIONS, ITEMS, DUNGEONS } from "../data.js";
test("authored bank has valid answers, unique IDs, coverage by topic/difficulty and all formats", () => {
  assert.equal(new Set(QUESTIONS.map((q) => q.id)).size, QUESTIONS.length);
  for (let t = 0; t < 6; t++)
    for (let d = 1; d <= 3; d++)
      assert(QUESTIONS.some((q) => q.topic === t && q.difficulty === d));
  for (const q of QUESTIONS) {
    if (q.type === "match") {
      assert.equal(q.options.length, q.answer.length);
      assert.equal(new Set(q.answer).size, q.answer.length);
    } else assert(q.options[q.answer]);
    assert(q.hint && q.explanation && q.source);
  }
});
test("boss rooms scale difficulty without repeated questions", () => {
  for (const d of DUNGEONS) {
    const s = E.freshState();
    const queue = E.makeQueue(s, d);
    assert.equal(queue.length, 8);
    assert.equal(new Set(queue).size, 8);
    assert(QUESTIONS.find((q) => q.id === queue[7]).difficulty >= d.difficulty);
  }
});
test("duplicate submission cannot farm XP; correct restores mana; wrong costs hp", () => {
  const s = E.freshState();
  E.startRun(s, "e");
  s.run.mp = 0;
  const q = E.currentQuestion(s);
  E.answer(s, q.answer);
  assert(s.run.mp > 0);
  const xp = s.xp;
  assert.throws(() => E.answer(s, q.answer));
  assert.equal(s.xp, xp);
  E.nextRoom(s);
  const n = E.currentQuestion(s),
    hp = s.run.hp;
  E.answer(s, n.type === "match" ? [] : (n.answer + 1) % n.options.length);
  assert(s.run.hp < hp);
});
test("first full clear guarantees note loot and cannot duplicate boss rewards", () => {
  const s = E.freshState();
  E.startRun(s, "e");
  for (let i = 0; i < 8; i++) {
    E.answer(s, E.currentQuestion(s).answer, false, () => 0.8);
    E.nextRoom(s, () => 0.8);
  }
  assert.equal(s.run.status, "won");
  assert(
    s.run.drops.some((id) => ITEMS.find((i) => i.id === id).slot === "notes"),
  );
  const inv = JSON.stringify(s.inventory);
  E.nextRoom(s);
  assert.equal(JSON.stringify(s.inventory), inv);
  assert.equal(s.stats.wins, 1);
  assert.equal(s.history.length, 1);
});
test("death stops run, keeps XP, and a phoenix can revive only once", () => {
  const s = E.freshState();
  E.startRun(s, "e");
  s.run.hp = 1;
  s.equipment.relic = "phoenix";
  let q = E.currentQuestion(s);
  E.answer(s, (q.answer + 1) % q.options.length);
  assert.equal(s.run.hp, 40);
  E.nextRoom(s);
  s.run.hp = 1;
  q = E.currentQuestion(s);
  E.answer(s, (q.answer + 1) % q.options.length);
  assert.equal(s.run.status, "failed");
  assert.throws(() => E.useSkill(s, "heal"));
  E.leaveRun(s);
  assert.equal(s.run, null);
  assert.equal(s.history[0].status, "failed");
});
test("cheat sheets are topic bound and limited, and loadout cannot change during run", () => {
  const s = E.freshState();
  E.startRun(s, "e");
  const q = E.currentQuestion(s);
  const note = ITEMS.find((i) => i.slot === "notes" && i.topic === q.topic);
  s.equipment.notes = note.id;
  E.useSkill(s, "notes");
  assert(s.run.hint);
  assert.equal(s.run.noteUses, 1);
  assert.throws(() => E.useSkill(s, "notes"));
  assert.throws(() => E.equip(s, "dagger"));
});
test("training cannot farm same question XP or lose HP; daily reward only once", () => {
  const s = E.freshState();
  let ids = [];
  for (let i = 0; i < 5; i++) {
    const q = QUESTIONS[i];
    s.training = { id: q.id, answered: false };
    E.answer(s, q.answer, true);
    ids.push(q.id);
  }
  assert.equal(s.gold, 35);
  assert.equal(s.inventory.potion, 3);
  const xp = s.xp;
  s.training = { id: ids[0], answered: false };
  E.answer(s, QUESTIONS[0].answer, true);
  assert.equal(s.xp, xp);
  assert.equal(s.gold, 35);
});
test("skill prerequisites and points enforced, potion cannot heal full hp", () => {
  const s = E.freshState();
  assert.throws(() => E.unlock(s, "insight"));
  s.xp = 400;
  E.unlock(s, "insight");
  assert.throws(() => E.unlock(s, "wisdom"));
  E.unlock(s, "analysis");
  E.startRun(s, "d");
  assert.throws(() => E.useSkill(s, "potion"));
  assert.equal(s.inventory.potion, 2);
  s.run.hp = 20;
  E.useSkill(s, "potion");
  assert.equal(s.run.hp, 60);
  assert.equal(s.inventory.potion, 1);
});
test("loot rarity respects rank and shop prevents overspending", () => {
  const s = E.freshState();
  for (let i = 0; i < 50; i++) {
    assert(["rare", "common"].includes(E.item(E.rollLoot(s, "e")).rarity));
    assert(["epic", "legendary"].includes(E.item(E.rollLoot(s, "s")).rarity));
  }
  assert.throws(() => E.buy(s, "potion"));
  s.gold = 50;
  E.buy(s, "potion");
  assert.equal(s.gold, 10);
  assert.throws(() => E.buy(s, "ether"));
});
