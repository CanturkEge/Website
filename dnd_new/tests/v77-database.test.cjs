const {test,before,after,beforeEach}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{randomUUID}=require('node:crypto');
const {createFixture}=require('./v77-db-fixture.cjs');let f;
before(async()=>{f=await createFixture();});after(async()=>{await f?.close();});beforeEach(async()=>{await f.reset();});
const open=()=>f.act('dm','settings_save',{isOpen:true,title:'Altın Zar Kumarhanesi',houseNote:'Masalar hazır.'});
const game=async(kind,role='dm')=>(await f.load(role)).games.find(row=>row.kind===kind);

test('versioned SQL bundle and CLI migration stay identical',()=>{assert.equal(fs.readFileSync(path.join(__dirname,'../v77-update.sql'),'utf8'),fs.readFileSync(path.join(__dirname,'../supabase/migrations/20260909171706_casino_v77.sql'),'utf8'));});
test('hardening migration is narrowly scoped and compiles after the base migration',async()=>{const sql=fs.readFileSync(path.join(__dirname,'../supabase/migrations/20260909180000_casino_v77_hardening.sql'),'utf8');assert.match(sql,/create or replace function public\.casino_action_v77/);assert.doesNotMatch(sql,/create table/i);await f.db.exec(sql);});

test('migration is repeatable and preserves campaign JSON and accounts',async()=>{
 const before=(await f.db.query('select state from campaigns where id=$1',[f.ids.campaign])).rows[0].state;
 await f.db.exec(fs.readFileSync(path.join(__dirname,'../v77-update.sql'),'utf8'));
 assert.deepEqual((await f.db.query('select state from campaigns where id=$1',[f.ids.campaign])).rows[0].state,before);
 assert.equal((await f.db.query('select count(*)::int n from accounts')).rows[0].n,4);
});

test('invalid sessions, outsiders and player management actions are rejected',async()=>{
 await assert.rejects(f.db.query('select casino_load_v77($1,$2)',['bad-token',f.ids.campaign]),/geçersiz/);
 await assert.rejects(f.load('outsider'),/geçersiz/);
 await assert.rejects(f.act('player','settings_save',{isOpen:true,title:'Sızma',houseNote:''}),/Yalnızca DM/);
});

test('RLS tables and internal helpers are private while token RPC is callable by anon',async()=>{
 await f.db.exec('set role anon');
 try{
  await assert.rejects(f.db.query('select * from casino_games_v77'),/permission denied/);
  await assert.rejects(f.db.query("select casino_random_v77(6)"),/permission denied/);
  assert.equal((await f.load('player')).settings.isOpen,false);
 }finally{await f.db.exec('reset role');}
});

test('casino starts closed and DM settings plus editable multipliers are enforced',async()=>{
 const coin=await game('coin_flip');
 await assert.rejects(f.act('player','solo_play',{gameId:coin.id,bet:100,selection:'crown'}),/kapalı/);
 await open();
 await f.act('dm','game_save',{gameId:coin.id,name:'Kraliyet Sikkesi',description:'Yeni masa kuralı',enabled:true,minBet:25,maxBet:2500,config:{winMultiplierBps:22500}});
 const edited=await game('coin_flip');
 assert.equal(edited.name,'Kraliyet Sikkesi');assert.equal(edited.minBet,25);assert.equal(edited.config.winMultiplierBps,22500);
 await assert.rejects(f.act('dm','game_save',{gameId:coin.id,name:'Hatalı',description:'',enabled:true,minBet:1,maxBet:10,config:{winMultiplierBps:999999}}),/çarpanı/);
});

test('solo play settles one atomic wallet change and an operation retry cannot double-charge',async()=>{
 await open();const coin=await game('coin_flip'),op=randomUUID();
 let data=await f.act('player','solo_play',{gameId:coin.id,bet:100,selection:'crown'},op);
 const play=data.history.find(row=>row.operationId===op),afterFirst=Number(await f.wallet('player'));
 assert.ok(play);assert.ok([0,190].includes(play.payout));assert.equal(afterFirst,10000-100+play.payout);
 await f.act('player','solo_play',{gameId:coin.id,bet:100,selection:'crown'},op);
 assert.equal(Number(await f.wallet('player')),afterFirst);
 assert.equal((await f.db.query('select count(*)::int n from casino_plays_v77 where operation_id=$1',[op])).rows[0].n,1);
 await assert.rejects(f.act('player','solo_play',{gameId:coin.id,bet:200,selection:'crown'},op),/başka bir istek/);
});

test('insufficient funds and invalid bets leave wallet and history untouched',async()=>{
 await open();const coin=await game('coin_flip');
 await f.db.query('update campaign_wallets set gold=0,copper=5 where user_id=$1',[f.ids.player]);
 await assert.rejects(f.act('player','solo_play',{gameId:coin.id,bet:10,selection:'blade'}),/yeterli/);
 assert.equal(Number(await f.wallet('player')),5);
 assert.equal((await f.load('player')).history.length,0);
});

test('multiplayer high-roll table requires players and settles the pot minus configured house cut',async()=>{
 await open();const table=await game('high_roll');let data=await f.act('dm','round_open',{gameId:table.id});const round=data.rounds.find(row=>row.status==='open'&&row.gameId===table.id);
 await f.act('player','round_join',{roundId:round.id,bet:100,selection:''});
 await assert.rejects(f.act('dm','round_resolve',{roundId:round.id}),/yeterli oyuncu/);
 await assert.rejects(f.act('player','round_join',{roundId:round.id,bet:100,selection:''}),/zaten bahis/);
 await f.act('other','round_join',{roundId:round.id,bet:100,selection:''});
 data=await f.act('dm','round_resolve',{roundId:round.id});
 const closed=data.rounds.find(row=>row.id===round.id);assert.equal(closed.status,'resolved');assert.equal(closed.result.pot,200);assert.equal(closed.result.houseCut,10);
 assert.equal(Number(await f.wallet('player'))+Number(await f.wallet('other')),19990);
 assert.equal(closed.bets.reduce((sum,row)=>sum+row.payout,0),190);
});

test('open table rules cannot move under placed bets and active sigil choices stay private',async()=>{
 await open();const table=await game('sigil_draw');let data=await f.act('dm','round_open',{gameId:table.id});const round=data.rounds.find(row=>row.status==='open'&&row.gameId===table.id);
 await assert.rejects(f.act('dm','game_save',{gameId:table.id,name:table.name,description:table.description,enabled:true,minBet:table.minBet,maxBet:table.maxBet,config:{...table.config,houseCutBps:2500}}),/Açık masa/);
 await f.act('player','round_join',{roundId:round.id,bet:100,selection:'2'});await f.act('other','round_join',{roundId:round.id,bet:100,selection:'5'});
 const playerRound=(await f.load('player')).rounds.find(row=>row.id===round.id),dmRound=(await f.load('dm')).rounds.find(row=>row.id===round.id);
 assert.equal(playerRound.bets.find(row=>row.userId===f.ids.player).selection.choice,'2');
 assert.deepEqual(playerRound.bets.find(row=>row.userId===f.ids.other).selection,{});
 assert.equal(dmRound.bets.find(row=>row.userId===f.ids.other).selection.choice,'5');
 data=await f.act('dm','round_resolve',{roundId:round.id});assert.equal(data.rounds.find(row=>row.id===round.id).status,'resolved');
 assert.equal((await f.load('player')).rounds.find(row=>row.id===round.id).bets.find(row=>row.userId===f.ids.other).selection.choice,'5');
});

test('cancelling a multiplayer table refunds every pending stake exactly once',async()=>{
 await open();const table=await game('sigil_draw');let data=await f.act('dm','round_open',{gameId:table.id});const round=data.rounds.find(row=>row.status==='open'&&row.gameId===table.id);
 await f.act('player','round_join',{roundId:round.id,bet:350,selection:'2'});await f.act('other','round_join',{roundId:round.id,bet:125,selection:'5'});
 assert.equal(Number(await f.wallet('player')),9650);assert.equal(Number(await f.wallet('other')),9875);
 data=await f.act('dm','round_cancel',{roundId:round.id});
 assert.equal(Number(await f.wallet('player')),10000);assert.equal(Number(await f.wallet('other')),10000);
 assert.ok(data.rounds.find(row=>row.id===round.id).bets.every(row=>row.outcome==='cancelled'));
 await assert.rejects(f.act('dm','round_cancel',{roundId:round.id}),/zaten kapanmış/);
});

test('disabled games disappear for players and cannot be played through a forged RPC call',async()=>{
 await open();const shell=await game('shells');
 await f.act('dm','game_save',{gameId:shell.id,name:shell.name,description:shell.description,enabled:false,minBet:shell.minBet,maxBet:shell.maxBet,config:shell.config});
 assert.equal((await f.load('player')).games.some(row=>row.id===shell.id),false);
 await assert.rejects(f.act('player','solo_play',{gameId:shell.id,bet:100,selection:'1'}),/açık değil/);
});

test('only DM can clear closed casino history and clearing never changes wallets',async()=>{
 await open();const coin=await game('coin_flip');await f.act('player','solo_play',{gameId:coin.id,bet:100,selection:'crown'});const balance=Number(await f.wallet('player'));
 await assert.rejects(f.act('player','history_clear',{}),/yalnız DM/i);
 const data=await f.act('dm','history_clear',{});assert.equal(data.history.length,0);assert.equal(Number(await f.wallet('player')),balance);
});
