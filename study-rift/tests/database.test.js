import { spawnSync } from "node:child_process";
import { DB_SQL_FIXTURES } from "../db-content.js";
import { databaseDiagram, DATABASE_DIAGRAM_IDS } from "../database-diagrams.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine.js";
import { QUESTIONS, ITEMS, COURSES, DUNGEONS } from "../game-data.js";
import { DB_SOURCES } from "../db-sources.js";
import { courseUnits, courseLessons, learningState, markLesson } from "../learning.js";
import { gradeAnswer, publicQuestion } from "../question-utils.js";

const bank = QUESTIONS.filter(q => q.course === "database");
function hunter() {
  const s = E.freshState();
  E.chooseClass(s, "sage");
  E.switchCourse(s, "database");
  s.xp = 20000;
  return s;
}
test("Database opens with 210 original questions, seven topics and accurate source references", () => {
  const course = COURSES.find(c => c.id === "database");
  assert.equal(course.locked, false);
  assert.equal(course.topics.length, 7);
  assert.equal(DB_SOURCES.length, 26);
  assert.equal(DB_SOURCES.filter(s=>s.kind==='pdf').reduce((n,s)=>n+s.pages,0),151);
  assert.equal(bank.length,210);
  assert.equal(new Set(bank.map(q=>q.prompt)).size,210);
  for(let topic=0;topic<7;topic++) for(let difficulty=1;difficulty<=5;difficulty++) {
    const qs=bank.filter(q=>q.topic===topic && q.difficulty===difficulty);
    assert.equal(qs.length,6);
    assert.equal(new Set(qs.map(q=>q.type)).size,6);
  }
  for(const q of bank) {
    assert(q.explanation.length>=60 && q.hint && q.source,q.id);
    assert(q.sourceRefs.length);
    for(const ref of q.sourceRefs) {
      const s=DB_SOURCES.find(s=>s.file===ref.file);
      assert(s,ref.file);
      assert(ref.pages.length && ref.pages.every(p=>Number.isInteger(p)&&p>=1&&p<=s.pages),q.id);
    }
    assert.equal(new Set(q.options).size,q.options.length,q.id);
    assert(gradeAnswer(q,q.type==='short'?q.answer[0]:q.answer),q.id);
    if(q.type==='order')assert.deepEqual([...q.options].sort(),[...q.answer].sort());
    if(q.type==='match')assert.equal(new Set(q.answer).size,q.answer.length);
    if(q.type==='multi')assert(q.answer.length>1 && q.answer.every(i=>Number.isInteger(i)&&i>=0&&i<q.options.length));
    assert(!('sqlFixture' in q));
    const visible=publicQuestion(q);
    assert(!('answer' in visible)&&!('hint' in visible)&&!('sqlFixture' in visible));
  }
});
test("Database allocates distinct valid exams at every tier and completes all eight rooms", () => {
  for (const d of DUNGEONS) {
    for (let seed = 1; seed <= 20; seed++) {
      const s = hunter();
      let n = seed;
      const rng = () => (n = (Math.imul(n, 1664525) + 1013904223) >>> 0) / 4294967296;
      const rooms = E.makeRoomExams(s, d, rng);
      const ids = rooms.flatMap(r => r.queue);
      assert.equal(ids.length, 23);
      assert.equal(new Set(ids).size, 23);
      rooms.forEach((r,i) => r.queue.forEach(id => {
        const q = bank.find(q => q.id === id);
        assert(q, id);
        assert(E.ROOMS[i].types.includes(q.type));
        assert.equal(q.difficulty, Math.min(5, d.difficulty + (i >= 6 ? 1 : 0)));
      }));
    }
    const s = hunter();
    E.startRun(s, d.id);
    while (s.run.status === "active") {
      if (s.run.roomMode === "map") E.enterRoom(s, s.run.index);
      if (s.run.roomMode === "report") { E.nextRoom(s); continue; }
      const q = E.displayQuestion(s);
      E.answer(s, q.type === "short" ? q.answer[0] : q.answer);
      if (s.run.status === "active") E.nextQuestion(s);
    }
    assert.equal(s.run.status, "won");
    assert.equal(s.run.correct, 23);
    assert(s.run.drops.some(id => ITEMS.find(i => i.id === id && i.course === "database" && i.slot === "notes")));
  }
});
test("seven units, 31 lessons and 62 cards/checks save independently from OOD and Modeling", () => {
  const units = courseUnits("database"), lessons = courseLessons("database");
  assert.equal(units.length, 7);
  assert.equal(lessons.length, 31);
  assert.equal(lessons.flatMap(l => l.cards).length, 62);
  assert.equal(lessons.flatMap(l => l.checks).length, 62);
  for (const l of lessons) {
    assert.equal(l.sections.length, 3);
    assert(l.source && l.sections.every(s => s.title && s.text.length >= 60));
    for (const q of l.checks) assert(q.options[q.answer] && q.explanation && new Set(q.options).size === q.options.length);
  }
  const s = hunter();
  markLesson(s, lessons[0].id);
  learningState(s).cards[lessons[0].cards[0].id] = "known";
  for (const other of ["oop", "simulation", "structures"]) {
    E.switchCourse(s, other);
    assert.equal(learningState(s).read.length, 0);
    assert.throws(() => markLesson(s, lessons[0].id));
  }
  E.switchCourse(s, "database");
  const restored = E.normalize(JSON.parse(JSON.stringify(s)));
  assert(learningState(restored).read.includes(lessons[0].id));
  assert.equal(learningState(restored).cards[lessons[0].cards[0].id], "known");
  assert.equal(E.bank(restored).length, 210);
});
test("Database cheat sheets grant free scoped hints and enter the course market", () => {
  const sheets = ITEMS.filter(i => i.course === "database" && i.slot === "notes");
  assert.equal(sheets.length, 8);
  assert(sheets.every(i => i.sheet.length >= 4));
  const s = hunter();
  s.inventory["notes-db-1"] = 1;
  E.equip(s, "notes-db-1");
  E.startRun(s, "e");
  const q = bank.find(q => q.topic === 0 && q.type === "mc");
  s.run.rooms[0].queue[0] = q.id;
  E.enterRoom(s, 0);
  const mp = s.run.mp;
  E.useSkill(s, "notes");
  assert.equal(s.run.mp, mp);
  assert(s.run.hint && s.run.noteUses === 1);
  E.leaveRun(s);
  for (const other of ["oop", "simulation", "structures"]) {
    E.switchCourse(s, other);
    E.startRun(s, "e");
    E.enterRoom(s, 0);
    assert.throws(() => E.useSkill(s, "notes"));
    E.leaveRun(s);
  }
  E.switchCourse(s, "database");
  for (const o of E.marketOffers(s).filter(o => o.kind === "gear")) {
    const i = E.item(o.itemId);
    assert(!i.course || i.course === "database");
  }
});

test("original ER/EER lesson diagrams resolve to accessible SVGs", () => {
  const lessons=courseLessons('database');
  const ids=lessons.flatMap(l=>l.sections.map(s=>s.diagram).filter(Boolean));
  assert(ids.length>=2);
  for(const id of ids) {
    assert(DATABASE_DIAGRAM_IDS.includes(id),id);
    const svg=databaseDiagram(id);
    assert(svg.includes('role="img"') && svg.includes('<figcaption>'));
  }
  assert.equal(databaseDiagram('unknown'), '');
});

test("SQL output fixtures execute in isolated in-memory databases", () => {
  assert(DB_SQL_FIXTURES.length>=8);
  for (const f of DB_SQL_FIXTURES) {
    const q=bank.find(q=>q.id===f.id);
    assert(q,f.id);
    if(q.numeric && f.expectedRows.length===1 && f.expectedRows[0].length===1 && typeof f.expectedRows[0][0]==='number') {
      assert(gradeAnswer(q,String(f.expectedRows[0][0])),f.id);
    }
  }
  const script=`import sqlite3,json,sys
fixtures=json.load(sys.stdin)
for f in fixtures:
    db=sqlite3.connect(':memory:')
    db.execute('PRAGMA foreign_keys=ON')
    try:
        for statement in f['setup']: db.executescript(statement)
        rows=[list(row) for row in db.execute(f['query']).fetchall()]
        expected=f['expectedRows']
        if not f.get('ordered',False):
            rows=sorted(rows,key=lambda r:json.dumps(r,sort_keys=True))
            expected=sorted(expected,key=lambda r:json.dumps(r,sort_keys=True))
        assert rows==expected, (f['id'],rows,expected)
    except Exception as error:
        raise AssertionError(f['id']+': '+str(error)) from error
    finally: db.close()
print(str(len(fixtures))+' SQL fixtures passed')
`;
  const run=spawnSync('python',['-c',script],{input:JSON.stringify(DB_SQL_FIXTURES),encoding:'utf8',timeout:10000});
  assert.equal(run.status,0,run.stderr || run.error?.message);
});
