/* v51: dual moral axes, deity affinity, divine-order lore and compact grouped navigation. */
(()=>{
  'use strict';

  const v51Fold=value=>String(value??'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
  const v51Clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const v51Signed=value=>`${value>0?'+':''}${value}`;
  const v51Date=value=>{try{return new Intl.DateTimeFormat('tr-TR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value))}catch{return String(value||'—')}};
  const v51Id=()=>globalThis.crypto?.randomUUID?.()||`v51-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const v51AlignmentOrder=['LG','NG','CG','LN','N','CN','LE','NE','CE'];
  const v51Coords={LG:[1,1],NG:[0,1],CG:[-1,1],LN:[1,0],N:[0,0],CN:[-1,0],LE:[1,-1],NE:[0,-1],CE:[-1,-1]};
  let v51Campaign='';
  let v51Character='';
  let v51ReferenceAxis='karma';
  let v51ReferenceQuery='';
  let v51ReferenceSign='all';
  let v51ReferenceCategory='all';
  let v51DivineTab='hierarchy';
  let v51DivineQuery='';

  function v51ResetLocal(){
    v51Character='';v51ReferenceAxis='karma';v51ReferenceQuery='';v51ReferenceSign='all';v51ReferenceCategory='all';v51DivineTab='hierarchy';v51DivineQuery='';
  }
  function v51Ensure(){
    if(!state||typeof state!=='object')return;
    const scope=current?.id||'';if(scope!==v51Campaign){v51Campaign=scope;v51ResetLocal()}
    if(!state.v44KarmaLedger||Array.isArray(state.v44KarmaLedger)||typeof state.v44KarmaLedger!=='object')state.v44KarmaLedger={};
    if(!state.v51JusticeLedger||Array.isArray(state.v51JusticeLedger)||typeof state.v51JusticeLedger!=='object')state.v51JusticeLedger={};
    for(const character of state.characters||[]){
      for(const ledger of [state.v44KarmaLedger,state.v51JusticeLedger]){
        let record=ledger[character.id];
        if(!record||typeof record!=='object')record=ledger[character.id]={value:0,history:[]};
        record.value=v51Clamp(Number.isFinite(+record.value)?Math.round(+record.value):0,-100,100);
        if(!Array.isArray(record.history))record.history=[];
        record.history=record.history.filter(row=>row&&typeof row==='object').slice(0,100);
      }
    }
  }
  function v51Record(axis,characterId){
    v51Ensure();const ledger=axis==='justice'?state.v51JusticeLedger:state.v44KarmaLedger;
    return ledger[characterId]||(ledger[characterId]={value:0,history:[]});
  }
  function v51KarmaBand(value){return (window.V44_KARMA_BANDS||[]).find(row=>value>=row.min&&value<=row.max)||{label:'Nötr',tone:'neutral',event:'Evren özel tepki vermez.'}}
  function v51JusticeBand(value){return (window.V51_JUSTICE_BANDS||[]).find(row=>value>=row.min&&value<=row.max)||{label:'Pragmatik Nötr',tone:'neutral',summary:'Belirgin eksen yoktur.'}}
  function v51AdjustAxis(axis,characterId,delta,reason='DM ayarlaması',source='manual'){
    const character=(state.characters||[]).find(row=>String(row.id)===String(characterId));if(!character)return null;
    const record=v51Record(axis,character.id),before=record.value,requested=Math.trunc(+delta||0),after=v51Clamp(before+requested,-100,100),actual=after-before;
    if(!actual)return {record,change:null};
    const change={id:v51Id(),axis,at:new Date().toISOString(),before,after,delta:actual,requested,reason:String(reason||'DM ayarlaması').trim()||'DM ayarlaması',source};
    record.value=after;record.history.unshift(change);record.history=record.history.slice(0,100);return {record,change};
  }
  function v51UndoAxis(axis,characterId){
    const character=(state.characters||[]).find(row=>String(row.id)===String(characterId));if(!character)return null;
    const record=v51Record(axis,character.id),change=record.history.shift();if(!change)return null;
    record.value=v51Clamp(Number.isFinite(+change.before)?+change.before:record.value-(+change.delta||0),-100,100);return change;
  }
  function v51SelectedCharacter(){
    const characters=state.characters||[];
    if(!characters.some(row=>String(row.id)===String(v51Character)))v51Character=characters[0]?.id||'';
    return characters.find(row=>String(row.id)===String(v51Character))||null;
  }
  function v51AlignmentFromScores(karma=0,justice=0){
    const moral=karma>=30?'G':karma<=-30?'E':'N',law=justice>=30?'L':justice<=-30?'C':'N';
    const code=law==='N'&&moral==='N'?'N':`${law}${moral}`;
    return {code,...(window.V51_ALIGNMENTS?.[code]||{label:code,law,moral,short:''}),karma:+karma||0,justice:+justice||0};
  }
  function v51AlignmentDistance(a,b){
    const ac=v51Coords[a]||v51Coords.N,bc=v51Coords[b]||v51Coords.N;return Math.abs(ac[0]-bc[0])+Math.abs(ac[1]-bc[1]);
  }
  function v51DomainFromSubclass(subclass=''){
    const text=v51Fold(subclass),domains=[];
    const tests=[[/life|mercy|peace|celestial|redemption|devotion|protector/,'Yaşam'],[/light|sun|radiant|glory|twilight/,'Işık'],[/nature|land|moon|shepherd|beast|swarm|ancients|forest/,'Doğa'],[/tempest|storm|sea|fathom|lightning|thunder/,'Fırtına'],[/trick|shadow|assassin|thief|whisper|illusion|mastermind/,'Hile'],[/war|battle|champion|valor|conquest|crown|samurai|kensei|hunter/,'Savaş'],[/death|grave|undead|necrom|long death|phantom|ghost/,'Ölüm'],[/knowledge|lore|arcana|scribe|divin|clockwork|order|forge|artillerist/,'Bilgi']];
    for(const [pattern,domain] of tests)if(pattern.test(text)&&!domains.includes(domain))domains.push(domain);return domains;
  }
  function v51SpeciesAffinity(character){
    const species=v51Fold(character?.species),sub=v51Fold(character?.subspecies),out=new Map();
    const add=(id,points,reason)=>{const row=out.get(id)||{points:0,reasons:[]};row.points+=points;if(reason&&!row.reasons.includes(reason))row.reasons.push(reason);out.set(id,row)};
    if(species.includes('dwarf')){add('nonhuman-moradin',65,'Dwarf mirası');add('nonhuman-skoraeus',18,'Taş ve yeraltı mirası')}
    if(species.includes('elf')){add('nonhuman-corellon',48,'Elf mirası');add('nonhuman-sehanine',36,'Elf ve ay/yolculuk mirası');add('nonhuman-rillifane',32,'Elf ve doğa mirası')}
    if(sub.includes('drow'))add('nonhuman-lolth',72,'Drow mirası');
    if(species.includes('halfling'))add('nonhuman-yondalla',68,'Halfling mirası');
    if(species.includes('gnome'))add('nonhuman-garl',68,'Gnome mirası');
    if(species.includes('dragonborn')){add('nonhuman-bahamut',55,'Dragonborn mirası');add('nonhuman-tiamat',55,'Dragonborn mirası')}
    if(species.includes('orc'))add('nonhuman-gruumsh',70,'Orc mirası');
    if(species.includes('goblin')||sub.includes('hobgoblin'))add('nonhuman-maglubiyet',70,'Goblinoid mirası');
    if(species.includes('kobold'))add('nonhuman-kurtulmak',70,'Kobold mirası');
    if(species.includes('goliath')){add('nonhuman-skoraeus',28,'Dev mirası');if(sub.includes('stone'))add('nonhuman-skoraeus',45,'Stone Giant mirası');if(sub.includes('fire'))add('nonhuman-surtur',52,'Fire Giant mirası');if(sub.includes('frost'))add('nonhuman-thrym',52,'Frost Giant mirası');if(sub.includes('hill'))add('nonhuman-grolantor',48,'Hill Giant mirası')}
    if(species.includes('lizardfolk'))add('nonhuman-semuanya',70,'Lizardfolk mirası');
    if(species.includes('triton')){add('nonhuman-deep-sashelas',50,'Deniz halkı mirası');add('nonhuman-eadro',35,'Deniz halkı mirası')}
    if(species.includes('aasimar')){add('nonhuman-bahamut',24,'Göksel miras');add('egypt-rehorakhty',18,'Göksel ve ışık mirası')}
    if(species.includes('tiefling'))add('fr-bane',14,'Infernal mirasla ahlaki çatışma');
    if(species.includes('firbolg')){add('nonhuman-rillifane',35,'Orman ve dev mirası');add('nonhuman-skoraeus',18,'Dev mirası')}
    if(species.includes('tortle')){add('nonhuman-semuanya',24,'Sürüngen ve hayatta kalma mirası');add('nonhuman-eadro',18,'Su yaşamı mirası')}
    return out;
  }
  function v51DeityAffinity(character,karmaValue,justiceValue){
    const deities=Array.isArray(window.V49_DEITIES)?window.V49_DEITIES:[],alignment=v51AlignmentFromScores(karmaValue,justiceValue),classDomains=window.V51_CLASS_DOMAINS?.[character?.className]||[],subDomains=v51DomainFromSubclass(character?.subclass),species=v51SpeciesAffinity(character);
    return deities.map(deity=>{
      let score=0,reasons=[],distance=v51AlignmentDistance(alignment.code,deity.alignment),alignmentPoints=[58,40,20,2,-18][distance]??-18;
      score+=alignmentPoints;if(distance===0)reasons.push(`${alignment.code} alignment uyumu`);else if(distance===1)reasons.push('Yakın alignment');
      const matched=[...new Set([...classDomains,...subDomains])].filter(domain=>deity.domains.includes(domain));
      if(matched.length){const domainPoints=matched.reduce((total,domain)=>total+Math.max(7,18-([...classDomains,...subDomains].indexOf(domain)*4)),0);score+=Math.min(32,domainPoints);reasons.push(`${character?.className||'Class'} → ${matched.join('/')}`)}
      const heritage=species.get(deity.id);if(heritage){score+=heritage.points;reasons.push(...heritage.reasons)}
      const portfolio=v51Fold(`${deity.portfolio} ${deity.description}`);
      if(justiceValue>=50&&/adalet|hukuk|yargi|hukum|ant|gorev|sadakat|koruma|duzen/.test(portfolio)){score+=18;reasons.push('Yüksek adalet uyumu')}
      if(justiceValue<=-50&&/kaos|kargasa|hile|hirsiz|ozgurluk|rastlanti/.test(portfolio)){score+=12;reasons.push('Kaotik eğilim uyumu')}
      if(karmaValue>=50&&/merhamet|koruma|umut|baris|bereket|yasam|iyilestir|fedak/.test(portfolio)){score+=12;reasons.push('Yüksek karma uyumu')}
      if(karmaValue<=-50&&/cinayet|korku|zalim|intikam|yikim|karanlik|olum|kotu/.test(portfolio)){score+=12;reasons.push('Düşük karma uyumu')}
      return {deity,score,reasons:[...new Set(reasons)].slice(0,4),alignment,distance};
    }).sort((a,b)=>b.score-a.score||a.deity.name.localeCompare(b.deity.name,'tr')).slice(0,3).map((row,index,all)=>({...row,rank:index+1,strength:row.score>=105?'Çok yakın':row.score>=75?'Yakın':row.score>=50?'Olası':'Zayıf ihtimal',meter:v51Clamp(Math.round(52+(row.score-(all[2]?.score||0))*.7),18,98)}));
  }

  function v51CharacterStrip(){
    return `<div class="v51-character-strip">${(state.characters||[]).map(character=>{const karma=v51Record('karma',character.id).value,justice=v51Record('justice',character.id).value,alignment=v51AlignmentFromScores(karma,justice);return `<button data-v51-character="${esc(character.id)}" class="${String(character.id)===String(v51Character)?'active':''}"><span>${esc(character.name)}</span><small>${esc(character.className||'Class yok')} • ${alignment.code}</small><i><em>K ${v51Signed(karma)}</em><em>A ${v51Signed(justice)}</em></i></button>`}).join('')||'<div class="card empty">Takip için önce karakter oluştur.</div>'}</div>`;
  }
  function v51AxisCard(axis,character){
    const record=v51Record(axis,character.id),karma=axis==='karma',band=karma?v51KarmaBand(record.value):v51JusticeBand(record.value),percent=(record.value+100)/2;
    return `<section class="card v51-axis-card ${karma?'karma':'justice'}"><header><div><span>${karma?'KÖTÜLÜK ↔ İYİLİK':'KAOS ↔ DÜZEN'}</span><h3>${karma?'Karma':'Adalet'}</h3><p>${karma?'Niyet, öngörülebilir sonuç ve telafiyi ölçer.':'Adil süreç, tutarlı kural, hak, yemin ve hesap vermeyi ölçer.'}</p></div><strong>${v51Signed(record.value)}</strong></header><div class="v51-axis-meter"><i style="left:${percent}%"></i><span>−100</span><b>${esc(band.label)}</b><span>+100</span></div><p class="v51-band-note">${esc(band.event||band.summary||'')}</p><div class="v51-axis-actions"><button class="danger" data-v51-quick="${axis}|${esc(character.id)}|-5">−5</button><button class="ghost" data-v51-quick="${axis}|${esc(character.id)}|-1">−1</button><button class="ghost wide" data-v51-custom="${axis}|${esc(character.id)}">Özel Değiştir</button><button class="ghost" data-v51-quick="${axis}|${esc(character.id)}|1">+1</button><button class="primary" data-v51-quick="${axis}|${esc(character.id)}|5">+5</button></div><footer><button class="ghost" data-v51-undo="${axis}|${esc(character.id)}" ${record.history.length?'':'disabled'}>Son İşlemi Geri Al</button><button class="ghost" data-v51-reset="${axis}|${esc(character.id)}" ${record.value?'':'disabled'}>0’a Getir</button></footer></section>`;
  }
  function v51AlignmentPanel(character){
    const karma=v51Record('karma',character.id).value,justice=v51Record('justice',character.id).value,alignment=v51AlignmentFromScores(karma,justice),affinity=v51DeityAffinity(character,karma,justice);
    return `<div class="v51-result-grid"><section class="card v51-alignment"><div class="v51-section-title"><span>OTOMATİK EĞİLİM</span><h3>${alignment.code} — ${esc(alignment.label)}</h3><p>${esc(alignment.short)}</p></div><div class="v51-alignment-grid">${v51AlignmentOrder.map(code=>`<span class="${code===alignment.code?'active':''}"><b>${code}</b><small>${esc(window.V51_ALIGNMENTS?.[code]?.label||code)}</small></span>`).join('')}</div><div class="v51-alignment-factors"><span><b>Karma ${v51Signed(karma)}</b>${karma>=30?'İyi':karma<=-30?'Kötü':'Nötr'} ekseni</span><span><b>Adalet ${v51Signed(justice)}</b>${justice>=30?'Yasal':justice<=-30?'Kaotik':'Nötr'} ekseni</span></div><p class="v51-disclaimer"><b>Bu class değil, alignment eğilimidir.</b> Otomatik sonuç DM’ye fikir verir; karakterin iradesini veya rolünü kilitlemez.</p></section><section class="card v51-affinity"><div class="v51-section-title"><span>İLAHİ YAKINLIK</span><h3>${esc(character.name)} hangi tanrıya yakın?</h3><p>Class, subclass, species/subspecies, Karma ve Adalet birlikte puanlanır.</p></div><div class="v51-affinity-list">${affinity.map(row=>`<article><div class="v51-affinity-rank">${row.rank}</div><div><b>${esc(row.deity.name)}</b><small>${esc(row.deity.pantheon)} • ${esc(row.deity.alignment)} • ${esc(row.deity.domains.join(', '))}</small><div class="v51-affinity-bar"><i style="width:${row.meter}%"></i></div><p>${row.reasons.map(esc).join(' • ')||'Genel değer uyumu'}</p></div><button class="ghost" data-v51-deity-open="${esc(row.deity.id)}">Aç</button><em>${esc(row.strength)}</em></article>`).join('')||'<div class="empty">Tanrı verisi bulunamadı.</div>'}</div><p class="v51-disclaimer"><b>Mekanik bonus vermez.</b> Bu öneri ibadet zorunluluğu değildir; DM’nin pantheonu ve karakter seçimi son sözdür.</p></section></div>`;
  }
  function v51HistoryColumn(axis,character){
    const karma=axis==='karma',record=v51Record(axis,character.id);
    return `<section><div class="v51-history-head"><h4>${karma?'Karma':'Adalet'} Geçmişi</h4><span>${record.history.length}/100</span></div><div class="v51-history-list">${record.history.slice(0,30).map(change=>`<article><b class="${(+change.delta||0)>=0?'up':'down'}">${v51Signed(+change.delta||0)}</b><div><strong>${esc(change.reason||'DM ayarlaması')}</strong><small>${v51Signed(+change.before||0)} → ${v51Signed(+change.after||0)} • ${v51Date(change.at)}</small></div></article>`).join('')||'<div class="empty">Henüz kayıt yok.</div>'}</div></section>`;
  }
  function v51Rules(){return v51ReferenceAxis==='justice'?(window.V51_JUSTICE_RULES||[]):(window.V44_KARMA_RULES||[])}
  function v51FilteredRules(){
    const needle=v51Fold(v51ReferenceQuery.trim());return v51Rules().filter(rule=>(v51ReferenceSign==='all'||(v51ReferenceSign==='positive'&&rule.value>0)||(v51ReferenceSign==='negative'&&rule.value<0)||(v51ReferenceSign==='context'&&rule.value===0))&&(v51ReferenceCategory==='all'||rule.category===v51ReferenceCategory)&&(!needle||v51Fold(`${rule.name} ${rule.category} ${rule.note}`).includes(needle)));
  }
  function v51ReferenceRows(){
    const character=v51SelectedCharacter();return v51FilteredRules().map(rule=>`<tr><td><span class="v51-rule-score ${rule.value>0?'up':rule.value<0?'down':'context'}">${v51Signed(rule.value)}</span></td><td><b>${esc(rule.name)}</b><small>${esc(rule.category)}</small></td><td>${esc(rule.note)}</td><td><button class="ghost" data-v51-rule="${v51ReferenceAxis}|${esc(rule.id)}" ${!character||!rule.value?'disabled':''}>${rule.value?'Uygula':'Referans'}</button></td></tr>`).join('')||'<tr><td colspan="4"><div class="empty">Bu filtrede kayıt yok.</div></td></tr>';
  }
  function v51Reference(){
    const rules=v51Rules(),categories=[...new Set(rules.map(row=>row.category))].sort((a,b)=>a.localeCompare(b,'tr')),character=v51SelectedCharacter();
    return `<section class="card v51-reference"><div class="v51-reference-head"><div><span>DM KARAR DESTEĞİ</span><h3>Eylem Referansı</h3><p>Puanlar başlangıç önerisidir; niyet, zorlama, bilgi, sonuç ve gerçek telafiye göre ölçekle.</p></div><b id="v51RuleCount">${v51FilteredRules().length}/${rules.length}</b></div><div class="v51-reference-tabs"><button data-v51-reference-axis="karma" class="${v51ReferenceAxis==='karma'?'primary':'ghost'}">Karma Eylemleri</button><button data-v51-reference-axis="justice" class="${v51ReferenceAxis==='justice'?'primary':'ghost'}">Adalet Eylemleri</button></div><div class="v51-reference-tools"><input id="v51ReferenceSearch" class="input" value="${esc(v51ReferenceQuery)}" placeholder="Eylem, kategori veya sonuç ara…"><select id="v51ReferenceSign"><option value="all">Tüm puanlar</option><option value="positive" ${v51ReferenceSign==='positive'?'selected':''}>Yalnız artı</option><option value="negative" ${v51ReferenceSign==='negative'?'selected':''}>Yalnız eksi</option><option value="context" ${v51ReferenceSign==='context'?'selected':''}>Bağlam / 0</option></select><select id="v51ReferenceCategory"><option value="all">Tüm kategoriler</option>${categories.map(category=>`<option value="${esc(category)}" ${v51ReferenceCategory===category?'selected':''}>${esc(category)}</option>`).join('')}</select></div><div class="v51-table-wrap"><table><thead><tr><th>Puan</th><th>Eylem</th><th>Nasıl yorumlanır?</th><th>${character?esc(character.name):'Karakter'}</th></tr></thead><tbody id="v51ReferenceRows">${v51ReferenceRows()}</tbody></table></div><details class="v51-rules-note"><summary>İki ekseni birlikte nasıl puanlarım?</summary><div><p><b>Karma</b> “Bu davranış kime, niçin ve öngörülebilir olarak ne yaptı?” sorusudur. <b>Adalet</b> “Güç, kural, söz, hak ve sorumluluk nasıl kullanıldı?” sorusudur.</p><p>Aynı olay ikisini farklı yönde değiştirebilir: zalim bir yasayı masumu kurtarmak için bozmak Karma’yı artırıp Adalet’i nötr veya az eksi etkileyebilir; masumu kanıt uydurarak kurtarmak iyi amaçlı olsa da adil süreci bozar.</p></div></details></section>`;
  }
  function v51KarmaPage(){
    v51Ensure();const character=v51SelectedCharacter();
    return `<section class="v51-page"><div class="v51-hero"><div><span class="v26-kicker">YALNIZCA DUNGEON MASTER</span><h2>Karma, Adalet ve İlahi Yakınlık</h2><p>Oyuncular puanları, geçmişi, otomatik alignmentı veya tanrı yakınlığını görmez. Sen eylemi işlersin; sistem yalnız tutarlı bir sonuç ve hikâye önerisi çıkarır.</p></div><div class="v51-hero-axis"><span><b>K</b>Kötü ↔ İyi</span><span><b>A</b>Kaos ↔ Düzen</span></div></div>${v51CharacterStrip()}${character?`<div class="v51-identity"><div><span>${esc(character.name)}</span><b>${esc(character.species||'Species yok')}${character.subspecies?' / '+esc(character.subspecies):''}</b><small>${esc(character.className||'Class yok')}${character.subclass?' / '+esc(character.subclass):''} • Lv ${esc(character.level||1)}</small></div><button class="ghost" data-page="deities">128 Tanrıyı Aç</button><button class="ghost" data-page="divineorder">İlahi Düzeni Aç</button></div><div class="v51-axis-grid">${v51AxisCard('karma',character)}${v51AxisCard('justice',character)}</div>${v51AlignmentPanel(character)}<section class="card v51-history"><div class="v51-section-title"><span>DEĞİŞİM KAYITLARI</span><h3>İki Ayrı Geçmiş</h3><p>Eski Karma kayıtları aynen korunur; Adalet kendi geçmişini tutar.</p></div><div class="v51-history-grid">${v51HistoryColumn('karma',character)}${v51HistoryColumn('justice',character)}</div></section>${v51Reference()}`:'<div class="card empty"><h3>Karakter bulunamadı</h3><p>Önce Karakterler ekranından en az bir karakter oluştur.</p></div>'}</section>`;
  }
  function v51RefreshReference(){const body=$('#v51ReferenceRows'),count=$('#v51RuleCount');if(body)body.innerHTML=v51ReferenceRows();if(count)count.textContent=`${v51FilteredRules().length}/${v51Rules().length}`}

  function v51DivineSearchText(row){return v51Fold(Object.values(row).flat(Infinity).join(' '))}
  function v51DivineMatches(row){const needle=v51Fold(v51DivineQuery.trim());return !needle||v51DivineSearchText(row).includes(needle)}
  function v51HierarchyPanel(){
    const layers=(window.V51_DIVINE_LAYERS||[]).filter(v51DivineMatches),orders=(window.V51_ANGEL_ORDERS||[]).filter(v51DivineMatches);
    return `<section class="v51-layer-grid">${layers.map(row=>`<article><span>${row.order}</span><div><b>${esc(row.name)}</b><small>${esc(row.who)}</small><p>${esc(row.duty)}</p><em>Çatışma: ${esc(row.conflict)}</em></div></article>`).join('')||'<div class="card empty">Eşleşen yönetim katmanı yok.</div>'}</section><div class="v51-order-list">${orders.map(row=>`<details><summary><span class="v51-order-tier">${row.tier}</span><span><b>${esc(row.name)}</b><small>${esc(row.title)} • ${esc(row.role)}</small></span><i>＋</i></summary><div><section><h4>İşaretleri</h4><p>${esc(row.signs)}</p></section><section><h4>Yapabildikleri</h4><ul>${row.powers.map(value=>`<li>${esc(value)}</li>`).join('')}</ul></section><section><h4>Sınırları</h4><ul>${row.limits.map(value=>`<li>${esc(value)}</li>`).join('')}</ul></section><section class="wide"><h4>Masada Kullanım</h4><p>${esc(row.encounter)}</p><p class="v51-corruption"><b>Yozlaşma riski:</b> ${esc(row.corruption)}</p></section></div></details>`).join('')||'<div class="card empty">Eşleşen melek düzeni yok.</div>'}</div>`;
  }
  function v51LawsPanel(){return `<div class="v51-law-grid">${(window.V51_DIVINE_LAWS||[]).filter(v51DivineMatches).map((row,index)=>`<details><summary><span>${String(index+1).padStart(2,'0')}</span><b>${esc(row.name)}</b><i>＋</i></summary><div><p><b>Yasa:</b> ${esc(row.rule)}</p><p><b>İhlal:</b> ${esc(row.breach)}</p><aside><span>DM KANCASI</span>${esc(row.hook)}</aside></div></details>`).join('')||'<div class="card empty">Eşleşen ilahi yasa yok.</div>'}</div>`}
  function v51SinsPanel(){return `<div class="v51-sin-grid">${(window.V51_DEADLY_SINS||[]).filter(v51DivineMatches).map(row=>`<details><summary><span>${esc(row.name.slice(0,1))}</span><div><b>${esc(row.name)}</b><small>Karşı erdem: ${esc(row.virtue)}</small></div><i>＋</i></summary><div><blockquote>${esc(row.temptation)}</blockquote><section><h4>Görünür işaretler</h4><ul>${row.signs.map(value=>`<li>${esc(value)}</li>`).join('')}</ul></section><section><h4>Üç yozlaşma aşaması</h4><ol>${row.stages.map(value=>`<li>${esc(value)}</li>`).join('')}</ol></section><section><h4>Telafi yolu</h4><p>${esc(row.redemption)}</p></section><aside><b>Kült / macera fikri</b><p>${esc(row.cult)}</p></aside></div></details>`).join('')||'<div class="card empty">Eşleşen günah kaydı yok.</div>'}</div>`}
  function v51HooksPanel(){const rows=(window.V51_DIVINE_HOOKS||[]).filter(value=>!v51DivineQuery||v51Fold(value).includes(v51Fold(v51DivineQuery)));return `<section class="v51-hook-board">${rows.map((value,index)=>`<article><span>${String(index+1).padStart(2,'0')}</span><p>${esc(value)}</p><button class="ghost" data-v51-copy-hook="${esc(value)}">Kopyala</button></article>`).join('')||'<div class="card empty">Eşleşen DM kancası yok.</div>'}</section>`}
  function v51DivineBody(){return v51DivineTab==='laws'?v51LawsPanel():v51DivineTab==='sins'?v51SinsPanel():v51DivineTab==='hooks'?v51HooksPanel():v51HierarchyPanel()}
  function v51DivinePage(){
    return `<section class="v51-divine"><div class="v51-divine-hero"><div><span class="v26-kicker">KAMPANYAYA ÖZEL • HOMEBREW LORE</span><h2>İlahi Düzen Ansiklopedisi</h2><p>Meleklerin dokuz görev düzeni, altı yönetim katmanı, on iki ilahi yasa ve yedi ölümcül günah için masada kullanılabilir sınırlar, yozlaşma yolları ve görev kancaları.</p></div><div><b>9</b><span>Melek Düzeni</span><b>7</b><span>Ölümcül Günah</span></div></div><section class="card v51-homebrew-note"><b>2014 kuralı değildir</b><p>Bu sayfadaki melek hiyerarşisi, ilahi yönetim, yasalar ve günah aşamaları kampanyaya özel lore aracıdır. Otomatik stat, spell, condition veya alignment değişimi yapmaz; mekanik sonucu DM belirler.</p></section><div class="v51-divine-tools"><label><span>⌕</span><input id="v51DivineSearch" class="input" value="${esc(v51DivineQuery)}" placeholder="Melek, yasa, günah, güç veya görev ara…"></label><div>${[['hierarchy','Hiyerarşi'],['laws','İlahi Yasalar'],['sins','Ölümcül Günahlar'],['hooks','DM Kancaları']].map(([id,label])=>`<button data-v51-divine-tab="${id}" class="${v51DivineTab===id?'primary':'ghost'}">${label}</button>`).join('')}</div></div><div id="v51DivineBody">${v51DivineBody()}</div><footer class="v51-divine-footer">Klasik melek adlarından esinlenen özgün fantastik masa yorumu • 2014 çekirdek mekaniğine ek kural getirmez</footer></section>`;
  }
  function v51RefreshDivine(){const body=$('#v51DivineBody');if(body)body.innerHTML=v51DivineBody()}

  function v51AxisModal(axis,character){
    const record=v51Record(axis,character.id),label=axis==='justice'?'Adalet':'Karma';
    modal(`${label} Değiştir`, `<div class="v51-axis-modal"><div><span>${esc(character.name)}</span><b>${label}: ${v51Signed(record.value)}</b></div><label>Değişim puanı<input id="v51AxisDelta" class="input" type="number" min="-100" max="100" step="1" value="0" inputmode="numeric"></label><label>Neden<textarea id="v51AxisReason" rows="3" placeholder="Kararın ne olduğunu ve neden bu puanı verdiğini yaz"></textarea></label><p id="v51AxisPreview">Yeni değer: ${v51Signed(record.value)}</p><button id="v51ConfirmAxis" class="primary" data-axis="${axis}" data-character="${esc(character.id)}">Kaydet</button></div>`);
  }

  function v51InstallNav(nav){
    const karma=nav.find(row=>row[0]==='karma');if(karma)karma[2]='Karma & Adalet';
    if(nav.some(row=>row[0]==='divineorder'))return;
    const deityIndex=nav.findIndex(row=>row[0]==='deities'),guideIndex=nav.findIndex(row=>row[0]==='guide');nav.splice(deityIndex>=0?deityIndex+1:guideIndex>=0?guideIndex:nav.length,0,['divineorder','✺','İlahi Düzen']);
  }
  v51InstallNav(dmNav);v51InstallNav(playerNav);dmPages.karma=v51KarmaPage;dmPages.divineorder=v51DivinePage;playerPages.divineorder=v51DivinePage;
  if(typeof V27_PAGE_HELP!=='undefined'){V27_PAGE_HELP.karma='Gizli Karma ve Adalet puanlarını yönet; otomatik alignment ve class/species tabanlı tanrı yakınlığını gör.';V27_PAGE_HELP.divineorder='Kampanyaya özel melek hiyerarşisi, ilahi yasalar, ölümcül günahlar ve DM kancaları.'}
  const v51DmGuideBase=dmPages.guide,v51PlayerGuideBase=playerPages.guide;
  const v51GuideWithDivine=base=>()=>String(base()).replace('<div class="v26-guide-tabs">','<div class="v26-guide-tabs"><button class="primary" data-page="divineorder">✺ İlahi Düzen Ansiklopedisi</button>');
  if(v51DmGuideBase)dmPages.guide=v51GuideWithDivine(v51DmGuideBase);if(v51PlayerGuideBase)playerPages.guide=v51GuideWithDivine(v51PlayerGuideBase);

  document.addEventListener('input',event=>{
    if(event.target.id==='v51ReferenceSearch'){v51ReferenceQuery=event.target.value;v51RefreshReference()}
    if(event.target.id==='v51DivineSearch'){v51DivineQuery=event.target.value;v51RefreshDivine()}
    if(event.target.id==='v51AxisDelta'){const button=$('#v51ConfirmAxis'),record=button&&v51Record(button.dataset.axis,button.dataset.character),delta=Math.trunc(+event.target.value||0),preview=$('#v51AxisPreview');if(record&&preview)preview.textContent=`Yeni değer: ${v51Signed(v51Clamp(record.value+delta,-100,100))}`}
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='v51ReferenceSign'){v51ReferenceSign=event.target.value;v51RefreshReference()}
    if(event.target.id==='v51ReferenceCategory'){v51ReferenceCategory=event.target.value;v51RefreshReference()}
  });
  document.addEventListener('click',async event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.v51Character){v51Character=button.dataset.v51Character;render();return}
    if(button.dataset.v51Quick){const [axis,id,delta]=button.dataset.v51Quick.split('|'),character=(state.characters||[]).find(row=>String(row.id)===String(id));if(!character)return;v51AdjustAxis(axis,id,+delta,axis==='justice'?(+delta>0?'DM hızlı adalet ayarı':'DM hızlı kaos ayarı'):(+delta>0?'DM hızlı iyilik ayarı':'DM hızlı kötülük ayarı'),'quick');save();render();return}
    if(button.dataset.v51Custom){const [axis,id]=button.dataset.v51Custom.split('|'),character=(state.characters||[]).find(row=>String(row.id)===String(id));if(character)v51AxisModal(axis,character);return}
    if(button.id==='v51ConfirmAxis'){const character=(state.characters||[]).find(row=>String(row.id)===String(button.dataset.character)),delta=Math.trunc(+($('#v51AxisDelta')?.value||0)),reason=$('#v51AxisReason')?.value?.trim();if(!character)return;if(!delta)return alert('Sıfırdan farklı bir puan yaz.');if(!reason)return alert('Geçmişte anlaşılması için kısa bir neden yaz.');v51AdjustAxis(button.dataset.axis,character.id,delta,reason,'manual');save();$('#modal').close();render();return}
    if(button.dataset.v51Undo){const [axis,id]=button.dataset.v51Undo.split('|'),character=(state.characters||[]).find(row=>String(row.id)===String(id)),record=character&&v51Record(axis,id);if(!character||!record?.history.length)return;if(!confirm(`${character.name} için son ${axis==='justice'?'Adalet':'Karma'} işlemi geri alınsın mı?`))return;v51UndoAxis(axis,id);save();render();return}
    if(button.dataset.v51Reset){const [axis,id]=button.dataset.v51Reset.split('|'),character=(state.characters||[]).find(row=>String(row.id)===String(id)),record=character&&v51Record(axis,id);if(!character||!record?.value)return;if(!confirm(`${character.name} ${axis==='justice'?'Adalet':'Karma'} puanı 0 yapılsın mı? Geçmişe kayıt eklenir.`))return;v51AdjustAxis(axis,id,-record.value,`DM ${axis==='justice'?'adaleti':'karmayı'} nötre getirdi`,'reset');save();render();return}
    if(button.dataset.v51ReferenceAxis){v51ReferenceAxis=button.dataset.v51ReferenceAxis;v51ReferenceCategory='all';render();return}
    if(button.dataset.v51Rule){const [axis,id]=button.dataset.v51Rule.split('|'),rule=(axis==='justice'?window.V51_JUSTICE_RULES:window.V44_KARMA_RULES).find(row=>row.id===id),character=v51SelectedCharacter();if(!rule||!character||!rule.value)return;v51AdjustAxis(axis,character.id,rule.value,rule.name,`rule:${rule.id}`);save();render();return}
    if(button.dataset.v51DeityOpen){page='deities';render();setTimeout(()=>{const escape=globalThis.CSS?.escape,selector=escape?escape(button.dataset.v51DeityOpen):button.dataset.v51DeityOpen.replace(/[^a-z0-9_-]/gi,''),card=document.querySelector(`#v49-deity-${selector}`);if(card){card.open=true;card.scrollIntoView?.({behavior:'smooth',block:'start'})}},0);return}
    if(button.dataset.v51DivineTab){v51DivineTab=button.dataset.v51DivineTab;render();return}
    if(button.dataset.v51CopyHook){try{await navigator.clipboard.writeText(button.dataset.v51CopyHook);toast('DM kancası kopyalandı')}catch{toast('Kopyalanamadı',true)}return}
  });

  const v51NavGroups=[
    {id:'characters',icon:'♙',label:'Karakter & Parti',pages:['dashboard','party','partyview','inventory','skills']},
    {id:'adventure',icon:'⚔',label:'Macera & Savaş',pages:['questboard','map','encounter','encounterview','dice']},
    {id:'economy',icon:'◇',label:'Lonca & Ekonomi',pages:['guilddm','guild','treasury','market','lootgen']},
    {id:'world',icon:'✥',label:'Dünya & Kayıtlar',pages:['world','npcs','bestiary','karma']},
    {id:'social',icon:'✉',label:'Masa İletişimi',pages:['pacts','chat','notifications']},
    {id:'library',icon:'⌕',label:'Rehber & Arşiv',pages:['guide','spellbook','deities','divineorder','patchnotes']}
  ];
  function v51NavStorageKey(){return `kadim-v51-nav-${current?.id||'none'}-${current?.role||'none'}`}
  function v51ReadOpenGroups(){try{return new Set(JSON.parse(localStorage.getItem(v51NavStorageKey())||'[]'))}catch{return new Set()}}
  function v51WriteOpenGroups(){try{localStorage.setItem(v51NavStorageKey(),JSON.stringify([...document.querySelectorAll('#nav details.v51-nav-group[open]')].map(row=>row.dataset.v51NavGroup)))}catch{}}
  function v51GroupNav(){
    const nav=$('#nav');if(!nav||[...nav.children].some(node=>node.matches?.('details.v51-nav-group')))return;
    const buttons=[...nav.children].filter(node=>node.matches?.('button[data-page]'));if(!buttons.length)return;
    const buttonMap=new Map(buttons.map(button=>[button.dataset.page,button])),used=new Set(),open=v51ReadOpenGroups(),fragment=document.createDocumentFragment();
    for(const group of v51NavGroups){const rows=group.pages.map(id=>buttonMap.get(id)).filter(Boolean);if(!rows.length)continue;const details=document.createElement('details');details.className='v51-nav-group';details.dataset.v51NavGroup=group.id;if(open.has(group.id)||rows.some(button=>button.classList.contains('active')))details.open=true;const summary=document.createElement('summary');summary.innerHTML=`<span>${group.icon}</span><b>${group.label}</b><i>${rows.length}</i>`;details.append(summary);const body=document.createElement('div');for(const button of rows){used.add(button.dataset.page);body.append(button)}details.append(body);fragment.append(details)}
    const extras=buttons.filter(button=>!used.has(button.dataset.page));if(extras.length){const details=document.createElement('details');details.className='v51-nav-group';details.dataset.v51NavGroup='other';details.open=extras.some(button=>button.classList.contains('active'));const summary=document.createElement('summary');summary.innerHTML=`<span>＋</span><b>Diğer</b><i>${extras.length}</i>`;details.append(summary);const body=document.createElement('div');extras.forEach(button=>body.append(button));details.append(body);fragment.append(details)}
    nav.replaceChildren(fragment);nav.dataset.v51Grouped='1';
  }
  document.addEventListener('toggle',event=>{if(event.target?.matches?.('#nav details.v51-nav-group'))v51WriteOpenGroups()},true);
  const v51BaseRender=render;
  render=function(){const result=v51BaseRender();v51GroupNav();return result};

  window.v51Ensure=v51Ensure;window.v51JusticeBand=v51JusticeBand;window.v51AdjustAxis=v51AdjustAxis;window.v51UndoAxis=v51UndoAxis;window.v51AlignmentFromScores=v51AlignmentFromScores;window.v51DeityAffinity=v51DeityAffinity;window.v51KarmaPage=v51KarmaPage;window.v51DivinePage=v51DivinePage;window.v51GroupNav=v51GroupNav;
  if(current){v51Ensure();render()}
})();
