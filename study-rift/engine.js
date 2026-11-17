import { ITEMS, QUESTIONS, SKILLS, DUNGEONS } from "./data.js";
export const item = (id) => ITEMS.find((x) => x.id === id);
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export function freshState() {
  return {
    version: 1,
    name: "Avcı",
    xp: 0,
    gold: 0,
    inventory: { dagger: 1, cloak: 1, potion: 2 },
    equipment: { weapon: "dagger", armor: "cloak", relic: null, notes: null },
    skills: [],
    mastery: {},
    cleared: {},
    run: null,
    training: null,
    history: [],
    notes: "",
    daily: { date: today(), ids: [], claimed: false },
    settings: { sound: false },
    stats: { answered: 0, correct: 0, runs: 0, wins: 0, bestCombo: 0 },
  };
}
export function normalize(raw) {
  const s = { ...freshState(), ...raw };
  s.stats = { ...freshState().stats, ...s.stats };
  s.settings = { sound: false, ...s.settings };
  if (s.daily.date !== today())
    s.daily = { date: today(), ids: [], claimed: false };
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
export const points = (s) => Math.max(0, level(s).level - 1 - s.skills.length);
export function attributes(s) {
  let a = { hp: 100, mp: 80, xp: 0, mana: 12, defense: 0 };
  for (const id of Object.values(s.equipment)) {
    const it = item(id);
    if (it) for (const k of Object.keys(a)) a[k] += it[k] || 0;
  }
  if (s.skills.includes("vitality")) a.hp += 30;
  if (s.skills.includes("wisdom")) a.xp += 6;
  if (s.skills.includes("flow")) a.mana += 5;
  return a;
}
export function shuffle(a, rng = Math.random) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function canEnter(s, d) {
  return level(s).level >= d.level;
}
export function makeQueue(s, d, rng = Math.random) {
  const pool = QUESTIONS.filter((q) => q.difficulty === d.difficulty);
  const ordered = shuffle(pool, rng).sort(
    (a, b) => (s.mastery[a.id]?.correct || 0) - (s.mastery[b.id]?.correct || 0),
  );
  const queue = ordered.slice(0, 6).map((q) => q.id);
  const boss = shuffle(
    QUESTIONS.filter(
      (q) =>
        q.difficulty === Math.min(3, d.difficulty + 1) && !queue.includes(q.id),
    ),
    rng,
  )
    .slice(0, 2)
    .map((q) => q.id);
  return [...queue, ...boss];
}
export function startRun(s, id) {
  if (s.run) throw Error("Önce mevcut keşfini bitir veya kampta bırak.");
  const d = DUNGEONS.find((x) => x.id === id);
  if (!d || !canEnter(s, d)) throw Error("Bu kapı için seviyen yetersiz.");
  const a = attributes(s);
  s.run = {
    dungeon: id,
    queue: makeQueue(s, d),
    index: 0,
    hp: a.hp,
    mp: a.mp,
    combo: 0,
    shield: false,
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
  };
  s.stats.runs++;
  return s.run;
}
export function currentQuestion(s, training = false) {
  const id = training ? s.training?.id : s.run?.queue[s.run.index];
  return QUESTIONS.find((q) => q.id === id);
}
export function startTraining(s, filters = {}) {
  let pool = QUESTIONS.filter(
    (q) =>
      (filters.topic == null || q.topic === Number(filters.topic)) &&
      (!filters.type || q.type === filters.type) &&
      (!filters.weak || (s.mastery[q.id]?.wrong || 0) > 0),
  );
  if (!pool.length)
    throw Error("Bu filtrelerde soru yok. Önce başka bir konu veya tür seç.");
  const prev = s.training?.id;
  const rest = pool.filter((q) => q.id !== prev);
  const pick = shuffle(rest.length ? rest : pool)[0];
  s.training = {
    id: pick.id,
    answered: false,
    feedback: null,
    hint: false,
    filters,
  };
  return s.training;
}
export function checkAnswer(q, value) {
  if (q.type === "match")
    return Array.isArray(value) && q.answer.every((a, i) => value[i] === a);
  return Number(value) === q.answer;
}
export function addItem(s, id) {
  s.inventory[id] = (s.inventory[id] || 0) + 1;
}
export function rollLoot(s, rank = "e", rng = Math.random) {
  const n = rng();
  const rarity =
    rank === "e"
      ? n < 0.6
        ? "rare"
        : "common"
      : rank === "d"
        ? n < 0.25
          ? "epic"
          : "rare"
        : rank === "c"
          ? n < 0.05
            ? "legendary"
            : n < 0.45
              ? "epic"
              : "rare"
          : n < (rank === "s" ? 0.25 : 0.1)
            ? "legendary"
            : "epic";
  const pool = ITEMS.filter(
    (i) => i.rarity === rarity && !["dagger", "cloak"].includes(i.id),
  );
  const pick = pool[Math.floor(rng() * pool.length)];
  addItem(s, pick.id);
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
    if (s.daily.date !== today())
      s.daily = { date: today(), ids: [], claimed: false };
    if (correct && !s.daily.ids.includes(q.id)) {
      s.daily.ids.push(q.id);
      xp = 6;
      if (s.daily.ids.length >= 5 && !s.daily.claimed) {
        s.daily.claimed = true;
        s.gold += 35;
        addItem(s, "potion");
      }
    }
  }
  return xp;
}
export function answer(s, value, training = false, rng = Math.random) {
  const ctx = training ? s.training : s.run;
  const q = currentQuestion(s, training);
  if (!ctx || !q || ctx.answered || (!training && ctx.status !== "active"))
    throw Error("Bu soru zaten tamamlandı.");
  const correct = checkAnswer(q, value);
  ctx.answered = true;
  let xp = mastery(s, q, correct, training);
  let damage = 0,
    loot = [];
  if (training) {
    ctx.feedback = { correct, value, xp };
    s.xp += xp;
    return ctx.feedback;
  }
  const d = DUNGEONS.find((x) => x.id === ctx.dungeon),
    a = attributes(s);
  if (correct) {
    ctx.correct++;
    ctx.combo++;
    s.stats.bestCombo = Math.max(s.stats.bestCombo, ctx.combo);
    xp = 18 + q.difficulty * 8 + a.xp + (ctx.combo >= 3 ? 6 : 0);
    ctx.mp = Math.min(a.mp, ctx.mp + a.mana);
    s.gold += 8 + q.difficulty * 2;
    ctx.earnedGold += 8 + q.difficulty * 2;
    if (ctx.index === 3 && rng() < (s.skills.includes("luck") ? 0.6 : 0.25))
      loot.push(rollLoot(s, d.id, rng));
  } else {
    ctx.combo = 0;
    damage = Math.max(
      5,
      20 +
        q.difficulty * 4 +
        DUNGEONS.indexOf(d) * 3 +
        (ctx.index >= 6 ? 6 : 0) -
        a.defense,
    );
    if (ctx.shield) {
      damage = Math.ceil(damage / 2);
      ctx.shield = false;
    }
    ctx.hp = Math.max(0, ctx.hp - damage);
    if (!ctx.hp && s.equipment.relic === "phoenix" && !ctx.revived) {
      ctx.hp = 40;
      ctx.revived = true;
    }
    if (!ctx.hp) ctx.status = "failed";
  }
  s.xp += xp;
  ctx.earnedXP += xp;
  ctx.drops.push(...loot);
  ctx.feedback = { correct, value, xp, damage, loot };
  return ctx.feedback;
}
export function nextRoom(s, rng = Math.random) {
  const r = s.run;
  if (!r || !r.answered || r.status !== "active") return null;
  if (r.index === r.queue.length - 1) {
    r.status = "won";
    s.stats.wins++;
    s.cleared[r.dungeon] = (s.cleared[r.dungeon] || 0) + 1;
    const drops = [rollLoot(s, r.dungeon, rng)];
    if (s.stats.wins === 1) {
      const available = ITEMS.filter(
        (x) => x.slot === "notes" && x.rarity === "rare",
      );
      const note = available[Math.floor(rng() * available.length)];
      addItem(s, note.id);
      drops.push(note.id);
    }
    if (s.skills.includes("harvest")) drops.push(rollLoot(s, r.dungeon, rng));
    const bonus = s.skills.includes("harvest") ? 50 : 0;
    s.gold += 60 + bonus;
    r.earnedGold += 60 + bonus;
    r.drops.push(...drops);
    recordRun(s);
    return "won";
  }
  r.index++;
  r.used = [];
  r.hidden = [];
  r.hint = false;
  r.answered = false;
  r.feedback = null;
  return "next";
}
export function recordRun(s) {
  const r = s.run;
  if (!r || r.recorded) return;
  r.recorded = true;
  s.history.unshift({
    date: Date.now(),
    dungeon: r.dungeon,
    status: r.status,
    correct: r.correct,
    total: r.queue.length,
    xp: r.earnedXP,
  });
  s.history = s.history.slice(0, 40);
}
export function leaveRun(s) {
  if (s.run) {
    if (s.run.status === "active") s.run.status = "retreated";
    recordRun(s);
  }
  s.run = null;
}
export function equip(s, id) {
  if (s.run) throw Error("Ekipmanını değiştirmek için önce kampa dön.");
  const i = item(id);
  if (!i || !s.inventory[id] || i.slot === "consumable")
    throw Error("Bu eşya kuşanılamıyor.");
  s.equipment[i.slot] = s.equipment[i.slot] === id ? null : id;
}
export function unlock(s, id) {
  const skill = SKILLS.find((x) => x.id === id);
  if (
    !skill ||
    s.skills.includes(id) ||
    points(s) < 1 ||
    level(s).level < skill.level ||
    (skill.requires && !s.skills.includes(skill.requires))
  )
    throw Error("Seviye, önceki yetenek veya yetenek puanı şartı sağlanmıyor.");
  s.skills.push(id);
}
export function useSkill(s, id, training = false) {
  const r = training ? s.training : s.run,
    q = currentQuestion(s, training);
  if (!r || r.answered || (!training && r.status !== "active"))
    throw Error("Önce aktif bir soruya gir.");
  if (training) {
    if (id !== "hint")
      throw Error("Antrenmanda ipucunu ücretsiz kullanabilirsin.");
    r.hint = true;
    return;
  }
  if (r.used.includes(id)) throw Error("Bu yeteneği bu odada kullandın.");
  let cost = {
    hint: s.skills.includes("insight") ? 12 : 20,
    heal: 25,
    eliminate: 25,
    shield: 20,
    notes: 0,
    potion: 0,
    ether: 0,
  }[id];
  if (cost == null) throw Error("Bilinmeyen yetenek.");
  const a = attributes(s);
  if (id === "hint" && r.hint) throw Error("İpucu zaten açık.");
  if (id === "heal" && r.hp >= a.hp) throw Error("Canın zaten dolu.");
  if (id === "shield" && (!s.skills.includes("shield") || r.shield))
    throw Error("Kalkan açık değil veya zaten etkin.");
  if (
    id === "eliminate" &&
    !s.skills.includes("analysis") &&
    item(s.equipment.weapon)?.skill !== "eliminate"
  )
    throw Error("Eleme için Sezgi Asası veya Olasılık Kırılması gerekli.");
  if (id === "eliminate" && q.type !== "mc")
    throw Error("Eleme yalnızca çoktan seçmeli sorularda kullanılır.");
  if (id === "notes") {
    const n = item(s.equipment.notes);
    if (r.hint) throw Error("İpucu zaten açık.");
    if (!n || (n.topic !== -1 && n.topic !== q.topic))
      throw Error("Bu konuya uygun bir cheat sheet kuşanmalısın.");
    const limit = n.rarity === "legendary" ? 4 : n.rarity === "epic" ? 3 : 2;
    if (r.noteUses >= limit)
      throw Error("Bu zindandaki parşömen kullanımların bitti.");
  }
  if (["potion", "ether"].includes(id)) {
    if (!s.inventory[id]) throw Error("Bu iksirden çantanda yok.");
    if ((id === "potion" && r.hp >= a.hp) || (id === "ether" && r.mp >= a.mp))
      throw Error("İlgili gösterge zaten dolu.");
  }
  if (r.mp < cost) throw Error("Yeterli manan yok.");
  r.mp -= cost;
  r.used.push(id);
  if (id === "hint") r.hint = true;
  if (id === "notes") {
    r.hint = true;
    r.noteUses++;
  }
  if (id === "heal")
    r.hp = Math.min(a.hp, r.hp + (s.skills.includes("mend") ? 45 : 30));
  if (id === "shield") r.shield = true;
  if (id === "eliminate")
    r.hidden.push(
      shuffle(
        q.options
          .map((_, i) => i)
          .filter((i) => i !== q.answer && !r.hidden.includes(i)),
      )[0],
    );
  if (id === "potion") {
    s.inventory.potion--;
    r.hp = Math.min(a.hp, r.hp + 40);
  }
  if (id === "ether") {
    s.inventory.ether--;
    r.mp = Math.min(a.mp, r.mp + 35);
  }
}

export function buy(s, id) {
  if (s.run) throw Error("Alışveriş için önce kampa dön.");
  const price = { potion: 40, ether: 55 }[id];
  if (!price) throw Error("Bu eşya satılmıyor.");
  if (s.gold < price) throw Error("Yeterli altının yok.");
  s.gold -= price;
  addItem(s, id);
}
