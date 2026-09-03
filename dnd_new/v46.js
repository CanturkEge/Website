/* v46: classified inventory, equipment wardrobe and richer character sheet. */
(()=>{
  const V46_GROUPS=Object.freeze([
    {key:'equippable',label:'Kuşanılabilir',short:'Ekipman',icon:'⚔',note:'Silah, zırh, kalkan, büyü odağı ve giyilen aksesuarlar.'},
    {key:'consumable',label:'Tüketilebilir & Parşömen',short:'Tüketilebilir',icon:'✦',note:'İksir, yağ, zehir, yiyecek ve tek kullanımlık büyü kayıtları.'},
    {key:'ammunition',label:'Mühimmat',short:'Mühimmat',icon:'➳',note:'Ok, arbalet oku, sapan mermisi ve özel mühimmat.'},
    {key:'tool',label:'Alet & Kamp Malzemesi',short:'Alet',icon:'⚒',note:'Kitler, aletler, ip, fener ve tekrar kullanılan saha gereçleri.'},
    {key:'material',label:'Bileşen & Hammadde',short:'Malzeme',icon:'◈',note:'Büyü bileşenleri, bitki, cevher, deri ve üretim malzemeleri.'},
    {key:'valuable',label:'Değerli & Hikâyesel',short:'Değerli',icon:'◆',note:'Mücevher, sanat objesi, belge, harita, mektup ve görev eşyaları.'},
    {key:'service',label:'Binek & Hizmet',short:'Binek/Hizmet',icon:'♞',note:'Binekler, sözleşmeler ve uygulanmayı bekleyen hizmet kayıtları.'},
    {key:'other',label:'Diğer & Hurda',short:'Diğer',icon:'·',note:'Yukarıdaki sınıflara girmeyen sıradan, kırık veya belirsiz kayıtlar.'}
  ]);
  const V46_GROUP_BY_KEY=Object.freeze(Object.fromEntries(V46_GROUPS.map(group=>[group.key,group])));
  const V46_SLOTS=Object.freeze({
    weapon:{label:'Silah',icon:'⚔',zone:'primary'},armor:{label:'Zırh',icon:'⬟',zone:'primary'},shield:{label:'Kalkan',icon:'◐',zone:'primary'},focus:{label:'Büyü Odağı',icon:'✦',zone:'primary'},
    head:{label:'Baş',icon:'♛',zone:'body'},eyes:{label:'Göz',icon:'◉',zone:'body'},ears:{label:'Kulak',icon:'◌',zone:'body'},neck:{label:'Boyun',icon:'◇',zone:'body'},back:{label:'Sırt',icon:'⌁',zone:'body'},
    hands:{label:'Eller',icon:'✥',zone:'body'},wrist:{label:'Bilek',icon:'≋',zone:'body'},ring:{label:'Yüzük',icon:'○',zone:'body'},brooch:{label:'Broş',icon:'✧',zone:'body'},waist:{label:'Bel',icon:'═',zone:'body'},feet:{label:'Ayak',icon:'⌄',zone:'body'},anklet:{label:'Halhal',icon:'◦',zone:'body'},wondrous:{label:'Genel Büyülü',icon:'✺',zone:'body'}
  });
  const V46_PRIMARY_SLOTS=['weapon','armor','shield','focus'];
  const V46_BODY_SLOTS=['head','eyes','ears','neck','back','hands','wrist','ring','brooch','waist','feet','anklet','wondrous'];
  let v46InventoryFilter='all',v46InventoryQuery='',v46InventoryScope='';

  function v46Fold(value){return String(value??'').trim().toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
  function v46ItemGroup(item={}){
    if(window.v45EquipSlot?.(item))return 'equippable';
    let category=v46Fold(item.category),name=v46Fold(item.name),effect=v46Fold(item.effect),note=v46Fold(item.note),text=`${name} ${effect} ${note}`;
    if(item.service||item.mount||/\b(hizmet|binek|sozlesme|kiralama|konaklama|ayin)\b/.test(text))return 'service';
    if(['consumable','scroll'].includes(category)||/\b(iksir|potion|merhem|panzehir|antitoksin|zehir|yag|parşomen|parsomen|scroll|yiyecek|icecek|rasyon|ration|tek kullanim)\b/.test(text))return 'consumable';
    if(category==='ammunition'||/\b(muhimmat|ok demeti|arbalet oku|sapan mermisi|arrow|bolt)\b/.test(text))return 'ammunition';
    if(category==='tool'||/\b(alet|tool|kit|halat|ip 50|fener|kazma|cekic|orak|olta|kilit acma)\b/.test(text))return 'tool';
    if(category==='component'||/\b(bilesen|component|hammadde|cevher|kulce|ot demeti|bitki|mantar|toz|deri parcasi|reagent)\b/.test(text))return 'material';
    if(['gem','trinket','document'].includes(category)||/\b(mucevher|yakut|zumrut|safir|elmas|inci|belge|mektup|harita|gunluk|kitap|muhur|sanat objesi|gorev esyasi)\b/.test(text))return 'valuable';
    if(category==='junk')return 'other';
    return 'other';
  }
  function v46Group(key){return V46_GROUP_BY_KEY[key]||V46_GROUP_BY_KEY.other}
  function v46Slot(item){return window.v45EquipSlot?.(item)||''}
  function v46SlotMeta(slot){return V46_SLOTS[slot]||{label:'Ekipman',icon:'◇',zone:'body'}}
  function v46Limit(slot){return Math.max(1,Number(window.V45_SLOT_LIMITS?.[slot])||1)}
  function v46EffectName(effect){return typeof window.v41EffectDisplay==='function'?window.v41EffectDisplay(effect):String(typeof effect==='string'?effect:effect?.name||'').trim()}
  function v46ItemBonuses(item={}){
    let rows=typeof iaBonuses==='function'?iaBonuses(item):[];
    let stats=item.statBonuses||{};
    for(let ability of ['STR','DEX','CON','INT','WIS','CHA'])if(Number(stats[ability]))rows.push(`${ability} ${Number(stats[ability])>0?'+':''}${stats[ability]}`);
    return [...new Set(rows.filter(Boolean))];
  }
  function v46ItemSearch(item={}){return v46Fold([item.name,item.note,item.effect,item.category,item.rarity,...v46ItemBonuses(item)].filter(Boolean).join(' '))}
  function v46ItemBrief(item={}){
    let bonus=v46ItemBonuses(item),parts=[item.effect,bonus[0],item.note].filter(Boolean);
    return parts[0]||'Açıklama eklenmemiş.';
  }
  function v46Qty(items){return (items||[]).reduce((sum,row)=>sum+Math.max(1,Number(row.item?.qty??row.qty)||1),0)}
  function v46Initials(name){let parts=String(name||'?').trim().split(/\s+/).filter(Boolean);return esc((parts[0]?.[0]||'?')+(parts.length>1?(parts.at(-1)?.[0]||''):''))}
  function v46ItemRarity(item={}){let rarity=String(item.rarity||'').trim();return rarity?`<span class="v46-item-tag rarity ${esc(v46Fold(rarity))}">${esc(rarity)}</span>`:''}

  function v46ItemCard(item,index,actions=false){
    let group=v46Group(v46ItemGroup(item)),slot=v46Slot(item),slotMeta=v46SlotMeta(slot),bonuses=v46ItemBonuses(item),detail=[item.note,item.effect].filter(Boolean).join(' • '),summary=v46ItemBrief(item),quantity=Math.max(1,+item.qty||1),title=`${group.label}${slot?` • ${slotMeta.label}`:''}`,focus=!!window.v66FocusKind?.(item),extraActions=typeof window.v66InventoryItemActions==='function'?window.v66InventoryItemActions(item,index):'';
    let head=`<span class="v46-item-icon" aria-hidden="true">${group.icon}</span><span class="v46-item-copy"><span class="v46-item-title"><b>${esc(item.name||'İsimsiz eşya')}</b>${item.equipped?'<em>KUŞANILMIŞ</em>':''}</span><span class="v46-item-tags"><span class="v46-item-tag">${esc(group.short)}</span>${slot?`<span class="v46-item-tag slot">${esc(slotMeta.label)}</span>`:''}${v46ItemRarity(item)}</span><small>${esc(summary)}</small></span><strong class="v46-item-qty">×${quantity}${actions?'　⌄':''}</strong>`;
    if(!actions)return `<article class="ia-item v46-item-card static" data-v46-group="${group.key}" data-v46-search="${esc(v46ItemSearch(item))}"><div class="ia-summary" title="${esc(title)}">${head}</div>${detail||bonuses.length?`<div class="v46-static-detail">${detail?`<p>${esc(detail)}</p>`:''}${bonuses.length?`<div class="v46-bonus-list">${bonuses.map(row=>`<span>${esc(row)}</span>`).join('')}</div>`:''}</div>`:''}</article>`;
    return `<article class="ia-item v46-item-card" data-v46-item data-v46-group="${group.key}" data-v46-search="${esc(v46ItemSearch(item))}"><button class="ia-summary" data-ia-expand="${index}" aria-expanded="false" aria-label="${esc(item.name||'Eşya')} ayrıntılarını aç">${head}</button><div class="ia-actions v46-item-panel" data-ia-panel="${index}" hidden><div class="v46-item-detail"><b>${esc(group.label)}</b><p>${esc(detail||group.note)}</p>${bonuses.length?`<div class="v46-bonus-list">${bonuses.map(row=>`<span>${esc(row)}</span>`).join('')}</div>`:'<small>Mekanik bonus kaydı yok.</small>'}${!slot&&group.key==='consumable'?'<small>Kullanım sonucunu açıklamasına göre uygula; eşya otomatik kuşanılmaz.</small>':''}</div><div class="v46-item-buttons">${slot?`<button class="primary" data-v25-equip="${index}">${focus?(item.equipped?'Odağı Bırak':'Odak Olarak Kullan'):(item.equipped?'Çıkar':'Kuşan')}</button>`:''}${extraActions}<button class="ghost" data-ia-player="${index}">Arkadaşa Ver</button><button class="ghost" data-ia-guild="${index}">Loncaya Koy</button><button class="ghost" data-ia-drop="${index}">Yere At</button><button class="danger" data-v25-trash="${index}">Çöpe At</button></div></div></article>`;
  }

  function v46SlotCards(character,slots){
    let inventory=character?.inventory||[],equipped=inventory.map((item,index)=>({item,index,slot:v46Slot(item)})).filter(row=>row.item.equipped&&row.slot);
    return slots.map(slot=>{
      let meta=v46SlotMeta(slot),limit=v46Limit(slot),rows=equipped.filter(row=>row.slot===slot),cards=[];
      for(let position=0;position<limit;position++){
        let row=rows[position],label=limit>1?`${meta.label} ${position+1}`:meta.label;
        cards.push(row?`<article class="v46-slot occupied"><span class="v46-slot-icon">${meta.icon}</span><div><small>${esc(label)}</small><b>${esc(row.item.name||'İsimsiz eşya')}</b><em>${esc(v46ItemBonuses(row.item).join(' • ')||row.item.effect||'Aktif ekipman')}</em></div><button class="ghost" data-v25-equip="${row.index}" aria-label="${esc(row.item.name||'Eşya')} çıkar">Çıkar</button></article>`:`<article class="v46-slot empty"><span class="v46-slot-icon">${meta.icon}</span><div><small>${esc(label)}</small><b>Boş yuva</b><em>Envanterden uygun eşya kuşan</em></div></article>`);
      }
      return cards.join('');
    }).join('');
  }

  function v46EquipmentBonuses(character){
    let equipped=(character?.inventory||[]).filter(item=>item.equipped&&v46Slot(item)),rows=[];
    for(let item of equipped){
      let itemRows=v46ItemBonuses(item);
      if(itemRows.length)rows.push(`<span><b>${esc(item.name)}</b>${esc(itemRows.join(' • '))}</span>`);
    }
    return rows.length?rows.join(''):'<span><b>Aktif bonus yok</b>Kuşandığın geçerli ekipmanın bonusları burada görünür.</span>';
  }

  function v46EquipmentPanel(character){
    let inventory=character?.inventory||[],equipped=inventory.filter(item=>item.equipped&&v46Slot(item)),bodyEquipped=equipped.filter(item=>V46_BODY_SLOTS.includes(v46Slot(item))).length,bodyCapacity=V46_BODY_SLOTS.reduce((sum,slot)=>sum+v46Limit(slot),0);
    return `<section class="card v46-equipment"><div class="v46-section-head"><div><span class="v46-kicker">KUŞANMA MENÜSÜ</span><h2>Ekipman Yuvaları</h2><p>Yalnız geçerli ekipman bonus verir. Dolu yuvadan çıkarabilir, yeni eşyayı Envanter’den kuşanabilirsin.</p></div><button class="primary" data-page="inventory">Envanteri Aç</button></div><div class="v46-slot-grid primary">${v46SlotCards(character,V46_PRIMARY_SLOTS)}</div><details class="v46-body-slots"><summary><span><b>Aksesuar ve Beden Yuvaları</b><small>${bodyEquipped}/${bodyCapacity} yuva dolu</small></span><i>＋</i></summary><div class="v46-slot-grid body">${v46SlotCards(character,V46_BODY_SLOTS)}</div></details><div class="v46-equipment-bonuses"><small>KUŞANIMDAN GELEN KAYITLAR</small><div>${v46EquipmentBonuses(character)}</div></div></section>`;
  }

  function v46StatGrid(character){
    let stats=prStats(character),saveProfs=new Set(prClass(character.className).saves||[]);
    return `<section class="card v46-stat-card"><div class="v46-section-head compact"><div><span class="v46-kicker">ABILITY</span><h3>Statlar ve Save’ler</h3></div><button class="ghost" data-page="skills">Tüm skilller</button></div><div class="v46-stat-grid">${['STR','DEX','CON','INT','WIS','CHA'].map(key=>{let mod=prMod(stats[key]),save=mod+(saveProfs.has(key)?prProf(character.level):0);return `<article class="${saveProfs.has(key)?'proficient':''}"><small>${key}</small><b>${stats[key]}</b><span>${prSigned(mod)} mod</span><em>${prSigned(save)} save${saveProfs.has(key)?' ◆':''}</em></article>`}).join('')}</div><p class="v46-footnote">◆ işaretli saving throw, class proficiency bonusunu içerir.</p></section>`;
  }

  function v46IdentityCard(character){
    let species=prSpecies(character.species),res=[...new Set([...(species.resist||[]),...(character.resistances||[])])],weak=[...new Set([...(species.weak||[]),...(character.weaknesses||[])])],subText=typeof window.v28SubspeciesText==='function'?window.v28SubspeciesText(character.subspecies,character.species):'',classText=character.subclass&&typeof window.v28SubclassText==='function'?window.v28SubclassText(character.subclass):'',skillCount=typeof window.v30SkillProfs==='function'?window.v30SkillProfs(character).length:0,prepared=typeof prSpells==='function'?prSpells(character).length:(character.preparedSpells||[]).length;
    return `<section class="card v46-identity"><div class="v46-section-head compact"><div><span class="v46-kicker">KİMLİK & YETKİNLİK</span><h3>Karakter Özeti</h3></div><button class="ghost" data-page="skills">Ayrıntıları Aç</button></div><div class="v46-identity-grid"><span><small>Background</small><b>${esc(character.background||'Seçilmedi')}</b></span><span><small>Skill proficiency</small><b>${skillCount}</b></span><span><small>Save proficiency</small><b>${esc((prClass(character.className).saves||[]).join(', ')||'Yok')}</b></span><span><small>Hazır büyü</small><b>${prepared}</b></span><span><small>Lonca</small><b>${esc(character.guild||'Bağımsız')}</b></span><span><small>Hit Die</small><b>d${PR_HIT_DIE[character.className]||8}</b></span></div><details><summary>Species / Subspecies özeti</summary><div><p>${esc(subText||(species.traits||[]).join(' • ')||'Özel species kaydı.')}</p><div class="v46-defense-tags"><span class="good">Direnç: ${esc(res.join(', ')||'Yok')}</span><span class="bad">Zayıflık: ${esc(weak.join(', ')||'Yok')}</span></div></div></details>${character.subclass?`<details><summary>${esc(character.className)} / ${esc(character.subclass)}</summary><div><p>${esc(classText||'Subclass ayrıntıları Yetenekler ekranındadır.')}</p></div></details>`:''}</section>`;
  }

  function v46EffectsCard(character){
    let effects=(character.effects||[]).map(v46EffectName).filter(Boolean);
    return `<section class="card v46-effects"><div class="v46-section-head compact"><div><span class="v46-kicker">DURUM</span><h3>Aktif Efektler</h3></div><b>${effects.length}</b></div>${effects.length?`<div class="v46-effect-list">${effects.map(effect=>`<span>${esc(effect)}</span>`).join('')}</div>`:'<div class="v46-clear-state"><span>✓</span><div><b>Aktif efekt yok</b><small>Condition ve süreli etkiler burada görünür.</small></div></div>'}</section>`;
  }

  function v46CharacterDashboard(){
    let character=myChar();if(!character)return typeof prPlayerCreate==='function'?prPlayerCreate():'<div class="card empty">Karakterin hazırlanıyor.</div>';
    prEnsure?.();let stats=prStats(character),dex=prMod(stats.DEX),proficiency=prProf(character.level),perception=typeof v25SkillBonus==='function'?v25SkillBonus(character,'Perception (Farkındalık)'):prMod(stats.WIS),passive=10+perception,maxHp=Math.max(1,+character.maxHp||1),hp=Math.max(0,+character.hp||0),hpPct=Math.max(0,Math.min(100,hp/maxHp*100)),activeAc=prAutoAC(character),castAbility=PR_CASTING_ABILITY[character.className],castMod=castAbility?prMod(stats[castAbility]):null;
    return `<div class="v46-character-page"><section class="v46-character-hero"><div class="v46-avatar" aria-hidden="true">${v46Initials(character.name)}</div><div class="v46-hero-copy"><span class="v46-kicker">SEVİYE ${character.level} KARAKTER FÖYÜ</span><h2>${esc(character.name)}</h2><p>${esc(character.species)}${character.subspecies?' / '+esc(character.subspecies):''} <i>•</i> ${esc(character.className)}${character.subclass?' / '+esc(character.subclass):''}</p><div class="v46-hero-hp"><span><b>${hp}</b> / ${maxHp} HP${character.tempHp?` <em>+${character.tempHp} geçici</em>`:''}</span><div><i style="width:${hpPct}%"></i></div></div></div><div class="v46-hero-actions"><button class="primary" data-page="inventory">Kuşanma & Envanter</button><button class="ghost" data-page="skills">Yetenekler</button><button class="ghost" data-page="dice">Zar At</button></div></section><section class="v46-vitals"><article><small>Armor Class</small><b>${activeAc}</b><span>Aktif AC</span></article><article><small>Hız</small><b>${character.speed||30}</b><span>ft / tur</span></article><article><small>İnisiyatif</small><b>${prSigned(dex)}</b><span>DEX modifier</span></article><article><small>Proficiency</small><b>${prSigned(proficiency)}</b><span>Seviye bonusu</span></article><article><small>Pasif Farkındalık</small><b>${passive}</b><span>10 + Perception</span></article>${castAbility?`<article><small>Büyü Statı</small><b>${castAbility}</b><span>${prSigned(castMod)} modifier</span></article>`:`<article><small>Hit Die</small><b>d${PR_HIT_DIE[character.className]||8}</b><span>Dinlenme zarı</span></article>`}</section>${v46EquipmentPanel(character)}<div class="v46-character-grid">${v46StatGrid(character)}${v46IdentityCard(character)}${v46EffectsCard(character)}</div></div>`;
  }

  function v46InventoryGroupRows(character){
    let rows=(character.inventory||[]).map((item,index)=>({item,index,group:v46ItemGroup(item)})),first=V46_GROUPS.find(group=>rows.some(row=>row.group===group.key))?.key;
    return V46_GROUPS.map(group=>{
      let groupRows=rows.filter(row=>row.group===group.key);if(!groupRows.length)return '';
      groupRows.sort((a,b)=>Number(!!b.item.equipped)-Number(!!a.item.equipped)||String(a.item.name||'').localeCompare(String(b.item.name||''),'tr'));
      return `<details class="v46-inventory-group" data-v46-inventory-group="${group.key}" ${group.key==='equippable'||(!rows.some(row=>row.group==='equippable')&&group.key===first)?'open':''}><summary><span class="v46-group-icon">${group.icon}</span><span><b>${esc(group.label)}</b><small>${esc(group.note)}</small></span><strong>${groupRows.length} kayıt • ${v46Qty(groupRows)} adet</strong><i>＋</i></summary><div class="v46-group-body">${groupRows.map(row=>v46ItemCard(row.item,row.index,true)).join('')}</div></details>`;
    }).join('');
  }

  function v46Inventory(){
    if(typeof sessionPending==='function'&&sessionPending())return sessionPendingPage();let character=myChar();if(!character)return v46CharacterDashboard();
    let scope=`${current?.id||''}|${character.id||character.userId||character.name||''}`;if(scope!==v46InventoryScope){v46InventoryScope=scope;v46InventoryFilter='all';v46InventoryQuery=''}
    let rows=(character.inventory||[]).map((item,index)=>({item,index,group:v46ItemGroup(item)}));if(v46InventoryFilter!=='all'&&!rows.some(row=>row.group===v46InventoryFilter))v46InventoryFilter='all';let equipped=rows.filter(row=>row.item.equipped&&v46Slot(row.item)).length,filters=V46_GROUPS.filter(group=>rows.some(row=>row.group===group.key));
    queueMicrotask(v46ApplyInventoryFilters);
    return `<div class="v46-inventory-page"><section class="v46-inventory-hero"><div><span class="v46-kicker">${esc(character.name)} • ÇANTA DÜZENİ</span><h2>Sınıflandırılmış Envanter</h2><p>Uzun tek liste yerine kullanım türüne göre ayrıldı. Eşyaya basınca kuşanma ve aktarım seçenekleri açılır.</p></div><div class="v46-inventory-totals"><span><b>${rows.length}</b>Kayıt</span><span><b>${v46Qty(rows)}</b>Toplam adet</span><span><b>${equipped}</b>Kuşanılmış</span></div></section><div class="v46-inventory-toolbar card"><label><span>⌕</span><input id="v46InventorySearch" class="input" value="${esc(v46InventoryQuery)}" placeholder="Eşya, etki veya bonus ara…" autocomplete="off"></label><div><button class="${v46InventoryFilter==='all'?'active':''}" data-v46-filter="all" aria-pressed="${v46InventoryFilter==='all'}">Tümü <b>${rows.length}</b></button>${filters.map(group=>{let count=rows.filter(row=>row.group===group.key).length;return `<button class="${v46InventoryFilter===group.key?'active':''}" data-v46-filter="${group.key}" aria-pressed="${v46InventoryFilter===group.key}">${group.icon} ${esc(group.short)} <b>${count}</b></button>`}).join('')}</div></div><div class="ia-layout v46-inventory-layout"><section class="card v46-inventory-list"><div class="v46-section-head compact"><div><span class="v46-kicker">ÇANTA</span><h3>Eşya Sınıfları</h3></div><button class="ghost" data-page="dashboard">Karakter Föyü</button></div><div id="v46InventoryGroups">${rows.length?v46InventoryGroupRows(character):'<div class="empty">Çanta boş.</div>'}</div><div id="v46InventoryEmpty" class="empty" hidden>Bu filtrede eşya bulunamadı.</div></section>${iaGround(true)}</div></div>`;
  }

  function v46ApplyInventoryFilters(){
    let root=$('#v46InventoryGroups');if(!root)return;let query=v46Fold($('#v46InventorySearch')?.value||v46InventoryQuery),visible=0;
    root.querySelectorAll('[data-v46-inventory-group]').forEach(group=>{
      let groupKey=group.dataset.v46InventoryGroup,groupAllowed=v46InventoryFilter==='all'||v46InventoryFilter===groupKey,groupVisible=0;
      group.querySelectorAll('[data-v46-item]').forEach(card=>{let match=groupAllowed&&(!query||String(card.dataset.v46Search||'').includes(query));card.hidden=!match;if(match)groupVisible++});
      group.hidden=!groupVisible;visible+=groupVisible;if(groupVisible&&(query||v46InventoryFilter!=='all'))group.open=true;
    });
    let empty=$('#v46InventoryEmpty');if(empty)empty.hidden=visible>0;
  }

  iaItem=v46ItemCard;
  iaInventory=v46Inventory;
  playerPages.inventory=v46Inventory;
  playerDash=v46CharacterDashboard;
  if(typeof V27_PAGE_HELP!=='undefined')Object.assign(V27_PAGE_HELP,{dashboard:'Karakter özeti, aktif ekipman yuvaları, savunma ve temel değerler.',inventory:'Eşyalar kullanım türüne göre ayrılır; karta basınca kuşanma ve transfer araçları açılır.'});

  document.addEventListener('input',event=>{
    if(event.target.id!=='v46InventorySearch')return;v46InventoryQuery=event.target.value;v46ApplyInventoryFilters();
  });
  document.addEventListener('click',event=>{
    let button=event.target.closest('button[data-v46-filter]');if(!button)return;
    v46InventoryFilter=button.dataset.v46Filter;document.querySelectorAll('[data-v46-filter]').forEach(row=>{let active=row===button;row.classList.toggle('active',active);row.setAttribute('aria-pressed',String(active))});v46ApplyInventoryFilters();
  });

  window.V46_ITEM_GROUPS=V46_GROUPS;
  window.V46_EQUIPMENT_SLOTS=V46_SLOTS;
  window.v46ItemGroup=v46ItemGroup;
  window.v46ItemCard=v46ItemCard;
  window.v46EquipmentPanel=v46EquipmentPanel;
  window.v46CharacterDashboard=v46CharacterDashboard;
  if(current)render();
})();
