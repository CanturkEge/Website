const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const c={console};c.window=c;c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'..','v78-core.js'),'utf8'),c,{filename:'v78-core.js'});const R=c.v78Xp,plain=value=>JSON.parse(JSON.stringify(value));

test('XP thresholds map the complete level 1-20 progression',()=>{
  assert.equal(R.THRESHOLDS.length,20);assert.equal(R.xpForLevel(1),0);assert.equal(R.xpForLevel(5),6500);assert.equal(R.xpForLevel(20),355000);
  assert.equal(R.levelForXp(299),1);assert.equal(R.levelForXp(300),2);assert.equal(R.levelForXp(354999),19);assert.equal(R.levelForXp(355000),20);
});
test('legacy character without XP starts at the floor of its saved level',()=>{
  const row=plain(R.normalize({id:'c1',level:7,name:'Arven'}));assert.equal(row.xp,23000);assert.equal(row.level,7);assert.deepEqual(row.xpHistory,[]);
});
test('progress reports current band, remaining XP and percentage',()=>{
  const row=R.progress({xp:4600});assert.equal(row.level,4);assert.equal(row.floor,2700);assert.equal(row.next,6500);assert.equal(row.earned,1900);assert.equal(row.remaining,1900);assert.equal(Math.round(row.percent),50);
});
test('adding and removing XP changes level and records a bounded audit row',()=>{
  const up=plain(R.apply({id:'c1',level:2,xp:850,xpHistory:[]},{mode:'add',amount:100,reason:'Görev',actor:'DM',id:'x1',at:'2026-09-09T00:00:00Z'}));
  assert.equal(up.changed,true);assert.equal(up.character.xp,950);assert.equal(up.character.level,3);assert.equal(up.entry.beforeLevel,2);assert.equal(up.entry.afterLevel,3);assert.equal(up.entry.delta,100);
  const down=plain(R.apply(up.character,{mode:'remove',amount:700,reason:'Düzeltme'}));assert.equal(down.character.xp,250);assert.equal(down.character.level,1);assert.equal(down.delta,-700);
});
test('level 20 keeps total XP while displaying a completed band',()=>{
  const row=R.progress({xp:500000});assert.equal(row.level,20);assert.equal(row.next,null);assert.equal(row.remaining,0);assert.equal(row.percent,100);assert.equal(row.xp,500000);
});
