/* v44: hidden DM karma ledger and rule-aware random loot generator. */
(()=>{
  'use strict';

  const v44Clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const v44Fold=value=>String(value??'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const v44Date=value=>{let date=new Date(value);return Number.isNaN(date.getTime())?'—':date.toLocaleString('tr-TR',{dateStyle:'short',timeStyle:'short'})};
  const v44FreshId=()=>typeof uid==='function'?uid():`v44-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  let v44CampaignId=null;
  let v44KarmaCharacter='';
  let v44KarmaQuery='';
  let v44KarmaSign='all';
  let v44KarmaCategory='all';
  let v44LootResultId='';
  let v44LootSelected=new Set();
  let v44LootUi={level:1,container:'chest',theme:'mixed',quality:'standard',rarity:'auto',query:'',catalogTheme:'all',catalogRarity:'all',catalogCategory:'all'};

  function v44ResetLocal(){
    v44KarmaCharacter='';v44KarmaQuery='';v44KarmaSign='all';v44KarmaCategory='all';v44LootResultId='';v44LootSelected=new Set();
    v44LootUi={level:1,container:'chest',theme:'mixed',quality:'standard',rarity:'auto',query:'',catalogTheme:'all',catalogRarity:'all',catalogCategory:'all'};
  }

  function v44Ensure(){
    if(!state||typeof state!=='object')return;
    if(current?.id!==v44CampaignId){v44CampaignId=current?.id||null;v44ResetLocal()}
    if(!state.v44KarmaLedger||Array.isArray(state.v44KarmaLedger)||typeof state.v44KarmaLedger!=='object')state.v44KarmaLedger={};
    if(!Array.isArray(state.v44LootHistory))state.v44LootHistory=[];
    state.v44LootHistory=state.v44LootHistory.filter(row=>row&&typeof row==='object'&&Array.isArray(row.items)&&row.coins).slice(0,30);
    for(let character of state.characters||[]){
      let record=state.v44KarmaLedger[character.id];
      if(!record||typeof record!=='object')record=state.v44KarmaLedger[character.id]={value:0,history:[]};
      record.value=v44Clamp(Number.isFinite(+record.value)?Math.round(+record.value):0,-100,100);
      if(!Array.isArray(record.history))record.history=[];
      record.history=record.history.filter(row=>row&&typeof row==='object').slice(0,100);
    }
  }

  function v44KarmaRecord(characterId){
    v44Ensure();
    return state.v44KarmaLedger[characterId]||(state.v44KarmaLedger[characterId]={value:0,history:[]});
  }

  function v44KarmaBand(value){return V44_KARMA_BANDS.find(band=>value>=band.min&&value<=band.max)||V44_KARMA_BANDS[3]}

  function v44AdjustKarma(characterId,delta,reason='DM ayarlaması',source='manual'){
    let character=(state.characters||[]).find(row=>String(row.id)===String(characterId));
    if(!character)return null;
    let record=v44KarmaRecord(character.id),before=record.value,requested=Math.trunc(+delta||0),after=v44Clamp(before+requested,-100,100),actual=after-before;
    if(!actual)return {record,change:null};
    let change={id:v44FreshId(),at:new Date().toISOString(),before,after,delta:actual,requested,reason:String(reason||'DM ayarlaması').trim()||'DM ayarlaması',source};
    record.value=after;record.history.unshift(change);record.history=record.history.slice(0,100);
    return {record,change};
  }

  function v44UndoKarma(characterId){
    let character=(state.characters||[]).find(row=>String(row.id)===String(characterId));if(!character)return null;
    let record=v44KarmaRecord(character.id),change=record.history.shift();if(!change)return null;
    record.value=v44Clamp(Number.isFinite(+change.before)?+change.before:record.value-(+change.delta||0),-100,100);
    return change;
  }

  function v44SelectedCharacter(){
    let characters=state.characters||[];
    if(!characters.some(row=>String(row.id)===String(v44KarmaCharacter)))v44KarmaCharacter=characters[0]?.id||'';
    return characters.find(row=>String(row.id)===String(v44KarmaCharacter))||null;
  }

  function v44KarmaCharacterCard(character){
    let record=v44KarmaRecord(character.id),band=v44KarmaBand(record.value),selected=String(character.id)===String(v44KarmaCharacter),position=(record.value+100)/2;
    return `<article class="v44-karma-character ${band.tone} ${selected?'selected':''}">
      <button class="v44-character-select" data-v44-karma-character="${esc(character.id)}" aria-label="${esc(character.name)} karma kaydını aç">
        <span><small>${esc(character.className||'Karakter')} • Seviye ${Math.max(1,+character.level||1)}</small><b>${esc(character.name||'İsimsiz')}</b></span>
        <strong>${record.value>0?'+':''}${record.value}</strong>
      </button>
      <div class="v44-karma-meter"><i style="left:${position}%"></i></div>
      <div class="v44-karma-band"><span>${esc(band.label)}</span><small>${record.history.length} kayıt</small></div>
      <div class="v44-karma-quick">
        <button data-v44-karma-quick="${esc(character.id)}|-5" class="danger">−5</button><button data-v44-karma-quick="${esc(character.id)}|-1" class="ghost">−1</button>
        <button data-v44-karma-custom="${esc(character.id)}" class="ghost">Özel</button>
        <button data-v44-karma-quick="${esc(character.id)}|1" class="ghost">+1</button><button data-v44-karma-quick="${esc(character.id)}|5" class="primary">+5</button>
      </div>
    </article>`;
  }

  function v44KarmaFilteredRules(){
    let query=v44Fold(v44KarmaQuery);
    return V44_KARMA_RULES.filter(rule=>(v44KarmaSign==='all'||(v44KarmaSign==='positive'&&rule.value>0)||(v44KarmaSign==='negative'&&rule.value<0)||(v44KarmaSign==='context'&&rule.value===0))&&(v44KarmaCategory==='all'||rule.category===v44KarmaCategory)&&(!query||v44Fold(`${rule.name} ${rule.category} ${rule.note}`).includes(query)));
  }

  function v44KarmaRuleRows(){
    let selected=v44SelectedCharacter(),rows=v44KarmaFilteredRules();
    return rows.map(rule=>`<tr class="${rule.value>0?'positive':rule.value<0?'negative':'context'}">
      <td><span class="v44-karma-delta">${rule.value>0?'+':''}${rule.value}</span></td>
      <td><small>${esc(rule.category)}</small><b>${esc(rule.name)}</b></td>
      <td>${esc(rule.note)}</td>
      <td><button class="ghost" data-v44-karma-rule="${esc(rule.id)}" ${!selected||!rule.value?'disabled':''}>${rule.value?'Uygula':'Referans'}</button></td>
    </tr>`).join('')||'<tr><td colspan="4"><div class="empty">Bu filtrede referans bulunamadı.</div></td></tr>';
  }

  function v44KarmaHistory(character){
    if(!character)return '<div class="empty">Önce bir karakter oluştur.</div>';
    let record=v44KarmaRecord(character.id),band=v44KarmaBand(record.value);
    return `<div class="v44-karma-selected-head"><div><span class="v26-kicker">SEÇİLİ KARAKTER</span><h3>${esc(character.name)}</h3><p><b>${record.value>0?'+':''}${record.value}</b> • ${esc(band.label)}</p></div><div class="toolbar"><button data-v44-karma-custom="${esc(character.id)}" class="primary">Karma Değiştir</button><button data-v44-karma-reset="${esc(character.id)}" class="ghost" ${record.value===0?'disabled':''}>Nötre Getir</button><button data-v44-karma-undo="${esc(character.id)}" class="ghost" ${!record.history.length?'disabled':''}>Son İşlemi Geri Al</button></div></div>
      <div class="v44-karma-event ${band.tone}"><small>DM EVENT FİKRİ • ${esc(band.label)}</small><p>${esc(band.event)}</p></div>
      <div class="v44-karma-history">${record.history.slice(0,30).map(change=>`<article><span class="${change.delta>0?'up':'down'}">${change.delta>0?'+':''}${change.delta}</span><div><b>${esc(change.reason)}</b><small>${change.before>0?'+':''}${change.before} → ${change.after>0?'+':''}${change.after} • ${v44Date(change.at)}</small></div></article>`).join('')||'<div class="empty">Henüz karma hareketi yok.</div>'}</div>`;
  }

  function v44KarmaPage(){
    v44Ensure();let selected=v44SelectedCharacter(),categories=[...new Set(V44_KARMA_RULES.map(rule=>rule.category))].sort((a,b)=>a.localeCompare(b,'tr'));
    return `<section class="v44-page">
      <div class="v44-hero karma"><div><span class="v26-kicker">YALNIZCA DUNGEON MASTER</span><h2>Gizli Karma Defteri</h2><p>Oyuncu menülerinde, karakter kartlarında ve parti görünümünde gösterilmez. Puanı yalnız sen değiştirirsin; sistem kendiliğinden hüküm vermez.</p></div><div class="v44-hero-stat"><b>−100</b><span>İyilik ↔ Kötülük</span><b>+100</b></div></div>
      <div class="v44-karma-grid">${(state.characters||[]).map(v44KarmaCharacterCard).join('')||'<div class="card empty">Karma tutmak için önce bir karakter oluştur.</div>'}</div>
      <section class="card v44-karma-detail">${v44KarmaHistory(selected)}</section>
      <section class="card v44-reference">
        <div class="v44-section-head"><div><span class="v26-kicker">DM REFERANS TABLOSU</span><h3>Eylem Bazlı Karma</h3><p>Değer başlangıç noktasıdır. Niyet, bilgi, zorlama, sonuç ve gerçek telafiye göre çoğu olayda ±1–10 ayarlayabilirsin.</p></div><b id="v44KarmaRuleCount">${v44KarmaFilteredRules().length}/${V44_KARMA_RULES.length}</b></div>
        <div class="v44-filters"><input id="v44KarmaSearch" class="input" value="${esc(v44KarmaQuery)}" placeholder="Hırsızlık, masum, ihanet…"><select id="v44KarmaSign"><option value="all" ${v44KarmaSign==='all'?'selected':''}>Tüm değerler</option><option value="positive" ${v44KarmaSign==='positive'?'selected':''}>Yalnız iyilik</option><option value="negative" ${v44KarmaSign==='negative'?'selected':''}>Yalnız kötülük</option><option value="context" ${v44KarmaSign==='context'?'selected':''}>Bağlam notları</option></select><select id="v44KarmaCategory"><option value="all">Tüm kategoriler</option>${categories.map(category=>`<option ${category===v44KarmaCategory?'selected':''}>${esc(category)}</option>`).join('')}</select></div>
        <div class="v44-table-wrap"><table class="v44-karma-table"><thead><tr><th>Puan</th><th>Eylem</th><th>Ne zaman?</th><th>${selected?esc(selected.name):'Karakter'}</th></tr></thead><tbody id="v44KarmaRules">${v44KarmaRuleRows()}</tbody></table></div>
        <details class="v44-rules-note"><summary>Karma puanlarken dört güvenlik kuralı</summary><ol><li><b>Niyet + öngörülebilir sonuç:</b> saf kaza ile bilerek yapılanı aynı puanlama.</li><li><b>Tek olayı parçalama:</b> bir katliamı sınırsız sayıda −35 ile çarpıp sistemin aralığını anlamsızlaştırma; büyük tek ceza kullan.</li><li><b>Puan kasmayı engelle:</b> aynı küçük iyiliği tekrar tekrar yapmak yerine sahne/oturum toplamı ver.</li><li><b>Telafi geçmişi silmez:</b> önce kötü eylemi, sonra gerçek telafiyi ayrı kayıt olarak işle.</li></ol></details>
      </section>
    </section>`;
  }

  function v44Money(coins={}){return `<span class="coin pp">${+coins.pp||0} PP</span><span class="coin gp">${+coins.gp||0} GP</span><span class="coin sp">${+coins.sp||0} SP</span><span class="coin cp">${+coins.cp||0} CP</span>`}
  function v44Value(copper=0){let total=Math.max(0,Math.round(+copper||0));if(total>=1000)return `${(total/1000).toLocaleString('tr-TR',{maximumFractionDigits:1})} PP`;if(total>=100)return `${(total/100).toLocaleString('tr-TR',{maximumFractionDigits:1})} GP`;if(total>=10)return `${(total/10).toLocaleString('tr-TR',{maximumFractionDigits:1})} SP`;return `${total} CP`}
  function v44Rarity(item){let rarity=V44_RARITIES[item.rarity]||V44_RARITIES.common;return `<span class="v44-rarity ${esc(item.rarity)}" style="--rarity:${rarity.color}">${esc(rarity.label)}</span>`}
  function v44Result(){v44Ensure();let history=state.v44LootHistory;if(!history.some(row=>row.id===v44LootResultId))v44LootResultId=history[0]?.id||'';return history.find(row=>row.id===v44LootResultId)||null}
  function v44ResultItems(){let result=v44Result();return result?.items||[]}
  function v44SelectedResultItems(){let items=v44ResultItems();return items.filter(item=>v44LootSelected.has(item.instanceId))}

  function v44LootItemCard(item,index,{catalog=false}={}){
    let checked=v44LootSelected.has(item.instanceId),themes=(item.themes||[]).filter(theme=>theme!=='mixed').slice(0,3).map(theme=>V44_LOOT_THEMES[theme]?.label||theme).join(' • ');
    return `<details class="v44-loot-item" ${catalog?'':'open'}>
      <summary>${catalog?'':`<input type="checkbox" data-v44-loot-select="${esc(item.instanceId)}" ${checked?'checked':''} aria-label="Ganimeti seç">`}<span><b>${esc(item.name)}${item.qty>1?` ×${item.qty}`:''}</b><small>${esc(item.categoryLabel||V44_LOOT_CATEGORY_LABELS[item.category]||item.category)}${themes?' • '+esc(themes):''}</small></span>${v44Rarity(item)}<i>＋</i></summary>
      <div class="v44-loot-body"><p>${esc(item.effect)}</p><div><span>Boyut: <b>${({tiny:'Çok küçük',small:'Küçük',medium:'Orta',large:'Büyük'})[item.size]||item.size}</b></span><span>Önerilen değer: <b>${v44Value(item.valueCopper)}</b></span><span>Önerilen sandık seviyesi: <b>${item.minLevel}+</b></span></div>${catalog?`<button class="primary" data-v44-catalog-add="${esc(item.id)}">Bu Sonuca Ekle</button>`:''}</div>
    </details>`;
  }

  function v44LootResultCard(){
    let result=v44Result();
    if(!result)return `<section class="card v44-loot-empty"><span>▤</span><h3>Henüz ganimet üretilmedi</h3><p>Seviye, kap ve tema seçip üret. Yalnız para, birden çok eşya veya karışık sonuç çıkabilir.</p></section>`;
    let container=V44_LOOT_CONTAINERS[result.container]||V44_LOOT_CONTAINERS.chest,theme=V44_LOOT_THEMES[result.theme]||V44_LOOT_THEMES.mixed,quality=V44_LOOT_QUALITY[result.quality]||V44_LOOT_QUALITY.standard,selected=v44SelectedResultItems().length;
    return `<section class="card v44-loot-result">
      <div class="v44-result-head"><div><span class="v26-kicker">SON GANİMET • ${v44Date(result.at)}</span><h3>${container.icon} ${esc(container.label)}</h3><p>Seviye ${result.level} • ${esc(theme.label)} • ${esc(quality.label)} • ${esc(result.summary||'')}</p></div><div class="toolbar"><button data-v44-select-all="1" class="ghost">Tümünü Seç</button><button data-v44-select-all="0" class="ghost">Seçimi Kaldır</button></div></div>
      <div class="v44-coin-result"><div><small>PARA SONUCU</small><div>${v44Money(result.coins)}</div></div><p>Bu tutar hikâye önerisidir; dağıtacağın karakterin Kasa ekranından ekleyebilirsin.</p></div>
      <div class="v44-result-list">${result.items.map((item,index)=>v44LootItemCard(item,index)).join('')||'<div class="empty"><b>Yalnız para çıktı.</b><br>Bu, özellikle kese ve düşük kaliteli kaplarda normal bir sonuçtur.</div>'}</div>
      <div class="v44-result-actions"><span><b>${selected}</b> eşya seçili</span><button data-v44-loot-ground class="ghost" ${!selected?'disabled':''}>Seçilileri Yere Bırak</button><button data-v44-loot-give class="primary" ${!selected||!(state.characters||[]).length?'disabled':''}>Seçilileri Karaktere Ver</button></div>
    </section>`;
  }

  function v44CatalogFiltered(){
    let query=v44Fold(v44LootUi.query);
    return V44_LOOT_CATALOG.filter(item=>(v44LootUi.catalogTheme==='all'||item.themes.includes(v44LootUi.catalogTheme))&&(v44LootUi.catalogRarity==='all'||item.rarity===v44LootUi.catalogRarity)&&(v44LootUi.catalogCategory==='all'||item.category===v44LootUi.catalogCategory)&&(!query||v44Fold(`${item.name} ${item.effect} ${item.note} ${item.categoryLabel}`).includes(query)));
  }
  function v44CatalogCards(){let rows=v44CatalogFiltered(),visible=rows.slice(0,60);return `${visible.map(item=>v44LootItemCard(item,0,{catalog:true})).join('')||'<div class="empty">Bu filtrede eşya yok.</div>'}${rows.length>visible.length?`<p class="v44-limit-note">Performans için ilk ${visible.length} kayıt gösteriliyor. Aramayı daraltırsan diğerleri gelir.</p>`:''}`}
  function v44RefreshCatalog(){let list=$('#v44CatalogList'),count=$('#v44CatalogCount');if(list)list.innerHTML=v44CatalogCards();if(count)count.textContent=`${v44CatalogFiltered().length}/${V44_LOOT_CATALOG.length}`}
  function v44RefreshKarmaRules(){let body=$('#v44KarmaRules'),count=$('#v44KarmaRuleCount');if(body)body.innerHTML=v44KarmaRuleRows();if(count)count.textContent=`${v44KarmaFilteredRules().length}/${V44_KARMA_RULES.length}`}

  function v44LootHistory(){
    return `<div class="v44-history-list">${state.v44LootHistory.map(result=>{let c=V44_LOOT_CONTAINERS[result.container]||V44_LOOT_CONTAINERS.chest;return `<article class="${result.id===v44LootResultId?'selected':''}"><button data-v44-loot-load="${esc(result.id)}"><span>${c.icon}</span><div><b>${esc(c.label)} • Sv ${result.level}</b><small>${esc(result.summary||'')} • ${v44Date(result.at)}</small></div></button><button class="danger" data-v44-loot-delete="${esc(result.id)}" aria-label="Ganimet kaydını sil">×</button></article>`}).join('')||'<div class="empty">Üretilen son 30 sonuç burada saklanır.</div>'}</div>`;
  }

  function v44LootPage(){
    v44Ensure();let container=V44_LOOT_CONTAINERS[v44LootUi.container]||V44_LOOT_CONTAINERS.chest,categories=Object.entries(V44_LOOT_CATEGORY_LABELS),themeOptions=Object.entries(V44_LOOT_THEMES),rarityOptions=V44_RARITY_ORDER.map(key=>[key,V44_RARITIES[key]]);
    return `<section class="v44-page">
      <div class="v44-hero loot"><div><span class="v26-kicker">DM HİKÂYE ARACI</span><h2>Kurallı Ganimet Üretici</h2><p><b>${V44_LOOT_CATALOG.length.toLocaleString('tr-TR')}</b> açıklamalı eşya; kap boyutu, tema, seviye, kalite ve nadirlik birlikte değerlendirilir.</p></div><div class="v44-hero-stat"><b>${V44_LOOT_CATALOG.length.toLocaleString('tr-TR')}</b><span>özgün kayıt</span></div></div>
      <div class="v44-generator-layout">
        <section class="card v44-generator-controls">
          <div><span class="v26-kicker">1 • KAYNAĞI SEÇ</span><h3>Sandık Ayarları</h3></div>
          <label>Ganimet seviyesi<select id="v44LootLevel">${Array.from({length:10},(_,i)=>`<option value="${i+1}" ${v44LootUi.level===i+1?'selected':''}>Seviye ${i+1}</option>`).join('')}</select><small>Karakter seviyesi olmak zorunda değil; bölgenin ganimet gücü.</small></label>
          <label>Kap / kaynak<select id="v44LootContainer">${Object.entries(V44_LOOT_CONTAINERS).map(([key,row])=>`<option value="${key}" ${v44LootUi.container===key?'selected':''}>${row.icon} ${esc(row.label)}</option>`).join('')}</select></label>
          <div id="v44ContainerRule" class="v44-container-rule"><b>${container.icon} ${esc(container.label)}</b><p>${esc(container.rule)}</p></div>
          <label>Tema filtresi<select id="v44LootTheme">${themeOptions.map(([key,row])=>`<option value="${key}" ${v44LootUi.theme===key?'selected':''}>${esc(row.label)}</option>`).join('')}</select></label>
          <label>Hazine kalitesi<select id="v44LootQuality">${Object.entries(V44_LOOT_QUALITY).map(([key,row])=>`<option value="${key}" ${v44LootUi.quality===key?'selected':''}>${esc(row.label)}</option>`).join('')}</select></label>
          <label>Nadirlik<select id="v44LootRarity"><option value="auto">Otomatik zar</option>${rarityOptions.map(([key,row])=>`<option value="${key}" ${v44LootUi.rarity===key?'selected':''}>Zorla: ${esc(row.label)}</option>`).join('')}</select><small>“Zorla” test veya özel ödül içindir; normal olasılık hesabını atlar.</small></label>
          <button id="v44GenerateLoot" class="primary v44-generate">✦ Ganimet Üret</button>
          <details class="v44-odds"><summary>Nadirlik ve uç jackpot olasılığı</summary><p>Seviye ve kalite normal ağırlıkları değiştirir. Her eşya atışında bunlardan önce iki uç ihtimal kontrol edilir:</p><ul><li><b>Artefakt:</b> 1 / 100.000.000</li><li><b>Efsanevi sürpriz:</b> sonraki 1 / 10.000.000</li></ul><p>Böylece yıpranmış Seviye 1 sandıktan bile teorik olarak eşsiz eşya çıkabilir; fakat zorla seçmedikçe gerçekten olağanüstü nadirdir.</p></details>
        </section>
        <div class="v44-generator-main">${v44LootResultCard()}<details class="card v44-loot-history" ${state.v44LootHistory.length?'':'open'}><summary><span>Son Ganimetler</span><small>${state.v44LootHistory.length}/30 kayıt</small><i>＋</i></summary><div>${v44LootHistory()}${state.v44LootHistory.length?'<button id="v44ClearLootHistory" class="danger">Geçmişi Temizle</button>':''}</div></details></div>
      </div>
      <details class="card v44-catalog" open>
        <summary><span><small class="v26-kicker">2 • İSTERSEN ELLE SEÇ</small><b>Ganimet Ansiklopedisi</b></span><strong id="v44CatalogCount">${v44CatalogFiltered().length}/${V44_LOOT_CATALOG.length}</strong><i>＋</i></summary>
        <div class="v44-catalog-body"><div class="v44-filters"><input id="v44CatalogSearch" class="input" value="${esc(v44LootUi.query)}" placeholder="Yakut kolye, ateş, görünmezlik…"><select id="v44CatalogTheme"><option value="all">Tüm temalar</option>${themeOptions.filter(([key])=>key!=='mixed').map(([key,row])=>`<option value="${key}" ${v44LootUi.catalogTheme===key?'selected':''}>${esc(row.label)}</option>`).join('')}</select><select id="v44CatalogRarity"><option value="all">Tüm nadirlikler</option>${rarityOptions.map(([key,row])=>`<option value="${key}" ${v44LootUi.catalogRarity===key?'selected':''}>${esc(row.label)}</option>`).join('')}</select><select id="v44CatalogCategory"><option value="all">Tüm türler</option>${categories.map(([key,label])=>`<option value="${key}" ${v44LootUi.catalogCategory===key?'selected':''}>${esc(label)}</option>`).join('')}</select></div><div id="v44CatalogList" class="v44-catalog-list">${v44CatalogCards()}</div></div>
      </details>
    </section>`;
  }

  function v44ReadLootControls(){
    v44LootUi.level=v44Clamp(+($('#v44LootLevel')?.value||v44LootUi.level),1,10);
    v44LootUi.container=$('#v44LootContainer')?.value||v44LootUi.container;
    v44LootUi.theme=$('#v44LootTheme')?.value||v44LootUi.theme;
    v44LootUi.quality=$('#v44LootQuality')?.value||v44LootUi.quality;
    v44LootUi.rarity=$('#v44LootRarity')?.value||v44LootUi.rarity;
  }

  function v44StoreResult(result){
    state.v44LootHistory.unshift(result);state.v44LootHistory=state.v44LootHistory.slice(0,30);v44LootResultId=result.id;v44LootSelected=new Set(result.items.map(item=>item.instanceId));
  }

  function v44InventoryItem(item){
    let copy={...item,id:v44FreshId(),sourceLootId:item.sourceId||item.id,qty:Math.max(1,+item.qty||1),equipped:false};
    for(let key of ['instanceId','sourceId','categoryLabel','minLevel'])delete copy[key];
    return copy;
  }

  function v44KarmaModal(character){
    let record=v44KarmaRecord(character.id),band=v44KarmaBand(record.value);
    modal('Karma Değiştir',`<div class="v44-karma-modal"><div class="v44-modal-character"><span>${esc(character.name)}</span><b>${record.value>0?'+':''}${record.value} • ${esc(band.label)}</b></div><label>Değişim puanı<input id="v44KarmaDelta" type="number" min="-100" max="100" step="1" value="0" inputmode="numeric"><small>Örnek: hırsızlık için −5, hayat kurtarmak için +15.</small></label><label>Neden<textarea id="v44KarmaReason" rows="3" placeholder="Masum tüccarın kesesini çaldı"></textarea></label><div class="v44-modal-preview" id="v44KarmaPreview">Yeni değer: ${record.value>0?'+':''}${record.value}</div><button id="v44ConfirmKarma" data-character="${esc(character.id)}" class="primary">Kaydet</button></div>`);
  }

  function v44GiveModal(items){
    modal('Ganimeti Karaktere Ver',`<div class="v44-give-modal"><p><b>${items.length}</b> farklı eşya kaydı bütün açıklama ve bonus alanlarıyla kopyalanacak.</p><label>Karakter<select id="v44LootCharacter">${(state.characters||[]).map(character=>`<option value="${esc(character.id)}">${esc(character.name)}</option>`).join('')}</select></label><div class="v44-give-summary">${items.map(item=>`<span>${esc(item.name)} ×${Math.max(1,+item.qty||1)} ${v44Rarity(item)}</span>`).join('')}</div><p class="muted">Üretilen para bu düğmeyle eklenmez; Kasa ekranından hedef keseye ekleyebilirsin.</p><button id="v44ConfirmLootGive" class="primary">Eşyaları Ver</button></div>`);
  }

  document.addEventListener('input',event=>{
    if(event.target.id==='v44KarmaSearch'){v44KarmaQuery=event.target.value;v44RefreshKarmaRules()}
    if(event.target.id==='v44CatalogSearch'){v44LootUi.query=event.target.value;v44RefreshCatalog()}
    if(event.target.id==='v44KarmaDelta'){let character=(state.characters||[]).find(row=>String(row.id)===String($('#v44ConfirmKarma')?.dataset.character)),record=character&&v44KarmaRecord(character.id),delta=Math.trunc(+event.target.value||0),preview=$('#v44KarmaPreview');if(preview&&record)preview.textContent=`Yeni değer: ${v44Clamp(record.value+delta,-100,100)>0?'+':''}${v44Clamp(record.value+delta,-100,100)}`}
  });

  document.addEventListener('change',event=>{
    if(event.target.id==='v44KarmaSign'){v44KarmaSign=event.target.value;v44RefreshKarmaRules()}
    if(event.target.id==='v44KarmaCategory'){v44KarmaCategory=event.target.value;v44RefreshKarmaRules()}
    if(event.target.id==='v44CatalogTheme'){v44LootUi.catalogTheme=event.target.value;v44RefreshCatalog()}
    if(event.target.id==='v44CatalogRarity'){v44LootUi.catalogRarity=event.target.value;v44RefreshCatalog()}
    if(event.target.id==='v44CatalogCategory'){v44LootUi.catalogCategory=event.target.value;v44RefreshCatalog()}
    if(event.target.matches('[data-v44-loot-select]')){event.target.checked?v44LootSelected.add(event.target.dataset.v44LootSelect):v44LootSelected.delete(event.target.dataset.v44LootSelect);let actions=document.querySelector('.v44-result-actions');if(actions){let count=v44SelectedResultItems().length;actions.querySelector('span b').textContent=count;actions.querySelectorAll('button').forEach(button=>button.disabled=!count)}}
    if(['v44LootLevel','v44LootContainer','v44LootTheme','v44LootQuality','v44LootRarity'].includes(event.target.id)){
      v44ReadLootControls();
      if(event.target.id==='v44LootContainer'){let container=V44_LOOT_CONTAINERS[v44LootUi.container],box=$('#v44ContainerRule');if(box)box.innerHTML=`<b>${container.icon} ${esc(container.label)}</b><p>${esc(container.rule)}</p>`}
    }
  });

  document.addEventListener('click',async event=>{
    let button=event.target.closest('button');if(!button)return;
    if(button.dataset.v44KarmaCharacter){v44KarmaCharacter=button.dataset.v44KarmaCharacter;render();return}
    if(button.dataset.v44KarmaQuick){let [id,delta]=button.dataset.v44KarmaQuick.split('|'),character=(state.characters||[]).find(row=>String(row.id)===String(id));if(!character)return;v44AdjustKarma(id,+delta,+delta>0?'DM hızlı iyilik ayarı':'DM hızlı kötülük ayarı','quick');save();render();return}
    if(button.dataset.v44KarmaCustom){let character=(state.characters||[]).find(row=>String(row.id)===String(button.dataset.v44KarmaCustom));if(character)v44KarmaModal(character);return}
    if(button.id==='v44ConfirmKarma'){let character=(state.characters||[]).find(row=>String(row.id)===String(button.dataset.character)),delta=Math.trunc(+($('#v44KarmaDelta')?.value||0)),reason=$('#v44KarmaReason')?.value?.trim();if(!character)return;if(!delta)return alert('Sıfırdan farklı bir puan yaz.');if(!reason)return alert('Geçmişte anlaşılması için kısa bir neden yaz.');v44AdjustKarma(character.id,delta,reason,'manual');save();$('#modal').close();render();return}
    if(button.dataset.v44KarmaRule){let rule=V44_KARMA_RULES.find(row=>row.id===button.dataset.v44KarmaRule),character=v44SelectedCharacter();if(!rule||!character||!rule.value)return;v44AdjustKarma(character.id,rule.value,rule.name,`rule:${rule.id}`);save();render();return}
    if(button.dataset.v44KarmaUndo){let character=(state.characters||[]).find(row=>String(row.id)===String(button.dataset.v44KarmaUndo));if(!character||!v44KarmaRecord(character.id).history.length)return;if(!confirm(`${character.name} için son karma işlemi geri alınsın mı?`))return;v44UndoKarma(character.id);save();render();return}
    if(button.dataset.v44KarmaReset){let character=(state.characters||[]).find(row=>String(row.id)===String(button.dataset.v44KarmaReset));if(!character)return;let record=v44KarmaRecord(character.id);if(!record.value||!confirm(`${character.name} karması 0 (Nötr) yapılsın mı? Geçmişe kayıt eklenir.`))return;v44AdjustKarma(character.id,-record.value,'DM karmayı nötre getirdi','reset');save();render();return}

    if(button.id==='v44GenerateLoot'){v44ReadLootControls();let result=v44GenerateLoot(v44LootUi);v44StoreResult(result);save();render();toast(`${result.summary} üretildi`);return}
    if(button.dataset.v44SelectAll!=null){let all=button.dataset.v44SelectAll==='1';v44LootSelected=new Set(all?v44ResultItems().map(item=>item.instanceId):[]);render();return}
    if(button.dataset.v44LootLoad){v44LootResultId=button.dataset.v44LootLoad;v44LootSelected=new Set(v44ResultItems().map(item=>item.instanceId));render();return}
    if(button.dataset.v44LootDelete){let index=state.v44LootHistory.findIndex(row=>row.id===button.dataset.v44LootDelete);if(index<0)return;state.v44LootHistory.splice(index,1);if(v44LootResultId===button.dataset.v44LootDelete)v44LootResultId=state.v44LootHistory[0]?.id||'';v44LootSelected=new Set(v44ResultItems().map(item=>item.instanceId));save();render();return}
    if(button.id==='v44ClearLootHistory'){if(!confirm('Son 30 ganimet sonucu temizlensin mi? Karakterlere verilmiş veya yere bırakılmış eşyalar silinmez.'))return;state.v44LootHistory=[];v44LootResultId='';v44LootSelected.clear();save();render();return}
    if(button.dataset.v44CatalogAdd){let source=V44_LOOT_CATALOG.find(item=>item.id===button.dataset.v44CatalogAdd);if(!source)return;let result=v44Result();if(!result){result=v44GenerateLoot({...v44LootUi,container:'chest'});result.items=[];result.coins={pp:0,gp:0,sp:0,cp:0,totalCopper:0};result.summary='Elle seçilen ganimet';v44StoreResult(result)}let item={...source,sourceId:source.id,instanceId:`loot-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,qty:1};result.items.push(item);result.summary=`${result.items.length} elle seçilmiş eşya${result.coins.totalCopper?' + para':''}`;v44LootSelected.add(item.instanceId);save();render();toast(`${source.name} sonuca eklendi`);return}
    if(button.hasAttribute('data-v44-loot-ground')){let items=v44SelectedResultItems();if(!items.length)return;if(!confirm(`${items.length} eşya yerdeki ortak alana kopyalansın mı?`))return;state.groundLoot??=[];for(let item of items){let copy=v44InventoryItem(item);copy.groundId=v44FreshId();state.groundLoot.push(copy)}save();render();toast(`${items.length} eşya yere bırakıldı`);return}
    if(button.hasAttribute('data-v44-loot-give')){let items=v44SelectedResultItems();if(items.length)v44GiveModal(items);return}
    if(button.id==='v44ConfirmLootGive'){let character=(state.characters||[]).find(row=>String(row.id)===String($('#v44LootCharacter')?.value)),items=v44SelectedResultItems();if(!character||!items.length)return alert('Karakter veya eşya seçimi bulunamadı.');character.inventory??=[];for(let item of items)character.inventory.push(v44InventoryItem(item));save();$('#modal').close();render();toast(`${items.length} eşya ${character.name} envanterine verildi`);return}
  });

  function v44InstallNav(){
    if(!dmNav.some(row=>row[0]==='karma')){let partyIndex=dmNav.findIndex(row=>row[0]==='party');dmNav.splice(partyIndex<0?dmNav.length:partyIndex+1,0,['karma','☯','Karma'])}
    if(!dmNav.some(row=>row[0]==='lootgen')){let marketIndex=dmNav.findIndex(row=>row[0]==='market');dmNav.splice(marketIndex<0?dmNav.length:marketIndex+1,0,['lootgen','▤','Ganimet Üretici'])}
  }
  v44InstallNav();
  dmPages.karma=v44KarmaPage;
  dmPages.lootgen=v44LootPage;
  window.v44Ensure=v44Ensure;
  window.v44KarmaBand=v44KarmaBand;
  window.v44AdjustKarma=v44AdjustKarma;
  window.v44UndoKarma=v44UndoKarma;
  window.v44InventoryItem=v44InventoryItem;
  if(current){v44Ensure();render()}
})();
