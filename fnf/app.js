/* Farms & Fields · v0.2.0. Authorization and character validation live in SQL. */
(() => {
  'use strict';
  const cfg = window.FNF_CONFIG || {};
  const app = document.querySelector('#app');
  const sidebar = document.querySelector('#sidebar');
  const out = document.querySelector('#signOut');
  const account = document.querySelector('#accountName');
  const menuToggle = document.querySelector('#menuToggle');
  const configured = cfg.url?.startsWith('https://') && cfg.publishableKey?.startsWith('sb_publishable_');
  const db = configured && window.supabase?.createClient(cfg.url, cfg.publishableKey, {
    auth: { storageKey:'fnf-auth-v1', persistSession:true, autoRefreshToken:true, detectSessionInUrl:true }
  });
  const species = [
    {id:'human',name:'İnsan',icon:'◇',desc:'İnsanlar anlaşmayı ve uyumu öğrenir.',stat:'presence',training:'diplomacy'},
    {id:'elf',name:'Elf',icon:'✧',desc:'Canlıların izlerini sezerek okur.',stat:'insight',training:'botany'},
    {id:'dwarf',name:'Cüce',icon:'◆',desc:'Toprağı ve işlenmiş malzemeyi tanır.',stat:'endurance',training:'craft'},
    {id:'orc',name:'Ork',icon:'◈',desc:'Zor şartlarda ayakta kalır.',stat:'power',training:'defense'},
    {id:'dragonborn',name:'Ejderdoğan',icon:'✦',desc:'Eski yolların işaretlerini bulur.',stat:'intellect',training:'exploration'},
    {id:'halfling',name:'Buçukluk',icon:'❖',desc:'Canlılarla güven kurar.',stat:'agility',training:'husbandry'}
  ];
  const classes = [
    {id:'nature',name:'Doğa Bilimleri',icon:'✳',desc:'Canlıları ve gizemli maddeleri anla.',pool:['botany','husbandry','craft','research','exploration'],specialties:[['healer','Şifacı','Şifalı otlar ve iyileştirme','botany'],['alchemist','Simyacı','Büyülü nesneler ve dönüşüm','research'],['artisan','Üretici','Gıda, içki ve işleme','craft']]},
    {id:'villager',name:'Köylü',icon:'❀',desc:'Toprağı, bahçeyi ve hayvanları büyüt.',pool:['botany','husbandry','craft','diplomacy','exploration'],specialties:[['herder','Hayvancı','Sürülerin bakımı ve yetiştirme','husbandry'],['farmer','Çiftçi','Tarlalar ve ekin verimi','botany'],['gardener','Bahçeci','Ağaçlar ve bahçe bitkileri','botany']]},
    {id:'physical',name:'Fiziksel',icon:'✥',desc:'Sınırları araştır, yerleşimi koru.',pool:['defense','exploration','craft','husbandry','diplomacy'],specialties:[['warrior','Savaşçı','Yerleşim savunması','defense'],['miner','Madenci','Yer altı kaynakları','craft'],['explorer','Kaşif','Yeni bölgeler ve izler','exploration']]},
    {id:'engineering',name:'Mühendislik',icon:'⌁',desc:'Yapılar, deneyler ve bilgiyle ilerle.',pool:['engineering','research','craft','botany','defense'],specialties:[['builder','Yapı Ustası','Sağlam binalar ve inşaat','engineering'],['chemist','Kimyager','Gübre, barut ve maddeler','research'],['researcher','Araştırmacı','Keşifleri çözümleme','research']]}
  ];
  const abilities = [
    ['power','Güç','Bedensel kuvvet'],['agility','Çeviklik','El becerisi ve hız'],
    ['endurance','Dayanıklılık','Zorlu koşullara direnç'],['intellect','Akıl','Bilgi ve çözümleme'],
    ['insight','Sezgi','Gözlem ve canlılarla bağ'],['presence','Etki','İfade ve ikna']
  ];
  const skills = [
    ['botany','Botanik','Bitki ve toprak bilgisi','insight'],['husbandry','Hayvancılık','Bakım ve yetiştirme','insight'],
    ['craft','Zanaat','Üretim ve işleme','agility'],['engineering','Mühendislik','Yapı ve onarım','intellect'],
    ['research','Araştırma','Bilinmeyeni çözme','intellect'],['exploration','Keşif','Yeni yerleri gözleme','insight'],
    ['defense','Savunma','Tehlikeyle baş etme','power'],['diplomacy','Diplomasi','Yolcularla anlaşma','presence']
  ];
  const titles = {overview:'Genel Bakış',settlement:'Yerleşim',people:'Yerleşim Halkı',character:'Karakterim',farming:'Tarım ve Kaynaklar',exploration:'Keşif',patchnotes:'Sürüm Notları'};
  const state = {user:null,rooms:[],room:null,members:[],characters:[],tab:'overview',authMode:'login',step:0,draft:freshDraft(),patchSearch:'',patchOrder:'desc'};
  const el = s => app.querySelector(s);
  const safe = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const abilityMod = score => Math.floor((score-10)/2);
  const signed = value => value>=0?'+'+value:String(value);
  const getSpecies = id => species.find(x=>x.id===id);
  const getClass = id => classes.find(x=>x.id===id);
  const getSpec = (classId,id) => getClass(classId)?.specialties.find(x=>x[0]===id);
  function freshDraft(){return {name:'',species:'',class_id:'',specialty:'',abilities:Object.fromEntries(['power','agility','endurance','intellect','insight','presence'].map(k=>[k,10])),skillChoices:[]};}
  function feedback(message,success=false,selector='.feedback'){const node=el(selector);if(node){node.textContent=message;node.classList.toggle('ok',success)}}
  function showError(error,selector){feedback(error?.message||'Bir sorun oluştu. Tekrar dene.',false,selector)}
  function busy(button,on){if(button){button.disabled=on;button.dataset.label ||= button.textContent;button.textContent=on?'Bir saniye…':button.dataset.label}}
  function skillsFor(d){return [getSpecies(d.species)?.training,getSpec(d.class_id,d.specialty)?.[3],...(d.skillChoices||d.skill_choices||[])].filter(Boolean)}
  function skillRank(d,id){return Math.min(2,skillsFor(d).filter(x=>x===id).length)}
  function scoreFor(d,id){return Number(d.abilities?.[id]??10)+(getSpecies(d.species)?.stat===id?1:0)}
  function skillBonus(d,id,ability){return abilityMod(scoreFor(d,ability))+2*skillRank(d,id)}
  function hasCharacter(){return state.characters.some(c=>c.user_id===state.user?.id)}
  async function refreshRooms(){
    const {data,error}=await db.from('fnf_room_members').select('role,room_id,fnf_rooms(id,name,code,created_at)').order('joined_at',{ascending:false});
    if(error) throw error;
    state.rooms=(data||[]).filter(x=>x.fnf_rooms).map(x=>({...x.fnf_rooms,role:x.role}));
    if(state.room) state.room=state.rooms.find(x=>x.id===state.room.id)||null;
  }
  async function openRoom(id){
    state.room=state.rooms.find(x=>x.id===id)||null;
    if(!state.room) return render();
    const [members,characters]=await Promise.all([
      db.from('fnf_room_members').select('user_id,role,joined_at').eq('room_id',id).order('joined_at'),
      db.from('fnf_characters').select('id,user_id,name,species,class_id,specialty,skills,abilities,skill_choices,created_at').eq('room_id',id).order('created_at')
    ]);
    if(members.error||characters.error){state.room=null;render();return showError(members.error||characters.error)}
    state.members=members.data||[];state.characters=characters.data||[];
    state.tab=state.room.role==='dm'||hasCharacter()?'overview':'character';render();
  }
  function render(){
    out.hidden=!state.user;account.hidden=!state.user;
    account.textContent=state.user?.email?.split('@')[0]||'';
    document.body.classList.toggle('game-mode',!!state.room);
    sidebar.hidden=!state.room;menuToggle.hidden=!state.room;
    if(!state.room){document.body.classList.remove('menu-open');menuToggle.setAttribute('aria-expanded','false')}
    if(!configured||!db){app.innerHTML='<div class="panel"><h2>Kurulum bekleniyor</h2><p>FNF veritabanı bağlantısı henüz yapılandırılmadı.</p></div>';return}
    if(!state.user) return renderAuth();
    if(!state.room) return renderLobby();
    renderSidebar();
    if(state.room.role==='player'&&!hasCharacter()&&state.tab!=='patchnotes') return renderCreation();
    return renderGame();
  }
  function renderSidebar(){
    const dm=state.room.role==='dm';
    const nav=[['overview','◈','Genel Bakış'],['settlement','⌂','Yerleşim'],dm?['people','♧','Yerleşim Halkı']:['character','◇','Karakterim'],['farming','❀','Tarım ve Kaynaklar'],['exploration','✧','Keşif'],['patchnotes','▤','Sürüm Notları']];
    sidebar.innerHTML=`<a class="side-brand" href="./"><span>✳</span><strong>Farms <i>&</i> Fields</strong><small>FNF / v0.2.0</small></a><div class="side-room"><span class="panel-kicker">AKTİF YERLEŞİM</span><strong>${safe(state.room.name)}</strong><small>${dm?'KURUCU · DM':'OYUNCU'} · ${safe(state.room.code)}</small></div><div class="side-label">OYUN MENÜSÜ</div><nav class="side-nav">${nav.map(([id,icon,label])=>`<button type="button" data-nav="${id}" class="${state.tab===id?'active':''}"><span>${icon}</span>${label}${id==='patchnotes'?'<b class="nav-dot"></b>':''}</button>`).join('')}</nav><div class="side-bottom"><button type="button" id="sideLobby">← Odalara dön</button><small>Toprak seni hatırlar.</small></div>`;
    sidebar.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.nav;document.body.classList.remove('menu-open');menuToggle.setAttribute('aria-expanded','false');render()});
    sidebar.querySelector('#sideLobby').onclick=()=>{state.room=null;render()};
  }
  function renderAuth(){
    const signup=state.authMode==='signup';
    app.innerHTML=`<div class="hero"><section><span class="eyebrow">FARMS & FIELDS · YENİ BİR HİKÂYE</span><h1>Bir dünya<br><i>yetiştir.</i></h1><p class="lead">Bilmediğin bir toprağa yerleş. Arkadaşlarınla bir köy kur; tohumların sırrını, mevsimlerin dilini ve gökten gelen işaretleri birlikte çöz.</p><div class="chips"><span class="chip">✳ Yerleşim</span><span class="chip">❀ Keşif</span><span class="chip">◇ Üretim</span><span class="chip">✧ Mitoloji</span></div></section><section class="auth-card"><span class="eyebrow">YOLCULUĞUN BAŞLANGICI</span><h2>${signup?'Yeni hesap aç':'Tekrar hoş geldin'}</h2><p class="muted">FNF hesabın D&D hesabından ayrıdır. Bu dünyanın kendi kaydı var.</p><div class="segmented"><button type="button" data-auth="login" class="${signup?'':'active'}">Giriş</button><button type="button" data-auth="signup" class="${signup?'active':''}">Kayıt ol</button></div><form id="authForm"><label for="email">E-posta</label><input required id="email" type="email" autocomplete="email" placeholder="sen@ornek.com"><label for="password">Şifre</label><input required id="password" type="password" minlength="6" autocomplete="${signup?'new-password':'current-password'}" placeholder="En az 6 karakter"><button class="button full">${signup?'Hesap oluştur':'Oyuna gir'}</button><p class="feedback" role="status"></p></form></section></div>`;
    app.querySelectorAll('[data-auth]').forEach(b=>b.onclick=()=>{state.authMode=b.dataset.auth;render()});
    el('#authForm').onsubmit=async e=>{
      e.preventDefault();const button=e.submitter;busy(button,true);
      const email=el('#email').value.trim(),password=el('#password').value;
      const {data,error}=signup?await db.auth.signUp({email,password,options:{emailRedirectTo:'https://egecanturk.dev/fnf/'}}):await db.auth.signInWithPassword({email,password});
      busy(button,false);if(error)return showError(error);
      if(signup&&!data.session)return feedback('Hesabını doğrulamak için gelen e-postadaki bağlantıyı aç.',true);
      if(data.session){state.user=data.session.user;try{await refreshRooms()}catch(err){return showError(err)}render()}
    };
  }
  function renderLobby(){
    app.innerHTML=`<section class="page-intro"><div><span class="eyebrow">OYUN LOBİSİ</span><h1>Yolunu seç.</h1><p>Yeni bir yerleşim başlat veya arkadaşının oda koduyla katıl.</p></div></section><div class="grid-2"><section class="panel"><span class="panel-kicker">SENİN ODALARIN</span><h2>Yerleşimler</h2><div class="room-list">${state.rooms.length?state.rooms.map(r=>`<div class="room-row"><div><strong>${safe(r.name)}</strong><small>${r.role==='dm'?'Kurucu · DM':'Oyuncu'} · ${safe(r.code)}</small></div><button class="button secondary" data-open="${safe(r.id)}">Odaya gir →</button></div>`).join(''):'<div class="empty">Henüz bir odaya katılmadın. İlk tohum burada atılacak.</div>'}</div></section><div><section class="panel"><span class="panel-kicker">KURUCULAR İÇİN</span><h2>Oda kur</h2><p>Kurucu şifresini yalnızca yetki verdiğin kişiler bilmeli. Oyuncular ayrı bir kodla katılır.</p><form id="createForm"><label for="roomName">Yerleşimin adı</label><input id="roomName" required maxlength="48" placeholder="Ör. Sisli Vadi"><label for="roomPassword">Oda kurma şifresi</label><input id="roomPassword" type="password" required autocomplete="off" placeholder="Kurucu şifresi"><button class="button full">Yeni oda oluştur</button><p class="feedback" role="status"></p></form></section><section class="panel stacked"><span class="panel-kicker">OYUNCULAR İÇİN</span><h2>Kodla katıl</h2><form id="joinForm"><label for="roomCode">Davet kodu</label><input id="roomCode" required maxlength="10" autocomplete="off" placeholder="10 karakterli kod"><button class="button secondary full">Odaya katıl</button><p class="feedback" role="status"></p></form></section></div></div>`;
    app.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openRoom(b.dataset.open));
    el('#createForm').onsubmit=async e=>{e.preventDefault();const b=e.submitter;busy(b,true);const {data,error}=await db.rpc('fnf_create_room',{p_name:el('#roomName').value.trim(),p_password:el('#roomPassword').value});busy(b,false);if(error||data?.error)return showError(error||{message:data.error});try{await refreshRooms();await openRoom(data.id)}catch(err){showError(err)}};
    el('#joinForm').onsubmit=async e=>{e.preventDefault();const b=e.submitter;busy(b,true);const {data,error}=await db.rpc('fnf_join_room',{p_code:el('#roomCode').value.trim().toUpperCase()});busy(b,false);if(error||data?.error)return showError(error||{message:data.error},'#joinForm .feedback');try{await refreshRooms();await openRoom(data.id)}catch(err){showError(err,'#joinForm .feedback')}};
  }
  function choice(x,selected,type){return `<button type="button" class="choice ${selected?'selected':''}" data-choice="${type}" data-value="${safe(x.id)}" aria-pressed="${selected}"><span class="symbol">${x.icon}</span><strong>${safe(x.name)}</strong><small>${safe(x.desc)}</small></button>`}
  function renderCreation(){
    const d=state.draft,step=state.step,klass=getClass(d.class_id);
    const headings=['Sen kimsin?','Yolun ne?','Ustalığını seç.','Başlangıç yeteneklerin.'];
    const descriptions=['Bir isim ve köken seç. Türün bir niteliğe +1 ve bir sabit eğitime katkı sağlar.','Dört ana yol; her biri yerleşime başka gözle bakar.','Uzmanlık, bir beceride başlangıç eğitimi verir.','Altı niteliğin hepsi 10’dan başlar. Sekiz puan dağıt, ardından yolundan iki beceri seç.'];
    let body='';
    if(step===0)body=`<label for="characterName">Karakter adı</label><input id="characterName" maxlength="32" required placeholder="Adını yaz" value="${safe(d.name)}"><div class="card-grid">${species.map(x=>choice(x,d.species===x.id,'species')).join('')}</div>`;
    if(step===1)body=`<div class="card-grid">${classes.map(x=>choice(x,d.class_id===x.id,'class')).join('')}</div>`;
    if(step===2)body=`<div class="card-grid">${(klass?.specialties||[]).map(x=>choice({id:x[0],name:x[1],desc:x[2],icon:klass.icon},d.specialty===x[0],'specialty')).join('')}</div>`;
    if(step===3){
      const remaining=68-Object.values(d.abilities).reduce((a,b)=>a+b,0);
      const fixed=[getSpecies(d.species)?.training,getSpec(d.class_id,d.specialty)?.[3]];
      const available=klass.pool.filter(x=>!fixed.includes(x));
      body=`<div class="points">Kalan nitelik puanı: <strong>${remaining}</strong> / 8 <small>10 taban · en çok 14 (+ tür bonusu)</small></div><div class="ability-grid">${abilities.map(([id,label,desc])=>`<div class="ability"><div><strong>${label}</strong><small>${desc}${getSpecies(d.species)?.stat===id?' · Tür +1':''}</small></div><div class="ability-controls"><button type="button" data-ability="${id}" data-delta="-1" aria-label="${label} azalt" ${d.abilities[id]===10?'disabled':''}>−</button><b>${scoreFor(d,id)}</b><button type="button" data-ability="${id}" data-delta="1" aria-label="${label} artır" ${remaining===0||d.abilities[id]===14?'disabled':''}>+</button></div></div>`).join('')}</div><h3>Yol becerileri <small class="muted">${d.skillChoices.length}/2 seç</small></h3><p class="muted">Türün ${skills.find(x=>x[0]===fixed[0])?.[1]} ve uzmanlığın ${skills.find(x=>x[0]===fixed[1])?.[1]} eğitimini verir. İkisi örtüşürse ustalık (+4) kazanırsın.</p><div class="training-grid">${available.map(id=>{let x=skills.find(s=>s[0]===id),selected=d.skillChoices.includes(id);return `<button type="button" class="training-choice ${selected?'selected':''}" data-training="${id}" aria-pressed="${selected}"><span>${x[1]}</span><small>${x[2]}</small><b>${selected?'✓':'+'}</b></button>`}).join('')}</div><p class="muted">Beceri bonusu = ilgili nitelik değişkeni + eğitim (+2). Ustalıkta eğitim bonusu +4 olur.</p>`;
    }
    app.innerHTML=`<section class="wizard-heading"><span class="eyebrow">${safe(state.room.name)} · KARAKTER OLUŞTURMA</span><h1>${headings[step]}</h1><p class="muted">${descriptions[step]}</p><div class="steps" aria-label="Adım ${step+1} / 4">${[0,1,2,3].map(i=>`<span class="${i<=step?'active':''}"></span>`).join('')}</div></section><section class="panel wizard-panel"><span class="panel-kicker">ADIM 0${step+1} / 04</span>${body}<div class="wizard-actions"><button id="back" class="button secondary">${step?'← Geri':'← Odalar'}</button><button id="next" class="button">${step===3?'Karakteri oluştur':'Devam →'}</button></div><p class="feedback" role="status"></p></section>`;
    app.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{const type=b.dataset.choice;if(type==='class'&&d.class_id!==b.dataset.value){d.specialty='';d.skillChoices=[]}if(type==='species'||type==='specialty')d.skillChoices=[];d[type==='class'?'class_id':type]=b.dataset.value;if(step===0)d.name=el('#characterName').value;renderCreation()});
    app.querySelectorAll('[data-ability]').forEach(b=>b.onclick=()=>{const id=b.dataset.ability,n=Number(b.dataset.delta),sum=Object.values(d.abilities).reduce((a,x)=>a+x,0);if(d.abilities[id]+n<10||d.abilities[id]+n>14||sum+n>68)return;d.abilities[id]+=n;renderCreation()});
    app.querySelectorAll('[data-training]').forEach(b=>b.onclick=()=>{const id=b.dataset.training;d.skillChoices=d.skillChoices.includes(id)?d.skillChoices.filter(x=>x!==id):d.skillChoices.length<2?[...d.skillChoices,id]:d.skillChoices;renderCreation()});
    el('#back').onclick=()=>{if(step){state.step--;renderCreation()}else{state.room=null;render()}};
    el('#next').onclick=async e=>{
      if(step===0){d.name=el('#characterName').value.trim();if(d.name.length<2||!d.species)return feedback('İsim (en az 2 harf) ve tür seç.');}
      if(step===1&&!d.class_id)return feedback('Bir ana yol seç.');
      if(step===2&&!d.specialty)return feedback('Bir uzmanlık seç.');
      if(step<3){state.step++;renderCreation();return}
      if(Object.values(d.abilities).reduce((a,b)=>a+b,0)!==68||d.skillChoices.length!==2)return feedback('Sekiz nitelik puanını dağıt ve iki yol becerisi seç.');
      const b=e.currentTarget;busy(b,true);
      const {data,error}=await db.rpc('fnf_create_character_v2',{p_room_id:state.room.id,p_name:d.name,p_species:d.species,p_class_id:d.class_id,p_specialty:d.specialty,p_abilities:d.abilities,p_skill_choices:d.skillChoices});
      busy(b,false);if(error||data?.error)return showError(error||{message:data.error});
      state.draft=freshDraft();state.step=0;await openRoom(state.room.id);
    };
  }
  function renderGame(){
    const room=state.room,dm=room.role==='dm',me=state.characters.find(c=>c.user_id===state.user.id);
    if(state.tab==='character'&&!dm&&!me)return renderCreation();
    if(state.tab==='people'&&!dm)state.tab='overview';
    if(state.tab==='character'&&dm)state.tab='overview';
    app.innerHTML=`<section class="page-intro"><div><span class="eyebrow">${dm?'KURUCU MASASI':'YERLEŞİM'} · FARMS & FIELDS</span><h1>${safe(titles[state.tab]||'Genel Bakış')}</h1><p>${safe(room.name)} · ${dm?'Dünyanın anlatıcısı ve yöneticisi':'Yeni yerleşimin ilk yolcularından biri'}</p></div><span class="header-seal">${dm?'DM MASASI':'OYUNCU'}</span></section><div id="tabContent"></div>`;
    const main=el('#tabContent');
    if(state.tab==='overview'){
      const playerChars=state.characters.filter(c=>state.members.some(m=>m.user_id===c.user_id&&m.role==='player'));
      main.innerHTML=`<div class="grid-2"><section class="notebook"><span class="eyebrow">İLK GÜN · YENİ YERLEŞİM</span><h2>Henüz her şey mümkün.</h2><p>Toprak, mevsim ve alametler bu masada hayat bulacak. İlk halk toplandı; sırada köyün kuralları var.</p><span class="notebook-mark">✳</span></section><section class="panel"><span class="panel-kicker">DAVET KODU</span><h2>${safe(room.name)}</h2><p>${dm?'Odayı sen yönetiyorsun. Bu kodu katılacak oyuncularla paylaş.':'Arkadaşların bu kodla odaya katılabilir.'}</p><div class="code">${safe(room.code)}</div><button id="copyCode" class="button secondary">Kodu kopyala</button><div class="rule"></div><div class="stat-strip"><div class="stat"><b>${state.members.filter(m=>m.role==='player').length}</b><small>Oyuncu</small></div><div class="stat"><b>${playerChars.length}</b><small>Karakter</small></div><div class="stat"><b>01</b><small>Gün</small></div></div></section></div><section class="panel stacked"><span class="panel-kicker">YERLEŞİM HALKI</span><h2>İlk sakinler</h2><div class="roster">${playerChars.length?playerChars.map(c=>`<div class="roster-item"><div><strong>${safe(c.name)}</strong><small>${safe(getSpecies(c.species)?.name)} · ${safe(getClass(c.class_id)?.name)} / ${safe(getSpec(c.class_id,c.specialty)?.[1])}</small></div>${c.user_id===state.user.id?'<span class="badge">Sen</span>':''}</div>`).join(''):'<p class="muted">Oyuncular karakterlerini oluşturduğunda burada görünecek.</p>'}</div></section>`;
      el('#copyCode').onclick=async e=>{try{await navigator.clipboard.writeText(room.code);e.target.textContent='Kopyalandı ✓'}catch{e.target.textContent=room.code}};
    } else if(state.tab==='character'&&me){
      const sp=getSpecies(me.species),cl=getClass(me.class_id),spec=getSpec(me.class_id,me.specialty);
      main.innerHTML=`<div class="grid-2"><section class="panel"><span class="panel-kicker">KARAKTER FÖYÜ</span><div class="character-title"><h2>${safe(me.name)}</h2><span class="badge">Seviye 1 · Eğitim +2</span></div><p>${safe(sp?.name)} · ${safe(cl?.name)} / ${safe(spec?.[1])}</p><div class="ability-grid">${abilities.map(([id,label])=>`<div class="ability ability-read"><strong>${label}</strong><b>${scoreFor(me,id)}</b><small>${signed(abilityMod(scoreFor(me,id)))}</small></div>`).join('')}</div></section><section class="panel"><span class="panel-kicker">BECERİLER</span><h2>Yatkınlıklar</h2><p>Nitelik değişkeni + eğitim. İki sabit eğitim örtüşürse ustalık uygulanır.</p><div class="skill-list">${skills.map(([id,name,,ability])=>{const rank=skillRank(me,id);return `<div class="skill-row"><span><strong>${name}</strong><small>${abilities.find(a=>a[0]===ability)?.[1]} · ${rank===2?'Ustalık':rank===1?'Eğitim':'Temel'}</small></span><b>${signed(skillBonus(me,id,ability))}</b></div>`}).join('')}</div></section></div><section class="notebook stacked"><span class="eyebrow">YOLUN</span><h2>${safe(spec?.[1])}</h2><p>${safe(spec?.[2])}</p></section>`;
    } else if(state.tab==='people'){
      const players=state.members.filter(m=>m.role==='player');
      main.innerHTML=`<div class="grid-2"><section class="panel"><span class="panel-kicker">DM GÖRÜNÜMÜ</span><h2>Oyuncular</h2><p>Bu odada ${players.length} oyuncu var. DM karakter sahibi değildir; oyuncu karakterlerini buradan takip eder.</p><div class="roster">${players.length?players.map(m=>{const c=state.characters.find(x=>x.user_id===m.user_id);return `<div class="roster-item"><div><strong>${c?safe(c.name):'Karakter bekleniyor'}</strong><small>${c?`${safe(getSpecies(c.species)?.name)} · ${safe(getSpec(c.class_id,c.specialty)?.[1])}`:'Oyuncu henüz karakter oluşturmadı'}</small></div><span class="badge">OYUNCU</span></div>`}).join(''):'<div class="empty">Henüz oyuncu yok. Davet kodunu paylaş.</div>'}</div></section><section class="notebook"><span class="eyebrow">ANLATICI MASASI</span><h2>Dünya senin elinde.</h2><p>Bu alanda daha sonra günleri, olayları ve yerleşimi yöneteceksin. Şimdilik oda ve oyuncu takibi açık.</p></section></div>`;
    } else if(state.tab==='settlement'||state.tab==='farming'||state.tab==='exploration'){
      const info={settlement:['⌂','Yerleşimin temelleri','Binalar, halk ve köy düzeni için ayrılan alan.'],farming:['❀','Toprağın döngüsü','Tarlalar, tohumlar, hayvanlar ve kaynaklar burada yönetilecek.'],exploration:['✧','Bilinmeyen sınır','Yeni bölgeler, kayıp bilgiler ve alametler bu alanda açılacak.']}[state.tab];
      main.innerHTML=`<div class="feature-shell"><div class="feature-symbol">${info[0]}</div><span class="eyebrow">YAPIM AŞAMASINDA</span><h2>${info[1]}</h2><p>${info[2]}</p><div class="notice">Bu sistem henüz çalışmıyor. Tasarımını sonraki adımlarda birlikte kuracağız.</div></div>`;
    } else if(state.tab==='patchnotes')renderPatchNotes(main);
  }
  function patchGroup(title,items){return items.length?`<section class="change-group"><h4>${title} <small>${items.length}</small></h4><ul>${items.map(x=>`<li>${safe(x)}</li>`).join('')}</ul></section>`:''}
  function patchRows(){const fold=s=>String(s).toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');const query=fold(state.patchSearch.trim());return (window.FNF_RELEASES||[]).filter(n=>!query||fold([n.version,n.title,n.tag,n.summary,...n.added,...n.fixed,...n.changed].join(' ')).includes(query)).sort((a,b)=>state.patchOrder==='desc'?b.version.localeCompare(a.version,undefined,{numeric:true}):a.version.localeCompare(b.version,undefined,{numeric:true}))}
  function patchCards(){return patchRows().map((n,i)=>`<details class="release" ${i===0?'open':''}><summary><span class="release-version">v${safe(n.version)}</span><span class="release-heading"><b>${safe(n.title)}</b><small>${safe(n.date)} · ${safe(n.summary)}</small></span><span class="badge">${safe(n.tag)}</span><span class="release-plus">＋</span></summary><div class="release-body">${patchGroup('Yeni',n.added)}${patchGroup('Düzeltildi',n.fixed)}${patchGroup('Değiştirildi',n.changed)}</div></details>`).join('')||'<div class="empty">Bu aramada sürüm bulunamadı.</div>'}
  function renderPatchNotes(main){
    const notes=window.FNF_RELEASES||[],latest=notes[0];
    main.innerHTML=`<section class="patch-hero"><div><span class="eyebrow">GELİŞİM GÜNLÜĞÜ</span><h2>v${safe(latest?.version||'0.2.0')} · ${safe(latest?.title||'')}</h2><p>${safe(latest?.summary||'')}</p></div><div class="patch-count"><strong>${notes.length}</strong><small>SÜRÜM</small></div></section><div class="patch-tools"><label class="sr-only" for="patchSearch">Sürüm notlarında ara</label><input id="patchSearch" placeholder="Sürüm veya özellik ara…" value="${safe(state.patchSearch)}"><label class="sr-only" for="patchOrder">Sıralama</label><select id="patchOrder"><option value="desc" ${state.patchOrder==='desc'?'selected':''}>Yeni sürüm üstte</option><option value="asc" ${state.patchOrder==='asc'?'selected':''}>Eski sürüm üstte</option></select><button class="button secondary" data-patch-open="all">Tümünü aç</button><button class="button secondary" data-patch-open="none">Kapat</button><span id="patchCount">${patchRows().length}/${notes.length}</span></div><div id="patchList" class="release-list">${patchCards()}</div>`;
    el('#patchSearch').oninput=e=>{state.patchSearch=e.target.value;el('#patchList').innerHTML=patchCards();el('#patchCount').textContent=`${patchRows().length}/${notes.length}`};
    el('#patchOrder').onchange=e=>{state.patchOrder=e.target.value;el('#patchList').innerHTML=patchCards()};
    app.querySelectorAll('[data-patch-open]').forEach(b=>b.onclick=()=>app.querySelectorAll('.release').forEach(row=>row.open=b.dataset.patchOpen==='all'));
  }
  menuToggle.onclick=()=>{const open=document.body.classList.toggle('menu-open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Menüyü kapat':'Menüyü aç')};
  out.onclick=async()=>{await db?.auth.signOut();state.user=null;state.rooms=[];state.room=null;render()};
  async function init(){
    if(!db)return render();
    const {data:{session}}=await db.auth.getSession();state.user=session?.user||null;
    if(state.user){try{await refreshRooms()}catch(err){render();showError(err);return}}
    render();
    db.auth.onAuthStateChange((_event,session)=>{const changed=state.user?.id!==session?.user?.id;state.user=session?.user||null;if(changed){state.room=null;state.rooms=[];if(state.user)refreshRooms().then(render).catch(showError);else render()}});
  }
  init().catch(err=>{render();showError(err)});
})();
