/* Local-only PostgreSQL/WASM checks; never connects to production. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {PGlite}=require(process.env.V83_PGLITE_MODULE||'@electric-sql/pglite');
const root=path.join(__dirname,'..');
const ids={campaign:'00000000-0000-4000-8000-000000000083',dm:'00000000-0000-4000-8000-000000000001',player:'00000000-0000-4000-8000-000000000002',outsider:'00000000-0000-4000-8000-000000000003'};
let db;
test.before(async()=>{
 db=new PGlite();
 await db.exec(`create role anon;create role authenticated;
 create table accounts(id uuid primary key,display_name text);
 create table sessions(token text primary key,user_id uuid references accounts(id));
 create table campaigns(id uuid primary key,state jsonb not null default '{}',updated_at timestamptz default now());
 create table campaign_members(campaign_id uuid references campaigns(id) on delete cascade,user_id uuid references accounts(id),role text,primary key(campaign_id,user_id));
 create function v66_session_user(p_token text) returns uuid language sql security definer set search_path=public as $$select user_id from sessions where token=p_token$$;`);
 for(const [key,name] of [['dm','DM'],['player','Oyuncu'],['outsider','Yabancı']]){await db.query('insert into accounts values($1,$2)',[ids[key],name]);await db.query('insert into sessions values($1,$2)',['test-'+key,ids[key]])}
 const state={characters:[{id:'hero',userId:ids.player,name:'Mira',level:3,stats:{WIS:12},classSkillChoices:[]}],v80:{bastion:{name:'Kule'},factions:[],worldEvents:[],pets:[],traps:[{id:'trap-1',name:'Gizli Tel',dc:15,trigger:'Kapı',disarm:'Makas',dmNote:'Sır',armed:true,revealed:false}],notebooks:{dm:{title:'DM Sırrı',pages:[{id:'d1',title:'Plan',body:'Ejderha'}]},players:{[ids.player]:{title:'Mira Defteri',pages:[{id:'p1',title:'İpucu',body:'Kuzey'}]}}}}};
 await db.query('insert into campaigns values($1,$2,now())',[ids.campaign,state]);
 await db.query('insert into campaign_members values($1,$2,$3),($1,$4,$5)',[ids.campaign,ids.dm,'dm',ids.player,'player']);
 await db.exec(fs.readFileSync(path.join(root,'v83-update.sql'),'utf8'));
});
test.after(async()=>db?.close());
test('migration compiles, moves private legacy data and scrubs shared campaign JSON',async()=>{
 const c=(await db.query('select state from campaigns where id=$1',[ids.campaign])).rows[0].state;
 assert.equal(c.v80.traps,undefined);assert.equal(c.v80.notebooks,undefined);assert.equal(c.v80.bastion.name,'Kule');
 const s=(await db.query('select private_data from campaign_systems_v83 where campaign_id=$1',[ids.campaign])).rows[0].private_data;
 assert.equal(s.traps[0].trigger,'Kapı');assert.equal(s.dmNotebook.title,'DM Sırrı');
});
test('role-filtered loader hides undetected trap details and isolates player notebook',async()=>{
 const dm=(await db.query('select campaign_systems_load_v83($1,$2) data',['test-dm',ids.campaign])).rows[0].data;
 assert.equal(dm.private.traps[0].dmNote,'Sır');assert.equal(dm.private.dmNotebook.title,'DM Sırrı');
 const player=(await db.query('select campaign_systems_load_v83($1,$2) data',['test-player',ids.campaign])).rows[0].data;
 assert.equal(player.passivePerception,11);assert.deepEqual(player.private.traps,[]);assert.equal(player.private.dmNotebook,undefined);assert.equal(player.notebook.title,'Mira Defteri');
});
test('players cannot save DM systems, outsiders cannot load and stale state is scrubbed',async()=>{
 await assert.rejects(db.query("select campaign_systems_save_v83($1,$2,'{}'::jsonb,'{}'::jsonb)",['test-player',ids.campaign]),/Yalnız kampanya DM/);
 await assert.rejects(db.query('select campaign_systems_load_v83($1,$2)',['test-outsider',ids.campaign]),/Kampanya üyeliği/);
 await db.query("update campaigns set state=jsonb_set(jsonb_set(state,'{v80,traps}','[1]'::jsonb,true),'{v80,notebooks}','{}'::jsonb,true) where id=$1",[ids.campaign]);
 const c=(await db.query('select state from campaigns where id=$1',[ids.campaign])).rows[0].state;
 assert.equal(c.v80.traps,undefined);assert.equal(c.v80.notebooks,undefined);
});
