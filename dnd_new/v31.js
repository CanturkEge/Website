/* v31: reliability/performance patch. Security/auth behavior is intentionally unchanged. */
const V31_VERSION='31.0';
const v31Clone=value=>value==null?value:(globalThis.structuredClone?structuredClone(value):JSON.parse(JSON.stringify(value)));
const v31Object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function v31Equal(a,b){
  if(Object.is(a,b))return true;
  if(Array.isArray(a)||Array.isArray(b))return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((value,index)=>v31Equal(value,b[index]));
  if(v31Object(a)||v31Object(b)){
    if(!v31Object(a)||!v31Object(b))return false;
    let aKeys=Object.keys(a),bKeys=Object.keys(b);
    return aKeys.length===bKeys.length&&aKeys.every(key=>Object.hasOwn(b,key)&&v31Equal(a[key],b[key]));
  }
  return false;
}

function v31ItemKey(item={},scope='inventory'){
  if(scope==='ground')return String(item.groundId||item.id||'');
  return String(item.id||item.groundId||'');
}
window.v31ItemKey=v31ItemKey;

function v31EnsureId(item,key='id'){
  if(!v31Object(item))return false;
  if(item[key])return false;
  item[key]=uid();
  return true;
}
function v31NormalizeList(list,key='id'){
  let changed=false,seen=new Set();
  for(let item of list||[]){
    if(!v31Object(item))continue;
    changed=v31EnsureId(item,key)||changed;
    let value=String(item[key]||'');
    if(value&&seen.has(value)){item[key]=uid();value=String(item[key]);changed=true}
    if(value)seen.add(value);
  }
  return changed;
}
function v31NormalizeIds(target=state){
  if(!target)return false;
  let changed=false;
  for(let key of ['characters','npcs','encounter','encounterTemplates','customMonsters','market']){
    changed=v31NormalizeList(target[key])||changed;
  }
  for(let c of target.characters||[]){
    c.inventory??=[];
    changed=v31NormalizeList(c.inventory)||changed;
  }
  target.guildInventory??=[];
  changed=v31NormalizeList(target.guildInventory)||changed;
  target.groundLoot??=[];
  changed=v31NormalizeList(target.groundLoot)||changed;
  changed=v31NormalizeList(target.groundLoot,'groundId')||changed;
  return changed;
}

function v31StableArray(list){
  return Array.isArray(list)&&list.every(x=>v31Object(x)&&v31ItemKey(x));
}
function v31Merge(base,local,remote){
  if(v31Equal(local,base))return v31Clone(remote);
  if(v31Equal(remote,base)||v31Equal(local,remote))return v31Clone(local);
  if(v31Object(local)&&v31Object(remote)&&v31Object(base)){
    let out={},keys=new Set([...Object.keys(base),...Object.keys(local),...Object.keys(remote)]);
    for(let key of keys){
      let bh=Object.hasOwn(base,key),lh=Object.hasOwn(local,key),rh=Object.hasOwn(remote,key);
      let localSame=lh===bh&&(!lh||v31Equal(local[key],base[key]));
      let remoteSame=rh===bh&&(!rh||v31Equal(remote[key],base[key]));
      if(localSame){if(rh)out[key]=v31Clone(remote[key]);continue}
      if(remoteSame){if(lh)out[key]=v31Clone(local[key]);continue}
      if(lh&&rh)out[key]=v31Merge(bh?base[key]:undefined,local[key],remote[key]);
      else if(lh)out[key]=v31Clone(local[key]);
    }
    return out;
  }
  if(v31StableArray(local)&&v31StableArray(remote)&&v31StableArray(base)){
    let b=new Map(base.map(x=>[v31ItemKey(x),x])),l=new Map(local.map(x=>[v31ItemKey(x),x])),r=new Map(remote.map(x=>[v31ItemKey(x),x])),out=[];
    for(let item of local){
      let key=v31ItemKey(item),baseItem=b.get(key),remoteItem=r.get(key);
      if(baseItem&&!remoteItem){if(!v31Equal(item,baseItem))out.push(v31Clone(item));continue}
      out.push(remoteItem?v31Merge(baseItem,item,remoteItem):v31Clone(item));
    }
    for(let item of remote){let key=v31ItemKey(item);if(!l.has(key)&&!b.has(key))out.push(v31Clone(item))}
    return out;
  }
  return v31Clone(local);
}

let v31Baseline=current?v31Clone(state):null;
let v31BaselineCampaign=current?.id||null;
let v31PendingSave=null;
let v31SaveChain=Promise.resolve();
let v31Revision=0;
let v31SaveFailed=false;
let v31SaveActive=false;
let v31RetryDelay=2500;
let v31Adopting=false;

function v31MissingRpc(error){return /campaign_save_v31|schema cache|could not find the function/i.test(error?.message||'')}
async function v31CompatibilitySave(job,base){
  let loaded=await db.rpc('campaign_load_v2',{p_user:auth.id,p_campaign:job.campaignId});
  if(loaded.error||!loaded.data?.[0])throw loaded.error||new Error('Kampanya birleştirme için yüklenemedi');
  let merged=v31Merge(base,job.snapshot,normalized(loaded.data[0].state));
  let saved=await db.rpc('campaign_save_v2',{p_user:auth.id,p_campaign:job.campaignId,p_state:merged});
  if(saved.error||!saved.data)throw saved.error||new Error('Uyumluluk kaydı başarısız');
  toast('v31 SQL eksik: uyumluluk kaydı kullanıldı',true);
  return merged;
}
async function v31Commit(job){
  let base=v31BaselineCampaign===job.campaignId&&v31Baseline?v31Clone(v31Baseline):v31Clone(job.base||{});
  let result=await db.rpc('campaign_save_v31',{p_user:auth.id,p_campaign:job.campaignId,p_base:base,p_state:job.snapshot});
  let merged;
  if(result.error&&v31MissingRpc(result.error))merged=await v31CompatibilitySave(job,base);
  else{
    if(result.error||result.data==null)throw result.error||new Error('Kampanya kaydedilemedi');
    merged=result.data;
  }
  v31Baseline=v31Clone(merged);
  v31BaselineCampaign=job.campaignId;
  v31SaveFailed=false;
  v31RetryDelay=2500;
  if(current?.id===job.campaignId){
    let before=JSON.stringify(state);
    state=normalized(v31Merge(base,state,merged));
    v31NormalizeIds(state);
    if(typeof prEnsure==='function')prEnsure();
    let hasDerivedChanges=!v31Equal(state,merged);
    if(v31PendingSave?.campaignId===job.campaignId)v31PendingSave.snapshot=v31Clone(state);
    let active=document.activeElement,draft=active&&/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)&&!active.disabled;
    if(!draft&&JSON.stringify(state)!==before&&page!=='guide')render();
    toast('Buluta kaydedildi');
    if(realtimeChannel&&realtimeCampaignId===job.campaignId)await realtimeChannel.send({type:'broadcast',event:'campaign-changed',payload:{campaignId:job.campaignId,at:Date.now()}});
    if(hasDerivedChanges&&!v31PendingSave&&current.role==='dm')save();
  }
  return true;
}
function v31QueuePending(){
  if(!v31PendingSave)return v31SaveChain;
  let job=v31PendingSave;
  v31PendingSave=null;
  clearTimeout(saveTimer);
  v31SaveChain=v31SaveChain.then(async()=>{v31SaveActive=true;try{return await v31Commit(job)}finally{v31SaveActive=false}}).catch(error=>{
    v31SaveFailed=true;
    if(current?.id===job.campaignId&&current.role==='dm'){
      v31PendingSave={campaignId:job.campaignId,revision:v31Revision,snapshot:v31Clone(state),base:v31Clone(v31Baseline||job.base||{})};
      clearTimeout(saveTimer);
      saveTimer=setTimeout(v31QueuePending,v31RetryDelay);
      v31RetryDelay=Math.min(30000,v31RetryDelay*2);
    }
    toast('Kayıt hatası — otomatik tekrar denenecek',true);
    console.error('Kadim v31 save:',error);
    return false;
  });
  return v31SaveChain;
}
async function flushSave(){
  clearTimeout(saveTimer);
  /* A switch/logout is also an explicit retry after a transient failure. */
  if(v31PendingSave&&v31SaveFailed){
    v31SaveFailed=false;
    await v31QueuePending();
  }
  for(let i=0;i<3&&v31PendingSave&&!v31SaveFailed;i++){
    await v31QueuePending();
  }
  await v31SaveChain;
  return !v31SaveFailed;
}
window.flushSave=flushSave;

clearTimeout(saveTimer);
save=function(){
  if(!current||current.role!=='dm')return Promise.resolve(false);
  v31NormalizeIds(state);
  v31Revision++;
  v31PendingSave={campaignId:current.id,revision:v31Revision,snapshot:v31Clone(state),base:v31Clone(v31Baseline||state)};
  v31SaveFailed=false;
  clearTimeout(saveTimer);
  saveTimer=setTimeout(v31QueuePending,350);
  toast('Kaydediliyor');
  return v31SaveChain;
};

function v31ResetCampaignCaches(){
  if(typeof prDiceRows!=='undefined')prDiceRows=[];
  if(typeof prDiceCampaign!=='undefined')prDiceCampaign=null;
  if(typeof prDiceLoading!=='undefined')prDiceLoading=false;
  if(typeof sessionMessages!=='undefined')sessionMessages=[];
  if(typeof sessionNotifications!=='undefined')sessionNotifications=[];
  if(typeof sessionLoadedRoom!=='undefined')sessionLoadedRoom=null;
  if(typeof sessionNotificationRoom!=='undefined')sessionNotificationRoom=null;
  if(typeof sessionLoading!=='undefined')sessionLoading=false;
  if(typeof sessionNotificationLoading!=='undefined')sessionNotificationLoading=false;
  if(typeof sessionUnread!=='undefined')sessionUnread=0;
  if(typeof exWalletRows!=='undefined')exWalletRows=[];
  if(typeof exGuildWallet!=='undefined')exGuildWallet=null;
  if(typeof exWalletCampaign!=='undefined')exWalletCampaign=null;
  if(typeof exWalletLoading!=='undefined')exWalletLoading=false;
  if(typeof v27MonsterCategory!=='undefined')v27MonsterCategory='all';
  if(typeof v27MonsterCr!=='undefined')v27MonsterCr='all';
  if(typeof v27MonsterQuery!=='undefined')v27MonsterQuery='';
  if(typeof v271OpenDetails!=='undefined')v271OpenDetails.clear();
  if(typeof v271ScrollState!=='undefined')v271ScrollState.clear();
  window.kadimSyncQueued=false;
}

function v31AdoptLoadedCampaign(){
  if(!current||v31Adopting)return;
  v31Adopting=true;
  v31Baseline=v31Clone(state);
  v31BaselineCampaign=current.id;
  let before=JSON.stringify(state);
  v31NormalizeIds(state);
  if(typeof prEnsure==='function')prEnsure();
  let changed=JSON.stringify(state)!==before;
  v31Adopting=false;
  if(changed&&current.role==='dm')save();
}

const v31RenderBase=render;
render=function(){
  if(current&&v31BaselineCampaign!==current.id){
    if(typeof v271OpenDetails!=='undefined')v271OpenDetails.clear();
    if(typeof v271ScrollState!=='undefined')v271ScrollState.clear();
    if(typeof v271RenderedPage!=='undefined')v271RenderedPage='__campaign_switch__';
    let oldView=$('#view');if(oldView)oldView.innerHTML='';
    v31AdoptLoadedCampaign();
  }
  return v31RenderBase();
};
const v31LoadBase=loadCampaign;
loadCampaign=async function(id){
  if(current?.id&&current.id!==id&&!(await flushSave()))return alert('Kayıt tamamlanamadı; kampanya değiştirilmedi. Bağlantıyı kontrol edip tekrar dene.');
  v31ResetCampaignCaches();
  v31Baseline=null;
  v31BaselineCampaign=null;
  await v31LoadBase(id);
  if(current?.id===id&&v31BaselineCampaign!==id)v31AdoptLoadedCampaign();
  window.scrollTo?.(0,0);let aside=document.querySelector('aside');if(aside)aside.scrollTop=0;
};
const v31SyncBase=syncFromServer;
syncFromServer=async function(showStatus=false){
  if(document.hidden&&!showStatus)return;
  if(syncLoading||!current)return;
  let active=document.activeElement,draft=active&&/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)&&!active.disabled;
  if(draft)return v31SyncBase(showStatus);
  if(current.role==='dm'&&!(await flushSave()))return toast('Bulut eşitleme bekletildi; yerel kayıt korunuyor',true);
  let campaignId=current.id;
  await v31SyncBase(showStatus);
  if(current?.id!==campaignId)return;
  v31Baseline=v31Clone(state);
  v31BaselineCampaign=campaignId;
  let before=JSON.stringify(state);
  v31NormalizeIds(state);
  if(typeof prEnsure==='function')prEnsure();
  if(current.role==='dm'&&JSON.stringify(state)!==before)save();
};
const v31LobbyBase=showLobby;
showLobby=async function(){
  if(!(await flushSave()))return alert('Kayıt tamamlanamadı; salon ekranına geçilmedi. Bağlantıyı kontrol edip tekrar dene.');
  v31ResetCampaignCaches();
  v31Baseline=null;
  v31BaselineCampaign=null;
  return v31LobbyBase();
};

$('#homeLink').onclick=async e=>{e.preventDefault();await showLobby()};
$('#logoutBtn').onclick=async()=>{if(!(await flushSave()))return alert('Kayıt tamamlanamadığı için çıkış durduruldu. Bağlantıyı kontrol edip tekrar dene.');localStorage.removeItem('kadim-auth');location.reload()};
document.addEventListener('visibilitychange',()=>{if(document.hidden)flushSave();else if(current)syncFromServer(false)});
window.addEventListener('pagehide',()=>{flushSave()});
window.addEventListener('beforeunload',event=>{if(v31PendingSave||v31SaveActive||v31SaveFailed){event.preventDefault();event.returnValue=''}});

/* Rules reliability: ASI budget, armor metadata/proficiency and AC formulas. */
Object.assign(V25_ARMOR,{
  'ex-mithral-shirt':{slot:'armor',armorType:'medium',armorBase:13},
  'ex-adamantine-plate':{slot:'armor',armorType:'heavy',armorBase:18,strRequirement:15,stealthDisadvantage:true},
  'ex-armor-resistance':{slot:'armor',armorType:'heavy',armorBase:18,acBonus:1,strRequirement:15,stealthDisadvantage:true},
  'ex-cloak-protection':{slot:'wondrous',acBonus:1,saveBonus:1},
  'ex-armor-martyr':{slot:'wondrous',acBonus:1},
  'ex-robe-stars':{slot:'wondrous',saveBonus:1}
});

prLevelBonus=function(c){
  v30Build(c);
  let remaining=Math.max(0,v30AsiCount(c)*2-(c.feats||[]).length*2),out=Object.fromEntries(PR_ABILITIES.map(k=>[k,0]));
  for(let key of PR_ABILITIES){let requested=Math.max(0,Math.trunc(+c.asiAllocations?.[key]||0)),applied=Math.min(requested,remaining);out[key]=applied;remaining-=applied}
  return out;
};

function v31ArmorAccess(c){
  let access=new Set();
  let base={Barbarian:['light','medium','shield'],Bard:['light'],Cleric:['light','medium','shield'],Druid:['light','medium','shield'],Fighter:['light','medium','heavy','shield'],Monk:[],Paladin:['light','medium','heavy','shield'],Ranger:['light','medium','shield'],Rogue:['light'],Sorcerer:[],Warlock:['light'],Wizard:[],Artificer:['light','medium','shield']}[c.className]||[];
  base.forEach(x=>access.add(x));
  if(c.className==='Cleric'&&['Life','Nature','Tempest','War','Forge','Order','Twilight'].includes(c.subclass))access.add('heavy');
  if(c.className==='Bard'&&['Valor','Swords'].includes(c.subclass))access.add('medium');
  if(c.className==='Bard'&&c.subclass==='Valor')access.add('shield');
  if(c.className==='Warlock'&&c.subclass==='Hexblade'){access.add('medium');access.add('shield')}
  if(c.subspecies==='Mountain Dwarf'||c.subspecies==='Githyanki'){access.add('light');access.add('medium')}
  if(c.subspecies==='Hobgoblin')access.add('light');
  return access;
}
function v31EquipProblem(c,item){
  v25HydrateItem(item);
  if(item.equipped)return '';
  let slot=item.slot||(item.armorBase!=null?'armor':''),access=v31ArmorAccess(c);
  if(slot==='armor'&&c.species==='Tortle')return 'Tortle 2014 doğal kabuğu nedeniyle zırh giyemez; kalkan kullanabilir.';
  if(slot==='armor'&&item.armorType&&!access.has(item.armorType))return `${c.className}, ${item.armorType} zırhta proficient değil. Uygulama sessizce yanlış attack/save/spell hesabı üretmemek için kuşanmayı durdurdu.`;
  if(slot==='shield'&&!access.has('shield'))return `${c.className} kalkan proficiency sahibi değil. Kalkan kuşanmak class özelliklerini ve büyü kullanımını bozabilir.`;
  return '';
}
window.v31ToggleEquip=async function(button,index){
  let c=myChar(),item=c?.inventory?.[index];
  if(!item)return;
  let problem=v31EquipProblem(c,item);
  if(problem)return alert(problem);
  button.disabled=true;
  let {error}=await db.rpc('inventory_equip_v31',{p_user:auth.id,p_campaign:current.id,p_item_index:index,p_expected_id:v31ItemKey(item),p_expected_name:item.name||''});
  if(error){button.disabled=false;return alert(error.message+'\n\nv31-update.sql dosyasını çalıştırdığından emin ol.')}
  await syncFromServer(true);
  let now=myChar()?.inventory?.find(x=>v31ItemKey(x)===v31ItemKey(item));
  if(now?.equipped&&now.strRequirement&&prStats(myChar()).STR<now.strRequirement)toast(`Kuşanıldı; STR ${now.strRequirement} altı olduğu için hız -10 ft`,true);
};
window.v31TrashItem=async function(button,index){
  let item=myChar()?.inventory?.[index];
  if(!item||!confirm(`${item.name} kalıcı olarak çöpe atılsın mı?`))return;
  button.disabled=true;
  let {error}=await db.rpc('inventory_delete_v31',{p_user:auth.id,p_campaign:current.id,p_item_index:index,p_expected_id:v31ItemKey(item),p_expected_name:item.name||''});
  if(error){button.disabled=false;return alert(error.message+'\n\nv31-update.sql dosyasını çalıştırdığından emin ol.')}
  await syncFromServer(true);
};

prAutoAC=function(c){
  let s=prStats(c),dex=prMod(s.DEX),con=prMod(s.CON),wis=prMod(s.WIS),items=v25Equipped(c),armor=items.find(x=>x.slot==='armor'||x.armorBase!=null),shield=items.find(x=>x.slot==='shield'),base;
  if(c.species==='Tortle')base=17;
  else if(armor){
    base=Number(armor.armorBase)||10;
    if(armor.armorType==='light')base+=dex;
    else if(armor.armorType==='medium')base+=Math.min(2,dex);
    base+=Number(armor.acBonus)||0;
  }else{
    let mode=PR_AC_BASE[c.className]??10;
    if(mode==='unarmored-con')base=10+dex+con;
    else if(mode==='unarmored-wis')base=shield?10+dex:10+dex+wis;
    else if(mode===14)base=12+Math.min(2,dex);
    else if(mode===12)base=11+dex;
    else if(mode===10)base=10+dex;
    else base=+mode||10;
  }
  let shieldBonus=shield?(Number(shield.acBonus)||2):0;
  let other=items.filter(x=>x!==armor&&x!==shield&&x.slot!=='armor'&&x.slot!=='shield').reduce((sum,x)=>sum+(Number(x.acBonus)||0),0);
  return base+shieldBonus+other;
};
function v31EquipmentSaveBonus(c){return v25Equipped(c).reduce((sum,item)=>sum+(Number(item.saveBonus)||0),0)}
const v31SkillBonusBase=v25SkillBonus;
v25SkillBonus=function(c,name){let bonus=v31SkillBonusBase(c,name);return name?.includes('Saving Throw')?bonus+v31EquipmentSaveBonus(c):bonus};
prStatGrid=function(c,dm=false){let stats=prStats(c),sp=prSpecies(c.species).bonus,lv=prLevelBonus(c),cl=prClass(c.className),itemSave=v31EquipmentSaveBonus(c);return `<div class="pr-statgrid">${PR_ABILITIES.map(k=>{let mod=prMod(stats[k]),saveBonus=mod+(cl.saves.includes(k)?prProf(c.level):0)+itemSave;return `<article><b>${k}</b><strong>${stats[k]}</strong><span>${prSigned(mod)} mod • ${prSigned(saveBonus)} save</span><small>Temel ${c.baseStats?.[k]??10}${sp[k]?` + species ${sp[k]}`:''}${lv[k]?` + ASI ${lv[k]}`:''}${c.statOverrides?.[k]?` + DM ${c.statOverrides[k]}`:''}${itemSave?` + eşya save ${itemSave}`:''}</small>${dm?`<button class="ghost" data-pr-stat="${c.id}|${k}">DM ±</button>`:''}</article>`}).join('')}</div>`};

/* One combat source of truth for linked player characters. */
window.v31SyncCharacterFromEncounter=function(fighter,parts={hp:true}){
  if(!fighter?.characterId)return;
  let c=state.characters.find(x=>x.id===fighter.characterId);
  if(!c)return;
  if(parts.hp)c.hp=Math.max(0,Math.min(+c.maxHp||Number.MAX_SAFE_INTEGER,+fighter.hp||0));
  if(parts.effects)c.effects=(fighter.effects||[]).map(x=>typeof x==='string'?x:x?.name).filter(Boolean);
};
window.v31SyncEncounterFromCharacter=function(c,parts={hp:true}){
  if(!c)return;
  for(let fighter of state.encounter||[]){
    if(fighter.characterId!==c.id)continue;
    fighter.name=c.name;
    fighter.ac=c.ac;
    fighter.maxHp=c.maxHp;
    if(parts.hp)fighter.hp=Math.max(0,Math.min(+c.maxHp||Number.MAX_SAFE_INTEGER,+c.hp||0));
    if(parts.effects){
      let old=new Map((fighter.effects||[]).map(x=>[typeof x==='string'?x:x?.name,x]));
      fighter.effects=(c.effects||[]).map(x=>{let name=typeof x==='string'?x:x?.name;return old.get(name)||name}).filter(Boolean);
    }
  }
};
const v31EnsureBase=prEnsure;
prEnsure=function(){
  v31NormalizeIds(state);
  v31EnsureBase();
  for(let c of state.characters||[])window.v31SyncEncounterFromCharacter(c,{hp:true,effects:true});
};

/* Avoid rebinding the entire page whenever bestiary filters change. */
window.v31BindMonsterCards=function(){
  document.querySelectorAll('#monsterList [data-spawn]').forEach(button=>button.onclick=()=>{let m=allMonsters().find(x=>x.id===button.dataset.spawn);if(!m)return;state.encounter.push({...m,id:uid(),init:0,turn:!state.encounter.length});save();toast(m.name+' savaşa eklendi')});
  document.querySelectorAll('#monsterList [data-clonemonster]').forEach(button=>button.onclick=()=>{let m=allMonsters().find(x=>x.id===button.dataset.clonemonster);if(!m)return;modal(m.custom?'Yaratığı düzenle':'Hazır yaratığı değiştir',field('monsterName','Ad','text',m.custom?m.name:m.name+' — Büyük')+field('monsterHp','HP','number',m.hp)+field('monsterAc','AC','number',m.ac)+field('monsterSpeed','Hız','number',m.speed)+field('monsterNote','Özellik / not','text',m.note)+`<button class="primary" id="saveMonsterVariant" data-id="${m.custom?m.id:''}">Kaydet</button>`)});
  document.querySelectorAll('#monsterList [data-delmonster]').forEach(button=>button.onclick=()=>{state.customMonsters=state.customMonsters.filter(x=>x.id!==button.dataset.delmonster);save();render()});
};

/* Keep background polling cheap and prevent stale campaign caches. */
const v31NotificationBase=sessionLoadNotifications;
sessionLoadNotifications=function(force=false){if(document.hidden&&page!=='notifications')return Promise.resolve();return v31NotificationBase(force)};
const v31MessageBase=sessionLoadMessages;
sessionLoadMessages=function(force=false){if(document.hidden)return Promise.resolve();return v31MessageBase(force)};
const v31WalletBase=exLoadWallets;
exLoadWallets=function(force=false){if(document.hidden)return Promise.resolve();return v31WalletBase(force)};

/* Remove the duplicate player combat menu and apply the approval gate last. */
let duplicateCombat=playerNav.findIndex(x=>x[0]==='encounterview');
if(duplicateCombat>=0)playerNav.splice(duplicateCombat,1);
playerPages.encounter=()=>`${sessionEncounterPlayer()}${card('Parti Durumu',(state.characters||[]).map(c=>`<div class="party-combat"><b>${esc(c.name)}</b>${hpbar(c)}<div>${exEffects(c)}</div></div>`).join('')||'<div class="empty">Parti hazırlanıyor.</div>',12)}`;
for(let key of Object.keys(playerPages)){
  if(key==='dashboard')continue;
  let original=playerPages[key];
  playerPages[key]=()=>sessionPending()?sessionPendingPage():original();
}

if(current){v31AdoptLoadedCampaign();render()}
