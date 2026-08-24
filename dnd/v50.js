(()=>{
  const V50_STATUSES={draft:'Taslak',offered:'Teklif Edildi',active:'Aktif',completed:'Tamamlandı',failed:'Başarısız',archived:'Arşiv'};
  const V50_STATUS_ORDER=['active','offered','draft','completed','failed','archived'];
  const V50_SEARCH=new Map(V50_QUESTS.map(quest=>[quest.id,v50Fold([
    quest.title,quest.levels,quest.type,quest.region,quest.difficulty,quest.publicBrief,
    ...(quest.objectives||[]),...(quest.clues||[]),...(quest.checks||[]),quest.encounter,
    quest.twist,quest.secret,quest.hiddenReward,quest.failure,quest.scaling,...(quest.tags||[])
  ].join(' '))]));

  let v50Tab='assigned',v50CatalogQuery='',v50CatalogLevel='all',v50CatalogType='all',v50CatalogRegion='all',v50CatalogDifficulty='all';
  let v50AssignedQuery='',v50AssignedStatus='all',v50CatalogLimit=30,v50SearchTimer=null,v50CampaignId=null;

  function v50Fold(value){
    return String(value||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
  }
  function v50Unique(rows){return [...new Set(rows)].sort((a,b)=>a.localeCompare(b,'tr'))}
  function v50Now(){return new Date().toISOString()}
  function v50Date(value){try{return new Date(value).toLocaleString('tr-TR',{dateStyle:'short',timeStyle:'short'})}catch{return '—'}}
  function v50Hash(value){let hash=2166136261;for(let char of String(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}return (hash>>>0).toString(36)}
  function v50Board(){return Array.isArray(state?.questBoard)?state.questBoard:[]}
  function v50Template(id){return V50_QUESTS.find(row=>row.id===id)}
  function v50StatusLabel(status){return V50_STATUSES[status]||V50_STATUSES.active}
  function v50Lines(value){return String(value||'').split(/\r?\n/).map(row=>row.trim()).filter(Boolean)}
  function v50CloneLines(value){return Array.isArray(value)?value.map(row=>String(row)):[]}
  function v50History(quest,action,status){
    return [...(quest?.history||[]),{at:v50Now(),action,status:status||quest?.status||'active',by:auth?.name||'DM'}].slice(-24);
  }

  function v50Snapshot(source){
    return {
      title:source.title||'Adsız Görev',levels:source.levels||'1–2',type:source.type||'Özel',region:source.region||'Serbest Bölge',
      difficulty:source.difficulty||'DM belirler',duration:source.duration||'DM belirler',publicBrief:source.publicBrief||'',
      objectives:v50CloneLines(source.objectives),clues:v50CloneLines(source.clues),checks:v50CloneLines(source.checks),
      encounter:source.encounter||'',twist:source.twist||'',secret:source.secret||'',hiddenReward:source.hiddenReward||'',
      failure:source.failure||'',scaling:source.scaling||'',tags:v50CloneLines(source.tags)
    };
  }

  function v50MigrateLegacy(){
    if(current?.role!=='dm')return false;
    state.questBoard=Array.isArray(state.questBoard)?state.questBoard:[];
    let migrated=new Set(Array.isArray(state.v50MigratedLegacyIds)?state.v50MigratedLegacyIds:[]),changed=false;
    (state.quests||[]).forEach((entry,index)=>{
      let text=typeof entry==='string'?entry:(entry?.title||entry?.name||JSON.stringify(entry)),legacyId=`v50-old-${v50Hash(`${index}|${text}`)}`;
      if(!text||migrated.has(legacyId)){return}
      migrated.add(legacyId);changed=true;
      if(state.questBoard.some(row=>row.id===legacyId))return;
      state.questBoard.push({
        id:legacyId,templateId:'legacy-state',title:text,levels:'DM belirler',type:'Eski Görev',region:'Belirtilmemiş',
        difficulty:'DM belirler',duration:'DM belirler',publicBrief:text,objectives:['DM ile hedefleri netleştir.'],clues:[],checks:[],encounter:'',
        twist:'Eski görev kaydından taşındı; DM gizli detayı düzenleyebilir.',secret:'',hiddenReward:'DM tarafından belirlenecek.',
        failure:'DM belirler.',scaling:'DM belirler.',tags:['eski görev'],audience:'party',assignees:[],status:'active',showReward:false,
        contact:'',deadline:'',createdAt:v50Now(),updatedAt:v50Now(),history:[{at:v50Now(),action:'Eski görev panoya taşındı',status:'active',by:'Sistem'}],legacy:true
      });
    });
    state.v50MigratedLegacyIds=[...migrated];
    if(!state.v50QuestBoardMigrated){state.v50QuestBoardMigrated=true;changed=true}
    return changed;
  }

  function v50EnsureCampaign(){
    if(!current)return;
    if(v50CampaignId!==current.id){
      v50CampaignId=current.id;v50Tab='assigned';v50CatalogQuery='';v50CatalogLevel='all';v50CatalogType='all';
      v50CatalogRegion='all';v50CatalogDifficulty='all';v50AssignedQuery='';v50AssignedStatus='all';v50CatalogLimit=30;
    }
    if(current.role==='dm'&&v50MigrateLegacy())queueMicrotask(()=>save());
  }

  function v50AssignmentTargets(){
    let targets=(state.characters||[]).map(character=>({
      key:`character:${character.id}`,characterId:character.id,userId:character.userId||'',name:character.name||'Adsız karakter',
      detail:character.userId?(members.find(member=>member.userId===character.userId)?.name||'Oyuncu hesabı'):'Hesaba bağlanmamış'
    }));
    let represented=new Set(targets.map(row=>row.userId).filter(Boolean));
    (members||[]).filter(member=>member.role==='player'&&member.userId&&!represented.has(member.userId)).forEach(member=>targets.push({
      key:`user:${member.userId}`,characterId:'',userId:member.userId,name:member.name||'Oyuncu',detail:'Karakteri henüz bağlanmamış'
    }));
    return targets;
  }

  function v50ListBlock(title,rows,empty='Henüz belirtilmedi.'){
    return `<section class="v50-info-block"><h4>${esc(title)}</h4>${rows?.length?`<ul>${rows.map(row=>`<li>${esc(row)}</li>`).join('')}</ul>`:`<p class="muted">${esc(empty)}</p>`}</section>`;
  }
  function v50PublicDetails(quest){
    return `<div class="v50-public"><div class="v50-section-label">OYUNCUYA AÇIK</div><p class="v50-brief">${esc(quest.publicBrief||'Açıklama bekleniyor.')}</p><div class="v50-info-grid">${v50ListBlock('Hedefler',quest.objectives)}${v50ListBlock('Bilinen ipuçları',quest.clues)}${v50ListBlock('Önerilen kontroller',quest.checks)}</div>${quest.encounter?`<p><b>Beklenen karşılaşma:</b> ${esc(quest.encounter)}</p>`:''}</div>`;
  }
  function v50PrivateDetails(quest){
    return `<aside class="v50-private"><div class="v50-section-label">🔒 YALNIZ DM</div><div class="v50-private-grid"><p><b>Ters köşe</b>${esc(quest.twist||'—')}</p><p><b>Gizli bilgi</b>${esc(quest.secret||'—')}</p><p><b>Gizli ödül</b>${esc(quest.hiddenReward||'—')}</p><p><b>Başarısızlık sonucu</b>${esc(quest.failure||'—')}</p><p><b>Ölçekleme</b>${esc(quest.scaling||'—')}</p></div></aside>`;
  }
  function v50Meta(quest){
    return `<div class="v50-meta"><span>Lv ${esc(quest.levels||'—')}</span><span>${esc(quest.type||'Özel')}</span><span>${esc(quest.region||'Bölgesiz')}</span><span>${esc(quest.difficulty||'DM belirler')}</span><span>${esc(quest.duration||'DM belirler')}</span></div>`;
  }

  function v50CatalogRows(){
    let needle=v50Fold(v50CatalogQuery.trim());
    return V50_QUESTS.filter(quest=>
      (v50CatalogLevel==='all'||quest.levels===v50CatalogLevel)&&
      (v50CatalogType==='all'||quest.type===v50CatalogType)&&
      (v50CatalogRegion==='all'||quest.region===v50CatalogRegion)&&
      (v50CatalogDifficulty==='all'||quest.difficulty===v50CatalogDifficulty)&&
      (!needle||V50_SEARCH.get(quest.id)?.includes(needle))
    );
  }
  function v50CatalogCards(){
    let rows=v50CatalogRows(),visible=rows.slice(0,v50CatalogLimit);
    return `${visible.map(quest=>`<details class="v50-template" data-v50-template-card="${quest.id}"><summary><span><b>${esc(quest.title)}</b><small>${esc(quest.publicBrief)}</small>${v50Meta(quest)}</span><i>＋</i></summary><div class="v50-template-body">${v50PublicDetails(quest)}${v50PrivateDetails(quest)}<div class="v50-card-actions"><button class="primary" data-v50-assign="${quest.id}">Oyunculara Ata</button></div></div></details>`).join('')||'<div class="card empty">Bu filtrelerde görev bulunamadı.</div>'}${rows.length>visible.length?`<button class="ghost v50-more" data-v50-more="1">30 görev daha göster • ${visible.length}/${rows.length}</button>`:''}`;
  }
  function v50CatalogPanel(){
    let types=v50Unique(V50_QUESTS.map(row=>row.type)),regions=v50Unique(V50_QUESTS.map(row=>row.region)),difficulties=v50Unique(V50_QUESTS.map(row=>row.difficulty)),count=v50CatalogRows().length;
    return `<section class="v50-catalog-panel"><div class="v50-tools card"><label class="v50-search"><span>Görev ara</span><input id="v50CatalogSearch" class="input" value="${esc(v50CatalogQuery)}" placeholder="Kervan, lanet, diplomasi, bölge…"></label><label><span>Seviye</span><select id="v50CatalogLevel"><option value="all">Tümü</option>${V50_LEVEL_PROFILES.map(row=>`<option value="${row.levels}" ${v50CatalogLevel===row.levels?'selected':''}>Lv ${row.levels}</option>`).join('')}</select></label><label><span>Tür</span><select id="v50CatalogType"><option value="all">Tümü</option>${types.map(value=>`<option value="${esc(value)}" ${v50CatalogType===value?'selected':''}>${esc(value)}</option>`).join('')}</select></label><label><span>Bölge</span><select id="v50CatalogRegion"><option value="all">Tümü</option>${regions.map(value=>`<option value="${esc(value)}" ${v50CatalogRegion===value?'selected':''}>${esc(value)}</option>`).join('')}</select></label><label><span>Zorluk</span><select id="v50CatalogDifficulty"><option value="all">Tümü</option>${difficulties.map(value=>`<option value="${esc(value)}" ${v50CatalogDifficulty===value?'selected':''}>${esc(value)}</option>`).join('')}</select></label><button id="v50ClearCatalog" class="ghost">Temizle</button><b id="v50CatalogCount">${count}/200</b></div><div id="v50CatalogList" class="v50-catalog-list">${v50CatalogCards()}</div></section>`;
  }

  function v50AssigneeText(quest){
    if(quest.audience!=='selected')return 'Tüm parti';
    return (quest.assignees||[]).map(row=>row.name).filter(Boolean).join(', ')||'Seçili oyuncu yok';
  }
  function v50AssignedRows(){
    let needle=v50Fold(v50AssignedQuery.trim());
    return v50Board().filter(quest=>(v50AssignedStatus==='all'||quest.status===v50AssignedStatus)&&(!needle||v50Fold(`${quest.title} ${quest.publicBrief} ${quest.type} ${quest.region} ${v50AssigneeText(quest)}`).includes(needle))).slice().sort((a,b)=>V50_STATUS_ORDER.indexOf(a.status)-V50_STATUS_ORDER.indexOf(b.status)||(b.updatedAt||'').localeCompare(a.updatedAt||''));
  }
  function v50HistoryHtml(quest){
    let rows=(quest.history||[]).slice(-5).reverse();
    return rows.length?`<details class="v50-history"><summary>Son işlemler (${quest.history.length})</summary><ul>${rows.map(row=>`<li><span>${esc(v50Date(row.at))}</span><b>${esc(row.action)}</b><small>${esc(row.by||'DM')}</small></li>`).join('')}</ul></details>`:'';
  }
  function v50AssignedCards(){
    let rows=v50AssignedRows();
    return rows.map(quest=>`<article class="v50-assigned status-${esc(quest.status||'active')}"><details><summary><span><b>${esc(quest.title)}</b><small>${esc(quest.publicBrief||'Açıklama bekleniyor.')}</small>${v50Meta(quest)}</span><i>＋</i></summary><div class="v50-template-body">${v50PublicDetails(quest)}${v50PrivateDetails(quest)}${v50HistoryHtml(quest)}</div></details><footer><div><span class="v50-status-badge">${esc(v50StatusLabel(quest.status))}</span><span>👥 ${esc(v50AssigneeText(quest))}</span><span>${quest.showReward?'🎁 Ödül açık':'🔒 Ödül gizli'}</span>${quest.deadline?`<span>⏳ ${esc(quest.deadline)}</span>`:''}</div><div class="v50-card-actions"><select data-v50-status="${quest.id}" aria-label="Görev durumu">${V50_STATUS_ORDER.map(status=>`<option value="${status}" ${quest.status===status?'selected':''}>${V50_STATUSES[status]}</option>`).join('')}</select><button class="ghost" data-v50-edit="${quest.id}">Düzenle / Yeniden Ata</button><button class="ghost" data-v50-reward="${quest.id}">${quest.showReward?'Ödülü Gizle':'Ödülü Aç'}</button><button class="ghost" data-v50-archive="${quest.id}">${quest.status==='archived'?'Aktife Al':'Arşivle'}</button><button class="danger" data-v50-delete="${quest.id}">Sil</button></div></footer></article>`).join('')||'<div class="card empty"><h3>Bu filtrede görev yok</h3><p>Katalogdan hazır bir görev ata veya özel görev oluştur.</p></div>';
  }
  function v50AssignedPanel(){
    let counts=Object.fromEntries(Object.keys(V50_STATUSES).map(status=>[status,v50Board().filter(row=>row.status===status).length]));
    return `<section class="v50-assigned-panel"><div class="v50-summary-strip">${['active','offered','completed','failed'].map(status=>`<button data-v50-quick-status="${status}" class="${v50AssignedStatus===status?'active':''}"><b>${counts[status]||0}</b><span>${V50_STATUSES[status]}</span></button>`).join('')}</div><div class="v50-tools card"><label class="v50-search"><span>Atanmış görev ara</span><input id="v50AssignedSearch" class="input" value="${esc(v50AssignedQuery)}" placeholder="Başlık, oyuncu, bölge…"></label><label><span>Durum</span><select id="v50AssignedStatus"><option value="all">Tüm durumlar</option>${V50_STATUS_ORDER.map(status=>`<option value="${status}" ${v50AssignedStatus===status?'selected':''}>${V50_STATUSES[status]}</option>`).join('')}</select></label><b id="v50AssignedCount">${v50AssignedRows().length} görev</b></div><div id="v50AssignedList" class="v50-assigned-list">${v50AssignedCards()}</div></section>`;
  }

  function v50DmPage(){
    v50EnsureCampaign();
    return `${v26Head('GÖREV YÖNETİMİ','Görev Panosu','200 hazır görevden seç, tüm partiye veya belirli oyunculara ata. Oyuncuya açık bilgi ile DM sırrı ve ödül birbirinden ayrıdır.')}<section class="card v50-privacy-note"><b>🔒 Gizlilik kuralı</b><p>Ters köşe, DM sırrı, başarısızlık planı ve ödül varsayılan olarak oyuncu ekranında çizilmez. Ödülü ancak sen “Ödülü Aç” dediğinde görürler.</p></section><div class="v50-board-tabs"><button data-v50-tab="assigned" class="${v50Tab==='assigned'?'primary':'ghost'}">Atanan Görevler <span>${v50Board().length}</span></button><button data-v50-tab="catalog" class="${v50Tab==='catalog'?'primary':'ghost'}">200 Görev Kataloğu</button><button id="v50CustomQuest" class="ghost">+ Özel Görev</button></div><div id="v50QuestBoardBody">${v50Tab==='catalog'?v50CatalogPanel():v50AssignedPanel()}</div>`;
  }

  function v50PlayerCanSee(quest){
    if(!quest||['draft','archived'].includes(quest.status))return false;
    if(quest.audience!=='selected')return true;
    let characterIds=new Set((state.characters||[]).filter(character=>character.userId===auth?.id).map(character=>character.id));
    return (quest.assignees||[]).some(row=>(row.userId&&row.userId===auth?.id)||(row.characterId&&characterIds.has(row.characterId)));
  }
  function v50PlayerCard(quest){
    let reward=quest.showReward&&quest.hiddenReward?`<section class="v50-player-reward revealed"><b>🎁 Açıklanan ödül</b><p>${esc(quest.hiddenReward)}</p></section>`:'<section class="v50-player-reward"><b>🔒 Ödül gizli</b><p>Görevi veren kişi veya DM henüz ödülü açıklamadı.</p></section>';
    return `<details class="v50-player-quest status-${esc(quest.status||'active')}"><summary><span><b>${esc(quest.title)}</b><small>${esc(quest.publicBrief||'Açıklama bekleniyor.')}</small>${v50Meta(quest)}</span><span class="v50-status-badge">${esc(v50StatusLabel(quest.status))}</span></summary><div class="v50-player-body">${v50PublicDetails(quest)}${quest.contact?`<p><b>Görevi veren / bağlantı:</b> ${esc(quest.contact)}</p>`:''}${quest.deadline?`<p><b>Süre:</b> ${esc(quest.deadline)}</p>`:''}${reward}</div></details>`;
  }
  function v50PlayerPage(){
    if(typeof sessionPending==='function'&&sessionPending())return sessionPendingPage();
    let rows=v50Board().filter(v50PlayerCanSee).sort((a,b)=>V50_STATUS_ORDER.indexOf(a.status)-V50_STATUS_ORDER.indexOf(b.status));
    return `${v26Head('MACERA KAYITLARI','Görev Panosu','Sana veya bütün partiye atanan görevler. Kartı açarak hedefleri, bilinen ipuçlarını ve önerilen kontrolleri görebilirsin.')}<section class="card v50-player-note"><b>Bilgi sınırı</b><p>Burada yalnız karakterinin bildiği bilgiler görünür. Gizli ters köşeler ve DM notları görev tamamlanana kadar açıklanmaz.</p></section><div class="v50-player-list">${rows.map(v50PlayerCard).join('')||'<div class="card empty"><h3>Henüz atanmış görev yok</h3><p>DM görevi panoya astığında burada görünecek.</p></div>'}</div>`;
  }

  function v50QuestModal(source,existing){
    let quest={...v50Snapshot(source||{}),...(existing||{})},targets=v50AssignmentTargets(),selected=new Set((quest.assignees||[]).map(row=>row.characterId?`character:${row.characterId}`:`user:${row.userId}`));
    let audience=quest.audience||'party',status=quest.status||'offered';
    modal(existing?'Görevi düzenle / yeniden ata':source?'Görevi oyunculara ata':'Özel görev oluştur',`<div class="v50-quest-form"><section><div class="v50-section-label">OYUNCUYA AÇIK BİLGİ</div><div class="v50-form-grid"><label class="wide">Başlık<input id="v50FormTitle" class="input" value="${esc(quest.title||'')}"></label><label>Seviye<select id="v50FormLevel">${V50_LEVEL_PROFILES.map(row=>`<option value="${row.levels}" ${quest.levels===row.levels?'selected':''}>Lv ${row.levels}</option>`).join('')}<option value="DM belirler" ${quest.levels==='DM belirler'?'selected':''}>DM belirler</option></select></label><label>Tür<input id="v50FormType" class="input" value="${esc(quest.type||'Özel')}"></label><label>Bölge<input id="v50FormRegion" class="input" value="${esc(quest.region||'')}"></label><label>Zorluk<input id="v50FormDifficulty" class="input" value="${esc(quest.difficulty||'')}"></label><label>Süre<input id="v50FormDuration" class="input" value="${esc(quest.duration||'')}"></label><label class="wide">Oyuncu özeti<textarea id="v50FormBrief">${esc(quest.publicBrief||'')}</textarea></label><label class="wide">Hedefler — her satır bir madde<textarea id="v50FormObjectives">${esc((quest.objectives||[]).join('\n'))}</textarea></label><label class="wide">Bilinen ipuçları — her satır bir madde<textarea id="v50FormClues">${esc((quest.clues||[]).join('\n'))}</textarea></label><label class="wide">Önerilen kontroller — her satır bir madde<textarea id="v50FormChecks">${esc((quest.checks||[]).join('\n'))}</textarea></label><label class="wide">Beklenen karşılaşma<textarea id="v50FormEncounter">${esc(quest.encounter||'')}</textarea></label></div></section><details class="v50-form-private"><summary>🔒 DM’ye özel detaylar ve gizli ödül</summary><div class="v50-form-grid"><label class="wide">Ters köşe<textarea id="v50FormTwist">${esc(quest.twist||'')}</textarea></label><label class="wide">Gizli bilgi<textarea id="v50FormSecret">${esc(quest.secret||'')}</textarea></label><label class="wide">Gizli ödül<textarea id="v50FormReward">${esc(quest.hiddenReward||'')}</textarea></label><label class="wide">Başarısızlık sonucu<textarea id="v50FormFailure">${esc(quest.failure||'')}</textarea></label><label class="wide">Seviye / parti ölçekleme<textarea id="v50FormScaling">${esc(quest.scaling||'')}</textarea></label></div></details><section><div class="v50-section-label">ATAMA</div><div class="v50-form-grid"><label>Kime?<select id="v50FormAudience"><option value="party" ${audience==='party'?'selected':''}>Tüm parti</option><option value="selected" ${audience==='selected'?'selected':''}>Seçili oyuncular</option></select></label><label>Başlangıç durumu<select id="v50FormStatus">${V50_STATUS_ORDER.map(value=>`<option value="${value}" ${status===value?'selected':''}>${V50_STATUSES[value]}</option>`).join('')}</select></label><label>Görevi veren / bağlantı<input id="v50FormContact" class="input" value="${esc(quest.contact||'')}" placeholder="NPC, lonca, kale…"></label><label>Süre / son tarih<input id="v50FormDeadline" class="input" value="${esc(quest.deadline||'')}" placeholder="3 gün, dolunaydan önce…"></label></div><div id="v50AssigneeBox" class="v50-assignees ${audience==='selected'?'':'is-disabled'}">${targets.length?targets.map(target=>`<label><input type="checkbox" name="v50Assignee" value="${esc(target.key)}" ${selected.has(target.key)?'checked':''}><span><b>${esc(target.name)}</b><small>${esc(target.detail)}</small></span></label>`).join(''):'<p class="muted">Henüz atanabilecek oyuncu veya karakter yok.</p>'}</div><label class="v50-reward-toggle"><input type="checkbox" id="v50FormShowReward" ${quest.showReward?'checked':''}><span><b>Ödülü oyuncuya şimdi göster</b><small>Kapalı bırakılırsa oyuncuda yalnız “Ödül gizli” yazar.</small></span></label></section><button class="primary v50-save-quest" id="v50SaveQuest" data-existing="${esc(existing?.id||'')}" data-template="${esc(source?.id||existing?.templateId||'custom')}">${existing?'Değişiklikleri Kaydet':'Görevi Panoya Ata'}</button></div>`);
  }

  function v50ReadForm(button){
    let old=v50Board().find(row=>row.id===button.dataset.existing),source=v50Template(button.dataset.template)||old||{},targets=new Map(v50AssignmentTargets().map(row=>[row.key,row]));
    let audience=$('#v50FormAudience')?.value||'party',assignees=[...document.querySelectorAll('[name="v50Assignee"]:checked')].map(input=>targets.get(input.value)).filter(Boolean).map(row=>({characterId:row.characterId,userId:row.userId,name:row.name}));
    if(audience==='selected'&&!assignees.length){toast('En az bir oyuncu veya karakter seç',true);return null}
    let title=$('#v50FormTitle')?.value.trim(),publicBrief=$('#v50FormBrief')?.value.trim();
    if(!title||!publicBrief){toast('Görev başlığı ve oyuncu özeti zorunlu',true);return null}
    let base=v50Snapshot(source),status=$('#v50FormStatus')?.value||'offered',now=v50Now();
    return {
      ...base,id:old?.id||uid(),templateId:button.dataset.template||'custom',title,levels:$('#v50FormLevel')?.value||'DM belirler',
      type:$('#v50FormType')?.value.trim()||'Özel',region:$('#v50FormRegion')?.value.trim()||'Belirtilmemiş',difficulty:$('#v50FormDifficulty')?.value.trim()||'DM belirler',
      duration:$('#v50FormDuration')?.value.trim()||'DM belirler',publicBrief,objectives:v50Lines($('#v50FormObjectives')?.value),clues:v50Lines($('#v50FormClues')?.value),
      checks:v50Lines($('#v50FormChecks')?.value),encounter:$('#v50FormEncounter')?.value.trim()||'',twist:$('#v50FormTwist')?.value.trim()||'',secret:$('#v50FormSecret')?.value.trim()||'',
      hiddenReward:$('#v50FormReward')?.value.trim()||'',failure:$('#v50FormFailure')?.value.trim()||'',scaling:$('#v50FormScaling')?.value.trim()||'',
      audience,assignees,status,showReward:Boolean($('#v50FormShowReward')?.checked),contact:$('#v50FormContact')?.value.trim()||'',deadline:$('#v50FormDeadline')?.value.trim()||'',
      createdAt:old?.createdAt||now,updatedAt:now,history:v50History(old,old?'Görev düzenlendi':'Görev atandı',status),legacy:Boolean(old?.legacy)
    };
  }

  function v50RefreshCatalog(){
    let list=$('#v50CatalogList');if(list)list.innerHTML=v50CatalogCards();
    let count=$('#v50CatalogCount');if(count)count.textContent=`${v50CatalogRows().length}/200`;
  }
  function v50RefreshAssigned(){
    let list=$('#v50AssignedList');if(list)list.innerHTML=v50AssignedCards();
    let count=$('#v50AssignedCount');if(count)count.textContent=`${v50AssignedRows().length} görev`;
  }
  function v50Commit(quest,action){
    quest.updatedAt=v50Now();quest.history=v50History(quest,action,quest.status);save();render();
  }

  if(!dmNav.some(row=>row[0]==='questboard'))dmNav.splice(Math.max(0,dmNav.findIndex(row=>row[0]==='guide')),0,['questboard','⚑','Görev Panosu']);
  if(!playerNav.some(row=>row[0]==='questboard'))playerNav.splice(Math.max(0,playerNav.findIndex(row=>row[0]==='guide')),0,['questboard','⚑','Görev Panosu']);
  dmPages.questboard=v50DmPage;playerPages.questboard=v50PlayerPage;
  if(typeof V27_PAGE_HELP!=='undefined')V27_PAGE_HELP.questboard={title:'Görev Panosu',text:'DM 200 hazır görev arasından seçim yapar; bütün partiye veya belirli oyunculara atar. Oyuncu yalnız açık özet, hedef, ipucu ve kontrolleri görür. Ters köşe, gizli bilgi, başarısızlık planı ve ödül DM alanında kalır.'};

  const v50DmGuideBase=dmPages.guide,v50PlayerGuideBase=playerPages.guide;
  function v50GuideShortcut(base){return ()=>base().replace(/<button[^>]*data-v34-quest-hub="1"[^>]*>50 Görev Fikri<\/button>/,'').replace('<div class="v26-guide-tabs">','<div class="v26-guide-tabs"><button class="primary" data-page="questboard">⚑ Görev Panosu • 200 Görev</button>')}
  if(v50DmGuideBase)dmPages.guide=v50GuideShortcut(v50DmGuideBase);
  if(v50PlayerGuideBase)playerPages.guide=v50GuideShortcut(v50PlayerGuideBase);

  document.addEventListener('click',event=>{
    let button=event.target.closest('button');if(!button||!current)return;
    if(button.dataset.v50Tab&&current.role==='dm'){v50Tab=button.dataset.v50Tab;render();return}
    if(button.dataset.v50Assign&&current.role==='dm'){let source=v50Template(button.dataset.v50Assign);if(source)v50QuestModal(source);return}
    if(button.id==='v50CustomQuest'&&current.role==='dm'){v50QuestModal(null);return}
    if(button.id==='v50SaveQuest'&&current.role==='dm'){
      state.questBoard=Array.isArray(state.questBoard)?state.questBoard:[];
      let quest=v50ReadForm(button);if(!quest)return;
      let index=state.questBoard.findIndex(row=>row.id===quest.id);if(index<0)state.questBoard.push(quest);else state.questBoard[index]=quest;
      save();$('#modal')?.close();toast(`${quest.title} panoya kaydedildi`);render();return;
    }
    if(button.dataset.v50Edit&&current.role==='dm'){let quest=v50Board().find(row=>row.id===button.dataset.v50Edit);if(quest)v50QuestModal(v50Template(quest.templateId)||quest,quest);return}
    if(button.dataset.v50Reward&&current.role==='dm'){let quest=v50Board().find(row=>row.id===button.dataset.v50Reward);if(quest){quest.showReward=!quest.showReward;v50Commit(quest,quest.showReward?'Ödül oyuncuya açıldı':'Ödül gizlendi')}return}
    if(button.dataset.v50Archive&&current.role==='dm'){let quest=v50Board().find(row=>row.id===button.dataset.v50Archive);if(quest){quest.status=quest.status==='archived'?'active':'archived';v50Commit(quest,quest.status==='archived'?'Görev arşivlendi':'Görev yeniden aktifleştirildi')}return}
    if(button.dataset.v50Delete&&current.role==='dm'){
      let quest=v50Board().find(row=>row.id===button.dataset.v50Delete);if(!quest||!confirm(`“${quest.title}” panodan silinsin mi? Eski basit görev kaydı varsa ona dokunulmaz.`))return;
      state.questBoard=state.questBoard.filter(row=>row.id!==quest.id);save();render();return;
    }
    if(button.dataset.v50More&&current.role==='dm'){v50CatalogLimit+=30;v50RefreshCatalog();return}
    if(button.id==='v50ClearCatalog'&&current.role==='dm'){v50CatalogQuery='';v50CatalogLevel='all';v50CatalogType='all';v50CatalogRegion='all';v50CatalogDifficulty='all';v50CatalogLimit=30;render();return}
    if(button.dataset.v50QuickStatus&&current.role==='dm'){v50AssignedStatus=v50AssignedStatus===button.dataset.v50QuickStatus?'all':button.dataset.v50QuickStatus;render();return}
  },true);

  document.addEventListener('input',event=>{
    if(current?.role!=='dm')return;
    if(event.target.id==='v50CatalogSearch'){
      v50CatalogQuery=event.target.value;v50CatalogLimit=30;clearTimeout(v50SearchTimer);v50SearchTimer=setTimeout(v50RefreshCatalog,120);return;
    }
    if(event.target.id==='v50AssignedSearch'){
      v50AssignedQuery=event.target.value;clearTimeout(v50SearchTimer);v50SearchTimer=setTimeout(v50RefreshAssigned,120);
    }
  },true);

  document.addEventListener('change',event=>{
    if(current?.role!=='dm')return;
    if(event.target.id==='v50FormAudience'){$('#v50AssigneeBox')?.classList.toggle('is-disabled',event.target.value!=='selected');return}
    if(event.target.id==='v50CatalogLevel'){v50CatalogLevel=event.target.value;v50CatalogLimit=30;v50RefreshCatalog();return}
    if(event.target.id==='v50CatalogType'){v50CatalogType=event.target.value;v50CatalogLimit=30;v50RefreshCatalog();return}
    if(event.target.id==='v50CatalogRegion'){v50CatalogRegion=event.target.value;v50CatalogLimit=30;v50RefreshCatalog();return}
    if(event.target.id==='v50CatalogDifficulty'){v50CatalogDifficulty=event.target.value;v50CatalogLimit=30;v50RefreshCatalog();return}
    if(event.target.id==='v50AssignedStatus'){v50AssignedStatus=event.target.value;v50RefreshAssigned();return}
    if(event.target.matches('[data-v50-status]')){
      let quest=v50Board().find(row=>row.id===event.target.dataset.v50Status);if(!quest)return;
      quest.status=event.target.value;v50Commit(quest,`Durum: ${v50StatusLabel(quest.status)}`);
    }
  },true);
})();
