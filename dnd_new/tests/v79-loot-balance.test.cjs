const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');

function fixture(){
  const c={console,EX_ALL_CATALOG:[],EX_SHOPS:{},V34_CASTLE_TIERS:{},V26_MONSTERS:[]};c.window=c;c.globalThis=c;vm.createContext(c);
  for(const file of ['v47-data.js','v48-data.js','v63-data.js','v64-data.js','v65-data.js','v44-data.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),c,{filename:file});
  return c;
}

function seeded(seed){
  let value=seed>>>0;
  return ()=>((value=(Math.imul(value,1664525)+1013904223)>>>0)/4294967296);
}

const treasureContainers=['lockbox','jewelryBox','thiefStash','chest','reinforced','wizardChest','warriorCache','reliquary','lair','cursedChest'];
const rewardCategories=new Set(['weapon','armor','shield','accessory','focus','consumable','scroll','component','gem','tool','ammunition']);
const floors={poor:'common',standard:'uncommon',rich:'rare',royal:'veryRare'};

test('every treasure container drops an item and opens with a useful quality-floor reward',()=>{
  const c=fixture(),rank=Object.fromEntries(c.V44_RARITY_ORDER.map((key,index)=>[key,index]));
  for(const container of treasureContainers)for(const quality of Object.keys(floors))for(let seed=1;seed<=40;seed++){
    const result=c.v44GenerateLoot({level:4,container,theme:'mixed',quality,rarity:'auto'},seeded(seed));
    assert.ok(result.items.length>=1,`${container}/${quality}/${seed} produced no item`);
    assert.ok(rank[result.items[0].rarity]>=rank[floors[quality]],`${container}/${quality}/${seed} missed ${floors[quality]} floor`);
    assert.ok(rewardCategories.has(result.items[0].category),`${container}/${quality}/${seed} opened with ${result.items[0].category}`);
  }
});

test('royal quality expands item eligibility instead of losing high-rarity rolls',()=>{
  const c=fixture(),rank=Object.fromEntries(c.V44_RARITY_ORDER.map((key,index)=>[key,index]));
  for(let seed=1;seed<=200;seed++){
    const result=c.v44GenerateLoot({level:1,container:'chest',theme:'mixed',quality:'royal',rarity:'auto'},seeded(seed));
    assert.ok(result.items.length>=2,`royal level-one chest ${seed} lost its items`);
    assert.ok(rank[result.items[0].rarity]>=rank.veryRare,`royal level-one chest ${seed} missed veryRare floor`);
  }
});

test('automatic rarity curve is generous without removing level progression',()=>{
  const c=fixture(),rank=Object.fromEntries(c.V44_RARITY_ORDER.map((key,index)=>[key,index]));
  function sample(level,quality){const counts=Array(c.V44_RARITY_ORDER.length).fill(0),rng=seeded(level*100+quality.length);for(let i=0;i<20000;i++)counts[rank[c.v44RollRarity(level,quality,rng)]]++;return counts}
  const low=sample(1,'standard'),mid=sample(4,'standard'),high=sample(10,'standard');
  assert.ok((low[rank.uncommon]+low[rank.rare])/20000>.28);
  assert.ok((mid[rank.rare]+mid[rank.veryRare]+mid[rank.legendary])/20000>.34);
  assert.ok((high[rank.veryRare]+high[rank.legendary]+high[rank.artifact])/20000>.65);
  assert.ok(high[rank.legendary]>mid[rank.legendary]);
});

test('forced rarity remains exact for DM-authored rewards',()=>{
  const c=fixture();
  for(const rarity of c.V44_RARITY_ORDER){
    const result=c.v44GenerateLoot({level:1,container:'chest',theme:'mixed',quality:'standard',rarity},seeded(79));
    assert.ok(result.items.length>=1,`${rarity} forced reward produced no item`);
    assert.ok(result.items.every(item=>item.rarity===rarity),`${rarity} forced reward changed rarity`);
  }
});

test('Build 79 cache key distributes the loot rebalance immediately',()=>{
  const root=path.join(__dirname,'..'),config=fs.readFileSync(path.join(root,'config.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(config,/v44-data\.js/);
  assert.match(config,/\?v=82/);
  assert.match(html,/config\.js\?v=82/);
});
