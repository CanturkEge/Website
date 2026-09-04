/* v64: catalogue cleanup, boss archive, NPC assets and economy migration. */
((root)=>{
  'use strict';

  window.V59_MONSTERS=[...window.V64_MONSTERS];
  const baseAllMonsters=allMonsters;
  allMonsters=function(){
    const rows=[...baseAllMonsters(),...V64_BOSSES],byName=new Map();
    for(const row of rows){const key=String(row.name||'').toLocaleLowerCase('tr-TR');if(!byName.has(key)||row.boss)byName.set(key,row)}
    return [...byName.values()];
  };

  let v64BossQuery='',v64BossCr='all',v64BossSource='all';
  function fold64(value){return String(value||'').toLocaleLowerCase('tr-TR')}
  function bossRows(){
    const q=fold64(v64BossQuery.trim());
    return V64_BOSSES.filter(b=>(v64BossCr==='all'||String(b.cr)===v64BossCr)&&(v64BossSource==='all'||b.source===v64BossSource)&&(!q||fold64(`${b.name} ${b.category} ${b.attacks} ${b.skills.join(' ')} ${b.counterplay}`).includes(q)));
  }
  function bossCard(b){return `<details class="v64-boss card"><summary><div><span class="v26-kicker">${esc(b.category)} • CR ${esc(b.cr)} • ${esc(b.source)}</span><h3>${esc(b.name)}</h3></div><div class="v64-boss-vitals"><span><b>${b.ac}</b> AC</span><span><b>${b.hp}</b> HP</span><span><b>${b.speed}</b> ft</span></div></summary><div class="v64-boss-body"><section><h4>Ana saldırılar</h4><p>${esc(b.attacks)}</p></section><section><h4>Özel ve Legendary yetenekler</h4><ul>${b.skills.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><section><h4>Lair Action’lar</h4><ul>${b.lairActions.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><section><h4>Faz değişimi</h4><ul>${b.phases.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><section class="v64-counter"><h4>Karşı oyun</h4><p>${esc(b.counterplay)}</p></section><div class="v27-monster-actions"><button class="primary" data-spawn="${esc(b.id)}">Savaşa Ekle</button><button class="ghost" data-clonemonster="${esc(b.id)}">Kopyala / Değiştir</button></div></div></details>`}
  function bossesPage(){
    const rows=bossRows(),crs=[...new Set(V64_BOSSES.map(x=>String(x.cr)))].sort((a,b)=>Number(a)-Number(b)),sources=[...new Set(V64_BOSSES.map(x=>x.source))];
    return `<section class="v64-boss-hero"><div><span class="v26-kicker">DM BOSS ARŞİVİ</span><h2>${V64_BOSSES.length} Hazır Boss</h2><p>Legendary yetenek, lair action, faz değişimi ve karşı oyun tek kartta. SRD uyumlu özetlerle özgün kampanya bossları ayrı işaretlidir.</p></div><div><b>${rows.length}</b><span>gösteriliyor</span></div></section><section class="card v64-boss-tools"><input id="v64BossSearch" class="input" value="${esc(v64BossQuery)}" placeholder="Boss, yetenek veya karşı oyun ara…"><select id="v64BossCr"><option value="all">Tüm CR’ler</option>${crs.map(x=>`<option value="${x}" ${v64BossCr===x?'selected':''}>CR ${x}</option>`).join('')}</select><select id="v64BossSource"><option value="all">Tüm kaynaklar</option>${sources.map(x=>`<option ${v64BossSource===x?'selected':''}>${esc(x)}</option>`).join('')}</select></section><div id="v64BossList" class="v64-boss-grid">${rows.map(bossCard).join('')||'<div class="card empty">Bu filtrede boss yok.</div>'}</div>`;
  }
  dmPages.bosses=bossesPage;
  if(!dmNav.some(row=>row[0]==='bosses')){const i=dmNav.findIndex(row=>row[0]==='bestiary');dmNav.splice(i<0?dmNav.length:i+1,0,['bosses','♛','Bosslar'])}

  const baseEnsure=exEnsureState;
  exEnsureState=function(){
    baseEnsure();if(!state||!current)return;
    let changed=false;
    state.shopSettings??=EX_DEFAULT_SETTINGS();state.shopSettings.shops??={};
    if(!state.shopSettings.shops.arcane){state.shopSettings.shops.arcane={enabled:false,tier:1};changed=true}
    if(current.role==='dm'&&(+state.shopSeedVersion||0)<6){
      state.market=Array.isArray(state.market)?state.market:[];
      for(const item of V64_MARKET_CATALOG)if(!state.market.some(x=>x.id===item.id||x.name===item.name)){state.market.push({...item});changed=true}
      state.shopSeedVersion=6;changed=true;
    }
    for(const npc of state.npcs||[]){
      if(!Array.isArray(npc.inventory)){npc.inventory=[];changed=true}
      if(!npc.coins||typeof npc.coins!=='object'){npc.coins={pp:0,gp:0,sp:0,cp:0};changed=true}
      for(const key of ['pp','gp','sp','cp'])if(!Number.isFinite(+npc.coins[key])){npc.coins[key]=0;changed=true}
    }
    const map=state.worldMap;
    if(current.role==='dm'&&map&&(+map.economyVersion||0)<2){
      for(const [id,tiers] of Object.entries(V34_CASTLE_TIERS)){const location=map.locations?.find(x=>x.id===id);if(location){location.serviceTiers??={};location.serviceTiers.arcane=Math.max(0,Math.min(3,+tiers.arcane||0))}}
      map.economyVersion=2;changed=true;
    }
    if(changed&&current.role==='dm')setTimeout(save,0);
  };

  const baseApplyCastle=typeof v34ApplyCastleMarket==='function'?v34ApplyCastleMarket:null;
  if(baseApplyCastle)v34ApplyCastleMarket=function(locationId,persist=true){
    const ok=baseApplyCastle(locationId,false),map=typeof v33EnsureMap==='function'?v33EnsureMap():null,location=map?.locations?.find(x=>x.id===(locationId||map.partyLocationId));
    if(ok&&location){const seed=V34_CASTLE_TIERS[location.id],tier=Math.max(0,Math.min(3,+seed?.arcane||0));state.shopSettings.shops.arcane={enabled:tier>0,tier:tier||1}}
    if(ok&&persist){save();render();toast(`${typeof v32LocationName==='function'?v32LocationName(location):location?.name||'Kale'} marketi uygulandı`)}
    return ok;
  };

  function npcById(id){return (state.npcs||[]).find(n=>String(n.id)===String(id))}
  function npcCoins(npc){npc.coins??={pp:0,gp:0,sp:0,cp:0};return npc.coins}
  function itemTemplate(name){return (root.V44_LOOT_CATALOG||[]).find(x=>fold64(x.name)===fold64(name))||state.market?.find(x=>fold64(x.name)===fold64(name))}
  function npcManagerBody(npc){
    npc.inventory=Array.isArray(npc.inventory)?npc.inventory:[];const coins=npcCoins(npc),catalog=(root.V44_LOOT_CATALOG||[]).slice().sort((a,b)=>a.name.localeCompare(b.name,'tr'));
    return `<div class="v64-npc-manager"><section class="v64-npc-assets"><span class="v26-kicker">PARA KESESİ</span><div class="v59-coins">${['pp','gp','sp','cp'].map(k=>`<span><b>${+coins[k]||0}</b> ${k.toUpperCase()}</span>`).join('')}</div><div class="v64-money-edit"><select id="v64NpcMoneyCoin">${['gp','sp','cp','pp'].map(k=>`<option value="${k}">${k.toUpperCase()}</option>`).join('')}</select><input id="v64NpcMoneyAmount" type="number" min="1" value="1"><button id="v64NpcMoneyAdd" data-v64-npc="${esc(npc.id)}" class="primary">Ekle</button><button id="v64NpcMoneyRemove" data-v64-npc="${esc(npc.id)}" class="danger">Çıkar</button></div></section><section><span class="v26-kicker">ENVANTER • ${npc.inventory.length} KAYIT</span><div class="v64-npc-items">${npc.inventory.map((item,index)=>`<article><span><b>${esc(item.name||'İsimsiz eşya')}</b><small>${esc(item.effect||item.note||'Açıklama yok')} • ×${Math.max(1,+item.qty||1)}</small></span><button class="danger" data-v64-npc-remove="${index}" data-v64-npc="${esc(npc.id)}">Kaldır</button></article>`).join('')||'<div class="empty">Bu NPC’nin envanteri boş.</div>'}</div></section><section><span class="v26-kicker">KATALOGDAN VEYA ELLE EŞYA VER</span><label>Eşya adı<input id="v64NpcItemName" list="v64NpcCatalog" placeholder="Yaz veya katalogdan seç…"><datalist id="v64NpcCatalog">${catalog.map(x=>`<option value="${esc(x.name)}"></option>`).join('')}</datalist></label><div class="v64-item-add"><input id="v64NpcItemQty" type="number" min="1" value="1"><button id="v64NpcItemAdd" data-v64-npc="${esc(npc.id)}" class="primary">NPC’ye Ver</button></div><p class="muted">Katalogdan seçersen eşyanın effect, bonus, class şartı ve diğer alanları korunur.</p></section></div>`;
  }
  function openNpcManager(id){const npc=npcById(id);if(npc)modal(`${npc.name} — Envanter ve Para`,npcManagerBody(npc))}
  function refreshNpcManager(npc){render();const dialog=$('#modal');if(dialog?.open){$('#modalTitle').textContent=`${npc.name} — Envanter ve Para`;$('#modalBody').innerHTML=npcManagerBody(npc)}}

  const npcPage=dmPages.npcs;
  dmPages.npcs=()=>{
    exEnsureState();let html=npcPage();
    html=html.replace(/<button data-npcitem="([^"]+)"[^>]*>Eşya<\/button>/g,(all,id)=>{const n=npcById(id);return `<button data-v64-npc-manage="${id}" class="primary">Envanter & Para (${n?.inventory?.length||0})</button>`});
    return html.replace(/(<div class="v27-npc-body">)/g,'$1<p class="muted">Eşya, özellik bonusu ve para kayıtları kampanyayla birlikte saklanır.</p>');
  };
  const guildPage=dmPages.guilddm;
  dmPages.guilddm=()=>guildPage().replace(/(<button class="ghost" data-v59-npc-money="([^"]+)">Para Bırak<\/button>)/g,'$1<button class="primary" data-v64-npc-manage="$2">Envanter & Para</button>');

  function refreshBossList(){const box=$('#v64BossList');if(box){box.innerHTML=bossRows().map(bossCard).join('')||'<div class="card empty">Bu filtrede boss yok.</div>';bind()}}
  document.addEventListener('input',event=>{if(event.target.id==='v64BossSearch'){v64BossQuery=event.target.value;refreshBossList()}},true);
  document.addEventListener('change',event=>{if(event.target.id==='v64BossCr'){v64BossCr=event.target.value;refreshBossList()}if(event.target.id==='v64BossSource'){v64BossSource=event.target.value;refreshBossList()}},true);
  document.addEventListener('click',async event=>{
    const button=event.target.closest('button');if(!button||!current)return;
    if(button.dataset.v64NpcManage){event.preventDefault();event.stopImmediatePropagation();openNpcManager(button.dataset.v64NpcManage);return}
    if(button.id==='v64NpcItemAdd'){
      event.preventDefault();event.stopImmediatePropagation();const npc=npcById(button.dataset.v64Npc),name=$('#v64NpcItemName')?.value.trim(),qty=Math.max(1,Math.trunc(+$('#v64NpcItemQty')?.value||1));if(!npc||!name)return alert('Eşya adı gerekli.');
      const template=itemTemplate(name),item=template?JSON.parse(JSON.stringify(template)):{name,note:'DM tarafından NPC’ye verilen özel eşya.'};delete item.id;item.id=uid();item.qty=qty;item.equipped=false;npc.inventory.push(item);save();if(typeof flushSave==='function')await flushSave();await root.v69Audit?.('npc_item','DM NPC’ye eşya verdi',`${qty}× ${name} → ${npc.name}`,{npcId:npc.id,item:name,quantity:qty,direction:'in'});refreshNpcManager(npc);toast(`${qty}× ${name} NPC’ye verildi`);return;
    }
    if(button.dataset.v64NpcRemove!=null){event.preventDefault();event.stopImmediatePropagation();const npc=npcById(button.dataset.v64Npc),index=+button.dataset.v64NpcRemove,item=npc?.inventory?.[index];if(!item)return;npc.inventory.splice(index,1);save();if(typeof flushSave==='function')await flushSave();await root.v69Audit?.('npc_item','DM NPC eşyasını kaldırdı',`${Math.max(1,+item.qty||1)}× ${item.name||'Eşya'} ← ${npc.name}`,{npcId:npc.id,item:item.name||'Eşya',quantity:Math.max(1,+item.qty||1),direction:'out'});refreshNpcManager(npc);toast('NPC eşyası kaldırıldı');return}
    if(button.id==='v64NpcMoneyAdd'||button.id==='v64NpcMoneyRemove'){
      event.preventDefault();event.stopImmediatePropagation();const npc=npcById(button.dataset.v64Npc),coin=$('#v64NpcMoneyCoin')?.value,amount=Math.max(1,Math.trunc(+$('#v64NpcMoneyAmount')?.value||0));if(!npc||!['pp','gp','sp','cp'].includes(coin))return;const sign=button.id.endsWith('Add')?1:-1,currentAmount=+npcCoins(npc)[coin]||0;if(sign<0&&currentAmount<amount)return alert(`NPC’de yalnız ${currentAmount} ${coin.toUpperCase()} var.`);npc.coins[coin]=currentAmount+sign*amount;save();if(typeof flushSave==='function')await flushSave();await root.v69Audit?.('npc_money','DM NPC kesesini düzenledi',`${npc.name}: ${sign>0?'+':'−'}${amount} ${coin.toUpperCase()}`,{npcId:npc.id,coin,amount,delta:sign*amount});refreshNpcManager(npc);toast(sign>0?'NPC parasına eklendi':'NPC parasından çıkarıldı');return;
    }
  },true);

  const baseRender=render;
  render=function(){if(current?.role==='dm')exEnsureState();return baseRender()};
  if(current){exEnsureState();render()}
})(typeof window!=='undefined'?window:globalThis);
