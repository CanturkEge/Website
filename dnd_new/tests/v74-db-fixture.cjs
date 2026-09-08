/* Local-only Postgres (WASM) fixture. Never connects to Supabase or a DATABASE_URL. */
const fs=require('node:fs'),path=require('node:path'),{randomUUID}=require('node:crypto');
const {PGlite}=require(process.env.V74_PGLITE_MODULE||'@electric-sql/pglite');
const root=path.resolve(__dirname,'..');
const ids={campaign:'00000000-0000-4000-8000-000000000074',dm:'00000000-0000-4000-8000-000000000001',player:'00000000-0000-4000-8000-000000000002',other:'00000000-0000-4000-8000-000000000003',outsider:'00000000-0000-4000-8000-000000000004',cleric:'10000000-0000-4000-8000-000000000002',wizard:'10000000-0000-4000-8000-000000000003',material:'20000000-0000-4000-8000-000000000001'};
function character(id,userId,name,className,extra={}){return {id,userId,name,className,subclass:className==='Cleric'?'Life':'Evocation',level:5,species:'Human',subspecies:'Highborn',approvalStatus:'approved',hp:35,maxHp:35,ac:16,tempHp:0,baseStats:{STR:10,DEX:12,CON:14,INT:16,WIS:18,CHA:12},stats:{STR:10,DEX:12,CON:14,INT:16,WIS:18,CHA:12},autoVitals:false,preparedSpells:['Guiding Bolt','Sacred Flame','Bless'],inventory:[{id:ids.material,name:'Gümüş Tozu',qty:5,equipped:false,statBonuses:{WIS:1}}],resources:{},spellSlotsUsed:{},...extra};}
async function createFixture(){
 const db=new PGlite();
 await db.exec(`create role anon; create role authenticated;
 create table accounts(id uuid primary key,display_name text,username text);
 create table account_sessions_fixture(token text primary key,user_id uuid references accounts(id));
 create table campaigns(id uuid primary key,state jsonb default '{}',updated_at timestamptz default now());
 create table campaign_members(campaign_id uuid references campaigns(id) on delete cascade,user_id uuid references accounts(id),role text,primary key(campaign_id,user_id));
 create table campaign_wallets(campaign_id uuid references campaigns(id),user_id uuid references accounts(id),platinum bigint default 0,gold bigint default 0,silver bigint default 0,copper bigint default 0,updated_at timestamptz default now(),primary key(campaign_id,user_id));
 create function v66_session_user(p_token text) returns uuid language sql security definer set search_path=public as $$select user_id from account_sessions_fixture where token=p_token$$;
 revoke all on function v66_session_user(text) from public,anon,authenticated;`);
 const v31=fs.readFileSync(path.join(root,'v31-update.sql'),'utf8');await db.exec(v31.slice(0,v31.indexOf('create or replace function public.inventory_move_v31')));
 const v69=fs.readFileSync(path.join(root,'v69-update.sql'),'utf8');await db.exec(v69.slice(v69.indexOf('create table if not exists public.campaign_audit_log_v69'),v69.indexOf('create or replace function public.audit_record_v69')));
 await db.exec(fs.readFileSync(path.join(root,'v74-update.sql'),'utf8'));
 for(const [role,name]of [['dm','Dungeon Master'],['player','Oğuzhan'],['other','Ayla'],['outsider','Yabancı']]){await db.query('insert into accounts values($1,$2,$3)',[ids[role],name,role]);await db.query('insert into account_sessions_fixture values($1,$2)',['test-'+role,ids[role]]);}
 await db.query('insert into campaigns(id) values($1)',[ids.campaign]);
 for(const r of ['dm','player','other'])await db.query('insert into campaign_members values($1,$2,$3)',[ids.campaign,ids[r],r==='dm'?'dm':'player']);
 const initial={characters:[character(ids.cleric,ids.player,'Oğuzhan','Cleric'),character(ids.wizard,ids.other,'Ayla','Wizard',{preparedSpells:['Fire Bolt','Magic Missile','Shield','Haste']})],encounter:[{id:'fighter-cleric',characterId:ids.cleric,userId:ids.player,name:'Oğuzhan',hp:35,maxHp:35,ac:16,init:18,turn:true,kind:'player'},{id:'fighter-wizard',characterId:ids.wizard,userId:ids.other,name:'Ayla',hp:35,maxHp:35,ac:13,init:14,turn:false,kind:'player'},{id:'fighter-goblin',name:'Goblin',hp:12,maxHp:12,ac:13,init:12,turn:false,kind:'monster'}],encounterActive:true,encounterRound:1,battleMap:{published:true,cols:12,rows:10,name:'Test Haritası',lighting:'bright',fogEnabled:false,tokens:[{id:'token-cleric',combatantId:'fighter-cleric',kind:'player',x:2,y:2,size:1,speed:30,vision:60,movedFeet:0},{id:'token-wizard',combatantId:'fighter-wizard',kind:'player',x:3,y:2,size:1,speed:30,vision:60,movedFeet:0},{id:'token-goblin',combatantId:'fighter-goblin',kind:'monster',x:6,y:3,size:1,speed:30,movedFeet:0}],props:[],fogCells:[]},market:[{id:'reward-staff',name:'Şafak Asası',qty:1,magicBonus:1,statBonuses:{WIS:1},classRestriction:['Cleric'],shop:'temple',tier:1}],notes:'Korunacak eski not',npcs:[{id:'npc-kept',name:'Han Sahibi',coins:{gp:12}}],groundItems:[],quests:['Eski görev'],worldDate:'2026-09-08'};
 await db.query('update campaigns set state=$1 where id=$2',[initial,ids.campaign]);
 for(const r of ['player','other'])await db.query('insert into campaign_wallets(campaign_id,user_id,gold) values($1,$2,100)',[ids.campaign,ids[r]]);
 const act=async(role,action,payload={},op=randomUUID())=>(await db.query('select tools_action_v74($1,$2,$3,$4) data',['test-'+role,ids.campaign,action,{...payload,opId:op}])).rows[0].data;
 const load=async(role)=>(await db.query('select tools_load_v74($1,$2) data',['test-'+role,ids.campaign])).rows[0].data;
 const state=async()=>(await db.query('select state from campaigns where id=$1',[ids.campaign])).rows[0].state;
 const update=async(value)=>db.query('update campaigns set state=$1,updated_at=now() where id=$2',[value,ids.campaign]);
 return {db,ids,initial,act,load,state,update,close:()=>db.close()};
}
module.exports={createFixture,ids,character};
if(require.main===module)createFixture().then(async f=>{console.log('Build 74 migration compiled on local Postgres');await f.close();}).catch(e=>{console.error(e.message,e.detail||'',e.where||'');process.exitCode=1;});
