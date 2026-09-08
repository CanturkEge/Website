/* Isolated manual/browser fixture: localhost, synthetic data, production assets and real v74 SQL. */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {createFixture,ids}=require('./v74-db-fixture.cjs');const root=path.resolve(__dirname,'..');
(async()=>{const f=await createFixture();
 const members=[{userId:ids.dm,name:'Dungeon Master',role:'dm'},{userId:ids.player,name:'Oğuzhan',role:'player'},{userId:ids.other,name:'Ayla',role:'player'}];
 async function rpc(name,args,role){
  if(name==='fixture_boot')return {auth:{id:ids[role],name:members.find(m=>m.userId===ids[role])?.name,sessionToken:'test-'+role},campaign:{id:ids.campaign,name:'Build 74 Deneme Masası',code:'TEST74',role:role==='dm'?'dm':'player'},state:await f.state(),members};
  if(name==='tools_load_v74')return (await f.db.query('select tools_load_v74($1,$2) data',[args.p_session_token,args.p_campaign])).rows[0].data;
  if(name==='tools_action_v74')return (await f.db.query('select tools_action_v74($1,$2,$3,$4) data',[args.p_session_token,args.p_campaign,args.p_action,args.p_payload])).rows[0].data;
  if(name==='campaign_save_v31')return (await f.db.query('select campaign_save_v31($1,$2,$3,$4) data',[args.p_user,args.p_campaign,args.p_base,args.p_state])).rows[0].data;
  if(name==='campaign_load_v2')return [{id:ids.campaign,name:'Build 74 Deneme Masası',code:'TEST74',role:args.p_user===ids.dm?'dm':'player',state:await f.state(),members}];
  if(/wallet.*list|wallets|wallet_list/.test(name))return (await f.db.query('select * from campaign_wallets')).rows;
  return [];
 }
 const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://localhost');try{
  if(req.method==='POST'&&url.pathname==='/rpc'){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>2000000)throw Error('Payload too large');}const {name,args,role}=JSON.parse(raw);let response;try{response={data:await rpc(name,args,role),error:null};}catch(e){response={data:null,error:{message:e.message}};}res.setHeader('Content-Type','application/json');res.end(JSON.stringify(response));return;}
  if(url.pathname==='/'){res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html><head><meta charset="utf-8"><title>Build 74 · Browser fixture</title><style>body{margin:0;background:#39332b;color:#fff;font:16px system-ui}header{padding:12px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}button,select{font:inherit;padding:9px}iframe{display:block;border:0;height:calc(100vh - 68px);background:#18100b;margin:0 auto;width:390px;max-width:100%}</style></head><body><header><b>Build 74 · İzole test</b><label>Ekran <select id="width"><option value="390">Telefon 390px</option><option value="320">Telefon 320px</option><option value="768">Tablet 768px</option><option value="1366">Masaüstü 1366px</option></select></label><button data-role="dm">DM görünümü</button><button data-role="player">Oğuzhan görünümü</button><button data-role="other">Ayla görünümü</button></header><iframe title="Kadim Masa test uygulaması" id="fixture-frame" src="/app?role=player"></iframe><script>document.querySelector('#width').onchange=e=>document.querySelector('iframe').style.width=e.target.value+'px';document.querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>document.querySelector('iframe').src='/app?role='+b.dataset.role);</script></body></html>`);return;}
  const filename=url.pathname==='/app'?'index.html':decodeURIComponent(url.pathname.slice(1));const full=path.resolve(root,filename);if(!full.startsWith(root+path.sep))throw Error('Invalid path');let content=fs.readFileSync(full);
  if(filename==='index.html')content=content.toString().replace(/<script src="https:\/\/cdn\.jsdelivr\.net[^\"]*"><\/script>/g,'').replace('<script src="config.js','<script src="/tests/v74-fixture-bootstrap.js"></script><script src="config.js');
  if(filename==='config.js')content=content.toString().replace("'v74-combat.js'","'v74-combat.js','tests/v74-fixture-client.js'");
  res.setHeader('Content-Type',filename.endsWith('.js')?'text/javascript':filename.endsWith('.css')?'text/css':filename.endsWith('.html')?'text/html':filename.endsWith('.svg')?'image/svg+xml':'text/plain');res.setHeader('Cache-Control','no-store');res.end(content);
 }catch(e){res.statusCode=404;res.end(e.message);}});
 server.listen(Number(process.env.PORT)||4173,'0.0.0.0',()=>console.log('Synthetic Build 74 fixture ready on http://0.0.0.0:4173/; no production connections.'));
})();
