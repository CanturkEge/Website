/* v38: castle roads, route planning and mount travel rules. */
let v38TravelCampaign=null;
let v38TravelFrom='';
let v38TravelTo='';
let v38TravelMount='foot';
let v38HighlightedRoads=new Set();

function v38Num(value,min,max,fallback){
  value=Number(value);
  return Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
}

function v38TravelReset(map){
  if(v38TravelCampaign===current?.id)return;
  v38TravelCampaign=current?.id||null;
  v38TravelFrom=map?.partyLocationId||'map-castle-05';
  v38TravelTo='';
  v38TravelMount='foot';
  v38HighlightedRoads=new Set();
}

function v38RoadsFor(map,playerMode=false){
  let known=new Map((map?.locations||[]).map(row=>[row.id,row]));
  return V38_ROADS.filter(road=>{
    let from=known.get(road.from),to=known.get(road.to);
    if(!from||!to)return false;
    return !playerMode||(v33LocationVisible(from)&&v33LocationVisible(to));
  });
}

function v38Route(map,fromId,toId,playerMode=false){
  if(!fromId||!toId||fromId===toId)return {nodes:fromId?[fromId]:[],roads:[],days:0};
  let roads=v38RoadsFor(map,playerMode),dist=new Map([[fromId,0]]),prev=new Map(),unvisited=new Set((map.locations||[]).map(row=>row.id));
  while(unvisited.size){
    let node=null,best=Infinity;
    for(let id of unvisited){let score=dist.get(id)??Infinity;if(score<best){best=score;node=id}}
    if(node==null||best===Infinity)break;
    unvisited.delete(node);
    if(node===toId)break;
    for(let road of roads){
      let next=road.from===node?road.to:road.to===node?road.from:null;
      if(!next||!unvisited.has(next))continue;
      let score=best+road.days;
      if(score<(dist.get(next)??Infinity)){dist.set(next,score);prev.set(next,{node,road})}
    }
  }
  if(!dist.has(toId))return null;
  let nodes=[toId],picked=[],cursor=toId;
  while(cursor!==fromId){let row=prev.get(cursor);if(!row)return null;picked.unshift(row.road);cursor=row.node;nodes.unshift(cursor)}
  return {nodes,roads:picked,days:dist.get(toId)};
}

function v38MountRule(itemOrId){
  let id=typeof itemOrId==='string'?itemOrId:itemOrId?.id;
  if(V38_MOUNT_RULES[id])return V38_MOUNT_RULES[id];
  if(itemOrId&&typeof itemOrId==='object'&&itemOrId.mount){
    return {name:itemOrId.name||'Özel binek',percent:v38Num(itemOrId.travelReduction,0,70,15),terrain:'DM belirler',note:'Özel binek için varsayılan kampanya oranıdır; araziye göre DM değiştirebilir.'};
  }
  return V38_MOUNT_RULES.foot;
}

function v38TravelTime(days,mountId){
  let percent=v38MountRule(mountId).percent;
  return Math.max(.5,Math.ceil((days*(1-percent/100))*2)/2);
}

function v38RoadSvg(map,playerMode){
  let locations=new Map((map.locations||[]).map(row=>[row.id,row]));
  let roads=v38RoadsFor(map,playerMode);
  if(!roads.length)return '';
  return `<svg class="v38-world-roads" viewBox="0 0 ${V32_MAP_WIDTH} ${V32_MAP_HEIGHT}" preserveAspectRatio="none" aria-label="Kaleler arası yollar">${roads.map(road=>{
    let a=locations.get(road.from),b=locations.get(road.to),x1=v32Percent(a.x)*V32_MAP_WIDTH/100,y1=v32Percent(a.y)*V32_MAP_HEIGHT/100,x2=v32Percent(b.x)*V32_MAP_WIDTH/100,y2=v32Percent(b.y)*V32_MAP_HEIGHT/100;
    let active=v38HighlightedRoads.has(road.id),danger=v37Fold(road.danger).replace(/\s+/g,'-');
    return `<g class="v38-road ${active?'active':''} danger-${danger}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line><text x="${(x1+x2)/2}" y="${(y1+y2)/2-7}" text-anchor="middle">${road.days}g</text></g>`;
  }).join('')}</svg>`;
}

const v38MapMarkersBase=v33MapMarkers;
v33MapMarkers=function(map,playerMode){
  return `${v38RoadSvg(map,playerMode)}${v38MapMarkersBase(map,playerMode)}`;
};

function v38KnownLocations(map,playerMode){
  return (map.locations||[]).filter(row=>row.fixedCastle&&(!playerMode||v33LocationVisible(row)));
}

function v38MountOptions(){
  let ordered=['foot',...Object.keys(V38_MOUNT_RULES).filter(id=>id!=='foot'&&id!=='ex-v34-courier-relay')];
  return ordered.map(id=>[id,v38MountRule(id)]);
}

function v38DayText(days){
  return Number.isInteger(days)?`${days} gün`:`${String(days).replace('.',',')} gün`;
}

function v38TravelPanel(playerMode=false){
  let map=v33EnsureMap();v38TravelReset(map);
  let locations=v38KnownLocations(map,playerMode);
  if(!locations.some(row=>row.id===v38TravelFrom))v38TravelFrom=locations.find(row=>row.id===map.partyLocationId)?.id||locations[0]?.id||'';
  if(!locations.some(row=>row.id===v38TravelTo)||v38TravelTo===v38TravelFrom){
    let direct=v38RoadsFor(map,playerMode).find(road=>road.from===v38TravelFrom||road.to===v38TravelFrom);
    v38TravelTo=(direct&&(direct.from===v38TravelFrom?direct.to:direct.from))||locations.find(row=>row.id!==v38TravelFrom)?.id||'';
  }
  let route=v38Route(map,v38TravelFrom,v38TravelTo,playerMode),mount=v38MountRule(v38TravelMount);
  v38HighlightedRoads=new Set(route?.roads.map(row=>row.id)||[]);
  let byId=new Map((map.locations||[]).map(row=>[row.id,row])),adjusted=route?v38TravelTime(route.days,v38TravelMount):0;
  let options=locations.map(row=>`<option value="${esc(row.id)}">${esc(v32LocationName(row))}</option>`).join('');
  return `<section class="v38-travel card"><div class="v38-travel-head"><div><span class="v26-kicker">YOL AĞI VE SEYAHAT</span><h2>Kale Rotası Planla</h2><p>Haritadaki yol etiketleri yaya temel süresini gösterir. En kısa bilinen rota otomatik hesaplanır.</p></div><span class="v38-house-rule">Kampanya seyahat kuralı</span></div>
    <div class="v38-travel-controls"><label>Nereden<select id="v38TravelFrom">${options.replace(`value="${v38TravelFrom}"`,`value="${v38TravelFrom}" selected`)}</select></label><button id="v38SwapTravel" class="ghost" title="Yönü değiştir">⇄</button><label>Nereye<select id="v38TravelTo">${options.replace(`value="${v38TravelTo}"`,`value="${v38TravelTo}" selected`)}</select></label><label>Binek / ulaşım<select id="v38TravelMount">${v38MountOptions().map(([id,row])=>`<option value="${esc(id)}" ${id===v38TravelMount?'selected':''}>${esc(row.name)} • %${row.percent}</option>`).join('')}</select></label></div>
    ${route?`<div class="v38-route-result"><div><small>YAYA TEMEL SÜRE</small><b>${v38DayText(route.days)}</b></div><div><small>${esc(mount.name.toLocaleUpperCase('tr-TR'))}</small><b>−%${mount.percent}</b></div><div class="final"><small>TAHMİNİ YOLCULUK</small><b>${v38DayText(adjusted)}</b></div>${current.role==='dm'&&!playerMode?`<button id="v38ApplyTravel" class="primary">Seyahati Uygula</button>`:''}</div>
      <div class="v38-route-detail"><div><b>${route.nodes.map(id=>esc(v32LocationName(byId.get(id)))).join(' → ')}</b><small>${esc(mount.terrain)} • ${esc(mount.note)}</small></div><details><summary>${route.roads.length} yol parçasını göster</summary>${route.roads.map(road=>`<article><b>${esc(road.terrain)}</b><span>${road.days} gün • ${esc(road.danger)} risk</span><p>${esc(road.note)}</p></article>`).join('')}</details></div>`:`<div class="empty">Bu iki keşfedilmiş kale arasında bilinen yol bağlantısı yok.</div>`}
    <p class="v38-rule-note"><b>Not:</b> D&D 2014 her binek için evrensel bir “% süre azaltma” tablosu vermez. Buradaki oranlar masa akışını hızlandıran açık Kadim Masa Defteri kuralıdır; kötü hava, yük, dağ veya bataklıkta DM oranı değiştirebilir.</p>
  </section>`;
}

const v38DmMapBase=dmPages.map;
const v38PlayerMapBase=playerPages.map;
dmPages.map=()=>{let panel=v38TravelPanel(false);return `${v38DmMapBase()}${panel}`};
playerPages.map=()=>{
  if(typeof sessionPending==='function'&&sessionPending())return v38PlayerMapBase();
  let panel=v38TravelPanel(true);return `${v38PlayerMapBase()}${panel}`;
};

const v38ItemCardBase=exItemCard;
exItemCard=function(item){
  let html=v38ItemCardBase(item),rule=V38_MOUNT_RULES[item?.id]||(item?.mount?v38MountRule(item):null);
  if(!rule)return html;
  let badge=`<div class="v38-mount-rule"><b>Yolculuk −%${rule.percent}</b><span>${esc(rule.terrain)}</span><small>${esc(rule.note)}</small></div>`;
  return html.replace('<div class="between row"><div>',`${badge}<div class="between row"><div>`);
};

function v38RefreshMap(){if(page==='map')render()}

document.addEventListener('change',event=>{
  if(event.target.id==='v38TravelFrom'){v38TravelFrom=event.target.value;v38RefreshMap()}
  if(event.target.id==='v38TravelTo'){v38TravelTo=event.target.value;v38RefreshMap()}
  if(event.target.id==='v38TravelMount'){v38TravelMount=event.target.value;v38RefreshMap()}
});

document.addEventListener('click',event=>{
  let button=event.target.closest('button');if(!button||!current)return;
  if(button.id==='v38SwapTravel'){
    [v38TravelFrom,v38TravelTo]=[v38TravelTo,v38TravelFrom];render();return;
  }
  if(button.id==='v38ApplyTravel'&&current.role==='dm'){
    let map=v33EnsureMap(),route=v38Route(map,v38TravelFrom,v38TravelTo,false);if(!route)return;
    let adjusted=v38TravelTime(route.days,v38TravelMount),mount=v38MountRule(v38TravelMount),from=map.locations.find(row=>row.id===v38TravelFrom),to=map.locations.find(row=>row.id===v38TravelTo);
    if(!confirm(`${v32LocationName(from)} → ${v32LocationName(to)} seyahati uygulansın mı?\n${v38DayText(adjusted)} (${mount.name}, -%${mount.percent})`))return;
    sessionEnsure();let start=state.worldDate,date=new Date(start+'T12:00:00');date.setDate(date.getDate()+Math.ceil(adjusted));state.worldDate=date.toISOString().slice(0,10);
    map.partyLocationId=to.id;
    state.travelHistory??=[];state.travelHistory.unshift({id:uid(),fromId:from.id,toId:to.id,fromName:v32LocationName(from),toName:v32LocationName(to),mount:mount.name,reduction:mount.percent,baseDays:route.days,days:adjusted,startDate:start,endDate:state.worldDate,createdAt:new Date().toISOString()});state.travelHistory=state.travelHistory.slice(0,100);
    if(typeof v34ApplyCastleMarket==='function')v34ApplyCastleMarket(to.id,false);
    save();render();toast(`${v32LocationName(to)} • ${v38DayText(adjusted)} sonra varıldı`);return;
  }
});
