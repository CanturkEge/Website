/* Build 80 — Bastion, factions, world events, pets, notebooks and battle traps.
 * State is kept inside state.v80 so old campaign JSON remains readable. */
(() => {
  if (typeof document !== 'undefined' && !document.querySelector('link[data-v80-style]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = 'v80.css?v=80'; link.dataset.v80Style = '1';
    document.head.appendChild(link);
  }
  const V80_VERSION = 1;
  let v80Tab = 'bastion';
  let v80BookPage = 0;
  let v80BookFlip = false;
  let v80PendingFile = null;

  const v80Esc = s => (typeof esc === 'function' ? esc(s == null ? '' : s) : String(s == null ? '' : s));
  const v80Id = () => (typeof uid === 'function' ? uid() : `v80-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const v80Now = () => new Date().toISOString();
  const v80Role = () => current?.role === 'dm' ? 'dm' : 'player';
  const v80Ensure = () => {
    state.v80 ??= {};
    state.v80.version ??= V80_VERSION;
    state.v80.bastion ??= {name:'',level:1,morale:50,defense:10,treasury:0,rooms:[],projects:[],hirelings:[],notes:''};
    const b = state.v80.bastion;
    b.rooms ??= []; b.projects ??= []; b.hirelings ??= [];
    state.v80.factions ??= [];
    state.v80.worldEvents ??= [];
    state.v80.traps ??= [];
    state.v80.pets ??= [];
    state.v80.notebooks ??= {dm:{title:'DM Kronikleri',pages:[]},players:{}};
    state.v80.notebooks.dm ??= {title:'DM Kronikleri',pages:[]};
    state.v80.notebooks.dm.pages ??= [];
    state.v80.notebooks.players ??= {};
    const key = auth?.id || 'anonymous';
    state.v80.notebooks.players[key] ??= {title:'Maceracının Defteri',pages:[]};
    state.v80.notebooks.players[key].pages ??= [];
    if (!state.v80.notebooks.dm.pages.length) state.v80.notebooks.dm.pages.push({id:v80Id(),title:'Kampanya Başlangıcı',body:'Bu sayfayı DM olarak düzenleyebilirsin.',npcIds:[],attachment:null});
    if (!state.v80.notebooks.players[key].pages.length) state.v80.notebooks.players[key].pages.push({id:v80Id(),title:'İlk Sayfa',body:'Bu defterde kendi notlarını tutabilirsin.',npcIds:[],attachment:null});
    return state.v80;
  };
  const v80Save = () => { try { save?.(); } catch (_) {} };
  const v80Toast = s => { try { toast?.(s); } catch (_) {} };
  const v80Character = () => state.characters?.find(c => c.userId === auth?.id) || state.characters?.[0];
  const v80Passive = c => {
    if (!c) return 10;
    if (Number.isFinite(+c.passivePerception)) return +c.passivePerception;
    const wis = +(c.stats?.WIS ?? c.wisdom ?? 10);
    const mod = Math.floor((wis - 10) / 2);
    return 10 + mod + (+c.proficiencyBonus || 0);
  };
  const v80RelLabel = n => n >= 100 ? 'Sadakat' : n >= 70 ? 'Bağ' : n >= 40 ? 'Dostluk' : n >= 20 ? 'Güven' : 'Tanışıklık';
  const v80StandLabel = n => n >= 75 ? 'Müttefik' : n >= 25 ? 'Dostça' : n > -25 ? 'Nötr' : n > -75 ? 'Gergin' : 'Düşman';
  const v80Input = (id,label,value,type='text') => `<label>${label}<input class="input" id="${id}" type="${type}" value="${v80Esc(value ?? '')}"></label>`;
  const v80Area = (id,label,value) => `<label>${label}<textarea id="${id}">${v80Esc(value ?? '')}</textarea></label>`;
  const v80Btn = (label,action,cls='') => `<button class="${cls}" data-v80-action="${action}">${label}</button>`;
  const v80Panel = (title,body,span=6) => `<section class="v80-panel v80-span-${span}"><h3>${title}</h3>${body}</section>`;

  function v80Nav() {
    if (!dmNav.some(x => x[0] === 'bastion')) dmNav.splice(Math.max(0, dmNav.findIndex(x => x[0] === 'world') + 1), 0, ['bastion','✧','Kampanya']);
    if (!playerNav.some(x => x[0] === 'bastion')) playerNav.splice(Math.max(0, playerNav.findIndex(x => x[0] === 'guild') + 1), 0, ['bastion','✧','Kampanya']);
    if (!dmNav.some(x => x[0] === 'pets')) dmNav.splice(Math.max(0, dmNav.findIndex(x => x[0] === 'npcs') + 1), 0, ['pets','♧','Evcil Hayvanlar']);
    if (!playerNav.some(x => x[0] === 'pets')) playerNav.splice(Math.max(0, playerNav.findIndex(x => x[0] === 'partyview') + 1), 0, ['pets','♧','Evcil Hayvanlar']);
    if (!dmNav.some(x => x[0] === 'notebook')) dmNav.splice(Math.max(0, dmNav.findIndex(x => x[0] === 'guide') + 1), 0, ['notebook','▤','Defter']);
    if (!playerNav.some(x => x[0] === 'notebook')) playerNav.splice(Math.max(0, playerNav.findIndex(x => x[0] === 'guide') + 1), 0, ['notebook','▤','Defter']);
  }

  function v80Bastion() {
    const v = v80Ensure(), b = v.bastion, dm = v80Role() === 'dm';
    const tabs = [['bastion','Üs'],['factions','Fraksiyonlar'],['events','Dünya Olayları'],['traps','Tuzaklar']];
    let body = `<div class="v80-tabs">${tabs.map(([k,n]) => `<button class="${v80Tab===k?'active':''}" data-v80-tab="${k}">${n}</button>`).join('')}</div>`;
    if (v80Tab === 'bastion') {
      const rooms = b.rooms.map((r,i) => `<div class="v80-row"><div><b>${v80Esc(r.name)}</b><small>${v80Esc(r.effect || 'Etki belirtilmemiş')} • Seviye ${r.level || 1}</small></div>${dm?`<div class="v80-actions">${v80Btn('Yükselt','room-up|'+i)}${v80Btn('Sil','room-del|'+i,'danger')}</div>`:''}</div>`).join('') || `<p class="v80-muted">Henüz oda yok. Kütüphane, atölye, ahır, revir gibi alanlar ekleyebilirsin.</p>`;
      const projects = b.projects.map((p,i) => `<div class="v80-row"><div><b>${v80Esc(p.name)}</b><small>${v80Esc(p.note || '')} • ${p.progress || 0}%</small><div class="v80-meter"><i style="width:${Math.max(0,Math.min(100,+p.progress||0))}%"></i></div></div>${dm?`<div class="v80-actions">${v80Btn('+10%','project-up|'+i)}${v80Btn('Sil','project-del|'+i,'danger')}</div>`:''}</div>`).join('') || `<p class="v80-muted">Aktif proje yok.</p>`;
      const hirelings = b.hirelings.map((h,i) => `<div class="v80-row"><div><b>${v80Esc(h.name)}</b><small>${v80Esc(h.role || '')} • Maaş ${h.cost || 0} CP/hafta</small></div>${dm?v80Btn('Sil','hireling-del|'+i,'danger'):''}</div>`).join('') || `<p class="v80-muted">Henüz üs personeli yok.</p>`;
      body += `<div class="v80-grid">${v80Panel('Üs Özeti',`<div class="v80-form">${dm?v80Input('v80BaseName','Üs adı',b.name):`<p><b>${v80Esc(b.name || 'Adsız Üs')}</b></p>`}${dm?v80Input('v80BaseLevel','Üs seviyesi',b.level,'number'):`<p>Seviye ${b.level || 1}</p>`}${dm?v80Input('v80BaseMorale','Moral',b.morale,'number'):`<p>Moral: ${b.morale || 0}/100</p>`}${dm?v80Input('v80BaseDefense','Savunma',b.defense,'number'):`<p>Savunma: ${b.defense || 0}</p>`}${dm?v80Input('v80BaseTreasury','Üs hazinesi (CP)',b.treasury,'number'):''}${dm?v80Area('v80BaseNotes','DM üs notları',b.notes):`<p>${v80Esc(b.notes || 'DM henüz üs notu eklemedi.')}</p>`}${dm?`<div class="v80-actions">${v80Btn('Üsü kaydet','base-save','primary')}${v80Btn('Oda ekle','room-add')}${v80Btn('Proje ekle','project-add')}${v80Btn('Personel ekle','hireling-add')}</div>`:''}</div>`,6)}${v80Panel('Odalar ve İşlevler',`<div class="v80-list">${rooms}</div>`,6)}${v80Panel('İnşa Projeleri',`<div class="v80-list">${projects}</div>`,6)}${v80Panel('Personel',`<div class="v80-list">${hirelings}</div>`,6)}</div>`;
    } else if (v80Tab === 'factions') {
      const list = v.factions.map((f,i) => `<article class="v80-row"><div><b>${v80Esc(f.name)}</b><span class="v80-badge">${v80StandLabel(+f.standing||0)} • ${+f.standing||0}</span><small>${v80Esc(f.description || '')}</small></div><div class="v80-actions">${dm?v80Btn('Düzenle','faction-edit|'+i):''}${dm?v80Btn('Sil','faction-del|'+i,'danger'):''}</div></article>`).join('') || `<p class="v80-muted">Fraksiyon eklenmedi. Krallık, lonca, tarikat ve düşman gruplarını burada takip edebilirsin.</p>`;
      body += v80Panel('İtibar Haritası',`<p class="v80-hint">İtibar puanı -100 ile +100 arasındadır. Değişiklikler kampanya kaydına girer ve DM ile oyuncuların aynı kaydı görmesini sağlar.</p><div class="v80-list">${list}</div><div class="v80-actions">${dm?v80Btn('Fraksiyon ekle','faction-add','primary'):''}</div>`,12);
    } else if (v80Tab === 'events') {
      const list = v.worldEvents.map((x,i) => `<article class="v80-row"><div><b>${v80Esc(x.title)}</b><span class="v80-badge">${v80Esc(x.status || 'Aktif')}</span><small>${v80Esc(x.location || 'Bilinmeyen yer')} • ${v80Esc(x.description || '')}</small></div><div class="v80-actions">${dm?v80Btn('Durum','event-status|'+i):''}${dm?v80Btn('Sil','event-del|'+i,'danger'):''}</div></article>`).join('') || `<p class="v80-muted">Dünyada kayda alınmış aktif olay yok.</p>`;
      body += v80Panel('Dünya Olayları',`<p class="v80-hint">Buradaki olaylar görevlerden ayrı yaşar: savaş, salgın, seçim, göç, kıtlık veya yaklaşan felaket gibi masa genelini etkileyen durumları tut.</p><div class="v80-list">${list}</div><div class="v80-actions">${dm?v80Btn('Olay ekle','event-add','primary'):''}</div>`,12);
    } else {
      const list = v.traps.map((t,i) => `<article class="v80-row ${t.triggered?'v80-trap-triggered':t.revealed?'v80-trap-revealed':'v80-trap-hidden'}"><div><b>${v80Esc(t.name)}</b><span class="v80-badge">DC ${+t.dc||10} • ${t.armed===false?'Pasif':'Kurulu'}</span><small>${v80Esc(t.position || 'Savaş alanı')} • ${v80Esc(t.damage || 'Hasar belirtilmemiş')} • ${v80Esc(t.effect || '')}</small></div><div class="v80-actions">${dm?v80Btn(t.armed===false?'Kur':'Devre dışı','trap-arm|'+i):''}${dm?v80Btn(t.revealed?'Gizle':'Açığa çıkar','trap-reveal|'+i):''}${dm?v80Btn('Tetikle','trap-trigger|'+i):''}${dm?v80Btn('Sil','trap-del|'+i,'danger'):''}</div></article>`).join('') || `<p class="v80-muted">Henüz tuzak yok. Tuzaklar Savaş ekranında da görünür.</p>`;
      body += v80Panel('Tuzak ve Bulmaca Havuzu',`<p class="v80-hint">Gizli kurulu tuzaklar oyunculara pasif Perception değerleri DC’ye ulaştığında otomatik görünür. DM isterse tuzağı açığa çıkarabilir veya savaşta tetikleyebilir.</p><div class="v80-list">${list}</div><div class="v80-actions">${dm?v80Btn('Tuzak ekle','trap-add','primary'):''}</div>`,12);
    }
    return `<div class="v80-shell"><div class="v80-head"><div><small>KAMPANYA SİSTEMLERİ • BUILD 80</small><h2>Üs, itibar ve yaşayan dünya</h2></div><span class="v80-badge">${dm?'DM düzenleme modu':'Oyuncu görünümü'}</span></div>${body}</div>`;
  }

  function v80Pets() {
    const v = v80Ensure(), dm = v80Role() === 'dm', me = auth?.id;
    const visible = dm ? v.pets : v.pets.filter(p => p.ownerUserId === me || p.public !== false);
    const cards = visible.map((p,i) => { const real = v.pets.indexOf(p), rel=Math.max(0,Math.min(100,+p.relationship||0)); return `<article class="v80-panel v80-pet-card v80-span-4"><div class="v80-pet-title"><div><h3>${v80Esc(p.name)}</h3><span class="v80-pet-species">${v80Esc(p.species || 'Bilinmeyen tür')}</span></div><span class="v80-badge">${v80RelLabel(rel)}</span></div><div class="v80-pet-stats"><div><b>${rel}</b><small>İlişki</small></div><div><b>${p.hp ?? 1}/${p.maxHp ?? p.hp ?? 1}</b><small>HP</small></div><div><b>${p.training || 0}</b><small>Eğitim</small></div></div><div class="v80-meter"><i style="width:${rel}%"></i></div><div class="v80-pet-note">${v80Esc(p.notes || 'Bu pet için not yok.')}</div><div class="v80-actions">${(dm||p.ownerUserId===me)?v80Btn('Besle','pet-rel|'+real+'|2'):''}${(dm||p.ownerUserId===me)?v80Btn('Oyna','pet-rel|'+real+'|3'):''}${(dm||p.ownerUserId===me)?v80Btn('Eğit','pet-train|'+real):''}${dm?v80Btn('Düzenle','pet-edit|'+real):''}${dm?v80Btn('Sil','pet-del|'+real,'danger'):''}</div></article>`; }).join('') || `<div class="v80-panel v80-span-12"><p class="v80-muted">Henüz evcil hayvan yok. Örümceğini burada pet olarak kaydedip ilişki puanını yükseltebilirsin.</p></div>`;
    return `<div class="v80-shell"><div class="v80-head"><div><small>YOLDAŞLAR • İLİŞKİ SİSTEMİ</small><h2>Evcil Hayvanlar</h2></div><div class="v80-actions">${v80Btn('Pet ekle','pet-add','primary')}</div></div><p class="v80-hint">Pet sahibi karaktere bağlanır. İlişki puanı günlük bakım, oyun ve eğitimle artar; DM isterse notlara özel yetenek veya hikâye bağı ekleyebilir.</p><div class="v80-grid">${cards}</div></div>`;
  }

  function v80Notebook() {
    const v=v80Ensure(), key=auth?.id||'anonymous', book=v80Role()==='dm'?v.notebooks.dm:v.notebooks.players[key];
    book.pages ??=[]; if(!book.pages.length) book.pages.push({id:v80Id(),title:'Yeni Sayfa',body:'',npcIds:[],attachment:null});
    v80BookPage=Math.max(0,Math.min(v80BookPage,book.pages.length-1)); const p=book.pages[v80BookPage];
    const npcs=(p.npcIds||[]).map(id=>state.npcs?.find(n=>n.id===id)).filter(Boolean);
    const npcOptions=(state.npcs||[]).map(n=>`<option value="${v80Esc(n.id)}">${v80Esc(n.name)}</option>`).join('');
    const attachment=p.attachment?`<div class="v80-attachment"><b>Ek:</b> ${v80Esc(p.attachment.name)} ${p.attachment.type?.startsWith('image/')?`<img src="${v80Esc(p.attachment.data)}" alt="Ek görsel">`:`<a href="${v80Esc(p.attachment.data)}" download="${v80Esc(p.attachment.name)}">Dosyayı indir</a>`}</div>`:'';
    return `<div class="v80-shell"><div class="v80-bookbar"><div><small>HİKÂYE ARŞİVİ</small><h2>${v80Esc(book.title)}</h2></div><div class="v80-book-controls">${v80Btn('‹ Önceki','book-prev')}${v80Btn('Sonraki ›','book-next')}${v80Btn('+ Sayfa','book-add','primary')}${book.pages.length>1?v80Btn('Sayfayı sil','book-del','danger'):''}</div></div><div class="v80-book"><article class="v80-page ${v80BookFlip?'page-flip':''}">${v80Input('v80BookTitle','Sayfa başlığı',p.title)}${v80Area('v80BookBody','Metin',p.body)}<div class="v80-actions"><label class="v80-actions">NPC etiketi<select id="v80BookNpc"><option value="">NPC seç…</option>${npcOptions}</select></label>${v80Btn('NPC’yi etiketle','book-tag')}${v80Btn('Dosya/görsel ekle','book-file')}${v80Btn('Sayfayı kaydet','book-save','primary')}<input id="v80BookFile" type="file" hidden></div><div>${npcs.map(n=>`<span class="v80-tag">♙ ${v80Esc(n.name)} ${v80Btn('×','book-untag|'+n.id)}</span>`).join('')}</div>${attachment}<div class="v80-page-footer"><span>Sayfa ${v80BookPage+1} / ${book.pages.length}</span><span>${v80Role()==='dm'?'DM defteri':'Kişisel oyuncu defteri'}</span></div></article></div></div>`;
  }

  function v80BattleTrapPanel(dm) {
    const v=v80Ensure();
    const rows=v.traps.map((t,i)=>`<article class="v80-row ${t.triggered?'v80-trap-triggered':t.revealed?'v80-trap-revealed':'v80-trap-hidden'}"><div><b>${v80Esc(t.name)}</b><small>DC ${+t.dc||10} • ${v80Esc(t.position||'Alan')} • ${t.triggered?'Tetiklendi':t.revealed?'Oyuncular görüyor':'Gizli'}</small></div><div class="v80-actions">${dm?v80Btn('Aç/Gizle','trap-reveal|'+i):''}${dm?v80Btn('Tetikle','trap-trigger|'+i):''}</div></article>`).join('') || `<p class="v80-muted">Bu savaşta tuzak yok.</p>`;
    return `<section class="card span12 v80-battle-traps"><h3>Savaş Alanı Tuzakları</h3><p class="v80-muted">Pasif Perception değeri, gizli tuzakların oyuncu ekranında görünmesini belirler.</p><div class="v80-list">${rows}</div>${dm?`<div class="v80-actions">${v80Btn('Tuzak ekle','trap-add','primary')}</div>`:''}</section>`;
  }
  function v80PlayerDetections() {
    const c=v80Character(), pp=v80Passive(c), v=v80Ensure();
    const seen=v.traps.filter(t=>t.revealed||pp>=(+t.dc||10));
    return `<section class="card span12 v80-battle-traps"><h3>Sezilen Tuzaklar</h3><p class="v80-muted">Pasif Perception: ${pp}</p>${seen.length?`<div class="v80-list">${seen.map(t=>`<article class="v80-row v80-trap-revealed"><div><b>${v80Esc(t.name)}</b><small>${v80Esc(t.position||'Savaş alanı')} • ${v80Esc(t.effect||'Tehlike tespit edildi')}</small></div><span class="v80-badge">Fark edildi</span></article>`).join('')}</div>`:'<p class="v80-muted">Şimdilik gizli bir tehlike fark etmedin.</p>'}</section>`;
  }

  function v80ModalAction(action) {
    const v=v80Ensure();
    if(action==='base-save'){const b=v.bastion;Object.assign(b,{name:$('#v80BaseName')?.value||b.name,level:+$('#v80BaseLevel')?.value||1,morale:Math.max(0,Math.min(100,+$('#v80BaseMorale')?.value||0)),defense:+$('#v80BaseDefense')?.value||0,treasury:+$('#v80BaseTreasury')?.value||0,notes:$('#v80BaseNotes')?.value||''});v80Save();render();return;}
    if(action==='room-add'){modal('Üs odası',v80Input('v80RoomName','Oda adı')+v80Input('v80RoomLevel','Seviye',1,'number')+v80Area('v80RoomEffect','İşlev','')+'<button class="primary" data-v80-action="room-save">Kaydet</button>');return;}
    if(action==='room-save'){v.bastion.rooms.push({id:v80Id(),name:$('#v80RoomName').value,level:+$('#v80RoomLevel').value||1,effect:$('#v80RoomEffect').value});v80Save();$('#modal').close();render();return;}
    if(action.startsWith('room-up|')){const i=+action.split('|')[1];if(v.bastion.rooms[i])v.bastion.rooms[i].level=(+v.bastion.rooms[i].level||1)+1;v80Save();render();return;}
    if(action.startsWith('room-del|')){v.bastion.rooms.splice(+action.split('|')[1],1);v80Save();render();return;}
    if(action==='project-add'){modal('Üs projesi',v80Input('v80ProjectName','Proje')+v80Area('v80ProjectNote','Not','')+'<button class="primary" data-v80-action="project-save">Kaydet</button>');return;}
    if(action==='project-save'){v.bastion.projects.push({id:v80Id(),name:$('#v80ProjectName').value,note:$('#v80ProjectNote').value,progress:0});v80Save();$('#modal').close();render();return;}
    if(action.startsWith('project-up|')){const i=+action.split('|')[1];v.bastion.projects[i].progress=Math.min(100,(+v.bastion.projects[i].progress||0)+10);v80Save();render();return;}
    if(action.startsWith('project-del|')){v.bastion.projects.splice(+action.split('|')[1],1);v80Save();render();return;}
    if(action==='hireling-add'){modal('Üs personeli',v80Input('v80HireName','Ad')+v80Input('v80HireRole','Rol')+v80Input('v80HireCost','Haftalık ücret (CP)',0,'number')+'<button class="primary" data-v80-action="hireling-save">Kaydet</button>');return;}
    if(action==='hireling-save'){v.bastion.hirelings.push({id:v80Id(),name:$('#v80HireName').value,role:$('#v80HireRole').value,cost:+$('#v80HireCost').value||0});v80Save();$('#modal').close();render();return;}
    if(action.startsWith('hireling-del|')){v.bastion.hirelings.splice(+action.split('|')[1],1);v80Save();render();return;}
    if(action==='faction-add'){modal('Fraksiyon',v80Input('v80FactionName','Ad')+v80Input('v80FactionStanding','İtibar',0,'number')+v80Area('v80FactionDesc','Açıklama','')+'<button class="primary" data-v80-action="faction-save">Kaydet</button>');return;}
    if(action.startsWith('faction-edit|')){const i=+action.split('|')[1],f=v.factions[i];modal('Fraksiyonu düzenle',v80Input('v80FactionName','Ad',f.name)+v80Input('v80FactionStanding','İtibar',f.standing,'number')+v80Area('v80FactionDesc','Açıklama',f.description)+'<button class="primary" data-v80-action="faction-update|'+i+'">Kaydet</button>');return;}
    if(action==='faction-save'){v.factions.push({id:v80Id(),name:$('#v80FactionName').value,standing:+$('#v80FactionStanding').value||0,description:$('#v80FactionDesc').value});v80Save();$('#modal').close();render();return;}
    if(action.startsWith('faction-update|')){const i=+action.split('|')[1];Object.assign(v.factions[i],{name:$('#v80FactionName').value,standing:+$('#v80FactionStanding').value||0,description:$('#v80FactionDesc').value});v80Save();$('#modal').close();render();return;}
    if(action.startsWith('faction-del|')){v.factions.splice(+action.split('|')[1],1);v80Save();render();return;}
    if(action==='event-add'){modal('Dünya olayı',v80Input('v80EventTitle','Başlık')+v80Input('v80EventLocation','Konum')+v80Input('v80EventStatus','Durum','Aktif')+v80Area('v80EventDesc','Açıklama','')+'<button class="primary" data-v80-action="event-save">Kaydet</button>');return;}
    if(action==='event-save'){v.worldEvents.push({id:v80Id(),title:$('#v80EventTitle').value,location:$('#v80EventLocation').value,status:$('#v80EventStatus').value,description:$('#v80EventDesc').value,createdAt:v80Now()});v80Save();$('#modal').close();render();return;}
    if(action.startsWith('event-status|')){const i=+action.split('|')[1],statuses=['Aktif','Gelişiyor','Çözüldü','Başarısız'];v.worldEvents[i].status=statuses[(statuses.indexOf(v.worldEvents[i].status)+1)%statuses.length];v80Save();render();return;}
    if(action.startsWith('event-del|')){v.worldEvents.splice(+action.split('|')[1],1);v80Save();render();return;}
    if(action==='trap-add'){modal('Savaş tuzağı',v80Input('v80TrapName','Tuzak adı')+v80Input('v80TrapDc','Perception DC',12,'number')+v80Input('v80TrapPosition','Konum')+v80Input('v80TrapDamage','Hasar','')+v80Input('v80TrapEffect','Etki','')+v80Area('v80TrapTrigger','Tetikleyici','')+'<button class="primary" data-v80-action="trap-save">Savaş alanına ekle</button>');return;}
    if(action==='trap-save'){v.traps.push({id:v80Id(),name:$('#v80TrapName').value,dc:+$('#v80TrapDc').value||12,position:$('#v80TrapPosition').value,damage:$('#v80TrapDamage').value,effect:$('#v80TrapEffect').value,trigger:$('#v80TrapTrigger').value,armed:true,revealed:false,triggered:false});v80Save();$('#modal').close();render();return;}
    if(action.startsWith('trap-arm|')){const i=+action.split('|')[1];v.traps[i].armed=v.traps[i].armed===false;v80Save();render();return;}
    if(action.startsWith('trap-reveal|')){const i=+action.split('|')[1];v.traps[i].revealed=!v.traps[i].revealed;v80Save();render();return;}
    if(action.startsWith('trap-trigger|')){const i=+action.split('|')[1];v.traps[i].triggered=true;v.traps[i].armed=false;state.log??=[];state.log.push(`Tuzak tetiklendi: ${v.traps[i].name}`);v80Save();render();return;}
    if(action.startsWith('trap-del|')){v.traps.splice(+action.split('|')[1],1);v80Save();render();return;}
    if(action==='pet-add'){const owners=(state.characters||[]).map(c=>`<option value="${v80Esc(c.id)}" data-user="${v80Esc(c.userId||'')}">${v80Esc(c.name)}</option>`).join('');modal('Evcil hayvan',v80Input('v80PetName','Ad')+v80Input('v80PetSpecies','Tür','Örümcek')+`<label>Sahip karakter<select id="v80PetOwner"><option value="">Sahipsiz / ortak</option>${owners}</select></label>`+v80Input('v80PetHp','HP',1,'number')+v80Input('v80PetAc','AC',10,'number')+v80Area('v80PetNotes','Notlar','')+'<button class="primary" data-v80-action="pet-save">Kaydet</button>');return;}
    if(action.startsWith('pet-edit|')){const i=+action.split('|')[1],p=v.pets[i];modal('Pet düzenle',v80Input('v80PetName','Ad',p.name)+v80Input('v80PetSpecies','Tür',p.species)+v80Input('v80PetHp','HP',p.maxHp,'number')+v80Area('v80PetNotes','Notlar',p.notes)+'<button class="primary" data-v80-action="pet-update|'+i+'">Kaydet</button>');return;}
    if(action==='pet-save'){const owner=$('#v80PetOwner')?.selectedOptions?.[0],cid=$('#v80PetOwner')?.value||'',char=state.characters?.find(c=>c.id===cid);v.pets.push({id:v80Id(),name:$('#v80PetName').value,species:$('#v80PetSpecies').value,ownerCharacterId:cid,ownerUserId:owner?.dataset.user||auth?.id,relationship:0,training:0,hp:+$('#v80PetHp').value||1,maxHp:+$('#v80PetHp').value||1,ac:+$('#v80PetAc').value||10,notes:$('#v80PetNotes').value,public:true});v80Save();$('#modal').close();render();return;}
    if(action.startsWith('pet-update|')){const i=+action.split('|')[1],p=v.pets[i];Object.assign(p,{name:$('#v80PetName').value,species:$('#v80PetSpecies').value,maxHp:+$('#v80PetHp').value||p.maxHp,hp:Math.min(p.hp||p.maxHp,+$('#v80PetHp').value||p.maxHp),notes:$('#v80PetNotes').value});v80Save();$('#modal').close();render();return;}
    if(action.startsWith('pet-del|')){v.pets.splice(+action.split('|')[1],1);v80Save();render();return;}
    if(action.startsWith('pet-rel|')){const [,i,amount]=action.split('|'),p=v.pets[+i];if(p){p.relationship=Math.min(100,(+p.relationship||0)+(+amount||0));v80Save();render();}return;}
    if(action.startsWith('pet-train|')){const i=+action.split('|')[1],p=v.pets[i];if(p){p.training=Math.min(100,(+p.training||0)+1);p.relationship=Math.min(100,(+p.relationship||0)+1);v80Save();render();}return;}
    if(action==='book-prev'||action==='book-next'){const book=v80Role()==='dm'?v.notebooks.dm:v.notebooks.players[auth?.id||'anonymous'];v80BookPage=Math.max(0,Math.min(book.pages.length-1,v80BookPage+(action==='book-next'?1:-1)));v80BookFlip=true;setTimeout(()=>{v80BookFlip=false;render()},30);render();return;}
    if(action==='book-add'){const book=v80Role()==='dm'?v.notebooks.dm:v.notebooks.players[auth?.id||'anonymous'];book.pages.splice(v80BookPage+1,0,{id:v80Id(),title:'Yeni Sayfa',body:'',npcIds:[],attachment:null});v80BookPage++;v80Save();render();return;}
    if(action==='book-del'){const book=v80Role()==='dm'?v.notebooks.dm:v.notebooks.players[auth?.id||'anonymous'];if(book.pages.length>1){book.pages.splice(v80BookPage,1);v80BookPage=Math.max(0,v80BookPage-1);v80Save();render();}return;}
    if(action==='book-save'){const book=v80Role()==='dm'?v.notebooks.dm:v.notebooks.players[auth?.id||'anonymous'],p=book.pages[v80BookPage];Object.assign(p,{title:$('#v80BookTitle')?.value||'Adsız Sayfa',body:$('#v80BookBody')?.value||'',attachment:v80PendingFile||p.attachment});v80PendingFile=null;v80Save();render();v80Toast('Sayfa kaydedildi');return;}
    if(action==='book-tag'){const id=$('#v80BookNpc')?.value;if(!id)return;const book=v80Role()==='dm'?v.notebooks.dm:v.notebooks.players[auth?.id||'anonymous'],p=book.pages[v80BookPage];p.npcIds??=[];if(!p.npcIds.includes(id))p.npcIds.push(id);v80Save();render();return;}
    if(action.startsWith('book-untag|')){const id=action.split('|')[1],book=v80Role()==='dm'?v.notebooks.dm:v.notebooks.players[auth?.id||'anonymous'],p=book.pages[v80BookPage];p.npcIds=(p.npcIds||[]).filter(x=>x!==id);v80Save();render();return;}
  }

  const oldRender = render;
  v80Nav();
  dmPages.bastion = v80Bastion; playerPages.bastion = v80Bastion;
  dmPages.pets = v80Pets; playerPages.pets = v80Pets;
  dmPages.notebook = v80Notebook; playerPages.notebook = v80Notebook;
  const oldEncounterDM = dmPages.encounter, oldEncounterPlayer = playerPages.encounterview;
  dmPages.encounter = () => `${oldEncounterDM()}${v80BattleTrapPanel(true)}`;
  playerPages.encounterview = () => `${oldEncounterPlayer()}${v80PlayerDetections()}`;
  render = function(){v80Ensure();return oldRender();};

  document.addEventListener('click', e => {
    const b=e.target.closest('[data-v80-action],[data-v80-tab]'); if(!b)return;
    if (b.dataset.v80Tab) { v80Tab=b.dataset.v80Tab; render(); return; }
    v80ModalAction(b.dataset.v80Action);
  });
  document.addEventListener('click', e => {
    if(e.target.id==='v80BookFile'){return;}
    if(e.target.closest('[data-v80-action="book-file"]')) $('#v80BookFile')?.click();
  });
  document.addEventListener('change', e => {
    if(e.target.id!=='v80BookFile'||!e.target.files?.[0])return;
    const f=e.target.files[0]; if(f.size>2*1024*1024){alert('Defter eki 2 MB’dan küçük olmalı.');return;}
    const reader=new FileReader();reader.onload=()=>{v80PendingFile={name:f.name,type:f.type,data:reader.result};v80Toast('Ek hazır; Sayfayı kaydet’e bas.');};reader.readAsDataURL(f);
  });
  if (auth && current) render();
})();
