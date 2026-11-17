import { ITEMS, getCourse } from "./game-data.js";
export const POTIONS = [
  {
    id: "potion",
    kind: "potion",
    itemId: "potion",
    name: "Can İksiri",
    emoji: "🧪",
    price: 40,
    level: 1,
    limit: 0,
    contents: [["potion", 1]],
    desc: "Bir odada tek kullanım. Temel 40 can; yetenek bonusun varsa ayrıca uygulanır.",
  },
  {
    id: "ether",
    kind: "potion",
    itemId: "ether",
    name: "Mana İksiri",
    emoji: "🔮",
    price: 55,
    level: 1,
    limit: 0,
    contents: [["ether", 1]],
    desc: "Bir odada tek kullanım. 35 mana yeniler; maksimum manayı aşmaz.",
  },
];
export const BUNDLES = [
  {
    id: "bundle-scout",
    kind: "bundle",
    name: "Keşif Çantası",
    emoji: "🎒",
    price: 270,
    level: 1,
    limit: 1,
    contents: [
      ["potion", 3],
      ["ether", 3],
    ],
    desc: "3 Can İksiri + 3 Mana İksiri. Tek tek alım 285 altın; 15 altın tasarruf.",
  },
  {
    id: "bundle-focus",
    kind: "bundle",
    name: "Odak Stoğu",
    emoji: "🪄",
    price: 250,
    level: 1,
    limit: 1,
    contents: [["ether", 5]],
    desc: "5 Mana İksiri. Tek tek alım 275 altın; 25 altın tasarruf.",
  },
  {
    id: "bundle-guard",
    kind: "bundle",
    name: "Muhafız Erzağı",
    emoji: "🩹",
    price: 185,
    level: 1,
    limit: 1,
    contents: [["potion", 5]],
    desc: "5 Can İksiri. Tek tek alım 200 altın; 15 altın tasarruf.",
  },
];
export const RARITY_LEVEL = { common: 1, rare: 3, epic: 6, legendary: 10 };
const rarityPrice = { common: 160, rare: 380, epic: 900, legendary: 1900 };
const rarityMultiplier = { common: 1, rare: 2, epic: 3, legendary: 4 };
const hash = (text) => {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
};
function rotate(pool, key, count) {
  return [...pool]
    .sort(
      (a, b) =>
        hash(key + ":" + a.id) - hash(key + ":" + b.id) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, count);
}
export function dailyStock(courseId, date) {
  const c = getCourse(courseId);
  if (c.id !== courseId || c.locked) return [];
  const pool = ITEMS.filter(
      (i) =>
        !["dagger", "cloak"].includes(i.id) &&
        i.slot !== "consumable" &&
        (!i.course || i.course === courseId),
    ),
    selected = [];
  for (const slot of ["weapon", "armor", "relic"])
    for (const rarity of [
      "common",
      "rare",
      hash(date + courseId + slot) % 3 === 0 ? "legendary" : "epic",
    ])
      selected.push(
        ...rotate(
          pool.filter((i) => i.slot === slot && i.rarity === rarity),
          date + courseId + slot + rarity,
          1,
        ),
      );
  selected.push(
    ...rotate(
      pool.filter((i) => i.slot === "notes"),
      date + courseId + "notes",
      2,
    ),
  );
  return selected.map((i) => ({
    id: i.id,
    kind: "gear",
    itemId: i.id,
    name: i.name,
    price: rarityPrice[i.rarity] + (i.slot === "notes" ? 120 : 0),
    level: RARITY_LEVEL[i.rarity],
    limit: 1,
    contents: [[i.id, 1]],
    desc: i.desc,
  }));
}
export function marketProducts(course, date) {
  return [...POTIONS, ...dailyStock(course, date), ...BUNDLES];
}
export const purchaseCount = (s, id, date) =>
  s.market?.date === date ? s.market.purchases?.[s.course + ":" + id] || 0 : 0;
export function quotePurchase(s, id, quantity, date, level) {
  if (s.run) throw Error("Alışveriş için keşfini bitir veya kampa çekil.");
  const c = getCourse(s.course);
  if (c.locked || c.id !== s.course)
    throw Error("Bu dersin marketi henüz açık değil.");
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99)
    throw Error("Adet 1–99 arasında tam sayı olmalı.");
  const offer = marketProducts(s.course, date).find((o) => o.id === id);
  if (!offer) throw Error("Bu ürün bugünün tezgâhında yok.");
  if (level < offer.level)
    throw Error("Bu ürün için seviye " + offer.level + " gerekli.");
  if (offer.kind === "gear" && s.inventory[id])
    throw Error("Bu ekipman zaten çantanda.");
  if (offer.limit && purchaseCount(s, id, date) + quantity > offer.limit)
    throw Error("Bu üründen ders başına günde bir tane alınabilir.");
  const total = offer.price * quantity;
  if (s.gold < total)
    throw Error(
      "Bu alışveriş için " + (total - s.gold) + " altın daha gerekli.",
    );
  return {
    offer,
    quantity,
    total,
    items: offer.contents.map(([id, n]) => ({ id, quantity: n * quantity })),
  };
}
export const upgradeLevel = (s, id) => s.upgrades?.[id] || 0;
export function upgradeBonus(s, id, atLevel = upgradeLevel(s, id)) {
  const i = ITEMS.find((i) => i.id === id);
  if (!i || !atLevel) return {};
  if (i.slot === "weapon") return { xp: atLevel * 2 };
  if (i.slot === "armor") return { hp: atLevel * 8, defense: atLevel };
  if (i.slot === "relic") return { mp: atLevel * 8 };
  return {};
}
export function upgradePlan(s, id) {
  const i = ITEMS.find((i) => i.id === id);
  if (!i || !["weapon", "armor", "relic"].includes(i.slot)) return null;
  const current = upgradeLevel(s, id),
    next = current + 1;
  if (next > 3)
    return {
      id,
      current,
      next: current,
      max: true,
      bonus: upgradeBonus(s, id),
    };
  return {
    id,
    current,
    next,
    max: false,
    level: next * 2,
    gold: 90 * rarityMultiplier[i.rarity] * next,
    essence: 10 * rarityMultiplier[i.rarity] * next,
    bonus: upgradeBonus(s, id, next),
  };
}
export function quoteUpgrade(s, id, characterLevel) {
  if (s.run) throw Error("Geliştirme için önce keşfini bitir.");
  const plan = upgradePlan(s, id);
  if (!plan || !s.inventory[id])
    throw Error("Geliştirilebilir bir silah, zırh veya tılsım seç.");
  if (plan.max) throw Error("Bu ekipman en yüksek geliştirme seviyesinde.");
  if (characterLevel < plan.level)
    throw Error("Bu geliştirme için seviye " + plan.level + " gerekli.");
  if (s.gold < plan.gold || s.essence < plan.essence)
    throw Error(
      "Gerekli kaynak: " + plan.gold + " altın ve " + plan.essence + " öz.",
    );
  return plan;
}
export const salvageValue = (s, id) => {
  const i = ITEMS.find((i) => i.id === id);
  return i
    ? ({ common: 5, rare: 12, epic: 25, legendary: 60 }[i.rarity] || 0) +
        upgradeLevel(s, id) * 5
    : 0;
};
