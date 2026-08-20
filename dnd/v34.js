/* v34: castle-aware market, expanded economy and 50-entry DM quest board. */
let v34MarketQuery='';
let v34MarketTier='all';
let v34QuestQuery='';
let v34QuestBand='all';
let v34EconomyCampaign=null;

function v34Fold(value){
  return typeof fold==='function'?fold(String(value||'')):String(value||'').toLocaleLowerCase('tr-TR');
}

const v34EnsureMarketBase=exEnsureState;
exEnsureState=function(){
  v34EnsureMarketBase();
  if(!state||!current)return;
  let changed=false;
  state.shopSettings??=EX_DEFAULT_SETTINGS();
  state.shopSettings.shops??={};
  for(let key of Object.keys(EX_SHOPS)){
    if(!state.shopSettings.shops[key]){state.shopSettings.shops[key]={enabled:false,tier:1};changed=true}
  }
  if(current.role==='dm'&&(+state.shopSeedVersion||0)<4){
    for(let item of V34_MARKET_CATALOG){
      if(!(state.market||[]).some(row=>row.id===item.id||row.name===item.name)){
        state.market.push({...item});changed=true;
      }
    }
    state.shopSeedVersion=4;changed=true;
  }
  if(current.role==='dm'&&(+state.shopPriceVersion||0)<1){
    for(let item of state.market||[]){
      let patch=V34_PRICE_PATCHES[item.id];
      if(patch&&Number(item.priceCopper)===patch[0]){item.priceCopper=patch[1];changed=true}
    }
    state.shopPriceVersion=1;changed=true;
  }
  if(changed&&current.role==='dm')setTimeout(save,0);
};

function v34ApplyCastleMarket(locationId,persist=true){
  if(!state||current?.role!=='dm')return false;
  let map=v33EnsureMap(),location=map.locations.find(row=>row.id===(locationId||map.partyLocationId));
  if(!location)return false;
  state.shopSettings??=EX_DEFAULT_SETTINGS();
  state.shopSettings.shops??={};
  let tiers=v33ServiceTiers(location.serviceTiers);
  for(let key of Object.keys(EX_SHOPS)){
    let tier=Math.max(0,Math.min(3,+tiers[key]||0));
    state.shopSettings.shops[key]={enabled:tier>0,tier:tier||1};
  }
  state.shopSettings.marketLocationId=location.id;
  if(persist){save();render();toast(`${v32LocationName(location)} marketi uygulandı`)}
  return true;
}

function v34MigrateCastleEconomy(){
  if(!state||current?.role!=='dm')return;
  let map=v33EnsureMap();
  if((+map.economyVersion||0)>=1)return;
  let changed=false;
  for(let [id,next] of Object.entries(V34_CASTLE_TIERS)){
    let location=map.locations.find(row=>row.id===id),seed=V33_CASTLE_CONTENT.find(row=>row.id===id);
    if(!location)continue;
    location.serviceTiers=v33ServiceTiers(location.serviceTiers);
    for(let [key,value] of Object.entries(next)){
      let old=seed?.serviceTiers?.[key];
      if(location.serviceTiers[key]==null||Number(location.serviceTiers[key])===Number(old)){
        if(Number(location.serviceTiers[key])!==Number(value)){location.serviceTiers[key]=value;changed=true}
      }
    }
    location.blacksmithTier=location.serviceTiers.blacksmith;
    if(id==='map-castle-03'&&location.services===seed?.services){
      location.services='Volkan yanıkları için usta şifacı ve simyacılar, seçkin silah/zırh atölyeleri ve ateş rahiplerinin yüksek seviye ayinleri bulunur; binek ve okçu hizmeti yoktur.';
      changed=true;
    }
  }
  let anyShopOpen=Object.values(state.shopSettings?.shops||{}).some(shop=>shop?.enabled);
  if(!state.shopSettings?.marketLocationId&&!anyShopOpen&&v34ApplyCastleMarket(map.partyLocationId,false))changed=true;
  map.economyVersion=1;changed=true;
  if(changed)setTimeout(save,0);
}

function v34CurrentMarketLocation(){
  let map=typeof v33EnsureMap==='function'?v33EnsureMap():state?.worldMap;
  if(!map)return {map:null,party:null,applied:null};
  return {
    map,
    party:map.locations?.find(row=>row.id===map.partyLocationId)||null,
    applied:map.locations?.find(row=>row.id===state.shopSettings?.marketLocationId)||null
  };
}

function v34MarketLocationPanel(){
  let {party,applied}=v34CurrentMarketLocation(),same=party&&applied?.id===party.id;
  if(current.role==='dm')return `<section class="card v34-market-location ${same?'synced':'stale'}"><div><span class="v26-kicker">KONUMA BAĞLI EKONOMİ</span><h3>${esc(party?`Parti: ${v32LocationName(party)}`:'Parti konumu belirlenmedi')}</h3><p>${same?'Açık dükkânlar ve tierler bu kalenin atlas bilgisiyle eşleşiyor.':applied?`Market son olarak ${esc(v32LocationName(applied))} için ayarlı. Parti konumu değişmiş.`:'Market henüz bir kalenin hizmetlerine bağlanmadı.'}</p></div><button id="v34ApplyCastleMarket" class="${same?'ghost':'primary'}" ${party?'':'disabled'}>${same?'Kale Ayarını Yeniden Uygula':'Bu Kalenin Marketini Uygula'}</button></section>`;
  return `<section class="card v34-market-location ${same?'synced':'stale'}"><div><span class="v26-kicker">BULUNDUĞUNUZ YER</span><h3>${esc(party?v32LocationName(party):'Konum bilinmiyor')}</h3><p>${same?'Aşağıdaki dükkânlar bu kalenin mevcut hizmetleridir.':'DM marketi bulunduğunuz kaleye göre henüz güncellemedi.'}</p></div></section>`;
}

function v34VisibleMarketItems(){
  let rows=exVisibleItems(),needle=v34Fold(v34MarketQuery.trim());
  if(v34MarketTier!=='all')rows=rows.filter(item=>item.tier===+v34MarketTier);
  if(needle)rows=rows.filter(item=>v34Fold(`${item.name} ${item.note} ${item.effect} ${EX_SHOPS[item.shop]||item.shop}`).includes(needle));
  let shopOrder=Object.keys(EX_SHOPS);
  return rows.slice().sort((a,b)=>shopOrder.indexOf(a.shop)-shopOrder.indexOf(b.shop)||a.tier-b.tier||a.name.localeCompare(b.name,'tr'));
}

exItemCard=function(item){
  v25HydrateItem(item);
  let price=exPrice(item),canBuy=current.role==='player'&&state.shopSettings.buyingEnabled&&item.stock>0;
  let kind=item.service?'Hizmet':item.mount?'Binek':item.effect||'Eşya';
  let buyLabel=item.service?'Hizmeti Al':item.mount?'Bineği Satın Al':'Satın Al';
  let stockLabel=item.service?'Kapasite':'Stok';
  return `<details class="shop-item ${item.active===false?'disabled':''}" data-v34-market-card="${esc(v34Fold(`${item.name} ${item.note} ${item.effect}`))}"><summary><div class="v27-compact-head"><b>${esc(item.name)}</b><span class="tier">T${item.tier}</span></div><small>${esc(EX_SHOPS[item.shop]||item.shop)} • ${esc(kind)}</small><div class="between row"><div>${exMoney(price)}</div><b>${stockLabel} ${item.stock}</b></div></summary><div class="v27-shop-body"><p>${esc(item.note||'Açıklama yok.')}</p>${item.service?'<p class="v34-delivery-note">Satın alınınca karakter envanterine hizmet kaydı düşer; DM hizmet uygulanınca kaydı silebilir.</p>':''}${current.role==='dm'?`<div class="shop-admin"><button data-v25-market-give="${item.id}" class="primary">${item.service?'Hizmet Tanımla':'Oyuncuya Ver'}</button><button data-item-toggle="${item.id}" class="ghost">${item.active===false?'Göster':'Gizle'}</button><button data-item-price="${item.id}" class="ghost">Fiyat</button><button data-item-stock="${item.id}" class="ghost">${stockLabel}</button>${item.custom?`<button data-item-delete="${item.id}" class="danger">Sil</button>`:''}</div>`:`<button data-buy-item="${item.id}" class="primary buy-button" ${canBuy?'':'disabled'}>${item.stock>0?buyLabel:'Tükendi'}</button>`}</div></details>`;
};

function v34MarketGridHtml(){
  let items=v34VisibleMarketItems();
  return items.map(exItemCard).join('')||'<div class="card empty">Bu filtrede açık ürün veya hizmet yok.</div>';
}

function v34MarketFilters(){
  let count=v34VisibleMarketItems().length;
  return `<div class="v34-market-tools card"><input id="v34MarketSearch" class="input" value="${esc(v34MarketQuery)}" placeholder="Ürün, hizmet, binek veya etki ara…"><select id="v34MarketTier"><option value="all">Tüm tierler</option>${[1,2,3].map(tier=>`<option value="${tier}" ${v34MarketTier==tier?'selected':''}>Tier ${tier}</option>`).join('')}</select><button id="v34ClearMarketFilter" class="ghost">Temizle</button><b id="v34MarketCount">${count} sonuç</b></div>`;
}

exMarket=function(){
  exEnsureState();
  if(current.role==='dm')v34MigrateCastleEconomy();
  queueMicrotask(()=>exLoadWallets());
  let shops=current.role==='dm'?Object.keys(EX_SHOPS):Object.keys(EX_SHOPS).filter(key=>state.shopSettings.shops[key]?.enabled);
  let content=`<div>${v34MarketFilters()}<div class="shop-tabs"><button data-shop-filter="all" class="${exShopFilter==='all'?'active':''}">Tümü</button>${shops.map(key=>`<button data-shop-filter="${key}" class="${exShopFilter===key?'active':''}">${esc(EX_SHOPS[key])}</button>`).join('')}</div><div id="v34MarketGrid" class="shop-grid">${v34MarketGridHtml()}</div></div>`;
  let controls=current.role==='dm'?`${exShopControls()}<section class="card v34-economy-note"><b>Tier mantığı</b><p><strong>T1:</strong> gündelik ve başlangıç ekipmanı. <strong>T2:</strong> uzman, pahalı veya bölgesel ürün. <strong>T3:</strong> nadir, güçlü ya da hikâye seviyesi hizmet. Tier erişimdir; fiyatın yerine geçmez.</p></section>`:`<div class="shop-player-head card"><div><small>KİŞİSEL BAKİYE</small>${exMoney(exCoinTotal(exWalletRows.find(row=>row.user_id===auth.id)||{}))}</div><p>${state.shopSettings.buyingEnabled?'Dükkânlar alışverişe açık.':'DM satın almayı kapattı.'}</p></div>`;
  return `${v26Head('ALIŞVERİŞ','Market, Hizmetler ve Binekler',`${state.market.length} kayıt. Ürün özeti görünür; açıklama ve yönetim araçları karta basınca açılır.`)}${v34MarketLocationPanel()}<div class="v27-market-layout">${controls}${content}</div>`;
};
dmPages.market=exMarket;
playerPages.market=exMarket;

const V34_QUEST_BANDS=['1–2','3–4','5–7','8–10','11–14','15–20'];
function v34QuestRows(){
  let needle=v34Fold(v34QuestQuery.trim());
  return V34_QUESTS.filter(quest=>(v34QuestBand==='all'||quest.levels===v34QuestBand)&&(!needle||v34Fold(`${quest.title} ${quest.type} ${quest.hook} ${quest.twist} ${quest.reward}`).includes(needle)));
}
function v34QuestCards(){
  let rows=v34QuestRows();
  return rows.map(quest=>`<details class="v34-quest"><summary><span><b>${esc(quest.title)}</b><small>Seviye ${esc(quest.levels)} • ${esc(quest.type)}</small></span><i>＋</i></summary><div><p><b>Başlangıç:</b> ${esc(quest.hook)}</p><p><b>Ters köşe:</b> ${esc(quest.twist)}</p><p><b>Ödül fikri:</b> ${esc(quest.reward)}</p><button class="primary" data-v34-add-quest="${quest.id}">Aktif Görevlere Ekle</button></div></details>`).join('')||'<div class="empty">Bu filtrede görev yok.</div>';
}
function v34QuestHub(){
  if(current.role!=='dm')return '<div class="empty">Görev havuzu yalnızca DM görünümündedir.</div>';
  let rows=v34QuestRows();
  return `<section class="v34-quest-hub"><div class="v34-quest-head"><div><span class="v26-kicker">DM İLHAM HAVUZU</span><h2>50 Hazır Görev Fikri</h2><p>Birebir kopyala veya ismini, yaratığını ve ödülünü değiştir. Kartlar başlangıçta kapalıdır.</p></div><b id="v34QuestCount">${rows.length}/50</b></div><div class="v34-quest-tools"><input id="v34QuestSearch" class="input" value="${esc(v34QuestQuery)}" placeholder="Devriye, kervan, dungeon, diplomasi…"><div><button data-v34-quest-band="all" class="${v34QuestBand==='all'?'primary':'ghost'}">Tümü</button>${V34_QUEST_BANDS.map(band=>`<button data-v34-quest-band="${band}" class="${v34QuestBand===band?'primary':'ghost'}">Lv ${band}</button>`).join('')}</div></div><div id="v34QuestBody" class="v34-quest-list">${v34QuestCards()}</div></section>`;
}

const v34GuideBase=v26Guide;
v26Guide=function(){
  let html=v34GuideBase();
  if(current?.role==='dm')html=html.replace('<div class="v26-guide-tabs">','<div class="v26-guide-tabs"><button class="ghost" data-v34-quest-hub="1">50 Görev Fikri</button>');
  return html;
};
guideView=v26Guide;
dmPages.guide=v26Guide;
playerPages.guide=v26Guide;

function v34RefreshMarketGrid(){
  let grid=$('#v34MarketGrid');if(grid)grid.innerHTML=v34MarketGridHtml();
  let count=$('#v34MarketCount');if(count)count.textContent=`${v34VisibleMarketItems().length} sonuç`;
}
function v34RefreshQuestList(){
  let body=$('#v34QuestBody');if(body)body.innerHTML=v34QuestCards();
  let count=$('#v34QuestCount');if(count)count.textContent=`${v34QuestRows().length}/50`;
}

document.addEventListener('click',event=>{
  let button=event.target.closest('button');if(!button||!current)return;
  if(button.id==='v34ApplyCastleMarket'&&current.role==='dm'){
    v34ApplyCastleMarket(v33EnsureMap().partyLocationId,true);return;
  }
  if(button.id==='v33SetPartyHere'&&current.role==='dm'){
    let map=v33EnsureMap();v34ApplyCastleMarket(map.partyLocationId,false);save();render();return;
  }
  if(button.id==='v34ClearMarketFilter'){
    v34MarketQuery='';v34MarketTier='all';render();return;
  }
  if(button.dataset.v34QuestHub&&current.role==='dm'){
    $('#guideResults').innerHTML=v34QuestHub();return;
  }
  if(button.dataset.v34QuestBand&&current.role==='dm'){
    v34QuestBand=button.dataset.v34QuestBand;
    document.querySelectorAll('[data-v34-quest-band]').forEach(row=>row.className=row===button?'primary':'ghost');
    v34RefreshQuestList();return;
  }
  if(button.dataset.v34AddQuest&&current.role==='dm'){
    let quest=V34_QUESTS.find(row=>row.id===button.dataset.v34AddQuest);if(!quest)return;
    state.quests??=[];
    let text=`[Lv ${quest.levels}] ${quest.title} — ${quest.hook}`;
    if(!state.quests.includes(text))state.quests.push(text);
    save();toast(`${quest.title} aktif görevlere eklendi`);return;
  }
},true);

document.addEventListener('input',event=>{
  if(event.target.id==='v34MarketSearch'){
    v34MarketQuery=event.target.value;v34RefreshMarketGrid();return;
  }
  if(event.target.id==='v34QuestSearch'&&current?.role==='dm'){
    v34QuestQuery=event.target.value;v34RefreshQuestList();
  }
},true);

document.addEventListener('change',event=>{
  if(event.target.id==='v34MarketTier'){
    v34MarketTier=event.target.value;v34RefreshMarketGrid();
  }
},true);

const v34RenderBase=render;
render=function(){
  if(current){
    if(v34EconomyCampaign!==current.id){v34EconomyCampaign=current.id;v34MarketQuery='';v34MarketTier='all';v34QuestQuery='';v34QuestBand='all'}
    exEnsureState();
    v34MigrateCastleEconomy();
  }
  return v34RenderBase();
};

if(current)render();
