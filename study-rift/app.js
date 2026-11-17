import { NAV_GROUPS, NAVS, navGroupFor } from "./navigation.js";
import { realmArt } from "./realm-art.js";
import {
  courseUnits,
  courseLessons,
  learningState,
  markLesson,
} from "./learning.js";
import { QUESTION_TYPES, answerLabel } from "./question-utils.js";
import { RELEASES, VERSION, compareVersions } from "./releases.js";
import {
  TOPICS as BASE_TOPICS,
  COURSES,
  CLASSES,
  getCourse,
  QUESTIONS,
  ITEMS,
  SKILLS,
  DUNGEONS,
  RARITIES,
  BONUS_NOTES,
} from "./game-data.js";
import * as E from "./engine.js";
import { icon, portalArt, knightArt } from "./art.js";
import {
  cloud,
  SaveStore,
  authRequest,
  masteryRequest,
  accountRequest,
} from "./cloud.js";
const marketSlots = {
  all: ["🧺", "Tümü"],
  consumable: ["🧪", "İksirler"],
  weapon: ["🗡️", "Silahlar"],
  armor: ["🛡️", "Zırhlar"],
  relic: ["🧿", "Tılsımlar"],
  notes: ["📑", "Cheat sheet"],
};
const statLabels = {
  hp: "maks. can",
  mp: "maks. mana",
  xp: "XP / doğru",
  mana: "mana / doğru",
  defense: "hasar azaltma",
  gold: "altın / doğru",
};
let lobbyFocus = "oop",
  marketTab = "shop",
  marketFilter = "all",
  marketSearch = "",
  marketSort = "level",
  marketAffordable = false,
  marketQuantities = {},
  navOverrides = {};
let lessonId = null,
  lessonTab = "read",
  flashIndex = 0,
  flashFlipped = false,
  clockOffset = 0,
  expiryRefreshAttempt = null;
let boardData = null,
  rankedSession = null,
  boardLoading = false,
  boardError = "",
  quizBusy = false;
let TOPICS = BASE_TOPICS,
  authMode = "login",
  userProfile = null,
  entering = false,
  resetting = false;
const $ = (s) => document.querySelector(s),
  esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const getLocal = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  guestKey = "study-rift-guest-v1";
let user = null,
  state = E.normalize(getLocal(guestKey) || E.freshState()),
  page = "lobby",
  busy = true,
  inventoryFilter = "all",
  trainingFilters = { topic: null, type: "", weak: false },
  codexTab = "notes",
  sync = "local",
  recovery = null,
  sessionExpired = false;
const store = new SaveStore((status) => {
  sync = status;
  if (status === "saved" && user) {
    try {
      localStorage.setItem(localKey() + ":dirty", "false");
    } catch {}
  }
  renderSync();
});
function localKey() {
  return user ? "study-rift-save-" + user.id : guestKey;
}
function save() {
  try {
    localStorage.setItem(localKey(), JSON.stringify(state));
    if (user) localStorage.setItem(localKey() + ":dirty", "true");
  } catch {
    toast(
      "Bu cihazda kayıt alanı dolu. Hesabına giriş yapıp bulut kaydını kullan.",
    );
  }
  store.enqueue(state);
  renderSync();
}
function renderSync() {
  const n = $("#sync");
  if (n)
    n.textContent =
      {
        local: "Bu cihazda kayıtlı",
        saving: "Kaydediliyor…",
        saved: "Buluta kaydedildi",
        error: "Bulut kaydı bekliyor · tekrar dene",
        conflict: "Başka cihazda kayıt değişti · yeniden yükle",
      }[sync] || "";
}
let toastTimer;
function toast(message) {
  const n = $("#toast");
  n.textContent = message;
  n.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => n.classList.remove("visible"), 4200);
}
function sound(success = true) {
  if (!state.settings.sound) return;
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)(),
      o = a.createOscillator(),
      g = a.createGain();
    o.connect(g);
    g.connect(a.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(success ? 660 : 180, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(
      success ? 990 : 100,
      a.currentTime + 0.15,
    );
    g.gain.setValueAtTime(0.035, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.25);
    o.start();
    o.stop(a.currentTime + 0.25);
    o.onended = () => a.close();
  } catch {}
}
const navs = NAVS;
const pill = (text, cls = "") => `<span class="pill ${cls}">${text}</span>`;
const button = (text, action, cls = "", attrs = "") =>
  `<button class="btn ${cls}" data-action="${action}" ${attrs}>${text}</button>`;
function progress(value, max, cls = "") {
  return `<div class="meter ${cls}"><span style="width:${Math.max(0, Math.min(100, (value / max) * 100))}%"></span></div>`;
}
function heading(eyebrow, title, sub, extra = "") {
  return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${sub}</p></div>${extra}</div>`;
}
function render() {
  TOPICS = E.course(state).topics;
  document.body.dataset.theme =
    page === "market"
      ? "market"
      : page === "lobby"
        ? getCourse(lobbyFocus).theme
        : E.course(state).theme;
  document.body.dataset.page = page;
  if (busy && !user) {
    $("#app").innerHTML = loadingScreen();
    return;
  }
  if (!user || sessionExpired) {
    $("#app").innerHTML = authGate();
    return;
  }
  if (resetting) {
    $("#app").innerHTML = resetScreen();
    return;
  }
  if (!userProfile && !busy) {
    $("#app").innerHTML = claimScreen();
    return;
  }
  if (!state.classId && !busy && page !== "settings") {
    $("#app").innerHTML = classScreen();
    return;
  }

  const l = E.level(state),
    a = E.attributes(state);
  $("#app").innerHTML =
    `<aside class="sidebar"><a href="#lobby" class="brand" data-page="lobby" aria-label="Study Rift ana lobi"><img src="./sigil.svg" alt=""><span>STUDY RIFT<small>KNOWLEDGE IS POWER</small></span></a><div class="nav-caption">${E.course(state).emoji} ${E.course(state).short}</div><nav aria-label="Ana menü">${sidebarGroups()}</nav><div class="sidebar-bottom"><div class="system-dot">SİSTEM ÇEVRİMİÇİ <span>v${VERSION}</span></div><button class="nav-item ${page === "settings" ? "active" : ""}" data-page="settings" aria-label="Ayarlar"><i class="nav-emoji" aria-hidden="true">⚙️</i><span>Ayarlar</span></button><button class="hunter-mini" data-page="character" aria-label="Avcı karakteri"><span class="avatar">${icon("user")}</span><span>${esc(state.name)}<small>Seviye ${l.level} · ${CLASSES.find((c) => c.id === state.classId)?.name || "Avcı"}</small></span>${icon("arrow")}</button></div></aside><div class="workspace"><div class="world-ambient" aria-hidden="true">${realmArt(page === "market" ? "market" : page === "lobby" ? lobbyFocus : state.course, "ambient")}</div><header class="topbar"><button class="course-switch" data-page="lobby"><span class="course-emoji" aria-hidden="true">${E.course(state).emoji}</span><span>${E.course(state).short}</span>${icon("arrow")}</button><div class="breadcrumbs">${page === "lobby" || page === "market" ? "DÜNYALAR ARASI" : esc(E.course(state).short)} <span>/</span><strong>${navs.find((n) => n[0] === page)?.[2] || "Ayarlar"}</strong></div><div class="top-actions"><span class="currency" title="Altın · market alışverişi">🪙 ${state.gold.toLocaleString("tr-TR")}</span><span class="currency essence" title="Öz · ekipman geliştirme">💠 ${state.essence.toLocaleString("tr-TR")}</span><span class="level-chip">SV. ${l.level}</span><button class="account-btn" aria-label="Hesap" data-action="account">${icon("user")}<span>Hesabım</span></button></div></header><main id="content" tabindex="-1">${entering ? `<div class="rift-entry" aria-hidden="true"><div class="entry-gate"></div><span>KAPI AÇILIYOR</span><strong>${E.course(state).realm}</strong></div>` : ""}${busy ? loadingScreen() : renderPage()}</main><footer><span class="footer-brand">◈ STUDY RIFT</span><button id="sync" data-action="sync"></button><span>${page === "lobby" ? COURSES.length + " ders dünyası" : page === "market" ? "GEZGİN PAZARI" : E.bank(state).length + " soru · " + E.course(state).short}</span></footer></div>`;
  renderSync();
}
function renderPage() {
  if (state.run && page === "dungeons")
    return (
      (state.run.legacyRooms
        ? `<div class="notice">${icon("book")}<p>Önceki sürümde başladığın keşif korunuyor. Yeni oda sınavları bir sonraki keşfinde açılacak; istersen kampa çekilip yeniden başlayabilirsin.</p></div>`
        : "") + battle()
    );
  return (
    {
      camp,
      courses,
      lobby,
      market,
      dungeons,
      training,
      character,
      skills,
      codex,
      stats,
      settings,
      leaderboard,
      learning,
      patches,
    }[page] || camp
  )();
}
function camp() {
  const l = E.level(state),
    d = DUNGEONS.filter((d) => E.canEnter(state, d)).at(-1),
    correct = state.stats.answered
      ? Math.round((state.stats.correct / state.stats.answered) * 100)
      : 0;
  return (
    heading(
      E.course(state).emoji + " " + E.course(state).realm,
      E.course(state).short + " <em>karargâhı</em>",
      E.course(state).name + " · Öğrenme yolundan başla veya keşfine devam et.",
      button("Ana lobiye dön", "go-lobby", "secondary"),
    ) +
    `<section class="panel learning-callout"><div class="activity-icon purple">${icon("book")}</div><div><span class="eyebrow">ÖNCE ANLA, SONRA MEYDAN OKU</span><h2>Kendi hızında öğren.</h2><p>${courseUnits(state.course).length} ünite · ${courseLessons(state.course).length} alt bölüm · anlatımlar, flash kartlar ve kısa kontroller.</p></div>${button("Öğrenme yoluna git " + icon("arrow"), "go-learning", "primary")}</section><div class="camp-grid"><section class="hero panel"><div class="hero-art">${realmArt(state.course, "camp-hero")}</div><div class="hero-shade"></div><div class="hero-content">${pill("● KEŞFEDİLMEYİ BEKLEYEN BİR DÜNYA", "soft")}<h2>Bilgini<br><em>güce dönüştür.</em></h2><p>Zindanlara gir. Sınırlarını aş.<br>Her soruda biraz daha güçlen.</p>${button(state.run ? "Keşfe devam et " + icon("arrow") : "Zindana gir " + icon("arrow"), "go-dungeons", "primary")}<div class="hero-meta"><span>${icon("shield")} ${d.rank}-Rank erişimi</span><span>${icon("chest")} Kalıcı ganimetler</span></div></div></section><section class="panel hunter-panel"><div class="section-top"><h3>Avcı profili</h3>${button("Karakter " + icon("arrow"), "go-character", "text")}</div><div class="profile-summary"><div class="profile-sigil">◈</div><div><h2>${esc(state.name)}</h2><p>${CLASSES.find((c) => c.id === state.classId)?.name || "Avcı"} <span>•</span> ${d.rank}-Rank</p></div><b class="level-badge">${l.level}<small>SEVİYE</small></b></div><div class="bar-label"><span>SEVİYE İLERLEMESİ</span><strong>${l.current} / ${l.needed} XP</strong></div>${progress(l.current, l.needed, "xp")}<div class="profile-stats"><div>${icon("heart")}<b>${E.attributes(state).hp}</b><small>CAN</small></div><div>${icon("gem")}<b>${E.attributes(state).mp}</b><small>MANA</small></div><div>${icon("bolt")}<b>${E.points(state)}</b><small>YETENEK PUANI</small></div></div><div class="mini-callout">${icon("tree")}<p>${E.points(state) ? "Yeni bir yetenek açabilirsin." : "Seviye atla, kendi yolunu seç."}<small>${CLASSES.find((c) => c.id === state.classId)?.name || "Sınıf seçimi"} · 16 yetenek</small></p>${button(icon("arrow"), "go-skills", "icon-btn", 'aria-label="Yetenek ağacını aç"')}</div></section></div><div class="quick-stats"><div>${icon("check")}<p><b>${state.stats.correct}</b><span>Doğru cevap</span></p></div><div>${icon("portal")}<p><b>${state.stats.wins}</b><span>Temizlenen zindan</span></p></div><div>${icon("chart")}<p><b>%${correct}</b><span>Doğruluk oranı</span></p></div><div>${icon("flame")}<p><b>${state.stats.bestCombo}×</b><span>En iyi seri</span></p></div></div><div class="section-top section-space"><div><h2>Bir sonraki adımın</h2><p>Sana uygun bir meydan okuma seç.</p></div><div class="section-actions">${button("🛒 Market", "go-market", "text")}${button("Tüm zindanlar " + icon("arrow"), "go-dungeons", "text")}</div></div><div class="three-grid"><button class="activity-card" data-action="go-dungeons"><div class="activity-icon purple">${icon("portal")}</div><span class="activity-kicker">ZİNDAN KEŞFİ</span><h3>${d.name}</h3><p>${d.desc}</p><div class="card-bottom"><span>${d.rank}-Rank · 8 oda</span>${icon("arrow")}</div></button><button class="activity-card" data-action="go-training"><div class="activity-icon green">${icon("training")}</div><span class="activity-kicker">GÜVENLİ ALAN</span><h3>Antrenman avlusu</h3><p>Can kaybetmeden öğren. Konunu seç, ipuçlarını aç, eksiklerini tamamla.</p><div class="card-bottom"><span>Sınırsız pratik · Ücretsiz ipucu</span>${icon("arrow")}</div></button>${dailyQuestView()}</div><div class="notice">${icon("book")}<p><strong>İlk keşif sürümü.</strong> ${E.course(state).name} · ${E.bank(state).length} özgün örnek soru, 5 zorluk. Slayt kaynağı henüz eklenmedi. Diğer dersler ayrı havuzlarla açılacak.</p></div>`
  );
}
function dungeons() {
  return (
    heading(
      "KAPILAR AÇILDI",
      "Zindan haritası",
      "Zorluk arttıkça rakiplerin de ganimetlerin de güçlenir.",
      pill("8 ODA / KEŞİF"),
    ) +
    `<div class="dungeon-grid">${DUNGEONS.map((d, i) => {
      const locked = !E.canEnter(state, d);
      return `<section class="dungeon-card panel ${locked ? "locked" : ""}" style="--dungeon:${d.color}"><div class="dungeon-art">${realmArt(state.course, "dungeon-" + i)}<span class="rank-stamp">${d.rank}<small>RANK</small></span>${locked ? `<div class="lock-overlay">${icon("lock")}<span>Seviye ${d.level} gerekli</span></div>` : ""}</div><div class="dungeon-info"><div class="section-top"><span class="eyebrow">${d.subtitle}</span>${state.cleared[state.course + ":" + d.id] ? pill(icon("check") + " " + state.cleared[state.course + ":" + d.id] + " KEZ") : ""}</div><h2>${d.name}</h2><p>${d.desc}</p><div class="dungeon-details"><span>${icon("sword")} ${["Temel", "Uygulama", "Analiz", "İleri", "Ustalık"][d.difficulty - 1]}</span><span>${icon("chest")} ${d.reward}</span></div>${button(locked ? icon("lock") + " Kilitli" : "Kapıdan geç " + icon("arrow"), "enter", "primary wide", `data-id="${d.id}" ${locked ? "disabled" : ""}`)}</div></section>`;
    }).join("")}</div>`
  );
}
function itemCard(i) {
  const equipped = state.equipment[i.slot] === i.id;
  return `<button class="item-card ${equipped ? "equipped" : ""}" style="--rarity:${RARITIES[i.rarity].color}" data-action="item" data-id="${i.id}"><span class="item-visual">${icon(i.icon)}<small>×${state.inventory[i.id]}</small></span><span class="item-rarity">${RARITIES[i.rarity].name}</span><h3>${i.name}${E.upgradeLevel(state, i.id) ? " +" + E.upgradeLevel(state, i.id) : ""}</h3><p>${i.effect}${E.upgradeLevel(state, i.id) ? " · " + bonusText(E.upgradeBonus(state, i.id)) : ""}</p><span class="item-bottom">${equipped ? icon("check") + " KUŞANILDI" : { weapon: "SİLAH", armor: "ZIRH", notes: "CHEAT SHEET", relic: "TILSIM", consumable: "TÜKETİLEBİLİR" }[i.slot]}</span></button>`;
}
function character() {
  const a = E.attributes(state),
    l = E.level(state);
  return (
    heading(
      "AVCI KAYDI",
      "Karakter & ekipman",
      "Gücün, öğrendiklerinde ve seçtiğin ekipmanda saklı.",
    ) +
    `<div class="character-grid"><section class="panel character-sheet"><div class="section-top"><div><span class="eyebrow">UYANAN AVCI</span><h2>${esc(state.name)}</h2></div><span class="level-badge">${l.level}<small>SEVİYE</small></span></div><div class="character-stage" data-class="${state.classId}">${knightArt()}<span class="character-label">${state.skills.length ? esc(SKILLS.find((x) => x.id === state.skills.at(-1)).path) : "Yolunu henüz seçmedin"}</span></div><div class="equipment-grid">${Object.entries(
      { weapon: "Silah", armor: "Zırh", relic: "Tılsım", notes: "Cheat Sheet" },
    )
      .map(([slot, name]) => {
        const i = E.item(state.equipment[slot]);
        return `<button class="equip-slot" data-action="${i ? "item" : "filter-slot"}" data-id="${i?.id || slot}" style="--rarity:${i ? RARITIES[i.rarity].color : "#525767"}">${icon(i?.icon || { weapon: "sword", armor: "armor", relic: "gem", notes: "scroll" }[slot])}<span><small>${name}</small><strong>${i?.name || "Boş yuva"}</strong></span></button>`;
      })
      .join(
        "",
      )}</div></section><div><section class="panel attribute-panel"><div class="section-top"><h3>Karakter özellikleri</h3>${pill("PASİF BONUSLAR")}</div><div class="attribute-grid">${[
      ["heart", "Maksimum can", a.hp],
      ["gem", "Maksimum mana", a.mp],
      ["bolt", "Doğru cevapta mana", "+" + a.mana],
      ["shield", "Hasar azaltma", a.defense],
      ["chart", "Bonus XP", "+" + a.xp],
      ["tree", "Yetenek puanı", E.points(state)],
    ]
      .map(
        ([i, n, v]) =>
          `<div>${icon(i)}<span>${n}</span><strong>${v}</strong></div>`,
      )
      .join(
        "",
      )}</div></section><div class="section-top section-space"><div><h2>Envanter</h2><p>Notlar da birer ganimet. Düşür, kuşan, kullan.</p></div><span class="muted">${Object.values(state.inventory).reduce((a, b) => a + b, 0)} eşya</span></div><div class="tabs">${[
      ["all", "Tümü"],
      ["weapon", "Silah"],
      ["armor", "Zırh"],
      ["relic", "Tılsım"],
      ["notes", "Notlar"],
      ["consumable", "İksir"],
    ]
      .map(
        ([id, n]) =>
          `<button class="${inventoryFilter === id ? "selected" : ""}" data-action="filter-slot" data-id="${id}">${n}</button>`,
      )
      .join("")}</div><div class="inventory-grid">${
      ITEMS.filter(
        (i) =>
          state.inventory[i.id] > 0 &&
          (inventoryFilter === "all" || i.slot === inventoryFilter),
      )
        .map(itemCard)
        .join("") ||
      `<div class="empty">${icon("chest")}<h3>Bu yuvalar henüz boş.</h3><p>Zindan boss’ları ekipman ve cheat sheet düşürür.<br>İlk zaferinde bir konu notu garanti.</p>${button("Zindanları keşfet", "go-dungeons", "secondary")}</div>`
    }</div></div></div>`
  );
}
function skills() {
  const c = CLASSES.find((c) => c.id === state.classId),
    nodes = SKILLS.filter((sk) => sk.classId === c.id),
    branchNames =
      c.id === "sage"
        ? ["Analiz", "Mana", "Notlar"]
        : c.id === "warden"
          ? ["Yaşam", "Savunma", "İkinci şans"]
          : ["Tempo", "Ganimet", "Risk"];
  return (
    heading(
      c.tag,
      c.name + " · Yetenek ağacı",
      "Her seviye 2 puan. Önceki düğümleri açarak dallarda ilerle.",
      pill(E.points(state) + " PUAN", "purple"),
    ) +
    `<section class="panel tree-panel" style="--class-color:${c.color}"><div class="tree-legend">${branchNames.map((n) => `<span>${n}</span>`).join("")}</div><div class="branch-tree">${nodes
      .map((sk) => {
        const owned = state.skills.includes(sk.id),
          ready =
            !owned &&
            E.points(state) > 0 &&
            E.level(state).level >= sk.level &&
            sk.requires.every((id) => state.skills.includes(id));
        return `<button class="branch-node ${owned ? "owned" : ready ? "available" : "inactive"}" style="grid-column:${sk.col};grid-row:${sk.row + 1}" data-action="unlock" data-id="${sk.id}" ${!ready ? "disabled" : ""}><span class="branch-line"></span><span class="branch-icon">${icon(owned ? "check" : sk.icon)}</span><strong>${sk.name}</strong><p>${sk.desc}</p><small>${owned ? "AÇILDI" : `SV. ${sk.level} · 1 PUAN`}</small></button>`;
      })
      .join(
        "",
      )}</div></section><div class="notice">${icon(c.icon)}<p>${c.unique} Sınıf seçimi kalıcıdır; bütün derslerde aynı avcıyla ilerlersin. Savaş içi yetenekler mana ve oda sınırlarıyla dengelenir.</p></div>`
  );
}
function stableChoices(q) {
  let seed = 0;
  for (const ch of q.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  return E.shuffle(
    q.type === "match" ? (q.choices ?? q.answer) : q.options,
    () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    },
  );
}
function readQuestionForm(form, q) {
  if (q.type === "short") return form.elements.response.value.trim();
  if (q.type === "multi")
    return Array.from(form.querySelectorAll("input[name=choice]:checked")).map(
      (n) => Number(n.value),
    );
  return q.options.map((_, i) => form.elements["step" + i].value);
}
function questionView(q, ctx, train = false, ranked = false) {
  const f = ctx.feedback,
    answered = !!ctx.answered,
    correct = f?.correct,
    formId = ranked ? "rank-answer-form" : "answer-form",
    draft = f?.value ?? ctx.draft ?? ctx.matchDraft,
    pending = ranked && quizBusy;
  let answers = "";
  if (q.type === "match" || q.type === "order") {
    const choices = stableChoices(q);
    answers = `<form id="${formId}"><div class="matching ${q.type === "order" ? "ordering" : ""}">${q.options.map((label, i) => `<label><span>${q.type === "order" ? `<b>${i + 1}</b> ${i + 1}. adım` : esc(label)}</span><select name="step${i}" required ${answered || pending || ctx.fixedMatches?.[i] ? "disabled" : ""}><option value="">${q.type === "order" ? "Bu adıma gelecek ifadeyi seç…" : "Karşılığını seç…"}</option>${choices.map((o) => `<option value="${esc(o)}" ${(ctx.fixedMatches?.[i] ?? draft?.[i]) === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>${answered ? `<small class="${f.value?.[i] === q.answer[i] ? "correct-text" : "wrong-text"}">${esc(q.answer[i])}</small>` : ""}</label>`).join("")}</div>${!answered ? '<button type="submit" class="btn primary" ' + (pending ? "disabled" : "") + ">Yanıtı kontrol et " + icon("arrow") + "</button>" : ""}</form>`;
  } else if (q.type === "multi") {
    answers = `<form id="${formId}"><p class="format-instruction">Doğru olan bütün seçenekleri işaretle. Eksik veya fazla seçim yanlış sayılır.</p><div class="multi-options">${q.options.map((option, i) => `<label class="multi-option ${answered ? (q.answer.includes(i) ? "correct-option" : f.value.includes(i) ? "wrong-option" : "") : ""}"><input type="checkbox" name="choice" value="${i}" ${draft?.includes(i) ? "checked" : ""} ${answered || pending ? "disabled" : ""}><span>${esc(option)}</span>${answered && q.answer.includes(i) ? icon("check") : ""}</label>`).join("")}</div>${!answered ? '<button type="submit" class="btn primary" ' + (pending ? "disabled" : "") + ">Seçimleri kontrol et " + icon("arrow") + "</button>" : ""}</form>`;
  } else if (q.type === "short") {
    answers = `<form id="${formId}" class="short-form"><label>Kısa yanıtın<input name="response" required maxlength="200" autocomplete="off" spellcheck="false" placeholder="Yanıtını yaz…" value="${esc(draft || "")}" ${answered || pending ? "disabled" : ""}></label><p class="format-instruction">Harf büyüklüğü önemli değil. Sorunun istediği terimi veya değeri yaz.</p>${!answered ? '<button type="submit" class="btn primary" ' + (pending ? "disabled" : "") + ">Yanıtı kontrol et " + icon("arrow") + "</button>" : ""}</form>`;
  } else
    answers = `<div class="answers ${q.type === "tf" ? "boolean" : ""}">${q.options
      .map((option, i) => {
        const reveal = answered && i === q.answer,
          wrong = answered && !correct && Number(f.value) === i;
        return `<button class="answer ${reveal ? "correct" : ""} ${wrong ? "wrong" : ""} ${ctx.hidden?.includes(i) ? "eliminated" : ""}" data-action="${ranked ? "rank-answer" : "answer"}" data-id="${i}" ${answered || ctx.hidden?.includes(i) || (ranked && quizBusy) ? "disabled" : ""}><span class="answer-letter">${q.type === "tf" ? (i === 0 ? "✓" : "×") : String.fromCharCode(65 + i)}</span><span>${esc(option)}</span>${reveal ? icon("check") : ""}</button>`;
      })
      .join("")}</div>`;
  const label = ranked
    ? correct
      ? "+" + f?.points + " PUAN"
      : "0 PUAN"
    : correct
      ? "+" + f?.xp + " XP"
      : train
        ? "Can kaybı yok"
        : "−" + f?.damage + " CAN";
  return `<section class="panel question-panel"><div class="question-meta"><span>${pill(QUESTION_TYPES[q.type])} ${pill(["", "TEMEL", "UYGULAMA", "ANALİZ", "İLERİ", "USTALIK"][q.difficulty], "dim")}</span><span>${esc(TOPICS[q.topic])}</span></div><h2>${esc(q.prompt)}</h2>${q.code ? "<pre><code>" + esc(q.code) + "</code></pre>" : ""}${answers}${!ranked && ctx.hint ? `<div class="hint-box">${icon("eye")}<div><b>Sezgi</b><p>${esc(q.hint)}</p>${E.attributes(state).deepHint ? `<p>${esc(BONUS_NOTES.find((n) => n.course === q.course && n.topic === q.topic)?.text || "Tanımı ve senaryonun varsayımlarını kontrol et.")}</p>` : ""}</div></div>` : ""}${answered ? `<div class="feedback ${correct ? "success" : "danger"}"><div class="feedback-head">${icon(correct ? "check" : "shield")}<strong>${correct ? "Doğru." : "Bu cevap doğru değil."}</strong><span>${label}</span></div>${["multi", "order", "short"].includes(q.type) ? `<p class="correct-text"><b>Doğru yanıt:</b> ${esc(answerLabel(q))}</p>` : ""}<p>${esc(q.explanation)}</p>${!ranked && !train ? `<p class="mana-feedback">${f.mana >= 0 ? "+" : ""}${f.mana || 0} MANA · ${ctx.mp} mana kaldı</p>` : ""}${f.loot?.length ? `<div class="inline-loot">${icon("chest")} Ganimet: ${f.loot.map((id) => E.item(id).name).join(", ")}</div>` : ""}</div><div class="question-next"><small>${esc(q.source)}</small>${button(ranked ? (rankedSession.attempt.completed ? "Sonucu gör" : "Sonraki soru") + " " + icon("arrow") : train ? "Sonraki soru " + icon("arrow") : state.run.status === "failed" ? "Keşif sonucu " + icon("arrow") : state.run.questionIndex === state.run.rooms[state.run.index].queue.length - 1 ? "Oda raporunu gör " + icon("arrow") : "Odada devam et " + icon("arrow"), ranked ? "rank-next" : train ? "next-training" : "next-question", "primary", quizBusy ? "disabled" : "")}</div>` : `<div class="question-source">${esc(q.source)}${ranked ? " · İpucu ve sınıf yetenekleri kapalı." : ""}</div>`}</section>`;
}

function battle() {
  const r = state.run,
    d = DUNGEONS.find((d) => d.id === r.dungeon),
    q = E.displayQuestion(state),
    a = E.attributes(state);
  if (r.status === "won" || (r.status === "failed" && r.showResult))
    return results();
  if (r.roomMode === "map") return roomMap();
  if (r.roomMode === "report") return roomReport();
  return (
    heading(
      r.index >= 6 ? "BOSS KARŞILAŞMASI" : "AKTİF KEŞİF",
      d.name,
      `Oda ${r.index + 1} / ${r.rooms.length} · ${E.ROOMS[r.index].name}`,
      button("Kampa çekil", "retreat", "secondary"),
    ) +
    `<section class="panel room-exam-header"><div><span class="eyebrow">${E.ROOMS[r.index].kind} SINAVI</span><strong>Soru ${r.questionIndex + 1} / ${r.rooms[r.index].queue.length}</strong><small>Yanıttan sonra odada kalırsın. ${r.rooms[r.index].seconds ? "Süre, sayfadan ayrılsan da devam eder." : "Bu oda süresiz."}</small></div>${r.rooms[r.index].deadline ? countdown(r.rooms[r.index].deadline) : pill("SÜRESİZ ODA", "green")}</section><div class="battle-layout"><div><div class="room-track">${r.rooms.map((_, i) => `<div class="${i < r.index ? "done" : i === r.index ? "current" : ""}">${icon(i >= 6 ? "sword" : i < r.index ? "check" : "gem")}<small>${i >= 6 ? "BOSS" : String(i + 1).padStart(2, "0")}</small></div>`).join("")}</div>${questionView(q, r)}</div><aside class="battle-side"><section class="panel vitals"><div class="section-top"><h3>${esc(state.name)}</h3>${pill("SV. " + E.level(state).level)}</div><div class="bar-label"><span class="hp-text">${icon("heart")} CAN</span><strong>${r.hp} / ${a.hp}</strong></div>${progress(r.hp, a.hp, "hp")}<div class="bar-label"><span class="mp-text">${icon("gem")} MANA</span><strong>${r.mp} / ${a.mp}</strong></div>${progress(r.mp, a.mp, "mp")}<div class="combo">${icon("flame")} <strong>${r.combo}× seri</strong><span>${r.combo >= a.comboThreshold ? "+" + a.comboXP + " XP bonus" : a.comboThreshold + " doğruda XP bonusu"}</span></div>${r.shield ? '<p class="shield-status">Kalkan etkin · sıradaki hasar yarıya iner</p>' : ""}</section><section class="panel abilities"><div class="section-top"><h3>Yeteneklerin</h3><span>Her oda 1×</span></div>${abilityPanel(r, a, q)}<div class="potion-row">${button(icon("potion") + " Can ×" + (state.inventory.potion || 0), "skill", "secondary", `data-id="potion" ${r.answered ? "disabled" : ""}`)}${button(icon("potion") + " Mana ×" + (state.inventory.ether || 0), "skill", "secondary", `data-id="ether" ${r.answered ? "disabled" : ""}`)}</div><p class="muted">Doğru cevap: +${a.mana} mana.<br>Yanlış cevap: yaklaşık ${E.incomingDamage(state, q, r)} can. Kalkan ve kaçış bu hasarı azaltır.</p></section><div class="battle-rewards">${icon("chest")}<span>Bu keşifte <b>+${r.earnedXP} XP · ${r.drops.length} loot</b></span></div></aside></div>`
  );
}
function results() {
  const r = state.run,
    d = DUNGEONS.find((d) => d.id === r.dungeon),
    won = r.status === "won";
  return `<div class="results"><div class="result-emblem ${won ? "victory" : ""}">${icon(won ? "chest" : "shield")}</div><span class="eyebrow">${d.rank}-RANK · ${d.name}</span><h1>${won ? "Zindan temizlendi." : r.timedOut ? "Odanın süresi doldu." : "Bu keşif sona erdi."}</h1><p>${won ? "Bilgin derinleşti. Ganimetlerin seni bekliyor." : (r.timedOut ? "Oda sınavı zamanında bitmedi. " : "") + "Aynı zorluğu yeniden denediğinde 1. odadan başlayacaksın. Kalıcı XP ve eşyaların sende."}</p><div class="result-stats panel"><div><b>${r.correct} / ${r.queue.length}</b><span>Doğru cevap</span></div><div><b>+${r.earnedXP}</b><span>Deneyim puanı</span></div><div><b>+${r.earnedGold}</b><span>Altın</span></div></div>${r.drops.length ? `<h2>Ganimetlerin</h2><div class="loot-grid">${r.drops.map((id, i) => `<div class="loot-reveal" style="--delay:${i * 0.15}s;--rarity:${RARITIES[E.item(id).rarity].color}">${icon(E.item(id).icon)}<small>${RARITIES[E.item(id).rarity].name}</small><h3>${E.item(id).name}</h3><p>${E.item(id).effect}</p></div>`).join("")}</div>` : ""}<div class="result-actions">${!won ? button("Aynı zorluğu baştan dene", "retry-run", "primary") : ""}${button("Kampa dön", "end-run", "secondary")}${button("Ekipmanları incele " + icon("arrow"), "end-equip", "primary")}</div></div>`;
}
function training() {
  const ctx = state.training,
    q = E.displayQuestion(state, true);
  return (
    heading(
      "CAN KAYBI YOK · BASKI YOK",
      "Antrenman avlusu",
      "Önce öğren. Sonra zindanda bilgini güce dönüştür.",
    ) +
    `${trainingQuestBanner()}<section class="panel training-controls"><label>KONU<select id="train-topic"><option value="">Bütün konular</option>${TOPICS.map((t, i) => `<option value="${i}" ${String(trainingFilters.topic) === String(i) ? "selected" : ""}>${t}</option>`).join("")}</select></label><label>SORU TÜRÜ<select id="train-type"><option value="">Bütün türler</option>${[
      ["mc", "Çoktan seçmeli"],
      ["tf", "Doğru / yanlış"],
      ["match", "Eşleştirme"],
      ["multi", "Çoklu seçim"],
      ["order", "Sıralama"],
      ["short", "Kısa yanıt"],
    ]
      .map(
        ([v, n]) =>
          `<option value="${v}" ${trainingFilters.type === v ? "selected" : ""}>${n}</option>`,
      )
      .join(
        "",
      )}</select></label><label>ZORLUK<select id="train-difficulty"><option value="">Bütün seviyeler</option>${[1, 2, 3, 4, 5].map((v) => `<option value="${v}" ${Number(trainingFilters.difficulty) === v ? "selected" : ""}>${v} · ${["Temel", "Uygulama", "Analiz", "İleri", "Ustalık"][v - 1]}</option>`).join("")}</select></label><label class="checkbox-label"><input id="train-weak" type="checkbox" ${trainingFilters.weak ? "checked" : ""}> Yanlış yaptıklarım</label>${button("Antrenmana başla " + icon("arrow"), "train-start", "primary")}</section>${ctx && q ? `<div class="training-meta"><span>${pill("GÜVENLİ ALAN", "green")} İlk doğru çözüm: +6–12 XP / soru / gün</span>${button(icon("eye") + " Ücretsiz ipucu", "training-hint", "secondary", ctx.answered ? "disabled" : "")}</div>${questionView(q, ctx, true)}` : `<div class="training-empty panel"><div class="activity-icon green">${icon("training")}</div><h2>Burası senin deneme alanın.</h2><p>Konu seç, soruları çöz, açıklamaları oku.<br>Hata yapmanın hiçbir cezası yok.</p><div class="training-benefits"><span>${icon("heart")} Can kaybı yok</span><span>${icon("eye")} Ücretsiz ipuçları</span><span>${icon("book")} Ayrıntılı açıklamalar</span></div></div>`}`
  );
}
function codex() {
  const wrong = E.bank(state).filter((q) => state.mastery[q.id]?.wrong > 0);
  return (
    heading(
      E.course(state).short + " · BİLGİ SENİNLE KALIR",
      "Bilgi defteri",
      "Kaybettiğin can geri gelir. Öğrendiğin bilgi sende kalır.",
    ) +
    `<div class="tabs"><button class="${codexTab === "notes" ? "selected" : ""}" data-action="codex-tab" data-id="notes">Bonus notlar</button><button class="${codexTab === "wrong" ? "selected" : ""}" data-action="codex-tab" data-id="wrong">Yanlış defteri (${wrong.length})</button><button class="${codexTab === "personal" ? "selected" : ""}" data-action="codex-tab" data-id="personal">Kendi notlarım</button></div>${
      codexTab === "notes"
        ? `<div class="two-grid">${BONUS_NOTES.filter(
            (n) => n.course === state.course,
          )
            .map((n) => {
              const unlocked = ITEMS.some(
                (i) =>
                  i.slot === "notes" &&
                  i.course === state.course &&
                  state.inventory[i.id] > 0 &&
                  (i.topic === n.topic || i.topic === -1),
              );
              return `<article class="panel bonus-note ${unlocked ? "" : "locked-note"}"><div class="eyebrow">${TOPICS[n.topic]}</div><h2>${unlocked ? icon("book") : icon("lock")} ${n.title}</h2><p>${unlocked ? n.text : "Bu bonus not henüz keşfedilmedi. İlgili cheat sheet’i zindanda düşürerek aç."}</p><small>${unlocked ? "Çantandaki nottan açıldı · Kuşanırsan savaşta ücretsiz ipucu verir." : "Boss ganimeti · İlk zaferinde bir konu notu garanti."}</small></article>`;
            })
            .join("")}</div>`
        : codexTab === "wrong"
          ? wrong.length
            ? `<div class="wrong-list">${wrong.map((q) => `<details class="panel"><summary><span>${pill(TOPICS[q.topic])}<strong>${esc(q.prompt)}</strong></span><span>${state.mastery[q.id].wrong} yanlış ${icon("arrow")}</span></summary>${q.code ? "<pre>" + esc(q.code) + "</pre>" : ""}<p class="correct-text">Doğru cevap: ${esc(answerLabel(q))}</p><p>${esc(q.explanation)}</p></details>`).join("")}</div>`
            : `<div class="empty panel">${icon("check")}<h2>Henüz yanlışın yok.</h2><p>Yanlış çözdüğün her soru açıklamasıyla burada birikir.</p></div>`
          : `<section class="panel personal-notes"><label for="personal-notes">Avcı notların</label><textarea id="personal-notes" maxlength="30000" placeholder="Kendi örneklerini, formüllerini ve aklında kalmasını istediğin şeyleri yaz…">${esc(state.notebooks[state.course] || "")}</textarea><div class="section-top"><small>Hesabına giriş yaptıysan notların da buluta kaydedilir.</small>${button("Notları kaydet", "save-notes", "primary")}</div></section>`
    }`
  );
}
function stats() {
  const active = E.bank(state)
    .map((q) => state.mastery[q.id])
    .filter(Boolean);
  const hist = state.history.filter(
    (h) => (h.course || "oop") === state.course,
  );
  const st = {
    ...state.stats,
    answered: active.reduce((a, m) => a + m.correct + m.wrong, 0),
    correct: active.reduce((a, m) => a + m.correct, 0),
    wins: hist.filter((h) => h.status === "won").length,
    runs: hist.length,
  };
  return (
    heading(
      E.course(state).short + " · HER ADIM BİR İZ BIRAKIR",
      "Gelişim raporu",
      "Nerede güçlüsün, nerede biraz daha antrenman gerekiyor?",
    ) +
    `<div class="quick-stats"><div><p><b>${st.answered}</b><span>Çözülen soru</span></p></div><div><p><b>%${st.answered ? Math.round((st.correct / st.answered) * 100) : 0}</b><span>Doğruluk</span></p></div><div><p><b>${st.wins} / ${st.runs}</b><span>Zindan zaferi / giriş</span></p></div><div><p><b>${state.xp}</b><span>Toplam XP</span></p></div></div><section class="panel topic-progress"><h2>Konu hâkimiyeti</h2>${TOPICS.map(
      (t, i) => {
        const qs = E.bank(state).filter((q) => q.topic === i),
          learned = qs.filter((q) => state.mastery[q.id]?.lastCorrect).length;
        return `<div class="topic-row"><span>${t}</span>${progress(learned, qs.length, "xp")}<strong>${learned} / ${qs.length}</strong></div>`;
      },
    ).join(
      "",
    )}<p class="muted">Son denemende doğru çözdüğün farklı soruların oranı; sınav notu tahmini değildir.</p></section><section class="panel run-history"><h2>Keşif geçmişi</h2>${
      state.history.filter((h) => (h.course || "oop") === state.course).length
        ? `<div class="table-wrap"><table><thead><tr><th>Zindan</th><th>Sonuç</th><th>Doğru</th><th>XP</th><th>Tarih</th></tr></thead><tbody>${state.history
            .filter((h) => (h.course || "oop") === state.course)
            .map(
              (h) =>
                `<tr><td>${DUNGEONS.find((d) => d.id === h.dungeon)?.name}</td><td>${{ won: "Zafer", failed: "Yenilgi", retreated: "Geri çekilme" }[h.status]}</td><td>${h.correct} / ${h.total}</td><td>+${h.xp}</td><td>${new Date(h.date).toLocaleDateString("tr-TR")}</td></tr>`,
            )
            .join("")}</tbody></table></div>`
        : '<p class="muted">İlk zindanından sonra keşiflerin burada görünecek.</p>'
    }</section>`
  );
}
function settings() {
  return (
    heading(
      "HESAP & OYUN AYARLARI",
      "Kendi ritmini bul",
      "Görünen adın değişebilir. Giriş kullanıcı adın ve ilerlemen aynı kalır.",
    ) +
    `<div class="settings-grid"><section class="panel settings-panel"><span class="eyebrow">AVCI KİMLİĞİ</span><h2>Görünen adın</h2><form id="profile-form"><label>Giriş kullanıcı adı<input value="${esc(userProfile?.username || "")}" disabled></label><label>Görünen ad<input name="displayName" required minlength="2" maxlength="24" value="${esc(userProfile?.display_name || state.name)}" autocomplete="nickname"></label><p>Bu ad karakterinde ve Ustalık tablosunda görünür. Değişiklik puanını veya sıranı sıfırlamaz.</p><p id="profile-error" role="status"></p><button class="btn primary" type="submit">Görünen adı kaydet</button></form><hr><label class="checkbox-label"><input type="checkbox" id="sound" ${state.settings.sound ? "checked" : ""}> Cevap seslerini aç</label><hr><h3>Hesap & kayıt</h3><p>İlerlemen otomatik kaydedilir ve hesabınla cihazlar arasında taşınır.</p>${button("Hesabımı görüntüle", "account", "secondary")}</section><section class="panel settings-panel"><span class="eyebrow">ZİNDAN KURALLARI</span><h2>Her oda ayrı bir sınav</h2><p>Yeni keşifler 8 oda ve toplam 23 sorudan oluşur. Odaların soru sayısı, biçimleri ve süreleri farklıdır. Cevap sonrası açıklamayı okuyup aynı odada devam edersin; haritaya yalnız oda raporundan dönersin.</p><p>Süreli odalarda sayaç ilk girişte başlar, sayfa değişince veya yenileyince durmaz. Son soruya zamanında yanıt verince durur. Süre dolarsa keşif biter; yeniden girişte ilk odadan başlanır.</p><p>Mana kıttır: doğru cevap küçük miktar yeniler; yanlış cevap zorlukla artan mana kaybı verir. Aktif yetenekler oda başına bir kez kullanılır. Can ve Mana İksirlerini de oda başına birer kez kullanabilirsin.</p><p>Günlük antrenman görevi 5 dakikada 5 farklı doğru ister. Tekrar deneyebilirsin; ödül günde bir kezdir. Günlük Ustalık sınavında 10 dakika ve tek deneme vardır. Herkese aynı süre verilir, hız bonusu yoktur.</p><p class="muted">v${VERSION} · İçerikler özgün çalışma örnekleridir; hocanın slaytları henüz eklenmedi.</p></section></div><section class="panel danger-zone"><div><span class="eyebrow">HESABI KAPAT</span><h2>Study Rift hesabını sil</h2><p>Karakterin, eşyaların, notların, öğrenme ilerlemen ve tüm Ustalık sonuçların kalıcı olarak silinir. Sıralamadaki kaydın da kaldırılır.</p></div>${button("Hesabımı sil", "delete-account", "danger")}</section>`
  );
}
function modal(content) {
  const m = $("#modal");
  m.innerHTML = `<button class="modal-close" data-action="close-modal" aria-label="Kapat">${icon("close")}</button>${content}`;
  if (!m.open) m.showModal();
}
function showRecovery() {
  modal(
    `<h2>Kaydedilmeyi bekleyen ilerleme var.</h2><p>Bu cihazdaki son değişiklikler bulut kaydıyla farklı. Hangi kayıtla devam etmek istediğini seç.</p><div class="recovery-options">${button("Bu cihaz: " + recovery.xp + " XP", "recover-local", "primary wide")}${button("Bulut: " + state.xp + " XP", "recover-cloud", "secondary wide")}</div><p class="muted small">Seçilmemiş kopya bu cihazda yedeklenir.</p>`,
  );
}
function shopModal() {
  navigate("market");
}
function itemModal(id) {
  const i = E.item(id);
  if (!i) return;
  const owned = state.equipment[i.slot] === id;
  modal(
    `<div class="item-detail" style="--rarity:${RARITIES[i.rarity].color}"><div class="detail-art">${icon(i.icon)}</div><div class="item-rarity">${RARITIES[i.rarity].name}</div><h2>${i.name}${E.upgradeLevel(state, i.id) ? " +" + E.upgradeLevel(state, i.id) : ""}</h2><p>${i.desc}</p><div class="item-effect">${i.effect}${E.upgradeLevel(state, i.id) ? " · " + bonusText(E.upgradeBonus(state, i.id)) : ""}</div><p class="muted">Çantanda ${state.inventory[id] || 0} adet var.</p>${i.slot === "consumable" ? "<p>İksirleri zindandayken yetenek panelinden kullanabilirsin.</p>" : button(owned ? "Kuşanmayı bırak" : "Kuşan " + icon("arrow"), "equip", "primary wide", `data-id="${id}" ${state.run ? "disabled" : ""}`)}${!state.run && i.slot !== "consumable" && !owned ? button("💠 " + E.salvageValue(state, id) + " öze dönüştür", "market-salvage", "text wide", `data-id="${id}"`) : ""}${state.run ? "<small>Önce keşfini bitirip kampa dön.</small>" : ""}</div>`,
  );
}
function accountModal(mode = "login") {
  if (user && !sessionExpired) {
    modal(
      `<div class="auth-heading"><div class="activity-icon purple">${icon("user")}</div><h2>Avcı hesabın</h2><p>${esc(userProfile?.username || state.name)}</p></div><p>İlerlemen hesabına bağlı olarak kaydedilir.</p><p id="account-sync">${esc($("#sync")?.textContent)}</p>${button("Hesap ayarları", "account-settings", "primary wide")}${button("Kaydı tekrar dene", "sync", "secondary wide")}<hr>${button("Çıkış yap", "logout", "secondary wide")}`,
    );
    return;
  }
  authMode = mode;
  render();
}
async function loadUser(u) {
  busy = true;
  render();
  try {
    const [raw, profileResult] = await Promise.all([
      store.load(u),
      cloud
        .from("study_rift_profiles")
        .select("username,recovery_enabled,display_name")
        .eq("user_id", u.id)
        .maybeSingle(),
    ]);
    if (profileResult.error) throw profileResult.error;
    userProfile = profileResult.data;
    user = u;
    if (!userProfile) {
      busy = false;
      sessionExpired = false;
      state = E.normalize(
        getLocal("study-rift-save-" + u.id) || E.freshState(),
      );
      render();
      return;
    }
    sessionExpired = false;
    if (raw) {
      const cached = getLocal("study-rift-save-" + u.id),
        dirty = getLocal("study-rift-save-" + u.id + ":dirty");
      if (dirty && cached && JSON.stringify(cached) !== JSON.stringify(raw)) {
        recovery = cached;
      }
      state = E.normalize(raw);
    } else {
      const cached = getLocal("study-rift-save-" + u.id);
      state = E.normalize(cached || getLocal(guestKey) || E.freshState());
      if (u.user_metadata?.hunter_name && !raw && !cached)
        state.name = u.user_metadata.hunter_name;
      store.enqueue(state);
    }
    if (userProfile)
      state.name = userProfile.display_name || userProfile.username;
    sync = "saved";
    if (!recovery) save();
  } catch (err) {
    user = u;
    sessionExpired = false;
    store.user = null;
    sync = "error";
    const cached = getLocal("study-rift-save-" + u.id);
    state = E.normalize(cached || E.freshState());
    toast(
      "Bulut kaydı yüklenemedi. Verileri korumak için oyun durduruldu; bağlantını kontrol edip yeniden yükle.",
    );
    busy = true;
    render();
    $("#content").innerHTML =
      `<div class="empty panel"><h2>Kaydına ulaşamadık.</h2><p>İlerlemenin üzerine yazmamak için bağlantı kurulmasını bekliyoruz.</p>${button("Yeniden dene", "reload", "primary")}</div>`;
    return;
  }
  busy = false;
  lobbyFocus = state.course;
  page = "lobby";
  render();
  if (recovery) showRecovery();
}
function navigate(p) {
  page = p === "courses" ? "lobby" : p;
  const group = navGroupFor(page);
  if (group) navOverrides[group.id] = false;
  if (p === "leaderboard") fetchBoard();
  if (p === "training" && state.training)
    trainingFilters = state.training.filters;
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
}
function mutate(fn) {
  if (busy || !user || !userProfile || !state.classId) return;
  if (sessionExpired) {
    accountModal();
    return;
  }
  if (recovery) {
    showRecovery();
    return;
  }
  try {
    const draftForm = $("#answer-form"),
      draftCtx = page === "training" ? state.training : state.run;
    if (draftForm && draftCtx && !draftCtx.answered)
      draftCtx.draft = readQuestionForm(
        draftForm,
        E.displayQuestion(state, page === "training"),
      );
    const oldLevel = E.level(state).level;
    fn();
    save();
    render();
    if (E.level(state).level > oldLevel) {
      toast(
        "SEVİYE ATLADIN · " +
          E.level(state).level +
          " · Yeni yetenek puanı kazandın!",
      );
      sound();
    }
  } catch (e) {
    toast(e.message);
  }
}
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-action],[data-page]");
  if (!el) return;
  if (el.dataset.page) {
    navigate(el.dataset.page);
    return;
  }
  const act = el.dataset.action,
    id = el.dataset.id;
  if (act.startsWith("go-")) {
    if ($("#modal").open) $("#modal").close();
    navigate(act.slice(3));
    return;
  }
  if (act === "recover-local" || act === "recover-cloud") {
    try {
      localStorage.setItem(
        localKey() + ":backup",
        JSON.stringify(act === "recover-local" ? state : recovery),
      );
    } catch {}
    if (act === "recover-local") state = E.normalize(recovery);
    recovery = null;
    save();
    $("#modal").close();
    render();
    return;
  }
  if (act === "close-modal") {
    $("#modal").close();
    return;
  }
  if (act === "account") {
    accountModal();
    return;
  }
  if (act === "auth-mode") {
    authMode = id;
    render();
    return;
  }
  if (act === "reload") {
    location.reload();
    return;
  }
  if (act === "sync") {
    if (sync === "conflict") {
      modal(
        "<h2>Kayıt başka bir cihazda değişti.</h2><p>Bu cihazdaki kopya korunuyor. Güncel bulut kaydını yüklemek için sayfayı yenile.</p>" +
          button("Güncel kaydı yükle", "reload", "primary"),
      );
    } else if (user) {
      store.flush();
      toast("Bulut kaydı yeniden deneniyor.");
    } else accountModal();
    return;
  }
  if (act === "logout") {
    el.disabled = true;
    await store.flush();
    if (store.running || store.pending || store.blocked) {
      el.disabled = false;
      toast("Kaydedilmeyen ilerleme var. Çıkmadan önce kaydı eşitle.");
      return;
    }
    const { error } = await cloud.auth.signOut();
    if (error) {
      el.disabled = false;
      toast(error.message);
      return;
    }
    user = null;
    userProfile = null;
    boardData = null;
    rankedSession = null;
    sessionExpired = false;
    store.user = null;
    store.pending = null;
    state = E.normalize(getLocal(guestKey) || E.freshState());
    sync = "local";
    $("#modal").close();
    page = "camp";
    render();
    return;
  }
  if (act === "nav-folder") {
    const closed = !navCollapsed(id);
    mutate(() => {
      state.settings.navGroups ||= {};
      state.settings.navGroups[id] = closed;
      navOverrides[id] = closed;
    });
    return;
  }
  if (act === "preview-course") {
    lobbyFocus = id;
    page = "lobby";
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }
  if (act === "market-tab") {
    marketTab = id;
    render();
    return;
  }
  if (act === "market-filter") {
    marketFilter = id;
    render();
    return;
  }
  if (act === "market-quantity") {
    const product = el.dataset.product;
    marketQuantities[product] = Math.min(
      99,
      Math.max(1, (marketQuantities[product] || 1) + Number(id)),
    );
    render();
    return;
  }
  if (act === "market-preview") {
    purchaseModal(id, marketQuantities[id] || 1);
    return;
  }
  if (act === "market-buy") {
    if (el.disabled) return;
    el.disabled = true;
    let receipt;
    mutate(() => (receipt = E.buy(state, id, Number(el.dataset.quantity))));
    if (receipt) purchaseReceipt(receipt);
    else el.disabled = false;
    return;
  }
  if (act === "market-upgrade") {
    upgradeModal(id);
    return;
  }
  if (act === "market-upgrade-confirm") {
    if (el.disabled) return;
    el.disabled = true;
    let quote;
    mutate(() => (quote = E.upgrade(state, id)));
    if (quote) {
      $("#modal").close();
      toast(E.item(id).name + " +" + quote.next + " seviyesine geliştirildi.");
    } else el.disabled = false;
    return;
  }
  if (act === "market-salvage") {
    salvageModal(id);
    return;
  }
  if (act === "market-salvage-confirm") {
    let value;
    mutate(() => (value = E.salvage(state, id)));
    if (value !== undefined) {
      $("#modal").close();
      toast(value + " öz kazandın.");
    }
    return;
  }
  if (act === "market-equip") {
    mutate(() => E.equip(state, id));
    $("#modal").close();
    return;
  }
  if (act === "shop") {
    shopModal();
    return;
  }
  if (act === "buy") {
    mutate(() => E.buy(state, id));
    shopModal();
    return;
  }
  if (act === "select-class") {
    if (!user || !userProfile) return;
    try {
      E.chooseClass(state, id);
      page = "lobby";
      lobbyFocus = state.course;
      save();
      render();
      toast("Sınıfın uyandı. İlk keşfin seni bekliyor.");
    } catch (err) {
      toast(err.message);
    }
    return;
  }
  if (act === "select-course") {
    mutate(() => {
      E.switchCourse(state, id);
      rankedSession = null;
      boardData = null;
      lessonId = null;
      page = "camp";
      lobbyFocus = id;
      navOverrides.study = false;
      trainingFilters = { topic: null, type: "", weak: false };
    });
    return;
  }
  if (act === "salvage") {
    mutate(() => E.salvage(state, id));
    $("#modal").close();
    return;
  }
  if (act === "item") {
    itemModal(id);
    return;
  }
  if (act === "filter-slot") {
    inventoryFilter = id;
    page = "character";
    render();
    return;
  }
  if (act === "codex-tab") {
    codexTab = id;
    render();
    return;
  }
  if (act === "enter") {
    mutate(() => E.startRun(state, id));
    if (state.run) {
      entering = true;
      render();
      setTimeout(() => {
        entering = false;
        render();
      }, 1100);
    }
    return;
  }
  if (act === "equip") {
    mutate(() => E.equip(state, id));
    $("#modal").close();
    return;
  }
  if (act === "unlock") {
    mutate(() => E.unlock(state, id));
    return;
  }
  if (act === "account-settings") {
    $("#modal").close();
    page = "settings";
    render();
    return;
  }
  if (act === "delete-account") {
    deleteAccountModal();
    return;
  }
  if (act === "go-learning") {
    page = "learning";
    lessonId = null;
    render();
    return;
  }
  if (act === "learn-overview") {
    lessonId = null;
    render();
    return;
  }
  if (act === "learn-open" || act === "learn-resume") {
    openLesson(
      id ||
        learningState(state).lastLesson ||
        courseLessons(state.course).find(
          (l) => !learningState(state).read.includes(l.id),
        )?.id,
    );
    return;
  }
  if (act === "learn-tab") {
    lessonTab = id;
    flashFlipped = false;
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }
  if (act === "learn-complete") {
    mutate(() => markLesson(state, lessonId));
    return;
  }
  if (act === "learn-next") {
    const all = courseLessons(state.course),
      index = all.findIndex((l) => l.id === lessonId);
    openLesson(all[index + 1]?.id);
    return;
  }
  if (act === "flash-flip") {
    flashFlipped = !flashFlipped;
    render();
    return;
  }
  if (act === "flash-next" || act === "flash-prev") {
    const l = courseLessons(state.course).find((l) => l.id === lessonId);
    flashIndex =
      (flashIndex + (act === "flash-next" ? 1 : l.cards.length - 1)) %
      l.cards.length;
    flashFlipped = false;
    render();
    return;
  }
  if (act === "flash-known" || act === "flash-review") {
    const l = courseLessons(state.course).find((l) => l.id === lessonId);
    mutate(
      () =>
        (learningState(state).cards[l.cards[flashIndex].id] =
          act === "flash-known" ? "known" : "review"),
    );
    return;
  }
  if (act === "learn-answer") {
    const l = courseLessons(state.course).find((l) => l.id === lessonId),
      q = l.checks.find((q) => q.id === el.dataset.question);
    if (!q || el.disabled) return;
    mutate(() => {
      const p = learningState(state);
      if (!(q.id in p.answers)) p.answers[q.id] = Number(id);
    });
    return;
  }
  if (act === "learn-retry") {
    const l = courseLessons(state.course).find((l) => l.id === lessonId);
    mutate(() => {
      for (const q of l.checks) delete learningState(state).answers[q.id];
    });
    return;
  }
  if (act === "daily-start") {
    mutate(() => {
      if (!state.daily.deadline && !state.daily.claimed) E.startDaily(state);
      page = "training";
      if (!state.training) E.startTraining(state);
    });
    return;
  }
  if (act === "next-question") {
    mutate(() => {
      if (state.run.status === "failed") {
        E.recordRun(state);
        state.run.showResult = true;
      } else E.nextQuestion(state);
    });
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }
  if (act === "open-room") {
    mutate(() => E.enterRoom(state, Number(id)));
    return;
  }
  if (act === "retry-run") {
    mutate(() => E.retryRun(state));
    return;
  }
  if (act === "rank-start" || act === "rank-resume") {
    await loadRanked();
    return;
  }
  if (act === "rank-refresh") {
    await fetchBoard();
    return;
  }
  if (act === "rank-answer") {
    await submitRanked(Number(id));
    return;
  }
  if (act === "rank-next") {
    await loadRanked();
    return;
  }
  if (act === "rank-back") {
    rankedSession = null;
    await fetchBoard();
    return;
  }
  if (act === "answer") {
    mutate(() => {
      const f = E.answer(state, Number(id), page === "training");
      sound(f.correct);
    });
    return;
  }
  if (act === "next-room") {
    mutate(() => {
      if (state.run.status === "failed") {
        E.recordRun(state);
        state.run.showResult = true;
      } else E.nextRoom(state);
    });
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }
  if (act === "skill" || act === "training-hint") {
    mutate(() =>
      E.useSkill(
        state,
        act === "training-hint" ? "hint" : id,
        act === "training-hint",
      ),
    );
    return;
  }
  if (act === "retreat") {
    modal(
      `<h2>Keşiften çekiliyor musun?</h2><p>Kazandığın XP ve loot kalır. Boss ödülünü almak için zindanı bitirmelisin.</p>${button("Keşfe devam et", "close-modal", "secondary")} ${button("Kampa dön", "confirm-retreat", "primary")}`,
    );
    return;
  }
  if (["confirm-retreat", "end-run", "end-equip"].includes(act)) {
    mutate(() => {
      E.leaveRun(state);
      page = act === "end-equip" ? "character" : "camp";
    });
    window.scrollTo({ top: 0, behavior: "auto" });
    $("#modal").close();
    return;
  }
  if (act === "train-start") {
    const topic = $("#train-topic").value;
    trainingFilters = {
      topic: topic === "" ? null : Number(topic),
      type: $("#train-type").value,
      difficulty: $("#train-difficulty").value,
      weak: $("#train-weak").checked,
    };
    mutate(() => E.startTraining(state, trainingFilters));
    return;
  }
  if (act === "next-training") {
    mutate(() => E.startTraining(state, trainingFilters));
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }
  if (act === "save-notes") {
    mutate(() => {
      state.notebooks[state.course] = $("#personal-notes").value;
    });
    toast("Notların kaydedildi.");
    return;
  }
});
document.addEventListener("submit", async (e) => {
  if (e.target.id === "profile-form") {
    e.preventDefault();
    const form = e.target,
      btn = form.querySelector("button"),
      msg = $("#profile-error");
    btn.disabled = true;
    try {
      const result = await accountRequest("rename", {
        displayName: form.elements.displayName.value,
      });
      userProfile.display_name = result.displayName;
      state.name = result.displayName;
      boardData = null;
      save();
      render();
      toast("Görünen adın güncellendi; puanın ve sıran korundu.");
    } catch (err) {
      msg.textContent = err.message;
      btn.disabled = false;
    }
    return;
  }
  if (e.target.id === "delete-account-form") {
    e.preventDefault();
    const form = e.target,
      btn = form.querySelector("[type=submit]"),
      msg = form.querySelector("[role=status]"),
      uid = user.id;
    btn.disabled = true;
    store.blocked = true;
    store.pending = null;
    try {
      await accountRequest("delete", {
        password: form.elements.password.value,
        confirmation: form.elements.confirmation.value,
      });
      for (const key of Object.keys(localStorage))
        if (key.startsWith("study-rift-save-" + uid))
          localStorage.removeItem(key);
      localStorage.removeItem(guestKey);
      user = null;
      userProfile = null;
      store.user = null;
      boardData = null;
      rankedSession = null;
      state = E.freshState();
      page = "camp";
      busy = false;
      sessionExpired = false;
      await cloud.auth.signOut({ scope: "local" }).catch(() => {});
      localStorage.removeItem("study-rift-auth-v1");
      $("#modal").close();
      render();
      toast("Study Rift hesabın ve sıralama sonuçların silindi.");
    } catch (err) {
      msg.textContent = err.message;
      btn.disabled = false;
      store.blocked = false;
    }
    return;
  }
  if (e.target.id === "answer-form" || e.target.id === "rank-answer-form") {
    e.preventDefault();
    const ranked = e.target.id === "rank-answer-form",
      q = ranked
        ? rankedSession.question
        : E.displayQuestion(state, page === "training"),
      value = readQuestionForm(e.target, q);
    if (q.type === "multi" && !value.length) {
      toast("En az bir seçenek işaretle.");
      return;
    }
    if (q.type === "order" && new Set(value).size !== value.length) {
      toast("Her adımı bir kez kullan.");
      return;
    }
    if (ranked) await submitRanked(value);
    else
      mutate(() => {
        const f = E.answer(state, value, page === "training");
        sound(f.correct);
      });
    return;
  }
  if (["auth-form", "claim-form", "reset-form"].includes(e.target.id)) {
    e.preventDefault();
    const f = e.target,
      submit = f.querySelector("[type=submit]"),
      msg = $("#auth-error");
    submit.disabled = true;
    msg.textContent = "Bağlantı kuruluyor…";
    try {
      if (f.id === "reset-form") {
        const { error } = await cloud.auth.updateUser({
          password: f.elements.password.value,
        });
        if (error) throw error;
        resetting = false;
        render();
        toast("Şifren güncellendi.");
        return;
      }
      const mode = f.id === "claim-form" ? "claim" : f.dataset.mode;
      if (mode === "legacy") {
        const { data, error } = await cloud.auth.signInWithPassword({
          email: f.elements.email.value.trim(),
          password: f.elements.password.value,
        });
        if (error) throw error;
        await loadUser(data.user);
        return;
      }
      const fields = {
        username: f.elements.username.value.trim(),
        ...(f.elements.password ? { password: f.elements.password.value } : {}),
        ...(f.elements.email ? { email: f.elements.email.value.trim() } : {}),
      };
      const result = await authRequest(
        mode === "signup" ? "register" : mode,
        fields,
      );
      if (mode === "recover") {
        msg.textContent = result.message;
        submit.disabled = false;
        return;
      }
      if (mode === "claim") {
        await loadUser(user);
        return;
      }
      const { data } = await cloud.auth.getUser();
      if (!data.user) throw Error("Oturum açılamadı.");
      $("#modal").close();
      await loadUser(data.user);
      toast("Sisteme hoş geldin.");
    } catch (err) {
      msg.textContent = err.message;
      submit.disabled = false;
    }
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "sound") {
    state.settings.sound = e.target.checked;
    save();
    sound();
  }
});
$("#modal").addEventListener("click", (e) => {
  if (e.target === $("#modal")) $("#modal").close();
});
window.addEventListener("online", () => store.flush());
window.addEventListener("beforeunload", () => {
  try {
    localStorage.setItem(localKey(), JSON.stringify(state));
  } catch {}
});
window.addEventListener("storage", (e) => {
  if (e.key === localKey() && e.newValue) {
    store.blocked = true;
    sync = "conflict";
    busy = true;
    renderSync();
    toast("Başka sekmede ilerleme değişti. Devam etmeden önce sayfayı yenile.");
  }
});
cloud.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    resetting = true;
    if (user) render();
  }
  if (event === "SIGNED_OUT" && user) {
    sessionExpired = true;
    store.user = null;
    store.blocked = true;
    sync = "error";
    render();
  }
});
function loadingScreen() {
  return `<div class="loading-screen"><div class="loading-sigil"><img src="./sigil.svg" alt=""></div><span class="eyebrow">STUDY RIFT</span><h2>Rift'e bağlanılıyor</h2><div class="loading-track"><span></span></div><p>Avcı kaydın ve keşiflerin hazırlanıyor…</p></div>`;
}
function authGate() {
  const signup = authMode === "signup",
    recover = authMode === "recover",
    legacy = authMode === "legacy";
  return `<div class="auth-world"><div class="auth-world-art">${portalArt("auth")}</div><div class="auth-world-copy"><a class="brand"><img src="./sigil.svg" alt=""><span>STUDY RIFT<small>KNOWLEDGE IS POWER</small></span></a><span class="eyebrow">HER DERS BAŞKA BİR DÜNYA</span><h1>Bilgiyle uyan.<br><em>Kendi yolunu çiz.</em></h1><p>Bir sınıf seç. Zindanlara gir.<br>Öğrendiklerini kalıcı güce dönüştür.</p><div class="auth-world-meta"><span>3 sınıf · ${SKILLS.length} yetenek</span><span>89 ganimet · 6 soru türü</span></div></div><section class="auth-box panel"><span class="eyebrow">AVCI KAYDI</span><h2>${signup ? "Bir avcı uyanıyor." : recover ? "Geçidi yeniden aç." : legacy ? "Eski hesabını taşı." : "Keşfine devam et."}</h2><p>${recover ? "Kurtarma e-postası eklediğin hesabın için sıfırlama bağlantısı iste." : signup ? "Kullanıcı adın ve şifren yeterli. E-posta doğrulaması yok." : "Kullanıcı adınla giriş yap. İlerlemen kaldığın yerde."}</p><form id="auth-form" data-mode="${authMode}">${legacy ? '<label>E-posta<input name="email" type="email" required autocomplete="email"></label>' : '<label>Kullanıcı adı<input name="username" required pattern="[A-Za-z0-9_]{3,24}" minlength="3" maxlength="24" autocomplete="username" placeholder="ege_avci"></label>'}${!recover ? `<label>Şifre<input name="password" type="password" minlength="8" maxlength="128" required autocomplete="${signup ? "new-password" : "current-password"}" placeholder="En az 8 karakter"></label>` : ""}${signup ? '<label>Kurtarma e-postası <small>isteğe bağlı</small><input name="email" type="email" autocomplete="email" placeholder="İstersen boş bırak"></label><p class="auth-privacy">Kurtarma adresi eklemezsen şifreni e-posta ile sıfırlayamazsın. Oynamak için adres veya doğrulama gerekmez.</p>' : ""}<div id="auth-error" role="status" class="form-message"></div><button type="submit" class="btn primary wide">${signup ? "Hesabını oluştur" : recover ? "Bağlantı gönder" : "Giriş yap"} ${icon("arrow")}</button></form><div class="auth-switch">${signup ? "Hesabın var mı?" : "İlk kez mi geliyorsun?"}${button(signup ? "Giriş yap" : "Hesap oluştur", "auth-mode", "text", `data-id="${signup ? "login" : "signup"}"`)}</div><div class="auth-links">${button("Şifremi unuttum", "auth-mode", "text", 'data-id="recover"')}${button(legacy ? "Kullanıcı adıyla giriş" : "Önceki e-posta hesabım var", "auth-mode", "text", `data-id="${legacy ? "login" : "legacy"}"`)}</div></section></div>`;
}
function claimScreen() {
  return `<div class="center-gate"><section class="panel auth-box"><span class="eyebrow">ESKİ KAYDIN KORUNDU</span><h2>Kullanıcı adını seç.</h2><p>Mevcut karakterin ve eşyaların aynı hesapta kalacak. Bundan sonra bu adla giriş yapacaksın.</p><form id="claim-form"><label>Kullanıcı adı<input name="username" required pattern="[A-Za-z0-9_]{3,24}" minlength="3" maxlength="24" autocomplete="username"></label><div id="auth-error" class="form-message" role="status"></div><button type="submit" class="btn primary wide">Adı kaydet</button></form></section></div>`;
}
function resetScreen() {
  return `<div class="center-gate"><section class="panel auth-box"><h2>Yeni şifreni belirle.</h2><form id="reset-form"><label>Yeni şifre<input name="password" required type="password" minlength="8" maxlength="128" autocomplete="new-password"></label><div id="auth-error" class="form-message" role="status"></div><button type="submit" class="btn primary wide">Şifreyi güncelle</button></form></section></div>`;
}
function classScreen() {
  return `<main class="class-selection"><a class="brand"><img src="./sigil.svg" alt=""><span>STUDY RIFT<small>THE AWAKENING</small></span></a>${button("Hesap ayarları", "account-settings", "secondary")}${heading("UYANIŞ ANI", "Nasıl bir avcı olacaksın?", "Sınıf seçimin bütün derslerde geçerli. Her sınıfta 16 kalıcı yetenek var.")}<div class="three-grid class-cards">${CLASSES.map((c) => `<article class="panel class-card" style="--class-color:${c.color}"><div class="class-emblem">${icon(c.icon)}</div><span class="eyebrow">${c.tag}</span><h2>${c.name}</h2><p>${c.desc}</p><div class="class-unique">${c.unique}</div><div class="class-starter">Başlangıç yeteneği: ${c.starter === "eliminate" ? "Eleme" : c.starter === "shield" ? "Rün Kalkanı" : "Keskin Odak"}</div>${button("Bu yolu seç " + icon("arrow"), "select-class", "primary wide", `data-id="${c.id}"`)}</article>`).join("")}</div><p class="class-note">Sınıf seçimi kalıcıdır. Önceki sürümden gelen XP ve eşyaların korunur; eski yetenek puanların yeni ağaç için geri verilir.</p></main>`;
}
function courses() {
  return lobby();
}
function abilityPanel(r, a, q) {
  const data = {
    hint: ["eye", "Sezgi", a.hintCost, "Kavramsal ipucu"],
    heal: ["heart", "Yaşam Akışı", a.healCost, "+" + a.heal + " can"],
    eliminate: ["wand", "Eleme", 25, a.eliminate + " yanlış şık kaldır"],
    shield: ["shield", "Rün Kalkanı", a.shieldCost, "Sonraki hasarı azalt"],
    focus: ["eye", "Keskin Odak", a.focusCost, "Sonraki doğru +12 XP"],
    prophecy: ["book", "Kehanet", 22, a.prophecy + " eşleştirme çiftini aç"],
    channel: ["gem", "Mana Aktarımı", 0, "−20 can · +30 mana"],
    second: ["heart", "İkinci Şans", 0, "Koşuda 1× ödülsüz düzeltme"],
    sanctuary: ["shield", "Sığınak", 25, "+20 can ve kalkan"],
    evasion: ["flame", "Kaçış Rünü", 20, "Sonraki hasarı sıfırla"],
    wager: ["coin", "Gölge Bahsi", 10, "2× XP · yanlışta +10 hasar"],
    notes: [
      "scroll",
      "Cheat Sheet",
      0,
      E.item(state.equipment.notes)?.name || "Not kuşanılmamış",
    ],
  };
  return [...E.availableAbilities(state), "notes"]
    .map((id) => {
      const [ico, name, cost, desc] = data[id],
        disabled =
          id === "second"
            ? !r.answered ||
              r.feedback?.correct ||
              r.secondUsed ||
              r.feedback?.retry
            : r.answered ||
              r.used.includes(id) ||
              (id === "notes" && !state.equipment.notes) ||
              (id === "eliminate" && q.type !== "mc") ||
              (id === "prophecy" && q.type !== "match");
      return `<button class="ability" data-action="skill" data-id="${id}" ${disabled ? "disabled" : ""}>${icon(ico)}<span><b>${name}</b><small>${desc}</small></span><em>${cost ? cost + " MP" : "ÖZEL"}</em></button>`;
    })
    .join("");
}

render();
try {
  const { data, error } = await cloud.auth.getSession();
  if (error) throw error;
  if (data.session) await loadUser(data.session.user);
  else {
    busy = false;
    if (state.run) page = "dungeons";
    render();
  }
} catch {
  busy = false;
  render();
  toast("Hesap bağlantısı kurulamadı. Giriş yaparak tekrar dene.");
}

function roomMap() {
  const r = state.run,
    d = DUNGEONS.find((d) => d.id === r.dungeon),
    a = E.attributes(state),
    cells = [
      [1, 1],
      [2, 1],
      [3, 1],
      [3, 2],
      [2, 2],
      [1, 2],
      [1, 3],
      [2, 3],
    ];
  return (
    heading(
      d.rank + "-RANK · " + E.course(state).realm,
      d.name + " · Oda haritası",
      "Her oda ayrı bir sınav: farklı soru sayıları, türler ve süreler.",
      button("Kampa çekil", "retreat", "secondary"),
    ) +
    `<div class="expedition-layout"><section class="panel map-panel"><div class="map-topline"><span>${r.index}/8 oda temizlendi</span>${pill("KEŞİF DEVAM EDİYOR", "green")}</div><div class="dungeon-rooms"><svg class="room-path" viewBox="0 0 600 420" preserveAspectRatio="none" aria-hidden="true"><path d="M100 70H500V210H100V350H300" fill="none" stroke="#483c5b" stroke-width="2" stroke-dasharray="6 7"/></svg>${E.ROOMS.map((room, i) => `<button class="room-node ${i < r.index ? "cleared" : i === r.index ? "unsealed" : "sealed"} ${room.kind === "BOSS" ? "boss-node" : ""}" style="grid-column:${cells[i][0]};grid-row:${cells[i][1]}" data-action="open-room" data-id="${i}" ${i !== r.index ? "disabled" : ""}><span class="room-number">${String(i + 1).padStart(2, "0")}</span><span class="room-symbol">${icon(i < r.index ? "check" : i > r.index ? "lock" : room.icon)}</span><strong>${room.name}</strong><small>${i < r.index ? "TEMİZLENDİ" : room.kind}</small><span class="room-exam-meta">${r.rooms[i].queue.length} soru · ${r.rooms[i].seconds ? formatDuration(r.rooms[i].seconds) : "Süresiz"}</span></button>`).join("")}</div><div class="map-legend"><span>◈ Açık oda</span><span>✓ Temizlenmiş</span><span>${icon("lock")} Mühürlü</span></div></section><aside class="panel expedition-brief"><span class="eyebrow">SIRADAKİ ODA</span><h2>${E.ROOMS[r.index].name}</h2><p>${esc(E.ROOMS[r.index].desc)}</p><div class="room-format-tags">${[...new Set(r.rooms[r.index].queue.map((id) => QUESTIONS.find((q) => q.id === id).type))].map((t) => pill(QUESTION_TYPES[t], "dim")).join("")}</div><p class="muted">${r.rooms[r.index].queue.length} soru · ${r.rooms[r.index].seconds ? formatDuration(r.rooms[r.index].seconds) + " süre. Sayaç odaya girince başlar." : "Süre sınırı yok."}</p><div class="bar-label"><span>CAN</span><strong>${r.hp}/${a.hp}</strong></div>${progress(r.hp, a.hp, "hp")}<div class="bar-label"><span>MANA</span><strong>${r.mp}/${a.mp}</strong></div>${progress(r.mp, a.mp, "mp")}${button("Odaya gir " + icon("arrow"), "open-room", "primary wide", `data-id="${r.index}"`)}<p class="map-death-rule">${icon("shield")} Ölürsen bu zorluğa 1. odadan dönersin. Ölümden dönüş ve İkinci Şans, kendi kullanım sınırlarıyla istisna sağlar.</p></aside></div>`
  );
}
async function fetchBoard() {
  if (!user) return;
  boardLoading = true;
  boardError = "";
  const c = state.course;
  try {
    const data = await masteryRequest("board", { course: c });
    if (state.course === c) boardData = data;
  } catch (e) {
    boardError = e.message;
  } finally {
    boardLoading = false;
    if (page === "leaderboard") render();
  }
}
async function loadRanked() {
  if (quizBusy) return;
  quizBusy = true;
  boardError = "";
  render();
  try {
    const data = await masteryRequest("resume", { course: state.course });
    clockOffset =
      Date.parse(data.serverNow || new Date().toISOString()) - Date.now();
    rankedSession = { ...data, phase: data.question ? "question" : "results" };
  } catch (e) {
    boardError = e.message;
    toast(e.message);
  } finally {
    quizBusy = false;
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}
async function submitRanked(value) {
  if (quizBusy || !rankedSession?.question || rankedSession.feedback) return;
  const old = rankedSession,
    c = old.attempt.course;
  const form = $("#rank-answer-form");
  if (form) old.draft = value;
  quizBusy = true;
  render();
  try {
    const data = await masteryRequest("answer", {
      course: c,
      attemptId: old.attempt.id,
      cursor: old.attempt.cursor,
      questionId: old.question.id,
      value,
    });
    clockOffset =
      Date.parse(data.serverNow || new Date().toISOString()) - Date.now();
    rankedSession = { ...data, phase: "feedback" };
    sound(data.feedback.correct);
  } catch (e) {
    toast(e.message);
    if (e.code === "cursor_changed") {
      try {
        const data = await masteryRequest("resume", { course: c });
        rankedSession = {
          ...data,
          phase: data.question ? "question" : "results",
        };
      } catch (resumeError) {
        toast(resumeError.message);
      }
    }
  } finally {
    quizBusy = false;
    render();
  }
}
function leaderboard() {
  if (rankedSession) return masteryExam();
  const own = boardData?.own,
    rows = boardData?.entries || [];
  return (
    heading(
      "XP’DEN BAĞIMSIZ · SUNUCUDA PUANLANIR",
      "Ustalık tablosu",
      E.course(state).name + " · " + (boardData?.date || E.today()),
      button(
        icon("chart") + " Yenile",
        "rank-refresh",
        "secondary",
        boardLoading ? "disabled" : "",
      ),
    ) +
    `<div class="mastery-hero panel"><div><span class="eyebrow">AYNI SET. AYNI KURALLAR.</span><h2>Gücünü değil,<br><em>bilgini yarıştır.</em></h2><p>Bugünün 10 sorusu herkes için aynı. Sınıf, ekipman, XP ve hız bonusu yok. Her zorluktan iki soru; en fazla 200 puan.</p><div class="mastery-tags"><span>${icon("shield")} Yetenekler kapalı</span><span>${icon("book")} 10 dakika · tek hak</span><span>${icon("check")} Eşit skora eşit sıra</span></div></div><div class="mastery-ticket"><span>GÜNLÜK USTALIK</span><strong>${own?.completed ? own.score + "/200" : own ? own.cursor + "/10" : "10 soru"}</strong><p>${own?.completed ? own.correct + " doğru · sınav tamamlandı" : own ? "Kaldığın yerden devam et; sayaç durmaz." : "10 dakika. Sayaç ilk girişte başlar."}</p>${button(own?.completed ? "Sonucumu incele" : own ? "Sınava devam et" : "Bugünün sınavına gir", "rank-start", "primary wide", quizBusy || boardLoading ? "disabled" : "")}</div></div>${boardError ? `<div class="notice"><p>${esc(boardError)}</p></div>` : ""}<div class="panel leaderboard-panel"><div class="section-top"><h2>Bugünün sıralaması</h2><span>En fazla 100 avcı · Türkiye saati</span></div>${boardLoading && !boardData ? '<div class="empty">Sıralama yükleniyor…</div>' : rows.length ? `<div class="table-wrap"><table class="mastery-table"><thead><tr><th>SIRA</th><th>AVCI</th><th>USTALIK PUANI</th><th>DOĞRU</th></tr></thead><tbody>${rows.map((row) => `<tr class="${row.isMe ? "my-rank" : ""}"><td><span class="rank-medal">${row.rank <= 3 ? "♜" : "#"} ${row.rank}</span></td><td>${esc(row.displayName || "Adsız avcı")} ${row.isMe ? pill("SEN", "green") : ""}</td><td><strong>${row.score}</strong> <small>/200</small></td><td>${row.correct}/10</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">${icon("chart")}<h3>Bugünün ilk sonucu henüz yok.</h3><p>Sınavı bitiren avcılar burada görünür. Örnek veya sahte oyuncu gösterilmez.</p></div>`}</div><div class="notice">${icon("shield")}<p>Her gün Türkiye saatiyle 00.00’da yeni sınav açılır. Zorluk 1–5 için doğru cevap puanları sırasıyla 10, 15, 20, 25, 30’dur. Çoklu seçim ve sıralamada tam doğruluk gerekir. Sıralama puanı oyun XP’sine eklenmez. 10 dakikalık süre sunucuda kontrol edilir; süre dolunca kalan sorular boş sayılır, kazanılan puan korunur.</p></div>`
  );
}
function masteryExam() {
  const rs = rankedSession,
    a = rs.attempt;
  if (rs.phase === "results") {
    return (
      heading(
        "GÜNLÜK USTALIK TAMAMLANDI",
        "Bilginin sonucu",
        E.course(state).name,
        button("Sıralamaya dön", "rank-back", "secondary"),
      ) +
      `<div class="mastery-result panel"><div class="result-emblem victory">${icon("chart")}</div><h1>${a.score}<small> / 200</small></h1><p>${a.correct} doğru · ${a.total - a.correct} yanlış / boş · ${a.date}</p>${a.expired ? '<p class="wrong-text">Süre doldu. Yanıtlanmayan sorular boş sayıldı.</p>' : ""}<div class="mastery-tags"><span>Sınıf bonusu: 0</span><span>XP bonusu: 0</span><span>Hız bonusu: 0</span></div></div><h2 class="review-heading">Soruların incelemesi</h2><div class="wrong-list">${(rs.review || []).map((q, i) => `<details class="panel"><summary><span>${pill(QUESTION_TYPES[q.type])}<strong>${i + 1}. ${esc(q.prompt)}</strong></span><span class="${q.result.correct ? "correct-text" : "wrong-text"}">${q.result.correct ? "✓" : "×"} +${q.result.points}</span></summary><p class="correct-text">Doğru yanıt: ${esc(answerLabel(q))}</p><p>${esc(q.explanation)}</p></details>`).join("")}</div>`
    );
  }
  const ctx = {
      answered: !!rs.feedback,
      feedback: rs.feedback,
      draft: rs.draft,
      hint: false,
    },
    n = rs.feedback ? a.cursor : a.cursor + 1;
  return (
    heading(
      "SABİT KOŞULLAR · GÜNLÜK TEK DENEME",
      "Günlük Ustalık",
      `Soru ${n}/10 · Herkesle aynı soru seti`,
      button("Tabloya dön · süre devam eder", "rank-back", "secondary"),
    ) +
    `<div class="mastery-exam-bar panel"><span>${icon("book")} ${n}/10</span>${progress(a.cursor, 10, "xp")}<strong>${a.score}/200 PUAN</strong>${a.deadline ? countdown(Date.parse(a.deadline), true) : ""}</div><div class="mastery-disabled">${icon("shield")} Bu modda ekipman, yetenek, ipucu, can ve mana kullanılmaz. Süren 10 dakika; sayfayı kapatsan da devam eder.</div>${quizBusy ? '<div class="server-check" role="status">Yanıt sunucuda kontrol ediliyor…</div>' : ""}${questionView(rs.question, ctx, false, true)}`
  );
}
function patches() {
  return (
    heading(
      "SÜRÜM GEÇMİŞİ",
      "Yama notları",
      "Üç parça: ana sürüm · özellik sürümü · düzeltme. Her parça bağımsız tam sayıdır.",
      pill("v" + VERSION, "purple"),
    ) +
    `<div class="notice semver-note">${icon("scroll")}<p><strong>0.3.9 → 0.3.10</strong> geçerlidir. 10’a gelince üst sürüme taşma olmaz. <strong>1.20.0</strong> da geçerli bir sürümdür.</p></div><div class="release-timeline">${[
      ...RELEASES,
    ]
      .sort((a, b) => compareVersions(b.version, a.version))
      .map(
        (r, i) =>
          `<article class="release panel"><header><div><span class="release-version">v${r.version}</span>${i === 0 ? pill("GÜNCEL", "green") : ""}</div><time datetime="${r.date}">${new Date(r.date + "T12:00:00+03:00").toLocaleDateString("tr-TR")}</time></header><h2>${r.title}</h2>${r.groups.map((g) => `<section><h3>${g.title}</h3><ul>${g.items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></section>`).join("")}</article>`,
      )
      .join("")}</div>`
  );
}

function formatDuration(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
function countdown(deadline, server = false) {
  const sec = Math.max(
    0,
    Math.ceil((deadline - Date.now() - (server ? clockOffset : 0)) / 1000),
  );
  return `<div class="exam-clock ${sec <= 30 ? "urgent" : ""}"><span>KALAN SÜRE</span><time role="timer" aria-label="Kalan süre" data-countdown="${deadline}" ${server ? "data-server-clock" : ""}>${formatDuration(sec)}</time></div>`;
}
function dailyQuestView() {
  const daily = state.daily;
  return `<section class="daily-card panel"><div class="section-top"><span class="activity-kicker">GÜNLÜK GÖREV</span>${icon("flame")}</div><h3>5 dakikada 5 doğru</h3><p>Antrenmanda 5 farklı soruyu doğru çöz. Ödül günde bir kez; süre biterse yeniden deneyebilirsin.</p>${daily.deadline ? countdown(daily.deadline) : ""}<div class="bar-label"><span>${Math.min(5, daily.ids.length)} / 5 tamamlandı</span><span>+35 ${icon("coin")}</span></div>${progress(daily.ids.length, 5, "gold")}<div class="daily-reward">${icon(daily.claimed ? "check" : "potion")} ${daily.claimed ? "Ödül çantana eklendi" : daily.failed ? "Süre doldu · yeniden deneyebilirsin" : "Bonus: 1 Can İksiri"}</div>${button(daily.claimed ? "Bugün tamamlandı" : daily.deadline ? "Antrenmana devam et" : daily.failed ? "Görevi yeniden başlat" : "5 dakikalık görevi başlat", "daily-start", "secondary wide", daily.claimed ? "disabled" : "")}</section>`;
}
function roomReport() {
  const r = state.run,
    room = r.rooms[r.index],
    last = r.index === r.rooms.length - 1;
  return (
    heading(
      "ODA SINAVI TAMAMLANDI",
      room.name,
      "Cevapların kaydedildi. Bir sonraki adıma hazır olduğunda devam et.",
    ) +
    `<section class="panel room-report"><div class="result-emblem victory">${icon("check")}</div><span class="eyebrow">${r.index + 1}. ODA · MÜHÜR KIRILDI</span><h2>${room.correct} / ${room.queue.length} doğru</h2><p>${room.queue.length - room.correct} yanlış · ${r.hp} can · ${r.mp} mana kaldı</p><p class="muted">${room.seconds ? "Süre durdu. Bu raporu incelemek için acele etmene gerek yok." : "Bu oda süresizdi."}</p>${button(last ? "Zindanı tamamla ve ganimeti al " + icon("chest") : "Haritaya dön · sıradaki oda " + icon("arrow"), "next-room", "primary")}<small>Keşif toplamı: ${r.correct}/${r.queue.length} doğru · +${r.earnedXP} XP</small></section>`
  );
}
function deleteAccountModal() {
  modal(
    `<div class="auth-heading"><div class="activity-icon red">${icon("shield")}</div><h2>Study Rift hesabını sil?</h2></div><p>Karakterin, eşyaların, notların, öğrenme ilerlemen ve tüm Ustalık sonuçların kalıcı silinir. Sıralamadaki kaydın kaldırılır. Bu işlem geri alınamaz.</p><p class="muted">Bu işlem Study Rift içindir; diğer uygulamalardaki verilerine dokunulmaz.</p><form id="delete-account-form"><label>Mevcut şifren<input name="password" required type="password" maxlength="128" autocomplete="current-password"></label><label>Onaylamak için SİL yaz<input name="confirmation" required pattern="SİL" autocomplete="off" placeholder="SİL"></label><p role="status" class="form-message"></p><div class="section-actions">${button("Vazgeç", "close-modal", "secondary")}<button class="btn danger" type="submit">Hesabımı kalıcı sil</button></div></form>`,
  );
}
function openLesson(id) {
  const all = courseLessons(state.course);
  if (!all.some((l) => l.id === id)) {
    lessonId = null;
    render();
    return;
  }
  lessonId = id;
  lessonTab = "read";
  flashIndex = 0;
  flashFlipped = false;
  learningState(state).lastLesson = id;
  save();
  page = "learning";
  render();
  window.scrollTo({ top: 0, behavior: "auto" });
}
function learning() {
  const units = courseUnits(state.course),
    all = courseLessons(state.course),
    p = learningState(state);
  if (!all.length)
    return (
      heading(
        "ÖĞRENME YOLU",
        E.course(state).name,
        "Bu dersin üniteleri kaynaklar eklendiğinde açılacak.",
      ) +
      `<div class="panel empty">${icon("book")}<h2>Bu dünyanın anlatımları hazırlanıyor.</h2><p>Her dersin üniteleri, kartları ve ilerlemesi ayrı tutulur.</p></div>`
    );
  const current = all.find((l) => l.id === lessonId),
    next = all.find((l) => !p.read.includes(l.id));
  if (!current)
    return (
      heading(
        E.course(state).short + " · ADIM ADIM ÖĞREN",
        "Öğrenme yolu",
        "Ünite → alt bölüm → anlatım. Ardından istersen flash kartlara ve küçük kontrollere geç.",
        button(
          "Kaldığın yerden devam et " + icon("arrow"),
          "learn-resume",
          "primary",
        ),
      ) +
      `<section class="panel learning-summary"><div><span class="eyebrow">KALICI ÖĞRENME İLERLEMEN</span><h2>${p.read.length} / ${all.length} bölüm tamamlandı</h2><p>${Object.values(p.cards).filter((v) => v === "known").length} kartı biliyorsun · ${Object.values(p.cards).filter((v) => v === "review").length} kart tekrar bekliyor</p></div>${progress(p.read.length, all.length, "xp")}</section><div class="learning-path">${units
        .map((unit, i) => {
          const count = unit.lessons.filter((l) =>
            p.read.includes(l.id),
          ).length;
          return `<section class="panel learning-unit"><div class="unit-number ${count === unit.lessons.length ? "complete" : ""}">${count === unit.lessons.length ? icon("check") : String(i + 1).padStart(2, "0")}</div><div class="unit-title"><span class="eyebrow">ÜNİTE ${i + 1} · ${count}/${unit.lessons.length} BÖLÜM</span><h2>${unit.title}</h2><p>${unit.desc}</p></div><div class="unit-lessons">${unit.lessons.map((l, j) => `<button data-action="learn-open" data-id="${l.id}" class="lesson-link ${p.read.includes(l.id) ? "read" : next?.id === l.id ? "recommended" : ""}"><span class="lesson-status">${p.read.includes(l.id) ? icon("check") : String(i + 1) + "." + (j + 1)}</span><span><strong>${l.title}</strong><small>${p.read.includes(l.id) ? "TAMAMLANDI" : next?.id === l.id ? "SIRADAKİ ADIM" : "KONU ANLATIMI"} · ${l.cards.length} kart · ${l.checks.length} kontrol</small></span>${icon("arrow")}</button>`).join("")}</div></section>`;
        })
        .join(
          "",
        )}</div><div class="notice">${icon("book")}<p>İstediğin bölüme dönebilirsin. Tamamlama ve kart seçimleri hesabına kaydedilir. Bu yolun kontrol soruları XP veya sıralama puanı vermez. İçerikler özgün anlatımlardır; kaynak slaytlar henüz eklenmedi.</p></div>`
    );
  const unit = units.find((u) => u.lessons.some((l) => l.id === current.id)),
    unitIndex = units.indexOf(unit),
    idx = unit.lessons.indexOf(current),
    done = p.read.includes(current.id);
  return (
    heading(
      `ÜNİTE ${unitIndex + 1} · BÖLÜM ${unitIndex + 1}.${idx + 1}`,
      current.title,
      current.summary,
      button("Bütün üniteler", "learn-overview", "secondary"),
    ) +
    `<nav class="lesson-siblings" aria-label="Ünitenin alt bölümleri">${unit.lessons.map((l, i) => button((p.read.includes(l.id) ? "✓ " : "") + (unitIndex + 1) + "." + (i + 1) + " " + l.title, "learn-open", l.id === current.id ? "selected" : "", `data-id="${l.id}"`)).join("")}</nav><div class="lesson-tabs" role="tablist" aria-label="Bölüm çalışma biçimi">${[
      ["read", "book", "Konu anlatımı"],
      ["cards", "scroll", "Flash kartlar"],
      ["quiz", "check", "Kısa kontrol"],
    ]
      .map(
        ([id, ico, name]) =>
          `<button role="tab" aria-selected="${lessonTab === id}" class="${lessonTab === id ? "selected" : ""}" data-action="learn-tab" data-id="${id}">${icon(ico)} ${name}</button>`,
      )
      .join(
        "",
      )}</div><div class="lesson-reader">${lessonTab === "read" ? `<article class="panel lesson-article"><div class="reader-intro"><span class="eyebrow">ÖNCE KONUYU ANLA</span><p>Üç adımda bu bölümü çalış. Hazır olduğunda kartlara veya kontrollere sen geç.</p></div>${current.sections.map((section, i) => `<section class="lesson-section"><span class="section-step">${i + 1}</span><div><h2>${section.title}</h2><p>${esc(section.text)}</p>${section.example ? `<div class="lesson-example"><span>ÖRNEK</span><p>${esc(section.example)}</p></div>` : ""}</div></section>`).join("")}<div class="reader-bottom"><h3>Bu bölüm burada bitiyor.</h3><p>Aklındaki ayrımları netleştir; ardından kartlarla hatırlamayı dene veya küçük kontrole geç.</p><div class="section-actions">${button("Flash kartlarla tekrar et", "learn-tab", "secondary", 'data-id="cards"')}${button("Hazırım · kontrol soruları", "learn-tab", "secondary", 'data-id="quiz"')}</div></div></article>` : lessonTab === "cards" ? flashCards(current, p) : lessonChecks(current, p)}<aside class="panel lesson-checkpoint"><span class="eyebrow">YOLUNDAKİ DURUM</span><h3>${done ? "Bu bölüm tamamlandı." : "Bölüm henüz tamamlanmadı."}</h3><p>Tamamlamak için kontrol sorularını çözmek zorunda değilsin. Okuduklarını anladığında bu adımı işaretle.</p>${button(done ? "✓ Tamamlandı" : "Bu bölümü tamamla", "learn-complete", "primary", done ? "disabled" : "")}${all.indexOf(current) < all.length - 1 ? button("Sonraki alt bölüm " + icon("arrow"), "learn-next", "secondary") : button("Ünitelere dön", "learn-overview", "secondary")}<small>${unitIndex + 1}.${idx + 1} · ${E.course(state).short} · Özgün konu anlatımı</small></aside></div>`
  );
}
function flashCards(l, p) {
  const card = l.cards[flashIndex],
    status = p.cards[card.id];
  return `<section class="panel flash-study"><div class="section-top"><span class="eyebrow">AKTİF HATIRLAMA</span><span>${flashIndex + 1}/${l.cards.length} kart</span></div><button class="flashcard ${flashFlipped ? "flipped" : ""}" data-action="flash-flip" aria-expanded="${flashFlipped}"><span>${flashFlipped ? "YANIT" : "KENDİNE SOR"}</span><strong>${esc(flashFlipped ? card.back : card.front)}</strong><small>${flashFlipped ? "Ön yüze dönmek için dokun" : "Yanıtı görmeden önce hatırlamayı dene · çevirmek için dokun"}</small></button><p class="flash-status">${status === "known" ? "✓ Biliyorum olarak kaydedildi" : status === "review" ? "↻ Tekrar listene eklendi" : "Bu kartı henüz işaretlemedin."}</p><div class="flash-controls">${button("Önceki", "flash-prev", "secondary")}${button("Tekrar etmem lazım", "flash-review", "secondary")}${button("Biliyorum", "flash-known", "primary")}${button("Sonraki", "flash-next", "secondary")}</div></section>`;
}
function lessonChecks(l, p) {
  return `<section class="panel lesson-quiz"><span class="eyebrow">KÜÇÜK KONTROL · PUAN BASKISI YOK</span><h2>İki kısa ayrım.</h2><p>Yalnız bu alt bölümün kapsamı. Yanlışın olursa açıklamayı okuyup anlatıma dön.</p>${l.checks
    .map((q, i) => {
      const value = p.answers[q.id],
        answered = Number.isInteger(value),
        ok = value === q.answer;
      return `<article><h3>${i + 1}. ${esc(q.prompt)}</h3><div class="answers">${q.options.map((option, j) => `<button class="answer ${answered ? (j === q.answer ? "correct" : value === j ? "wrong" : "") : ""}" data-action="learn-answer" data-question="${q.id}" data-id="${j}" ${answered ? "disabled" : ""}><span class="answer-letter">${String.fromCharCode(65 + j)}</span>${esc(option)}</button>`).join("")}</div>${answered ? `<div class="feedback ${ok ? "success" : "danger"}"><strong>${ok ? "Doğru." : "Bir daha düşünelim."}</strong><p>${esc(q.explanation)}</p></div>` : ""}</article>`;
    })
    .join(
      "",
    )}${button("Kontrolleri yeniden çöz", "learn-retry", "secondary")}</section>`;
}
function tickTimers() {
  if (!user || busy || sessionExpired) return;
  const expired = E.expireRun(state),
    daily = E.expireDaily(state);
  if (expired || daily) {
    save();
    render();
    if (expired)
      toast("Odanın süresi doldu. Aynı zorluğa ilk odadan dönebilirsin.");
  }
  for (const n of document.querySelectorAll("[data-countdown]")) {
    const seconds = Math.max(
      0,
      Math.ceil(
        (Number(n.dataset.countdown) -
          Date.now() -
          (n.hasAttribute("data-server-clock") ? clockOffset : 0)) /
          1000,
      ),
    );
    n.textContent = formatDuration(seconds);
    n.parentElement.classList.toggle("urgent", seconds <= 30);
  }
  const a = rankedSession?.attempt;
  if (
    page === "leaderboard" &&
    a &&
    !a.completed &&
    a.deadline &&
    Date.now() + clockOffset >= Date.parse(a.deadline) &&
    expiryRefreshAttempt !== a.id &&
    !quizBusy
  ) {
    expiryRefreshAttempt = a.id;
    loadRanked();
  }
}
setInterval(tickTimers, 500);

function trainingQuestBanner() {
  const d = state.daily;
  if (d.deadline)
    return `<section class="panel training-quest-banner"><div><span class="eyebrow">GÜNLÜK ANTRENMAN GÖREVİ</span><h3>${d.ids.length} / 5 farklı doğru</h3><p>5 dakika içinde tamamla. Süre sayfa dışında da devam eder.</p></div>${countdown(d.deadline)}</section>`;
  if (d.failed)
    return `<section class="panel training-quest-banner"><div><h3>Görevin süresi doldu.</h3><p>Öğrenmeye devam edebilir veya 5 dakikalık görevi yeniden başlatabilirsin.</p></div>${button("Görevi yeniden başlat", "daily-start", "secondary")}</section>`;
  if (d.claimed)
    return `<div class="notice">${icon("check")}<p>Bugünün görevi tamamlandı. 35 altın ve Can İksiri çantana eklendi.</p></div>`;
  return "";
}

document.addEventListener("input", (e) => {
  if (e.target.id === "market-search") {
    marketSearch = e.target.value;
    const grid = $("#market-products");
    if (grid) grid.innerHTML = marketProductGrid();
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "market-sort") {
    marketSort = e.target.value;
    render();
  }
  if (e.target.id === "market-affordable") {
    marketAffordable = e.target.checked;
    render();
  }
});

function navCollapsed(id) {
  return (
    navOverrides[id] ??
    state.settings.navGroups?.[id] ??
    (page === "lobby" && id === "study")
  );
}
function sidebarGroups() {
  return NAV_GROUPS.map((group) => {
    const closed = navCollapsed(group.id);
    return `<section class="nav-group"><button class="nav-group-heading" data-action="nav-folder" data-id="${group.id}" aria-expanded="${!closed}" aria-controls="nav-${group.id}" aria-label="${group.label} menüsü"><i class="group-emoji" aria-hidden="true">${group.emoji}</i><span>${group.id === "study" ? E.course(state).short : group.label}</span><b>${closed ? "›" : "⌄"}</b></button><div id="nav-${group.id}" ${closed ? "hidden" : ""}>${group.items.map(([id, emoji, label]) => `<button class="nav-item ${page === id ? "active" : ""}" data-page="${id}" aria-label="${label}"><i class="nav-emoji" aria-hidden="true">${emoji}</i><span>${label}</span>${id === "skills" && E.points(state) ? `<b>${E.points(state)}</b>` : ""}</button>`).join("")}</div></section>`;
  }).join("");
}
function lobby() {
  const c = getCourse(lobbyFocus),
    read = state.learning?.[c.id]?.read?.length || 0,
    lessonCount = courseLessons(c.id).length,
    questionCount = QUESTIONS.filter((q) => q.course === c.id).length,
    run = state.run;
  return (
    heading(
      "DÜNYALAR ARASI GEÇİT",
      "Ana lobi",
      "Her dersin kendi dünyası, öğrenme yolu ve keşifleri var.",
      pill(
        COURSES.filter((c) => !c.locked).length +
          " AÇIK · " +
          COURSES.length +
          " DÜNYA",
        "green",
      ),
    ) +
    `<section class="lobby-hero panel" style="--world-accent:${c.color}"><div class="lobby-scene">${realmArt(c.id, "lobby-hero")}</div><div class="lobby-hero-shade"></div><div class="lobby-hero-copy"><div class="lobby-world-status">${pill(c.locked ? "🔒 İÇERİK BEKLİYOR" : "✦ KEŞFE AÇIK", c.locked ? "dim" : "green")}<span>${c.atmosphere}</span></div><span class="eyebrow">${c.realm}</span><h2><span>${c.emoji}</span> ${c.short}</h2><p>${c.name}<br>${c.desc}</p><div class="lobby-topics">${c.topics
      .slice(0, 4)
      .map((t) => `<span>${t}</span>`)
      .join(
        "",
      )}</div><div class="lobby-hero-actions">${button(c.locked ? "Slaytlar eklenince açılacak" : "Dersin karargâhına gir " + icon("arrow"), "select-course", "primary", `data-id="${c.id}" ${c.locked ? "disabled" : ""}`)}${button("🛒 Markete uğra", "go-market", "secondary")}</div><small>${c.locked ? "Bu dünyanın kapısı henüz kapalı. Temasını ve konu haritasını önizliyorsun." : `${questionCount} soru · ${read}/${lessonCount} bölüm tamamlandı · Karakterin bütün dünyalarda seninle.`}</small></div><span class="lobby-realm-stamp">${String(COURSES.indexOf(c) + 1).padStart(2, "0")}<small>DÜNYA</small></span></section>${run ? `<section class="panel lobby-active-run"><div class="activity-icon purple">${icon("portal")}</div><div><span class="eyebrow">DEVAM EDEN KEŞFİN</span><h3>${getCourse(run.course).short} · ${DUNGEONS.find((d) => d.id === run.dungeon)?.name}</h3><p>Oda ${run.index + 1}/8 · ${run.hp} can · ${run.mp} mana. ${run.status === "active" ? "Keşfin kaldığın yerde." : "Keşif sonucunu inceleyebilirsin."}</p></div>${run.rooms?.[run.index]?.deadline ? countdown(run.rooms[run.index].deadline) : ""}${button("Keşfe dön " + icon("arrow"), "go-dungeons", "secondary")}</section>` : ""}<div class="section-top worlds-heading"><div><h2>Ders dünyaları</h2><p>Bir dünya seç. Açık derse gir veya sıradaki dünyanın temasını önizle.</p></div><span>📍 Aktif ders: ${E.course(state).short}</span></div><div class="world-grid">${COURSES.map((world, i) => `<button class="world-card ${world.id === c.id ? "selected" : ""}" style="--world-accent:${world.color}" data-action="preview-course" data-id="${world.id}" aria-label="${world.short} dünyasını önizle" aria-pressed="${world.id === c.id}"><div class="world-card-art">${realmArt(world.id, "world-card-" + world.id)}<span class="world-index">0${i + 1}</span><span class="world-lock">${world.locked ? "🔒" : "🟢"}</span></div><div class="world-card-copy"><span>${world.emoji} ${world.realm}</span><h3>${world.short}</h3><p>${world.locked ? "Kaynakları bekliyor" : QUESTIONS.filter((q) => q.course === world.id).length + " soru · çalışmaya hazır"}</p><div><small>${world.id === c.id ? "SEÇİLİ DÜNYA" : "DÜNYAYI İNCELE"}</small>${icon("arrow")}</div></div></button>`).join("")}</div><div class="notice">${icon("book")}<p>Sınıfın, ekipmanın ve altının ortak; her dersin soruları, notları ve öğrenme ilerlemesi ayrı. Kilitli dersler kendi içerikleri hazır olduğunda açılacak.</p></div>`
  );
}
function bonusText(bonus) {
  return (
    Object.entries(bonus)
      .map(([key, value]) => "+" + value + " " + statLabels[key])
      .join(" · ") || "Geliştirme yok"
  );
}
function purchaseError(offer, quantity = 1) {
  try {
    E.marketQuote(state, offer.id, quantity);
    return "";
  } catch (e) {
    return e.message;
  }
}
function market() {
  const stock = E.marketOffers(state).filter((o) => o.kind === "gear");
  return (
    heading(
      "GEZGİN PAZARI · " + E.course(state).short,
      "Market",
      "Keşif hazırlığı, günlük ekipman tezgâhı ve geliştirme ocağı.",
      button("🌌 Ana lobi", "go-lobby", "secondary"),
    ) +
    `<section class="panel market-banner"><div class="market-scene">${realmArt("market", "market-hero")}</div><div class="market-banner-copy"><span class="eyebrow">BİLGİYLE KAZAN, HAZIRLANARAK İLERLE</span><h2>Bir sonraki keşfine hazırlan.</h2><p>${stock.length} ekipman bugün tezgâhta. Günlük stok ve paketler Türkiye saatiyle 00.00'da yenilenir.</p><small>Altın: doğru cevaplar ve görevler · Öz: eşya parçalama</small></div><div class="market-wallet"><div><span>🪙 ALTIN</span><strong>${state.gold.toLocaleString("tr-TR")}</strong></div><div><span>💠 ÖZ</span><strong>${state.essence.toLocaleString("tr-TR")}</strong></div></div></section>${state.run ? `<div class="notice">${icon("lock")}<p>Keşfin devam ediyor. Marketi gezebilirsin; alışveriş, geliştirme ve parçalama için keşfi bitir veya kampa çekil.</p>${button("Keşfe dön", "go-dungeons", "secondary")}</div>` : ""}<nav class="market-tabs" aria-label="Market bölümleri">${[
      ["shop", "🏪", "Tezgâh"],
      ["bundles", "🎒", "Paketler"],
      ["forge", "⚒️", "Geliştirme ocağı"],
    ]
      .map(
        ([id, emoji, label]) =>
          `<button class="${marketTab === id ? "selected" : ""}" data-action="market-tab" data-id="${id}" aria-pressed="${marketTab === id}">${emoji} ${label}</button>`,
      )
      .join("")}</nav>${
      marketTab === "forge"
        ? forgeMarket()
        : `<section class="market-toolbar"><label class="market-search-label"><span>ÜRÜN ARA</span><input id="market-search" type="search" value="${esc(marketSearch)}" placeholder="Ekipman veya etki ara…" autocomplete="off"></label><label><span>SIRALA</span><select id="market-sort"><option value="level" ${marketSort === "level" ? "selected" : ""}>Seviye</option><option value="price" ${marketSort === "price" ? "selected" : ""}>Fiyat · artan</option><option value="name" ${marketSort === "name" ? "selected" : ""}>İsim</option></select></label><label class="market-budget"><input id="market-affordable" type="checkbox" ${marketAffordable ? "checked" : ""}> Alabileceklerim</label></section>${
            marketTab === "shop"
              ? `<div class="market-filters">${Object.entries(marketSlots)
                  .map(
                    ([id, [emoji, name]]) =>
                      `<button class="${marketFilter === id ? "selected" : ""}" data-action="market-filter" data-id="${id}">${emoji} ${name}</button>`,
                  )
                  .join("")}</div>`
              : `<div class="market-section-intro"><h2>Birlikte daha hesaplı.</h2><p>Her paket bu dersin marketinden günde bir kez alınabilir. İçindeki iksirler normal oda kullanım sınırlarına tabidir.</p></div>`
          }<div id="market-products">${marketProductGrid()}</div>`
    }`
  );
}
function marketProductGrid() {
  let offers = E.marketOffers(state).filter((o) =>
    marketTab === "bundles" ? o.kind === "bundle" : o.kind !== "bundle",
  );
  const needle = marketSearch.trim().toLocaleLowerCase("tr");
  offers = offers.filter((o) => {
    const i = E.item(o.itemId);
    return (
      (marketTab === "bundles" ||
        marketFilter === "all" ||
        i?.slot === marketFilter) &&
      (!needle ||
        [o.name, o.desc, i?.effect || ""]
          .join(" ")
          .toLocaleLowerCase("tr")
          .includes(needle)) &&
      (!marketAffordable || !purchaseError(o, marketQuantities[o.id] || 1))
    );
  });
  offers.sort((a, b) =>
    marketSort === "name"
      ? a.name.localeCompare(b.name, "tr")
      : marketSort === "price"
        ? a.price - b.price
        : a.level - b.level || a.price - b.price,
  );
  return offers.length
    ? `<div class="market-product-count">${offers.length} ürün · ${marketTab === "bundles" ? "Günlük avantajlar" : "Sabit iksir fiyatları, günlük ekipman seçkisi"}</div><div class="market-grid">${offers.map(marketCard).join("")}</div>`
    : `<div class="panel empty market-empty">🧺<h3>Bu filtrede ürün yok.</h3><p>Aramayı veya kategoriyi değiştir. Alabileceklerin filtresi seviyeni, altınını ve günlük stok hakkını kontrol eder.</p></div>`;
}
function marketCard(offer) {
  const i = E.item(offer.itemId),
    quantity = offer.kind === "potion" ? marketQuantities[offer.id] || 1 : 1,
    error = purchaseError(offer, quantity),
    bought = E.marketBought(state, offer.id),
    owned = offer.kind === "gear" && state.inventory[offer.id],
    rarity = i?.rarity || "rare";
  return `<article class="panel market-card" style="--rarity:${RARITIES[rarity].color}"><div class="market-item-art ${offer.kind === "potion" ? "potion-art " + offer.id : ""}"><div class="market-item-halo"></div><span class="market-item-symbol">${offer.emoji || icon(i.icon)}</span><span class="market-stock-badge">${offer.kind === "potion" ? "SINIRSIZ STOK" : bought ? "BUGÜN ALINDI" : owned ? "ÇANTANDA" : "GÜNLÜK 1 ADET"}</span>${offer.kind === "gear" ? `<span class="market-rarity">${RARITIES[rarity].name}</span>` : ""}</div><div class="market-card-content"><div class="section-top"><span class="eyebrow">${offer.kind === "bundle" ? "AVANTAJ PAKETİ" : marketSlots[i.slot]?.[1] || "ÜRÜN"}</span><span class="market-level ${E.level(state).level < offer.level ? "locked-text" : ""}">SV. ${offer.level}</span></div><h3>${offer.name}</h3><p>${offer.kind === "gear" ? i.effect : offer.desc}</p>${offer.kind === "bundle" ? `<div class="bundle-contents">${offer.contents.map(([id, n]) => `<span>${id === "potion" ? "🧪" : "🔮"} ${n}× ${E.item(id).name}</span>`).join("")}</div>` : `<small class="market-owned">Çantanda: ${state.inventory[offer.itemId] || 0}</small>`}<div class="market-card-bottom"><div class="market-price"><strong>🪙 ${(offer.price * quantity).toLocaleString("tr-TR")}</strong>${quantity > 1 ? `<small>${offer.price} × ${quantity} adet</small>` : "<small>altın</small>"}</div>${offer.kind === "potion" ? `<div class="quantity-stepper"><button data-action="market-quantity" data-id="-1" data-product="${offer.id}" aria-label="${offer.name} adedini azalt" ${quantity <= 1 ? "disabled" : ""}>−</button><output>${quantity}</output><button data-action="market-quantity" data-id="1" data-product="${offer.id}" aria-label="${offer.name} adedini artır" ${quantity >= 99 ? "disabled" : ""}>+</button></div>` : ""}</div><button class="btn ${error ? "secondary" : "primary"} wide" data-action="market-preview" data-id="${offer.id}">${owned ? "Ekipmanı incele" : bought && offer.limit ? "Alışverişi incele" : error && E.level(state).level < offer.level ? "🔒 Seviye " + offer.level + " gerekli" : "Ürünü incele " + icon("arrow")}</button>${error ? `<small class="market-restriction">${esc(error)}</small>` : '<small class="market-restriction available">Alışverişe uygun</small>'}</div></article>`;
}
function compareGear(i) {
  if (!i || i.slot === "consumable") return "";
  const old = E.item(state.equipment[i.slot]);
  return `<div class="market-comparison"><span class="eyebrow">KUŞANDIĞIN EKİPMANLA KARŞILAŞTIR</span><p>${old ? esc(old.name) + (E.upgradeLevel(state, old.id) ? " +" + E.upgradeLevel(state, old.id) : "") : "Bu yuva boş"}</p><div>${Object.entries(
    statLabels,
  )
    .filter(
      ([key]) => i[key] || old?.[key] || E.upgradeBonus(state, old?.id)?.[key],
    )
    .map(([key, label]) => {
      const before =
          (old?.[key] || 0) + (E.upgradeBonus(state, old?.id)[key] || 0),
        after = (i[key] || 0) + (E.upgradeBonus(state, i.id)[key] || 0),
        delta = after - before;
      return `<div><span>${label}</span><b>${before} → ${after}</b><small class="${delta > 0 ? "correct-text" : delta < 0 ? "wrong-text" : ""}">${delta > 0 ? "+" : ""}${delta}</small></div>`;
    })
    .join(
      "",
    )}</div><small>Yalnız eşya ve geliştirme farkıdır. Sınıf katkıları iki tarafta da aynıdır.</small></div>`;
}
function purchaseModal(id, quantity = 1) {
  const offer = E.marketOffers(state).find((o) => o.id === id);
  if (!offer) {
    toast("Bu ürünün günlük stoğu değişti.");
    render();
    return;
  }
  const i = E.item(offer.itemId),
    error = purchaseError(offer, quantity);
  modal(
    `<div class="purchase-heading"><div class="activity-icon gold">${offer.emoji || icon(i.icon)}</div><span class="eyebrow">${offer.kind === "gear" ? RARITIES[i.rarity].name : "KEŞİF HAZIRLIĞI"}</span><h2>${offer.name}</h2><p>${offer.desc}</p></div>${i ? `<div class="item-effect">${i.effect}</div>` : ""}${compareGear(i)}<div class="purchase-contents">${offer.contents.map(([id, n]) => `<span>${icon(E.item(id).icon)} <b>${n * quantity}×</b> ${E.item(id).name}</span>`).join("")}</div><div class="purchase-total"><span>Toplam</span><strong>🪙 ${(offer.price * quantity).toLocaleString("tr-TR")} altın</strong></div><p class="muted small">Alışveriş sonrası: ${Math.max(0, state.gold - offer.price * quantity)} altın. ${offer.limit ? "Ders başına günlük tek alım." : "İksirler çantanda birikir."}</p>${error ? `<div class="notice"><p>${esc(error)}</p></div>` : ""}<button class="btn primary wide" data-action="market-buy" data-id="${id}" data-quantity="${quantity}" ${error ? "disabled" : ""}>${offer.price * quantity} altın öde · satın al</button>${offer.kind === "gear" && state.inventory[id] ? button(state.equipment[i.slot] === id ? "Kuşanmayı bırak" : "Bu ekipmanı kuşan", "market-equip", "secondary wide", `data-id="${id}" ${state.run ? "disabled" : ""}`) : ""}`,
  );
}
function purchaseReceipt(receipt) {
  modal(
    `<div class="purchase-heading"><div class="result-emblem victory">${icon("chest")}</div><span class="eyebrow">ALIŞVERİŞ TAMAMLANDI</span><h2>Çantana eklendi.</h2></div><div class="purchase-contents">${receipt.items.map(({ id, quantity }) => `<span>${icon(E.item(id).icon)} <b>${quantity}×</b> ${E.item(id).name}</span>`).join("")}</div><p class="purchase-summary">${receipt.total} altın harcadın · ${state.gold} altının kaldı.</p>${button("Alışverişe devam et", "close-modal", "primary wide")}${button("Çantayı aç " + icon("arrow"), "go-character", "secondary wide")}`,
  );
}
function forgeMarket() {
  const owned = ITEMS.filter(
      (i) =>
        state.inventory[i.id] && ["weapon", "armor", "relic"].includes(i.slot),
    ),
    salvage = ITEMS.filter(
      (i) => state.inventory[i.id] && i.slot !== "consumable",
    );
  return `<section class="panel forge-intro"><div class="forge-anvil">⚒️</div><div><span class="eyebrow">ÖZÜ GÜCE DÖNÜŞTÜR</span><h2>Ekipmanına yatırım yap.</h2><p>Silah, zırh ve tılsımlar +3'e kadar geliştirilebilir. Silah başına +2 XP/doğru, zırh başına +8 can ve +1 savunma, tılsım başına +8 maksimum mana; her geliştirme kademesinde eklenir.</p><small>Geliştirme için altın + öz harcanır. +1/+2/+3 için karakter seviyesi 2/4/6 gerekir.</small></div></section><div class="section-top"><h2>Geliştirilebilir ekipmanların</h2><span>${owned.length} eşya</span></div><div class="forge-grid">${
    owned
      .map((i) => {
        const plan = E.upgradePlan(state, i.id);
        return `<article class="panel forge-card" style="--rarity:${RARITIES[i.rarity].color}"><div class="forge-item-icon">${icon(i.icon)}</div><div><span class="eyebrow">${RARITIES[i.rarity].name} ${state.equipment[i.slot] === i.id ? "· KUŞANILDI" : ""}</span><h3>${i.name} <b>+${plan.current}</b></h3><p>${bonusText(E.upgradeBonus(state, i.id))}</p><small>${plan.max ? "En yüksek geliştirme seviyesi" : `Sıradaki: +${plan.next} · 🪙 ${plan.gold} · 💠 ${plan.essence} · SV. ${plan.level}`}</small></div>${button(plan.max ? "✓ Tam geliştirildi" : "Geliştirmeyi incele", "market-upgrade", plan.max ? "secondary" : "primary", `data-id="${i.id}" ${plan.max ? "disabled" : ""}`)}</article>`;
      })
      .join("") ||
    '<div class="panel empty">Geliştirilebilir bir ekipmanın henüz yok.</div>'
  }</div><div class="section-top section-space"><div><h2>Parçala & öz kazan</h2><p>Kuşandığın ekipman korunur. Parçaladığın eşyanın geliştirmeleri de silinir.</p></div></div><div class="salvage-grid">${salvage.map((i) => `<article class="panel salvage-card"><span>${icon(i.icon)}</span><div><h3>${i.name}${E.upgradeLevel(state, i.id) ? " +" + E.upgradeLevel(state, i.id) : ""}</h3><small>Çantanda ${state.inventory[i.id]} · 💠 ${E.salvageValue(state, i.id)} öz</small></div>${button(state.equipment[i.slot] === i.id ? "Kuşanıldı" : "Parçala", "market-salvage", "secondary", `data-id="${i.id}" ${state.run || state.equipment[i.slot] === i.id ? "disabled" : ""}`)}</article>`).join("")}</div>`;
}
function upgradeModal(id) {
  const i = E.item(id),
    plan = E.upgradePlan(state, id);
  if (!i || !plan) return;
  let error = "";
  try {
    E.upgradeQuote(state, id);
  } catch (e) {
    error = e.message;
  }
  modal(
    `<div class="purchase-heading"><div class="activity-icon gold">⚒️</div><span class="eyebrow">GELİŞTİRME OCAĞI</span><h2>${i.name}</h2><p>+${plan.current} → +${plan.next}</p></div><div class="upgrade-preview"><div><span>MEVCUT GELİŞTİRME</span><strong>${bonusText(E.upgradeBonus(state, id))}</strong></div><div><span>SONRAKİ GELİŞTİRME</span><strong>${bonusText(plan.bonus)}</strong></div></div>${plan.max ? "<p>Bu eşya zaten en yüksek seviyede.</p>" : `<div class="purchase-total"><span>Gerekli kaynaklar</span><strong>🪙 ${plan.gold} + 💠 ${plan.essence}</strong></div><p class="muted small">Karakter seviyesi ${plan.level} gerekir. Bonus yalnız bu eşya kuşanıldığında uygulanır.</p>`}${error ? `<div class="notice"><p>${esc(error)}</p></div>` : ""}<button class="btn primary wide" data-action="market-upgrade-confirm" data-id="${id}" ${error ? "disabled" : ""}>+${plan.next} seviyesine geliştir</button>`,
  );
}
function salvageModal(id) {
  const i = E.item(id);
  if (!i) return;
  modal(
    `<div class="purchase-heading"><div class="activity-icon purple">💠</div><h2>${i.name} parçalansın mı?</h2><p>Eşyanın bir kopyası ve varsa geliştirmeleri kaldırılır. Karşılığında <strong>${E.salvageValue(state, id)} öz</strong> kazanırsın.</p></div>${button("Vazgeç", "close-modal", "secondary")}${button(E.salvageValue(state, id) + " öz kazan · parçala", "market-salvage-confirm", "primary", `data-id="${id}"`)}`,
  );
}
