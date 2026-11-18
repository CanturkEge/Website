import { DS_FOUNDATIONS } from "./ds-foundations.js";
import { DS_LINEAR } from "./ds-linear.js";
import { DS_TREES } from "./ds-trees.js";
import { DS_SOURCES, dsSource } from "./ds-sources.js";

const chapters = [...DS_FOUNDATIONS, ...DS_LINEAR, ...DS_TREES];
export const DS_QUESTIONS = chapters.flatMap(({ week, questions }) =>
  questions.map(({ pages, ...q }, i) => ({
    id: `ds-${week}-${String(i + 1).padStart(2, "0")}`,
    course: "structures",
    topic: week - 1,
    ...q,
    ...dsSource(week, pages),
  })),
);
export const DS_UNITS = chapters.map(({ week, lessons }) => ({
  id: `ds-${week}-unit`,
  course: "structures",
  topic: week - 1,
  title: DS_SOURCES[week - 1].title,
  desc: lessons.map((l) => l.title).join(" · "),
  ...dsSource(week, [...new Set(lessons.flatMap((l) => l.pages))].sort((a, b) => a - b)),
  lessons: lessons.map(({ pages, cards, checks, ...l }, i) => {
    const id = `ds-${week}-lesson-${i + 1}`;
    return {
      id,
      ...l,
      ...dsSource(week, pages),
      cards: cards.map(([front, back], k) => ({ id: `${id}-card-${k}`, front, back })),
      checks: checks.map((q, k) => ({
        ...q,
        id: `${id}-check-${k}`,
        source: dsSource(week, pages).source,
      })),
    };
  }),
}));
export const DS_ITEMS = chapters.map(({ week, sheet, lessons }) => ({
  id: `notes-ds-${week}`,
  course: "structures",
  topic: week - 1,
  name: sheet.name,
  rarity: sheet.rarity,
  slot: "notes",
  icon: "scroll",
  desc: `${DS_SOURCES[week - 1].title}: işlem kuralları, sınırlar ve sınav tuzakları.`,
  effect: `${DS_SOURCES[week - 1].title} sorularında ücretsiz ipucu · zindanda ${sheet.rarity === "epic" ? 3 : 2} kullanım`,
  sheet: sheet.entries,
  ...dsSource(week, [...new Set(lessons.flatMap((l) => l.pages))].sort((a, b) => a - b)),
}));
DS_ITEMS.push({
  id: "notes-ds-atlas",
  course: "structures",
  topic: -1,
  name: "Kök Muhafızının Kayıp Atlası",
  rarity: "legendary",
  slot: "notes",
  icon: "book",
  desc: "Bellekten dengeli ağaçlara, altı haftanın ortak başvuru kitabı.",
  effect: "Data Structures’ın bütün konularında ücretsiz ipucu · zindanda 4 kullanım",
  source: "Week1–6 · Yüklenen ders slaytlarından özgün özet",
  sheet: DS_ITEMS.map((i) => ({
    title: i.name,
    text: i.sheet.map((s) => `${s.title}: ${s.text}`).join("\n"),
  })),
});
export const DS_NOTES = DS_ITEMS.filter((i) => i.topic >= 0).map((i) => ({
  course: "structures",
  topic: i.topic,
  title: i.name,
  text: i.sheet.map((s) => `${s.title}: ${s.text}`).join("\n"),
  source: i.source,
}));
