import {
  marketProducts,
  quotePurchase,
  quoteUpgrade,
  upgradeBonus,
  upgradeLevel,
  purchaseCount,
  salvageValue,
} from "./market.js";
export {
  upgradeBonus,
  upgradeLevel,
  upgradePlan,
  salvageValue,
} from "./market.js";
import { ROOMS, DAILY_TRAINING_SECONDS } from "./rooms.js";
export { ROOMS } from "./rooms.js";
import { gradeAnswer } from "./question-utils.js";
import {
  ITEMS,
  QUESTIONS,
  SKILLS,
  DUNGEONS,
  CLASSES,
  getCourse,
} from "./game-data.js";
export const item = (id) => ITEMS.find((i) => i.id === id);
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const course = (s) => getCourse(s.course || "oop");
export const bank = (s) => QUESTIONS.filter((q) => q.course === course(s).id);
export const learned = (s, key) => s.skills.includes(s.classId + "-" + key);
export function freshState() {
  return {
    version: 5,
    name: "Avcı",
    classId: null,
    course: "oop",
    xp: 0,
    gold: 0,
    essence: 0,
    upgrades: {},
    market: { date: today(), purchases: {} },
    inventory: { dagger: 1, cloak: 1, potion: 2 },
    equipment: { weapon: "dagger", armor: "cloak", relic: null, notes: null },
    skills: [],
    mastery: {},
    cleared: {},
    run: null,
    training: null,
    history: [],
    notebooks: { oop: "" },
    notes: "",
    seenDecks: {},
    lootPity: {},
    lootRecent: [],
    daily: freshDaily(),
    learning: {},
    settings: { sound: false },
    stats: { answered: 0, correct: 0, runs: 0, wins: 0, bestCombo: 0 },
  };
}
export function normalize(raw = {}) {
  const s = { ...freshState(), ...raw, version: 5 };
  s.stats = { ...freshState().stats, ...s.stats };
  s.settings = {
    sound: false,
    ...s.settings,
    navGroups: { ...(s.settings?.navGroups || {}) },
  };
  s.upgrades = Object.fromEntries(
    Object.entries(s.upgrades || {}).filter(
      ([id, n]) =>
        s.inventory[id] &&
        ITEMS.some(
          (i) => i.id === id && ["weapon", "armor", "relic"].includes(i.slot),
        ) &&
        Number.isInteger(n) &&
        n >= 0 &&
        n <= 3,
    ),
  );
  s.market =
    s.market && s.market.date === today()
      ? { date: today(), purchases: { ...(s.market.purchases || {}) } }
      : { date: today(), purchases: {} };
  s.notebooks = { oop: raw.notes || "", ...(raw.notebooks || {}) };
  if (!s.daily || s.daily.date !== today()) s.daily = freshDaily();
  if ((raw.version || 1) < 2) {
    s.skills = [];
    s.classId = null;
    for (const key of Object.keys(s.cleared))
      if (!key.includes(":")) {
        s.cleared["oop:" + key] = s.cleared[key];
      }
    if (s.run) {
      s.run.course = "oop";
      s.run.used ||= [];
    }
  }
  if (s.run && !s.run.roomMode) s.run.roomMode = "question";
  s.learning ||= {};
  s.daily.rewardedIds ||= [...s.daily.ids];
  if ((raw.version || 1) < 4 && !s.daily.claimed) {
    s.daily.ids = [];
    s.daily.deadline = null;
    s.daily.failed = false;
  }
  if (s.run && !s.run.rooms) {
    const r = s.run,
      d = DUNGEONS.find((d) => d.id === r.dungeon);
    if (
      d &&
      r.index === 0 &&
      r.roomMode === "map" &&
      !r.answered &&
      !r.correct
    ) {
      const rooms = makeRoomExams(s, d),
        queue = rooms.flatMap((r) => r.queue);
      Object.assign(r, {
        rooms,
        queue,
        orders: orders(queue),
        questionIndex: 0,
      });
    } else {
      r.rooms = r.queue.map((id, i) => ({
        ...ROOMS[i],
        queue: [id],
        seconds: 0,
        deadline: null,
        cleared: i < r.index,
        correct: 0,
        answered: i < r.index ? 1 : 0,
      }));
      r.questionIndex = 0;
      r.legacyRooms = true;
    }
  }
  return s;
}
export function level(s) {
  let n = 1,
    left = s.xp;
  while (left >= n * 100 + 50) {
    left -= n * 100 + 50;
    n++;
  }
  return { level: n, current: left, needed: n * 100 + 50 };
}
export const points = (s) =>
  Math.max(
    0,
    2 * (level(s).level - 1) -
      s.skills.filter((id) => !id.endsWith("-origin")).length,
  );
export function chooseClass(s, id) {
  if (s.classId) throw Error("Sınıfın zaten seçildi.");
  const c = CLASSES.find((c) => c.id === id);
  if (!c) throw Error("Geçersiz sınıf.");
  s.classId = id;
  s.skills = [id + "-origin"];
}
export function attributes(s) {
  let a = {
    hp: 100,
    mp: 80,
    xp: 0,
    mana: 3,
    defense: 0,
    gold: 0,
    hintCost: 20,
    heal: 30,
    healCost: 25,
    shieldCost: 20,
    shieldReduction: 0.5,
    focusCost: 18,
    eliminate: 1,
    prophecy: 1,
    noteUses: 0,
    lootChance: 0.25,
    pity: 5,
    comboThreshold: 3,
    comboXP: 6,
  };
  for (const [k, v] of Object.entries(
    CLASSES.find((c) => c.id === s.classId)?.base || {},
  ))
    a[k] = (a[k] || 0) + v;
  for (const id of Object.values(s.equipment)) {
    const it = item(id);
    if (it) {
      for (const k of ["hp", "mp", "xp", "mana", "defense", "gold"])
        a[k] += it[k] || 0;
      for (const [k, v] of Object.entries(upgradeBonus(s, id))) a[k] += v;
    }
  }
  const absolute = new Set([
    "hintCost",
    "healCost",
    "heal",
    "shieldCost",
    "shieldReduction",
    "focusCost",
    "eliminate",
    "prophecy",
    "lootChance",
    "pity",
    "comboThreshold",
    "comboXP",
  ]);
  for (const sk of SKILLS.filter((sk) => s.skills.includes(sk.id))) {
    for (const [k, v] of Object.entries(sk.effects)) {
      if (k === "active") continue;
      if (absolute.has(k)) a[k] = v;
      else a[k] = (a[k] || 0) + v;
    }
  }
  return a;
}
export function availableAbilities(s) {
  const c = CLASSES.find((c) => c.id === s.classId);
  const list = ["hint", "heal", ...(c ? [c.starter] : [])];
  for (const sk of SKILLS)
    if (s.skills.includes(sk.id) && sk.effects.active)
      list.push(sk.effects.active);
  if (item(s.equipment.weapon)?.skill)
    list.push(item(s.equipment.weapon).skill);
  return [...new Set(list)];
}
export function shuffle(a, rng = Math.random) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function canEnter(s, d) {
  return (
    !course(s).locked &&
    bank(s).filter((q) => q.difficulty === d.difficulty).length >= 6 &&
    level(s).level >= d.level
  );
}
export function switchCourse(s, id) {
  const c = getCourse(id);
  if (c.id !== id || c.locked)
    throw Error("Bu ders, içerikleri yüklendiğinde açılacak.");
  if (id === course(s).id) return;
  if (s.run) throw Error("Ders değiştirmek için keşfini bitir.");
  s.course = id;
  s.training = null;
}
function weightedSample(pool, count, s, rng) {
  const picked = [];
  pool = [...pool];
  while (picked.length < count && pool.length) {
    const weights = pool.map((q) => {
      const m = s.mastery[q.id];
      return !m ? 4 : m.lastCorrect ? 1 : 3;
    });
    let r = rng() * weights.reduce((a, b) => a + b, 0),
      idx = 0;
    while (idx < weights.length - 1 && r >= weights[idx]) r -= weights[idx++];
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}
function drawQuestions(s, difficulty, count, excluded = [], rng = Math.random) {
  const key = course(s).id + ":" + difficulty,
    all = bank(s).filter(
      (q) => q.difficulty === difficulty && !excluded.includes(q.id),
    );
  let seen = s.seenDecks[key] || [];
  let fresh = all.filter((q) => !seen.includes(q.id));
  if (fresh.length < count) {
    const rest = weightedSample(fresh, fresh.length, s, rng);
    seen = [];
    const extra = weightedSample(
      all.filter((q) => !rest.includes(q)),
      count - rest.length,
      s,
      rng,
    );
    const chosen = [...rest, ...extra];
    s.seenDecks[key] = chosen.map((q) => q.id);
    return chosen;
  }
  const chosen = weightedSample(fresh, count, s, rng);
  s.seenDecks[key] = [...seen, ...chosen.map((q) => q.id)];
  return chosen;
}
export function makeRoomExams(s, d, rng = Math.random) {
  const slots = [],
    assigned = new Map(),
    owners = new Map();
  for (const [roomIndex, room] of ROOMS.entries()) {
    const difficulty = Math.min(5, d.difficulty + (roomIndex >= 6 ? 1 : 0)),
      key = course(s).id + ":" + difficulty;
    const tier = bank(s).filter((q) => q.difficulty === difficulty);
    let seen = s.seenDecks[key] || [];
    if (tier.every((q) => seen.includes(q.id))) {
      seen = [];
      s.seenDecks[key] = [];
    }
    const pool = tier.filter((q) => room.types.includes(q.type)),
      fresh = pool.filter((q) => !seen.includes(q.id)),
      old = pool.filter((q) => seen.includes(q.id));
    for (let index = 0; index < room.count; index++)
      slots.push({
        roomIndex,
        index,
        key,
        candidates: [
          ...weightedSample(fresh, fresh.length, s, rng),
          ...weightedSample(old, old.length, s, rng),
        ],
      });
  }
  // Match scarce format slots before flexible rooms; augmenting paths reserve
  // a unique eligible question for every slot instead of silently changing format.
  function allocate(slot, visited) {
    const usedTypes = new Set(
      slots
        .filter((x) => x.roomIndex === slot.roomIndex && x !== slot)
        .map((x) => assigned.get(x)?.type)
        .filter(Boolean),
    );
    const candidates = [
      ...slot.candidates.filter((q) => !usedTypes.has(q.type)),
      ...slot.candidates.filter((q) => usedTypes.has(q.type)),
    ];
    for (const q of candidates) {
      if (visited.has(q.id)) continue;
      visited.add(q.id);
      const owner = owners.get(q.id);
      if (!owner || allocate(owner, visited)) {
        owners.set(q.id, slot);
        assigned.set(slot, q);
        return true;
      }
    }
    return false;
  }
  for (const slot of [...slots].sort(
    (a, b) => a.candidates.length - b.candidates.length,
  ))
    if (!allocate(slot, new Set()))
      throw Error(
        "Bu zorluk ve soru türlerinde oda sınavları için yeterli farklı içerik yok.",
      );
  const rooms = ROOMS.map((room, roomIndex) => ({
    ...room,
    queue: slots
      .filter((slot) => slot.roomIndex === roomIndex)
      .map((slot) => assigned.get(slot).id),
    deadline: null,
    cleared: false,
    correct: 0,
    answered: 0,
  }));
  for (const slot of slots) {
    const q = assigned.get(slot);
    s.seenDecks[slot.key] = [
      ...new Set([...(s.seenDecks[slot.key] || []), q.id]),
    ];
  }
  return rooms;
}
export function makeQueue(s, d, rng = Math.random) {
  return makeRoomExams(s, d, rng).flatMap((r) => r.queue);
}
export function displayQuestion(s, training = false) {
  const ctx = training ? s.training : s.run,
    q = currentQuestion(s, training);
  if (!q) return null;
  if (!["mc", "multi"].includes(q.type)) return q;
  const order = ctx.orders?.[q.id] || q.options.map((_, i) => i);
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    answer:
      q.type === "multi"
        ? q.answer.map((i) => order.indexOf(i))
        : order.indexOf(q.answer),
  };
}

function orders(ids, rng = Math.random) {
  return Object.fromEntries(
    ids.map((id) => {
      const q = QUESTIONS.find((q) => q.id === id);
      return [
        id,
        ["mc", "multi"].includes(q.type)
          ? shuffle(
              q.options.map((_, i) => i),
              rng,
            )
          : q.options.map((_, i) => i),
      ];
    }),
  );
}
export function startRun(s, id) {
  if (s.run) throw Error("Mevcut keşfini önce bitir.");
  if (!s.classId) throw Error("Önce sınıfını seç.");
  const d = DUNGEONS.find((d) => d.id === id);
  if (!d || !canEnter(s, d))
    throw Error("Bu ders veya zindan henüz açık değil.");
  const rooms = makeRoomExams(s, d),
    queue = rooms.flatMap((r) => r.queue),
    a = attributes(s);
  s.run = {
    course: course(s).id,
    dungeon: id,
    queue,
    rooms,
    questionIndex: 0,
    orders: orders(queue),
    index: 0,
    hp: a.hp,
    mp: a.mp,
    combo: 0,
    shield: false,
    evade: false,
    revived: false,
    noteUses: 0,
    used: [],
    hidden: [],
    hint: false,
    answered: false,
    feedback: null,
    drops: [],
    earnedXP: 0,
    earnedGold: 0,
    status: "active",
    correct: 0,
    secondUsed: false,
    roomMode: "map",
    comboSaved: false,
  };
  s.stats.runs++;
  return s.run;
}
export function currentQuestion(s, training = false) {
  const id = training
    ? s.training?.id
    : (s.run?.rooms?.[s.run.index]?.queue[s.run.questionIndex || 0] ??
      s.run?.queue[s.run.index]);
  return QUESTIONS.find((q) => q.id === id);
}
export function startTraining(s, filters = {}) {
  let pool = bank(s).filter(
    (q) =>
      (filters.topic == null || q.topic === Number(filters.topic)) &&
      (!filters.type || q.type === filters.type) &&
      (!filters.difficulty || q.difficulty === Number(filters.difficulty)) &&
      (!filters.weak || (s.mastery[q.id]?.wrong || 0) > 0),
  );
  if (!pool.length) throw Error("Bu filtrelerde soru yok.");
  const key = course(s).id + ":training:" + JSON.stringify(filters);
  let seen = s.seenDecks[key] || [],
    fresh = pool.filter((q) => !seen.includes(q.id));
  if (!fresh.length) {
    seen = [];
    fresh = pool.filter((q) => q.id !== s.training?.id);
    if (!fresh.length) fresh = pool;
  }
  const q = weightedSample(fresh, 1, s, Math.random)[0];
  s.seenDecks[key] = [...seen, q.id];
  s.training = {
    course: course(s).id,
    id: q.id,
    orders: orders([q.id]),
    answered: false,
    feedback: null,
    hint: false,
    filters,
  };
  return s.training;
}
export const checkAnswer = gradeAnswer;
export function addItem(s, id) {
  s.inventory[id] = (s.inventory[id] || 0) + 1;
}
export function rollLoot(s, rank = "e", rng = Math.random, forceNotes = false) {
  const c = course(s).id,
    a = attributes(s),
    key = c + ":" + rank;
  s.lootPity[key] = (s.lootPity[key] || 0) + 1;
  let n = rng(),
    rarity =
      rank === "e"
        ? n < 0.6
          ? "rare"
          : "common"
        : rank === "d"
          ? n < 0.3
            ? "epic"
            : "rare"
          : rank === "c"
            ? n < 0.1
              ? "legendary"
              : n < 0.6
                ? "epic"
                : "rare"
            : n < (rank === "s" ? 0.4 : 0.2)
              ? "legendary"
              : "epic";
  if (rank !== "e" && s.lootPity[key] >= a.pity) {
    rarity = rank === "d" ? "epic" : "legendary";
    s.lootPity[key] = 0;
  }
  const rankRarities =
    rank === "e"
      ? ["common", "rare"]
      : rank === "d"
        ? ["rare", "epic"]
        : rank === "c"
          ? ["rare", "epic", "legendary"]
          : ["epic", "legendary"];
  const allowed = (i) =>
    rankRarities.includes(i.rarity) &&
    !["dagger", "cloak"].includes(i.id) &&
    i.slot !== "consumable" &&
    (!i.course || i.course === c) &&
    !s.inventory[i.id];
  let pool = ITEMS.filter(
    (i) =>
      allowed(i) && i.rarity === rarity && (!forceNotes || i.slot === "notes"),
  );
  if (forceNotes && !pool.length)
    pool = ITEMS.filter((i) => allowed(i) && i.slot === "notes");
  if (!pool.length)
    pool = ITEMS.filter(
      (i) => allowed(i) && (!forceNotes || i.slot === "notes"),
    );
  if (!pool.length) {
    s.essence += 15;
    const id = rng() < 0.6 ? "potion" : "ether";
    addItem(s, id);
    return id;
  }
  const recentFamily = s.lootRecent
    .map((id) => item(id)?.family)
    .filter(Boolean);
  const varied = pool.filter(
    (i) => !i.family || !recentFamily.includes(i.family),
  );
  if (varied.length) pool = varied;
  const pick = pool[Math.floor(rng() * pool.length)];
  addItem(s, pick.id);
  s.lootRecent = [...s.lootRecent, pick.id].slice(-4);
  return pick.id;
}
function mastery(s, q, correct, train) {
  const m = s.mastery[q.id] || { correct: 0, wrong: 0 };
  m[correct ? "correct" : "wrong"]++;
  m.lastCorrect = correct;
  m.lastSeen = Date.now();
  s.mastery[q.id] = m;
  s.stats.answered++;
  if (correct) s.stats.correct++;
  let xp = 0;
  if (train) {
    if (s.daily.date !== today()) s.daily = freshDaily();
    expireDaily(s);
    s.daily.rewardedIds ||= [];
    if (
      correct &&
      s.daily.deadline &&
      !s.daily.failed &&
      !s.daily.claimed &&
      !s.daily.ids.includes(q.id)
    )
      s.daily.ids.push(q.id);
    if (correct && !s.daily.rewardedIds.includes(q.id)) {
      s.daily.rewardedIds.push(q.id);
      xp = 6 + Math.max(0, q.difficulty - 2) * 2;
    }
    if (
      s.daily.ids.length >= 5 &&
      !s.daily.claimed &&
      !s.daily.failed &&
      s.daily.deadline
    ) {
      s.daily.claimed = true;
      s.daily.deadline = null;
      s.gold += 35;
      addItem(s, "potion");
    }
  }
  return xp;
}
export function answer(s, value, training = false, rng = Math.random) {
  const ctx = training ? s.training : s.run,
    q = displayQuestion(s, training);
  if (!ctx || !q || ctx.answered || (!training && ctx.status !== "active"))
    throw Error("Bu soru zaten tamamlandı.");
  if (!training) {
    expireRun(s);
    if (ctx.status !== "active")
      throw Error("Odanın süresi doldu. Keşfi yeniden başlat.");
  }
  if (!training && ctx.roomMode !== "question")
    throw Error("Önce odanın mührünü aç.");
  const correct = checkAnswer(q, value);
  ctx.answered = true;
  if (ctx.retry) {
    ctx.feedback = { correct, value, xp: 0, damage: 0, retry: true };
    ctx.retry = false;
    return ctx.feedback;
  }
  let xp = mastery(s, q, correct, training),
    damage = 0,
    loot = [],
    hpBefore = ctx.hp,
    mpBefore = ctx.mp;
  if (training) {
    ctx.feedback = { correct, value, xp };
    s.xp += xp;
    return ctx.feedback;
  }
  const d = DUNGEONS.find((d) => d.id === ctx.dungeon),
    a = attributes(s),
    boss = ctx.index >= 6,
    room = ctx.rooms[ctx.index];
  if (correct) {
    ctx.correct++;
    room.correct++;
    ctx.combo++;
    s.stats.bestCombo = Math.max(s.stats.bestCombo, ctx.combo);
    xp =
      18 +
      q.difficulty * 8 +
      a.xp +
      (ctx.combo >= a.comboThreshold ? a.comboXP : 0) +
      (boss ? a.bossXP || 0 : 0) +
      (ctx.noteThisRoom ? a.noteXP || 0 : 0);
    if (ctx.focus) xp += 12;
    if (ctx.wager) xp *= 2;
    ctx.mp = Math.min(
      a.mp,
      ctx.mp + a.mana + (ctx.combo >= a.comboThreshold ? a.comboMana || 0 : 0),
    );
    ctx.hp = Math.min(a.hp, ctx.hp + (a.onCorrectHeal || 0));
    const gold = 8 + q.difficulty * 2 + a.gold;
    s.gold += gold;
    ctx.earnedGold += gold;
    if (
      ctx.index === 3 &&
      ctx.questionIndex === room.queue.length - 1 &&
      rng() < a.lootChance
    )
      loot.push(rollLoot(s, d.id, rng));
  } else {
    if (a.keepCombo && !ctx.comboSaved) ctx.comboSaved = true;
    else ctx.combo = 0;
    damage = incomingDamage(s, q, ctx) + (ctx.wager ? 10 : 0);
    if (ctx.shield) {
      damage = Math.ceil(damage * (1 - a.shieldReduction));
      ctx.shield = false;
    }
    if (ctx.evade) {
      damage = 0;
      ctx.evade = false;
      ctx.mp = Math.min(a.mp, ctx.mp + (a.evasionMana || 0));
    }
    ctx.hp = Math.max(0, ctx.hp - damage);
    if (
      !ctx.hp &&
      !ctx.revived &&
      (s.equipment.relic === "phoenix" || a.revive)
    ) {
      ctx.hp = s.equipment.relic === "phoenix" ? 40 : a.revive;
      ctx.revived = true;
    }
    if (!ctx.hp) ctx.status = "failed";
    ctx.mp = Math.max(0, ctx.mp - (8 + DUNGEONS.indexOf(d) * 2));
  }
  s.xp += xp;
  ctx.earnedXP += xp;
  ctx.drops.push(...loot);
  room.answered++;
  if (ctx.questionIndex === room.queue.length - 1 && ctx.status === "active") {
    room.finishedAt = Date.now();
    room.deadline = null;
  }
  ctx.feedback = {
    correct,
    value,
    xp,
    damage,
    loot,
    hpBefore,
    mana: ctx.mp - mpBefore,
  };
  return ctx.feedback;
}
function resetQuestion(r) {
  Object.assign(r, {
    hidden: [],
    hint: false,
    answered: false,
    feedback: null,
    wager: false,
    focus: false,
    noteThisRoom: false,
    fixedMatches: {},
    matchDraft: [],
    draft: null,
    retry: false,
  });
}
export function nextQuestion(s) {
  const r = s.run;
  if (!r || r.status !== "active" || !r.answered || r.roomMode !== "question")
    return null;
  if (expireRun(s)) return "failed";
  const room = r.rooms[r.index];
  if ((r.questionIndex || 0) + 1 < room.queue.length) {
    r.questionIndex++;
    resetQuestion(r);
    return "question";
  }
  room.cleared = true;
  room.deadline = null;
  r.roomMode = "report";
  return "report";
}
export function nextRoom(s, rng = Math.random) {
  const r = s.run;
  if (
    !r ||
    r.status !== "active" ||
    r.roomMode !== "report" ||
    !r.rooms[r.index].cleared
  )
    return null;
  const a = attributes(s);
  if (r.index === r.rooms.length - 1) {
    r.status = "won";
    s.stats.wins++;
    const key = (r.course || "oop") + ":" + r.dungeon;
    s.cleared[key] = (s.cleared[key] || 0) + 1;
    const drops = [rollLoot(s, r.dungeon, rng)];
    if (s.stats.wins === 1) drops.push(rollLoot(s, r.dungeon, rng, true));
    for (let i = 0; i < (a.extraLoot || 0); i++)
      drops.push(rollLoot(s, r.dungeon, rng));
    const bonus =
      60 + (a.clearGold || 0) + (r.hp >= a.hp ? a.perfectGold || 0 : 0);
    s.gold += bonus;
    r.earnedGold += bonus;
    r.drops.push(...drops);
    recordRun(s);
    return "won";
  }
  r.index++;
  r.questionIndex = 0;
  resetQuestion(r);
  Object.assign(r, {
    used: [],
    roomMode: "map",
    hp: Math.min(a.hp, r.hp + (a.roomHeal || 0)),
    mp: Math.min(a.mp, r.mp + (a.roomMana || 0)),
  });
  return "next";
}
export function recordRun(s) {
  const r = s.run;
  if (!r || r.recorded) return;
  r.recorded = true;
  s.history.unshift({
    date: Date.now(),
    course: r.course || "oop",
    dungeon: r.dungeon,
    status: r.status,
    correct: r.correct,
    total: r.queue.length,
    xp: r.earnedXP,
  });
  s.history = s.history.slice(0, 80);
}
export function leaveRun(s) {
  if (s.run) {
    if (s.run.status === "active") s.run.status = "retreated";
    recordRun(s);
  }
  s.run = null;
}
export function equip(s, id) {
  if (s.run) throw Error("Ekipmanını kampta değiştirebilirsin.");
  const i = item(id);
  if (!i || !s.inventory[id] || i.slot === "consumable")
    throw Error("Bu eşya kuşanılamaz.");
  s.equipment[i.slot] = s.equipment[i.slot] === id ? null : id;
}
export function unlock(s, id) {
  const skill = SKILLS.find((sk) => sk.id === id);
  if (
    !skill ||
    skill.classId !== s.classId ||
    s.skills.includes(id) ||
    points(s) < 1 ||
    level(s).level < skill.level ||
    skill.requires.some((r) => !s.skills.includes(r))
  )
    throw Error("Sınıf, seviye, önkoşul veya puan şartı sağlanmıyor.");
  s.skills.push(id);
}
export function useSkill(s, id, training = false) {
  const r = training ? s.training : s.run,
    q = displayQuestion(s, training),
    a = attributes(s);
  if (!r || !q) throw Error("Önce aktif bir soruya gir.");
  if (training) {
    if (id !== "hint" || r.answered)
      throw Error("İpucu aktif soruda kullanılabilir.");
    r.hint = true;
    return;
  }
  expireRun(s);
  if (r.timedOut || r.roomMode !== "question")
    throw Error("Yetenekler aktif soruda kullanılabilir.");
  if (id === "second") {
    if (
      !availableAbilities(s).includes(id) ||
      r.secondUsed ||
      !r.answered ||
      r.feedback.correct ||
      r.feedback.retry
    )
      throw Error(
        "Bu yetenek koşuda tek bir yanlış cevap sonrasında kullanılabilir.",
      );
    r.secondUsed = true;
    r.retry = true;
    r.answered = false;
    r.status = "active";
    r.hp = Math.min(a.hp, r.feedback.hpBefore || 1);
    r.feedback = null;
    r.hidden = [];
    r.used.push(id);
    return;
  }
  if (r.answered || r.status !== "active") throw Error("Soru tamamlandı.");
  if (r.used.includes(id)) throw Error("Bu yeteneği bu odada kullandın.");
  if (
    !["notes", "potion", "ether"].includes(id) &&
    !availableAbilities(s).includes(id)
  )
    throw Error("Bu yetenek sınıfın veya ekipmanınla açılmamış.");
  const costs = {
    hint: a.hintCost,
    heal: a.healCost,
    eliminate: 25,
    shield: a.shieldCost,
    focus: a.focusCost,
    prophecy: 22,
    channel: 0,
    sanctuary: 25,
    evasion: 20,
    wager: 10,
    notes: 0,
    potion: 0,
    ether: 0,
  };
  const cost = costs[id];
  if (cost == null) throw Error("Bilinmeyen yetenek.");
  if (r.mp < cost) throw Error("Yeterli mana yok.");
  if (id === "hint" && r.hint) throw Error("İpucu zaten açık.");
  if (id === "heal" && r.hp >= a.hp) throw Error("Canın zaten dolu.");
  if (id === "shield" && r.shield) throw Error("Kalkan zaten etkin.");
  if (id === "eliminate" && q.type !== "mc")
    throw Error("Eleme test sorularında kullanılır.");
  if (id === "prophecy" && q.type !== "match")
    throw Error("Kehanet eşleştirme sorularında kullanılır.");
  if (id === "channel" && r.hp <= 20)
    throw Error("Mana aktarımı için 20’den fazla can gerekli.");
  if (id === "notes") {
    const note = item(s.equipment.notes);
    if (
      r.hint ||
      !note ||
      note.course !== q.course ||
      (note.topic !== -1 && note.topic !== q.topic)
    )
      throw Error("Bu ders ve konuya uygun, kullanılabilir bir not kuşan.");
    const max =
      (note.rarity === "legendary" ? 4 : note.rarity === "epic" ? 3 : 2) +
      a.noteUses;
    if (r.noteUses >= max) throw Error("Zindandaki not kullanım hakkın bitti.");
  }
  if (["potion", "ether"].includes(id)) {
    if (!s.inventory[id]) throw Error("Bu iksir çantanda yok.");
    if ((id === "potion" && r.hp >= a.hp) || (id === "ether" && r.mp >= a.mp))
      throw Error("Gösterge zaten dolu.");
  }
  r.mp -= cost;
  r.used.push(id);
  if (id === "hint") r.hint = true;
  if (id === "notes") {
    r.hint = true;
    r.noteUses++;
    r.noteThisRoom = true;
  }
  if (id === "heal") r.hp = Math.min(a.hp, r.hp + a.heal);
  if (id === "shield") r.shield = true;
  if (id === "eliminate")
    r.hidden.push(
      ...shuffle(
        q.options
          .map((_, i) => i)
          .filter((i) => i !== q.answer && !r.hidden.includes(i)),
      ).slice(0, a.eliminate),
    );
  if (id === "prophecy") {
    r.fixedMatches ||= {};
    for (const i of shuffle(q.options.map((_, i) => i)).slice(0, a.prophecy))
      r.fixedMatches[i] = q.answer[i];
  }
  if (id === "channel") {
    r.hp -= 20;
    r.mp = Math.min(a.mp, r.mp + 30);
  }
  if (id === "sanctuary") {
    r.hp = Math.min(a.hp, r.hp + 20);
    r.shield = true;
  }
  if (id === "evasion") r.evade = true;
  if (id === "wager") r.wager = true;
  if (id === "focus") r.focus = true;
  if (id === "potion") {
    s.inventory.potion--;
    r.hp = Math.min(a.hp, r.hp + 40 + (a.potionBonus || 0));
  }
  if (id === "ether") {
    s.inventory.ether--;
    r.mp = Math.min(a.mp, r.mp + 35);
  }
}
export const marketOffers = (s, date = today()) =>
  marketProducts(s.course, date);
export const marketBought = (s, id, date = today()) =>
  purchaseCount(s, id, date);
export const marketQuote = (s, id, quantity = 1, date = today()) =>
  quotePurchase(s, id, quantity, date, level(s).level);
export function buy(s, id, quantity = 1, date = today()) {
  const receipt = marketQuote(s, id, quantity, date);
  s.gold -= receipt.total;
  for (const { id, quantity } of receipt.items)
    s.inventory[id] = (s.inventory[id] || 0) + quantity;
  if (s.market?.date !== date) s.market = { date, purchases: {} };
  const key = s.course + ":" + id;
  s.market.purchases[key] = (s.market.purchases[key] || 0) + quantity;
  return receipt;
}
export const upgradeQuote = (s, id) => quoteUpgrade(s, id, level(s).level);
export function upgrade(s, id) {
  const quote = upgradeQuote(s, id);
  s.gold -= quote.gold;
  s.essence -= quote.essence;
  s.upgrades[id] = quote.next;
  return quote;
}
export function salvage(s, id) {
  const i = item(id);
  if (
    s.run ||
    !i ||
    !s.inventory[id] ||
    i.slot === "consumable" ||
    Object.values(s.equipment).includes(id)
  )
    throw Error("Kampta kuşanılmamış bir ekipman seç.");
  const value = salvageValue(s, id);
  s.inventory[id]--;
  s.essence += value;
  delete s.upgrades[id];
  return value;
}

export function enterRoom(s, index, now = Date.now()) {
  const r = s.run;
  if (
    !r ||
    r.status !== "active" ||
    r.index !== index ||
    r.answered ||
    r.roomMode !== "map"
  )
    throw Error("Bu oda henüz açık değil.");
  r.roomMode = "question";
  const room = r.rooms[index];
  if (room.seconds && !room.deadline) room.deadline = now + room.seconds * 1000;
}
export function expireRun(s, now = Date.now()) {
  const r = s.run,
    room = r?.rooms?.[r.index];
  if (
    !r ||
    r.status !== "active" ||
    !room?.deadline ||
    now < room.deadline ||
    room.cleared
  )
    return false;
  r.status = "failed";
  r.timedOut = true;
  r.showResult = true;
  room.expired = true;
  recordRun(s);
  return true;
}
export function incomingDamage(s, q, r = s.run) {
  const a = attributes(s),
    d = DUNGEONS.find((x) => x.id === r.dungeon),
    boss = r.index >= 6;
  const raw =
    34 +
    q.difficulty * 8 +
    DUNGEONS.indexOf(d) * 5 +
    (boss ? 12 : r.index === 2 ? 8 : 0) -
    a.defense -
    (r.hint ? a.hintDefense || 0 : 0) -
    (boss ? a.bossDefense || 0 : 0);
  return Math.max(8, Math.ceil(raw * (1 - (a.damageReduction || 0))));
}
export function retryRun(s) {
  const r = s.run;
  if (!r || r.status !== "failed")
    throw Error("Yalnızca biten bir yenilgi yeniden başlatılabilir.");
  const id = r.dungeon;
  leaveRun(s);
  return startRun(s, id);
}

function freshDaily() {
  return {
    date: today(),
    ids: [],
    rewardedIds: [],
    claimed: false,
    startedAt: null,
    deadline: null,
    failed: false,
  };
}
export function expireDaily(s, now = Date.now()) {
  if (s.daily.date !== today()) {
    s.daily = freshDaily();
    return true;
  }
  if (
    s.daily.deadline &&
    now >= s.daily.deadline &&
    !s.daily.claimed &&
    !s.daily.failed
  ) {
    s.daily.failed = true;
    s.daily.deadline = null;
    return true;
  }
  return false;
}
export function startDaily(s, now = Date.now()) {
  expireDaily(s, now);
  if (s.daily.claimed) throw Error("Bugünün ödülünü zaten aldın.");
  if (s.daily.deadline && !s.daily.failed)
    throw Error("Günlük görev zaten sürüyor.");
  Object.assign(s.daily, {
    ids: [],
    startedAt: now,
    deadline: now + DAILY_TRAINING_SECONDS * 1000,
    failed: false,
  });
  return s.daily;
}
