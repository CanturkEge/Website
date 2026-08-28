/* v32: interactive campaign map and player-only guild activity ledger. */
const V32_MAP_IMAGE='Map.png';
const V32_MAP_WIDTH=1536;
const V32_MAP_HEIGHT=1024;
const V32_MAP_TYPES={
  castle:'Kale',
  region:'Bölge',
  dungeon:'Dungeon',
  settlement:'Yerleşim',
  secretShop:'Gizli Dükkân',
  cursedShop:'Lanetli Dükkân',
  landmark:'Özel Nokta'
};
const V32_MAP_ICONS={castle:'♜',region:'◆',dungeon:'☠',settlement:'⌂',secretShop:'◇',cursedShop:'♱',landmark:'✦'};
const V32_CASTLE_SEEDS=[
  ['map-castle-01',13.5,23.5,9],
  ['map-castle-02',45.5,13.5,9],
  ['map-castle-03',74.0,16.5,9],
  ['map-castle-04',92.0,28.0,8],
  ['map-castle-05',45.5,46.0,10],
  ['map-castle-06',62.5,37.5,8],
  ['map-castle-07',81.5,47.0,8],
  ['map-castle-08',8.0,55.0,8],
  ['map-castle-09',29.0,69.0,8],
  ['map-castle-10',10.5,82.0,8],
  ['map-castle-11',45.5,88.0,8],
  ['map-castle-12',88.0,70.0,9]
];

function v32CastleSeed(row,index){
  return {
    id:row[0],fixedCastle:true,kind:'castle',x:row[1],y:row[2],radius:row[3],
    name:'',region:'',summary:'',history:'',services:'',blacksmithTier:0,
    threat:'',intel:'',dungeonName:'',recommendedLevel:'',monsters:'',dungeonNotes:'',dmNotes:'',
    revealMap:false,revealMarker:false,revealHistory:false,revealIntel:false,revealDungeon:false,
    seedOrder:index+1
  };
}
function v32BlankMap(){
  return {
    version:1,image:V32_MAP_IMAGE,fogEnabled:true,revealAll:false,
    locations:V32_CASTLE_SEEDS.map(v32CastleSeed)
  };
}

let v32MapCampaign=null;
let v32SelectedLocationId=null;
let v32PlaceMode='';
let v32PendingPoint=null;
let v32PlayerPreview=false;
let v32MapZoom=100;
let v32SeedSaveCampaign=null;
let v32GuildActivity=[];
let v32GuildActivityCampaign=null;
let v32GuildActivityLoading=false;
let v32GuildActivityError='';

function v32ResetLocalState(){
  v32SelectedLocationId=null;
  v32PlaceMode='';
  v32PendingPoint=null;
  v32PlayerPreview=false;
  v32MapZoom=100;
  v32GuildActivity=[];
  v32GuildActivityCampaign=null;
  v32GuildActivityLoading=false;
  v32GuildActivityError='';
}

function v32EnsureMap(){
  if(!state)return v32BlankMap();
  if(v32MapCampaign!==current?.id){v32MapCampaign=current?.id||null;v32ResetLocalState()}
  let changed=false;
  if(!state.worldMap||typeof state.worldMap!=='object'||Array.isArray(state.worldMap)){
    state.worldMap=v32BlankMap();changed=true;
  }
  let map=state.worldMap;
  if(!Array.isArray(map.locations)){map.locations=[];changed=true}
  if(typeof map.fogEnabled!=='boolean'){map.fogEnabled=true;changed=true}
  if(typeof map.revealAll!=='boolean'){map.revealAll=false;changed=true}
  if(map.image!==V32_MAP_IMAGE){map.image=V32_MAP_IMAGE;changed=true}
  if(map.version!==1){map.version=1;changed=true}
  for(let [index,row] of V32_CASTLE_SEEDS.entries()){
    let existing=map.locations.find(location=>location?.id===row[0]);
    if(!existing){map.locations.push(v32CastleSeed(row,index));changed=true;continue}
    let defaults=v32CastleSeed(row,index);
    for(let [key,value] of Object.entries(defaults)){
      if(existing[key]===undefined){existing[key]=value;changed=true}
    }
  }
  if(changed&&current?.role==='dm'&&v32SeedSaveCampaign!==current.id){
    v32SeedSaveCampaign=current.id;
    queueMicrotask(()=>{if(current?.id===v32SeedSaveCampaign)save()});
  }
  return map;
}

function v32TypeName(location){return V32_MAP_TYPES[location?.kind]||'Özel Nokta'}
function v32LocationName(location){
  let name=String(location?.name||'').trim();
  if(name)return name;
  return location?.fixedCastle?`İsimsiz Kale ${location.seedOrder||''}`.trim():'İsimsiz Nokta';
}
function v32Icon(location){return V32_MAP_ICONS[location?.kind]||'✦'}
function v32Percent(value){return Math.max(0,Math.min(100,Number(value)||0))}
function v32Radius(value){return Math.max(3,Math.min(20,Number(value)||8))}

function v32FogSvg(map,playerMode){
  if(!playerMode||!map.fogEnabled||map.revealAll)return '';
  let revealed=map.locations.filter(location=>location.revealMap);
  let holes=revealed.map(location=>{
    let x=v32Percent(location.x)*V32_MAP_WIDTH/100;
    let y=v32Percent(location.y)*V32_MAP_HEIGHT/100;
    let radius=v32Radius(location.radius);
    return `<ellipse cx="${x}" cy="${y}" rx="${radius*V32_MAP_WIDTH/100}" ry="${radius*V32_MAP_HEIGHT/100}" fill="url(#v32FogFade)"></ellipse>`;
  }).join('');
  return `<svg class="v32-fog" viewBox="0 0 ${V32_MAP_WIDTH} ${V32_MAP_HEIGHT}" preserveAspectRatio="none" aria-hidden="true"><defs><radialGradient id="v32FogFade"><stop offset="0" stop-color="black"></stop><stop offset="68%" stop-color="black"></stop><stop offset="100%" stop-color="white"></stop></radialGradient><mask id="v32FogMask"><rect width="100%" height="100%" fill="white"></rect>${holes}</mask><filter id="v32FogNoise"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="17"></feTurbulence><feColorMatrix values=".12 0 0 0 0 .12 0 0 0 0 .12 0 0 0 0 0 0 .32 0"></feColorMatrix></filter></defs><rect width="100%" height="100%" fill="#070605" fill-opacity=".97" mask="url(#v32FogMask)"></rect><rect width="100%" height="100%" filter="url(#v32FogNoise)" opacity=".8" mask="url(#v32FogMask)"></rect></svg>`;
}

function v32RevealRings(map,playerMode){
  if(playerMode)return '';
  return map.locations.filter(location=>location.revealMap).map(location=>{
    let radius=v32Radius(location.radius);
    return `<i class="v32-reveal-ring" style="left:${v32Percent(location.x)}%;top:${v32Percent(location.y)}%;width:${radius*2}%;height:${radius*2*1.5}%"></i>`;
  }).join('');
}

function v32MapMarkers(map,playerMode){
  return map.locations.map((location,index)=>{
    let canSee=!playerMode||(location.revealMap&&location.revealMarker);
    if(!canSee)return '';
    let selected=location.id===v32SelectedLocationId;
    let label=v32LocationName(location);
    let playerLabel=String(location.name||'').trim()||v32TypeName(location);
    return `<button class="v32-map-marker ${selected?'selected':''} ${location.fixedCastle?'castle':''}" style="left:${v32Percent(location.x)}%;top:${v32Percent(location.y)}%" data-v32-location="${esc(location.id)}" title="${esc(playerMode?playerLabel:label)}" aria-label="${esc(playerMode?playerLabel:label)}"><span>${v32Icon(location)}</span><small>${esc(playerMode?playerLabel:label)}</small>${!playerMode&&location.fixedCastle?`<b>${location.seedOrder}</b>`:''}</button>`;
  }).join('');
}

function v32Field(id,label,value='',placeholder=''){
  return `<label>${label}<input id="${id}" value="${esc(value)}" placeholder="${esc(placeholder)}"></label>`;
}
function v32Textarea(id,label,value='',placeholder=''){
  return `<label>${label}<textarea id="${id}" placeholder="${esc(placeholder)}">${esc(value)}</textarea></label>`;
}
function v32TypeSelect(location){
  if(location.fixedCastle)return '<label>Konum türü<input value="Kale (12 sabit kaleden biri)" disabled></label>';
  return `<label>Konum türü<select id="v32LocationKind">${Object.entries(V32_MAP_TYPES).filter(([key])=>key!=='castle').map(([key,name])=>`<option value="${key}" ${location.kind===key?'selected':''}>${esc(name)}</option>`).join('')}</select></label>`;
}
function v32RevealToggle(id,checked,title,description){
  return `<label class="v32-reveal-toggle"><input id="${id}" type="checkbox" ${checked?'checked':''}><span><b>${title}</b><small>${description}</small></span></label>`;
}

function v32DmLocationPanel(location){
  if(!location)return `<div class="v32-map-empty"><b>Haritadan bir nokta seç</b><p>Kaleyi düzenlemek için işaretine bas. Yeni orman, dungeon veya dükkân eklemek için “Yeni nokta”yı seçip haritada yerine dokun.</p></div>`;
  return `<div class="v32-location-head"><span>${v32Icon(location)}</span><div><small>${esc(v32TypeName(location))} • X ${v32Percent(location.x).toFixed(1)} / Y ${v32Percent(location.y).toFixed(1)}</small><h2>${esc(v32LocationName(location))}</h2></div></div><div class="v32-location-form">${v32TypeSelect(location)}${v32Field('v32LocationName','Konum adı',location.name,'Oyunda görünecek ad')}${v32Field('v32LocationRegion','Bölge / diyar adı',location.region,'Örn. Karaçam Ormanı')}${v32Textarea('v32LocationSummary','Kısa tanım',location.summary,'Oyuncunun ilk bakışta anlayacağı bilgi')}${v32Textarea('v32LocationHistory','Geçmiş ve bilinen hikâye',location.history,'Araştırma veya konuşmalarla öğrenilecek tarih')}${v32Textarea('v32LocationServices','İçerideki normal hizmetler',location.services,'Han, şifacı, pazar, ahır… Gizli/lanetli dükkânları haritada ayrı nokta olarak ekle.')}
  <label>Demirci tieri<select id="v32BlacksmithTier">${[0,1,2,3,4,5].map(t=>`<option value="${t}" ${Number(location.blacksmithTier)===t?'selected':''}>${t===0?'Yok / bilinmiyor':'Tier '+t}</option>`).join('')}</select></label>
  ${v32Field('v32LocationThreat','Tehlike / savunma',location.threat,'Muhafız, sur, çevre tehlikesi…')}${v32Textarea('v32LocationIntel','İçerisi ve istihbarat',location.intel,'Kim yönetiyor, kapılar, önemli kişiler, içeride ne var…')}${v32Field('v32DungeonName','Bağlı dungeon',location.dungeonName,'Varsa dungeon adı')}${v32Field('v32RecommendedLevel','Önerilen seviye',location.recommendedLevel,'Örn. 3–5')}${v32Textarea('v32DungeonMonsters','Dungeon yaratıkları',location.monsters,'İsim, yaklaşık adet ve özel tehlikeler')}${v32Textarea('v32DungeonNotes','Dungeon bilgisi',location.dungeonNotes,'Giriş, katlar, çevresel tehlike ve ödül ipuçları')}${v32Textarea('v32DmNotes','Yalnızca DM notu',location.dmNotes,'Bu alan hiçbir keşif ayarıyla oyuncuya açılmaz.')}
  <div class="v32-reveal-controls"><h3>Oyuncuya açılan bilgiler</h3>${v32RevealToggle('v32RevealMap',location.revealMap,'Araziyi göster','Bu noktanın çevresindeki sis kalkar.')}${v32RevealToggle('v32RevealMarker',location.revealMarker,'İşareti ve adı göster','Haritada tıklanabilir konum işareti çıkar.')}${v32RevealToggle('v32RevealHistory',location.revealHistory,'Geçmişi göster','Kısa tanım ve tarih oyuncuya açılır.')}${v32RevealToggle('v32RevealIntel',location.revealIntel,'İstihbaratı göster','Hizmetler, demirci, savunma ve içerisi görünür.')}${v32RevealToggle('v32RevealDungeon',location.revealDungeon,'Dungeon bilgisini göster','Önerilen seviye, yaratıklar ve dungeon notları görünür.')}</div>
  <label>Sis açma yarıçapı <b id="v32RadiusValue">${v32Radius(location.radius)}%</b><input id="v32LocationRadius" type="range" min="3" max="20" value="${v32Radius(location.radius)}"></label>
  <div class="v32-panel-actions"><button id="v32SaveLocation" class="primary">Konumu Kaydet</button><button id="v32MoveLocation" class="ghost">Haritada Taşı</button>${location.fixedCastle?'':`<button id="v32DeleteLocation" class="danger">Noktayı Sil</button>`}</div></div>`;
}

function v32LockedBlock(title,text){
  return `<section class="v32-locked"><b>⌁ ${title}</b><p>${text}</p></section>`;
}
function v32PlayerLocationPanel(location){
  if(!location)return `<div class="v32-map-empty"><b>Keşfedilmiş bir konum seç</b><p>DM araziyi açtıkça sis dağılır. İşaret çıkan noktalara basarak elde ettiğiniz bilgileri görebilirsiniz.</p></div>`;
  let name=String(location.name||'').trim()||v32TypeName(location);
  return `<div class="v32-location-head"><span>${v32Icon(location)}</span><div><small>${esc(location.region||v32TypeName(location))}</small><h2>${esc(name)}</h2></div></div>
  ${location.revealHistory?`<section class="v32-info-section"><h3>Bilinen Geçmiş</h3><p>${esc(location.summary||'Bu yer hakkında kısa bir tanım bulunmuyor.')}</p>${location.history?`<p>${esc(location.history)}</p>`:''}</section>`:v32LockedBlock('Geçmiş bilinmiyor','Yerel halkla konuşmak, kayıtları araştırmak veya istihbarat toplamak gerekiyor.')}
  ${location.revealIntel?`<section class="v32-info-section"><h3>İçerisi ve Hizmetler</h3>${location.services?`<p><b>Hizmetler:</b> ${esc(location.services)}</p>`:''}<p><b>Demirci:</b> ${Number(location.blacksmithTier)>0?'Tier '+Number(location.blacksmithTier):'Yok veya bilinmiyor'}</p>${location.threat?`<p><b>Tehlike / savunma:</b> ${esc(location.threat)}</p>`:''}${location.intel?`<p>${esc(location.intel)}</p>`:''}</section>`:v32LockedBlock('İçerisi bilinmiyor','Kaleye girmek, gözcülük yapmak veya güvenilir istihbarat edinmek gerekiyor.')}
  ${location.revealDungeon?`<section class="v32-info-section"><h3>${esc(location.dungeonName||'Dungeon Bilgisi')}</h3><p><b>Önerilen seviye:</b> ${esc(location.recommendedLevel||'DM belirtmedi')}</p>${location.monsters?`<p><b>Beklenen yaratıklar:</b> ${esc(location.monsters)}</p>`:''}${location.dungeonNotes?`<p>${esc(location.dungeonNotes)}</p>`:''}</section>`:v32LockedBlock('Dungeon bilgisi bilinmiyor','Giriş, tehdit seviyesi ve içerideki yaratıklar henüz keşfedilmedi.')}`;
}

function v32LocationIndex(map,playerMode){
  let locations=map.locations.filter(location=>!playerMode||(location.revealMap&&location.revealMarker));
  return `<div class="v32-location-index"><div class="between row"><h3>${playerMode?'Keşfedilen Yerler':'Harita Noktaları'}</h3><small>${locations.length}</small></div>${locations.map(location=>`<button data-v32-location="${esc(location.id)}" class="${location.id===v32SelectedLocationId?'active':''}"><span>${v32Icon(location)}</span><b>${esc(playerMode?(String(location.name||'').trim()||v32TypeName(location)):v32LocationName(location))}</b><small>${esc(location.region||v32TypeName(location))}</small></button>`).join('')||'<p class="muted">Henüz keşfedilmiş konum yok.</p>'}</div>`;
}

function v32MapPage(){
  let map=v32EnsureMap();
  let playerMode=current.role==='player'||v32PlayerPreview;
  let selectable=map.locations.filter(location=>!playerMode||(location.revealMap&&location.revealMarker));
  if(!selectable.some(location=>location.id===v32SelectedLocationId))v32SelectedLocationId=selectable[0]?.id||null;
  let selected=map.locations.find(location=>location.id===v32SelectedLocationId);
  let revealed=map.revealAll?map.locations.length:map.locations.filter(location=>location.revealMap).length;
  return `<div class="v32-map-page"><div class="v26-page-head"><div><span class="v26-kicker">KAMPANYA HARİTASI</span><h2>Kadim Dünya</h2><p>${playerMode?'DM’nin açtığı bölgeler ve elde ettiğiniz bilgiler görünür.':'12 kaleyi ve yeni noktaları düzenle; arazi, geçmiş, istihbarat ve dungeon bilgisini ayrı ayrı aç.'}</p></div><div class="v26-actions">${current.role==='dm'?`<button id="v32PlayerPreview" class="${v32PlayerPreview?'primary':'ghost'}">${v32PlayerPreview?'DM Görünümüne Dön':'Oyuncu Görünümü'}</button><button id="v32AddLocation" class="${v32PlaceMode==='add'?'primary':'ghost'}">+ Yeni Nokta</button><button id="v32ToggleAllFog" class="ghost">${map.revealAll?'Genel Sisi Geri Getir':'Tüm Araziyi Aç'}</button><button id="v32ToggleFog" class="ghost">Sis ${map.fogEnabled?'Açık':'Kapalı'}</button>`:''}</div></div>
  ${v32PlaceMode?`<div class="v32-placement-notice">${v32PlaceMode==='add'?'Yeni noktanın yerini haritada seç.':'Seçili noktanın yeni yerini haritada seç.'}<button id="v32CancelPlace" class="ghost">Vazgeç</button></div>`:''}
  <div class="v32-map-layout"><section class="card v32-map-card"><div class="v32-map-toolbar"><span>${playerMode?`${revealed} alan keşfedildi`:`${map.locations.filter(x=>x.fixedCastle).length} kale • ${map.locations.length} toplam nokta`}</span><div><button data-v32-zoom="-20" class="ghost" aria-label="Haritayı küçült">−</button><b>%${v32MapZoom}</b><button data-v32-zoom="20" class="ghost" aria-label="Haritayı büyüt">＋</button></div></div><div class="v32-map-viewport"><div id="v32MapCanvas" class="v32-map-canvas ${v32PlaceMode?'placing':''}" style="width:${v32MapZoom}%"><img src="${V32_MAP_IMAGE}" alt="12 kaleli fantastik kampanya haritası" draggable="false">${v32RevealRings(map,playerMode)}${v32FogSvg(map,playerMode)}${v32MapMarkers(map,playerMode)}</div></div><p class="v32-map-help">${playerMode?'Sis dışındaki yolları ve araziyi incele; görünen işaretlere dokun.':'Yeşil halkalar oyuncuya açılmış araziyi gösterir. Kale isimleri ve bütün metinler görselin üstünde canlı veri olarak tutulur.'}</p></section><section class="card v32-map-panel">${playerMode?v32PlayerLocationPanel(selected):v32DmLocationPanel(selected)}${v32LocationIndex(map,playerMode)}</section></div></div>`;
}

function v32ReadLocationForm(location){
  if(!location.fixedCastle)location.kind=$('#v32LocationKind')?.value||location.kind;
  location.name=$('#v32LocationName')?.value.trim()||'';
  location.region=$('#v32LocationRegion')?.value.trim()||'';
  location.summary=$('#v32LocationSummary')?.value.trim()||'';
  location.history=$('#v32LocationHistory')?.value.trim()||'';
  location.services=$('#v32LocationServices')?.value.trim()||'';
  location.blacksmithTier=Math.max(0,Math.min(5,+($('#v32BlacksmithTier')?.value||0)));
  location.threat=$('#v32LocationThreat')?.value.trim()||'';
  location.intel=$('#v32LocationIntel')?.value.trim()||'';
  location.dungeonName=$('#v32DungeonName')?.value.trim()||'';
  location.recommendedLevel=$('#v32RecommendedLevel')?.value.trim()||'';
  location.monsters=$('#v32DungeonMonsters')?.value.trim()||'';
  location.dungeonNotes=$('#v32DungeonNotes')?.value.trim()||'';
  location.dmNotes=$('#v32DmNotes')?.value.trim()||'';
  location.revealMap=!!$('#v32RevealMap')?.checked;
  location.revealMarker=!!$('#v32RevealMarker')?.checked;
  location.revealHistory=!!$('#v32RevealHistory')?.checked;
  location.revealIntel=!!$('#v32RevealIntel')?.checked;
  location.revealDungeon=!!$('#v32RevealDungeon')?.checked;
  location.radius=v32Radius($('#v32LocationRadius')?.value);
}

function v32MapPointFromEvent(event,canvas){
  let rect=canvas.getBoundingClientRect();
  return {x:v32Percent((event.clientX-rect.left)/rect.width*100),y:v32Percent((event.clientY-rect.top)/rect.height*100)};
}

function v32BroadcastCampaign(){
  if(realtimeChannel&&realtimeCampaignId===current?.id)return realtimeChannel.send({type:'broadcast',event:'campaign-changed',payload:{campaignId:current.id,at:Date.now()}});
}

async function v32LoadGuildActivity(force=false){
  if(!auth||!current||v32GuildActivityLoading||(!force&&v32GuildActivityCampaign===current.id))return;
  let guild=typeof v26GuildState==='function'?v26GuildState():state.guild;
  let member=current.role==='dm'||!!guild?.members?.includes(auth.id);
  if(!guild||!member){v32GuildActivity=[];v32GuildActivityCampaign=current.id;v32GuildActivityError='';return}
  v32GuildActivityLoading=true;
  let campaignId=current.id;
  let {data,error}=await db.rpc('guild_activity_list_v32',{p_user:auth.id,p_campaign:campaignId});
  v32GuildActivityLoading=false;
  if(current?.id!==campaignId)return;
  v32GuildActivityCampaign=campaignId;
  v32GuildActivityError=error?error.message:'';
  v32GuildActivity=error?[]:(data||[]);
  if(page==='guild'||page==='guilddm')render();
}

function v32ActivityDate(value){
  if(!value)return '';
  let date=new Date(value);
  return Number.isNaN(date.getTime())?'':new Intl.DateTimeFormat('tr-TR',{dateStyle:'short',timeStyle:'short'}).format(date);
}
function v32ActivityText(entry){
  let actor=entry.character_name||entry.actor_name||'Bir lonca üyesi';
  let coin={platinum:'PP',gold:'GP',silver:'SP',copper:'CP'}[entry.coin]||String(entry.coin||'').toUpperCase();
  if(entry.action==='money_deposit')return `<b>${esc(actor)}</b> kasaya <strong>${entry.amount} ${esc(coin)}</strong> yatırdı.`;
  if(entry.action==='money_withdraw')return `<b>${esc(actor)}</b> kasadan <strong>${entry.amount} ${esc(coin)}</strong> çekti.`;
  if(entry.action==='item_deposit')return `<b>${esc(actor)}</b> lonca envanterine <strong>${entry.quantity}× ${esc(entry.item_name||'eşya')}</strong> koydu.`;
  if(entry.action==='item_withdraw')return `<b>${esc(actor)}</b> lonca envanterinden <strong>${entry.quantity}× ${esc(entry.item_name||'eşya')}</strong> aldı.`;
  return `<b>${esc(actor)}</b> bir lonca işlemi yaptı.`;
}
function v32GuildActivityCard(){
  let body;
  if(v32GuildActivityLoading&&v32GuildActivityCampaign!==current.id)body='<div class="empty">Lonca kayıtları açılıyor…</div>';
  else if(v32GuildActivityError)body=`<div class="v32-ledger-error"><b>Geçmiş yüklenemedi</b><p>${esc(v32GuildActivityError)}</p><small>Supabase SQL Editor’de v32-update.sql dosyasını çalıştır.</small></div>`;
  else body=v32GuildActivity.map(entry=>`<article class="v32-ledger-entry"><span class="v32-ledger-icon">${entry.action?.startsWith('money_')?'◈':'▣'}</span><div><p>${v32ActivityText(entry)}</p><small>${esc(entry.actor_name||'')} • ${v32ActivityDate(entry.created_at)}</small></div></article>`).join('')||'<div class="empty">Henüz oyuncu kaynaklı lonca işlemi yok.</div>';
  return `<section class="card v32-guild-ledger"><div class="between row"><div><span class="v26-kicker">ORTAK KAYIT</span><h3>Lonca İşlem Geçmişi</h3></div><span class="pill">SON 200</span></div><p class="muted">Oyuncuların kasaya ve ortak envantere yaptığı işlemler görünür. DM’nin manuel düzenlemeleri bu kayda eklenmez.</p><div class="v32-ledger-list">${body}</div></section>`;
}

const v32GuildPageBase=v26GuildPage;
function v32GuildPage(dm=false){
  let guild=v26GuildState(),member=v26GuildMember();
  queueMicrotask(()=>{exLoadWallets();if(guild&&member)v32LoadGuildActivity()});
  let base=v32GuildPageBase(dm);
  return `${base}${guild&&member?v32GuildActivityCard():''}`;
}

window.v32InvalidateGuildActivity=function(){v32GuildActivityCampaign=null;v32GuildActivityError=''};
window.v32GuildRefresh=async function(stateChanged,message){
  let campaignId=current?.id;
  window.v32InvalidateGuildActivity();
  exWalletCampaign=null;
  if(stateChanged)await syncFromServer(false);
  await Promise.all([exLoadWallets(true),v32LoadGuildActivity(true)]);
  if(current?.id!==campaignId)return;
  await v32BroadcastCampaign();
  render();
  if(message)toast(message);
};

if(!dmNav.some(row=>row[0]==='map'))dmNav.splice(Math.max(1,dmNav.findIndex(row=>row[0]==='world')),0,['map','⌖','Harita']);
if(!playerNav.some(row=>row[0]==='map'))playerNav.splice(Math.max(1,playerNav.findIndex(row=>row[0]==='inventory')),0,['map','⌖','Harita']);
dmPages.map=v32MapPage;
playerPages.map=()=>typeof sessionPending==='function'&&sessionPending()?sessionPendingPage():v32MapPage();
dmPages.guilddm=()=>`${v32GuildPage(true)}${typeof iaGround==='function'?iaGround(false):''}`;
playerPages.guild=()=>typeof sessionPending==='function'&&sessionPending()?sessionPendingPage():`${v32GuildPage(false)}${typeof iaGround==='function'?iaGround(true):''}`;

const v32RenderBase=render;
render=function(){if(current)v32EnsureMap();return v32RenderBase()};

const v32SyncBase=syncFromServer;
syncFromServer=async function(showStatus=false){
  let result=await v32SyncBase(showStatus);
  if(showStatus&&current){
    window.v32InvalidateGuildActivity();
    if(page==='guild'||page==='guilddm')await v32LoadGuildActivity(true);
  }
  return result;
};

document.addEventListener('click',async event=>{
  let button=event.target.closest('button');
  if(!current)return;
  let map=v32EnsureMap();
  if(button?.dataset.v32Location){v32SelectedLocationId=button.dataset.v32Location;v32PlaceMode='';render();return}
  if(button?.dataset.v32Zoom){v32MapZoom=Math.max(80,Math.min(220,v32MapZoom+(+button.dataset.v32Zoom||0)));render();return}
  if(button?.id==='v32PlayerPreview'){v32PlayerPreview=!v32PlayerPreview;v32PlaceMode='';render();return}
  if(button?.id==='v32AddLocation'){v32PlayerPreview=false;v32PlaceMode='add';render();return}
  if(button?.id==='v32CancelPlace'){v32PlaceMode='';v32PendingPoint=null;render();return}
  if(button?.id==='v32ToggleAllFog'){map.revealAll=!map.revealAll;save();render();return}
  if(button?.id==='v32ToggleFog'){map.fogEnabled=!map.fogEnabled;save();render();return}
  if(button?.id==='v32SaveLocation'){
    let location=map.locations.find(row=>row.id===v32SelectedLocationId);
    if(!location)return;
    v32ReadLocationForm(location);save();render();toast('Harita noktası kaydedildi');return;
  }
  if(button?.id==='v32MoveLocation'){v32PlaceMode='move';render();return}
  if(button?.id==='v32DeleteLocation'){
    let location=map.locations.find(row=>row.id===v32SelectedLocationId);
    if(!location||location.fixedCastle||!confirm(`${v32LocationName(location)} haritadan silinsin mi?`))return;
    map.locations=map.locations.filter(row=>row.id!==location.id);v32SelectedLocationId=null;save();render();return;
  }
  if(button?.id==='v32ConfirmAdd'){
    if(!v32PendingPoint)return;
    let kind=$('#v32NewKind')?.value||'landmark',name=$('#v32NewName')?.value.trim()||'';
    let location={id:uid(),fixedCastle:false,kind,x:v32PendingPoint.x,y:v32PendingPoint.y,radius:7,name,region:'',summary:'',history:'',services:'',blacksmithTier:0,threat:'',intel:'',dungeonName:'',recommendedLevel:'',monsters:'',dungeonNotes:'',dmNotes:'',revealMap:false,revealMarker:false,revealHistory:false,revealIntel:false,revealDungeon:false};
    map.locations.push(location);v32SelectedLocationId=location.id;v32PlaceMode='';v32PendingPoint=null;$('#modal')?.close();save();render();toast('Yeni harita noktası eklendi');return;
  }
},true);

document.addEventListener('click',event=>{
  let canvas=event.target.closest('#v32MapCanvas');
  if(!canvas||event.target.closest('[data-v32-location]')||current?.role!=='dm'||!v32PlaceMode)return;
  let point=v32MapPointFromEvent(event,canvas);
  if(v32PlaceMode==='move'){
    let location=v32EnsureMap().locations.find(row=>row.id===v32SelectedLocationId);
    if(!location)return;
    location.x=point.x;location.y=point.y;v32PlaceMode='';save();render();toast('Harita noktası taşındı');return;
  }
  v32PendingPoint=point;
  modal('Haritaya Nokta Ekle',`<label>Tür<select id="v32NewKind">${Object.entries(V32_MAP_TYPES).filter(([key])=>key!=='castle').map(([key,name])=>`<option value="${key}">${esc(name)}</option>`).join('')}</select></label>${field('v32NewName','Konum adı')}<p class="muted">Gizli ve lanetli dükkânları kalenin içine yazmak yerine haritada ayrı nokta olarak ekleyebilirsin.</p><button id="v32ConfirmAdd" class="primary">Noktayı Oluştur</button>`);
});

document.addEventListener('input',event=>{if(event.target.id==='v32LocationRadius'){let out=$('#v32RadiusValue');if(out)out.textContent=v32Radius(event.target.value)+'%'}});

if(current)render();
