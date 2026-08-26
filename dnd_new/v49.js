/* v49: searchable 2014 deity encyclopedia. */
(()=>{
  'use strict';

  const v49Fold=value=>String(value??'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
  const v49DomainIcons={Bilgi:'⌘',Yaşam:'✚',Işık:'☀',Doğa:'❧',Fırtına:'ϟ',Hile:'◈',Savaş:'⚔',Ölüm:'☠'};
  const v49DomainText={
    Bilgi:'Araştırma, kehanet, dil, hafıza ve sır çözme.',
    Yaşam:'İyileştirme, koruma, dayanıklılık ve topluluğu ayakta tutma.',
    Işık:'Aydınlık, umut, görüş, ateş ve radiant baskı.',
    Doğa:'Bitkiler, hayvanlar, elementler ve vahşi arazi.',
    Fırtına:'Şimşek, gök gürültüsü, rüzgâr, deniz ve sert hava.',
    Hile:'Gizlilik, illüzyon, aldatma ve taktik şaşırtma.',
    Savaş:'Silah kullanımı, ön cephe, savaş desteği ve cesaret.',
    Ölüm:'Ölüm ve necrotic teması; 2014 DMG alanıdır, oyuncu için DM onayı gerekir.'
  };
  let v49Scope='';
  let v49SearchTimer=null;
  const v49SearchCache=new Map();
  let v49Ui={query:'',pantheon:'all',alignment:'all',domain:'all',limit:36};

  function v49Deities(){return Array.isArray(window.V49_DEITIES)?window.V49_DEITIES:[]}
  function v49SyncScope(){
    const scope=`${current?.id||''}|${auth?.id||''}`;
    if(scope!==v49Scope){v49Scope=scope;v49Ui={query:'',pantheon:'all',alignment:'all',domain:'all',limit:36}}
  }
  function v49AlignmentTone(alignment){return alignment?.endsWith('G')?'good':alignment?.endsWith('E')?'evil':'neutral'}
  function v49DomainPills(domains){return domains.map(domain=>`<span class="v49-domain">${v49DomainIcons[domain]||'✦'} ${esc(domain)}</span>`).join('')}
  function v49Short(value,max=160){const text=String(value||'').replace(/\s+/g,' ').trim();return text.length>max?`${text.slice(0,max-1).trimEnd()}…`:text}
  function v49SearchText(deity){
    if(!v49SearchCache.has(deity.id))v49SearchCache.set(deity.id,v49Fold(`${deity.name} ${deity.pantheon} ${deity.alignment} ${deity.alignmentLabel} ${deity.domains.join(' ')} ${deity.portfolio} ${deity.symbol} ${deity.description} ${deity.worshippers} ${deity.tenets.join(' ')} ${deity.roleplay} ${deity.offering} ${deity.quest}`));
    return v49SearchCache.get(deity.id);
  }
  function v49Filtered(){
    const needle=v49Fold(v49Ui.query.trim());
    return v49Deities().filter(deity=>(v49Ui.pantheon==='all'||deity.pantheon===v49Ui.pantheon)&&(v49Ui.alignment==='all'||deity.alignment===v49Ui.alignment)&&(v49Ui.domain==='all'||deity.domains.includes(v49Ui.domain))&&(!needle||v49SearchText(deity).includes(needle))).sort((a,b)=>a.pantheon.localeCompare(b.pantheon,'tr')||a.name.localeCompare(b.name,'tr'));
  }
  function v49DeityCard(deity){
    const deathWarning=deity.deathDomain?'<p class="v49-warning"><b>Ölüm Domaini:</b> 2014 DMG seçeneğidir; çoğu kullanım NPC/kötü kült içindir. Oyuncu karakter için DM onayı al.</p>':'';
    const historyWarning=deity.historical?'<p class="v49-history-note">Bu kayıt tarih dersi değil, 2014 kitabındaki fantastik masa yorumudur.</p>':'';
    return `<details class="v49-deity-card" id="v49-deity-${esc(deity.id)}">
      <summary>
        <span class="v49-sigil">${v49DomainIcons[deity.domains[0]]||'✦'}</span>
        <span class="v49-deity-title"><b>${esc(deity.name)}</b><small>${esc(deity.pantheon)} • ${esc(deity.alignment)} / ${esc(deity.alignmentLabel)}</small><em>${esc(v49Short(deity.portfolio))}</em></span>
        <span class="v49-summary-domains">${v49DomainPills(deity.domains)}</span><strong>＋</strong>
      </summary>
      <div class="v49-deity-body">
        <div class="v49-facts">
          <span><small>Pantheon</small><b>${esc(deity.pantheon)}</b></span>
          <span><small>Alignment</small><b class="${v49AlignmentTone(deity.alignment)}">${esc(deity.alignment)} — ${esc(deity.alignmentLabel)}</b></span>
          <span><small>Önerilen Domain</small><b>${esc(deity.domains.join(', '))}</b></span>
          <span><small>Kutsal Sembol</small><b>${esc(deity.symbol)}</b></span>
        </div>
        <div class="v49-columns">
          <section><h4>Ne temsil eder?</h4><p>${esc(deity.description)}</p><p><b>Etki alanı:</b> ${esc(deity.portfolio)}.</p>${historyWarning}</section>
          <section><h4>Kimler tapar?</h4><p>${esc(deity.worshippers)}</p><p><b>Adak / ibadet fikri:</b> ${esc(deity.offering)}</p></section>
        </div>
        <section class="v49-play"><h4>Karakteri böyle oyna</h4><p>${esc(deity.roleplay)}</p><ul>${deity.tenets.map(tenet=>`<li>${esc(tenet)}</li>`).join('')}</ul></section>
        <section class="v49-cleric"><div><span>2014</span><h4>Cleric ve mekanik karşılığı</h4></div><p>${esc(deity.cleric)}</p>${deathWarning}</section>
        <section class="v49-hook"><span>DM KANCASI</span><p>${esc(deity.quest)}</p></section>
        <footer>${esc(deity.source)} • Özgün Türkçe masa özeti</footer>
      </div>
    </details>`;
  }
  function v49Rows(){
    const filtered=v49Filtered(),visible=filtered.slice(0,v49Ui.limit);
    return `${visible.map(v49DeityCard).join('')||'<div class="card empty">Bu filtrelerde tanrı bulunamadı.</div>'}${filtered.length>visible.length?`<button id="v49MoreDeities" class="ghost v49-more">${Math.min(36,filtered.length-visible.length)} tanrı daha göster • ${visible.length}/${filtered.length}</button>`:''}`;
  }
  function v49PantheonStrip(pantheons){
    return `<div class="v49-pantheon-strip"><button data-v49-pantheon="all" class="${v49Ui.pantheon==='all'?'active':''}"><b>${v49Deities().length}</b><span>Tümü</span></button>${pantheons.map(name=>{const count=v49Deities().filter(row=>row.pantheon===name).length;return `<button data-v49-pantheon="${esc(name)}" class="${v49Ui.pantheon===name?'active':''}"><b>${count}</b><span>${esc(name)}</span></button>`}).join('')}</div>`;
  }
  function v49DeityPage(){
    v49SyncScope();
    const deities=v49Deities(),pantheons=[...new Set(deities.map(row=>row.pantheon))],alignmentOrder=['LG','NG','CG','LN','N','CN','LE','NE','CE'],alignments=alignmentOrder.filter(code=>deities.some(row=>row.alignment===code)),domains=Object.keys(v49DomainText),filtered=v49Filtered();
    return `<section class="v49-deities">
      <div class="v49-hero"><div><span class="v26-kicker">2014 APPENDIX B • 6 PANTHEON GRUBU</span><h2>Tanrılar Ansiklopedisi</h2><p>${deities.length} tanrı için alignment, önerilen cleric domaini, kutsal sembol, takipçi profili, ibadet fikri, karakter yorumu ve DM görev kancası.</p><div class="toolbar"><button class="primary" data-page="${current?.role==='dm'?'party':'skills'}">Karakterlere Dön</button><button class="ghost" data-v49-reset>Filtreleri Temizle</button></div></div><div class="v49-hero-count"><b>${deities.length}</b><span>2014 tanrı kaydı</span><small>Uzun kartlar kapalı başlar</small></div></div>
      <div class="v49-rule-grid">
        <article><span>①</span><div><b>Otomatik bonus yok</b><p>Tanrı seçmek kendi başına STR, AC, proficiency veya zar bonusu vermez.</p></div></article>
        <article><span>②</span><div><b>Domain yol gösterir</b><p>Cleric mekaniğini tanrının adı değil, class seviyesi ve seçilen domain verir.</p></div></article>
        <article><span>③</span><div><b>Birden fazlasına dua edilebilir</b><p>Karakter gündelik ihtiyaca göre farklı tanrılara yakarabilir; özel rahip tek tanrıya bağlanabilir.</p></div></article>
        <article><span>④</span><div><b>DM’nin dünyası son söz</b><p>Hangi pantheonun var olduğunu, sembolleri ve kültlerin yorumunu DM belirler.</p></div></article>
      </div>
      <details class="card v49-basics"><summary><span><b>Tanrı seçimini 30 saniyede yap</b><small>Karakter fikrinden domain ve rol yapma kararına</small></span><i>＋</i></summary><div><ol><li><b>Evreni seç:</b> Önce DM’ye hangi pantheonların kampanyada bulunduğunu sor.</li><li><b>Karakterin değerini seç:</b> Meslekten çok hangi ideale bağlı olduğunu düşün; aynı meslek farklı tanrılara gidebilir.</li><li><b>Alignmentı karşılaştır:</b> Birebir aynı olman şartını DM belirler; çok uzak değerler sürekli ahlaki çatışma üretir.</li><li><b>Cleric isen domaini konuş:</b> Karttaki domainler 2014 Appendix B önerisidir. Seçtiğin subclass/domain class mekaniğini verir.</li><li><b>İnancı görünür yap:</b> Bir sembol, kısa dua, adak, yasak veya yemin seç; her sahnede vaaz vermek gerekmez.</li></ol><p><b>Önemli:</b> Paladin gücü 2014’te yemininden gelir; mutlaka bir tanrı seçmek zorunda değildir. Druid ve diğer karakterler de inançlı olabilir fakat tanrı adı onlara otomatik spell ya da stat vermez.</p></div></details>
      <section class="v49-domain-guide">${domains.map(domain=>`<article><span>${v49DomainIcons[domain]}</span><div><b>${domain}</b><p>${esc(v49DomainText[domain])}</p></div></article>`).join('')}</section>
      ${v49PantheonStrip(pantheons)}
      <section class="card v49-controls"><label class="v49-search"><span>⌕</span><input id="v49DeitySearch" class="input" value="${esc(v49Ui.query)}" placeholder="Tanrı, kavram, sembol, takipçi veya görev kancası ara…" autocomplete="off"></label><div class="v49-selects"><select id="v49DeityPantheon"><option value="all">Tüm pantheonlar</option>${pantheons.map(name=>`<option value="${esc(name)}" ${v49Ui.pantheon===name?'selected':''}>${esc(name)}</option>`).join('')}</select><select id="v49DeityAlignment"><option value="all">Tüm alignmentlar</option>${alignments.map(code=>{const row=deities.find(item=>item.alignment===code);return `<option value="${code}" ${v49Ui.alignment===code?'selected':''}>${code} — ${esc(row?.alignmentLabel||code)}</option>`}).join('')}</select><select id="v49DeityDomain"><option value="all">Tüm domainler</option>${domains.map(domain=>`<option value="${domain}" ${v49Ui.domain===domain?'selected':''}>${v49DomainIcons[domain]} ${domain}</option>`).join('')}</select></div><div class="v49-filter-foot"><span><b id="v49DeityCount">${filtered.length}</b> / ${deities.length} tanrı</span><small>Arama açıklama ve DM kancalarında da çalışır.</small></div></section>
      <div id="v49DeityList" class="v49-deity-list">${v49Rows()}</div>
      <footer class="v49-attribution">Tablo alanları 2014 <a href="https://www.dndbeyond.com/sources/dnd/basic-rules-2014/appendix-b-gods-of-the-multiverse" target="_blank" rel="noopener">Appendix B: Gods of the Multiverse</a> düzenine dayanır. Tarihsel pantheonlar gerçek din anlatısı değil, kitabın fantastik oyun yorumudur. Açıklama, ibadet ve görev kancaları bu masa için yazılmış özgün özetlerdir.</footer>
    </section>`;
  }
  function v49Refresh(resetLimit=true){
    if(resetLimit)v49Ui.limit=36;
    const list=$('#v49DeityList');if(list)list.innerHTML=v49Rows();
    const count=$('#v49DeityCount');if(count)count.textContent=v49Filtered().length;
    const select=$('#v49DeityPantheon');if(select)select.value=v49Ui.pantheon;
    document.querySelectorAll('[data-v49-pantheon]').forEach(button=>button.classList.toggle('active',button.dataset.v49Pantheon===v49Ui.pantheon));
  }
  function v49InstallNav(nav){
    if(nav.some(row=>row[0]==='deities'))return;
    const spellIndex=nav.findIndex(row=>row[0]==='spellbook'),guideIndex=nav.findIndex(row=>row[0]==='guide');
    nav.splice(spellIndex>=0?spellIndex:guideIndex>=0?guideIndex:nav.length,0,['deities','☀','Tanrılar']);
  }

  v49InstallNav(dmNav);v49InstallNav(playerNav);
  dmPages.deities=v49DeityPage;playerPages.deities=v49DeityPage;
  if(typeof V27_PAGE_HELP!=='undefined')V27_PAGE_HELP.deities='2014 tanrılarını pantheon, alignment ve domain ile ara; karta basınca inanç, cleric karşılığı ve DM görev kancasını aç.';

  const v49DmGuideBase=dmPages.guide,v49PlayerGuideBase=playerPages.guide;
  const v49GuideWithDeities=base=>()=>String(base()).replace('<div class="v26-guide-tabs">','<div class="v26-guide-tabs"><button class="primary" data-page="deities">☀ Tanrılar Ansiklopedisi</button>');
  if(v49DmGuideBase)dmPages.guide=v49GuideWithDeities(v49DmGuideBase);
  if(v49PlayerGuideBase)playerPages.guide=v49GuideWithDeities(v49PlayerGuideBase);

  document.addEventListener('input',event=>{
    if(event.target.id!=='v49DeitySearch')return;
    v49Ui.query=event.target.value;clearTimeout(v49SearchTimer);v49SearchTimer=setTimeout(()=>v49Refresh(true),120);
  });
  document.addEventListener('change',event=>{
    const map={v49DeityPantheon:'pantheon',v49DeityAlignment:'alignment',v49DeityDomain:'domain'};
    const key=map[event.target.id];if(!key)return;v49Ui[key]=event.target.value;v49Refresh(true);
  });
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.id==='v49MoreDeities'){v49Ui.limit+=36;v49Refresh(false);return}
    if(button.hasAttribute('data-v49-pantheon')){v49Ui.pantheon=button.dataset.v49Pantheon;v49Refresh(true);return}
    if(button.hasAttribute('data-v49-reset')){v49Ui={...v49Ui,query:'',pantheon:'all',alignment:'all',domain:'all',limit:36};if(page==='deities')render()}
  });

  window.v49DeityPage=v49DeityPage;
  window.v49FilteredDeities=v49Filtered;
  if(current)render();
})();
