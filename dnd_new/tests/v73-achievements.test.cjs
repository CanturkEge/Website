const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const vm=require('node:vm');

const root=path.join(__dirname,'..');

function runtime(role='dm'){
  const listeners={};
  const registered=[];
  const context={
    console,Intl,Date,Map,
    current:{id:'campaign-1',role},auth:{id:'dm-1',sessionToken:'token'},
    members:[{userId:'player-1',name:'Ayla',role:'player'},{userId:'player-2',name:'Bora',role:'player'}],
    dmNav:[['dashboard','⌂','Masa'],['guide','⌕','Rehber']],
    playerNav:[['dashboard','⌂','Karakterim'],['guide','⌕','Rehber']],
    dmPages:{},playerPages:{},page:'achievements',
    db:{rpc:async()=>({data:[],error:null})},
    esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),
    toast(){},alert(){},confirm(){return true},render(){},
    queueMicrotask(){},setInterval(){},
    document:{addEventListener(type,fn){listeners[type]=fn},querySelector(){return null},querySelectorAll(){return[]}},
  };
  context.window={kadimUiState:{registerPage(name,roots){registered.push([name,roots])},safeUpdate(_node,fn){return fn()},markDirty(){},clearWithin(){}}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root,'v73.js'),'utf8'),context,{filename:'v73.js'});
  return {context,listeners,registered};
}

test('Başarımlar iki role de menü ve sayfa ekler',()=>{
  const {context,registered}=runtime();
  assert.equal(context.dmNav.find(row=>row[0]==='achievements')[2],'Başarımlar');
  assert.equal(context.playerNav.find(row=>row[0]==='achievements')[2],'Başarımlar');
  assert.equal(typeof context.dmPages.achievements,'function');
  assert.equal(typeof context.playerPages.achievements,'function');
  assert.equal(JSON.stringify(registered),JSON.stringify([['achievements',[]]]));
});

test('DM formu çoklu oyuncu seçimi ve mekanik etkisizlik açıklaması taşır',()=>{
  const {context}=runtime('dm');
  const html=context.dmPages.achievements();
  assert.match(html,/Başarım Ver/);
  assert.match(html,/data-v73-achievement-player="player-1"/);
  assert.match(html,/data-v73-achievement-player="player-2"/);
  assert.match(html,/mekanik bonus eklemez/);
});

test('Oyuncu yalnız arşiv görünümünü alır, DM formunu almaz',()=>{
  const {context}=runtime('player');
  const html=context.playerPages.achievements();
  assert.match(html,/Başarımlarım/);
  assert.doesNotMatch(html,/id="v73GrantAchievement"/);
});

test('Başarılı yenileme eski yükleme hatasını ekrandan kaldırır',async()=>{
  const {context}=runtime('player'),list={innerHTML:''},total={textContent:''};
  context.document.querySelector=selector=>selector==='#v73AchievementList'?list:selector==='.v73-achievement-hero>b'?total:null;
  vm.runInContext("v73AchievementsCampaign='campaign-1';v73AchievementsError='Geçici hata';v73Achievements=[]",context);
  await context.v73LoadAchievements(true);
  assert.doesNotMatch(list.innerHTML,/Geçici hata/);
  assert.match(list.innerHTML,/İlk hatıra henüz yazılmadı/);
});

test('SQL rol ayrımı, RLS ve doğrudan tablo erişim engeli içerir',()=>{
  const sql=fs.readFileSync(path.join(root,'v73-update.sql'),'utf8');
  assert.match(sql,/enable row level security/i);
  assert.match(sql,/member_role='dm' or a\.player_user_id=uid/);
  assert.match(sql,/cm\.role='dm'/);
  assert.match(sql,/cm\.role='player' and cm\.user_id=any\(target_ids\)/);
  assert.match(sql,/revoke all on table public\.campaign_achievements_v73 from public,anon,authenticated/i);
  assert.doesNotMatch(sql,/update public\.campaigns set state/i);
});

test('Build 73 dosyaları cache zincirine eklenmiştir',()=>{
  const config=fs.readFileSync(path.join(root,'config.js'),'utf8');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(config,/'v73\.css'/);
  assert.match(config,/'v73\.js'/);
  assert.doesNotMatch(config,/\?v=72/);
  assert.doesNotMatch(index,/\?v=72/);
});
