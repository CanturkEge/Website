/* v52: deity-bound Cleric creation and level-aware domain rules. */
(()=>{
  'use strict';

  const v52Domains=()=>window.V52_CLERIC_DOMAINS||{};
  const v52Deities=()=>Array.isArray(window.V52_CLERIC_MAIN_DEITIES)?window.V52_CLERIC_MAIN_DEITIES:[];
  const v52Level=value=>Math.max(1,Math.min(20,Math.trunc(+value||1)));
  const v52Deity=id=>v52Deities().find(row=>row.id===id)||((window.V49_DEITIES||[]).find(row=>row.id===id))||null;
  const v52Domain=id=>v52Domains()[id]||null;
  const v52DomainLabel=id=>{const row=v52Domain(id);return row?`${row.icon} ${row.name} (${row.id})`:id||'Seçilmedi'};
  const v52Unique=values=>[...new Set(values.filter(Boolean))];
  const v52DomainNames=Object.freeze({Bilgi:'Knowledge',Yaşam:'Life',Işık:'Light',Doğa:'Nature',Fırtına:'Tempest',Hile:'Trickery',Savaş:'War',Ölüm:'Death'});
  const v52CoreDomainIds=deity=>v52Unique([...(deity?.coreDomains||[]),...(deity?.domains||[]).map(name=>v52DomainNames[name])]);
  const v52CurrentDomainIds=deity=>v52Unique([...(deity?.compatibleDomains||[]),...v52CoreDomainIds(deity)]).filter(id=>v52Domain(id));
  const v52IsCore=(deity,domain)=>v52CoreDomainIds(deity).includes(domain);
  const v52SourceBadge=domain=>domain?.dmApproval?'DM ONAYI':domain?.core2014?'2014 ÇEKİRDEK':'RESMÎ 5E • 2014 DÖNEMİ';
  const v52SpellKey=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").toLowerCase().replace(/[^a-z0-9]+/g,'');

  function v52AutoSpellKeys(character){
    const domain=v52Domain(character?.subclass),level=v52Level(character?.level);
    return new Set(domain?domain.spells.filter(row=>level>=row[0]).flatMap(row=>[v52SpellKey(row[1]),v52SpellKey(row[2])]):[]);
  }

  if(typeof prPrepareLimit==='function'){
    const v52PrepareLimitBase=prPrepareLimit;
    prPrepareLimit=function(character){
      if(character?.className!=='Cleric')return v52PrepareLimitBase(character);
      return Math.max(1,v52Level(character.level)+prMod(prStats(character).WIS));
    };
  }

  if(typeof prSpellOptions==='function'){
    const v52SpellOptionsBase=prSpellOptions;
    prSpellOptions=function(character){
      const rows=v52SpellOptionsBase(character);
      if(character?.className!=='Cleric'||!character.subclass)return rows;
      const automatic=v52AutoSpellKeys(character);
      return rows.filter(spell=>!automatic.has(v52SpellKey(spell.name)));
    };
  }

  if(typeof prAutoAC==='function'){
    const v52AutoAcBase=prAutoAC;
    prAutoAC=function(character){
      let armorClass=v52AutoAcBase(character);
      if(character?.className!=='Cleric'||character.subclass!=='Forge'||v52Level(character.level)<6)return armorClass;
      const equipped=typeof v25Equipped==='function'?v25Equipped(character):(character.inventory||[]).filter(item=>item.equipped);
      const heavy=equipped.some(item=>(item.slot==='armor'||item.armorBase!=null)&&item.armorType==='heavy');
      return armorClass+(heavy?1:0);
    };
  }
  const v52Signed=value=>`${value>=0?'+':''}${value}`;

  function v52DeityOptions(selected='',requiredDomain=''){
    const rows=v52Deities().filter(row=>!requiredDomain||!v52Domain(requiredDomain)||v52CurrentDomainIds(row).includes(requiredDomain));
    const legacy=selected&&!rows.some(row=>row.id===selected)?v52Deity(selected):null;
    return `<option value="">Tanrı seç</option>${legacy?`<option value="${esc(legacy.id)}" selected>${esc(legacy.name)} • eski/özel seçim</option>`:''}${rows.map(row=>`<option value="${esc(row.id)}" ${row.id===selected?'selected':''}>${esc(row.name)} • ${esc(row.alignment)} • ${esc(row.portfolio||'')}</option>`).join('')}`;
  }

  function v52DomainOptions(deityId,selected=''){
    const deity=v52Deity(deityId),ids=v52CurrentDomainIds(deity),legacy=selected&&!ids.includes(selected);
    return `<option value="">İlahi Alan seç</option>${legacy?`<option value="${esc(selected)}" selected>${esc(v52DomainLabel(selected))} • eski/DM seçimi</option>`:''}${ids.map(id=>{const row=v52Domain(id),kind=v52IsCore(deity,id)?'Appendix B':'ek kitap uyumu';return `<option value="${esc(id)}" ${id===selected?'selected':''}>${esc(v52DomainLabel(id))} • ${kind}${row.dmApproval?' • DM onayı':''}</option>`}).join('')}`;
  }

  function v52SetDomainSelect(select,deityId,preferred=''){
    if(!select)return;
    const old=preferred||select.value,allowed=!!old&&(!v52Domain(old)||v52CurrentDomainIds(v52Deity(deityId)).includes(old));
    select.innerHTML=v52DomainOptions(deityId,allowed?old:'');
    select.value=allowed?old:'';
    select.disabled=!deityId;
  }

  function v52NewClericChoices(){
    return `<section class="v52-identity-choice v52-new-choice"><div class="v52-choice-head"><span>2014 CLERIC KUTSAL BAĞI</span><b>Tanrı → uygun domain → mekanik güçler</b><p>Tanrı adı bedava stat vermez. Seçtiğin domain 1. seviyeden itibaren büyüleri, Channel Divinity seçeneğini ve seviye özelliklerini verir.</p></div><div class="v52-choice-grid"><label>Hizmet ettiğin ana tanrı<select id="v52NewDeity">${v52DeityOptions()}</select><small>Cleric seçimi için 30 ana Forgotten Realms tanrısı.</small></label><label>İlahi Alan / Domain<select id="v31NewSubclass" disabled>${v52DomainOptions('')}</select><small>Appendix B önerileri ile resmî ek kitap uyumları gösterilir.</small></label></div><p class="v52-choice-warning">Death Domain, 2014 DMG seçeneğidir ve oyuncu için DM onayı ister. Domain seçimi kaydedilince yalnız DM değiştirebilir.</p></section>`;
  }

  if(typeof v30NewChoices==='function'){
    const v52NewChoicesBase=v30NewChoices;
    v30NewChoices=function(className,species){
      let html=v52NewChoicesBase(className,species);
      if(className!=='Cleric')return html;
      return html.replace(/<label>Başlangıç subclassı<select id="v31NewSubclass">[\s\S]*?<\/label>/,v52NewClericChoices());
    };
  }

  function v52PlayerIdentityEditor(character){
    const currentDomain=character.subclass||'',currentDeity=character.deityId||'',needsDomain=!currentDomain,needsDeity=!currentDeity;
    if(!needsDomain&&!needsDeity)return '';
    if(currentDomain&&!v52Domain(currentDomain))return `<section class="card v52-identity-choice"><div class="v52-choice-head"><span>KAMPANYAYA ÖZEL CLERIC</span><b>${esc(currentDomain)} korunuyor</b><p>Bu domain 14 resmî v52 alanından biri değil. Eski seçimin değiştirilmedi; ana tanrı bağlantısını gerekiyorsa DM karakter düzenleme ekranından ekleyebilir.</p></div></section>`;
    const deityDisabled=!needsDeity?'disabled':'';
    return `<section class="card v52-identity-choice"><div class="v52-choice-head"><span>KUTSAL BAĞ EKSİK</span><b>${esc(character.name)} için ${needsDeity?'tanrı':'domain'} seçimi</b><p>Eski karakter silinmedi. Eksik alanı bir kez tamamla; seçim bundan sonra yalnız DM tarafından değiştirilebilir.</p></div><div class="v52-choice-grid"><label>Ana tanrı<select id="v52PlayerDeity" ${deityDisabled}>${v52DeityOptions(currentDeity,currentDomain)}</select></label><label>İlahi Alan / Domain<select id="v52PlayerDomain" ${currentDomain?'disabled':''}>${v52DomainOptions(currentDeity,currentDomain)}</select></label></div><button id="v52SaveClericIdentity" class="primary" data-character="${esc(character.id)}">Kutsal Bağı Kaydet</button><p class="v52-choice-warning">Tanrı ve domain uyuşmuyorsa kayıt yapılmaz. Bu seçim STR, AC veya zar bonusunu tanrı adından değil, domain özelliğinden verir.</p></section>`;
  }

  if(typeof prChoicePanel==='function'){
    const v52ChoiceBase=prChoicePanel;
    prChoicePanel=function(character){
      let html=v52ChoiceBase(character);
      if(character?.className!=='Cleric')return html;
      html=html.replace('Cantrip’ler hazırlama sınırına dahil değildir.','Cantrip’ler sınıra dahil değildir. Açılmış domain büyülerin daima hazırlanır ve bu listede tekrar seçilmez.');
      if(!character.subclass){
        html=html.replace(/<label>Subclass — tek seçim<select id="prPlayerSubclass">[\s\S]*?<\/label>/,'');
        html=html.replace(/<button id="prSavePlayerChoices" class="primary" data-limit="[^"]*">Seçimlerimi Kaydet<\/button>/,'');
      }
      return `${v52PlayerIdentityEditor(character)}${html}`;
    };
  }

  function v52DmDeityField(character,className){
    const cleric=className==='Cleric',selected=cleric?character?.deityId||'':'';
    return `<label id="v52DmDeityWrap" ${cleric?'':'hidden'}>Cleric ana tanrısı<select id="v52DmDeity">${v52DeityOptions(selected)}</select><small>Domain seçenekleri tanrının portfolio alanına göre daralır.</small></label>`;
  }

  if(typeof charForm==='function'){
    const v52CharFormBase=charForm;
    charForm=function(character={},userId=''){
      const html=v52CharFormBase(character,userId),className=character.className||'Fighter';
      let out=html.replace('<button class="primary" id="saveCharacter"',`${v52DmDeityField(character,className)}<button class="primary" id="saveCharacter"`);
      if(className==='Cleric')out=out.replace(/<select id="cSubclass"([^>]*)>[\s\S]*?<\/select>/,`<select id="cSubclass"$1>${v52DomainOptions(character.deityId||'',character.subclass||'')}</select>`);
      return out;
    };
  }

  function v52RefreshDmEditor(){
    const classSelect=$('#cClass'),wrap=$('#v52DmDeityWrap'),deitySelect=$('#v52DmDeity'),domainSelect=$('#cSubclass');
    if(!classSelect||!wrap||!deitySelect||!domainSelect)return;
    const cleric=classSelect.value==='Cleric';wrap.hidden=!cleric;
    if(!cleric)return;
    v52SetDomainSelect(domainSelect,deitySelect.value,domainSelect.value);
  }

  if(typeof v30ClassData==='function'){
    const v52ClassDataBase=v30ClassData;
    v30ClassData=function(character){
      const row=v52ClassDataBase(character).slice();
      if(character?.className!=='Cleric')return row;
      const domain=character.subclass||'';
      if(['Life','Nature','Tempest','War','Forge','Order','Twilight'].includes(domain))row[2]='Light armor, medium armor, heavy armor, shields';
      if(['Tempest','War','Death','Twilight'].includes(domain))row[3]='Simple ve martial silahlar';
      const additions=[];
      if(domain==='Forge')additions.push('Smith’s tools');
      if(domain==='Knowledge')additions.push('2 dil; 2 bilgi skillinde expertise');
      if(domain==='Nature')additions.push('1 doğa skilli; 1 Druid cantrip');
      if(domain==='Arcana')additions.push('Arcana; 2 Wizard cantrip');
      if(domain==='Order')additions.push('Intimidation veya Persuasion');
      if(domain==='Peace')additions.push('Insight, Performance veya Persuasion');
      if(additions.length)row[4]=`${row[4]==='—'?'':row[4]+' • '}${additions.join(' • ')}`;
      return row;
    };
  }

  function v52DestroyThreshold(level){return level>=17?'CR 4':level>=14?'CR 3':level>=11?'CR 2':level>=8?'CR 1':level>=5?'CR 1/2':'Açılmadı'}
  function v52Cantrips(level){return level>=10?5:level>=4?4:3}
  function v52ChannelUses(level){return level>=18?3:level>=6?2:level>=2?1:0}
  function v52FeatureCard(feature,level){
    const unlocked=level>=feature.level;
    return `<details class="v52-feature ${unlocked?'unlocked':'locked'}"><summary><span class="v52-feature-level">Lv ${feature.level}</span><span><b>${esc(feature.name)}</b><small>${esc(feature.kind||'Özellik')} • ${unlocked?'AÇIK':'KİLİTLİ'}</small></span><i>＋</i></summary><div><p>${esc(feature.summary)}</p><dl>${feature.action?`<div><dt>Action</dt><dd>${esc(feature.action)}</dd></div>`:''}${feature.uses?`<div><dt>Kullanım</dt><dd>${esc(feature.uses)}</dd></div>`:''}${feature.range?`<div><dt>Menzil</dt><dd>${esc(feature.range)}</dd></div>`:''}${feature.duration?`<div><dt>Süre</dt><dd>${esc(feature.duration)}</dd></div>`:''}${feature.save?`<div><dt>Save</dt><dd>Spell Save DC’ne karşı ${esc(feature.save)}</dd></div>`:''}</dl></div></details>`;
  }

  function v52DomainSpells(domain,level){
    if(!domain)return '<div class="empty">Domain seçilmediği için daima hazırlanmış büyü listesi yok.</div>';
    return `<div class="v52-domain-spells">${domain.spells.map(row=>{const open=level>=row[0];return `<article class="${open?'unlocked':'locked'}"><span>Cleric Lv ${row[0]}</span><b>${esc(row[1])}</b><b>${esc(row[2])}</b><small>${open?'Daima hazırlanmış • hazırlama sınırına sayılmaz':'Henüz kilitli'}</small></article>`}).join('')}</div>`;
  }

  function v52DeityAtlas(){
    return `<details class="card v52-deity-atlas"><summary><span><b>30 Ana Forgotten Realms Tanrısı</b><small>Cleric seçiminde kullanılan kısa kanonik liste</small></span><i>＋</i></summary><div class="v52-deity-atlas-grid">${v52Deities().map(deity=>`<article><span>${esc(deity.alignment)}</span><div><b>${esc(deity.name)}</b><small>${esc(deity.portfolio||'')}</small><p><strong>Appendix B:</strong> ${(deity.coreDomains||[]).map(v52DomainLabel).map(esc).join(', ')||'—'}</p><p><strong>Ek kitap uyumu:</strong> ${v52CurrentDomainIds(deity).filter(id=>!v52IsCore(deity,id)).map(v52DomainLabel).map(esc).join(', ')||'—'}</p></div><button class="ghost" data-v52-deity-open="${esc(deity.id)}">Ansiklopedi</button></article>`).join('')}</div></details>`;
  }

  function v52ClericPanel(character){
    if(character?.className!=='Cleric')return '';
    const level=v52Level(character.level),stats=prStats(character),wis=prMod(stats.WIS),prof=prProf(level),itemMagic=typeof v63SpellBonus==='function'?v63SpellBonus(character):0,saveDc=8+prof+wis+itemMagic,spellAttack=prof+wis+itemMagic,prepared=Math.max(1,level+wis),slots=(window.V52_CLERIC_SPELL_SLOTS||[])[level]||[],domain=v52Domain(character.subclass),deity=v52Deity(character.deityId),domainSpellCount=domain?domain.spells.filter(row=>level>=row[0]).length*2:0,intervention=level>=20?'Otomatik':level>=10?`d100 ≤ ${level}`:'Lv 10’da',core=window.V52_CLERIC_CORE_FEATURES||[];
    return `<section class="v52-cleric"><div class="v52-cleric-hero"><div><span class="v26-kicker">2014 CLERIC KUTSAL DEFTERİ</span><h2>${deity?esc(deity.name):'Tanrı seçilmedi'} ${domain?`• ${esc(domain.name)} Domain`:''}</h2><p>${deity?`${esc(deity.alignment)} • ${esc(deity.portfolio||'')}`:'Eski karakter korunuyor; mekanik eşlemenin tamamlanması için bir ana tanrı seç.'}</p><div class="v52-hero-badges"><span>${domain?esc(v52SourceBadge(domain)):'DOMAIN EKSİK'}</span>${domain?.dmApproval?'<span class="warning">DM ONAYI GEREKİR</span>':''}<span>WIS ${stats.WIS} (${v52Signed(wis)})</span></div></div><div class="v52-cleric-mark">${domain?.icon||'✦'}</div></div>
      <section class="v52-rule-truth"><b>Doğru kural:</b><p>Tanrının adı tek başına buff vermez. Tanrı uygun domainleri belirler; <strong>${domain?esc(domain.name)+' Domain':'seçilen domain'}</strong> aşağıdaki gerçek mekanikleri verir.</p></section>
      <div class="v52-cleric-stats"><article><small>Spell Save DC</small><b>${saveDc}</b><span>8 + PB + WIS${itemMagic?' + eşya':''}</span></article><article><small>Spell Attack</small><b>${v52Signed(spellAttack)}</b><span>PB + WIS${itemMagic?' + eşya':''}</span></article><article><small>Cantrip Bilinen</small><b>${v52Cantrips(level)}</b><span>Slot harcamaz</span></article><article><small>Normal Hazırlama</small><b>${prepared}</b><span>Lv + WIS, en az 1</span></article><article><small>Domain Spell</small><b>${domainSpellCount}</b><span>Sınıra sayılmaz</span></article><article><small>Channel Divinity</small><b>${v52ChannelUses(level)}</b><span>Kısa/uzun dinlenme</span></article><article><small>Destroy Undead</small><b>${v52DestroyThreshold(level)}</b><span>Turn save kaybında</span></article><article><small>Divine Intervention</small><b>${intervention}</b><span>${level>=10?'Action':'Henüz kilitli'}</span></article></div>
      <details class="card v52-slot-card" open><summary><span><b>Spell Slotları • Cleric Lv ${level}</b><small>Long Rest sonunda tamamı yenilenir</small></span><i>＋</i></summary><div class="v52-slot-row">${slots.map((count,index)=>count?`<span><small>${index+1}. seviye</small><b>${count}</b></span>`:'').join('')}</div></details>
      <div class="v52-cleric-columns"><section class="card"><div class="v52-section-head"><span>CLASS İLERLEYİŞİ</span><h3>Cleric Çekirdek Özellikleri</h3><p>Domain’den bağımsız bütün Clericlerde bulunur.</p></div><div class="v52-feature-list">${core.map(row=>v52FeatureCard(row,level)).join('')}</div></section><section class="card"><div class="v52-section-head"><span>${domain?esc(v52SourceBadge(domain)):'DOMAIN SEÇİLMEDİ'}</span><h3>${domain?`${esc(domain.name)} Domain Özellikleri`:'Domain Mekanikleri'}</h3><p>${domain?esc(domain.role):'Tanrı ve domain seçildiğinde seviye özellikleri burada açılır.'}</p></div>${domain?.note?`<p class="v52-source-note">${esc(domain.note)}</p>`:''}<div class="v52-feature-list">${domain?domain.features.map(row=>v52FeatureCard(row,level)).join(''):'<div class="empty">Domain seçimi bekleniyor.</div>'}</div></section></div>
      <details class="card v52-domain-spell-card"><summary><span><b>Daima Hazırlanmış Domain Büyüleri</b><small>Cleric Lv 1 / 3 / 5 / 7 / 9’da ikişer büyü</small></span><i>＋</i></summary><div><p>Bu büyüler normal <b>${prepared}</b> hazırlama hakkını tüketmez; Cleric listesinde olmasa bile senin için Cleric büyüsüdür.</p>${v52DomainSpells(domain,level)}</div></details>
      <details class="card v52-howto"><summary><span><b>Turda ne yaparım? Kısa kullanım sırası</b><small>Attack mı save mi, slot mu Channel Divinity mi?</small></span><i>＋</i></summary><div><ol><li><b>Büyü:</b> Kart “spell attack” diyorsa d20 ${v52Signed(spellAttack)} at; “save” diyorsa hedef DC ${saveDc} karşısında yazan ability save’ini atar.</li><li><b>Cantrip:</b> Slot yemez. 1. seviye ve üstü büyü uygun seviyede slot tüketir.</li><li><b>Channel Divinity:</b> Spell slot değildir; Lv ${level} için dinlenme başına ${v52ChannelUses(level)} ayrı kullanımın vardır.</li><li><b>Domain:</b> Özellik kartındaki Action / Bonus Action / Reaction ve kullanım hakkını aynen uygula; aynı isimli genel buff uydurma.</li><li><b>Concentration:</b> Aynı anda tek concentration; hasar alınca CON save DC 10 veya hasarın yarısı, yüksek olan.</li></ol></div></details>
      ${v52DeityAtlas()}
    </section>`;
  }

  if(typeof prProgress==='function'){
    const v52ProgressBase=prProgress;
    prProgress=function(character){return `${v52ClericPanel(character)}${v52ProgressBase(character)}`};
  }

  if(typeof prEnsure==='function'){
    const v52EnsureBase=prEnsure;
    prEnsure=function(){const result=v52EnsureBase();for(const character of state.characters||[]){if(character.className==='Cleric'&&typeof character.deityId!=='string')character.deityId=''}return result};
  }

  document.addEventListener('change',event=>{
    if(event.target.id==='v52NewDeity')v52SetDomainSelect($('#v31NewSubclass'),event.target.value,'');
    if(event.target.id==='v52PlayerDeity')v52SetDomainSelect($('#v52PlayerDomain'),event.target.value,$('#v52PlayerDomain')?.value||'');
    if(event.target.id==='v52DmDeity')v52SetDomainSelect($('#cSubclass'),event.target.value,$('#cSubclass')?.value||'');
    if(event.target.id==='cClass'){const cleric=event.target.value==='Cleric';queueMicrotask(()=>{const domain=$('#cSubclass');if(cleric&&domain&&!v52Domain(domain.value))domain.value='';v52RefreshDmEditor()})}
  },true);

  document.addEventListener('click',async event=>{
    const button=event.target.closest('button');if(!button||!current)return;
    if(button.id==='v52SaveClericIdentity'){
      const character=(state.characters||[]).find(row=>String(row.id)===String(button.dataset.character));if(!character)return;
      const deityId=$('#v52PlayerDeity')?.value||character.deityId||'',domain=$('#v52PlayerDomain')?.value||character.subclass||'';
      const deity=v52Deity(deityId);if(!deityId)return alert('Önce ana tanrını seç.');if(!domain)return alert('Tanrının uygun domainlerinden birini seç.');if(!v52CurrentDomainIds(deity).includes(domain))return alert('Bu domain seçilen tanrının portfolio alanıyla eşleşmiyor.');
      if(v52Domain(domain)?.dmApproval&&!confirm('Death Domain 2014 DMG seçeneğidir. DM’in bu oyuncu karakteri için onay verdi mi?'))return;
      button.disabled=true;button.textContent='Kutsal bağ kaydediliyor…';
      const {error}=await db.rpc('character_choices_set_v52',{p_user:auth.id,p_campaign:current.id,p_subclass:domain,p_subspecies:character.subspecies||'',p_spells:Array.isArray(character.preparedSpells)?character.preparedSpells:[],p_deity_id:deityId});
      if(error){button.disabled=false;button.textContent='Kutsal Bağı Kaydet';return alert('v52-update.sql dosyasını Supabase SQL Editor’da bir kez çalıştır:\n'+error.message)}
      await syncFromServer(true);render();toast('Tanrı ve domain seçimi mühürlendi');return;
    }
    if(button.dataset.v52DeityOpen){
      page='deities';render();setTimeout(()=>{const safe=globalThis.CSS?.escape?CSS.escape(button.dataset.v52DeityOpen):button.dataset.v52DeityOpen.replace(/[^a-z0-9_-]/gi,''),card=document.querySelector(`#v49-deity-${safe}`);if(card){card.open=true;card.scrollIntoView?.({behavior:'smooth',block:'start'})}},0);return;
    }
  },true);

  window.v52Deity=v52Deity;
  window.v52Domain=v52Domain;
  window.v52CurrentDomainIds=v52CurrentDomainIds;
  window.v52ClericPanel=v52ClericPanel;
  window.v52RefreshDmEditor=v52RefreshDmEditor;
  if(typeof V27_PAGE_HELP!=='undefined')V27_PAGE_HELP.skills='Karakter buildini, gerçek proficiencyleri, büyüleri ve Cleric ise tanrı/domain kaynaklı seviye özelliklerini yönet.';
  if(current){prEnsure?.();render()}
})();
