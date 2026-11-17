import * as V1 from "./data.js";
import { EXTENDED } from "./questions-v3.js";
import { ADVANCED } from "./questions-advanced.js";
import { GEAR } from "./loot.js";
export { CLASSES, SKILLS } from "./classes.js";
export { COURSES, getCourse } from "./courses.js";
export const TOPICS = V1.TOPICS;
export const RARITIES = V1.RARITIES;
export const ITEMS = [
  ...V1.ITEMS.map((i) => (i.slot === "notes" ? { ...i, course: "oop" } : i)),
  ...GEAR,
];
export const QUESTIONS = [
  ...V1.QUESTIONS.map((q) => ({ ...q, course: "oop" })),
  ...ADVANCED,
  ...EXTENDED,
];
export const BONUS_NOTES = V1.BONUS_NOTES.map((n) => ({ ...n, course: "oop" }));
export const DUNGEONS = V1.DUNGEONS.map((d, i) => ({
  ...d,
  difficulty: i + 1,
  desc: [
    "Temel bilgiyi bağlama uygula. Son odalarda bir kademe zorlaşır.",
    "Senaryo, kod okuma ve kavram ayrımları.",
    "Sözleşmeler, ilişkiler ve tasarım çelişkileri.",
    "Çok aşamalı çıkarımlar ve ince sözleşme ayrımları.",
    "Ustalık havuzu; en ağır hasar ve en yüksek ganimet kalitesi.",
  ][i],
}));
