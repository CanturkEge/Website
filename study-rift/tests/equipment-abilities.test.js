import { test } from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";
import { ITEMS, QUESTIONS } from "../game-data.js";
function hunter() {
  const s = E.freshState();
  E.chooseClass(s, "warden");
  return s;
}
function mcRun(s) {
  E.startRun(s, "e");
  const qs = QUESTIONS.filter(
    (q) => q.course === "oop" && q.type === "mc",
  ).slice(0, 2);
  s.run.rooms[0].queue = qs.map((q) => q.id);
  E.enterRoom(s, 0);
  return s.run;
}
test("equipped active skills work from weapon, armor and relic, but not from inventory alone", () => {
  for (const i of ITEMS.filter((i) => i.skill)) {
    const s = hunter();
    s.inventory[i.id] = 1;
    assert(!E.availableAbilities(s).includes(i.skill));
    E.equip(s, i.id);
    assert(E.availableAbilities(s).includes(i.skill), i.id);
    assert(E.equipmentSkillItems(s, i.skill).some((x) => x.id === i.id));
    const r = mcRun(s),
      mp = r.mp,
      q = E.displayQuestion(s);
    E.useSkill(s, i.skill);
    assert.equal(r.mp, mp - 25);
    assert.equal(r.hidden.length, 1);
    assert(!r.hidden.includes(q.answer));
    E.leaveRun(s);
    E.equip(s, i.id);
    assert(!E.availableAbilities(s).includes(i.skill));
  }
});
test("duplicate equipment and class sources share one button and one per-room cast", () => {
  const s = E.freshState();
  E.chooseClass(s, "sage");
  for (const id of ["gear-lens-epic", "gear-vest-epic", "gear-pendant-epic"]) {
    s.inventory[id] = 1;
    E.equip(s, id);
  }
  assert.equal(
    E.availableAbilities(s).filter((id) => id === "eliminate").length,
    1,
  );
  assert.equal(E.equipmentSkillItems(s, "eliminate").length, 3);
  const r = mcRun(s);
  E.useSkill(s, "eliminate");
  const q = E.displayQuestion(s);
  E.answer(s, q.answer);
  E.nextQuestion(s);
  const before = JSON.stringify(s);
  assert.throws(() => E.useSkill(s, "eliminate"));
  assert.equal(JSON.stringify(s), before);
});
test("gear active skills keep their format/mana guards and passive relics stay automatic", () => {
  const s = hunter();
  s.inventory["gear-pendant-epic"] = 1;
  E.equip(s, "gear-pendant-epic");
  const r = mcRun(s);
  r.rooms[0].queue[0] = QUESTIONS.find(
    (q) => q.course === "oop" && q.type === "order",
  ).id;
  let before = JSON.stringify(s);
  assert.throws(() => E.useSkill(s, "eliminate"));
  assert.equal(JSON.stringify(s), before);
  r.rooms[0].queue[0] = QUESTIONS.find(
    (q) => q.course === "oop" && q.type === "mc",
  ).id;
  r.mp = 24;
  before = JSON.stringify(s);
  assert.throws(() => E.useSkill(s, "eliminate"));
  assert.equal(JSON.stringify(s), before);
  E.leaveRun(s);
  s.inventory.crystal = 1;
  E.equip(s, "crystal");
  assert(!E.availableAbilities(s).includes("eliminate"));
  assert(E.attributes(s).mp >= 105);
  s.inventory.phoenix = 1;
  E.equip(s, "phoenix");
  mcRun(s);
  s.run.hp = 1;
  const q = E.displayQuestion(s);
  E.answer(s, (q.answer + 1) % q.options.length);
  assert.equal(s.run.hp, 40);
  assert(s.run.revived);
  assert(!E.equipmentSkillItems(s).length);
});
