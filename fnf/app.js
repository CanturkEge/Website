/* FNF's first playable shell. Game rules and authorization are enforced in SQL. */
(() => {
  'use strict';
  const cfg = window.FNF_CONFIG || {};
  const app = document.querySelector('#app');
  const out = document.querySelector('#signOut');
  const account = document.querySelector('#accountName');
  const configured = cfg.url?.startsWith('https://') && cfg.publishableKey?.startsWith('sb_publishable_');
  const db = configured && window.supabase?.createClient(cfg.url, cfg.publishableKey, {
    auth: { storageKey: 'fnf-auth-v1', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  const state = { user: null, rooms: [], room: null, members: [], characters: [], tab: 'overview', authMode: 'login', step: 0, draft: freshDraft() };
  const species = [
    {id:'human',name:'İnsan',icon:'◇',desc:'Uyumlu; her işe el atabilir. Diplomasi +1.'},
    {id:'elf',name:'Elf',icon:'✧',desc:'Doğanın dilini okur. Botanik +1.'},
    {id:'dwarf',name:'Cüce',icon:'◆',desc:'Toprağa ve taşa aşina. Zanaat +1.'},
    {id:'orc',name:'Ork',icon:'◈',desc:'Zorlu koşullarda dirençli. Savunma +1.'},
    {id:'dragonborn',name:'Ejderdoğan',icon:'✦',desc:'Kadim izleri sezer. Keşif +1.'},
    {id:'halfling',name:'Buçukluk',icon:'❖',desc:'Yuvayı ve canlıları gözetir. Hayvancılık +1.'}
  ];
  const classes = [
    {id:'nature',name:'Doğa Bilimleri',icon:'✳',desc:'Canlıları ve gizemli maddeleri anla.',specialties:[['healer','Şifacı','Şifalı otlar ve iyileştirme'],['alchemist','Simyacı','Büyülü nesneler ve dönüşüm'],['artisan','Üretici','Gıda, içki ve işleme']]},
    {id:'villager',name:'Köylü',icon:'❀',desc:'Toprağı, bahçeyi ve hayvanları büyüt.',specialties:[['herder','Hayvancı','Sürülerin bakımı ve yetiştirme'],['farmer','Çiftçi','Tarlalar ve ekin verimi'],['gardener','Bahçeci','Ağaçlar ve bahçe bitkileri']]},
    {id:'physical',name:'Fiziksel',icon:'✥',desc:'Sınırları araştır, yerleşimi koru.',specialties:[['warrior','Savaşçı','Yerleşim savunması'],['miner','Madenci','Yer altı kaynakları'],['explorer','Kaşif','Yeni bölgeler ve izler']]},
    {id:'engineering',name:'Mühendislik',icon:'⌁',desc:'Yapılar, deneyler ve bilgiyle ilerle.',specialties:[['builder','Yapı Ustası','Sağlam binalar ve inşaat'],['chemist','Kimyager','Gübre, barut ve maddeler'],['researcher','Araştırmacı','Keşifleri çözümleme']]}
  ];
  const skillInfo = [
    ['botany','Botanik','Bitkileri tanı ve yetiştir'],['husbandry','Hayvancılık','Hayvan bakımını öğren'],
    ['craft','Zanaat','Üret ve işle'],['engineering','Mühendislik','Kur ve onar'],
    ['research','Araştırma','Bilinmeyeni çöz'],['exploration','Keşif','Yeni yerleri gözle'],
    ['defense','Savunma','Tehlikelerle baş et'],['diplomacy','Diplomasi','Yolcularla anlaş']
  ];
  const bonuses = {human:'diplomacy',elf:'botany',dwarf:'craft',orc:'defense',dragonborn:'exploration',halfling:'husbandry'};
  const el = s => app.querySelector(s);
  const safe = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function freshDraft(){return { name:'', species:'', class_id:'', specialty:'', skills:Object.fromEntries(['botany','husbandry','craft','engineering','research','exploration','defense','diplomacy'].map(k=>[k,0])) };}
  function feedback(message, success=false,selector='.feedback'){const node=el(selector);if(node){node.textContent=message;node.classList.toggle('ok',success)}}
  function busy(button, on){if(button){button.disabled=on;button.dataset.label ||= button.textContent;button.textContent=on?'Bir saniye…':button.dataset.label}}
  function showError(error,selector){feedback(error?.message || 'Bir sorun oluştu. Tekrar dene.',false,selector);}
  async function refreshRooms(){
    const {data,error}=await db.from('fnf_room_members').select('role, room_id, fnf_rooms(id,name,code,created_at)').order('joined_at',{ascending:false});
    if(error) throw error;
    state.rooms=(data||[]).filter(row=>row.fnf_rooms).map(row=>({...row.fnf_rooms,role:row.role}));
    if(state.room) state.room=state.rooms.find(r=>r.id===state.room.id)||null;
  }
  async function openRoom(id){
    state.room=state.rooms.find(r=>r.id===id)||null;
    if(!state.room) return render();
    const [members,characters]=await Promise.all([
      db.from('fnf_room_members').select('user_id,role,joined_at').eq('room_id',id).order('joined_at'),
      db.from('fnf_characters').select('id,user_id,name,species,class_id,specialty,skills,created_at').eq('room_id',id).order('created_at')
    ]);
    if(members.error || characters.error) return showError(members.error||characters.error);
    state.members=members.data||[];state.characters=characters.data||[];state.tab='overview';render();
  }
  function shell(){
    out.hidden=!state.user; account.hidden=!state.user;
    account.textContent=state.user?.email?.split('@')[0]||'';
  }
  function render(){
    shell();
    if(!configured || !db){app.innerHTML='<div class="panel"><h2>Kurulum bekleniyor</h2><p>FNF veritabanı bağlantısı henüz yapılandırılmadı.</p></div>';return}
    if(!state.user) return renderAuth();
    if(!state.room) return renderLobby();
    if(!state.characters.some(c=>c.user_id===state.user.id)) return renderCreation();
    return renderGame();
  }
  function renderAuth(){
    const signup=state.authMode==='signup';
    app.innerHTML=`<div class="hero"><section><span class="eyebrow">FARMS & FIELDS · YENİ BİR HİKÂYE</span><h1>Bir dünya<br><i>yetiştir.</i></h1><p class="lead">Bilmediğin bir toprağa yerleş. Arkadaşlarınla bir köy kur; tohumların sırrını, mevsimlerin dilini ve gökten gelen işaretleri birlikte çöz.</p><div class="chips"><span class="chip">✳ Yerleşim</span><span class="chip">❀ Keşif</span><span class="chip">◇ Üretim</span><span class="chip">✧ Mitoloji</span></div></section><section class="auth-card"><span class="eyebrow">YOLCULUĞUN BAŞLANGICI</span><h2>${signup?'Yeni hesap aç':'Tekrar hoş geldin'}</h2><p class="muted">FNF hesabın D&D hesabından ayrıdır. Bu dünyanın kendi kaydı var.</p><div class="segmented"><button type="button" data-auth="login" class="${signup?'':'active'}">Giriş</button><button type="button" data-auth="signup" class="${signup?'active':''}">Kayıt ol</button></div><form id="authForm"><label for="email">E-posta</label><input required id="email" type="email" autocomplete="email" placeholder="sen@ornek.com"><label for="password">Şifre</label><input required id="password" type="password" minlength="6" autocomplete="${signup?'new-password':'current-password'}" placeholder="En az 6 karakter"><button class="button full">${signup?'Hesap oluştur':'Oyuna gir'}</button><p class="feedback" role="status"></p></form></section></div>`;
    app.querySelectorAll('[data-auth]').forEach(b=>b.onclick=()=>{state.authMode=b.dataset.auth;render()});
    el('#authForm').onsubmit=async e=>{
      e.preventDefault();const button=e.submitter;busy(button,true);
      const email=el('#email').value.trim(), password=el('#password').value;
      const {data,error}=signup?await db.auth.signUp({email,password,options:{emailRedirectTo:'https://egecanturk.dev/fnf/'}}):await db.auth.signInWithPassword({email,password});
      busy(button,false);
      if(error) return showError(error);
      if(signup&&!data.session) return feedback('Hesabını doğrulamak için gelen e-postadaki bağlantıyı aç.',true);
      if(data.session){state.user=data.session.user;try{await refreshRooms()}catch(err){return showError(err)}render()}
    };
  }
  function renderLobby(){
    app.innerHTML=`<section class="page-intro"><div><span class="eyebrow">OYUN LOBİSİ</span><h1>Yolunu seç.</h1><p>Yeni bir yerleşim başlat veya arkadaşının oda koduyla katıl.</p></div></section><div class="grid-2"><section class="panel"><span class="panel-kicker">SENİN ODALARIN</span><h2>Yerleşimler</h2><div class="room-list">${state.rooms.length?state.rooms.map(r=>`<div class="room-row"><div><strong>${safe(r.name)}</strong><small>${r.role==='dm'?'Kurucu · DM':'Oyuncu'} · ${safe(r.code)}</small></div><button class="button secondary" data-open="${safe(r.id)}">Odaya gir →</button></div>`).join(''):'<div class="empty">Henüz bir odaya katılmadın. İlk tohum burada atılacak.</div>'}</div></section><div><section class="panel"><span class="panel-kicker">KURUCULAR İÇİN</span><h2>Oda kur</h2><p>Oda kurma şifresi yalnızca yetki verdiğin arkadaşlarında olmalı. Odana katılacak oyuncular için ayrı bir kod oluşur.</p><form id="createForm"><label for="roomName">Yerleşimin adı</label><input id="roomName" required maxlength="48" placeholder="Ör. Sisli Vadi"><label for="roomPassword">Oda kurma şifresi</label><input id="roomPassword" type="password" required autocomplete="off" placeholder="Kurucu şifresi"><button class="button full">Yeni oda oluştur</button><p class="feedback" role="status"></p></form></section><section class="panel" style="margin-top:18px"><span class="panel-kicker">OYUNCULAR İÇİN</span><h2>Kodla katıl</h2><form id="joinForm"><label for="roomCode">Davet kodu</label><input id="roomCode" required maxlength="10" autocomplete="off" placeholder="10 karakterli kod"><button class="button secondary full">Odaya katıl</button><p class="feedback" role="status"></p></form></section></div></div>`;
    app.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openRoom(b.dataset.open));
    el('#createForm').onsubmit=async e=>{e.preventDefault();const b=e.submitter;busy(b,true);const {data,error}=await db.rpc('fnf_create_room',{p_name:el('#roomName').value.trim(),p_password:el('#roomPassword').value});busy(b,false);if(error||data?.error)return showError(error||{message:data.error});try{await refreshRooms();await openRoom(data.id)}catch(err){showError(err)}};
    el('#joinForm').onsubmit=async e=>{e.preventDefault();const b=e.submitter;busy(b,true);const {data,error}=await db.rpc('fnf_join_room',{p_code:el('#roomCode').value.trim().toUpperCase()});busy(b,false);if(error||data?.error)return showError(error||{message:data.error},'#joinForm .feedback');try{await refreshRooms();await openRoom(data.id)}catch(err){showError(err,'#joinForm .feedback')}};
  }
  function renderCreation(){
    const d=state.draft, step=state.step;
    const titles=['Sen kimsin?','Yolun ne?','Ustalığını seç.','İlk becerilerin.'];
    const caption=['Bir isim ve köken seç. Türün küçük bir doğal yatkınlık verir.','Dört ana yol; her biri yerleşime başka gözle bakar.','Bu alanda başlangıçta daha fazla bilgiye sahip olacaksın.','Altı başlangıç puanını dağıt. Bir beceriye en fazla üç puan verebilirsin.'];
    const klass=classes.find(c=>c.id===d.class_id);
    let body='';
    if(step===0) body=`<label for="characterName">Karakter adı</label><input id="characterName" maxlength="32" required placeholder="Adını yaz" value="${safe(d.name)}"><div class="card-grid">${species.map(x=>choice(x,d.species===x.id,'species')).join('')}</div>`;
    if(step===1) body=`<div class="card-grid">${classes.map(x=>choice(x,d.class_id===x.id,'class')).join('')}</div>`;
    if(step===2) body=`<div class="card-grid">${(klass?.specialties||[]).map(x=>choice({id:x[0],name:x[1],desc:x[2],icon:klass.icon},d.specialty===x[0],'specialty')).join('')}</div>`;
    if(step===3){let remaining=6-Object.values(d.skills).reduce((a,b)=>a+b,0);body=`<p class="points">Kalan puan: <span id="remaining">${remaining}</span> / 6</p><div class="skills">${skillInfo.map(([id,name,desc])=>`<div class="skill"><div><strong>${name}${bonuses[d.species]===id?' <span class="badge">Tür +1</span>':''}</strong><small>${desc}</small></div><div class="skill-controls"><button type="button" data-skill="${id}" data-delta="-1" aria-label="${name} azalt" ${d.skills[id]===0?'disabled':''}>−</button><b>${d.skills[id]}</b><button type="button" data-skill="${id}" data-delta="1" aria-label="${name} artır" ${remaining===0||d.skills[id]===3?'disabled':''}>+</button></div></div>`).join('')}</div><p class="muted">Tür bonusu ayrıca uygulanır. Diğer seçimler ileride açılacak bilgilere yön verir.</p>`}
    app.innerHTML=`<div class="wizard-heading"><span class="eyebrow">${safe(state.room.name)} · KARAKTER OLUŞTURMA</span><h1>${titles[step]}</h1><p class="muted">${caption[step]}</p><div class="steps" aria-label="Adım ${step+1} / 4">${[0,1,2,3].map(i=>`<span class="${i<=step?'active':''}"></span>`).join('')}</div></div><section class="panel wizard-panel"><span class="panel-kicker">ADIM 0${step+1} / 04</span>${body}<div class="wizard-actions"><button id="back" class="button secondary">${step?'← Geri':'← Lobi'}</button><button id="next" class="button">${step===3?'Karakteri oluştur':'Devam →'}</button></div><p class="feedback" role="status"></p></section>`;
    app.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{let type=b.dataset.choice;if(type==='class'&&d.class_id!==b.dataset.value)d.specialty='';d[type==='class'?'class_id':type]=b.dataset.value;if(step===0)d.name=el('#characterName').value;renderCreation()});
    app.querySelectorAll('[data-skill]').forEach(b=>b.onclick=()=>{const k=b.dataset.skill,n=Number(b.dataset.delta),sum=Object.values(d.skills).reduce((a,x)=>a+x,0);if(d.skills[k]+n<0||d.skills[k]+n>3||sum+n>6)return;d.skills[k]+=n;renderCreation()});
    el('#back').onclick=()=>{if(step){state.step--;renderCreation()}else{state.room=null;render()}};
    el('#next').onclick=async e=>{
      if(step===0){d.name=el('#characterName').value.trim();if(d.name.length<2||!d.species)return feedback('İsim (en az 2 harf) ve tür seç.')} 
      if(step===1&&!d.class_id)return feedback('Bir ana yol seç.');
      if(step===2&&!d.specialty)return feedback('Bir uzmanlık seç.');
      if(step<3){state.step++;renderCreation();return}
      if(Object.values(d.skills).reduce((a,b)=>a+b,0)!==6)return feedback('Altı puanın tamamını dağıt.');
      const b=e.currentTarget;busy(b,true);
      const {data,error}=await db.rpc('fnf_create_character',{p_room_id:state.room.id,p_name:d.name,p_species:d.species,p_class_id:d.class_id,p_specialty:d.specialty,p_skills:d.skills});
      busy(b,false);if(error||data?.error)return showError(error||{message:data.error});
      state.draft=freshDraft();state.step=0;await openRoom(state.room.id);
    };
  }
  function choice(x,selected,type){return `<button type="button" class="choice ${selected?'selected':''}" data-choice="${type}" data-value="${safe(x.id)}" aria-pressed="${selected}"><span class="symbol">${x.icon}</span><strong>${safe(x.name)}</strong><small>${safe(x.desc)}</small></button>`}
  function renderGame(){
    const r=state.room,me=state.characters.find(c=>c.user_id===state.user.id),isDm=r.role==='dm';
    const speciesName=species.find(x=>x.id===me.species)?.name||me.species;
    const klass=classes.find(x=>x.id===me.class_id);
    const specName=klass?.specialties.find(x=>x[0]===me.specialty)?.[1]||me.specialty;
    app.innerHTML=`<section class="page-intro"><div><span class="eyebrow">${isDm?'KURUCU MASASI':'YERLEŞİM'} · FARMS & FIELDS</span><h1>${safe(r.name)}</h1><p>İlk gün. Toprağın nasıl bir hikâye sakladığını henüz bilmiyorsunuz.</p></div><button id="lobby" class="button secondary">← Odalar</button></section><nav class="subnav" aria-label="Oyun menüsü"><button data-tab="overview" class="${state.tab==='overview'?'active':''}">Genel bakış</button><button data-tab="character" class="${state.tab==='character'?'active':''}">Karakterim</button><button data-tab="world" class="${state.tab==='world'?'active':''}">Dünya</button></nav><div id="tabContent"></div>`;
    el('#lobby').onclick=()=>{state.room=null;render()};
    app.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;renderGame()});
    let content='';
    if(state.tab==='overview') content=`<div class="grid-2"><div class="notebook"><span class="eyebrow">BAŞLANGIÇ</span><h2>Henüz her şey mümkün.</h2><p>Burada birlikte kurduğunuz köyün takvimi, üretimi ve olayları yaşayacak. Şimdilik ilk sakinler yerleşiyor.</p></div><section class="panel"><span class="panel-kicker">ODANIZ</span><h2>${safe(r.name)}</h2><p>${isDm?'Sen oda kurucususun. Bu kodu oyunculara gönder.':'Arkadaşların bu kodla odaya katılabilir.'}</p><div class="code">${safe(r.code)}</div><button id="copyCode" class="button secondary">Kodu kopyala</button><div class="rule"></div><div class="stat-strip"><div class="stat"><b>${state.members.length}</b><small>Yolcu</small></div><div class="stat"><b>${state.characters.length}</b><small>Karakter</small></div><div class="stat"><b>01</b><small>Gün</small></div></div></section></div><section class="panel" style="margin-top:20px"><span class="panel-kicker">YERLEŞİM HALKI</span><h2>İlk sakinler</h2><div class="roster">${state.characters.map(c=>{const cl=classes.find(x=>x.id===c.class_id);return `<div class="roster-item"><div><strong>${safe(c.name)}</strong> <small>· ${safe(cl?.name||c.class_id)} · ${safe(cl?.specialties.find(x=>x[0]===c.specialty)?.[1]||c.specialty)}</small></div>${c.user_id===state.user.id?'<span class="badge">Sen</span>':''}</div>`}).join('')}</div></section>`;
    if(state.tab==='character') content=`<div class="grid-2"><section class="panel"><span class="panel-kicker">KARAKTER KARTI</span><div class="character-title"><h2>${safe(me.name)}</h2><span class="badge">Seviye 1</span></div><p>${safe(speciesName)} · ${safe(klass?.name||'')} / ${safe(specName)}</p><div class="rule"></div><span class="panel-kicker">BAŞLANGIÇ BECERİLERİ</span><div style="margin-top:15px">${skillInfo.map(([id,name])=>`<span class="skill-pill">${name} · ${Number(me.skills?.[id]||0)+(bonuses[me.species]===id?1:0)}</span>`).join('')}</div><p class="muted" style="margin-top:20px">Değerler başlangıç puanlarını ve tür bonusunu gösterir. Kullanarak gelişim sonraki aşamada eklenecek.</p></section><div class="notebook"><span class="eyebrow">YOLUN</span><h2>${safe(specName)}</h2><p>${safe(klass?.specialties.find(x=>x[0]===me.specialty)?.[2]||'')}</p><p>Bildiklerin başlangıcın; çevrendeki bilinmeyenleri deneyerek açacaksın.</p></div></div>`;
    if(state.tab==='world') content=`<div class="notice">Bu alan henüz iskelet aşamasında. Dünya simülasyonu çalışıyor gibi gösterilmiyor; sonraki sürümde yerleşim, mevsimler ve keşif burada açılacak.</div><div class="world-grid" style="margin-top:18px"><article class="world-card"><span class="symbol">❀</span><h3>Yerleşim</h3><p>Tarla, bina ve kaynak yönetimi.</p></article><article class="world-card"><span class="symbol">☼</span><h3>Mevsimler</h3><p>Hava, iklim ve yetişme koşulları.</p></article><article class="world-card"><span class="symbol">✧</span><h3>Keşif</h3><p>Bilinmeyen tohumlar, bölgeler ve alametler.</p></article></div>`;
    el('#tabContent').innerHTML=content;
    if(state.tab==='overview') el('#copyCode').onclick=async e=>{try{await navigator.clipboard.writeText(r.code);e.target.textContent='Kopyalandı ✓'}catch{e.target.textContent='Kodu seçip kopyala: '+r.code}};
  }
  out.onclick=async()=>{await db?.auth.signOut();state.user=null;state.rooms=[];state.room=null;render()};
  async function init(){
    if(!db)return render();
    const {data:{session}}=await db.auth.getSession();
    state.user=session?.user||null;
    if(state.user){try{await refreshRooms()}catch(err){render();showError(err);return}}
    render();
    db.auth.onAuthStateChange((_event,session)=>{const changed=state.user?.id!==session?.user?.id;state.user=session?.user||null;if(changed){state.room=null;state.rooms=[];if(state.user)refreshRooms().then(render).catch(showError);else render()}});
  }
  init().catch(err=>{render();showError(err)});
})();
