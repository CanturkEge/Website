import { test } from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";
import { dailyStock, BUNDLES } from "../market.js";
const hunter = () => {
  const s = E.freshState();
  E.chooseClass(s, "sage");
  s.gold = 20000;
  s.essence = 1000;
  s.xp = 20000;
  return s;
};
test("daily equipment stays stable across purchases and changes on a new date", () => {
  const s = hunter(),
    date = E.today(),
    a = dailyStock("oop", date),
    b = dailyStock("oop", date);
  assert.equal(a.length, 11);
  assert.deepEqual(a, b);
  assert.equal(new Set(a.map((o) => o.id)).size, a.length);
  assert.notDeepEqual(
    dailyStock("oop", "2026-11-18"),
    dailyStock("oop", "2026-11-19"),
  );
  assert.deepEqual(dailyStock("database", date), []);
  E.buy(s, a[0].id);
  assert.deepEqual(dailyStock("oop", date), a);
  assert(s.inventory[a[0].id]);
  assert.throws(() => E.buy(s, a[0].id));
  E.salvage(s, a[0].id);
  assert.throws(() => E.buy(s, a[0].id));
});
test("bulk consumables charge exact totals and reject invalid quantities without changes", () => {
  const s = hunter(),
    before = s.gold,
    count = s.inventory.potion;
  const receipt = E.buy(s, "potion", 5);
  assert.equal(receipt.total, 200);
  assert.equal(s.gold, before - 200);
  assert.equal(s.inventory.potion, count + 5);
  for (const quantity of [0, -1, 1.5, 100, NaN, Infinity]) {
    const snapshot = JSON.stringify(s);
    assert.throws(() => E.buy(s, "ether", quantity));
    assert.equal(JSON.stringify(s), snapshot);
  }
  s.gold = 1;
  const snapshot = JSON.stringify(s);
  assert.throws(() => E.buy(s, "ether"));
  assert.equal(JSON.stringify(s), snapshot);
});
test("bundle contents, daily limits and next-day restock are enforced", () => {
  const s = hunter(),
    before = s.inventory.potion,
    mp = s.inventory.ether || 0;
  E.buy(s, "bundle-scout");
  assert.equal(s.inventory.potion, before + 3);
  assert.equal(s.inventory.ether, mp + 3);
  assert.throws(() => E.buy(s, "bundle-scout"));
  assert.throws(() => E.buy(s, "bundle-focus", 2));
  E.buy(s, "bundle-scout", 1, "2099-01-01");
  assert.equal(s.inventory.potion, before + 6);
  assert.equal(s.market.date, "2099-01-01");
  for (const b of BUNDLES)
    assert(
      b.price <
        b.contents.reduce(
          (n, [id, qty]) => n + qty * (id === "potion" ? 40 : 55),
          0,
        ),
    );
});
test("equipment level gates cannot be bypassed by direct purchase", () => {
  const s = hunter();
  s.xp = 0;
  const offer = E.marketOffers(s).find((o) => o.kind === "gear" && o.level > 1);
  assert(offer);
  const snapshot = JSON.stringify(s);
  assert.throws(() => E.buy(s, offer.id));
  assert.equal(JSON.stringify(s), snapshot);
});
test("forge charges gold and essence, grants equipped bonuses and respects the cap", () => {
  const s = hunter(),
    before = E.attributes(s),
    gold = s.gold,
    ess = s.essence,
    q = E.upgradeQuote(s, "dagger");
  E.upgrade(s, "dagger");
  assert.equal(E.upgradeLevel(s, "dagger"), 1);
  assert.equal(s.gold, gold - q.gold);
  assert.equal(s.essence, ess - q.essence);
  assert.equal(E.attributes(s).xp, before.xp + 2);
  E.equip(s, "dagger");
  assert.equal(E.attributes(s).xp, before.xp - 2);
  E.equip(s, "dagger");
  E.upgrade(s, "dagger");
  E.upgrade(s, "dagger");
  assert.equal(E.upgradeLevel(s, "dagger"), 3);
  assert.throws(() => E.upgrade(s, "dagger"));
  assert.throws(() => E.upgrade(s, "potion"));
});
test("failed forge is atomic and salvage removes the upgrade before a new copy drops", () => {
  const s = hunter();
  s.essence = 0;
  const snapshot = JSON.stringify(s);
  assert.throws(() => E.upgrade(s, "dagger"));
  assert.equal(JSON.stringify(s), snapshot);
  s.essence = 100;
  E.upgrade(s, "dagger");
  assert.throws(() => E.salvage(s, "dagger"));
  E.equip(s, "dagger");
  const value = E.salvageValue(s, "dagger"),
    before = s.essence;
  E.salvage(s, "dagger");
  assert.equal(s.essence, before + value);
  assert.equal(E.upgradeLevel(s, "dagger"), 0);
  assert.throws(() => E.salvage(s, "dagger"));
  E.addItem(s, "dagger");
  E.equip(s, "dagger");
  assert.equal(E.upgradeLevel(s, "dagger"), 0);
});
test("an expedition can be reentered from the lobby but blocks market mutations", () => {
  const s = hunter();
  E.startRun(s, "e");
  const snapshot = JSON.stringify(s.run);
  E.switchCourse(s, "oop");
  assert.equal(JSON.stringify(s.run), snapshot);
  for (const action of [
    () => E.buy(s, "potion"),
    () => E.upgrade(s, "dagger"),
    () => E.salvage(s, "cloak"),
    () => E.switchCourse(s, "database"),
  ])
    assert.throws(action);
  assert.equal(JSON.stringify(s.run), snapshot);
});
test("v0.4 migration retains progress and initializes market fields safely", () => {
  const s = hunter();
  s.version = 4;
  delete s.market;
  delete s.upgrades;
  const migrated = E.normalize(s);
  assert.equal(migrated.version, 5);
  assert.equal(migrated.xp, s.xp);
  assert.equal(migrated.gold, s.gold);
  assert.equal(migrated.classId, s.classId);
  assert.deepEqual(migrated.upgrades, {});
  assert.deepEqual(migrated.market.purchases, {});
  migrated.upgrades = { dagger: 3, cloak: 99, missing: 2 };
  assert.deepEqual(E.normalize(migrated).upgrades, { dagger: 3 });
});
