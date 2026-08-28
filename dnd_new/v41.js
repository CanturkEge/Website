/* v41: effect compatibility and complete DM intervention tools. */
const V41_VERSION='41.0';

function v41Clone(value){
  if(value==null)return value;
  return globalThis.structuredClone?structuredClone(value):JSON.parse(JSON.stringify(value));
}
function v41EffectName(effect){
  return String(typeof effect==='string'?effect:effect?.name||'').trim();
}
function v41EffectDuration(effect){
  return String(typeof effect==='string'?'':effect?.duration||'').trim();
}
function v41Fold(value){
  return String(value||'').trim().toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
function v41EffectCopy(effect){
  let name=v41EffectName(effect);if(!name)return null;
  if(typeof effect==='string')return name;
  return {...v41Clone(effect),name,duration:v41EffectDuration(effect)};
}
function v41EffectDisplay(effect){
  let name=v41EffectName(effect),duration=v41EffectDuration(effect);
  return duration?`${name} (${duration})`:name;
}
function v41Character(id){return (state.characters||[]).find(row=>row.id===id)}
function v41EffectOptions(){
  let seen=new Set();return [...EFFECTS,...(state.customEffects||[])].map(v41EffectName).filter(name=>{let key=v41Fold(name);if(!key||seen.has(key))return false;seen.add(key);return true});
}

/* Encounter and character records now keep the exact same effect payload. */
const v41SyncCharacterFromEncounterBase=window.v31SyncCharacterFromEncounter;
window.v31SyncCharacterFromEncounter=function(fighter,parts={hp:true}){
  let requested=parts||{};
  v41SyncCharacterFromEncounterBase?.(fighter,{...requested,effects:false});
  if(!requested.effects||!fighter?.characterId)return;
  let character=v41Character(fighter.characterId);if(!character)return;
  character.effects=(fighter.effects||[]).map(v41EffectCopy).filter(Boolean);
};
const v41SyncEncounterFromCharacterBase=window.v31SyncEncounterFromCharacter;
window.v31SyncEncounterFromCharacter=function(character,parts={hp:true}){
  let requested=parts||{};
  v41SyncEncounterFromCharacterBase?.(character,{...requested,effects:false});
  if(!requested.effects||!character)return;
  for(let fighter of state.encounter||[]){
    if(fighter.characterId===character.id)fighter.effects=(character.effects||[]).map(v41EffectCopy).filter(Boolean);
  }
};

function v41EffectModalBody(character){
  character.effects=Array.isArray(character.effects)?character.effects:[];
  let rows=character.effects.map((effect,index)=>`<article class="v41-effect-row"><span><b>${esc(v41EffectName(effect)||'İsimsiz efekt')}</b><small>${esc(v41EffectDuration(effect)||'Süre belirtilmedi')}</small></span><button class="danger" data-v41-remove-effect="${index}" data-v41-character="${esc(character.id)}">Kaldır</button></article>`).join('');
  return `<div class="v41-effect-manager"><section><span class="v26-kicker">AKTİF EFEKTLER</span><div class="v41-effect-list">${rows||'<div class="empty">Aktif efekt yok.</div>'}</div>${rows?`<button id="v41ClearEffects" data-v41-character="${esc(character.id)}" class="danger">Tüm Efektleri Temizle</button>`:''}</section><section class="v41-effect-add"><span class="v26-kicker">YENİ EFEKT</span><label>Hazır efekt<select id="v41EffectPreset"><option value="">Özel efekt yazacağım</option>${v41EffectOptions().map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join('')}</select></label>${field('v41EffectCustom','Özel efekt adı')}${field('v41EffectDuration','Süre / takip notu','text','')}<small>Örnek süre: 3 tur, sonraki turun sonuna kadar veya concentration.</small><button id="v41AddEffect" data-v41-character="${esc(character.id)}" class="primary">Efekti Uygula</button></section></div>`;
}
function v41OpenEffectManager(characterId){
  let character=v41Character(characterId);if(!character)return;
  modal(`${character.name} — Efekt Yönetimi`,v41EffectModalBody(character));
}
function v41RefreshEffectManager(character){
  render();
  let dialog=$('#modal');if(dialog?.open){$('#modalTitle').textContent=`${character.name} — Efekt Yönetimi`;$('#modalBody').innerHTML=v41EffectModalBody(character)}
}
function v41CommitEffects(character,message,keepManager=false){
  window.v31SyncEncounterFromCharacter?.(character,{effects:true});
  save();
  if(keepManager)v41RefreshEffectManager(character);else{$('#modal')?.close();render()}
  if(message)toast(message);
}

/* Keep old buttons, but add an explicit manager that can also remove effects. */
const v41CharActionsBase=v27CharActions;
v27CharActions=function(character){
  let html=v41CharActionsBase(character).replace('>Efekt</button>','>Efekt Ekle</button>');
  return `${html}<button class="ghost" data-v41-manage-effects="${esc(character.id)}">Efektleri Yönet (${Array.isArray(character.effects)?character.effects.length:0})</button>`;
};

/* Legacy player cards expected strings; present object effects without mutating saved data. */
function v41WithDisplayEffects(characters,callback){
  let saved=(characters||[]).map(character=>({character,effects:character.effects}));
  for(let row of saved)row.character.effects=(row.effects||[]).map(v41EffectDisplay).filter(Boolean);
  try{return callback()}finally{for(let row of saved)row.character.effects=row.effects}
}
const v41PlayerDashBase=playerDash;
playerDash=function(){let character=myChar();return character?v41WithDisplayEffects([character],v41PlayerDashBase):v41PlayerDashBase()};
const v41PartyViewBase=playerPages.partyview;
playerPages.partyview=()=>v41WithDisplayEffects(state.characters||[],v41PartyViewBase);

function v41Guild(){return state.guild&&typeof state.guild==='object'?state.guild:null}
function v41GuildMemberIds(guild=v41Guild()){
  return [...new Set((Array.isArray(guild?.members)?guild.members:[]).map(String).filter(Boolean))];
}
function v41SetCharacterGuild(userId,guildName){
  for(let character of state.characters||[])if(String(character.userId||'')===String(userId))character.guild=guildName;
}
function v41GuildItem(itemId){return (state.guildInventory||[]).find(item=>String(item.id||'')===String(itemId))}
function v41EnsureNpcInventory(npc){
  npc.inventory=Array.isArray(npc.inventory)?npc.inventory:[];
  let changed=false,seen=new Set();
  for(let item of npc.inventory){if(!item.id||seen.has(String(item.id))){item.id=uid();changed=true}seen.add(String(item.id))}
  return changed;
}
function v41GuildBonuses(item={}){
  let rows=typeof iaBonuses==='function'?iaBonuses(item):[];
  let stats=item.statBonuses||{};for(let key of ['STR','DEX','CON','INT','WIS','CHA'])if(Number(stats[key]))rows.push(`${key} ${Number(stats[key])>0?'+':''}${stats[key]}`);
  rows=[...new Set(rows)];return rows.length?rows.join(' • '):'Mekanik bonus yok';
}
function v41GuildItemCard(item){
  let detail=[item.note,item.effect,v41GuildBonuses(item)].filter(Boolean).join(' • ');
  return `<article class="v41-guild-item"><div><b>${esc(item.name||'İsimsiz eşya')}</b><small>${esc(detail)}</small><span>ID: ${esc(item.id||'—')} • Adet ${Math.max(1,+item.qty||1)}</span></div><div><button class="ghost" data-v41-guild-edit="${esc(item.id)}">Düzenle</button><button class="primary" data-v41-guild-give="${esc(item.id)}">Karaktere Ver</button><button class="danger" data-v41-guild-delete="${esc(item.id)}">Sil</button></div></article>`;
}
function v41GuildMembers(guild){
  let ids=v41GuildMemberIds(guild),known=new Set((members||[]).map(row=>String(row.userId))),players=(members||[]).filter(row=>row.role==='player');
  let rows=players.map(member=>{let joined=ids.includes(String(member.userId)),characters=(state.characters||[]).filter(row=>String(row.userId||'')===String(member.userId));return `<article class="v41-member-row ${joined?'joined':''}"><div><b>${esc(member.name)}</b><small>${characters.length?characters.map(row=>esc(row.name)).join(', '):'Bağlı karakter yok'}</small></div><button class="${joined?'danger':'primary'}" data-v41-guild-member="${esc(member.userId)}" data-v41-member-action="${joined?'remove':'add'}">${joined?'Üyelikten Çıkar':'Üye Yap'}</button></article>`}).join('');
  let stale=ids.filter(id=>id!==String(guild.ownerUserId||'')&&!known.has(id)).map(id=>`<article class="v41-member-row stale"><div><b>Eski / bulunamayan hesap</b><small>${esc(id)}</small></div><button class="danger" data-v41-guild-member="${esc(id)}" data-v41-member-action="remove">Kaydı Temizle</button></article>`).join('');
  return rows+stale||'<div class="empty">Kampanyada oyuncu hesabı yok.</div>';
}
function v41GuildWallet(){
  queueMicrotask(()=>exLoadWallets());
  if(exWalletCampaign!==current.id)return '<div class="card empty">Lonca parası yükleniyor…</div>';
  if(!exGuildWallet)return '<div class="card pact-error">Lonca parası açılamadı. economy-update.sql kurulumunu kontrol et.</div>';
  return exWalletCard('Lonca Kasası — DM Düzenleme',exGuildWallet,'','guild');
}
function v41GuildAdmin(){
  let guild=v41Guild();if(!guild)return '';
  state.guildInventory=Array.isArray(state.guildInventory)?state.guildInventory:[];
  let normalized=typeof v31NormalizeList==='function'&&v31NormalizeList(state.guildInventory);if(normalized)queueMicrotask(()=>save());
  return `<section class="v41-guild-admin"><div class="v41-admin-banner"><div><span class="v26-kicker">DM MÜDAHALE PANELİ</span><h2>${esc(guild.name||'İsimsiz Lonca')}</h2><p>Üyelik, ortak eşya ve lonca parası bu ekrandan doğrudan yönetilir. DM işlemleri oyuncu hareket geçmişine yazılmaz.</p></div><button id="v41RenameGuild" class="ghost">Lonca Adını Değiştir</button></div><div class="v41-guild-grid"><details class="card" open><summary>Üyeleri Yönet <span>${v41GuildMemberIds(guild).filter(id=>(members||[]).some(row=>row.role==='player'&&String(row.userId)===id)).length} oyuncu</span></summary><div class="v41-detail-body v41-member-list">${v41GuildMembers(guild)}</div></details><details class="card" open><summary>Ortak Envanteri Yönet <span>${state.guildInventory.length} kayıt</span></summary><div class="v41-detail-body"><button id="v41AddGuildItem" class="primary">+ Lonca Eşyası Ekle</button><div class="v41-guild-items">${state.guildInventory.map(v41GuildItemCard).join('')||'<div class="empty">Lonca envanteri boş.</div>'}</div></div></details></div><div class="v41-guild-wallet">${v41GuildWallet()}</div></section>`;
}
function v41GuildItemForm(item={},mode='add'){
  let stats=item.statBonuses||item.bonuses||{};
  return `<div class="v41-item-form"><div class="v41-form-grid">${field('v41GuildItemName','Eşya adı','text',item.name||'')}${field('v41GuildItemQty','Adet','number',Math.max(1,+item.qty||1))}${field('v41GuildItemNote','Açıklama','text',item.note||'')}${field('v41GuildItemEffect','Etki / tür','text',item.effect||'')}${field('v41GuildItemSlot','Slot (armor, shield, weapon…)','text',item.slot||'')}${field('v41GuildArmorType','Zırh türü (light/medium/heavy)','text',item.armorType||'')}${field('v41GuildArmorBase','Zırh temel AC','number',item.armorBase??'')}${field('v41GuildAcBonus','AC bonusu','number',item.acBonus||0)}${field('v41GuildAttackBonus','Saldırı bonusu','number',item.attackBonus||0)}${field('v41GuildDamageBonus','Hasar bonusu','number',item.damageBonus||0)}${field('v41GuildMagicBonus','Büyü bonusu','number',item.magicBonus||0)}${field('v41GuildSaveBonus','Save bonusu','number',item.saveBonus||0)}${field('v41GuildStrReq','STR gereksinimi','number',item.strRequirement??'')}</div><fieldset><legend>Stat bonusları</legend><div class="v41-stat-fields">${['STR','DEX','CON','INT','WIS','CHA'].map(key=>field('v41GuildStat'+key,key,'number',stats[key]||0)).join('')}</div></fieldset><label class="v41-check"><input id="v41GuildStealthDis" type="checkbox" ${item.stealthDisadvantage?'checked':''}> Gizlilik zarlarına dezavantaj verir</label><button id="v41SaveGuildItem" data-v41-mode="${mode}" data-v41-item-id="${esc(item.id||'')}" class="primary">${mode==='edit'?'Değişiklikleri Kaydet':'Lonca Envanterine Ekle'}</button></div>`;
}
function v41ReadGuildItemForm(item){
  let value=id=>$(id)?.value??'',number=id=>Number($(id)?.value||0),optionalNumber=id=>String($(id)?.value??'').trim();
  item.name=value('#v41GuildItemName').trim();item.qty=Math.max(1,Math.floor(number('#v41GuildItemQty'))||1);item.note=value('#v41GuildItemNote').trim();item.effect=value('#v41GuildItemEffect').trim();item.slot=value('#v41GuildItemSlot').trim();item.armorType=value('#v41GuildArmorType').trim();
  for(let [property,id] of [['armorBase','#v41GuildArmorBase'],['strRequirement','#v41GuildStrReq']]){let raw=optionalNumber(id);if(raw==='')delete item[property];else item[property]=Number(raw)||0}
  for(let [property,id] of [['acBonus','#v41GuildAcBonus'],['attackBonus','#v41GuildAttackBonus'],['damageBonus','#v41GuildDamageBonus'],['magicBonus','#v41GuildMagicBonus'],['saveBonus','#v41GuildSaveBonus']])item[property]=number(id);
  let statBonuses={...(item.statBonuses||item.bonuses||{})};for(let key of ['STR','DEX','CON','INT','WIS','CHA'])delete statBonuses[key];for(let key of ['STR','DEX','CON','INT','WIS','CHA']){let amount=number('#v41GuildStat'+key);if(amount)statBonuses[key]=amount}item.statBonuses=statBonuses;
  item.stealthDisadvantage=!!$('#v41GuildStealthDis')?.checked;item.equipped=false;
  return item;
}
function v41GuildPage(){
  let guild=v41Guild();if(!guild)return v41GuildDmBase();
  queueMicrotask(()=>{exLoadWallets();if(typeof v32LoadGuildActivity==='function')v32LoadGuildActivity()});
  let header=v26Head('LONCA SALONU',guild.name||'İsimsiz Lonca','Lonca yönetimi, kasa ve ortak envanter tek ekranda.',`<button class="ghost" data-copy-guild="${esc(guild.code||'')}">Kod: ${esc(guild.code||'—')}</button>`);
  let ledger=typeof v32GuildActivityCard==='function'?v32GuildActivityCard():'';
  let ground=typeof iaGround==='function'?iaGround(false):'';
  return `${header}${v41GuildAdmin()}${ledger}${ground}`;
}
const v41GuildDmBase=dmPages.guilddm;
dmPages.guilddm=v41GuildPage;

/* Wallet loading originally refreshed only Treasury/Market, leaving Guild stale. */
const v41LoadWalletsBase=exLoadWallets;
let v41WalletRenderQueued=false;
exLoadWallets=async function(force=false){
  let before=JSON.stringify([exWalletCampaign,exGuildWallet,exWalletRows]);
  await Promise.resolve(v41LoadWalletsBase(force));
  let changed=before!==JSON.stringify([exWalletCampaign,exGuildWallet,exWalletRows]);
  if(changed&&(page==='guild'||page==='guilddm')&&!v41WalletRenderQueued){
    v41WalletRenderQueued=true;queueMicrotask(()=>{v41WalletRenderQueued=false;if(page==='guild'||page==='guilddm')render()});
  }
};

function v41NpcModalBody(npc){
  v41EnsureNpcInventory(npc);
  let items=npc.inventory.map((item,index)=>`<article class="v41-npc-item"><span><b>${esc(item.name||'İsimsiz eşya')}</b><small>${esc(item.note||item.effect||'Açıklama yok')}</small>×${Math.max(1,+item.qty||1)}</span><button class="danger" data-v41-npc-remove="${index}" data-v41-npc="${esc(npc.id)}">Kaldır</button></article>`).join('');
  return `<div class="v41-npc-manager"><section><span class="v26-kicker">NPC ENVANTERİ</span>${items||'<div class="empty">Bu NPC’de eşya yok.</div>'}</section><section><span class="v26-kicker">YENİ EŞYA</span>${field('v41NpcItemName','Eşya adı')}${field('v41NpcItemQty','Adet','number',1)}${field('v41NpcItemNote','Not / etki')}<button id="v41NpcItemAdd" data-v41-npc="${esc(npc.id)}" class="primary">NPC’ye Ekle</button></section></div>`;
}
function v41OpenNpcItems(npcId){let npc=(state.npcs||[]).find(row=>row.id===npcId);if(npc)modal(`${npc.name} — Eşyalar`,v41NpcModalBody(npc))}
function v41RefreshNpcModal(npc){render();let dialog=$('#modal');if(dialog?.open){$('#modalTitle').textContent=`${npc.name} — Eşyalar`;$('#modalBody').innerHTML=v41NpcModalBody(npc)}}

/* Custom skills previously had add-only controls. */
function v41SkillModalBody(character){
  character.skills=Array.isArray(character.skills)?character.skills:[];
  let rows=character.skills.map((skill,index)=>`<article class="v41-skill-row"><span><b>${esc(skill.name||'İsimsiz özellik')}</b><small>${esc(skill.note||'Açıklama yok')}</small></span><div><button class="ghost" data-v41-skill-edit="${index}" data-v41-character="${esc(character.id)}">Düzenle</button><button class="danger" data-v41-skill-remove="${index}" data-v41-character="${esc(character.id)}">Sil</button></div></article>`).join('');
  return `<div class="v41-skill-list">${rows||'<div class="empty">DM tarafından eklenmiş özel yetenek yok.</div>'}</div>`;
}
function v41OpenSkills(characterId){let character=v41Character(characterId);if(character)modal(`${character.name} — Özel Yetenekler`,v41SkillModalBody(character))}
const v41DmPartyBase=dmPages.party;
dmPages.party=()=>v41DmPartyBase().replace(/<button class="ghost" data-skill="([^"]+)">Özel Yetenek<\/button>/g,'<button class="ghost" data-skill="$1">Yetenek Ekle</button><button class="ghost" data-v41-manage-skills="$1">Yetenekleri Yönet</button>');

document.addEventListener('click',async event=>{
  let button=event.target.closest('button');if(!button||!current)return;
  if(String(button.id||'').startsWith('v41')||Object.keys(button.dataset||{}).some(key=>key.startsWith('v41')))event.preventDefault();

  if(button.dataset.v41ManageEffects){event.preventDefault();event.stopImmediatePropagation();v41OpenEffectManager(button.dataset.v41ManageEffects);return}
  if(button.id==='giveEffect'){
    event.preventDefault();event.stopImmediatePropagation();let character=v41Character(button.dataset.id);if(!character)return;
    character.effects=Array.isArray(character.effects)?character.effects:[];
    let name=String($('#customEffect')?.value||$('#effectName')?.value||'').trim();if(!name)return alert('Bir efekt seç veya adını yaz.');
    if(character.effects.some(effect=>v41Fold(v41EffectName(effect))===v41Fold(name)))return alert(`${name} zaten aktif.`);
    character.effects.push(name);v41CommitEffects(character,'Efekt uygulandı');return;
  }
  if(button.id==='v41AddEffect'){
    event.preventDefault();event.stopImmediatePropagation();let character=v41Character(button.dataset.v41Character);if(!character)return;
    character.effects=Array.isArray(character.effects)?character.effects:[];
    let name=String($('#v41EffectCustom')?.value||$('#v41EffectPreset')?.value||'').trim(),duration=String($('#v41EffectDuration')?.value||'').trim();if(!name)return alert('Bir efekt seç veya adını yaz.');
    if(character.effects.some(effect=>v41Fold(v41EffectName(effect))===v41Fold(name)))return alert(`${name} zaten aktif; önce mevcut kaydı kaldır.`);
    character.effects.push(duration?{id:uid(),name,duration}:name);v41CommitEffects(character,'Efekt uygulandı',true);return;
  }
  if(button.dataset.v41RemoveEffect!=null){
    event.preventDefault();event.stopImmediatePropagation();let character=v41Character(button.dataset.v41Character),index=+button.dataset.v41RemoveEffect;if(!character?.effects?.[index])return;
    let name=v41EffectName(character.effects[index]);character.effects.splice(index,1);v41CommitEffects(character,`${name} kaldırıldı`,true);return;
  }
  if(button.id==='v41ClearEffects'){
    event.preventDefault();event.stopImmediatePropagation();let character=v41Character(button.dataset.v41Character);if(!character||!confirm(`${character.name} üzerindeki bütün efektler kaldırılsın mı?`))return;
    character.effects=[];v41CommitEffects(character,'Bütün efektler temizlendi',true);return;
  }
  if(button.dataset.rmeffect){
    event.preventDefault();event.stopImmediatePropagation();let separator=button.dataset.rmeffect.indexOf('|'),id=separator<0?'':button.dataset.rmeffect.slice(0,separator),name=separator<0?'':button.dataset.rmeffect.slice(separator+1),character=v41Character(id);if(!character)return;
    let index=(character.effects||[]).findIndex(effect=>v41Fold(v41EffectName(effect))===v41Fold(name));if(index<0)return;character.effects.splice(index,1);v41CommitEffects(character,`${name} kaldırıldı`);return;
  }

  if(current.role==='dm'&&button.id==='v41RenameGuild'){modal('Lonca Adını Değiştir',field('v41GuildName','Yeni lonca adı','text',v41Guild()?.name||'')+'<button id="v41SaveGuildName" class="primary">Kaydet</button>');return}
  if(current.role==='dm'&&button.id==='v41SaveGuildName'){
    let guild=v41Guild(),name=$('#v41GuildName')?.value.trim();if(!guild||name.length<2)return alert('Lonca adı en az 2 karakter olmalı.');let old=guild.name;guild.name=name;for(let id of v41GuildMemberIds(guild))v41SetCharacterGuild(id,name);for(let character of state.characters||[])if(character.guild===old)character.guild=name;save();$('#modal')?.close();render();toast(`${old||'Lonca'} artık ${name}`);return;
  }
  if(current.role==='dm'&&button.dataset.v41GuildMember){
    let guild=v41Guild();if(!guild)return;let id=String(button.dataset.v41GuildMember),action=button.dataset.v41MemberAction,ids=v41GuildMemberIds(guild);
    if(action==='remove'&&!confirm('Bu oyuncu lonca üyeliğinden çıkarılsın mı? Kişisel eşya ve parası silinmez.'))return;
    guild.members=action==='add'?[...new Set([...ids,id])]:ids.filter(memberId=>memberId!==id);v41SetCharacterGuild(id,action==='add'?guild.name:'');save();render();toast(action==='add'?'Oyuncu loncaya eklendi':'Oyuncu loncadan çıkarıldı');return;
  }
  if(current.role==='dm'&&button.id==='v41AddGuildItem'){modal('Lonca Envanterine Ekle',v41GuildItemForm({},'add'));return}
  if(current.role==='dm'&&button.dataset.v41GuildEdit){let item=v41GuildItem(button.dataset.v41GuildEdit);if(item)modal(`${item.name} — Düzenle`,v41GuildItemForm(item,'edit'));return}
  if(current.role==='dm'&&button.id==='v41SaveGuildItem'){
    let edit=button.dataset.v41Mode==='edit',item=edit?v41GuildItem(button.dataset.v41ItemId):{id:uid(),qty:1,equipped:false};if(!item)return alert('Eşya artık lonca envanterinde değil.');v41ReadGuildItemForm(item);if(item.name.length<1)return alert('Eşya adı boş olamaz.');if(!edit)state.guildInventory.push(item);save();$('#modal')?.close();render();toast(edit?'Lonca eşyası güncellendi':'Lonca eşyası eklendi');return;
  }
  if(current.role==='dm'&&button.dataset.v41GuildDelete){let item=v41GuildItem(button.dataset.v41GuildDelete);if(!item||!confirm(`${item.name} lonca envanterinden kalıcı olarak silinsin mi?`))return;state.guildInventory=state.guildInventory.filter(row=>row!==item);save();render();toast('Lonca eşyası silindi');return}
  if(current.role==='dm'&&button.dataset.v41GuildGive){
    let item=v41GuildItem(button.dataset.v41GuildGive);if(!item)return;let options=(state.characters||[]).map(character=>`<option value="${esc(character.id)}">${esc(character.name)} • Lv ${character.level}</option>`).join('');modal(`${item.name} — Karaktere Ver`,`${options?`<label>Hedef karakter<select id="v41GuildGiveTarget">${options}</select></label>${field('v41GuildGiveQty','Adet','number',1)}<p class="muted">Eşyanın bütün bonusları ve özel alanları korunur. Verilen miktar lonca envanterinden düşer.</p><button id="v41ConfirmGuildGive" data-v41-item-id="${esc(item.id)}" class="primary">Aktar</button>`:'<div class="empty">Eşya verilecek karakter yok.</div>'}`);return;
  }
  if(current.role==='dm'&&button.id==='v41ConfirmGuildGive'){
    let item=v41GuildItem(button.dataset.v41ItemId),character=v41Character($('#v41GuildGiveTarget')?.value),quantity=Math.floor(+($('#v41GuildGiveQty')?.value||0)),available=Math.max(1,+item?.qty||1);if(!item||!character)return alert('Eşya veya hedef karakter artık bulunamadı.');if(quantity<1||quantity>available)return alert(`Adet 1–${available} arasında olmalı.`);
    let moved=v41Clone(item);moved.id=uid();moved.sourceItemId=item.sourceItemId||item.id;moved.qty=quantity;moved.equipped=false;character.inventory=Array.isArray(character.inventory)?character.inventory:[];character.inventory.push(moved);if(quantity===available)state.guildInventory=state.guildInventory.filter(row=>row!==item);else item.qty=available-quantity;save();let stored=typeof flushSave==='function'?await flushSave():true;$('#modal')?.close();render();toast(stored?`${quantity}× ${moved.name} ${character.name} karakterine verildi`:'Eşya yerelde aktarıldı; bulut kaydı tekrar denenecek',!stored);return;
  }

  if(current.role==='dm'&&button.dataset.npcitem){event.preventDefault();event.stopImmediatePropagation();v41OpenNpcItems(button.dataset.npcitem);return}
  if(current.role==='dm'&&button.id==='v41NpcItemAdd'){
    event.stopImmediatePropagation();
    let npc=(state.npcs||[]).find(row=>row.id===button.dataset.v41Npc),name=$('#v41NpcItemName')?.value.trim(),quantity=Math.max(1,Math.floor(+($('#v41NpcItemQty')?.value||1)));if(!npc||!name)return alert('NPC ve eşya adı gerekli.');v41EnsureNpcInventory(npc);npc.inventory.push({id:uid(),name,qty:quantity,note:$('#v41NpcItemNote')?.value.trim()||'',equipped:false});save();v41RefreshNpcModal(npc);toast('NPC eşyası eklendi');return;
  }
  if(current.role==='dm'&&button.dataset.v41NpcRemove!=null){event.stopImmediatePropagation();let npc=(state.npcs||[]).find(row=>row.id===button.dataset.v41Npc),index=+button.dataset.v41NpcRemove;if(!npc?.inventory?.[index])return;npc.inventory.splice(index,1);save();v41RefreshNpcModal(npc);toast('NPC eşyası kaldırıldı');return}

  if(current.role==='dm'&&button.dataset.v41ManageSkills){v41OpenSkills(button.dataset.v41ManageSkills);return}
  if(current.role==='dm'&&button.dataset.v41SkillRemove!=null){let character=v41Character(button.dataset.v41Character),index=+button.dataset.v41SkillRemove;if(!character?.skills?.[index])return;if(!confirm(`${character.skills[index].name} özel yeteneği silinsin mi?`))return;character.skills.splice(index,1);save();$('#modal')?.close();render();toast('Özel yetenek silindi');return}
  if(current.role==='dm'&&button.dataset.v41SkillEdit!=null){let character=v41Character(button.dataset.v41Character),skill=character?.skills?.[+button.dataset.v41SkillEdit];if(!skill)return;$('#modalTitle').textContent=`${character.name} — Yeteneği Düzenle`;$('#modalBody').innerHTML=field('v41SkillName','Yetenek adı','text',skill.name||'')+field('v41SkillNote','Açıklama','text',skill.note||'')+`<button id="v41SaveSkill" data-v41-character="${esc(character.id)}" data-v41-skill-index="${button.dataset.v41SkillEdit}" class="primary">Kaydet</button>`;return}
  if(current.role==='dm'&&button.id==='v41SaveSkill'){let character=v41Character(button.dataset.v41Character),skill=character?.skills?.[+button.dataset.v41SkillIndex],name=$('#v41SkillName')?.value.trim();if(!skill||!name)return alert('Yetenek adı boş olamaz.');skill.name=name;skill.note=$('#v41SkillNote')?.value.trim()||'';save();$('#modal')?.close();render();toast('Özel yetenek güncellendi');return}
},true);

if(current)render();
