/* v47: 2014 SRD spellbook and spell-page loot integration. */
(()=>{
  'use strict';

  const v47Fold=value=>String(value??'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const v47Ability={Bard:'CHA',Cleric:'WIS',Druid:'WIS',Paladin:'CHA',Ranger:'WIS',Sorcerer:'CHA',Warlock:'CHA',Wizard:'INT'};
  const v47SchoolLabels=window.V47_SPELL_SCHOOLS||{};
  const v47ScrollTable=window.V47_SCROLL_TABLE||{};
  const v48ComponentBySpell=new Map((window.V44_LOOT_CATALOG||[]).filter(item=>item.lootKind==='spellComponent'&&item.linkedSpellId).map(item=>[item.linkedSpellId,item]));
  let v47Scope='';
  let v47SearchTimer=null;
  let v47Ui={query:'',level:'all',className:'all',school:'all',casting:'all',concentration:'all',ritual:'all',limit:48};

  function v47Spells(){return Array.isArray(window.V47_SPELLS)?window.V47_SPELLS:[]}
  function v47SyncScope(){
    let scope=`${current?.id||''}|${auth?.id||''}`;
    if(scope!==v47Scope){v47Scope=scope;v47Ui={query:'',level:'all',className:'all',school:'all',casting:'all',concentration:'all',ritual:'all',limit:48}}
  }
  function v47LevelLabel(level){return +level===0?'Cantrip':`${level}. seviye`}
  function v47CastingKind(value){let text=String(value||'').toLowerCase();if(text.includes('bonus'))return 'bonus';if(text.includes('reaction'))return 'reaction';if(text.includes('action'))return 'action';return 'long'}
  function v47CastingLabel(value){
    const labels={'1 action':'1 Action','1 bonus action':'1 Bonus Action','1 reaction':'1 Reaction','1 minute':'1 dakika','10 minutes':'10 dakika','1 hour':'1 saat','8 hours':'8 saat','12 hours':'12 saat','24 hours':'24 saat'};
    return labels[value]||value||'Özel';
  }
  function v47RangeLabel(value){
    const labels={Self:'Kendin',Touch:'Dokunma',Sight:'Görüş alanı',Special:'Özel',Unlimited:'Sınırsız'};
    return labels[value]||String(value||'Özel').replace(/ feet?/i,' ft').replace(/ miles?/i,' mil');
  }
  function v47DurationLabel(value){
    const labels={Instantaneous:'Anlık',Special:'Özel','Until dispelled':'Dispel edilene kadar','1 round':'1 tur','Up to 1 round':'En fazla 1 tur','1 minute':'1 dakika','Up to 1 minute':'En fazla 1 dakika','10 minutes':'10 dakika','Up to 10 minutes':'En fazla 10 dakika','1 hour':'1 saat','Up to 1 hour':'En fazla 1 saat','Up to 2 hours':'En fazla 2 saat','8 hours':'8 saat','Up to 8 hours':'En fazla 8 saat','24 hours':'24 saat','Up to 24 hours':'En fazla 24 saat','7 days':'7 gün','10 days':'10 gün','30 days':'30 gün'};
    return labels[value]||value||'Özel';
  }
  function v47ActionLabel(kind){return {action:'Action',bonus:'Bonus Action',reaction:'Reaction',long:'Uzun kullanım'}[kind]||'Özel'}
  function v47Short(text,max=210){let value=String(text||'').replace(/\s+/g,' ').trim();return value.length>max?value.slice(0,max-1).trimEnd()+'…':value}
  function v47Inline(text){return esc(text).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')}
  function v47Paragraphs(text){
    return String(text||'').split(/\n\s*\n/).filter(Boolean).map(block=>{
      let lines=block.split('\n').map(line=>line.trim()).filter(Boolean),tableLines=lines.filter(line=>line.startsWith('|'));
      if(tableLines.length>=2){
        let rows=tableLines.filter(line=>!/^\|?\s*:?-{3}/.test(line)).map(line=>line.replace(/^\||\|$/g,'').split('|').map(cell=>cell.trim()));
        if(rows.length){let head=rows.shift();return `<div class="v47-table-wrap"><table><thead><tr>${head.map(cell=>`<th>${v47Inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(cell=>`<td>${v47Inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
      }
      if(lines.length&&lines.every(line=>/^[-*]\s+/.test(line)))return `<ul>${lines.map(line=>`<li>${v47Inline(line.replace(/^[-*]\s+/,''))}</li>`).join('')}</ul>`;
      return `<p>${v47Inline(block).replace(/\n/g,'<br>')}</p>`;
    }).join('');
  }
  function v47Dice(spell){return [...new Set(`${spell.description||''} ${spell.higher||''}`.match(/\b(?:\d+)?d(?:4|6|8|10|12|20|100)(?:\s*[+−-]\s*\d+)?\b/gi)||[])]}
  function v47Resolution(spell){
    let rows=[];
    if(spell.attackType)rows.push(`${spell.attackType==='melee'?'Yakın':'Menzilli'} büyü saldırısı: d20 + proficiency + büyü statı; hedefin AC’sine karşı.`);
    if((spell.saves||[]).length)rows.push(`Hedef açıklamadaki aşamada ${spell.saves.join('/')} saving throw atar; senin Spell Save DC’ne karşı.`);
    if(!rows.length)rows.push('Saldırı/save gerekmiyorsa hedef seçilir ve açıklamadaki etki doğrudan uygulanır.');
    return rows.join(' ');
  }
  function v47ClassStats(spell){return spell.classes.map(name=>`${name}: ${v47Ability[name]||'özel'}`).join(' • ')}
  function v47Components(spell){
    let bits=(spell.components||[]).map(code=>({V:'V — sözlü ifade',S:'S — el hareketi',M:'M — materyal'}[code]||code));
    let kit=v48ComponentBySpell.get(spell.id),rule=kit?`${kit.componentCostGp?`${(+kit.componentCostGp).toLocaleString('tr-TR')} GP değer şartı • focus/pouch yerine geçmez`:'GP değeri yok • uygun focus/pouch bunun yerine kullanılabilir'} • ${kit.componentConsumed?'büyü materyali tüketir':'materyal elde kalır'}`:'';
    return `${bits.join(' • ')||'Komponent yok'}${spell.materialTr?`<small><b>Materyal:</b> ${esc(spell.materialTr)}</small>`:''}${kit?`<small class="v48-component-link"><b>Ganimet kaydı:</b> ${esc(kit.name)}<em>${esc(rule)}</em></small>`:''}`;
  }
  function v47PracticalSteps(spell){
    let dice=v47Dice(spell),steps=[];
    steps.push(spell.level===0?'<b>Kaynak:</b> Cantrip; spell slot harcamaz.':`<b>Kaynak:</b> En az ${spell.level}. seviye spell slot harca. Daha yüksek slot kullanırsan “Yüksek slot” satırını uygula.`);
    steps.push(`<b>Zaman:</b> ${esc(v47CastingLabel(spell.castingTime))}. ${v47CastingKind(spell.castingTime)==='reaction'?'Reaction tetikleyicisi büyü açıklamasında gerçekleşmeden kullanılamaz.':'Turundaki uygun eylem türünü harcar.'}`);
    steps.push(`<b>Hedef ve zar:</b> ${esc(v47Resolution(spell))}`);
    steps.push(`<b>Etki:</b> ${dice.length?`Metinde geçen zarlar: ${dice.map(esc).join(', ')}. Zarları yalnız açıklamanın söylediği anda at.`:'Ayrı bir hasar/iyileştirme zarı görünmüyor; açıklamadaki sayısal ve koşullu etkiyi uygula.'}`);
    steps.push(`<b>Süre takibi:</b> ${esc(v47DurationLabel(spell.duration))}.${spell.concentration?' Aynı anda yalnız bir concentration büyüsü tutulur; hasar alınca CON save DC = 10 veya hasarın yarısı (hangisi yüksekse).':' Concentration işareti yok; başka bir concentration büyüsü bunu kendiliğinden bitirmez.'}`);
    if(spell.ritual)steps.push('<b>Ritüel:</b> Class özelliğin izin veriyorsa 10 dakika fazla sürer ve slot harcamaz; aksi hâlde normal kullanım gerekir.');
    return `<ol>${steps.map(step=>`<li>${step}</li>`).join('')}</ol>`;
  }
  function v47SpellCard(spell){
    let action=v47CastingKind(spell.castingTime),dice=v47Dice(spell),areaNames={sphere:'küre',cone:'koni',cylinder:'silindir',line:'çizgi',cube:'küp'},area=spell.area?`${spell.area.size} ft ${areaNames[spell.area.type]||spell.area.type}`:'Tek hedef / açıklamaya göre',scroll=v47ScrollTable[spell.level]||v47ScrollTable[0]||{};
    return `<details class="v47-spell-card" id="v47-spell-${esc(spell.id)}">
      <summary>
        <span class="v47-level ${spell.level===0?'cantrip':''}">${spell.level===0?'C':spell.level}</span>
        <span class="v47-spell-title"><b>${esc(spell.name)}</b><small>${esc(spell.nameTr||spell.name)} • ${esc(spell.schoolTr||v47SchoolLabels[spell.school]||spell.school)}</small><em>${esc(v47Short(spell.description,150))}</em></span>
        <span class="v47-summary-tags"><i>${esc(v47ActionLabel(action))}</i>${spell.concentration?'<i class="warn">Concentration</i>':''}${spell.ritual?'<i>Ritüel</i>':''}</span><strong>＋</strong>
      </summary>
      <div class="v47-spell-body">
        <div class="v47-facts">
          <span><small>Seviye / Okul</small><b>${esc(v47LevelLabel(spell.level))} • ${esc(spell.schoolTr||spell.school)}</b></span>
          <span><small>Kullanım</small><b>${esc(v47CastingLabel(spell.castingTime))}</b></span>
          <span><small>Menzil / Alan</small><b>${esc(v47RangeLabel(spell.range))} • ${esc(area)}</b></span>
          <span><small>Süre</small><b>${esc(v47DurationLabel(spell.duration))}</b></span>
          <span><small>Çözüm</small><b>${spell.attackType?`${spell.attackType==='melee'?'Yakın':'Menzilli'} spell attack`:(spell.saves||[]).length?`${spell.saves.join('/')} save`:'Açıklamaya göre'}</b></span>
          <span><small>Zarlar</small><b>${dice.length?esc(dice.join(', ')):'Sabit / koşullu etki'}</b></span>
        </div>
        <div class="v47-spell-columns">
          <section><h4>Masada nasıl kullanılır?</h4>${v47PracticalSteps(spell)}</section>
          <section><h4>Kim kullanır?</h4><p><b>Class listesi:</b> ${esc(spell.classes.join(', '))}</p><p><b>Büyü statı:</b> ${esc(v47ClassStats(spell))}</p><p class="v47-components">${v47Components(spell)}</p></section>
        </div>
        <section class="v47-scroll-callout"><div><span>▤</span><p><b>Bu büyünün ganimet sayfası</b><small>${esc(v47LevelLabel(spell.level))} • ${esc(scroll.rarityLabel||'Parşömen')} • Scroll save DC ${scroll.dc??'—'} • saldırı +${scroll.attack??'—'}</small></p></div><p>Büyü class listende değilse yazıyı kullanamazsın. Normalde atabildiğinden yüksek seviyedeyse d20 + büyü statı modifier atarsın; proficiency eklenmez, DC ${10+spell.level}. Komponent gerekmez; kullanım denemesinde sayfa yok olur.</p></section>
        <details class="v47-rule-text"><summary>${esc(spell.name)} — tam Türkçe açıklama <i>＋</i></summary><div>${v47Paragraphs(spell.description)}${spell.higher?`<h4>Daha yüksek slotla</h4>${v47Paragraphs(spell.higher)}`:''}</div></details>
        <details class="v47-rule-text english"><summary>${esc(spell.name)} — İngilizce SRD metni <i>＋</i></summary><div>${v47Paragraphs(spell.sourceText)}${spell.higherSource?`<h4>At Higher Levels</h4>${v47Paragraphs(spell.higherSource)}`:''}</div></details>
      </div>
    </details>`;
  }
  function v47Filtered(){
    let query=v47Fold(v47Ui.query.trim());
    return v47Spells().filter(spell=>(v47Ui.level==='all'||String(spell.level)===v47Ui.level)&&(v47Ui.className==='all'||spell.classes.includes(v47Ui.className))&&(v47Ui.school==='all'||spell.school===v47Ui.school)&&(v47Ui.casting==='all'||v47CastingKind(spell.castingTime)===v47Ui.casting)&&(v47Ui.concentration==='all'||spell.concentration===(v47Ui.concentration==='yes'))&&(v47Ui.ritual==='all'||spell.ritual===(v47Ui.ritual==='yes'))&&(!query||v47Fold(`${spell.name} ${spell.nameTr} ${spell.school} ${spell.schoolTr} ${spell.classes.join(' ')} ${spell.description} ${spell.higher} ${spell.sourceText}`).includes(query))).sort((a,b)=>a.level-b.level||String(a.name).localeCompare(String(b.name),'en'));
  }
  function v47SpellRows(){
    let filtered=v47Filtered(),visible=filtered.slice(0,v47Ui.limit);
    return `${visible.map(v47SpellCard).join('')||'<div class="card empty">Bu filtrelerde büyü bulunamadı.</div>'}${filtered.length>visible.length?`<button id="v47MoreSpells" class="ghost v47-more">${Math.min(48,filtered.length-visible.length)} büyü daha göster • ${visible.length}/${filtered.length}</button>`:''}`;
  }
  function v47SpellbookPage(){
    v47SyncScope();let spells=v47Spells(),classes=[...new Set(spells.flatMap(spell=>spell.classes))].sort(),schools=[...new Set(spells.map(spell=>spell.school))].sort(),filtered=v47Filtered();
    return `<section class="v47-spellbook">
      <div class="v47-spell-hero"><div><span class="v26-kicker">2014 SRD 5.1 • CANTRIP–9. SEVİYE</span><h2>Büyü Kitabı</h2><p>${spells.length} büyünün masada kullanım adımları, zar/save formülü, menzili, komponenti, concentration ve yüksek slot etkisi tek yerde.</p><div class="toolbar"><button class="primary" data-page="${current?.role==='dm'?'party':'skills'}">Karakter Büyüleri</button><button class="ghost" data-v47-reset>Filtreleri Temizle</button></div></div><div class="v47-hero-count"><b>${spells.length}</b><span>2014 SRD büyüsü</span><small>Loot havuzunda aynı sayıda gerçek büyü sayfası</small></div></div>
      <div class="v47-rule-grid">
        <article><span>①</span><div><b>Spell attack</b><p>d20 + proficiency + büyü statı; hedef AC.</p></div></article>
        <article><span>②</span><div><b>Spell Save DC</b><p>8 + proficiency + büyü statı. Save’i hedef atar.</p></div></article>
        <article><span>③</span><div><b>Concentration</b><p>Tek büyü. Hasarda CON save DC 10 veya hasarın yarısı.</p></div></article>
        <article><span>④</span><div><b>Büyü Sayfası</b><p>Class listesi şart; yüksek seviye için d20 + büyü statı (proficiency yok), DC 10 + seviye.</p></div></article>
      </div>
      <details class="card v47-basics"><summary><span><b>Büyü kullanımını 30 saniyede oku</b><small>Action, slot, hedef, save, komponent ve ritüel sırası</small></span><i>＋</i></summary><div><ol><li><b>Büyüyü kullanabiliyor musun?</b> Büyü class listende, bilinen/hazırlanmış büyülerinde olmalı; cantrip değilse uygun seviyede slot gerekir.</li><li><b>Zamanı öde:</b> Action, Bonus Action veya Reaction satırını uygula. Reaction yalnız tetikleyicisi oluşunca kullanılır.</li><li><b>Hedefi doğrula:</b> menzil, görüş, hedef türü ve alan biçimini açıklamadan kontrol et.</li><li><b>Çöz:</b> “spell attack” diyorsa sen d20 atarsın; “saving throw” diyorsa hedef senin DC’ne karşı ilgili save’i atar.</li><li><b>Etkiyi kaydet:</b> hasar/iyileştirme zarını, condition’ı, süreyi ve concentration’ı takip et.</li></ol><p><b>Komponent:</b> V konuşabilmeyi, S el hareketini, M materyal veya focus gereksinimini gösterir. Ücret yazan veya tüketilen materyal focus ile geçilemez.</p><p><b>Bonus Action büyüsü:</b> Aynı turda başka büyü kullanacaksan 2014 kuralındaki cantrip/action sınırını kontrol et. Ritüel, izin veren class özelliğiyle 10 dakika ekler ve slot harcamaz.</p></div></details>
      <section class="card v47-controls"><label class="v47-search"><span>⌕</span><input id="v47SpellSearch" class="input" value="${esc(v47Ui.query)}" placeholder="Büyü adı, etki, hasar, save veya kelime ara…" autocomplete="off"></label><div class="v47-selects"><select id="v47SpellLevel"><option value="all">Tüm seviyeler</option>${Array.from({length:10},(_,level)=>`<option value="${level}" ${v47Ui.level===String(level)?'selected':''}>${v47LevelLabel(level)}</option>`).join('')}</select><select id="v47SpellClass"><option value="all">Tüm classlar</option>${classes.map(name=>`<option ${v47Ui.className===name?'selected':''}>${esc(name)}</option>`).join('')}</select><select id="v47SpellSchool"><option value="all">Tüm okullar</option>${schools.map(name=>`<option value="${esc(name)}" ${v47Ui.school===name?'selected':''}>${esc(v47SchoolLabels[name]||name)}</option>`).join('')}</select><select id="v47SpellCasting"><option value="all">Tüm kullanım süreleri</option>${[['action','Action'],['bonus','Bonus Action'],['reaction','Reaction'],['long','1 dakika+']].map(([value,label])=>`<option value="${value}" ${v47Ui.casting===value?'selected':''}>${label}</option>`).join('')}</select><select id="v47SpellConcentration"><option value="all">Concentration: tümü</option><option value="yes" ${v47Ui.concentration==='yes'?'selected':''}>Concentration gerekir</option><option value="no" ${v47Ui.concentration==='no'?'selected':''}>Concentration gerekmez</option></select><select id="v47SpellRitual"><option value="all">Ritüel: tümü</option><option value="yes" ${v47Ui.ritual==='yes'?'selected':''}>Ritüel</option><option value="no" ${v47Ui.ritual==='no'?'selected':''}>Ritüel değil</option></select></div><div class="v47-filter-foot"><span><b id="v47SpellCount">${filtered.length}</b> / ${spells.length} büyü</span><small>Kartlar kapalı başlar; büyüye basınca kullanım ve tam açıklama açılır.</small></div></section>
      <div id="v47SpellList" class="v47-spell-list">${v47SpellRows()}</div>
      <footer class="v47-attribution">Kural kataloğu 2014 <a href="https://dnd.wizards.com/resources/systems-reference-document" target="_blank" rel="noopener">SRD 5.1</a> içeriğine dayanır ve CC BY 4.0 kapsamında kullanılır. Türkçe metin masa kullanımını kolaylaştıran çeviridir; tereddütte İngilizce büyü adını kaynakta kontrol et.</footer>
    </section>`;
  }
  function v47Refresh(resetLimit=true){
    if(resetLimit)v47Ui.limit=48;
    let list=$('#v47SpellList');if(list)list.innerHTML=v47SpellRows();
    let count=$('#v47SpellCount');if(count)count.textContent=v47Filtered().length;
  }
  function v47InstallNav(nav){
    if(nav.some(row=>row[0]==='spellbook'))return;
    let guideIndex=nav.findIndex(row=>row[0]==='guide');
    nav.splice(guideIndex<0?nav.length:guideIndex,0,['spellbook','✵','Büyü Kitabı']);
  }

  v47InstallNav(dmNav);v47InstallNav(playerNav);
  dmPages.spellbook=v47SpellbookPage;playerPages.spellbook=v47SpellbookPage;
  if(typeof V27_PAGE_HELP!=='undefined')V27_PAGE_HELP.spellbook='2014 SRD büyülerini seviye, class, okul, eylem, concentration ve ritüele göre ara; karta basınca masada kullanımını aç.';

  const v47DmGuideBase=dmPages.guide,v47PlayerGuideBase=playerPages.guide;
  const v47GuideWithSpells=base=>()=>String(base()).replace('<div class="v26-guide-tabs">','<div class="v26-guide-tabs"><button class="primary" data-page="spellbook">✵ Büyü Kitabı</button>');
  if(v47DmGuideBase)dmPages.guide=v47GuideWithSpells(v47DmGuideBase);
  if(v47PlayerGuideBase)playerPages.guide=v47GuideWithSpells(v47PlayerGuideBase);

  document.addEventListener('input',event=>{
    if(event.target.id!=='v47SpellSearch')return;
    v47Ui.query=event.target.value;clearTimeout(v47SearchTimer);v47SearchTimer=setTimeout(()=>v47Refresh(true),120);
  });
  document.addEventListener('change',event=>{
    const map={v47SpellLevel:'level',v47SpellClass:'className',v47SpellSchool:'school',v47SpellCasting:'casting',v47SpellConcentration:'concentration',v47SpellRitual:'ritual'};
    let key=map[event.target.id];if(!key)return;v47Ui[key]=event.target.value;v47Refresh(true);
  });
  document.addEventListener('click',event=>{
    let button=event.target.closest('button');if(!button)return;
    if(button.id==='v47MoreSpells'){v47Ui.limit+=48;v47Refresh(false);return}
    if(button.hasAttribute('data-v47-reset')){v47Ui={...v47Ui,query:'',level:'all',className:'all',school:'all',casting:'all',concentration:'all',ritual:'all',limit:48};if(page==='spellbook')render()}
  });

  window.v47SpellbookPage=v47SpellbookPage;
  window.v47FilteredSpells=v47Filtered;
  if(current)render();
})();
