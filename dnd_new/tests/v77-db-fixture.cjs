/* Local-only Postgres (WASM) fixture. Never connects to Supabase or a DATABASE_URL. */
const fs=require('node:fs'),path=require('node:path'),{randomUUID}=require('node:crypto');
const {PGlite}=require(process.env.V77_PGLITE_MODULE||'@electric-sql/pglite');
const root=path.resolve(__dirname,'..');
const ids={campaign:'00000000-0000-4000-8000-000000000077',dm:'00000000-0000-4000-8000-000000000001',player:'00000000-0000-4000-8000-000000000002',other:'00000000-0000-4000-8000-000000000003',outsider:'00000000-0000-4000-8000-000000000004'};

async function createFixture(){
 const db=new PGlite();
 await db.exec(`create role anon; create role authenticated;
 create table accounts(id uuid primary key,display_name text,username text);
 create table account_sessions_fixture(token text primary key,user_id uuid references accounts(id));
 create table campaigns(id uuid primary key,state jsonb default '{}',updated_at timestamptz default now());
 create table campaign_members(campaign_id uuid references campaigns(id) on delete cascade,user_id uuid references accounts(id),role text,primary key(campaign_id,user_id));
 create table campaign_wallets(campaign_id uuid references campaigns(id),user_id uuid references accounts(id),platinum integer default 0,gold integer default 0,silver integer default 0,copper integer default 0,updated_at timestamptz default now(),primary key(campaign_id,user_id));
 create table campaign_audit_log_v69(id bigint generated always as identity primary key,campaign_id uuid references campaigns(id),actor_user_id uuid references accounts(id),action text,title text,body text,metadata jsonb,created_at timestamptz default now());
 create function v66_session_user(p_token text) returns uuid language sql security definer set search_path=public as $$select user_id from account_sessions_fixture where token=p_token$$;
 create function audit_insert_v69(p_campaign uuid,p_actor uuid,p_action text,p_title text,p_body text,p_metadata jsonb default '{}'::jsonb) returns void language sql security definer set search_path=public as $$insert into campaign_audit_log_v69(campaign_id,actor_user_id,action,title,body,metadata) values(p_campaign,p_actor,p_action,p_title,p_body,p_metadata)$$;
 revoke all on function v66_session_user(text),audit_insert_v69(uuid,uuid,text,text,text,jsonb) from public,anon,authenticated;`);
 await db.exec(fs.readFileSync(path.join(root,'v77-update.sql'),'utf8'));
 for(const [role,name]of [['dm','Dungeon Master'],['player','Oğuzhan'],['other','Ayla'],['outsider','Yabancı']]){
  await db.query('insert into accounts values($1,$2,$3)',[ids[role],name,role]);
  await db.query('insert into account_sessions_fixture values($1,$2)',['test-'+role,ids[role]]);
 }
 await db.query('insert into campaigns(id,state) values($1,$2)',[ids.campaign,{notes:'Korunacak not',characters:[{id:'hero',userId:ids.player,name:'Oğuzhan'}]}]);
 for(const role of ['dm','player','other'])await db.query('insert into campaign_members values($1,$2,$3)',[ids.campaign,ids[role],role==='dm'?'dm':'player']);
 for(const role of ['player','other'])await db.query('insert into campaign_wallets(campaign_id,user_id,gold) values($1,$2,100)',[ids.campaign,ids[role]]);
 const act=async(role,action,payload={},op=randomUUID())=>(await db.query('select casino_action_v77($1,$2,$3,$4,$5) data',['test-'+role,ids.campaign,action,payload,op])).rows[0].data;
 const load=async(role)=>(await db.query('select casino_load_v77($1,$2) data',['test-'+role,ids.campaign])).rows[0].data;
 const wallet=async(role)=>(await db.query('select platinum::bigint*1000+gold::bigint*100+silver::bigint*10+copper::bigint total from campaign_wallets where campaign_id=$1 and user_id=$2',[ids.campaign,ids[role]])).rows[0].total;
 const reset=async()=>{
  await db.exec('delete from casino_operations_v77;delete from casino_plays_v77;delete from casino_rounds_v77;delete from casino_games_v77;delete from casino_settings_v77;delete from campaign_audit_log_v69;');
  await db.query('update campaign_wallets set platinum=0,gold=100,silver=0,copper=0 where campaign_id=$1',[ids.campaign]);
  await db.query('select casino_seed_v77($1)',[ids.campaign]);
 };
 return {db,ids,act,load,wallet,reset,close:()=>db.close()};
}
module.exports={createFixture,ids};
if(require.main===module)createFixture().then(async f=>{console.log('Build 77 migration compiled on local Postgres');await f.close();}).catch(error=>{console.error(error.message,error.detail||'',error.where||'');process.exitCode=1;});
