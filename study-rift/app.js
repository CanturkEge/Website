import {
  TOPICS,
  QUESTIONS,
  ITEMS,
  SKILLS,
  DUNGEONS,
  RARITIES,
  BONUS_NOTES,
} from "./data.js";
import * as E from "./engine.js";
import { icon, portalArt, knightArt } from "./art.js";
import { cloud, SaveStore } from "./cloud.js";
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
  page = "camp",
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
const navs = [
  ["camp", "home", "Karargâh"],
  ["dungeons", "portal", "Zindanlar"],
  ["training", "training", "Antrenman"],
  ["character", "user", "Karakter"],
  ["skills", "tree", "Yetenek ağacı"],
  ["codex", "book", "Bilgi defteri"],
  ["stats", "chart", "İstatistikler"],
];
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
  const l = E.level(state),
    a = E.attributes(state);
  $("#app").innerHTML =
    `<aside class="sidebar"><a href="#camp" class="brand" data-page="camp" aria-label="Study Rift karargâh"><img src="./sigil.svg" alt=""><span>STUDY RIFT<small>KNOWLEDGE IS POWER</small></span></a><div class="nav-caption">AVCI MERKEZİ</div><nav>${navs.map(([id, ico, label]) => `<button class="nav-item ${page === id ? "active" : ""}" data-page="${id}" aria-label="${label}">${icon(ico)}<span>${label}</span>${id === "skills" && E.points(state) ? `<b>${E.points(state)}</b>` : ""}</button>`).join("")}</nav><div class="sidebar-bottom"><div class="system-dot">SİSTEM ÇEVRİMİÇİ <span>v0.1.0</span></div><p>Her doğru cevap,<br>bir seviye daha ileri.</p><button class="nav-item" data-page="settings" aria-label="Ayarlar">${icon("settings")}<span>Ayarlar</span></button><button class="hunter-mini" data-page="character" aria-label="Avcı karakteri"><span class="avatar">${icon("user")}</span><span>${esc(state.name)}<small>Seviye ${l.level} · ${state.skills.length ? "Yolunu seçen" : "Uyanan avcı"}</small></span>${icon("arrow")}</button></div></aside><div class="workspace"><header class="topbar"><div class="breadcrumbs">AVCI MERKEZİ <span>/</span> <strong>${navs.find((n) => n[0] === page)?.[2] || "Ayarlar"}</strong></div><div class="top-actions"><span class="currency">${icon("coin")} ${state.gold.toLocaleString("tr-TR")}</span><span class="level-chip">SV. ${l.level}</span><button class="account-btn" aria-label="Hesap" data-action="account">${icon("user")}<span>${user ? "Hesabım" : "Giriş yap"}</span></button></div></header><main id="content" tabindex="-1">${busy ? '<div class="boot">◈<p>Avcı kaydın yükleniyor…</p></div>' : renderPage()}</main><footer><span class="footer-brand">◈ STUDY RIFT</span><button id="sync" data-action="sync"></button><span>Örnek soru havuzu · 36 soru</span></footer></div>`;
  renderSync();
}
function renderPage() {
  if (state.run && page === "dungeons") return battle();
  return (
    { camp, dungeons, training, character, skills, codex, stats, settings }[
      page
    ] || camp
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
      "SİSTEM BİLDİRİMİ",
      "Yeniden hoş geldin, <em>" + esc(state.name) + ".</em>",
      "Bugünkü rakibin dün bilmediklerin.",
    ) +
    `<div class="camp-grid"><section class="hero panel"><div class="hero-art">${portalArt("hero")}</div><div class="hero-shade"></div><div class="hero-content">${pill("● KEŞFEDİLMEYİ BEKLEYEN BİR DÜNYA", "soft")}<h2>Bilgini<br><em>güce dönüştür.</em></h2><p>Zindanlara gir. Sınırlarını aş.<br>Her soruda biraz daha güçlen.</p>${button(state.run ? "Keşfe devam et " + icon("arrow") : "Zindana gir " + icon("arrow"), "go-dungeons", "primary")}<div class="hero-meta"><span>${icon("shield")} ${d.rank}-Rank erişimi</span><span>${icon("chest")} Kalıcı ganimetler</span></div></div></section><section class="panel hunter-panel"><div class="section-top"><h3>Avcı profili</h3>${button("Karakter " + icon("arrow"), "go-character", "text")}</div><div class="profile-summary"><div class="profile-sigil">◈</div><div><h2>${esc(state.name)}</h2><p>Uyanan avcı <span>•</span> ${d.rank}-Rank</p></div><b class="level-badge">${l.level}<small>SEVİYE</small></b></div><div class="bar-label"><span>SEVİYE İLERLEMESİ</span><strong>${l.current} / ${l.needed} XP</strong></div>${progress(l.current, l.needed, "xp")}<div class="profile-stats"><div>${icon("heart")}<b>${E.attributes(state).hp}</b><small>CAN</small></div><div>${icon("gem")}<b>${E.attributes(state).mp}</b><small>MANA</small></div><div>${icon("bolt")}<b>${E.points(state)}</b><small>YETENEK PUANI</small></div></div><div class="mini-callout">${icon("tree")}<p>${E.points(state) ? "Yeni bir yetenek açabilirsin." : "Seviye atla, kendi yolunu seç."}<small>Bilge · Muhafız · Gezgin</small></p>${button(icon("arrow"), "go-skills", "icon-btn", 'aria-label="Yetenek ağacını aç"')}</div></section></div><div class="quick-stats"><div>${icon("check")}<p><b>${state.stats.correct}</b><span>Doğru cevap</span></p></div><div>${icon("portal")}<p><b>${state.stats.wins}</b><span>Temizlenen zindan</span></p></div><div>${icon("chart")}<p><b>%${correct}</b><span>Doğruluk oranı</span></p></div><div>${icon("flame")}<p><b>${state.stats.bestCombo}×</b><span>En iyi seri</span></p></div></div><div class="section-top section-space"><div><h2>Bir sonraki adımın</h2><p>Sana uygun bir meydan okuma seç.</p></div><div class="section-actions">${button(icon("potion") + " Simyacı", "shop", "text")}${button("Tüm zindanlar " + icon("arrow"), "go-dungeons", "text")}</div></div><div class="three-grid"><button class="activity-card" data-action="go-dungeons"><div class="activity-icon purple">${icon("portal")}</div><span class="activity-kicker">ZİNDAN KEŞFİ</span><h3>${d.name}</h3><p>${d.desc}</p><div class="card-bottom"><span>${d.rank}-Rank · 8 oda</span>${icon("arrow")}</div></button><button class="activity-card" data-action="go-training"><div class="activity-icon green">${icon("training")}</div><span class="activity-kicker">GÜVENLİ ALAN</span><h3>Antrenman avlusu</h3><p>Can kaybetmeden öğren. Konunu seç, ipuçlarını aç, eksiklerini tamamla.</p><div class="card-bottom"><span>Sınırsız pratik · Ücretsiz ipucu</span>${icon("arrow")}</div></button><section class="daily-card panel"><div class="section-top"><span class="activity-kicker">GÜNLÜK GÖREV</span>${icon("flame")}</div><h3>Zihnini uyandır</h3><p>Antrenmanda 5 farklı soruyu doğru çöz.</p><div class="bar-label"><span>${Math.min(5, state.daily.ids.length)} / 5 tamamlandı</span><span>+35 ${icon("coin")}</span></div>${progress(Math.min(5, state.daily.ids.length), 5, "gold")}<div class="daily-reward">${icon(state.daily.claimed ? "check" : "potion")} ${state.daily.claimed ? "Ödül çantana eklendi" : "Bonus: 1 Can İksiri"}</div></section></div><div class="notice">${icon("book")}<p><strong>İlk keşif sürümü.</strong> Şu an 6 konuda 36 örnek OOD sorusu var. Hocanın slaytları geldikçe kaynaklı soru havuzu eklenecek.</p></div>`
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
      return `<section class="dungeon-card panel ${locked ? "locked" : ""}" style="--dungeon:${d.color}"><div class="dungeon-art">${portalArt("d" + i)}<span class="rank-stamp">${d.rank}<small>RANK</small></span>${locked ? `<div class="lock-overlay">${icon("lock")}<span>Seviye ${d.level} gerekli</span></div>` : ""}</div><div class="dungeon-info"><div class="section-top"><span class="eyebrow">${d.subtitle}</span>${state.cleared[d.id] ? pill(icon("check") + " " + state.cleared[d.id] + " KEZ") : ""}</div><h2>${d.name}</h2><p>${d.desc}</p><div class="dungeon-details"><span>${icon("sword")} ${["Temel", "Uygulama", "Ustalık"][d.difficulty - 1]}</span><span>${icon("chest")} ${d.reward}</span></div>${button(locked ? icon("lock") + " Kilitli" : "Kapıdan geç " + icon("arrow"), "enter", "primary wide", `data-id="${d.id}" ${locked ? "disabled" : ""}`)}</div></section>`;
    }).join("")}</div>`
  );
}
function itemCard(i) {
  const equipped = state.equipment[i.slot] === i.id;
  return `<button class="item-card ${equipped ? "equipped" : ""}" style="--rarity:${RARITIES[i.rarity].color}" data-action="item" data-id="${i.id}"><span class="item-visual">${icon(i.icon)}<small>×${state.inventory[i.id]}</small></span><span class="item-rarity">${RARITIES[i.rarity].name}</span><h3>${i.name}</h3><p>${i.effect}</p><span class="item-bottom">${equipped ? icon("check") + " KUŞANILDI" : { weapon: "SİLAH", armor: "ZIRH", notes: "CHEAT SHEET", relic: "TILSIM", consumable: "TÜKETİLEBİLİR" }[i.slot]}</span></button>`;
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
    `<div class="character-grid"><section class="panel character-sheet"><div class="section-top"><div><span class="eyebrow">UYANAN AVCI</span><h2>${esc(state.name)}</h2></div><span class="level-badge">${l.level}<small>SEVİYE</small></span></div><div class="character-stage">${knightArt()}<span class="character-label">${state.skills.length ? esc(SKILLS.find((x) => x.id === state.skills.at(-1)).path) : "Yolunu henüz seçmedin"}</span></div><div class="equipment-grid">${Object.entries(
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
  return (
    heading(
      "KENDİ YOLUNU ÇİZ",
      "Yetenek ağacı",
      "Tek bir yola bağlı değilsin. İstersen farklı dalları birleştir.",
      pill(E.points(state) + " YETENEK PUANI", "purple"),
    ) +
    `<div class="three-grid skill-paths">${[
      ["Bilge", "eye", "Bilgiyi silaha dönüştür.", "purple"],
      ["Muhafız", "shield", "Hatalarından güç al.", "green"],
      ["Gezgin", "gem", "Her keşiften fazlasıyla dön.", "gold"],
    ]
      .map(
        ([name, i, desc, color]) =>
          `<section class="panel path ${color}"><div class="path-header"><div class="activity-icon ${color}">${icon(i)}</div><h2>${name}</h2><p>${desc}</p></div>${SKILLS.filter(
            (s) => s.path === name,
          )
            .map((s, idx) => {
              const owned = state.skills.includes(s.id),
                available =
                  !owned &&
                  E.points(state) > 0 &&
                  E.level(state).level >= s.level &&
                  (!s.requires || state.skills.includes(s.requires));
              return `<div class="skill-node ${owned ? "owned" : available ? "available" : "inactive"}">${idx ? '<span class="skill-connector"></span>' : ""}<div class="skill-icon">${icon(s.icon)}</div><div><h3>${s.name}</h3><p>${s.desc}</p><small>Seviye ${s.level}${s.requires ? " · " + SKILLS.find((x) => x.id === s.requires).name : ""}</small></div>${button(owned ? icon("check") + " Açıldı" : icon(available ? "bolt" : "lock") + " 1 puan", "unlock", owned ? "text" : "secondary", `data-id="${s.id}" ${!available ? "disabled" : ""}`)}</div>`;
            })
            .join("")}</section>`,
      )
      .join(
        "",
      )}</div><div class="notice">${icon("tree")}<p>Her seviye atlayışında 1 puan kazanırsın. Yetenekler kalıcıdır. Savaş içi aktif yetenekler mana harcar; her odada bir kez kullanılabilir.</p></div>`
  );
}
function questionView(q, ctx, train = false) {
  const feedback = ctx.feedback,
    correct = feedback?.correct;
  let answers = "";
  if (q.type === "match") {
    const options = E.shuffle(q.answer, () => 0.65);
    answers = `<form id="answer-form"><div class="matching">${q.options.map((label, i) => `<label><span>${esc(label)}</span><select name="match${i}" required ${ctx.answered ? "disabled" : ""}><option value="">Karşılığını seç…</option>${options.map((o) => `<option value="${esc(o)}" ${feedback?.value[i] === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>${ctx.answered ? `<small class="${feedback.value[i] === q.answer[i] ? "correct-text" : "wrong-text"}">${esc(q.answer[i])}</small>` : ""}</label>`).join("")}</div>${!ctx.answered ? '<button class="btn primary" type="submit">Eşleştirmeyi kontrol et ' + icon("arrow") + "</button>" : ""}</form>`;
  } else
    answers = `<div class="answers ${q.type === "tf" ? "boolean" : ""}">${q.options
      .map((option, i) => {
        const reveal = ctx.answered && i === q.answer,
          wrong = ctx.answered && !correct && Number(feedback.value) === i;
        return `<button class="answer ${reveal ? "correct" : ""} ${wrong ? "wrong" : ""} ${ctx.hidden?.includes(i) ? "eliminated" : ""}" data-action="answer" data-id="${i}" ${ctx.answered || ctx.hidden?.includes(i) ? "disabled" : ""}><span class="answer-letter">${q.type === "tf" ? (i === 0 ? "✓" : "×") : String.fromCharCode(65 + i)}</span><span>${esc(option)}</span>${reveal ? icon("check") : ""}</button>`;
      })
      .join("")}</div>`;
  return `<section class="panel question-panel"><div class="question-meta"><span>${pill({ mc: "ÇOKTAN SEÇMELİ", tf: "DOĞRU / YANLIŞ", match: "EŞLEŞTİRME" }[q.type])} ${pill(["", "TEMEL", "UYGULAMA", "USTALIK"][q.difficulty], "dim")}</span><span>${esc(TOPICS[q.topic])}</span></div><h2>${esc(q.prompt)}</h2>${q.code ? "<pre><code>" + esc(q.code) + "</code></pre>" : ""}${answers}${ctx.hint ? `<div class="hint-box">${icon("eye")}<div><b>Sezgi</b><p>${esc(q.hint)}</p></div></div>` : ""}${ctx.answered ? `<div class="feedback ${correct ? "success" : "danger"}"><div class="feedback-head">${icon(correct ? "check" : "shield")}<strong>${correct ? "Doğru. Güçleniyorsun." : "Bu da yolun bir parçası."}</strong><span>${correct ? "+" + feedback.xp + " XP" : train ? "Can kaybı yok" : "−" + feedback.damage + " CAN"}</span></div><p>${esc(q.explanation)}</p>${feedback.loot?.length ? `<div class="inline-loot">${icon("chest")} Ganimet düştü: ${feedback.loot.map((id) => E.item(id).name).join(", ")}</div>` : ""}</div><div class="question-next"><small>${q.source}</small>${button(train ? "Sonraki soru " + icon("arrow") : state.run.status === "failed" ? "Keşif sonucu " + icon("arrow") : state.run.index === 7 ? "Boss ödülünü al " + icon("chest") : "Sonraki oda " + icon("arrow"), train ? "next-training" : "next-room", "primary")}</div>` : `<div class="question-source">${q.source}</div>`}</section>`;
}
function battle() {
  const r = state.run,
    d = DUNGEONS.find((d) => d.id === r.dungeon),
    q = E.currentQuestion(state),
    a = E.attributes(state);
  if (r.status === "won" || (r.status === "failed" && r.showResult))
    return results();
  return (
    heading(
      r.index >= 6 ? "BOSS KARŞILAŞMASI" : "AKTİF KEŞİF",
      d.name,
      `Oda ${r.index + 1} / ${r.queue.length} · ${r.index >= 6 ? d.enemy : "Kadim sınav"}`,
      button("Kampa çekil", "retreat", "secondary"),
    ) +
    `<div class="battle-layout"><div><div class="room-track">${r.queue.map((_, i) => `<div class="${i < r.index ? "done" : i === r.index ? "current" : ""}">${icon(i >= 6 ? "sword" : i < r.index ? "check" : "gem")}<small>${i >= 6 ? "BOSS" : String(i + 1).padStart(2, "0")}</small></div>`).join("")}</div>${questionView(q, r)}</div><aside class="battle-side"><section class="panel vitals"><div class="section-top"><h3>${esc(state.name)}</h3>${pill("SV. " + E.level(state).level)}</div><div class="bar-label"><span class="hp-text">${icon("heart")} CAN</span><strong>${r.hp} / ${a.hp}</strong></div>${progress(r.hp, a.hp, "hp")}<div class="bar-label"><span class="mp-text">${icon("gem")} MANA</span><strong>${r.mp} / ${a.mp}</strong></div>${progress(r.mp, a.mp, "mp")}<div class="combo">${icon("flame")} <strong>${r.combo}× seri</strong><span>${r.combo >= 3 ? "+6 XP bonus" : "3 doğruda XP bonusu"}</span></div>${r.shield ? '<p class="shield-status">Kalkan etkin · sıradaki hasar yarıya iner</p>' : ""}</section><section class="panel abilities"><div class="section-top"><h3>Yeteneklerin</h3><span>Her oda 1×</span></div>${[
      [
        "hint",
        "eye",
        "Sezgi",
        state.skills.includes("insight") ? 12 : 20,
        "Kavramsal ipucu",
      ],
      [
        "heal",
        "heart",
        "Yaşam akışı",
        25,
        "+" + (state.skills.includes("mend") ? 45 : 30) + " can",
      ],
      ["eliminate", "wand", "Eleme", 25, "Bir yanlış şıkkı kaldır"],
      ["shield", "shield", "Rün kalkanı", 20, "Sıradaki hasarı yarıya indir"],
      [
        "notes",
        "scroll",
        "Cheat Sheet",
        0,
        E.item(state.equipment.notes)?.name || "Kuşanılmış not yok",
      ],
    ]
      .map(
        ([id, i, n, c, desc]) =>
          `<button class="ability" data-action="skill" data-id="${id}" ${r.answered || r.used.includes(id) || (id === "eliminate" && !state.skills.includes("analysis") && E.item(state.equipment.weapon)?.skill !== "eliminate") || (id === "shield" && !state.skills.includes("shield")) || (id === "notes" && !state.equipment.notes) ? "disabled" : ""}>${icon(i)}<span><b>${n}</b><small>${desc}</small></span><em>${c ? c + " MP" : "0 MP"}</em></button>`,
      )
      .join(
        "",
      )}<div class="potion-row">${button(icon("potion") + " Can ×" + (state.inventory.potion || 0), "skill", "secondary", `data-id="potion" ${r.answered ? "disabled" : ""}`)}${button(icon("potion") + " Mana ×" + (state.inventory.ether || 0), "skill", "secondary", `data-id="ether" ${r.answered ? "disabled" : ""}`)}</div><p class="muted">Doğru cevap: +${a.mana} mana.<br>Yanlış cevap: can kaybı. Süre sınırı yok.</p></section><div class="battle-rewards">${icon("chest")}<span>Bu keşifte <b>+${r.earnedXP} XP · ${r.drops.length} loot</b></span></div></aside></div>`
  );
}
function results() {
  const r = state.run,
    d = DUNGEONS.find((d) => d.id === r.dungeon),
    won = r.status === "won";
  return `<div class="results"><div class="result-emblem ${won ? "victory" : ""}">${icon(won ? "chest" : "shield")}</div><span class="eyebrow">${d.rank}-RANK · ${d.name}</span><h1>${won ? "Zindan temizlendi." : "Bugünlük bu kadar."}</h1><p>${won ? "Bilgin derinleşti. Ganimetlerin seni bekliyor." : "Kazandığın XP ve ganimetler sende. Eksiklerini çalış, tekrar gel."}</p><div class="result-stats panel"><div><b>${r.correct} / ${r.queue.length}</b><span>Doğru cevap</span></div><div><b>+${r.earnedXP}</b><span>Deneyim puanı</span></div><div><b>+${r.earnedGold}</b><span>Altın</span></div></div>${r.drops.length ? `<h2>Ganimetlerin</h2><div class="loot-grid">${r.drops.map((id, i) => `<div class="loot-reveal" style="--delay:${i * 0.15}s;--rarity:${RARITIES[E.item(id).rarity].color}">${icon(E.item(id).icon)}<small>${RARITIES[E.item(id).rarity].name}</small><h3>${E.item(id).name}</h3><p>${E.item(id).effect}</p></div>`).join("")}</div>` : ""}<div class="result-actions">${button("Kampa dön", "end-run", "secondary")}${button("Ekipmanları incele " + icon("arrow"), "end-equip", "primary")}</div></div>`;
}
function training() {
  const ctx = state.training,
    q = E.currentQuestion(state, true);
  return (
    heading(
      "CAN KAYBI YOK · BASKI YOK",
      "Antrenman avlusu",
      "Önce öğren. Sonra zindanda bilgini güce dönüştür.",
    ) +
    `<section class="panel training-controls"><label>KONU<select id="train-topic"><option value="">Bütün konular</option>${TOPICS.map((t, i) => `<option value="${i}" ${String(trainingFilters.topic) === String(i) ? "selected" : ""}>${t}</option>`).join("")}</select></label><label>SORU TÜRÜ<select id="train-type"><option value="">Bütün türler</option>${[
      ["mc", "Çoktan seçmeli"],
      ["tf", "Doğru / yanlış"],
      ["match", "Eşleştirme"],
    ]
      .map(
        ([v, n]) =>
          `<option value="${v}" ${trainingFilters.type === v ? "selected" : ""}>${n}</option>`,
      )
      .join(
        "",
      )}</select></label><label class="checkbox-label"><input id="train-weak" type="checkbox" ${trainingFilters.weak ? "checked" : ""}> Yanlış yaptıklarım</label>${button("Antrenmana başla " + icon("arrow"), "train-start", "primary")}</section>${ctx && q ? `<div class="training-meta"><span>${pill("GÜVENLİ ALAN", "green")} İlk doğru çözüm: +6 XP / soru / gün</span>${button(icon("eye") + " Ücretsiz ipucu", "training-hint", "secondary", ctx.answered ? "disabled" : "")}</div>${questionView(q, ctx, true)}` : `<div class="training-empty panel"><div class="activity-icon green">${icon("training")}</div><h2>Burası senin deneme alanın.</h2><p>Konu seç, soruları çöz, açıklamaları oku.<br>Hata yapmanın hiçbir cezası yok.</p><div class="training-benefits"><span>${icon("heart")} Can kaybı yok</span><span>${icon("eye")} Ücretsiz ipuçları</span><span>${icon("book")} Ayrıntılı açıklamalar</span></div></div>`}`
  );
}
function codex() {
  const wrong = QUESTIONS.filter((q) => state.mastery[q.id]?.wrong > 0);
  return (
    heading(
      "BİLGİ SENİNLE KALIR",
      "Bilgi defteri",
      "Kaybettiğin can geri gelir. Öğrendiğin bilgi sende kalır.",
    ) +
    `<div class="tabs"><button class="${codexTab === "notes" ? "selected" : ""}" data-action="codex-tab" data-id="notes">Bonus notlar</button><button class="${codexTab === "wrong" ? "selected" : ""}" data-action="codex-tab" data-id="wrong">Yanlış defteri (${wrong.length})</button><button class="${codexTab === "personal" ? "selected" : ""}" data-action="codex-tab" data-id="personal">Kendi notlarım</button></div>${
      codexTab === "notes"
        ? `<div class="two-grid">${BONUS_NOTES.map((n) => {
            const unlocked = ITEMS.some(
              (i) =>
                i.slot === "notes" &&
                state.inventory[i.id] > 0 &&
                (i.topic === n.topic || i.topic === -1),
            );
            return `<article class="panel bonus-note ${unlocked ? "" : "locked-note"}"><div class="eyebrow">${TOPICS[n.topic]}</div><h2>${unlocked ? icon("book") : icon("lock")} ${n.title}</h2><p>${unlocked ? n.text : "Bu bonus not henüz keşfedilmedi. İlgili cheat sheet’i zindanda düşürerek aç."}</p><small>${unlocked ? "Çantandaki nottan açıldı · Kuşanırsan savaşta ücretsiz ipucu verir." : "Boss ganimeti · İlk zaferinde bir konu notu garanti."}</small></article>`;
          }).join("")}</div>`
        : codexTab === "wrong"
          ? wrong.length
            ? `<div class="wrong-list">${wrong.map((q) => `<details class="panel"><summary><span>${pill(TOPICS[q.topic])}<strong>${esc(q.prompt)}</strong></span><span>${state.mastery[q.id].wrong} yanlış ${icon("arrow")}</span></summary>${q.code ? "<pre>" + esc(q.code) + "</pre>" : ""}<p class="correct-text">Doğru cevap: ${q.type === "match" ? q.options.map((o, i) => esc(o) + " → " + esc(q.answer[i])).join(" · ") : esc(q.options[q.answer])}</p><p>${esc(q.explanation)}</p></details>`).join("")}</div>`
            : `<div class="empty panel">${icon("check")}<h2>Henüz yanlışın yok.</h2><p>Yanlış çözdüğün her soru açıklamasıyla burada birikir.</p></div>`
          : `<section class="panel personal-notes"><label for="personal-notes">Avcı notların</label><textarea id="personal-notes" maxlength="30000" placeholder="Kendi örneklerini, formüllerini ve aklında kalmasını istediğin şeyleri yaz…">${esc(state.notes)}</textarea><div class="section-top"><small>Hesabına giriş yaptıysan notların da buluta kaydedilir.</small>${button("Notları kaydet", "save-notes", "primary")}</div></section>`
    }`
  );
}
function stats() {
  const st = state.stats;
  return (
    heading(
      "HER ADIM BİR İZ BIRAKIR",
      "Gelişim raporu",
      "Nerede güçlüsün, nerede biraz daha antrenman gerekiyor?",
    ) +
    `<div class="quick-stats"><div><p><b>${st.answered}</b><span>Çözülen soru</span></p></div><div><p><b>%${st.answered ? Math.round((st.correct / st.answered) * 100) : 0}</b><span>Doğruluk</span></p></div><div><p><b>${st.wins} / ${st.runs}</b><span>Zindan zaferi / giriş</span></p></div><div><p><b>${state.xp}</b><span>Toplam XP</span></p></div></div><section class="panel topic-progress"><h2>Konu hâkimiyeti</h2>${TOPICS.map(
      (t, i) => {
        const qs = QUESTIONS.filter((q) => q.topic === i),
          learned = qs.filter((q) => state.mastery[q.id]?.lastCorrect).length;
        return `<div class="topic-row"><span>${t}</span>${progress(learned, qs.length, "xp")}<strong>${learned} / ${qs.length}</strong></div>`;
      },
    ).join(
      "",
    )}<p class="muted">Son denemende doğru çözdüğün farklı soruların oranı; sınav notu tahmini değildir.</p></section><section class="panel run-history"><h2>Keşif geçmişi</h2>${state.history.length ? `<div class="table-wrap"><table><thead><tr><th>Zindan</th><th>Sonuç</th><th>Doğru</th><th>XP</th><th>Tarih</th></tr></thead><tbody>${state.history.map((h) => `<tr><td>${DUNGEONS.find((d) => d.id === h.dungeon)?.name}</td><td>${{ won: "Zafer", failed: "Yenilgi", retreated: "Geri çekilme" }[h.status]}</td><td>${h.correct} / ${h.total}</td><td>+${h.xp}</td><td>${new Date(h.date).toLocaleDateString("tr-TR")}</td></tr>`).join("")}</tbody></table></div>` : '<p class="muted">İlk zindanından sonra keşiflerin burada görünecek.</p>'}</section>`
  );
}
function settings() {
  return (
    heading(
      "SİSTEM AYARLARI",
      "Kendi ritmini bul",
      "İlerlemen otomatik kaydedilir.",
    ) +
    `<section class="panel settings-panel"><label>AVCI ADIN<input id="hunter-name" value="${esc(state.name)}" maxlength="24"></label>${button("Adı kaydet", "save-name", "primary")}<hr><label class="checkbox-label"><input type="checkbox" id="sound" ${state.settings.sound ? "checked" : ""}> Cevap seslerini aç</label><hr><h3>Hesap & kayıt</h3><p>${user ? "Hesabına bağlı ilerleme cihazlar arasında taşınır." : "Misafir ilerlemesi yalnızca bu tarayıcıda saklanır. Kalıcı bulut kaydı için giriş yap."}</p>${button(user ? "Hesabımı görüntüle" : "Giriş yap / hesap oluştur", "account", "secondary")}<hr><h3>Oyun kuralları</h3><p>Zindanlarda 8 soru bulunur; son iki oda boss karşılaşmasıdır. Doğru cevaplar mana, XP ve altın verir. Üç doğru üst üste +6 XP bonusu getirir. Canın biterse koşu sonlanır; kazandığın ödüller kalır.</p><p>Ekipmanı kampta değiştirebilirsin. İpucu, iyileştirme ve diğer aktif yetenekler soru başına bir kez kullanılabilir. İlk zindan zaferinde bir cheat sheet garanti düşer.</p><p>Antrenmanda günde her farklı sorunun ilk doğru çözümü +6 XP verir. 5 farklı doğru çözüm 35 altın ve bir Can İksiri kazandırır. Kamptaki Simyacıdan altınla Can ve Mana İksiri alabilirsin. Bonus notlar, ilgili cheat sheet ganimetini bulunca Bilgi defterinde açılır.</p><p class="muted">v0.1.0 · Sorular şimdilik örnek içeriktir. Kaynak slaytlar henüz eklenmedi.</p></section>`
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
  modal(
    `<div class="auth-heading"><div class="activity-icon gold">${icon("potion")}</div><h2>Kamptaki Simyacı</h2><p>Bir sonraki keşfin için hazırlan. ${state.gold} altının var.</p></div>${[
      ["potion", 40],
      ["ether", 55],
    ]
      .map(
        ([id, cost]) =>
          `<div class="shop-item"><div>${icon("potion")}<h3>${E.item(id).name}</h3><p>${E.item(id).effect}</p></div>${button(cost + " altın · Al", "buy", "secondary", `data-id="${id}" ${state.gold < cost || state.run ? "disabled" : ""}`)}</div>`,
      )
      .join(
        "",
      )}<p class="muted small">${state.run ? "Alışveriş için önce kampa dön." : "İksirler çantana eklenir. Zindanda yetenek panelinden kullan."}</p>`,
  );
}
function itemModal(id) {
  const i = E.item(id);
  if (!i) return;
  const owned = state.equipment[i.slot] === id;
  modal(
    `<div class="item-detail" style="--rarity:${RARITIES[i.rarity].color}"><div class="detail-art">${icon(i.icon)}</div><div class="item-rarity">${RARITIES[i.rarity].name}</div><h2>${i.name}</h2><p>${i.desc}</p><div class="item-effect">${i.effect}</div><p class="muted">Çantanda ${state.inventory[id] || 0} adet var.</p>${i.slot === "consumable" ? "<p>İksirleri zindandayken yetenek panelinden kullanabilirsin.</p>" : button(owned ? "Kuşanmayı bırak" : "Kuşan " + icon("arrow"), "equip", "primary wide", `data-id="${id}" ${state.run ? "disabled" : ""}`)}${state.run ? "<small>Önce keşfini bitirip kampa dön.</small>" : ""}</div>`,
  );
}
function accountModal(mode = "login") {
  if (user && !sessionExpired) {
    modal(
      `<div class="auth-heading"><div class="activity-icon purple">${icon("user")}</div><h2>Avcı hesabın</h2><p>${esc(user.email)}</p></div><p>İlerlemen hesabına bağlı olarak kaydedilir.</p><p id="account-sync">${esc($("#sync")?.textContent)}</p>${button("Kaydı tekrar dene", "sync", "secondary wide")}<hr>${button("Çıkış yap", "logout", "secondary wide")}`,
    );
    return;
  }
  modal(
    `<div class="auth-heading"><img src="./sigil.svg" alt=""><span class="eyebrow">SİSTEME KATIL</span><h2>${mode === "signup" ? "Yeni bir avcı uyanıyor." : "Kaldığın yerden devam et."}</h2><p>Karakterin, ekipmanın ve notların her cihazda seninle.</p></div><form id="auth-form" data-mode="${mode}">${mode === "signup" ? '<label>Avcı adı<input name="name" required maxlength="24" autocomplete="nickname" placeholder="Avcı adın"></label>' : ""}<label>E-posta<input name="email" type="email" required autocomplete="email" placeholder="sen@ornek.com"></label><label>Şifre<input name="password" type="password" required minlength="8" autocomplete="${mode === "signup" ? "new-password" : "current-password"}" placeholder="En az 8 karakter"></label><div id="auth-error" class="form-message" role="status"></div><button type="submit" class="btn primary wide">${mode === "signup" ? "Hesap oluştur" : "Giriş yap"} ${icon("arrow")}</button></form><div class="auth-switch">${mode === "signup" ? "Zaten hesabın var mı?" : "Yeni misin?"} ${button(mode === "signup" ? "Giriş yap" : "Hesap oluştur", "auth-mode", "text", `data-id="${mode === "signup" ? "login" : "signup"}"`)}</div><p class="muted small">Misafir ilerlemen, hesabında kayıt yoksa ilk girişte aktarılır. E-posta doğrulaması istenirse gelen kutundaki bağlantıyı açıp buradan giriş yap.</p>`,
  );
}
async function loadUser(u) {
  busy = true;
  render();
  try {
    const raw = await store.load(u);
    user = u;
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
  if (state.run) page = "dungeons";
  render();
  if (recovery) showRecovery();
}
function navigate(p) {
  page = p;
  if (p === "training" && state.training)
    trainingFilters = state.training.filters;
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
}
function mutate(fn) {
  if (busy) return;
  if (sessionExpired) { accountModal(); return; }
  if (recovery) {
    showRecovery();
    return;
  }
  try {
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
    accountModal(id);
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
  if (act === "shop") {
    shopModal();
    return;
  }
  if (act === "buy") {
    mutate(() => E.buy(state, id));
    shopModal();
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
    window.scrollTo({top:0,behavior:"auto"});
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
    window.scrollTo({top:0,behavior:"auto"});
    $("#modal").close();
    return;
  }
  if (act === "train-start") {
    const topic = $("#train-topic").value;
    trainingFilters = {
      topic: topic === "" ? null : Number(topic),
      type: $("#train-type").value,
      weak: $("#train-weak").checked,
    };
    mutate(() => E.startTraining(state, trainingFilters));
    return;
  }
  if (act === "next-training") {
    mutate(() => E.startTraining(state, trainingFilters));
    window.scrollTo({top:0,behavior:"auto"});
    return;
  }
  if (act === "save-notes") {
    mutate(() => {
      state.notes = $("#personal-notes").value;
    });
    toast("Notların kaydedildi.");
    return;
  }
  if (act === "save-name") {
    const value = $("#hunter-name").value.trim();
    if (!value) {
      toast("Bir avcı adı yaz.");
      return;
    }
    mutate(() => (state.name = value.slice(0, 24)));
    toast("Avcı adın güncellendi.");
    return;
  }
});
document.addEventListener("submit", async (e) => {
  if (e.target.id === "answer-form") {
    e.preventDefault();
    const values = E.currentQuestion(state, page === "training").options.map(
      (_, i) => e.target.elements["match" + i].value,
    );
    mutate(() => {
      const f = E.answer(state, values, page === "training");
      sound(f.correct);
    });
    return;
  }
  if (e.target.id === "auth-form") {
    e.preventDefault();
    const f = e.target,
      submit = f.querySelector("[type=submit]"),
      msg = $("#auth-error"),
      signup = f.dataset.mode === "signup";
    submit.disabled = true;
    msg.textContent = "Bağlantı kuruluyor…";
    try {
      const email = f.elements.email.value.trim(),
        password = f.elements.password.value;
      const { data, error } = signup
        ? await cloud.auth.signUp({
            email,
            password,
            options: { data: { hunter_name: f.elements.name.value.trim() } },
          })
        : await cloud.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session) {
        msg.textContent =
          "Doğrulama e-postanı kontrol et. Bağlantıyı açtıktan sonra buraya dönüp giriş yap.";
        submit.disabled = false;
        return;
      }
      $("#modal").close();
      await loadUser(data.user);
      toast("Sisteme hoş geldin. İlerlemen hesabına bağlandı.");
    } catch (err) {
      msg.textContent =
        err.code === "invalid_credentials"
          ? "E-posta veya şifre hatalı."
          : err.message;
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
  if (event === "SIGNED_OUT" && user) {
    sessionExpired = true;
    store.user = null;
    store.blocked = true;
    sync = "error";
    renderSync();
  }
});
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
  toast("Hesap bağlantısı kurulamadı. Misafir ilerlemen bu cihazda saklanır.");
}
