/* Build 81: Wizard spellbook, prepared spells, ritual casting and Arcane Recovery. */
(()=>{
 'use strict';
 const R=window.v81WizardRules;
 if(!R)return;
 const h=value=>typeof esc==='function'?esc(String(value??'')):String(value??'').replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
 const wizard=()=>typeof myChar==='function'?myChar():null;
 const catalog=character=>R.wizardCatalog(window.V47_SPELLS||[]).filter(spell=>spell.level===0||spell.level<=R.maxSpellLevel(character)).sort((a,b)=>a.level-b.level||a.name.localeCompare(b.name,'en'));
 const ids=rows=>new Set((rows||[]).map(row=>R.key(row.id||row.sourceId||row.name)));
 function spellEntry(spell,source='level'){return {...R.entry(spell,source,new Date().toISOString())}}
 function sourceLabel(source){return source==='copied'?'Kopya':source==='level'?'Seviye':'Eski kayıt'}
 function bookPanel(character){
  const data=R.model(character,V47_SPELLS),bookIds=ids(data.book),preparedIds=ids(data.prepared),cantripIds=ids(data.cantrips),rows=catalog(character),bookCount=data.book.length,preparedCount=data.prepared.length,cantripCount=data.cantrips.length;
  const cards=rows.map(spell=>{
   const id=R.key(spell.id),isCantrip=spell.level===0,inBook=bookIds.has(id),prepared=preparedIds.has(id),knownCantrip=cantripIds.has(id),stored=data.book.find(row=>R.key(row.id)===id),source=stored?.source||'';
   if(isCantrip)return `<label class="v81-row" data-v81-row data-tab="cantrip" data-search="${h(`${spell.name} ${spell.nameTr} ${spell.school}`.toLocaleLowerCase('tr'))}" data-level="0"><input type="checkbox" data-v81-cantrip="${h(spell.id)}" ${knownCantrip?'checked':''}><span><b>${h(spell.nameTr||spell.name)} <small>${h(spell.name)}</small></b><small>Cantrip • ${h(spell.schoolTr||spell.school)}</small></span></label>`;
   return `<article class="v81-row ${inBook?'in-book':''}" data-v81-row data-tab="spell" data-search="${h(`${spell.name} ${spell.nameTr} ${spell.school}`.toLocaleLowerCase('tr'))}" data-level="${spell.level}"><input type="checkbox" data-v81-book="${h(spell.id)}" data-source="${h(source)}" ${inBook?'checked':''}><span><b>${h(spell.nameTr||spell.name)} <small>${h(spell.name)}</small></b><small>${spell.level}. seviye • ${h(spell.schoolTr||spell.school)}${spell.ritual?' • Ritüel':''}</small>${inBook?`<i class="v81-source ${source==='copied'?'copied':''}">${sourceLabel(source)}</i>`:''}</span><label class="v81-prepare"><input type="checkbox" data-v81-prepare="${h(spell.id)}" ${prepared?'checked':''} ${inBook?'':'disabled'}> Hazırla</label></article>`;
  }).join('');
  const rituals=data.book.map(row=>R.resolve(V47_SPELLS,row)).filter(spell=>spell?.ritual).map(spell=>`<button class="ghost" data-v81-ritual="${h(spell.id)}">${h(spell.nameTr||spell.name)} · ritüel</button>`).join('');
  return `<section class="v81-book"><div class="v81-head"><div><span class="v81-kicker">WIZARD • BÜYÜ KİTABI</span><h3>Kitabım ve Bugün Hazırladıklarım</h3><p>Cantripler bilinir. Slotlu bir büyüyü hazırlamak için önce kitabında bulunması gerekir.</p></div><div class="v81-counts"><span>Cantrip <b id="v81CantripCount">${cantripCount}/${R.cantripLimit(character)}</b></span><span>Kitap <b id="v81BookCount">${bookCount}</b></span><span>Hazır <b id="v81PreparedCount">${preparedCount}/${R.prepareLimit(character)}</b></span></div></div><div class="v81-help">Seviye kazanımı kotası: en çok ${R.learnedAllowance(character)} büyü. Kitap veya parşömenden kopya bu kotaya sayılmaz; temel bedel büyü seviyesi başına 50 GP ve 2 saattir. Kopyayı DM onayıyla kaydet.</div><div class="v81-toolbar"><input id="v81SpellSearch" class="input" placeholder="Büyü, okul veya seviye ara…"><select id="v81SpellLevel"><option value="">Bütün seviyeler</option><option value="0">Cantrip</option>${Array.from({length:R.maxSpellLevel(character)},(_,i)=>`<option value="${i+1}">${i+1}. seviye</option>`).join('')}</select><select id="v81AddMode"><option value="level">Seviye kazanımı</option><option value="copied">Parşömen/kitap kopyası</option></select></div><div class="v81-tabs"><button type="button" class="ghost active" data-v81-tab="all">Tümü</button><button type="button" class="ghost" data-v81-tab="cantrip">Cantripler</button><button type="button" class="ghost" data-v81-tab="spell">Kitap büyüleri</button></div><div class="v81-list">${cards}</div><div class="v81-actions"><button type="button" class="ghost" id="v81RecoveryOpen" ${Number(character.resources?.v74_recovery||0)>0?'disabled':''}>${Number(character.resources?.v74_recovery||0)>0?'Arcane Recovery kullanıldı':'Arcane Recovery'}</button>${rituals}</div></section>`;
 }
 const choiceBase=prChoicePanel;
 prChoicePanel=function(character){
  let html=choiceBase(character);if(character?.className!=='Wizard')return html;
  html=html.replace('<section class="pr-choice card v53-choice"','<section class="pr-choice card v53-choice v81-wizard-active"');
  const save='<button id="v81WizardSave" class="primary">Büyü Kitabını ve Hazırlananları Kaydet</button>';
  if(/<button id="prSavePlayerChoices"[^>]*>[\s\S]*?<\/button>/.test(html))return html.replace(/<button id="prSavePlayerChoices"[^>]*>[\s\S]*?<\/button>/,bookPanel(character)+save);
  return html.replace('</section>',bookPanel(character)+save+'</section>');
 };
 function selectedModel(character){
  const rows=catalog(character),byId=new Map(rows.map(spell=>[R.key(spell.id),spell]));
  const book=[...document.querySelectorAll('[data-v81-book]:checked')].map(input=>{const spell=byId.get(R.key(input.dataset.v81Book));return spell?spellEntry(spell,input.dataset.source||'level'):null}).filter(Boolean);
  const prepared=[...document.querySelectorAll('[data-v81-prepare]:checked')].map(input=>{const spell=byId.get(R.key(input.dataset.v81Prepare));return spell?spellEntry(spell,'prepared'):null}).filter(Boolean);
  const cantrips=[...document.querySelectorAll('[data-v81-cantrip]:checked')].map(input=>{const spell=byId.get(R.key(input.dataset.v81Cantrip));return spell?spellEntry(spell,'cantrip'):null}).filter(Boolean);
  return {book,prepared,cantrips};
 }
 function updateCounts(){const character=wizard();if(!character)return;const value=selectedModel(character);$('#v81CantripCount')&&($('#v81CantripCount').textContent=`${value.cantrips.length}/${R.cantripLimit(character)}`);$('#v81BookCount')&&($('#v81BookCount').textContent=value.book.length);$('#v81PreparedCount')&&($('#v81PreparedCount').textContent=`${value.prepared.length}/${R.prepareLimit(character)}`)}
 function filterRows(){const query=($('#v81SpellSearch')?.value||'').trim().toLocaleLowerCase('tr'),level=$('#v81SpellLevel')?.value||'',tab=document.querySelector('[data-v81-tab].active')?.dataset.v81Tab||'all';for(const row of document.querySelectorAll('[data-v81-row]'))row.hidden=!!((query&&!row.dataset.search.includes(query))||(level&&row.dataset.level!==level)||(tab!=='all'&&row.dataset.tab!==tab));}
 function recoveryModal(character){
  const used=Object.entries(character.spellSlotsUsed||{}).map(([slot,count])=>[Number(slot),Number(count)||0]).filter(([slot,count])=>slot>=1&&slot<=5&&count>0),budget=Math.ceil(R.level(character)/2);
  const fields=used.map(([slot,count])=>`<label>${slot}. seviye slot <input type="number" min="0" max="${count}" value="0" data-v81-recover="${slot}"></label>`).join('');
  modal('Arcane Recovery',`<div class="v81-recovery"><p>Kısa dinlenme sonunda toplam seviyesi en fazla <b>${budget}</b> olan, 6. seviyeden düşük harcanmış slotları geri kazan.</p><div class="v81-recovery-grid">${fields||'<p class="empty">Geri kazanılabilecek harcanmış slot yok.</p>'}</div><p class="v81-recovery-status">Kullanılan bütçe: <span id="v81RecoveryCost">0</span> / ${budget}</p><button class="primary" id="v81RecoverySave" ${fields?'':'disabled'}>Slotları Geri Kazan</button></div>`);
 }
 async function call(name,payload,button){
  if(!auth?.sessionToken)return alert('Güvenli oturum bulunamadı. Çıkış yapıp yeniden giriş yap.');if(button)button.disabled=true;
  let data,error;try{({data,error}=await db.rpc(name,payload))}catch(failure){error={message:failure?.message||'Bağlantı kurulamadı'}}
  if(error){if(button)button.disabled=false;alert(error.message);return false}await syncFromServer(true);return data!==false;
 }
 document.addEventListener('input',event=>{if(event.target.id==='v81SpellSearch')filterRows();if(event.target.matches?.('[data-v81-recover]')){const total=[...document.querySelectorAll('[data-v81-recover]')].reduce((sum,input)=>sum+Number(input.dataset.v81Recover)*Math.max(0,Number(input.value)||0),0);if($('#v81RecoveryCost'))$('#v81RecoveryCost').textContent=total}},true);
 document.addEventListener('change',event=>{
  const character=wizard();if(!character)return;
  if(event.target.id==='v81SpellLevel')filterRows();
  if(event.target.matches?.('[data-v81-book]')){
   const input=event.target,row=input.closest('[data-v81-row]'),prepare=row?.querySelector('[data-v81-prepare]');
   if(input.checked&&!input.dataset.source){const mode=$('#v81AddMode')?.value||'level',spell=R.resolve(V47_SPELLS,input.dataset.v81Book);if(mode==='copied'){const cost=R.copyCost(spell);if(!confirm(`${spell.nameTr||spell.name} kopyası ${cost.gp} GP ve ${cost.hours} saat gerektirir. DM onayladı mı?`)){input.checked=false;return}input.dataset.source='copied';}else input.dataset.source='level';}
   if(!input.checked){input.dataset.source='';if(prepare){prepare.checked=false;prepare.disabled=true}}else if(prepare)prepare.disabled=false;
   row?.classList.toggle('in-book',input.checked);updateCounts();
  }
  if(event.target.matches?.('[data-v81-cantrip],[data-v81-prepare]'))updateCounts();
 },true);
 document.addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button||!current)return;
  if(button.dataset.v81Tab){document.querySelectorAll('[data-v81-tab]').forEach(node=>node.classList.toggle('active',node===button));filterRows();return}
  const character=wizard();if(character?.className!=='Wizard')return;
  if(button.id==='v81WizardSave'){
   const value=selectedModel(character),errors=R.validate(character,value,V47_SPELLS);if(errors.length)return alert(errors.join('\n'));
   const subclass=character.subclass||$('#prPlayerSubclass')?.value||'';if(R.level(character)>=2&&!subclass)return alert('Önce Wizard geleneğini seç.');
   if(await call('wizard_spellbook_set_v81',{p_session_token:auth.sessionToken,p_campaign:current.id,p_subclass:subclass,p_spellbook:value.book,p_prepared:value.prepared,p_cantrips:value.cantrips},button)){window.kadimUiState?.clearWithin($('#view'));toast('Büyü kitabı ve günlük hazırlık kaydedildi');render()}return;
  }
  if(button.id==='v81RecoveryOpen'){recoveryModal(character);return}
  if(button.id==='v81RecoverySave'){
   const recovery=Object.fromEntries([...document.querySelectorAll('[data-v81-recover]')].map(input=>[input.dataset.v81Recover,Math.max(0,Math.trunc(Number(input.value)||0))]).filter(([,count])=>count>0));
   if(!Object.keys(recovery).length)return alert('Geri kazanılacak slot seç.');if(await call('wizard_arcane_recovery_v81',{p_session_token:auth.sessionToken,p_campaign:current.id,p_recovery:recovery},button)){document.querySelector('#modal')?.close();toast('Arcane Recovery uygulandı');render()}return;
  }
  if(button.dataset.v81Ritual){const spell=R.resolve(V47_SPELLS,button.dataset.v81Ritual);if(!confirm(`${spell?.nameTr||spell?.name||'Büyü'} ritüel olarak kullanılacak. Normal kullanım süresine 10 dakika eklenir; slot harcanmaz. Devam?`))return;if(await call('wizard_ritual_cast_v81',{p_session_token:auth.sessionToken,p_campaign:current.id,p_spell_id:button.dataset.v81Ritual},button))toast('Ritüel kullanımı masaya kaydedildi');}
 },true);
 if(typeof V37_PATCH_NOTES!=='undefined'&&Array.isArray(V37_PATCH_NOTES)&&!V37_PATCH_NOTES.some(row=>row.build==='Build 81'))V37_PATCH_NOTES.unshift({version:'3.10.0',build:'Build 81',title:'Wizard Büyü Kitabı',tag:'WIZARD',tone:'current',summary:'Wizard artık kitabındaki büyülerle günlük hazırladıklarını ayrı yönetir; ritüeller ve Arcane Recovery gerçek kurallarıyla izlenir.',added:['Cantrip, Büyü Kitabım ve Bugün Hazırladıklarım için ayrı sayaç ve seçimler.','Seviye kazanımı veya DM onaylı parşömen/kitap kopyası kaydı; kopya için GP ve süre bilgisi.','Kitapta bulunan ritüelleri hazırlamadan, slot harcamadan kullanım kaydı.','Harcanmış 1–5. seviye slotlardan seviye toplamı sınırıyla Arcane Recovery seçimi.'],fixed:['Eski Wizard karakterlerinin hazırlanmış büyüleri ilk geçişte kitap kaydı olarak korunur.','Kitapta bulunmayan büyünün hazırlanması ve hazırlama sınırının aşılması sunucuda reddedilir.'],changed:['Wizard kayıtları oyuncunun güvenli oturumu ve karakter sahipliği doğrulanarak kampanya state’ine yazılır.','Kopya maliyeti bilgi olarak tutulur; DM onayı olmadan Kesem’den otomatik para çekilmez.']});
 if(auth&&current)render();
})();
