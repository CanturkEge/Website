import { DB_ENVIRONMENT_ER } from "./db-environment-er.js";
import { DB_EER_MAPPING } from "./db-eer-mapping.js";
import { DB_SQL_BASIC } from "./db-sql-basic.js";
import { DB_SQL_ADVANCED } from "./db-sql-advanced.js";
import { dbSource } from "./db-sources.js";

const chapters = [...DB_ENVIRONMENT_ER, ...DB_EER_MAPPING, ...DB_SQL_BASIC, ...DB_SQL_ADVANCED];
export const DB_SQL_FIXTURES = chapters.flatMap(c => c.questions.flatMap((q,i) =>
  q.sqlFixture ? [{ id: `db-${c.topic+1}-${String(i+1).padStart(2,"0")}`, ...q.sqlFixture }] : [],
));
export const DB_QUESTIONS = chapters.flatMap(({topic,questions}) => questions.map(({refs,sqlFixture,...q},i) => ({
  id: `db-${topic+1}-${String(i+1).padStart(2,"0")}`,
  course: "database", topic, ...q, ...dbSource(refs),
})));
export const DB_UNITS = chapters.map(({topic,title,lessons}) => ({
  id: `db-${topic+1}-unit`, course: "database", topic, title,
  desc: lessons.map(l => l.title).join(" · "),
  lessons: lessons.map(({refs,cards,checks,...l},i) => {
    const id = `db-${topic+1}-lesson-${i+1}`;
    return { id, ...l, ...dbSource(refs),
      cards: cards.map(([front,back],j) => ({ id: `${id}-card-${j}`, front, back })),
      checks: checks.map((q,j) => ({...q,id:`${id}-check-${j}`,source:dbSource(refs).source})),
    };
  }),
}));
export const DB_ITEMS = chapters.map(({topic,title,sheet,lessons}) => ({
  id: `notes-db-${topic+1}`, course: "database", topic, name:sheet.name,
  rarity:sheet.rarity,slot:"notes",icon:"scroll",
  desc:`${title}: kavramlar, işlem kuralları ve sınav tuzakları.`,
  effect:`${title} sorularında ücretsiz ipucu · zindanda ${sheet.rarity === "epic" ? 3 : 2} kullanım`,
  sheet:sheet.entries, ...dbSource(lessons[0].refs),
}));
DB_ITEMS.push({
  id:"notes-db-atlas",course:"database",topic:-1,name:"Kayıt Muhafızının Büyük Kataloğu",
  rarity:"legendary",slot:"notes",icon:"book",
  desc:"Veri modelinden sorguya, yedi disiplinin ortak başvuru atlası.",
  effect:"Veritabanı dersinin bütün konularında ücretsiz ipucu · zindanda 4 kullanım",
  source:"Yüklenen database slaytları ve SQL notlarından özgün özet",
  sheet:DB_ITEMS.map(i => ({title:i.name,text:i.sheet.map(s=>s.title+": "+s.text).join("\n")})),
});
export const DB_NOTES = DB_ITEMS.filter(i=>i.topic>=0).map(i=>({
  course:"database",topic:i.topic,title:i.name,
  text:i.sheet.map(s=>s.title+": "+s.text).join("\n"),source:i.source,
}));
