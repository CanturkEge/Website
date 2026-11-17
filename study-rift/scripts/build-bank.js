import { writeFileSync, copyFileSync } from "node:fs";
import { QUESTIONS } from "../game-data.js";
const root = new URL("../", import.meta.url),
  dest = new URL("supabase/functions/study-rift-mastery/", root);
writeFileSync(new URL("bank.json", dest), JSON.stringify(QUESTIONS));
copyFileSync(
  new URL("question-utils.js", root),
  new URL("question-utils.js", dest),
);
console.log(`Mastery snapshot updated: ${QUESTIONS.length} questions.`);
