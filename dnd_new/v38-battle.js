/* v38 tactical battle board. Keeps the legacy encounter list as the combat source. */
let v38BattleCampaign=null;
let v38BattlePreview=false;
let v38BattleTool='select';
let v38PaletteSelection=null;
let v38SelectedTokenId=null;
let v38SelectedPropId=null;
let v38MonsterQuery='';
let v38FogPainting=false;
let v38FogPaintKey='';
let v38SaveTimer=null;
let v38EnsureSaveQueued=false;
let v38PlayerMovePending=false;
let v38BattleZoom=1.12;
let v38TokenDrag=null;
let v38SuppressTokenClick='';
const v38VisionCache=new WeakMap();

function v38BattleBlank(){
  return {version:1,name:'Taktik Savaş Alanı',published:false,preset:'ruins',theme:'ruins',cols:20,rows:14,cellSize:46,lighting:'bright',fogEnabled:true,fogBase:'hidden',fogCells:[],tokens:[],props:[]};
}

function v38PresetProps(key){
  let preset=V38_BATTLE_PRESETS[key]||V38_BATTLE_PRESETS.empty;
  return (preset.props||[]).map(row=>{
    let def=V38_PROP_DEFS[row[0]]||V38_PROP_DEFS.difficult;
    return {id:uid(),type:row[0],x:+row[1]||0,y:+row[2]||0,w:+row[3]||def.w||1,h:+row[4]||def.h||1,label:def.label,blocksMove:!!def.blocksMove,blocksVision:!!def.blocksVision,difficult:!!def.difficult,cover:def.cover||'',light:+def.light||0,zone:def.zone||''};
  });
}

function v38ApplyPresetData(b,key,keepTokens=true){
  let preset=V38_BATTLE_PRESETS[key]||V38_BATTLE_PRESETS.empty;
  b.preset=key;b.name=preset.name;b.theme=preset.theme||'plain';b.cols=preset.cols;b.rows=preset.rows;b.lighting=preset.lighting||'bright';b.fogEnabled=true;b.fogBase='hidden';b.fogCells=[];b.props=v38PresetProps(key);
  if(!keepTokens)b.tokens=[];
  let playerStart=b.props.find(row=>row.zone==='player')||{x:1,y:b.rows-3,w:3,h:2};
  let enemyStart=b.props.find(row=>row.zone==='enemy')||{x:b.cols-4,y:1,w:3,h:2};
  let pc=0,ec=0;
  for(let token of b.tokens||[]){
    let fighter=(state.encounter||[]).find(row=>row.id===token.combatantId),isPlayer=v38FighterKind(fighter)==='player',slot=isPlayer?pc++:ec++,zone=isPlayer?playerStart:enemyStart;
    token.x=Math.min(b.cols-1,zone.x+(slot%Math.max(1,zone.w||2)));token.y=Math.min(b.rows-1,zone.y+Math.floor(slot/Math.max(1,zone.w||2)));token.turnStartX=token.x;token.turnStartY=token.y;token.movedFeet=0;
  }
}

function v38FighterKind(fighter){
  if(!fighter)return 'monster';
  if(fighter.kind)return fighter.kind;
  if(fighter.characterId||fighter.userId&&state.characters?.some(row=>row.userId===fighter.userId))return 'player';
  if(fighter.sourceNpcId)return 'npc';
  return 'monster';
}

function v38CharacterForFighter(fighter){
  return (state.characters||[]).find(row=>row.id===fighter?.characterId)||(state.characters||[]).find(row=>row.userId&&row.userId===fighter?.userId)||null;
}

function v38DarkvisionFor(fighter){
  let c=v38CharacterForFighter(fighter);if(!c)return 0;
  let text=`${c.species||''} ${c.subspecies||''} ${(typeof v28SubspeciesText==='function'?v28SubspeciesText(c.subspecies,c.species):'')} ${JSON.stringify(c.resistances||[])} ${JSON.stringify(c.skills||[])}`;
  let match=text.match(/(\d+)\s*ft\s*darkvision/i);if(match)return +match[1];
  return /darkvision/i.test(text)?60:0;
}

function v38FighterSpeed(fighter){
  let c=v38CharacterForFighter(fighter);
  return v38Num(fighter?.speed??c?.speed,5,200,30);
}

function v38NextFreeCell(b,kind='monster'){
  let occupied=new Set((b.tokens||[]).map(row=>`${row.x},${row.y}`)),startY=kind==='player'?b.rows-2:1,dir=kind==='player'?-1:1;
  for(let row=0;row<b.rows;row++)for(let x=1;x<b.cols-1;x++){let y=Math.max(0,Math.min(b.rows-1,startY+row*dir));if(!occupied.has(`${x},${y}`))return {x,y}}
  return {x:0,y:0};
}

function v38NewToken(b,fighter,point=null){
  let kind=v38FighterKind(fighter),spot=point||v38NextFreeCell(b,kind);
  return {id:uid(),combatantId:fighter.id,kind,x:Math.max(0,Math.min(b.cols-1,+spot.x||0)),y:Math.max(0,Math.min(b.rows-1,+spot.y||0)),size:1,speed:v38FighterSpeed(fighter),vision:60,darkvision:v38DarkvisionFor(fighter),hidden:false,color:kind==='player'?'#2f8d65':kind==='npc'?'#3c70a4':'#a83e38',turnStartX:+spot.x||0,turnStartY:+spot.y||0,movedFeet:0};
}

function v38ClampBattle(b){
  b.cols=Math.round(v38Num(b.cols,8,40,20));b.rows=Math.round(v38Num(b.rows,8,30,14));b.cellSize=Math.round(v38Num(b.cellSize,34,64,46));
  for(let token of b.tokens||[]){token.size=Math.round(v38Num(token.size,1,4,1));token.x=Math.round(v38Num(token.x,0,b.cols-token.size,0));token.y=Math.round(v38Num(token.y,0,b.rows-token.size,0));token.speed=v38Num(token.speed,5,200,30);token.vision=v38Num(token.vision,0,300,60);token.darkvision=v38Num(token.darkvision,0,300,0);token.movedFeet=Math.max(0,+token.movedFeet||0)}
  for(let prop of b.props||[]){let def=V38_PROP_DEFS[prop.type]||V38_PROP_DEFS.difficult;prop.w=Math.round(v38Num(prop.w,1,b.cols,def.w||1));prop.h=Math.round(v38Num(prop.h,1,b.rows,def.h||1));prop.x=Math.round(v38Num(prop.x,0,b.cols-prop.w,0));prop.y=Math.round(v38Num(prop.y,0,b.rows-prop.h,0));}
  b.fogCells=(b.fogCells||[]).filter(key=>{let [x,y]=String(key).split(',').map(Number);return x>=0&&y>=0&&x<b.cols&&y<b.rows});
}

function v38EnsureBattle(mutate=current?.role==='dm'){
  if(!state)return v38BattleBlank();
  let created=false;
  if(!state.battleMap){
    if(!mutate)return v38BattleBlank();
    state.battleMap=v38BattleBlank();v38ApplyPresetData(state.battleMap,'ruins',true);created=true;
  }
  let b=state.battleMap,changed=created;
  let defaults=v38BattleBlank();for(let [key,value] of Object.entries(defaults)){if(b[key]==null){b[key]=Array.isArray(value)?[]:value;changed=true}}
  if(!mutate){v38ClampBattle(b);return b}
  if(v38BattleCampaign!==current?.id){v38BattleCampaign=current?.id||null;v38BattlePreview=false;v38BattleTool='select';v38PaletteSelection=null;v38SelectedTokenId=null;v38SelectedPropId=null;v38MonsterQuery='';v38BattleZoom=1.12}
  for(let fighter of state.encounter||[]){if(!fighter.id){fighter.id=uid();changed=true}}
  let ids=new Set((state.encounter||[]).map(row=>row.id)),before=(b.tokens||[]).length;
  b.tokens=(b.tokens||[]).filter(token=>!token.combatantId||ids.has(token.combatantId));if(b.tokens.length!==before)changed=true;
  for(let fighter of state.encounter||[]){
    let token=b.tokens.find(row=>row.combatantId===fighter.id);
    if(!token){b.tokens.push(v38NewToken(b,fighter));changed=true;continue}
    let kind=v38FighterKind(fighter);if(!token.kind){token.kind=kind;changed=true}if(token.speed==null){token.speed=v38FighterSpeed(fighter);changed=true}if(token.vision==null){token.vision=60;changed=true}if(token.darkvision==null){token.darkvision=v38DarkvisionFor(fighter);changed=true}if(!token.id){token.id=uid();changed=true}
  }
  for(let prop of b.props||[]){if(!prop.id){prop.id=uid();changed=true}}
  v38ClampBattle(b);
  if(changed&&current?.role==='dm'&&!v38EnsureSaveQueued){let campaignId=current.id;v38EnsureSaveQueued=true;queueMicrotask(()=>{v38EnsureSaveQueued=false;if(current?.id===campaignId)save()})}
  return b;
}

function v38Combatant(token){return (state.encounter||[]).find(row=>row.id===token?.combatantId)}
function v38PlayerOwnsToken(token){
  let fighter=v38Combatant(token),character=v38CharacterForFighter(fighter);
  return !!(current?.role==='player'&&fighter&&token?.kind==='player'&&(fighter.userId===auth?.id||character?.userId===auth?.id));
}
function v38PlayerCanMoveToken(token){let fighter=v38Combatant(token),b=v38EnsureBattle(false);return !!(v38PlayerOwnsToken(token)&&fighter?.turn&&state.encounterActive&&b.published)}
function v38CellKey(x,y){return `${x},${y}`}
function v38ManualReveal(b,x,y){let exception=(b.fogCells||[]).includes(v38CellKey(x,y));return b.fogBase==='revealed'?!exception:exception}

function v38PropCells(prop){
  let out=[];for(let y=prop.y;y<prop.y+prop.h;y++)for(let x=prop.x;x<prop.x+prop.w;x++)out.push(v38CellKey(x,y));return out;
}

function v38LineOfSightBlocked(blocked,sx,sy,tx,ty){
  let x=sx,y=sy,dx=Math.abs(tx-sx),dy=Math.abs(ty-sy),stepX=sx<tx?1:-1,stepY=sy<ty?1:-1,err=dx-dy;
  while(!(x===tx&&y===ty)){let twice=2*err;if(twice>-dy){err-=dy;x+=stepX}if(twice<dx){err+=dx;y+=stepY}if(x===tx&&y===ty)break;if(blocked.has(v38CellKey(x,y)))return false}
  return true;
}

function v38LineOfSight(b,sx,sy,tx,ty){return v38LineOfSightBlocked(new Set((b.props||[]).filter(row=>row.blocksVision).flatMap(v38PropCells)),sx,sy,tx,ty)}

function v38VisibilitySignature(b){
  return `${b.cols}|${b.rows}|${b.lighting}|${b.fogEnabled}|${b.fogBase}|${(b.fogCells||[]).join(';')}|${(b.tokens||[]).map(row=>`${row.id}:${row.kind}:${row.x}:${row.y}:${row.vision}:${row.darkvision}`).join('|')}|${(b.props||[]).map(row=>`${row.id}:${row.x}:${row.y}:${row.w}:${row.h}:${row.blocksVision?1:0}:${row.light||0}`).join('|')}`;
}

function v38PlayerVisibleCells(b){
  let signature=v38VisibilitySignature(b),cached=v38VisionCache.get(b);if(cached?.signature===signature)return cached.cells;
  let cells=new Set(),allowed=[];for(let y=0;y<b.rows;y++)for(let x=0;x<b.cols;x++)if(!b.fogEnabled||v38ManualReveal(b,x,y))allowed.push([x,y]);
  if(b.lighting==='bright'){for(let [x,y] of allowed)cells.add(v38CellKey(x,y));v38VisionCache.set(b,{signature,cells});return cells}
  let sources=[];for(let token of b.tokens||[]){if(token.kind!=='player')continue;let radius=(b.lighting==='dark'?token.darkvision:token.vision)/5;sources.push({x:token.x,y:token.y,radius:Math.max(0,radius)})}
  for(let prop of b.props||[]){if(+prop.light>0)sources.push({x:prop.x+Math.floor(prop.w/2),y:prop.y+Math.floor(prop.h/2),radius:+prop.light})}
  if(!sources.length){for(let [x,y] of allowed)cells.add(v38CellKey(x,y));v38VisionCache.set(b,{signature,cells});return cells}
  let blocked=new Set((b.props||[]).filter(row=>row.blocksVision).flatMap(v38PropCells));
  for(let [x,y] of allowed)if(sources.some(source=>Math.max(Math.abs(x-source.x),Math.abs(y-source.y))<=source.radius&&v38LineOfSightBlocked(blocked,source.x,source.y,x,y)))cells.add(v38CellKey(x,y));
  v38VisionCache.set(b,{signature,cells});return cells;
}

function v38PlayerCellVisible(b,x,y){
  return v38PlayerVisibleCells(b).has(v38CellKey(x,y));
}

function v38CellIsHidden(b,x,y,playerMode){
  if(!b.fogEnabled&&(!playerMode||b.lighting==='bright'))return false;
  return playerMode?!v38PlayerCellVisible(b,x,y):b.fogEnabled&&!v38ManualReveal(b,x,y);
}

function v38FogCellsHtml(b,playerMode){
  let cells=[];for(let y=0;y<b.rows;y++)for(let x=0;x<b.cols;x++)if(v38CellIsHidden(b,x,y,playerMode))cells.push(`<i data-v38-fog-cell="${x},${y}" style="grid-column:${x+1};grid-row:${y+1}"></i>`);return cells.join('');
}

function v38DisplayCell(b){return Math.round(Math.max(34,Math.min(84,b.cellSize*v38BattleZoom)))}

function v38PropHtml(b,prop,playerMode){
  let def=V38_PROP_DEFS[prop.type]||V38_PROP_DEFS.difficult,hidden=playerMode&&!v38PropCells(prop).some(key=>{let [x,y]=key.split(',').map(Number);return !v38CellIsHidden(b,x,y,true)});
  if(hidden||playerMode&&prop.zone)return '';
  let style=`left:${prop.x/b.cols*100}%;top:${prop.y/b.rows*100}%;width:${prop.w/b.cols*100}%;height:${prop.h/b.rows*100}%`;
  return `<button class="v38-prop type-${esc(prop.type)} kind-${esc(def.kind||'object')} ${prop.id===v38SelectedPropId?'selected':''}" style="${style}" data-v38-prop="${esc(prop.id)}" title="${esc(prop.label||def.label)}${prop.blocksVision?' • görüşü keser':''}${prop.blocksMove?' • geçilemez':''}"><span>${esc(def.icon)}</span><small>${esc(prop.label||def.label)}</small></button>`;
}

function v38TokenHtml(b,token,playerMode){
  let fighter=v38Combatant(token);if(!fighter)return '';
  let partyToken=token.kind==='player',owned=playerMode&&v38PlayerOwnsToken(token),movable=owned&&v38PlayerCanMoveToken(token),cellVisible=!v38CellIsHidden(b,token.x,token.y,true);
  if(playerMode&&(!partyToken&&(token.hidden||!cellVisible)))return '';
  let style=`--token:${esc(token.color||'#9b5f25')};left:${token.x/b.cols*100}%;top:${token.y/b.rows*100}%;width:${token.size/b.cols*100}%;height:${token.size/b.rows*100}%`;
  let remaining=Math.max(0,(+token.speed||0)-(+token.movedFeet||0));
  return `<button class="v38-token kind-${esc(token.kind)} ${fighter.turn?'active-turn':''} ${token.id===v38SelectedTokenId?'selected':''} ${token.movedFeet>token.speed?'over-speed':''} ${(partyToken||!playerMode)?'above-fog':''} ${movable?'player-movable':''}" style="${style}" data-v38-token="${esc(token.id)}" title="${esc(fighter.name)} • HP ${fighter.hp}/${fighter.maxHp||fighter.hp} • AC ${fighter.ac} • Hız ${token.speed} ft${owned?` • Kalan ${remaining} ft`:''}"><b>${esc(String(fighter.name||'?').slice(0,2).toUpperCase())}</b><span>${esc(fighter.name)}</span><small>${owned?`${remaining} ft kaldı`:`${token.speed} ft${token.movedFeet?` • ${token.movedFeet} ft`:''}`}</small></button>`;
}

function v38BattleBoard(b,playerMode=false){
  let readOnly=playerMode||v38BattlePreview,cellSize=v38DisplayCell(b),style=`--cols:${b.cols};--rows:${b.rows};--cell-x:${100/b.cols}%;--cell-y:${100/b.rows}%;width:100%;min-width:${b.cols*cellSize}px;aspect-ratio:${b.cols}/${b.rows}`;
  return `<div class="v38-board-frame"><div class="v38-board-toolbar"><span><b>${playerMode?'Savaş alanı':'Harita kontrolü'}</b><small>Boş alanda kaydır • Tokenı tutup taşı</small></span><div><button class="ghost" data-v38-zoom="-0.12" aria-label="Uzaklaştır">−</button><button class="ghost v38-zoom-reset" data-v38-zoom="reset">%${Math.round(v38BattleZoom*100)}</button><button class="ghost" data-v38-zoom="0.12" aria-label="Yakınlaştır">+</button></div></div><div class="v38-board-scroll"><div class="v38-board theme-${esc(b.theme)} ${readOnly?'readonly':''}" data-v38-board="1" style="${style}"><div class="v38-prop-layer">${(b.props||[]).map(prop=>v38PropHtml(b,prop,readOnly)).join('')}</div><div class="v38-token-layer">${(b.tokens||[]).map(token=>v38TokenHtml(b,token,readOnly)).join('')}</div><div class="v38-fog-layer ${readOnly?'player-fog':'dm-fog'}" style="grid-template-columns:repeat(${b.cols},minmax(0,1fr));grid-template-rows:repeat(${b.rows},minmax(0,1fr))">${v38FogCellsHtml(b,readOnly)}</div></div></div></div>`;
}

function v38InitiativeStrip(b,playerMode=false){
  let rows=(state.encounter||[]).map(fighter=>{let token=b.tokens.find(row=>row.combatantId===fighter.id),kind=token?.kind||v38FighterKind(fighter),hidden=playerMode&&kind!=='player'&&(!token||token.hidden||v38CellIsHidden(b,token.x,token.y,true)),owned=!!(playerMode&&token&&v38PlayerOwnsToken(token));if(hidden)return '';return `<button class="${fighter.turn?'active':''} ${owned?'own-token':''}" data-v38-select-token="${esc(token?.id||'')}" ${playerMode&&!owned?'disabled':''}><i style="--token:${esc(token?.color||'#8a633c')}"></i><span><b>${esc(fighter.name)}</b><small>Init ${+fighter.init||0} • HP ${fighter.hp}/${fighter.maxHp||fighter.hp} • AC ${fighter.ac}</small></span><strong>${token?.speed||v38FighterSpeed(fighter)} ft</strong>${token?.movedFeet?`<em>${token.movedFeet} ft gitti</em>`:''}</button>`}).join('');
  return `<div class="v38-initiative">${rows||'<div class="empty">Henüz katılımcı yok.</div>'}</div>`;
}

function v38PaletteRow(type,id,name,detail){
  return `<div class="v38-palette-row"><button draggable="true" data-v38-palette-type="${esc(type)}" data-v38-palette-id="${esc(id)}"><span>${esc(name)}</span><small>${detail}</small></button><button class="v38-quick-add" data-v38-add-now="${esc(type)}" data-v38-add-id="${esc(id)}" title="Doğrudan boş bir kareye ekle" aria-label="${esc(name)} ekle">+</button></div>`;
}

function v38MonsterRows(){
  let needle=v37Fold(v38MonsterQuery);return allMonsters().filter(row=>!needle||v37Fold(`${row.name} ${row.category||''} ${row.cr||''}`).includes(needle)).slice(0,80);
}

function v38MonsterListHtml(rows=v38MonsterRows()){
  return rows.map(row=>v38PaletteRow('monster',row.id,row.name,`CR ${esc(row.cr||'?')} • HP ${row.hp} • AC ${row.ac} • ${row.speed} ft`)).join('')||'<div class="empty">Eşleşen yaratık yok.</div>';
}

function v38MonsterPaletteHtml(){
  let rows=v38MonsterRows();return `<div class="v38-monster-search"><input id="v38MonsterSearch" value="${esc(v38MonsterQuery)}" placeholder="Yaratık veya CR ara…"><small id="v38MonsterCount">${rows.length} sonuç</small></div><div id="v38MonsterList" class="v38-palette-list">${v38MonsterListHtml(rows)}</div>`;
}

function v38RosterHtml(b){
  let rows=(state.encounter||[]).map(fighter=>{let token=b.tokens.find(row=>row.combatantId===fighter.id);if(!token)return '';return `<div class="v38-roster-row ${token.id===v38SelectedTokenId?'selected':''}"><button data-v38-roster-select="${esc(token.id)}"><i style="--token:${esc(token.color||'#8a633c')}"></i><span><b>${esc(fighter.name)}</b><small>HP ${fighter.hp}/${fighter.maxHp||fighter.hp} • Init ${+fighter.init||0} • (${token.x+1}, ${token.y+1})</small></span></button><button class="danger" data-v38-delete-token="${esc(token.id)}" aria-label="${esc(fighter.name)} sil">×</button></div>`}).join('');
  return rows||'<div class="empty">Henüz savaşçı yok.</div>';
}

function v38Palette(b){
  let characters=(state.characters||[]).filter(row=>row.approvalStatus!=='pending'),npcs=state.npcs||[];
  return `<aside class="v38-palette"><details open><summary>Savaşçılar (${(state.encounter||[]).length})</summary><div class="v38-roster-list">${v38RosterHtml(b)}</div></details><details open><summary>Hazır Yaratıklar</summary><div id="v38MonsterPalette">${v38MonsterPaletteHtml()}</div></details><details><summary>Oyuncular ve NPC’ler</summary><div class="v38-palette-list">${characters.map(row=>v38PaletteRow('character',row.id,row.name,`Lv ${row.level} ${esc(row.className||'')} • HP ${row.hp}/${row.maxHp} • ${row.speed||30} ft`)).join('')||'<small>Onaylı karakter yok.</small>'}${npcs.map(row=>v38PaletteRow('npc',row.id,row.name,`NPC • HP ${row.hp}/${row.maxHp} • AC ${row.ac}`)).join('')}</div></details><details><summary>Arazi ve Objeler</summary><div class="v38-prop-palette">${Object.entries(V38_PROP_DEFS).map(([id,row])=>`<button draggable="true" data-v38-palette-type="prop" data-v38-palette-id="${id}" title="${row.blocksVision?'Görüşü keser. ':''}${row.blocksMove?'Üzerinden geçilemez. ':''}${row.difficult?'Zor arazi. ':''}"><b>${esc(row.icon)}</b><span>${esc(row.label)}</span></button>`).join('')}</div></details><p class="v38-palette-help">+ ile boş kareye hemen ekle. Masaüstünde öğeyi veya tokenı tutup sürükle; telefonda önce öğeye, sonra hedef kareye dokun.</p></aside>`;
}

function v38TokenInspector(b,token){
  let fighter=v38Combatant(token);if(!fighter)return '';
  return `<div class="v38-inspector-card"><div class="v38-inspector-title"><i style="--token:${esc(token.color)}"></i><div><small>${token.kind==='player'?'OYUNCU':token.kind==='npc'?'NPC':'YARATIK'}${fighter.turn?' • AKTİF SIRA':''}</small><h3>${esc(fighter.name)}</h3><p>Kare ${token.x+1}, ${token.y+1} • ${token.movedFeet||0}/${token.speed} ft hareket</p></div></div><div class="v38-vitals"><span><b>${fighter.hp}/${fighter.maxHp||fighter.hp}</b>HP</span><span><b>${fighter.ac}</b>AC</span><span><b>${+fighter.init||0}</b>Initiative</span></div><h4 class="v38-inspector-section">Can ve sıra</h4><div class="v38-hp-tools"><button data-v38-hp="-5">−5 HP</button><button data-v38-hp="-1">−1 HP</button><button data-v38-hp="1">+1 HP</button><button data-v38-hp="5">+5 HP</button></div><h4 class="v38-inspector-section">Konum ve savaş değerleri</h4><div class="v38-two-input"><label>Initiative<input id="v38TokenInit" type="number" value="${+fighter.init||0}"></label><label>Zırh sınıfı (AC)<input id="v38TokenAc" type="number" min="0" max="40" value="${+fighter.ac||10}"></label></div><div class="v38-two-input"><label>Sütun (X)<input id="v38TokenX" type="number" min="1" max="${b.cols}" value="${token.x+1}"></label><label>Satır (Y)<input id="v38TokenY" type="number" min="1" max="${b.rows}" value="${token.y+1}"></label></div><label>Hız (ft)<input id="v38TokenSpeed" type="number" min="5" max="200" value="${token.speed}"></label><label>Boyut (kare)<input id="v38TokenSize" type="number" min="1" max="4" value="${token.size}"></label><h4 class="v38-inspector-section">Görüş ve görünüm</h4><label>Normal görüş (ft)<input id="v38TokenVision" type="number" min="0" max="300" step="5" value="${token.vision}"></label><label>Darkvision (ft)<input id="v38TokenDarkvision" type="number" min="0" max="300" step="5" value="${token.darkvision}"></label><label>Token rengi<input id="v38TokenColor" type="color" value="${esc(token.color||'#a83e38')}"></label><label class="check"><input id="v38TokenHidden" type="checkbox" ${token.hidden?'checked':''}> Oyuncudan gizle</label><div class="v38-inspector-actions"><button id="v38SaveToken" class="primary">Değişiklikleri Kaydet</button><button id="v38MakeTurn" class="ghost">Sırayı Buna Ver</button></div><div class="v38-attack-info"><b>Saldırılar / Özellikler</b><p>${esc(fighter.attacks||fighter.note||fighter.traits||'Karakter saldırı bonusları karakterin Yetenekler sayfasındaki Fight kartında görünür.')}</p>${fighter.traits&&fighter.traits!==fighter.note?`<small>${esc(fighter.traits)}</small>`:''}<div><button id="v38AttackRoll" class="ghost">d20 Saldırı At</button><button id="v38DamageRoll" class="ghost">Hasar At</button></div></div><button id="v38DeleteToken" class="danger v38-delete-combatant">Savaşçı ve Tokenı Sil</button></div>`;
}

function v38PropInspector(prop){
  let def=V38_PROP_DEFS[prop.type]||V38_PROP_DEFS.difficult;
  return `<div class="v38-inspector-card"><div class="v38-inspector-title"><b class="prop-icon">${esc(def.icon)}</b><div><small>ARAZİ / OBJE</small><h3>${esc(prop.label||def.label)}</h3></div></div><label>Ad<input id="v38PropLabel" value="${esc(prop.label||def.label)}"></label><div class="v38-two-input"><label>Genişlik<input id="v38PropW" type="number" min="1" max="40" value="${prop.w}"></label><label>Yükseklik<input id="v38PropH" type="number" min="1" max="30" value="${prop.h}"></label></div><label class="check"><input id="v38PropMove" type="checkbox" ${prop.blocksMove?'checked':''}> Hareketi engeller</label><label class="check"><input id="v38PropVision" type="checkbox" ${prop.blocksVision?'checked':''}> Görüşü engeller</label><label class="check"><input id="v38PropDifficult" type="checkbox" ${prop.difficult?'checked':''}> Zor arazi</label><label>Işık yarıçapı (kare)<input id="v38PropLight" type="number" min="0" max="20" value="${prop.light||0}"></label><button id="v38SaveProp" class="primary">Objeyi Kaydet</button><button id="v38DeleteProp" class="danger">Objeyi Sil</button></div>`;
}

function v38Inspector(b){
  let token=b.tokens.find(row=>row.id===v38SelectedTokenId),prop=b.props.find(row=>row.id===v38SelectedPropId);
  return `<aside class="v38-inspector" aria-label="Seçili öğe detayları">${token?v38TokenInspector(b,token):prop?v38PropInspector(prop):`<div class="v38-inspector-empty"><small>SEÇİLİ ÖĞE DETAYLARI</small><b>Bir token veya obje seç</b><p>Savaşçı listesinden veya haritadan seçim yap. Can, sıra, koordinat, hız, görüş ve saldırı araçları burada okunabilir tek panelde açılır.</p><ul><li>1 kare = 5 ft</li><li>Hız 30 ft = turda 6 kare</li><li>Sütun ve duvar görüşü keser</li><li>Çalılık ve moloz zor arazidir</li></ul></div>`}</aside>`;
}

function v38BattleTools(b){
  return `<div class="v38-battle-tools"><div class="v38-publish-tools"><button id="v38PublishBattle" class="${b.published?'primary':'ghost'}">${b.published?'● Oyuncuya Açık':'○ Oyuncuya Aç'}</button><button id="v38HideBattle" class="ghost" ${b.published?'':'disabled'}>Oyuncudan Gizle</button><button id="v38PreviewBattle" class="${v38BattlePreview?'primary':'ghost'}">${v38BattlePreview?'DM Görünümü':'Oyuncu Önizleme'}</button></div><div class="v38-tool-row"><button data-v38-tool="select" class="${v38BattleTool==='select'?'primary':'ghost'}">↖ Seç / Taşı</button><button data-v38-tool="reveal" class="${v38BattleTool==='reveal'?'primary':'ghost'}">◌ Sisi Aç</button><button data-v38-tool="hide" class="${v38BattleTool==='hide'?'primary':'ghost'}">● Sis Ekle</button><button id="v38RevealAll" class="ghost">Tümünü Aç</button><button id="v38HideAll" class="ghost">Tümünü Sisle</button><button id="v38SortEncounter" class="ghost">Initiative Sırala</button><button id="v38NextCombat" class="ghost">Sonraki Tur →</button></div><div class="v38-map-settings"><label>Hazır alan<select id="v38Preset">${Object.entries(V38_BATTLE_PRESETS).map(([id,row])=>`<option value="${id}" ${b.preset===id?'selected':''}>${esc(row.name)}</option>`).join('')}</select></label><button id="v38ApplyPreset" class="ghost">Hazır Alanı Kur</button><label>Işık<select id="v38Lighting"><option value="bright" ${b.lighting==='bright'?'selected':''}>Parlak</option><option value="dim" ${b.lighting==='dim'?'selected':''}>Loş</option><option value="dark" ${b.lighting==='dark'?'selected':''}>Karanlık</option></select></label><label class="check"><input id="v38FogEnabled" type="checkbox" ${b.fogEnabled?'checked':''}> Savaş sisi</label><label>Sütun<input id="v38Cols" type="number" min="8" max="40" value="${b.cols}"></label><label>Satır<input id="v38Rows" type="number" min="8" max="30" value="${b.rows}"></label><label>Kare px<input id="v38CellSize" type="number" min="34" max="64" value="${b.cellSize}"></label><button id="v38ResizeBattle" class="ghost">Boyutu Uygula</button></div></div>`;
}

function v38BattleHelp(playerMode=false){
  return `<details class="v38-battle-help"><summary>Bu savaş tahtası nasıl kullanılır?</summary><div>${playerMode?`<p><b>Turunda:</b> Sarı çerçeveli token sıradaki savaşçıdır. 1 kare 5 ft sayılır; tokenın üstündeki hız, bu turdaki hareket sınırıdır. Siyah alanlar sis veya görüş dışıdır.</p><p>Saldırını karakterinin Yetenekler bölümündeki saldırı bonusuyla d20 atarak çöz; isabet için sonuç hedef AC’ye eşit veya yüksek olmalıdır. Hasar zarını silah/spell açıklamasından at.</p>`:`<ol><li>Hazır alan seçip <b>Hazır Alanı Kur</b> de veya boyutu elle ayarla.</li><li>Oyuncu, NPC, yaratık ve objeyi sürükleyip kareye bırak; telefonda önce öğeye, sonra kareye dokun.</li><li><b>Sisi Aç / Sis Ekle</b> fırçalarıyla oyuncunun bildiği kareleri boya. Loş/karanlıkta token görüşü, darkvision, ışık ve duvarlar ayrıca hesaplanır.</li><li>Oyuncu Önizleme ile sonucu kontrol et. <b>Savaşı Başlat</b> initiative’i sıralar ve haritayı otomatik yayınlar.</li><li>Tur değişince yeni aktif tokenın hareket sayacı sıfırlanır. Kırmızı çerçeve hızın aşıldığını; zor arazi ise kare maliyetinin iki kat olduğunu gösterir.</li></ol><p>Duvar, kapı, ağaç ve sütun geçişi/görüşü engelleyebilir. Barikat siper; çalılık, moloz, çamur ve su zor arazi olarak kullanılabilir. Seçilen objenin kuralları sağ panelden değiştirilebilir.</p>`}</div></details>`;
}

function v38BattlePage(playerMode=false){
  let b=v38EnsureBattle(!playerMode&&current.role==='dm');
  if(playerMode&&!b.published)return `<section class="card v38-battle-locked"><span>⚔</span><div><small>TAKTİK SAVAŞ ALANI</small><h2>DM henüz savaş haritasını açmadı</h2><p>Hazırlık, gizli yaratıklar ve arazi oyunculara kapalı. DM “Oyuncuya Aç” veya “Savaşı Başlat” dediğinde tahta burada görünecek.</p></div></section>`;
  let active=(state.encounter||[]).find(row=>row.turn);
  return `<section class="v38-battle-shell ${playerMode?'player-mode':''}"><div class="v38-battle-head"><div><span class="v26-kicker">KARELİ TAKTİK SAVAŞ</span><h2>${esc(b.name)}</h2><p>${b.cols}×${b.rows} kare • 1 kare = 5 ft • ${b.lighting==='bright'?'Parlak':b.lighting==='dim'?'Loş':'Karanlık'}${b.fogEnabled?' • Sis açık':' • Sis kapalı'}</p></div><div class="v38-round"><small>${state.encounterActive?'AKTİF SAVAŞ':'HAZIRLIK'}</small><b>Tur ${state.encounterRound||1}</b><span>${active?`Sıra: ${esc(active.name)}`:'Sıra başlamadı'}</span></div></div>${playerMode?'':v38BattleTools(b)}${v38InitiativeStrip(b,playerMode||v38BattlePreview)}<div class="v38-battle-layout">${playerMode?'':`<div class="v38-dm-rail">${v38Palette(b)}${v38Inspector(b)}</div>`}<div class="v38-board-stage">${v38BattleBoard(b,playerMode)}</div></div>${playerMode?'<p class="v38-player-help">Kendi savaşçını üstteki sıra şeridinden veya tahtadan seç. Sıran geldiğinde hedef kareye dokun; hız ve zor arazi sunucuda doğrulanır.</p>':''}${v38BattleHelp(playerMode)}</section>`;
}

function v38InjectBattle(html,battle){let end=html.indexOf('</section>');return end<0?`${battle}${html}`:`${html.slice(0,end+10)}${battle}${html.slice(end+10)}`}
const v38DmEncounterBase=dmPages.encounter;
const v38PlayerEncounterBase=playerPages.encounter;
dmPages.encounter=()=>v38InjectBattle(v38DmEncounterBase(),v38BattlePage(false));
playerPages.encounter=()=>{
  let old=v38PlayerEncounterBase();if(typeof sessionPending==='function'&&sessionPending())return old;
  return v38BattlePage(true);
};
if(typeof V27_PAGE_HELP==='object')V27_PAGE_HELP.encounter='Kareli savaş alanı, initiative, tur, hız, görüş, sis, arazi ve saldırı araçları.';

function v38Point(board,event,b){let rect=board.getBoundingClientRect();return {x:Math.max(0,Math.min(b.cols-1,Math.floor((event.clientX-rect.left)/rect.width*b.cols))),y:Math.max(0,Math.min(b.rows-1,Math.floor((event.clientY-rect.top)/rect.height*b.rows)))}}
function v38SetManualReveal(b,x,y,reveal){let key=v38CellKey(x,y),set=new Set(b.fogCells||[]),base=b.fogBase==='revealed';if(reveal===base)set.delete(key);else set.add(key);b.fogCells=[...set]}
function v38ScheduleSave(){clearTimeout(v38SaveTimer);v38SaveTimer=setTimeout(()=>{if(current?.role==='dm')save()},250)}

function v38RefreshFogDom(board,b){let layer=board.querySelector('.v38-fog-layer');if(layer)layer.innerHTML=v38FogCellsHtml(b,v38BattlePreview)}
function v38PaintFog(event){
  if(current?.role!=='dm'||v38BattlePreview||!['reveal','hide'].includes(v38BattleTool))return;
  let board=event.target.closest('[data-v38-board]');if(!board)return;let b=v38EnsureBattle(),point=v38Point(board,event,b),key=v38CellKey(point.x,point.y);if(key===v38FogPaintKey)return;v38FogPaintKey=key;v38SetManualReveal(b,point.x,point.y,v38BattleTool==='reveal');v38RefreshFogDom(board,b);v38ScheduleSave();
}

function v38AddCombatant(type,id,point){
  if(current?.role!=='dm')return;let b=v38EnsureBattle(),fighter;
  if(type==='character'){
    let c=(state.characters||[]).find(row=>row.id===id);if(!c)return;
    let existing=(state.encounter||[]).find(row=>row.characterId===c.id||row.userId&&row.userId===c.userId);if(existing){let token=b.tokens.find(row=>row.combatantId===existing.id);if(token){if(point)v38MoveToken(token,point,b);v38SelectedTokenId=token.id;save();render();return}}
    fighter={id:uid(),characterId:c.id,userId:c.userId,name:c.name,init:0,hp:c.hp,maxHp:c.maxHp,ac:c.ac,effects:[...(c.effects||[])],turn:false,kind:'player',speed:c.speed||30,note:`Lv ${c.level} ${c.className||''}`};
  }else if(type==='npc'){
    let n=(state.npcs||[]).find(row=>row.id===id);if(!n)return;fighter={...n,id:uid(),sourceNpcId:n.id,init:0,turn:false,kind:'npc',speed:n.speed||30,effects:[...(n.effects||[])]};
  }else{
    let m=allMonsters().find(row=>row.id===id);if(!m)return;fighter={...m,id:uid(),sourceMonsterId:m.id,init:0,turn:false,kind:'monster',effects:[...(m.effects||[])]};
  }
  state.encounter.push(fighter);let token=v38NewToken(b,fighter,point);b.tokens.push(token);v38SelectedTokenId=token.id;v38SelectedPropId=null;v38PaletteSelection=null;save();render();
}

function v38AddProp(type,point){
  let b=v38EnsureBattle(),def=V38_PROP_DEFS[type];if(!def)return;let prop={id:uid(),type,x:point.x,y:point.y,w:def.w||1,h:def.h||1,label:def.label,blocksMove:!!def.blocksMove,blocksVision:!!def.blocksVision,difficult:!!def.difficult,cover:def.cover||'',light:+def.light||0,zone:def.zone||''};b.props.push(prop);v38ClampBattle(b);v38SelectedPropId=prop.id;v38SelectedTokenId=null;save();render();
}

function v38MoveAssessment(token,point,b=v38EnsureBattle()){
  let x=Math.max(0,Math.min(b.cols-token.size,point.x)),y=Math.max(0,Math.min(b.rows-token.size,point.y));
  let occupied=[];for(let cy=y;cy<y+token.size;cy++)for(let cx=x;cx<x+token.size;cx++)occupied.push(v38CellKey(cx,cy));
  let blocked=(b.props||[]).some(prop=>prop.blocksMove&&v38PropCells(prop).some(key=>occupied.includes(key))),distance=Math.max(Math.abs(token.x-x),Math.abs(token.y-y))*5,difficult=(b.props||[]).some(prop=>prop.difficult&&v38PropCells(prop).some(key=>occupied.includes(key)));if(difficult)distance*=2;
  return {x,y,blocked,distance,difficult,nextMoved:(+token.movedFeet||0)+distance};
}
function v38MoveToken(token,point,b=v38EnsureBattle(),enforceSpeed=false){
  let move=v38MoveAssessment(token,point,b);if(move.blocked){toast('Bu karede geçilemez bir obje var');return false}if(enforceSpeed&&move.nextMoved>token.speed){toast(`Bu tur yalnız ${Math.max(0,token.speed-(+token.movedFeet||0))} ft hareketin kaldı`,true);return false}
  let {x,y,distance}=move;
  token.movedFeet=(+token.movedFeet||0)+distance;token.x=x;token.y=y;if(token.movedFeet>token.speed)toast(`${v38Combatant(token)?.name||'Token'} hız sınırını aştı: ${token.movedFeet}/${token.speed} ft`);return true;
}

function v38DeleteCombatantToken(tokenId){
  if(current?.role!=='dm'||v38BattlePreview)return false;
  let b=v38EnsureBattle(),token=b.tokens.find(row=>row.id===tokenId),fighter=v38Combatant(token);if(!token||!confirm(`${fighter?.name||'Bu savaşçı'} encounter ve haritadan silinsin mi?`))return false;
  b.tokens=b.tokens.filter(row=>row.id!==token.id);state.encounter=state.encounter.filter(row=>row.id!==token.combatantId);if(v38SelectedTokenId===token.id)v38SelectedTokenId=null;save();render();return true;
}

async function v38MovePlayerToken(token,point,b=v38EnsureBattle(false)){
  if(v38PlayerMovePending)return;
  if(!v38PlayerOwnsToken(token))return toast('Yalnız kendi tokenını hareket ettirebilirsin',true);
  if(!state.encounterActive||!b.published)return toast('Savaş henüz aktif değil',true);
  if(!v38Combatant(token)?.turn)return toast('Şu an sıra sende değil',true);
  if(!auth?.sessionToken)return toast('Güvenli hareket için çıkış yapıp yeniden giriş yap',true);
  let move=v38MoveAssessment(token,point,b);if(move.blocked)return toast('Bu karede geçilemez bir obje var',true);if(move.nextMoved>token.speed)return toast(`Bu tur yalnız ${Math.max(0,token.speed-(+token.movedFeet||0))} ft hareketin kaldı`,true);
  v38PlayerMovePending=true;toast('Hareket doğrulanıyor…');
  let previous={x:token.x,y:token.y,movedFeet:token.movedFeet},data;
  try{
    data=await window.kadimUiState.optimistic(`battle-token:${token.id}`,{
      apply(){token.x=move.x;token.y=move.y;token.movedFeet=move.nextMoved;v38SelectedTokenId=token.id;render();return ()=>{Object.assign(token,previous);render()}},
      async commit(){let result=await db.rpc('battle_token_move_v60',{p_session_token:auth.sessionToken,p_campaign:current.id,p_token_id:token.id,p_x:move.x,p_y:move.y});if(result.error)throw result.error;return result.data}
    });
  }catch(failure){v38PlayerMovePending=false;return toast('Hareket reddedildi: '+failure.message,true)}
  v38PlayerMovePending=false;
  token.x=+data.x;token.y=+data.y;token.movedFeet=+data.movedFeet;v38SelectedTokenId=token.id;
  if(realtimeChannel&&realtimeCampaignId===current.id)try{await realtimeChannel.send({type:'broadcast',event:'campaign-changed',payload:window.kadimUiState?.realtimePayload({campaignId:current.id})||{campaignId:current.id,at:Date.now()}})}catch(failure){console.warn('Battle movement broadcast failed',failure)}
  await syncFromServer(false);render();toast(`${data.remaining} ft hareket kaldı`);
}

function v38SelectedToken(){return v38EnsureBattle().tokens.find(row=>row.id===v38SelectedTokenId)}
function v38SelectedProp(){return v38EnsureBattle().props.find(row=>row.id===v38SelectedPropId)}

async function v38RecordRoll(fighter,formula,values,bonus,total){
  toast(`${fighter.name}: ${formula} = ${total}`);
  if(!db?.rpc)return;await db.rpc('dice_roll_add',{p_user:auth.id,p_campaign:current.id,p_roller_name:fighter.name,p_formula:formula,p_rolls:values,p_bonus:bonus,p_total:total});
}

document.addEventListener('input',event=>{
  if(event.target.id!=='v38MonsterSearch')return;v38MonsterQuery=event.target.value;let rows=v38MonsterRows(),list=$('#v38MonsterList'),count=$('#v38MonsterCount');if(list)list.innerHTML=v38MonsterListHtml(rows);if(count)count.textContent=`${rows.length} sonuç`;
});

document.addEventListener('change',event=>{
  if(!current||current.role!=='dm')return;let b=v38EnsureBattle();
  if(event.target.id==='v38Lighting'){b.lighting=event.target.value;save();render()}
  if(event.target.id==='v38FogEnabled'){b.fogEnabled=event.target.checked;save();render()}
});

document.addEventListener('dragstart',event=>{
  if(current?.role!=='dm'||v38BattlePreview)return;
  let token=event.target.closest('[data-v38-token]'),palette=event.target.closest('[data-v38-palette-type]');
  if(token)event.dataTransfer.setData('application/x-kadim-token',token.dataset.v38Token);
  if(palette)event.dataTransfer.setData('application/x-kadim-palette',JSON.stringify({type:palette.dataset.v38PaletteType,id:palette.dataset.v38PaletteId}));
});
document.addEventListener('dragover',event=>{if(event.target.closest('[data-v38-board]')&&current?.role==='dm'&&!v38BattlePreview)event.preventDefault()});
document.addEventListener('drop',event=>{
  let board=event.target.closest('[data-v38-board]');if(!board||current?.role!=='dm'||v38BattlePreview)return;event.preventDefault();let b=v38EnsureBattle(),point=v38Point(board,event,b),tokenId=event.dataTransfer.getData('application/x-kadim-token'),raw=event.dataTransfer.getData('application/x-kadim-palette');
  if(tokenId){let token=b.tokens.find(row=>row.id===tokenId);if(token){v38MoveToken(token,point,b);v38SelectedTokenId=token.id;save();render()}return}
  if(raw){try{let data=JSON.parse(raw);data.type==='prop'?v38AddProp(data.id,point):v38AddCombatant(data.type,data.id,point)}catch(error){console.warn('Battle drop ignored',error)}}
});

document.addEventListener('pointerdown',event=>{
  let element=event.target.closest('[data-v38-token]');if(!element||event.button!==0||current?.role!=='dm'||v38BattlePreview||v38BattleTool!=='select')return;
  let board=element.closest('[data-v38-board]'),token=v38EnsureBattle().tokens.find(row=>row.id===element.dataset.v38Token);if(!board||!token)return;
  v38SelectedTokenId=token.id;v38SelectedPropId=null;v38PaletteSelection=null;v38TokenDrag={pointerId:event.pointerId,element,board,tokenId:token.id,startX:event.clientX,startY:event.clientY,moved:false};element.setPointerCapture?.(event.pointerId);element.classList.add('selected');event.preventDefault();
});
document.addEventListener('pointerdown',event=>{if(!event.target.closest('[data-v38-board]')||!['reveal','hide'].includes(v38BattleTool))return;v38FogPainting=true;v38FogPaintKey='';v38PaintFog(event);event.preventDefault()});
document.addEventListener('pointermove',event=>{
  if(v38TokenDrag?.pointerId===event.pointerId){let distance=Math.hypot(event.clientX-v38TokenDrag.startX,event.clientY-v38TokenDrag.startY);if(distance>6){v38TokenDrag.moved=true;v38TokenDrag.element.classList.add('dragging');event.preventDefault()}return}
  if(v38FogPainting)v38PaintFog(event);
});
function v38FinishTokenDrag(event,cancel=false){
  let drag=v38TokenDrag;if(!drag||event?.pointerId!=null&&drag.pointerId!==event.pointerId)return;v38TokenDrag=null;drag.element.classList.remove('dragging');drag.element.releasePointerCapture?.(drag.pointerId);
  if(cancel||!drag.moved)return;
  v38SuppressTokenClick=drag.tokenId;setTimeout(()=>{if(v38SuppressTokenClick===drag.tokenId)v38SuppressTokenClick=''},0);
  let rect=drag.board.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)return render();
  let b=v38EnsureBattle(),token=b.tokens.find(row=>row.id===drag.tokenId);if(token&&v38MoveToken(token,v38Point(drag.board,event,b),b)){v38SelectedTokenId=token.id;save()}render();event.preventDefault();
}
function v38FinishFogPaint(){if(!v38FogPainting)return;v38FogPainting=false;v38FogPaintKey='';clearTimeout(v38SaveTimer);save();render()}
document.addEventListener('pointerup',event=>{v38FinishTokenDrag(event);v38FinishFogPaint()});
document.addEventListener('pointercancel',event=>{v38FinishTokenDrag(event,true);v38FinishFogPaint()});
window.addEventListener?.('blur',()=>{v38FinishTokenDrag(null,true);v38FinishFogPaint()});

document.addEventListener('click',async event=>{
  let button=event.target.closest('button');if(!button||!current)return;
  if(button.dataset.v38Zoom){v38BattleZoom=button.dataset.v38Zoom==='reset'?1.12:Math.max(.72,Math.min(1.6,v38BattleZoom+(+button.dataset.v38Zoom||0)));render();return}
  if(button.dataset.v38AddNow){if(current.role!=='dm'||v38BattlePreview)return;v38AddCombatant(button.dataset.v38AddNow,button.dataset.v38AddId,null);return}
  if(button.dataset.v38DeleteToken){v38DeleteCombatantToken(button.dataset.v38DeleteToken);return}
  if(button.dataset.v38RosterSelect){if(current.role!=='dm'||v38BattlePreview)return;v38SelectedTokenId=button.dataset.v38RosterSelect;v38SelectedPropId=null;v38PaletteSelection=null;v38BattleTool='select';render();return}
  if(button.dataset.v38Tool){v38BattleTool=button.dataset.v38Tool;v38PaletteSelection=null;render();return}
  if(button.dataset.v38PaletteType){v38PaletteSelection={type:button.dataset.v38PaletteType,id:button.dataset.v38PaletteId};v38BattleTool='place';document.querySelectorAll('[data-v38-palette-type]').forEach(row=>row.classList.toggle('selected',row===button));toast('Şimdi savaş alanında hedef kareye dokun');return}
  if(button.dataset.v38Token){
    if(v38SuppressTokenClick===button.dataset.v38Token){v38SuppressTokenClick='';return}
    let token=v38EnsureBattle(false).tokens.find(row=>row.id===button.dataset.v38Token);
    if(current.role==='player'){
      if(!v38PlayerOwnsToken(token))return toast('Yalnız kendi tokenını seçebilirsin',true);
      v38SelectedTokenId=token.id;v38SelectedPropId=null;render();if(!v38PlayerCanMoveToken(token))return toast(v38Combatant(token)?.turn?'Savaş henüz aktif değil':'Şu an sıra sende değil',true);toast(`${Math.max(0,token.speed-(+token.movedFeet||0))} ft hareketin kaldı`);return;
    }
    if(current.role!=='dm'||v38BattlePreview)return;v38SelectedTokenId=button.dataset.v38Token;v38SelectedPropId=null;v38PaletteSelection=null;v38BattleTool='select';render();return;
  }
  if(button.dataset.v38Prop){if(current.role!=='dm'||v38BattlePreview)return;v38SelectedPropId=button.dataset.v38Prop;v38SelectedTokenId=null;v38PaletteSelection=null;render();return}
  if(button.dataset.v38SelectToken){let token=v38EnsureBattle(false).tokens.find(row=>row.id===button.dataset.v38SelectToken);if(!token)return;if(current.role==='player'&&!v38PlayerOwnsToken(token))return toast('Yalnız kendi tokenını seçebilirsin',true);v38SelectedTokenId=token.id;v38SelectedPropId=null;render();if(current.role==='player')toast(v38PlayerCanMoveToken(token)?`${Math.max(0,token.speed-(+token.movedFeet||0))} ft hareketin kaldı`:'Şu an sıra sende değil',!v38PlayerCanMoveToken(token));return}
  if(button.id==='v38PublishBattle'){let b=v38EnsureBattle();b.published=true;save();render();toast('Savaş alanı oyunculara açıldı');return}
  if(button.id==='v38HideBattle'){let b=v38EnsureBattle();b.published=false;save();render();toast('Savaş alanı oyunculardan gizlendi');return}
  if(button.id==='v38PreviewBattle'){v38BattlePreview=!v38BattlePreview;render();return}
  if(button.id==='v38RevealAll'){let b=v38EnsureBattle();b.fogBase='revealed';b.fogCells=[];save();render();return}
  if(button.id==='v38HideAll'){let b=v38EnsureBattle();b.fogBase='hidden';b.fogCells=[];save();render();return}
  if(button.id==='v38SortEncounter'){state.encounter.sort((a,z)=>(+z.init||0)-(+a.init||0));save();render();return}
  if(button.id==='v38NextCombat'){
    if(!state.encounter.length)return;let index=state.encounter.findIndex(row=>row.turn);state.encounter.forEach(row=>row.turn=false);let next=(index+1+state.encounter.length)%state.encounter.length;if(index>=0&&next===0)state.encounterRound=(state.encounterRound||1)+1;let fighter=state.encounter[next];fighter.turn=true;state.encounterActive=true;let b=v38EnsureBattle(),token=b.tokens.find(row=>row.combatantId===fighter.id);if(token){token.movedFeet=0;token.turnStartX=token.x;token.turnStartY=token.y}save();render();return;
  }
  if(button.id==='v38ApplyPreset'){
    let b=v38EnsureBattle(),key=$('#v38Preset')?.value||'empty',preset=V38_BATTLE_PRESETS[key];if(!confirm(`${preset.name} kurulsun mu? Mevcut tokenler kalır; arazi, sis ve token konumları hazır düzene geçer.`))return;v38ApplyPresetData(b,key,true);v38SelectedPropId=null;v38SelectedTokenId=null;save();render();return;
  }
  if(button.id==='v38ResizeBattle'){
    let b=v38EnsureBattle();b.cols=+$('#v38Cols').value;b.rows=+$('#v38Rows').value;b.cellSize=+$('#v38CellSize').value;v38ClampBattle(b);save();render();return;
  }
  if(button.id==='v38SaveToken'){
    let b=v38EnsureBattle(),token=v38SelectedToken();if(!token)return;token.x=(+$('#v38TokenX').value||1)-1;token.y=(+$('#v38TokenY').value||1)-1;token.speed=+$('#v38TokenSpeed').value;token.vision=+$('#v38TokenVision').value;token.darkvision=+$('#v38TokenDarkvision').value;token.size=+$('#v38TokenSize').value;token.color=$('#v38TokenColor').value;token.hidden=$('#v38TokenHidden').checked;let fighter=v38Combatant(token);if(fighter){fighter.speed=token.speed;fighter.init=+$('#v38TokenInit').value||0;fighter.ac=Math.max(0,+$('#v38TokenAc').value||0)}v38ClampBattle(b);save();render();return;
  }
  if(button.id==='v38MakeTurn'){
    let token=v38SelectedToken(),fighter=v38Combatant(token);if(!fighter)return;(state.encounter||[]).forEach(row=>row.turn=false);fighter.turn=true;state.encounterActive=true;token.movedFeet=0;token.turnStartX=token.x;token.turnStartY=token.y;save();render();return;
  }
  if(button.dataset.v38Hp){let token=v38SelectedToken(),fighter=v38Combatant(token);if(!fighter)return;fighter.hp=Math.max(0,Math.min(+fighter.maxHp||99999,(+fighter.hp||0)+(+button.dataset.v38Hp)));window.v31SyncCharacterFromEncounter?.(fighter,{hp:true});save();render();return}
  if(button.id==='v38DeleteToken'){
    v38DeleteCombatantToken(v38SelectedTokenId);return;
  }
  if(button.id==='v38SaveProp'){
    let b=v38EnsureBattle(),prop=v38SelectedProp();if(!prop)return;prop.label=$('#v38PropLabel').value.trim()||prop.label;prop.w=+$('#v38PropW').value;prop.h=+$('#v38PropH').value;prop.blocksMove=$('#v38PropMove').checked;prop.blocksVision=$('#v38PropVision').checked;prop.difficult=$('#v38PropDifficult').checked;prop.light=+$('#v38PropLight').value;v38ClampBattle(b);save();render();return;
  }
  if(button.id==='v38DeleteProp'){let b=v38EnsureBattle(),prop=v38SelectedProp();if(!prop)return;b.props=b.props.filter(row=>row.id!==prop.id);v38SelectedPropId=null;save();render();return}
  if(button.id==='v38AttackRoll'){
    let fighter=v38Combatant(v38SelectedToken());if(!fighter)return;let match=String(fighter.attacks||'').match(/(?:attack|\w+)\s*:?\s*\+(\d+)/i)||String(fighter.attacks||'').match(/\+(\d+)/),bonus=match?+match[1]:+(prompt('Saldırı bonusu kaç?','0')||0),roll=1+Math.floor(Math.random()*20);await v38RecordRoll(fighter,`1d20${bonus>=0?'+':''}${bonus}`,[roll],bonus,roll+bonus);return;
  }
  if(button.id==='v38DamageRoll'){
    let fighter=v38Combatant(v38SelectedToken());if(!fighter)return;let match=String(fighter.attacks||'').match(/(\d+)d(\d+)([+-]\d+)?/i),raw=match?match[0]:prompt('Hasar formülü (örn. 2d6+3)','1d6');if(!raw)return;let parsed=raw.match(/(\d+)d(\d+)([+-]\d+)?/i);if(!parsed)return alert('Formül örneği: 2d6+3');let count=Math.min(20,+parsed[1]),sides=Math.min(1000,+parsed[2]),bonus=+parsed[3]||0,rolls=Array.from({length:count},()=>1+Math.floor(Math.random()*sides)),total=rolls.reduce((a,c)=>a+c,0)+bonus;await v38RecordRoll(fighter,`${count}d${sides}${bonus?bonus>0?'+'+bonus:bonus:''}`,rolls,bonus,total);return;
  }
  let board=button.closest('[data-v38-board]');if(board&&current.role==='dm'&&!v38BattlePreview){
    let b=v38EnsureBattle(),point=v38Point(board,event,b);
    if(v38PaletteSelection){let selected=v38PaletteSelection;selected.type==='prop'?v38AddProp(selected.id,point):v38AddCombatant(selected.type,selected.id,point);return}
    if(v38BattleTool==='select'&&v38SelectedTokenId){let token=v38SelectedToken();if(token){v38MoveToken(token,point,b);save();render()}return}
  }
});

/* The board itself is a div; handle blank-cell taps that are not buttons. */
document.addEventListener('click',async event=>{
  let board=event.target.closest('[data-v38-board]');if(!board||event.target.closest('button')||v38BattlePreview||['reveal','hide'].includes(v38BattleTool))return;
  let b=v38EnsureBattle(current?.role==='dm'),point=v38Point(board,event,b);
  if(current?.role==='player'){
    let token=b.tokens.find(row=>row.id===v38SelectedTokenId);if(token)await v38MovePlayerToken(token,point,b);return;
  }
  if(current?.role!=='dm')return;
  if(v38PaletteSelection){let selected=v38PaletteSelection;selected.type==='prop'?v38AddProp(selected.id,point):v38AddCombatant(selected.type,selected.id,point);return}
  if(v38BattleTool==='select'&&v38SelectedTokenId){let token=v38SelectedToken();if(token){v38MoveToken(token,point,b);save();render()}}
});

/* Session automation: starting publishes; changing turn resets that token's movement. */
document.addEventListener('click',event=>{
  let button=event.target.closest('button');if(!button||!current||current.role!=='dm')return;
  if(button.id==='sessionStartCombat')queueMicrotask(()=>{if(!state.encounterActive)return;let b=v38EnsureBattle();b.published=true;for(let token of b.tokens){token.movedFeet=0;token.turnStartX=token.x;token.turnStartY=token.y}save();render()});
  if(button.id==='sessionNextCombat'||button.id==='nextTurn')queueMicrotask(()=>{let b=v38EnsureBattle(),active=(state.encounter||[]).find(row=>row.turn),token=b.tokens.find(row=>row.combatantId===active?.id);if(token){token.movedFeet=0;token.turnStartX=token.x;token.turnStartY=token.y;save();render()}});
  if(button.id==='clearEncounter'||button.dataset.templateLaunch!=null)queueMicrotask(()=>{let b=v38EnsureBattle();b.published=false;save();render()});
  if(button.id==='sessionEndCombat')setTimeout(()=>{if(state.encounterActive)return;let b=v38EnsureBattle();b.published=false;save();render()},0);
},true);

const v38RenderBase=render;
render=function(){if(current?.role==='dm')v38EnsureBattle(true);return v38RenderBase()};

if(current)render();
