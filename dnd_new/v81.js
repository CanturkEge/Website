/* Build 82: Wizard spellbook, rest-gated preparation and Arcane Recovery. */
(()=>{
 'use strict';
 const R=window.v81WizardRules;
 if(!R)return;
 const h=value=>typeof esc==='function'?esc(String(value??'')):String(value??'').replace(/[&<>\"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[char]));
 const wizard=()=>typeof myChar==='function'?myChar():null;
 const catalog=character=>R.wizardCatalog(window.V47_SPELLS||[]).filter(spell=>spell.level===0||spell.level<=R.maxSpellLevel(character)).sort((a,b)=>a.level-b.level||a.name.localeCompare(b.name,'en'));
 const ids=rows=>new Set((rows||[]).map(row=>R.key(row.id||row.sourceId||row.name)));
 const flag=(character,name)=>Number(character?.resources?.[name]||0)>0;
 const initialSetup=character=>!Number(character?.wizardSpellbookVersion||0);
 const libraryOpen=character=>initialSetup(character)||flag(character,'v82_spellbook_edit_ready');
 const preparationOpen=character=>initialSetup(character)||flag(character,'v82_prepare_ready');
 const recoveryUsed=character=>flag(character,'v74_recovery');
 const recoveryReady=character=>flag(character,'v82_arcane_recovery_ready')&&!recoveryUsed(character);
 function spellEntry(spell,source='level'){return {...R.entry(spell,source,new Date().toISOString())}}
 function sourceLabel(source){return source==='copied'?'Kopya':source==='level'?'Seviye':'Eski kayıt'}
 function bookPanel(character){
  const data=R.model(character,V47_SPELLS),bookIds=ids(data.book),preparedIds=ids(data.prepared),cantripIds=ids(data.cantrips),canEditLibrary=libraryOpen(character),canCopy=flag(character,'v82_spellbook_edit_ready'),canPrepare=preparationOpen(character),allRows=catalog(character),bookCount=data.book.length,preparedCount=data.prepared.length,cantripCount=data.cantrips.length;
  const rows=canEditLibrary?allRows:allRows.filter(spell=>spell.level===0?cantripIds.has(R.key(spell.id)):bookIds.has(R.key(spell.id)));
  const cards=rows.map(spell=>{
   const id=R.key(spell.id),isCantrip=spell.level===0,inBook=bookIds.has(id),prepared=preparedIds.has(id),knownCantrip=cantripIds.has(id),stored=data.book.find(row=>R.key(row.id)===id),source=stored?.source||'';
   if(isCantrip)return `<label class="v81-row ${canEditLibrary?'is-editable':'is-locked'}" data-v81-row data-tab="cantrip" data-search="${h(`${spell.name} ${spell.nameTr} ${spell.school}`.toLocaleLowerCase('tr'))}" data-level="0"><input type="checkbox" data-v81-cantrip="${h(spell.id)}" ${knownCantrip?'checked':''} ${canEditLibrary?'':'disabled'}><span><b>${h(spell.nameTr||spell.name)} <small>${h(spell.name)}</small></b><small>Cantrip • ${h(spell.schoolTr||spell.school)}</small></span><i class="v81-source">Bilinen</i></label>`;
   return `<article class="v81-row ${inBook?'in-book':''} ${canEditLibrary||canPrepare?'is-editable':'is-locked'}" data-v81-row data-tab="spell" data-search="${h(`${spell.name} ${spell.nameTr} ${spell.school}`.toLocaleLowerCase('tr'))}" data-level="${spell.level}"><input type="checkbox" data-v81-book="${h(spell.id)}" data-source="${h(source)}" ${inBook?'checked':''} ${canEditLibrary?'':'disabled'}><span><b>${h(spell.nameTr||spell.name)} <small>${h(spell.name)}</small></b><small>${spell.level}. seviye • ${h(spell.schoolTr||spell.school)}${spell.ritual?' • Ritüel':''}</small>${inBook?`<i class="v81-source ${source==='copied'?'copied':''}">${sourceLabel(source)}</i>`:''}</span><label class="v81-prepare"><input type="checkbox" data-v81-prepare="${h(spell.id)}" ${prepared?'checked':''} ${canPrepare&&inBook?'':'disabled'}> ${canPrepare?'Hazırla':prepared?'Hazır':'Kitapta'}</label></article>`;
  }).join('');
  const rituals=data.book.map(row=>R.resolve(V47_SPELLS,row)).filter(spell=>spell?.ritual).map(spell=>`<button class="ghost" data-v81-ritual="${h(spell.id)}">${h(spell.nameTr||spell.name)} · ritüel</button>`).join('');
  const status=initialSetup(character)?'İlk Wizard kurulumu açık: cantriplerini, başlangıç kitabını ve hazırlıklarını bir kez kaydet.':canEditLibrary?'DM kitap/cantrip düzenlemesini açtı. Seviye veya kopya kayıtlarını tamamlayıp bir kez kaydet.':canPrepare?'Uzun dinlenme tamamlandı. Kitabından günlük hazırlık listesini bir kez değiştirebilirsin.':'Cantrip ve büyü kitabın sabittir. Hazırlık listesi yalnız DM uzun dinlenmeyi tamamladığında açılır.';
  const addMode=canCopy?'<select id="v81AddMode"><option value="level">Seviye kazanımı</option><option value="copied">Parşömen/kitap kopyası</option></select>':'';
  const save=canEditLibrary||canPrepare?`<button id="v81WizardSave" class="primary">${canEditLibrary?'Kitap, cantrip ve hazırlıkları':'Günlük hazırlıkları'} kaydet</button>`:'';
  const recoveryText=recoveryUsed(character)?'Arcane Recovery kullanıldı':recoveryReady(character)?'Arcane Recovery':'Kısa dinlenme gerekli';
  return `<section class="v81-book"><div class="v81-head"><div><span class="v81-kicker">WIZARD • BÜYÜ KİTABI</span><h3>Kitabım ve Bugün Hazırladıklarım</h3><p>Ekran yalnız bildiğin cantripleri ve kitabındaki büyüleri gösterir. Ritüellerin hazırlanması gerekmez.</p></div><div class="v81-counts"><span>Cantrip <b id="v81CantripCount">${cantripCount}/${R.cantripLimit(character)}</b></span><span>Kitap <b id="v81BookCount">${bookCount}</b></span><span>Hazır <b id="v81PreparedCount">${preparedCount}/${R.prepareLimit(character)}</b></span></div></div><div class="v81-help ${canEditLibrary||canPrepare?'is-open':'is-locked'}">${h(status)}</div><div class="v81-toolbar ${canCopy?'':'is-compact'}"><input id="v81SpellSearch" class="input" placeholder="Büyü veya okul ara…"><select id="v81SpellLevel"><option value="">Bütün seviyeler</option><option value="0">Cantrip</option>${Array.from({length:R.maxSpellLevel(character)},(_,i)=>`<option value="${i+1}">${i+1}. seviye</option>`).join('')}</select>${addMode}</div><div class="v81-tabs"><button type="button" class="ghost active" data-v81-tab="all">Tümü</button><button type="button" class="ghost" data-v81-tab="cantrip">Cantripler</button><button type="button" class="ghost" data-v81-tab="spell">Kitap büyüleri</button></div><div class="v81-list">${cards||'<p class="empty">Wizard büyü kaydı bulunamadı. DM kitap düzenlemesini açmalı.</p>'}</div><div class="v81-actions">${save}<button type="button" class="ghost" id="v81RecoveryOpen" ${recoveryReady(character)?'':'disabled'}>${recoveryText}</button>${rituals}</div></section>`;
 }
 const choiceBase=prChoicePanel;
 prChoicePanel=function(character){
  let html=choiceBase(character);if(character?.className!=='Wizard')return html;
  html=html.replace('<section class="pr-choice card v53-choice"','<section class="pr-choice card v53-choice v81-wizard-active"');
  if(/<button id="prSavePlayerChoices"[^>]*>[\s\S]*?<\/button>/.test(html))return html.replace(/<button id="prSavePlayerChoices"[^>]*>[\s\S]*?<\/button>/,bookPanel(character));
  return html.replace('</section>',bookPanel(character)+'</section>');
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
  modal('Arcane Recovery',`<div class="v81-recovery"><p>DM tarafından tamamlanan kısa dinlenmenin sonunda toplam seviyesi en fazla <b>${budget}</b> olan, 6. seviyeden düşük harcanmış slotları geri kazan.</p><div class="v81-recovery-grid">${fields||'<p class="empty">Geri kazanılabilecek harcanmış slot yok.</p>'}</div><p class="v81-recovery-status">Kullanılan bütçe: <span id="v81RecoveryCost">0</span> / ${budget}</p><button class="primary" id="v81RecoverySave" ${fields?'':'disabled'}>Slotları Geri Kazan</button></div>`);
 }
 async function call(name,payload,button){
  if(!auth?.sessionToken)return alert('Güvenli oturum bulunamadı. Çıkış yapıp yeniden giriş yap.');if(button)button.disabled=true;
  let data,error;try{({data,error}=await db.rpc(name,payload))}catch(failure){error={message:failure?.message||'Bağlantı kurulamadı'}}
  if(error){if(button)button.disabled=false;alert(error.message);return false}await syncFromServer(true);return data!==false;
 }
 function combatCharacter(){
  const available=(state?.characters||[]).filter(c=>(c.approvalStatus||'approved')==='approved'),selected=window.kadimUiState?.get('v74-character','');
  return available.find(c=>c.id===selected)||available[0]||null;
 }
 function installDmControls(){
  const A=window.v74;if(!A?.clicks||!A?.renderers?.desk||A.v82WizardInstalled)return;A.v82WizardInstalled=true;
  for(const kind of ['short','long']){
   const fallback=A.clicks['rest_'+kind];
   A.clicks['rest_'+kind]=async button=>{
    const character=(state?.characters||[]).find(c=>c.id===button.dataset.id);
    if(character?.className!=='Wizard')return fallback(button);
    if(!confirm(`${kind==='short'?'Kısa':'Uzun'} dinlenme tamamlandı mı? Uygun slotlar, sınıf kaynakları ve Wizard izinleri güncellenecek.`))return false;
    if(await call('wizard_rest_v82',{p_session_token:auth.sessionToken,p_campaign:current.id,p_character:character.id,p_kind:kind},button)){toast(`${kind==='short'?'Kısa':'Uzun'} dinlenme tamamlandı`);await A.load(true);render();return true}
    return false;
   };
  }
  const baseDesk=A.renderers.desk;
  A.renderers.desk=()=>{
   const html=baseDesk(),character=combatCharacter();if(current?.role!=='dm'||character?.className!=='Wizard')return html;
   const open=flag(character,'v82_spellbook_edit_ready'),button=`<button type="button" class="ghost" data-v81-library-unlock="${h(character.id)}" ${open?'disabled':''}>${open?'Kitap düzenlemesi açık':'Wizard kitap/cantrip düzenlemesini aç'}</button>`;
   return html.replace('<p class="v74-note">',`<div class="v74-actions v81-dm-actions">${button}</div><p class="v74-note">`);
  };
 }
 installDmControls();
 document.addEventListener('input',event=>{if(event.target.id==='v81SpellSearch')filterRows();if(event.target.matches?.('[data-v81-recover]')){const total=[...document.querySelectorAll('[data-v81-recover]')].reduce((sum,input)=>sum+Number(input.dataset.v81Recover)*Math.max(0,Number(input.value)||0),0);if($('#v81RecoveryCost'))$('#v81RecoveryCost').textContent=total}},true);
 document.addEventListener('change',event=>{
  const character=wizard();if(!character)return;
  if(event.target.id==='v81SpellLevel')filterRows();
  if(event.target.matches?.('[data-v81-book]')){
   const input=event.target,row=input.closest('[data-v81-row]'),prepare=row?.querySelector('[data-v81-prepare]');
   if(input.checked&&!input.dataset.source){const mode=$('#v81AddMode')?.value||'level',spell=R.resolve(V47_SPELLS,input.dataset.v81Book);if(mode==='copied'){const cost=R.copyCost(spell);if(!confirm(`${spell.nameTr||spell.name} kopyası ${cost.gp} GP ve ${cost.hours} saat gerektirir. DM onayladı mı?`)){input.checked=false;return}input.dataset.source='copied';}else input.dataset.source='level';}
   if(!input.checked){input.dataset.source='';if(prepare){prepare.checked=false;prepare.disabled=true}}else if(prepare&&preparationOpen(character))prepare.disabled=false;
   row?.classList.toggle('in-book',input.checked);updateCounts();
  }
  if(event.target.matches?.('[data-v81-cantrip],[data-v81-prepare]'))updateCounts();
 },true);
 document.addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button||!current)return;
  if(button.dataset.v81LibraryUnlock){if(current.role!=='dm')return;if(!confirm('Oyuncuya bir kerelik Wizard kitap ve cantrip düzenleme izni verilsin mi?'))return;if(await call('wizard_spellbook_unlock_v82',{p_session_token:auth.sessionToken,p_campaign:current.id,p_character:button.dataset.v81LibraryUnlock},button)){toast('Wizard kitap düzenlemesi açıldı');await window.v74?.load(true);render()}return}
  if(button.dataset.v81Tab){document.querySelectorAll('[data-v81-tab]').forEach(node=>node.classList.toggle('active',node===button));filterRows();return}
  const character=wizard();if(character?.className!=='Wizard')return;
  if(button.id==='v81WizardSave'){
   const value=selectedModel(character),errors=R.validate(character,value,V47_SPELLS);if(errors.length)return alert(errors.join('\n'));
   const subclass=character.subclass||$('#prPlayerSubclass')?.value||'';if(R.level(character)>=2&&!subclass)return alert('Önce Wizard geleneğini seç.');
   if(await call('wizard_spellbook_set_v81',{p_session_token:auth.sessionToken,p_campaign:current.id,p_subclass:subclass,p_spellbook:value.book,p_prepared:value.prepared,p_cantrips:value.cantrips},button)){window.kadimUiState?.clearWithin($('#view'));toast('Wizard seçimleri kaydedildi');render()}return;
  }
  if(button.id==='v81RecoveryOpen'){if(!recoveryReady(character))return alert('Arcane Recovery için DM’in kısa dinlenmeyi tamamlaması gerekiyor.');recoveryModal(character);return}
  if(button.id==='v81RecoverySave'){
   const recovery=Object.fromEntries([...document.querySelectorAll('[data-v81-recover]')].map(input=>[input.dataset.v81Recover,Math.max(0,Math.trunc(Number(input.value)||0))]).filter(([,count])=>count>0));
   if(!Object.keys(recovery).length)return alert('Geri kazanılacak slot seç.');if(await call('wizard_arcane_recovery_v81',{p_session_token:auth.sessionToken,p_campaign:current.id,p_recovery:recovery},button)){document.querySelector('#modal')?.close();toast('Arcane Recovery uygulandı');render()}return;
  }
  if(button.dataset.v81Ritual){const spell=R.resolve(V47_SPELLS,button.dataset.v81Ritual);if(!confirm(`${spell?.nameTr||spell?.name||'Büyü'} ritüel olarak kullanılacak. Normal kullanım süresine 10 dakika eklenir; slot harcanmaz. Devam?`))return;if(await call('wizard_ritual_cast_v81',{p_session_token:auth.sessionToken,p_campaign:current.id,p_spell_id:button.dataset.v81Ritual},button))toast('Ritüel kullanımı masaya kaydedildi');}
 },true);
 if(typeof V37_PATCH_NOTES!=='undefined'&&Array.isArray(V37_PATCH_NOTES)&&!V37_PATCH_NOTES.some(row=>row.build==='Build 82'))V37_PATCH_NOTES.unshift({version:'3.10.1',build:'Build 82',title:'Wizard Dinlenme Kilitleri',tag:'WIZARD',tone:'current',summary:'Wizard kitabı, günlük hazırlık ve Arcane Recovery artık DM tarafından tamamlanan dinlenme akışlarına bağlıdır.',added:['DM savaş araçlarından Wizard kitap/cantrip düzenlemesini bir kerelik açabilir.','Uzun dinlenme günlük hazırlığı, kısa dinlenme Arcane Recovery seçimini açar.'],fixed:['Oyuncunun bütün Wizard kataloğunu normal zamanda görüp kendi kitabına yazabilmesi engellendi.','Cantrip ve hazırlanan büyülerin dinlenme dışında sınırsız değiştirilmesi kapatıldı.','Arcane Recovery kısa dinlenme olmadan kullanılamaz ve uzun dinlenmede doğru biçimde sıfırlanır.'],changed:['Normal Wizard görünümü yalnız bilinen cantripleri ve kitapta bulunan büyüleri gösterir.']});
 if(auth&&current)render();
})();
